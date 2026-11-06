"""Anonymous, browser-isolated deployment behind the fixed local public proxy.

The development database is never opened here. Only the API workflow is exposed;
operator handoff and private reference imports remain local development features.
"""
import argparse
from contextlib import closing
import hashlib
import hmac
import json
import re
import secrets
import sqlite3
import sys
import threading
import time
from http.cookies import SimpleCookie
from http.server import ThreadingHTTPServer
from pathlib import Path

from .app import Handler, Lab, PREFIX
from .provider import create_api_provider, read_private_config
from .store import LabError

COOKIE = "ark_lab_session"


class PublicLab(Lab):
    def health(self):
        result = super().health()
        result.update(publicDeployment=True, executionMode="api", message=None)
        result["executionModes"] = {"api": result["executionModes"]["api"]}
        result["capabilities"].update(baselineReference=False)
        return result

    def baselines(self):
        return {"baselines": []}

    def load_baseline(self, *_args):
        raise LabError("not_found", "接口不存在。", 404)

    def create_job(self, project_id, body, idempotency_key=None):
        with self.admissions.lock:
            return self._admitted_job(project_id, body, idempotency_key)

    def _admitted_job(self, project_id, body, idempotency_key=None):
        if body.get("executionMode", "api") != "api" or body.get("action", "generate") != "generate":
            raise LabError("public_api_only", "正式站仅支持 API 自动建模。", 403)
        # Match idempotent retries before charging an admission slot.
        key = idempotency_key or body.get("idempotencyKey")
        if key:
            with self.store.transaction() as db:
                row = db.execute("SELECT id FROM jobs WHERE project_id=? AND idem=?", (project_id, key)).fetchone()
            if row:
                return super().create_job(project_id, body, idempotency_key)
        self.admissions.reserve(self.visitor_id)
        try:
            return super().create_job(project_id, body, idempotency_key)
        except Exception:
            self.admissions.release(self.visitor_id)
            raise

    def create_project(self, body):
        with self.store.transaction() as db:
            if db.execute("SELECT COUNT(*) FROM projects").fetchone()[0] >= 100:
                raise LabError("project_limit", "当前浏览器的项目数量已达上限。", 429)
        return super().create_project(body)

    def upload(self, body):
        with self.store.transaction() as db:
            if db.execute("SELECT COUNT(*) FROM assets").fetchone()[0] >= 100:
                raise LabError("asset_limit", "当前浏览器的图片数量已达上限。", 429)
        return super().upload(body)

    def run_job(self, job_id):
        # Shared across visitors, preserving the original single execution slot.
        with self.admissions.execution_lock:
            return super().run_job(job_id)


class Admissions:
    def __init__(self, root, daily_total=20, daily_visitor=5):
        self.path = root / "admissions.sqlite3"
        self.lock = threading.RLock()
        self.execution_lock = threading.Lock()
        self.daily_total, self.daily_visitor = daily_total, daily_visitor
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("CREATE TABLE IF NOT EXISTS admissions(day TEXT,visitor TEXT,n INTEGER,PRIMARY KEY(day,visitor))")

    def _change(self, visitor, amount):
        day = time.strftime("%Y-%m-%d", time.gmtime(time.time() + 8 * 3600))
        with self.lock, closing(sqlite3.connect(self.path)) as db, db:
            count = db.execute("SELECT n FROM admissions WHERE day=? AND visitor=?", (day, visitor)).fetchone()
            total = db.execute("SELECT COALESCE(SUM(n),0) FROM admissions WHERE day=?", (day,)).fetchone()[0]
            if amount > 0 and (total >= self.daily_total or (count and count[0] >= self.daily_visitor)):
                raise LabError("daily_generation_limit", "今日建模额度已用完，请明日再试。", 429)
            if amount > 0:
                db.execute("INSERT INTO admissions VALUES(?,?,?) ON CONFLICT(day,visitor) DO UPDATE SET n=n+excluded.n", (day, visitor, amount))
            else:
                db.execute("UPDATE admissions SET n=MAX(0,n-1) WHERE day=? AND visitor=?", (day, visitor))

    def reserve(self, visitor): self._change(visitor, 1)
    def release(self, visitor): self._change(visitor, -1)


class VisitorLabs:
    def __init__(self, root, secret, *, provider_factory=None, start_worker=True):
        self.root = Path(root).resolve()
        self.data = self.root / ".local-ai-lab-public"
        self.data.mkdir(parents=True, exist_ok=True)
        self.secret = secret.encode()
        self.provider_factory = provider_factory or (lambda: create_api_provider(read_private_config(self.root)))
        self.start_worker = start_worker
        self.lock = threading.RLock()
        self.labs = {}
        self.admissions = Admissions(self.data)

    def signature(self, visitor):
        return hmac.new(self.secret, visitor.encode(), hashlib.sha256).hexdigest()

    def identify(self, header):
        cookie = SimpleCookie()
        try: cookie.load(header or "")
        except Exception: pass
        value = cookie[COOKIE].value if COOKIE in cookie else ""
        match = re.fullmatch(r"([a-f0-9]{48})\.([a-f0-9]{64})", value)
        if match and hmac.compare_digest(self.signature(match[1]), match[2]):
            return match[1], None
        visitor = secrets.token_hex(24)
        return visitor, visitor + "." + self.signature(visitor)

    def get(self, visitor):
        with self.lock:
            if visitor not in self.labs:
                if len(self.labs) >= 32:
                    # Never evict a job that is queued/running or awaiting images.
                    for key, item in list(self.labs.items()):
                        lab, touched = item
                        with lab.store.transaction() as db:
                            records = db.execute("SELECT record FROM jobs").fetchall()
                        active = any(json.loads(row[0]).get("status") in ("queued", "running", "awaiting_review_images") for row in records)
                        if not active and time.monotonic() - touched > 900:
                            lab.close()
                            del self.labs[key]
                            break
                    if len(self.labs) >= 32:
                        raise LabError("server_busy", "建模服务繁忙，请稍后重试。", 503)
                folder = self.data / "visitors" / visitor
                if folder.is_symlink() or folder.resolve() != folder:
                    raise LabError("invalid_session", "会话目录无效。", 403)
                lab = PublicLab.__new__(PublicLab)
                lab.admissions, lab.visitor_id = self.admissions, visitor
                PublicLab.__init__(lab, self.root, data_dir=folder, provider=self.provider_factory(), start_worker=self.start_worker)
                self.labs[visitor] = (lab, time.monotonic())
            lab, _ = self.labs[visitor]
            self.labs[visitor] = (lab, time.monotonic())
            return lab

    def close(self):
        for lab, _ in self.labs.values(): lab.close()


class PublicHandler(Handler):
    def _check_request(self):
        if not hmac.compare_digest(self.headers.get("X-Ark-Lab-Proxy", ""), self.server.visitors.secret.decode()):
            raise LabError("proxy_required", "接口不可直接访问。", 403)
        path = super()._check_request()
        if "/handoff/" in path or path.endswith("/baseline"):
            raise LabError("not_found", "接口不存在。", 404)
        return path

    def _request_lab(self):
        visitor, cookie = self.server.visitors.identify(self.headers.get("Cookie"))
        self.session_cookie = cookie
        return self.server.visitors.get(visitor)

    def _send(self, status, value, mime="application/json; charset=utf-8", extra=None):
        headers = dict(extra or {})
        cookie = getattr(self, "session_cookie", None)
        if cookie:
            secure = "; Secure" if self.headers.get("X-Ark-Lab-Secure") == "1" else ""
            headers["Set-Cookie"] = f"{COOKIE}={cookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000{secure}"
        return super()._send(status, value, mime, headers)


def main():
    parser = argparse.ArgumentParser(description="Isolated public AI laboratory backend")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--port", type=int, default=8787)
    args = parser.parse_args()
    root = args.root.resolve()
    sys.path.insert(0, str(root / "ai-lab"))
    secret = (root / ".local-ai-lab-public" / "proxy-token").read_text().strip()
    if len(secret) < 48: raise SystemExit("Missing public proxy secret")
    provider = create_api_provider(read_private_config(root))
    if not provider.configured or not provider.supports_images or provider.model != "gpt-6.1-sol":
        raise SystemExit("Verified GPT-6.1 Sol API configuration is required")
    visitors = VisitorLabs(root, secret)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), PublicHandler)
    server.daemon_threads = True
    server.visitors = visitors
    server.allowed_origins = {f"http://127.0.0.1:{args.port}"}
    print(f"Public AI Lab backend ready on 127.0.0.1:{args.port}", flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally:
        server.server_close()
        visitors.close()


if __name__ == "__main__": main()

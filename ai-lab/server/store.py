import contextlib
import json
import sqlite3
import threading
import time
import uuid
from pathlib import Path


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def uid():
    return uuid.uuid4().hex


def dump(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"))


class LabError(Exception):
    def __init__(self, code, message, status=400, details=None):
        self.code, self.message, self.status, self.details = code, message, status, details
        super().__init__(message)


class Store:
    def __init__(self, data_dir):
        self.root = Path(data_dir).resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        (self.root / "assets").mkdir(exist_ok=True)
        (self.root / "baselines").mkdir(exist_ok=True)
        self.db_path = self.root / "lab.sqlite3"
        self.lock = threading.RLock()
        with self.transaction() as db:
            db.executescript("""
            PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,title TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 0,updated TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS assets(id TEXT PRIMARY KEY,name TEXT,mime TEXT,width INTEGER,height INTEGER,filename TEXT NOT NULL,sha256 TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS versions(project_id TEXT,version INTEGER,scene TEXT,state TEXT,validation TEXT,source_asset TEXT,source_type TEXT,created TEXT,PRIMARY KEY(project_id,version));
            CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,project_id TEXT NOT NULL,payload TEXT NOT NULL,record TEXT NOT NULL,idem TEXT,request_hash TEXT,created TEXT,UNIQUE(project_id,idem));
            """)
            # A vendor call cannot safely be replayed following a process restart.
            for row in db.execute("SELECT id,record FROM jobs"):
                record = json.loads(row["record"])
                if record["status"] == "running":
                    record.update(status="failed", stage="interrupted", error={"code": "server_restarted", "message": "服务重启中断任务；未自动重试付费请求。"})
                    db.execute("UPDATE jobs SET record=? WHERE id=?", (dump(record), row["id"]))

    @contextlib.contextmanager
    def transaction(self):
        with self.lock:
            db = sqlite3.connect(self.db_path, timeout=10)
            db.row_factory = sqlite3.Row
            try:
                db.execute("BEGIN IMMEDIATE")
                yield db
                db.commit()
            except Exception:
                db.rollback()
                raise
            finally:
                db.close()

    def project(self, project_id, db=None):
        if db is None:
            with self.transaction() as connection:
                return self.project(project_id, connection)
        row = db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        if not row:
            raise LabError("project_not_found", "项目不存在。", 404)
        return dict(row)

    def job(self, job_id, db=None):
        if db is None:
            with self.transaction() as connection:
                return self.job(job_id, connection)
        row = db.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
        if not row:
            raise LabError("job_not_found", "任务不存在。", 404)
        result = dict(row)
        result["payload"] = json.loads(result["payload"])
        result["record"] = json.loads(result["record"])
        return result

    def update_job(self, job_id, **fields):
        with self.transaction() as db:
            record = self.job(job_id, db)["record"]
            if record["status"] == "cancelled":
                fields = {k: v for k, v in fields.items() if k in ("usage", "timings")}
            record.update(fields)
            if "stage" in fields:
                record.setdefault("events", []).append({"at": now(), "stage": fields["stage"], "message": fields.get("message", "")})
            db.execute("UPDATE jobs SET record=? WHERE id=?", (dump(record), job_id))
            return record

    def asset(self, asset_id, db=None):
        if db is None:
            with self.transaction() as connection:
                return self.asset(asset_id, connection)
        row = db.execute("SELECT * FROM assets WHERE id=?", (asset_id,)).fetchone()
        if not row:
            raise LabError("asset_not_found", "原图不存在。", 404)
        return dict(row)

    def scene(self, project_id, db=None):
        if db is None:
            with self.transaction() as connection:
                return self.scene(project_id, connection)
        project = self.project(project_id, db)
        row = db.execute("SELECT * FROM versions WHERE project_id=? AND version=?", (project_id, project["version"])).fetchone()
        if not row:
            raise LabError("scene_not_found", "项目尚未保存场景。", 404)
        return {"scene": json.loads(row["scene"]), "state": json.loads(row["state"]), "version": row["version"], "validation": json.loads(row["validation"]), "sourceAsset": json.loads(row["source_asset"]) if row["source_asset"] else None, "source": row["source_type"]}

    def commit_scene(self, project_id, base_version, scene, state, validation, source_asset=None, source_type="generated", job_id=None):
        with self.transaction() as db:
            project = self.project(project_id, db)
            if job_id and self.job(job_id, db)["record"]["status"] == "cancelled":
                return None
            if project["version"] != base_version:
                raise LabError("version_conflict", "场景已更新，请重新加载后重试。", 409, {"currentVersion": project["version"]})
            version = base_version + 1
            db.execute("INSERT INTO versions VALUES(?,?,?,?,?,?,?,?)", (project_id, version, dump(scene), dump(state), dump(validation), dump(source_asset) if source_asset else None, source_type, now()))
            db.execute("UPDATE projects SET version=?,updated=? WHERE id=?", (version, now(), project_id))
            if job_id:
                record = self.job(job_id, db)["record"]
                record.update(status="succeeded", stage="saved", progress=100, message="场景已保存。", sceneVersion=version, validation=validation)
                record.setdefault("events", []).append({"at": now(), "stage": "saved", "message": "场景已保存。"})
                db.execute("UPDATE jobs SET record=? WHERE id=?", (dump(record), job_id))
            return version

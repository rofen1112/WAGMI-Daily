"""Loopback-only JSON handoff helper. No model invocation or shell execution."""
import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, file_pointer, code, message, headers, new_url):
        return None


def main():
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Current Codex chat to local AI Lab data bridge")
    parser.add_argument("--base-url", default="http://127.0.0.1:8786")
    parser.add_argument("--job", required=True)
    parser.add_argument("operation", choices=("request", "events", "analysis", "candidate", "review", "finalize", "input"))
    parser.add_argument("--file", type=Path, help="Explicit local JSON payload; never code")
    parser.add_argument("--after", type=int, default=0)
    args = parser.parse_args()
    base = urllib.parse.urlsplit(args.base_url)
    if base.scheme != "http" or base.hostname not in ("127.0.0.1", "localhost", "::1") or base.username or base.password or base.path not in ("", "/") or base.query or base.fragment or not re.fullmatch(r"[a-f0-9]{32}", args.job):
        parser.error("Only an HTTP loopback base URL and a 32-hex job ID are accepted.")
    prefix = args.base_url.rstrip("/") + "/api/ai-lab/v1/jobs/" + args.job
    if args.operation == "events":
        url, raw = prefix + "/events?after=" + str(args.after), None
    elif args.operation == "request":
        url, raw = prefix + "/handoff/request", None
    else:
        if args.file is None:
            parser.error("Mutation requires --file with explicit requestId, revision and submissionId.")
        try:
            value = json.loads(args.file.read_text(encoding="utf-8-sig"), parse_constant=lambda _: (_ for _ in ()).throw(ValueError()))
            if not isinstance(value, dict):
                raise ValueError()
            raw = json.dumps(value, ensure_ascii=False, allow_nan=False).encode()
        except (OSError, ValueError):
            parser.error("Payload must be a readable strict JSON object.")
        url = prefix + ("/input" if args.operation == "input" else "/handoff/" + args.operation)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    request = urllib.request.Request(url, data=raw, headers={"Content-Type": "application/json"} if raw is not None else {})
    try:
        with opener.open(request, timeout=30) as response:
            result = json.loads(response.read())
    except urllib.error.HTTPError as exc:
        try:
            result = json.loads(exc.read())
        except (ValueError, OSError):
            result = {"error": {"code": "handoff_http_error", "message": "Local bridge returned HTTP " + str(exc.code)}}
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 1
    except (urllib.error.URLError, ValueError):
        print(json.dumps({"error": {"code": "handoff_unavailable", "message": "Local handoff service is unavailable."}}))
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())

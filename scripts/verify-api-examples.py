# /// script
# requires-python = ">=3.11"
# dependencies = ["jsonschema>=4.23,<5"]
# ///
"""Verify documentation against a disposable, authenticated mock API.

uv run scripts/verify-api-examples.py [../apelora-fabric] [--record]
Needs the product's current debug binary, Docker and apelora-dev-db. Never uses
the shared application database, an existing API or any Incus credentials.
"""
import hashlib
import io
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone

from jsonschema import Draft202012Validator, FormatChecker, ValidationError

ROOT = Path(__file__).resolve().parents[1]
REPO = Path(next((a for a in sys.argv[1:] if not a.startswith("--")), ROOT.parent / "apelora-fabric")).resolve()
SPEC_TEXT = (REPO / "packages/api-client/openapi.json").read_text()
SPEC = json.loads(SPEC_TEXT)
BINARY = REPO / "target/debug/apelora-control-plane"
METHODS = {"get", "post", "put", "patch", "delete"}
OPS = {op["operationId"]: (method, path, op) for path, item in SPEC["paths"].items() for method, op in item.items() if method in METHODS}
RESPONSES = []
CHECKS = []


def run(*args, **kwargs):
    return subprocess.run(args, check=True, capture_output=True, text=True, **kwargs).stdout


def validate(value, schema):
    # Resolve OpenAPI's local schema references against its components using JSON Schema 2020-12.
    Draft202012Validator({**schema, "components": SPEC["components"]}, format_checker=FormatChecker()).validate(value)


def validate_response(op, status, media_type, raw):
    response = op["responses"].get(str(status))
    assert response is not None, f"Undocumented response status {status}"
    content = response.get("content", {})
    if not content:
        assert not raw, f"Response {status} must not have a body"
        return None
    assert media_type in content, f"Undocumented Content-Type {media_type} for response {status}"
    parsed = json.loads(raw) if media_type == "application/json" else None
    value = parsed if media_type == "application/json" else raw.decode() if media_type.startswith("text/") or media_type == "application/x-ndjson" else "binary"
    validate(value, content[media_type]["schema"])
    return parsed


def check_examples():
    """Check every generated JSON request and success example, not just captured outputs."""
    count = 0
    for file in (ROOT / "content/docs/api").glob("*.md"):
        if file.stem == "overview":
            continue
        for section in re.split(r"^### `", file.read_text(), flags=re.M)[1:]:
            heading = section.split("`", 1)[0]
            method, path = heading.split(" ", 1)
            op = SPEC["paths"][path][method.lower()]
            request, *responses = re.split(r"\*\*Response `", section)
            blocks = re.findall(r"```json\n(.*?)\n```", request, flags=re.S)
            if blocks:
                validate(json.loads(blocks[0]), op["requestBody"]["content"]["application/json"]["schema"])
                count += 1
            for response in responses:
                code = response.split("`", 1)[0]
                blocks = re.findall(r"```json\n(.*?)\n```", response, flags=re.S)
                if blocks:
                    validate(json.loads(blocks[0]), op["responses"][code]["content"]["application/json"]["schema"])
                    count += 1
    return count


def check_curl_examples(env, url, token):
    """Execute the exact documented read commands in a private download directory."""
    count = 0
    successful = {r["operationId"] for r in RESPONSES if r["method"] == "GET"}
    with tempfile.TemporaryDirectory(prefix="apelora-docs-curl-") as downloads:
        for file in (ROOT / "content/docs/api").glob("*.md"):
            for section in re.split(r"^### `", file.read_text(), flags=re.M)[1:]:
                operation_id = re.search(r"\*\*Operation ID:\*\* `([^`]+)`", section)
                if not operation_id or operation_id[1] not in successful:
                    continue
                request_section = section.split("**Response `", 1)[0]
                for command in re.findall(r"```sh\n(.*?)\n```", request_section, flags=re.S):
                    # Never execute illustrative writes or commands pointed at a supplied host.
                    assert re.search(r'curl --fail-with-body -sS -X GET "\$APELORA_URL/', command)
                    output = run("bash", "-c", command, cwd=downloads, env={**env, "APELORA_URL": url, "APELORA_TOKEN": token})
                    media = re.search(r'Accept: ([^"\n]+)', command)
                    if media and media[1] == "application/json":
                        op = OPS[operation_id[1]][2]
                        validate(json.loads(output), op["responses"]["200"]["content"]["application/json"]["schema"])
                    count += 1
    return count


def main():
    assert run(str(BINARY), "openapi", cwd=REPO) == SPEC_TEXT, "Rebuild the API binary: its OpenAPI differs from the checkout"
    database = "apelora_docs_" + uuid.uuid4().hex
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    url = f"http://127.0.0.1:{port}"
    # Intentionally construct a fresh environment; do not inherit a real Incus URL or identity.
    env = {"PATH": os.environ["PATH"], "DATABASE_URL": f"postgres://apelora:apelora-dev-only@127.0.0.1:15432/{database}", "APELORA_API_ADDR": f"127.0.0.1:{port}", "RUST_LOG": "warn"}
    server = None
    run("docker", "exec", "apelora-dev-db", "psql", "-U", "apelora", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c", f"CREATE DATABASE {database}")
    try:
        # Capture CLI output in memory only: the one-time bearer secret never enters a file or log.
        token_output = run(str(BINARY), "token", "create", "--name", "docs-verifier", "--role", "fabric-admin", "--expires-in-days", "1", env=env, cwd=REPO)
        token = token_output.strip().splitlines()[-1]
        assert token.startswith("apl_"), "Token CLI returned an unexpected credential format"
        with tempfile.TemporaryFile() as log:
            server = subprocess.Popen([str(BINARY)], cwd=REPO, env=env, stdout=log, stderr=log)

            def request(operation_id, *, params=None, body=None, media=None, auth=True, expect=None, record=True):
                method, path, op = OPS[operation_id]
                for key, value in (params or {}).items():
                    path = path.replace("{" + key + "}", str(value))
                assert "{" not in path, f"Unbound path: {path}"
                if operation_id == "audit_export":
                    path += "?format=" + ("csv" if media == "text/csv" else "jsonl")
                headers = {"Accept": media or "application/json"}
                if auth:
                    headers["Authorization"] = "Bearer " + token
                if body is not None:
                    headers["Content-Type"] = "application/json"
                    validate(body, op["requestBody"]["content"]["application/json"]["schema"])
                req = urllib.request.Request(url + path, data=json.dumps(body).encode() if body is not None else None, headers=headers, method=method.upper())
                try:
                    res = urllib.request.urlopen(req, timeout=30)
                except urllib.error.HTTPError as error:
                    res = error
                with res:
                    raw = res.read()
                    status = res.status
                    content_type = res.headers.get_content_type()
                if expect is not None:
                    assert status == expect, f"{operation_id}: expected {expect}, got {status}"
                parsed = validate_response(op, status, content_type, raw)
                if status >= 400:
                    assert isinstance(parsed, dict) and parsed.get("error", {}).get("code"), f"{operation_id}: invalid error envelope"
                CHECKS.append({"operationId": operation_id, "status": status, "mediaType": content_type, "errorCode": parsed["error"]["code"] if status >= 400 else None})
                if record and status < 300:
                    capture = {"operationId": operation_id, "method": method.upper(), "path": path, "status": status, "mediaType": content_type}
                    if body is not None:
                        capture["requestBody"] = body
                    if content_type == "application/json":
                        capture["body"] = parsed
                    elif content_type == "application/x-tar":
                        with tarfile.open(fileobj=io.BytesIO(raw)) as archive:
                            capture["listing"] = "\n".join(archive.getnames())
                            assert any(name.endswith("/manifest.json") or name == "manifest.json" for name in archive.getnames()), "Support archive has no manifest"
                    else:
                        capture["body"] = raw.decode()
                    serialized = json.dumps(capture)
                    assert token not in serialized and not re.search(r"(?:apt|aps|apu|apl)_[a-f0-9]{64}", serialized), "Secret found in example output"
                    RESPONSES.append(capture)
                return parsed

            # Health is public, with no credentials. Readiness polling is bounded.
            deadline = time.monotonic() + 30
            while True:
                if server.poll() is not None:
                    raise RuntimeError("Disposable control plane exited before becoming ready")
                try:
                    request("health", auth=False, expect=200)
                    break
                except urllib.error.URLError:
                    if time.monotonic() >= deadline:
                        raise TimeoutError("Disposable API did not start")
                    time.sleep(0.1)
            assert RESPONSES[-1]["body"]["provider"] == "mock"
            remote = urllib.request.urlopen(url + "/api/v1/openapi.json", timeout=10).read().decode()
            assert remote == SPEC_TEXT, "Served OpenAPI differs from the documentation source"
            request("sign_in_options", auth=False, expect=200)
            request("whoami", auth=False, expect=401, record=False)
            # A complete, reversible application metadata workflow in this database only.
            org = request("create_organization", body={"slug": "docs-org", "name": "Documentation example"}, expect=201)
            project = request("create_project", params={"org": org["id"]}, body={"slug": "docs-project", "name": "Documentation project"}, expect=201)
            environment = request("create_environment", params={"project": project["id"]}, body={"slug": "development", "name": "Development", "kind": "development"}, expect=201)
            request("create_application", body={"name": "shop", "environmentId": environment["id"], "description": "API documentation example"}, expect=201)
            request("application", params={"name": "shop"}, expect=200)
            request("update_application", params={"name": "shop"}, body={"description": "Updated through the API"}, expect=200)
            # All collection reads without required parameters; no real-cluster writes.
            for operation_id, (method, path, op) in OPS.items():
                if method != "get" or "{" in path or operation_id in {"health", "sign_in_options"}:
                    continue
                if any(p.get("required") for p in op.get("parameters", [])):
                    continue
                if operation_id == "audit_export":
                    request(operation_id, media="text/csv", expect=200)
                    request(operation_id, media="application/x-ndjson", expect=200)
                else:
                    personal = operation_id in {"my_sign_ins", "my_tokens"}
                    value = request(operation_id, expect=403 if personal else 200)
                    if personal:
                        assert value["error"]["code"] == "people_only"
            request("archive_application", params={"name": "shop"}, expect=204)
            report = {"evidence": "MOCK VERIFIED", "verifiedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"), "productCommit": run("git", "rev-parse", "HEAD", cwd=REPO).strip(), "openapiSha256": hashlib.sha256(SPEC_TEXT.encode()).hexdigest(), "environment": "Disposable PostgreSQL database, authenticated loopback control plane, mock Incus inventory; no deployment worker or real Incus calls", "checks": CHECKS, "responses": RESPONSES}
            if "--record" in sys.argv:
                (ROOT / "content/api-examples.json").write_text(json.dumps(report, indent=2) + "\n")
                run("node", "scripts/import-api.mjs", str(REPO), cwd=ROOT)
            count = check_examples()
            curl_count = check_curl_examples(env, url, token)
            print(f"MOCK VERIFIED: {len(CHECKS)} HTTP checks; {len(RESPONSES)} captured successes; {count} documented JSON examples schema-validated; {curl_count} exact documented curl commands executed.")
            unavailable = [c for c in CHECKS if c["status"] >= 400 and c["status"] != 401]
            print("Person-only operations refused this CLI token as expected: " + json.dumps(unavailable))
    finally:
        if server:
            server.terminate()
            server.wait(timeout=15)
        run("docker", "exec", "apelora-dev-db", "psql", "-U", "apelora", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c", f"DROP DATABASE {database} WITH (FORCE)")


if __name__ == "__main__":
    main()

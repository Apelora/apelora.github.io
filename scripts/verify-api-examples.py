# /// script
# requires-python = ">=3.11"
# dependencies = ["jsonschema>=4.23,<5"]
# ///
"""Verify documentation against a disposable, authenticated mock API, and record example output.

uv run scripts/verify-api-examples.py [../apelora-fabric] [--record] [--explore]

Needs the product's current debug binaries (control plane and deployment worker), Docker and
apelora-dev-db. Never uses the shared application database, an existing API or any Incus
credentials: the control plane and the worker run against the mock provider, each with its own
in-memory fixture cluster, in a database created for this run and dropped afterwards. Nothing is
sent outside this machine (the worker's outbox relay is off, so alert channels are never called).

--explore keeps going after an unexpected status and lists every mismatch at the end.
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
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

from jsonschema import Draft202012Validator, FormatChecker, ValidationError

ROOT = Path(__file__).resolve().parents[1]
REPO = Path(next((a for a in sys.argv[1:] if not a.startswith("--")), ROOT.parent / "apelora-fabric")).resolve()
SPEC_TEXT = (REPO / "packages/api-client/openapi.json").read_text()
SPEC = json.loads(SPEC_TEXT)
BINARY = REPO / "target/debug/apelora-control-plane"
WORKER = REPO / "target/debug/apelora-deployment-worker"
METHODS = {"get", "post", "put", "patch", "delete"}
OPS = {op["operationId"]: (method, path, op) for path, item in SPEC["paths"].items() for method, op in item.items() if method in METHODS}
EXPLORE = "--explore" in sys.argv
TEXT_LINES = 60
RESPONSES = []
# Requests that were refused here (no real cluster, MAAS, …): their path and body still show readers
# a realistic request for operations without a recorded response.
REQUESTS = []
CHECKS = []
ERRORS = []
MISMATCHES = []
# Every credential the run sees. None of them may appear in what is written to the site.
SECRETS = set()
SECRET_PATTERN = re.compile(r"\bap[a-z]_[A-Za-z0-9]{20,}")
# Fields that carry a credential, with the placeholder the pages show instead.
PLACEHOLDERS = {
    "token": "<token, shown once>",
    "setupToken": "<setup token, shown once>",
    "ticket": "<one-time session ticket>",
    "password": "<password>",
    "current": "<current password>",
    "new": "<new password>",
    # The product's own test record (evidence label and date): not reader material.
    "incusTestedWith": "<how this release was tested with Incus>",
}
# Values that only say where this run happened (temporary directories), with what the pages show.
LOCAL = {}
# Why an operation keeps placeholder output: for the maintainers (README), never on reader pages.
# The control plane and the worker each run their own in-memory mock cluster, so what the worker
# creates (instances, volumes) is not visible to the control plane.
SEPARATE = "the control plane must see what the worker created; with the mock provider each process has its own fixture cluster"
UNAVAILABLE = {
    "operate_application": SEPARATE + " (409 nothing_deployed)",
    "application_operation": "needs an operation, which needs operate_application",
    "open_session": SEPARATE + " (needs a running module)",
    "terminate_session": "needs an open session",
    "take_volume_snapshot": SEPARATE + " (409 volume_missing)",
    "delete_volume_snapshot": "needs a snapshot",
    "restore_volume_snapshot": "needs a snapshot",
    "grow_application_volume": SEPARATE + " (502 incus_not_found)",
    "restore_volume_backup": SEPARATE + " (409 restore_blocked)",
    "move_instance": "needs an instance Apelora created that the control plane sees; the fixture's are not Apelora's (409 move_blocked)",
    "remove_member": "needs a member without instances; the fixture's members keep theirs after evacuation (409 removal_blocked)",
    "cluster_upgrade": "needs members that report their Incus release, a real cluster (409 upgrade_blocked)",
    "confirm_fenced": "needs a failed member and fencing evidence, a real cluster (409 member_not_offline)",
    "check_identity_provider": "needs a reachable OpenID Connect provider",
    "maas_commission": "needs a MAAS server (503 provisioner_not_configured)",
    "maas_deploy": "needs a MAAS server (503 provisioner_not_configured)",
    "maas_release": "needs a MAAS server (503 provisioner_not_configured)",
    "maas_test": "needs a MAAS server (503 provisioner_not_configured)",
}


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


def remember_secrets(value):
    """Collect credentials from a response so that a later scrub can never miss one."""
    if isinstance(value, dict):
        for key, item in value.items():
            if key in PLACEHOLDERS and key != "incusTestedWith" and isinstance(item, str) and item:
                SECRETS.add(item)
            remember_secrets(item)
    elif isinstance(value, list):
        for item in value:
            remember_secrets(item)
    elif isinstance(value, str):
        SECRETS.update(SECRET_PATTERN.findall(value))


def scrub(value, key=None, by_name=True):
    """Replace credentials by obvious placeholders, by field name and wherever a known one appears.
    A request body written for the page (`shown`) keeps its own placeholders: by_name=False."""
    if isinstance(value, dict):
        return {k: scrub(v, k, by_name) for k, v in value.items()}
    if isinstance(value, list):
        return [scrub(v, None, by_name) for v in value]
    if isinstance(value, str):
        if by_name and key in PLACEHOLDERS and value:
            return PLACEHOLDERS[key]
        for secret in sorted(SECRETS, key=len, reverse=True):
            value = value.replace(secret, "<token>")
        for local, shown in LOCAL.items():
            value = value.replace(local, shown)
        return SECRET_PATTERN.sub("<token>", value)
    return value


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
                blocks = re.findall(r"```json\n(.*?)\n```", response.split("**Errors", 1)[0], flags=re.S)
                if blocks:
                    validate(json.loads(blocks[0]), op["responses"][code]["content"]["application/json"]["schema"])
                    count += 1
    return count


def check_typescript():
    """Type-check every documented TypeScript call against the product's generated client."""
    tsc = REPO / "node_modules/.bin/tsc"
    if not tsc.exists():
        print("TypeScript calls not type-checked: run npm install in the product checkout first.")
        return 0
    calls = []
    for file in sorted((ROOT / "content/docs/api").glob("*.md")):
        calls += re.findall(r"```ts\n((?:const result = )?await client\.request\([\s\S]*?\);)\n```", file.read_text())
    source = 'import { createClient, newIdempotencyKey } from "../packages/api-client/src/index";\n'
    source += 'const client = createClient({ baseUrl: "", token: () => null });\ndeclare const body: any;\n'
    source += "".join(f"export async function call{i}() {{ {call} }}\n" for i, call in enumerate(calls))
    # The file must sit inside the product checkout to resolve the client; it is removed afterwards.
    with tempfile.TemporaryDirectory(prefix=".docs-ts-", dir=REPO) as folder:
        (Path(folder) / "calls.ts").write_text(source)
        run(str(tsc), "--noEmit", "--strict", "--target", "es2022", "--module", "esnext", "--moduleResolution", "bundler", "--skipLibCheck", str(Path(folder) / "calls.ts"), cwd=REPO)
    return len(calls)


def check_curl_examples(env, url, tokens):
    """Execute the exact documented read commands (with and without options) in a private directory,
    with the kind of credential each was recorded with."""
    count = 0
    successful = {r["operationId"]: r.get("caller", "admin") for r in RESPONSES if r["method"] == "GET"}
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
                    token = tokens["ada" if successful[operation_id[1]] == "person" else "admin"]
                    output = run("bash", "-c", command, cwd=downloads, env={**env, "APELORA_URL": url, "APELORA_TOKEN": token})
                    media = re.search(r'Accept: ([^"\n]+)', command)
                    if media and media[1] == "application/json":
                        op = OPS[operation_id[1]][2]
                        validate(json.loads(output), op["responses"]["200"]["content"]["application/json"]["schema"])
                    count += 1
    return count


class Api:
    def __init__(self, url):
        self.url = url
        self.tokens = {}

    def call(self, operation_id, *, params=None, query=None, body=None, media=None, token="admin", headers=None,
             expect=None, record=True, variant=None, shown=None, error_example=False, quiet=False):
        """One request. Records the first success per operation and variant ("options" for the
        example with query parameters), with credentials replaced. `shown` is the request body
        the page shows when the one sent carries something that must not be published."""
        method, path, op = OPS[operation_id]
        for key, value in (params or {}).items():
            path = path.replace("{" + key + "}", urllib.parse.quote(str(value), safe=""))
        assert "{" not in path, f"Unbound path: {path}"
        query = dict(query or {})
        if operation_id == "audit_export" and "format" not in query:
            query["format"] = "csv" if media == "text/csv" else "jsonl"
        if query:
            path += "?" + urllib.parse.urlencode({k: str(v).lower() if isinstance(v, bool) else v for k, v in query.items()})
        sent = {"Accept": media or "application/json", **(headers or {})}
        if token:
            sent["Authorization"] = "Bearer " + self.tokens[token]
        if body is not None:
            sent["Content-Type"] = "application/json"
            validate(body, op["requestBody"]["content"]["application/json"]["schema"])
        req = urllib.request.Request(self.url + path, data=json.dumps(body).encode() if body is not None else None, headers=sent, method=method.upper())
        try:
            res = urllib.request.urlopen(req, timeout=30)
        except urllib.error.HTTPError as error:
            res = error
        with res:
            raw = res.read()
            status = res.status
            content_type = res.headers.get_content_type()
        parsed = validate_response(op, status, content_type, raw)
        remember_secrets(parsed)
        if status >= 400:
            assert isinstance(parsed, dict) and parsed.get("error", {}).get("code"), f"{operation_id}: invalid error envelope"
        expected = expect if isinstance(expect, (tuple, list, set)) else (expect,) if expect is not None else None
        if expected is not None and status not in expected:
            detail = parsed["error"] if status >= 400 and isinstance(parsed, dict) else (raw[:300].decode(errors="replace"))
            message = f"{operation_id} {method.upper()} {path}: expected {expect}, got {status} {detail}"
            if not EXPLORE:
                raise AssertionError(message)
            MISMATCHES.append(message)
        if not quiet:
            CHECKS.append({"operationId": operation_id, "status": status, "mediaType": content_type, "errorCode": parsed["error"]["code"] if status >= 400 else None})
        if record and status >= 400 and not any(r["operationId"] == operation_id for r in REQUESTS):
            refused = {"operationId": operation_id, "method": method.upper(), "path": scrub(path), "status": status, "errorCode": parsed["error"]["code"]}
            if body is not None:
                refused["requestBody"] = scrub(shown, by_name=False) if shown is not None else scrub(body)
            REQUESTS.append(refused)
        if error_example and status >= 400:
            ERRORS.append({"operationId": operation_id, "method": method.upper(), "path": path, "status": status, "body": scrub(parsed)})
        if record and status < 300 and not any(r["operationId"] == operation_id and r.get("variant") == variant and r["mediaType"] == content_type for r in RESPONSES):
            capture = {"operationId": operation_id, "method": method.upper(), "path": scrub(path), "status": status, "mediaType": content_type}
            if variant:
                capture["variant"] = variant
            if token and token != "admin":
                capture["caller"] = "person"
            if query:
                capture["query"] = scrub(query)
            if headers:
                capture["headers"] = sorted(h for h in headers if h.lower() != "idempotency-key")
            if body is not None:
                capture["requestBody"] = scrub(shown, by_name=False) if shown is not None else scrub(body)
            if content_type == "application/json":
                capture["body"] = scrub(parsed)
            elif content_type == "application/x-tar":
                with tarfile.open(fileobj=io.BytesIO(raw)) as archive:
                    capture["listing"] = "\n".join(archive.getnames())
                    assert any(name.endswith("/manifest.json") or name == "manifest.json" for name in archive.getnames()), "Support archive has no manifest"
            elif raw:
                # Long text (the metrics exposition) is kept to its beginning; the page says so.
                lines = scrub(raw.decode()).splitlines()
                capture["body"] = "\n".join(lines[:TEXT_LINES]) + "\n"
                if len(lines) > TEXT_LINES:
                    capture["lines"] = len(lines)
            RESPONSES.append(capture)
        return parsed


def idem():
    return {"Idempotency-Key": str(uuid.uuid4())}


def wait_for(predicate, seconds=60, every=0.5):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        value = predicate()
        if value:
            return value
        time.sleep(every)
    return None


DOCUMENT = {
    "apiVersion": "fabric.apelora/v1alpha1",
    "kind": "ApplicationAssembly",
    "metadata": {"name": "shop", "uid": "assembly-shop"},
    "spec": {"modules": [], "connections": []},
}


TOOL = {"project": "apelora", "name": "tools-01", "kind": "container", "start": True,
        "source": {"protocol": "simplestreams", "server": "https://images.linuxcontainers.org", "alias": "debian/13"},
        "architectures": ["x86_64"], "config": {"limits.cpu": "1", "limits.memory": "1GiB"}}


def nginx(module, name):
    return {"module": module, "replicas": 1, "availability": "stateless", "spec": {
        "project": "shop-prod", "name": name, "kind": "container", "start": True,
        "source": {"protocol": "oci", "server": "https://docker.io", "alias": "library/nginx@sha256:eb1c896deef834f4e056829fd6dadac8305501f16cc71ba65fb252c8d0aa168e"},
        "architectures": ["x86_64", "aarch64"], "config": {"limits.cpu": "1", "limits.memory": "512MiB"}}}


def debian(module, name):
    return {"module": module, "replicas": 1, "availability": "stateful", "spec": {
        "project": "shop-prod", "name": name, "kind": "container", "start": True,
        "source": {"protocol": "simplestreams", "server": "https://images.linuxcontainers.org", "alias": "debian/13"},
        "architectures": ["x86_64", "aarch64"], "config": {"limits.cpu": "2", "limits.memory": "2GiB"},
        "volumes": [{"name": "data", "sizeMib": 10240, "path": "/var/lib/data"}]}}


def cache(module, name):
    module = debian(module, name)
    module["spec"]["config"] = {"limits.cpu": "1", "limits.memory": "1GiB"}
    module["spec"]["volumes"] = [{"name": "cache", "sizeMib": 2048, "path": "/var/cache/shop"}]
    return module


def scenario(api, start_worker):
    """Seeds the installation the pages describe and calls every operation that can succeed here."""
    call = api.call
    sections = []
    # Shared between sections: what one creates, later ones use.
    org = project = production = staging = people = ada = grace = lin = admin_token = deployed = channel = None

    def section(fn):
        sections.append(fn)
        return fn
    @section
    def s01_public_and_signing_in():
        """public and signing in"""
        call("sign_in_options", token=None, expect=200)
        call("whoami", token=None, expect=401, record=False, error_example=True)
        call("whoami", expect=200)
        call("permissions", expect=200)

    @section
    def s02_tenancy_organisation_project_e():
        """tenancy: organisation, project, environments, quotas"""
        nonlocal org, project, production, staging
        org = call("create_organization", body={"slug": "acme", "name": "Acme Corporation"}, expect=201)
        project = call("create_project", params={"org": org["id"]}, body={"slug": "shop", "name": "Online shop"}, expect=201)
        production = call("create_environment", params={"project": project["id"]}, body={"slug": "production", "name": "Production", "kind": "production", "incusProject": "shop-prod"}, expect=201)
        staging = call("create_environment", params={"project": project["id"]}, body={"slug": "staging", "name": "Staging", "kind": "staging"}, expect=201, record=False)
        call("environments", params={"project": project["id"]}, expect=200)
        call("organizations", expect=200)
        call("projects_list", expect=200)
        call("projects_list", query={"organization": org["id"]}, variant="options", expect=200)
        call("prepare_incus_project", params={"id": production["id"]}, expect=200)
        call("set_quota", params={"scope": "project", "id": project["id"]}, body={"cpu": 16, "memoryGib": 64, "diskGib": 500, "instances": 20}, expect=200)
        call("quota", params={"scope": "project", "id": project["id"]}, expect=200)
        call("tenancy", expect=200)

    @section
    def s03_people_local_accounts_sign_in_():
        """people: local accounts, sign-in, sessions, personal tokens"""
        nonlocal people, ada, grace, lin
        call("set_local_accounts", body={"enabled": True}, expect=200)
        call("set_api_tokens", body={"enabled": True}, expect=200)
        people = {}
        for username, display in (("ada", "Ada Lovelace"), ("grace", "Grace Hopper"), ("lin", "Lin Chen")):
            created = call("create_local_account", body={"username": username, "displayName": display, "email": f"{username}@example.org"}, expect=201)
            password = f"docs-{uuid.uuid4().hex}"
            SECRETS.add(password)
            call("complete_password_setup", token=None, body={"token": created["setupToken"], "password": password}, expect=204,
                 shown={"token": "<setup token from the setup link>", "password": "<new password>"})
            signed = call("sign_in_with_password", token=None, body={"username": username, "password": password}, expect=200,
                          shown={"username": username, "password": "<password>"})
            api.tokens[username] = signed["token"]
            people[username] = {"id": created["user"]["id"], "password": password}
        ada, grace, lin = people["ada"]["id"], people["grace"]["id"], people["lin"]["id"]
        for user in (ada, grace):
            call("create_assignment", body={"principal": {"type": "user", "id": user}, "role": {"type": "builtin", "key": "platform-super-admin"},
                                            "scope": {"type": "platform"}, "reason": "Platform administrators of this installation"}, expect=201, record=False)
        call("users", expect=200)
        call("lookup_user", query={"q": "ada"}, expect=200)
        call("reset_local_account", params={"id": lin}, expect=200)
        call("disable_user", params={"user": lin}, expect=204)
        call("enable_user", params={"user": lin}, expect=204)

        # A second sign-in for Ada, so one can be ended by her and one by an administrator.
        second = call("sign_in_with_password", token=None, body={"username": "ada", "password": people["ada"]["password"]}, record=False, expect=200)
        api.tokens["ada-2"] = second["token"]
        third = call("sign_in_with_password", token=None, body={"username": "ada", "password": people["ada"]["password"]}, record=False, expect=200)
        api.tokens["ada-3"] = third["token"]
        mine = call("my_sign_ins", token="ada", expect=200)
        call("sign_ins", expect=200)
        call("sign_ins", query={"user": ada}, variant="options", expect=200)
        others = [s for s in mine["items"] if not s.get("current")]
        if others:
            call("end_my_sign_in", token="ada", params={"id": others[0]["id"]}, expect=204)
        # The administrator ends the newest of Ada's other sign-ins.
        ada_now = call("my_sign_ins", token="ada", record=False, expect=200)
        victims = [s for s in ada_now["items"] if not s.get("current")]
        if victims:
            call("end_sign_in", params={"id": victims[0]["id"]}, expect=204)

        personal = call("create_my_token", token="ada", body={"name": "laptop-cli", "expiresInDays": 30}, expect=201)
        api.tokens["ada-pat"] = personal["token"]
        call("my_tokens", token="ada", expect=200)
        rotated = call("rotate_my_token", token="ada", params={"id": personal["info"]["id"]}, body={"expiresInDays": 30, "overlapMinutes": 60}, expect=201)
        spare = call("create_my_token", token="ada", body={"name": "backup-script", "expiresInDays": 7}, record=False, expect=201)
        call("personal_tokens", expect=200)
        call("personal_tokens", query={"user": ada}, variant="options", expect=200)
        call("revoke_personal_token", params={"id": spare["info"]["id"]}, expect=204)
        call("revoke_my_token", token="ada", params={"id": rotated["info"]["id"]}, expect=204)
        new_password = f"docs-{uuid.uuid4().hex}"
        SECRETS.add(new_password)
        call("change_password", token="grace", body={"current": people["grace"]["password"], "new": new_password}, expect=204,
             shown={"current": "<current password>", "new": "<new password>"})
        call("whoami", token="ada", record=False, expect=200)

    @section
    def s04_groups_roles_assignments_servi():
        """groups, roles, assignments, service identities, policies"""
        group = call("create_group", body={"name": "shop-operators", "description": "People who run the online shop", "organizationId": org["id"]}, expect=201)
        call("add_group_member", params={"group": group["id"], "user": lin}, expect=204)
        call("group_members", params={"group": group["id"]}, expect=200)
        call("groups", expect=200)
        role = call("create_role", body={"name": "Release manager", "description": "Publishes and deploys application versions",
                                         "permissions": ["application.view", "application.design", "application.deploy", "application.operate"]}, expect=201)
        spare_role = call("create_role", body={"name": "Log reader", "description": "Reads application logs", "permissions": ["application.view", "application.logs.read"]}, record=False, expect=201)
        call("roles", expect=200)
        grant = {"principal": {"type": "group", "id": group["id"]}, "role": role["reference"],
                 "scope": {"type": "project", "id": project["id"]}, "conditions": {"environments": ["production"], "requireMfa": False},
                 "reason": "The shop team releases to production"}
        call("preview_assignment", body=grant, expect=200)
        assignment = call("create_assignment", body=grant, expect=201)
        call("assignments", expect=200)
        call("assignments", query={"principalType": "group", "principalId": group["id"], "includeRevoked": True}, variant="options", expect=200)
        call("revoke_assignment", params={"assignment": assignment["id"]}, expect=204)
        call("delete_role", params={"role": spare_role["reference"]["id"]}, expect=204)
        call("remove_group_member", params={"group": group["id"], "user": lin}, expect=204)
        call("grant_emergency_access", token="ada", body={"userId": grace, "role": "fabric-administrator", "minutes": 30,
                                                          "reason": "Restore access during the identity provider outage"}, expect=201)
        service = call("create_service_identity", body={"name": "ci-pipeline", "kind": "automation", "expiresInDays": 90}, expect=201)
        call("service_identities", expect=200)
        call("disable_service_identity", params={"id": service["identity"]["id"]}, expect=204)
        call("enable_service_identity", params={"id": service["identity"]["id"]}, expect=204)
        policy = call("save_policy", body={"name": "approve-machine-removal", "kind": "approval", "parameters": {"actions": ["hardware.delete"]}, "enabled": True}, expect=200)
        call("policies", expect=200)
        call("delete_policy", params={"id": policy["id"]}, expect=204)

    @section
    def s05_sign_in_settings_identity_prov():
        """sign-in settings: identity providers and directories (no outside calls)"""
        call("sign_in_settings", expect=200)
        provider = call("create_identity_provider", body={"name": "Company sign-in", "issuer": "https://login.example.invalid/realms/acme",
                                                          "audiences": ["apelora"], "clientId": "apelora-console", "scopes": ["openid", "profile", "email"],
                                                          "groupsClaim": "groups", "enabled": False}, expect=201)
        if provider and provider.get("id"):
            call("update_identity_provider", params={"id": provider["id"]}, body={"name": "Company sign-in", "issuer": "https://login.example.invalid/realms/acme",
                                                                                  "audiences": ["apelora"], "clientId": "apelora-console", "scopes": ["openid", "profile", "email", "groups"],
                                                                                  "groupsClaim": "groups", "enabled": False}, expect=200)
            call("delete_identity_provider", params={"id": provider["id"]}, body={"confirm": "Company sign-in"}, expect=204)
        directory_body = {"name": "Head office directory", "url": "ldaps://ldap.example.invalid", "bindTemplate": "uid={username},ou=people,dc=acme,dc=example",
                          "baseDn": "dc=acme,dc=example", "groupBaseDn": "ou=groups,dc=acme,dc=example", "enabled": False}
        directory = call("create_directory", body=directory_body, expect=201)
        call("list_directories", expect=200)
        if directory and directory.get("id"):
            call("update_directory", params={"id": directory["id"]}, body={**directory_body, "startTls": False, "emailAttribute": "mail"}, expect=200)
            call("delete_directory", params={"id": directory["id"]}, body={"confirm": "Head office directory"}, expect=204)

    @section
    def s06_approvals():
        """approvals"""
        nonlocal admin_token
        pending = call("request_approval", body={"action": "hardware.delete", "target": "machine:rack1-07", "reason": "Retire the old storage server"}, expect=201)
        call("approvals", expect=200)
        call("reject_request", token="ada", params={"id": pending["id"]}, expect=200)
        withdrawn = call("request_approval", body={"action": "hardware.delete", "target": "machine:rack1-08", "reason": "Retire the spare server"}, record=False, expect=201)
        call("cancel_request", params={"id": withdrawn["id"]}, expect=200)
        # A fabric-admin token needs a second person: Grace asks, Ada approves, Grace uses it.
        admin_token = call("request_approval", token="grace", body={"action": "token.create_admin", "target": "token:fabric-admin", "reason": "A second administrator token for the backup site"}, record=False, expect=201)
        call("approve_request", token="ada", params={"id": admin_token["id"]}, expect=200)

    @section
    def s07_api_tokens():
        """API tokens"""
        call("tokens", expect=200)
        operator = call("create_token", body={"name": "monitoring", "role": "operator", "expiresInDays": 90}, expect=201)
        call("create_token", token="grace", body={"name": "backup-site-admin", "role": "fabric-admin", "expiresInDays": 30}, headers={"Apelora-Approval": admin_token["id"]}, variant="approval", expect=201)
        call("revoke_token", params={"id": operator["info"]["id"]}, expect=204)

    @section
    def s08_applications_draft_versions_pl():
        """applications: draft, versions, plan, deployment, operations"""
        nonlocal deployed
        call("create_application", body={"name": "shop", "environmentId": production["id"], "description": "Storefront and order database", "icon": "cart"}, expect=201)
        call("create_application", body={"name": "blog", "environmentId": staging["id"], "description": "Company blog"}, record=False, expect=201)
        call("update_application", params={"name": "shop"}, body={"description": "Storefront, API and order database"}, expect=200)
        draft = call("save_application_draft", params={"name": "shop"}, body={"document": DOCUMENT}, expect=200)
        call("application_draft", params={"name": "shop"}, expect=200)
        call("publish_application", params={"name": "shop"}, body={"label": "First release"}, expect=201)
        call("application_versions", params={"name": "shop"}, expect=200)
        call("application_version", params={"name": "shop", "revision": 1}, expect=200)
        modules = [nginx("web-01", "shop-web-01"), debian("db-01", "shop-db-01"), cache("cache-01", "shop-cache-01")]
        connections = [{"from": "web-01", "to": "db-01", "transport": "tcp", "port": 5432}, {"from": "web-01", "to": "cache-01", "transport": "tcp", "port": 6379}]
        published = [{"module": "web-01", "transport": "tcp", "port": 80}]
        call("plan_application", params={"name": "shop"}, body={"project": "shop-prod", "modules": modules, "connections": connections, "published": published}, expect=200)
        deployed = call("deploy_application", params={"name": "shop"}, headers=idem(), expect=202,
                        body={"project": "shop-prod", "document": DOCUMENT, "modules": modules, "connections": connections, "published": published, "removeMissing": False, "version": 1})
        call("applications", expect=200)
        call("applications", query={"includeArchived": True}, variant="options", expect=200)
        call("application", params={"name": "shop"}, expect=200)
        call("application", params={"name": "storefront"}, expect=404, record=False, error_example=True)
        call("archive_application", params={"name": "blog"}, expect=204)
        call("restore_application", params={"name": "blog"}, expect=204)

    @section
    def s09_jobs_before_the_worker_starts_():
        """jobs: before the worker starts they wait in the queue"""
        jobs = call("jobs", expect=200)
        call("jobs", query={"status": "pending", "application": "shop", "limit": 1}, variant="options", expect=200)
        spare = dict(TOOL, name="scratch-01")
        queued = call("create_instance", body=spare, headers=idem(), record=False, expect=202)
        call("cancel_job", params={"id": queued["jobId"]}, expect=200)

    @section
    def s10_instances_on_the_fixture_clust():
        """instances on the fixture cluster"""
        call("instances", expect=200)
        call("instance_page", params={"project": "default", "name": "mock-web-01"}, expect=200)
        logs = call("instance_logs", params={"project": "default", "name": "mock-web-01"}, expect=200)
        if logs and logs["files"]:
            call("instance_log", params={"project": "default", "name": "mock-web-01", "file": logs["files"][0]}, expect=200)
            call("instance_log", params={"project": "default", "name": "mock-web-01", "file": logs["files"][0]}, query={"tailKib": 16}, variant="options", expect=200)
        call("instance_console_log", params={"project": "default", "name": "mock-vm-01"}, expect=200)
        call("instance_console_log", params={"project": "default", "name": "mock-vm-01"}, query={"tailKib": 8}, variant="options", expect=200)
        call("preview_instance_move", params={"project": "default", "name": "mock-web-01"}, query={"target": "mock-member-03"}, expect=200)
        call("preview_instance_move", params={"project": "default", "name": "mock-vm-01"}, query={"target": "mock-member-03", "allowStop": True}, variant="options", expect=200)
        call("create_instance", body=TOOL, headers=idem(), expect=202)
        call("change_state", params={"project": "apelora", "name": "tools-01"}, body={"action": "restart"}, headers=idem(), expect=202)
        call("move_instance", params={"project": "default", "name": "mock-vm-01"}, body={"target": "mock-member-03", "confirm": "mock-vm-01", "allowStop": True}, headers=idem(), expect=409, record=False)
        call("delete_instance", params={"project": "apelora", "name": "tools-01"}, headers=idem(), expect=202)
        # Apelora refuses to restart an instance it did not create: this job fails in the worker.
        call("change_state", params={"project": "default", "name": "mock-web-01"}, body={"action": "restart"}, headers=idem(), record=False, expect=202)

    @section
    def s11_cluster_members_join_tokens_se():
        """cluster members, join tokens, settings"""
        call("cluster_members", expect=200)
        call("preview_evacuation", params={"member": "mock-member-03"}, expect=200)
        call("evacuate_member", params={"member": "mock-member-02"}, body={"confirm": "mock-member-02", "force": False}, expect=202)
        call("restore_member", params={"member": "mock-member-02"}, body={"confirm": "mock-member-02", "force": False}, expect=202)
        call("preview_member_removal", params={"member": "mock-member-03"}, expect=200)
        # The fixture cluster does not report its members' Incus releases, so an upgrade cannot start.
        call("cluster_upgrade", body={"action": "start", "confirm": "upgrade"}, expect=409)
        joined = call("create_join_token", body={"memberName": "rack2-01"}, expect=201)
        call("list_join_tokens", expect=200)
        call("revoke_join_token", params={"member": "rack2-01"}, expect=204)
        call("change_cluster_settings", body={"changes": {"cluster.join_token_expiry": "3H"}, "dryRun": True}, expect=200)
        call("change_cluster_settings", body={"changes": {"cluster.join_token_expiry": "3H"}, "dryRun": False}, record=False, expect=200)
        call("cluster_settings", expect=200)
        call("cluster_recovery", expect=200)

    @section
    def s12_machines_enrolment():
        """machines (enrolment)"""
        call("register_machine", body={"name": "rack2-01", "description": "Second rack, slot 1", "provider": "manual"}, expect=201)
        call("register_machine", body={"name": "mock-member-03", "description": "First rack, slot 3", "provider": "manual"}, record=False, expect=201)
        call("machine_admission", params={"name": "mock-member-03"}, expect=200)
        call("admit_machine", params={"name": "mock-member-03"}, expect=200)
        call("approve_machine", params={"name": "rack2-01"}, expect=201)
        call("withdraw_machine_approval", params={"name": "rack2-01"}, expect=204)
        call("remove_machine", params={"name": "rack2-01"}, expect=204)

    @section
    def s13_alerts_channels_rules_silences():
        """alerts: channels, rules, silences"""
        nonlocal channel
        channel = call("create_alert_channel", body={"name": "On-call webhook", "url": "https://hooks.example.invalid/apelora", "secretRef": "APELORA_ALERT_SECRET_ONCALL",
                                                     "minSeverity": "warning", "enabled": True}, expect=201)
        call("update_alert_channel", params={"id": channel["id"]}, body={"name": "On-call webhook", "url": "https://hooks.example.invalid/apelora", "secretRef": "APELORA_ALERT_SECRET_ONCALL",
                                                                         "minSeverity": "critical", "enabled": True}, expect=200)
        call("test_alert_channel", params={"id": channel["id"]}, expect=202)
        call("alert_channels", expect=200)
        call("update_alert_rule", params={"rule": "job-failures"}, body={"enabled": True, "threshold": 1, "forSecs": 0, "severity": "warning"}, expect=200)
        silence = call("create_alert_silence", body={"rule": "backup-age", "minutes": 120, "note": "Backup pool maintenance tonight"}, expect=201)
        call("end_alert_silence", params={"id": silence["id"]}, expect=204)

    @section
    def s14_the_worker_runs_the_queue_and_():
        """the worker runs the queue and evaluates alerts"""
        start_worker()
        deploy_jobs = [j["jobId"] for j in deployed["jobs"]] if deployed else []
        wait_for(lambda: all(api.call("job", params={"id": j}, record=False, quiet=True)["status"] in {"succeeded", "failed", "cancelled"} for j in deploy_jobs), 90)
        first = deploy_jobs[0] if deploy_jobs else None
        if first:
            call("job", params={"id": first}, expect=200)
            call("job_detail", params={"id": first}, expect=200)
        # The control plane's fixture cluster does not hold what the worker created: refused here.
        operation = call("operate_application", params={"name": "shop"}, body={"action": "start"}, headers=idem(), expect=409)
        if operation and "operation" in operation:
            wait_for(lambda: api.call("application_operation", params={"name": "shop", "id": operation["operation"]["id"]}, record=False, quiet=True)["state"] not in {"queued", "running"}, 90)
            call("application_operation", params={"name": "shop", "id": operation["operation"]["id"]}, expect=200)
        call("application_operations", params={"name": "shop"}, expect=200)
        failed = wait_for(lambda: api.call("jobs", query={"status": "failed"}, record=False, quiet=True)["items"], 90)
        if failed:
            call("retry_job", params={"id": failed[0]["id"]}, headers=idem(), expect=202)
        call("preview_application_migration", params={"name": "shop"}, query={"target": "mock-member-02"}, expect=200)
        call("application_events", params={"name": "shop"}, expect=200)
        call("application_status", params={"name": "shop"}, expect=200)
        call("application_status", params={"name": "shop"}, query={"project": "shop-prod"}, variant="options", expect=200)
        volumes = call("application_volumes", params={"name": "shop"}, expect=200)
        call("storage_volumes", expect=200)
        names = {item["incusName"] for item in (volumes or {}).get("items", [])}
        v, spare = "shop-db-01-data", "shop-cache-01-cache"
        assert {v, spare} <= names, f"Volumes not recorded: {names}"
        call("volume_snapshots", params={"name": "shop", "volume": v}, expect=200)
        call("take_volume_snapshot", params={"name": "shop", "volume": v}, expect=409)
        call("set_volume_schedules", params={"name": "shop", "volume": v}, body={"snapshots": {"everyMinutes": 60, "keep": 24}, "backups": {"everyMinutes": 1440, "keep": 7}}, expect=204)
        call("grow_application_volume", params={"name": "shop", "volume": v}, body={"sizeMib": 20480}, expect=502)
        backup_jobs = [call("back_up_volume", params={"name": "shop", "volume": v}, headers=idem(), expect=202)["jobId"]]
        time.sleep(1.1)  # backups are named after the second they are taken
        backup_jobs.append(call("back_up_volume", params={"name": "shop", "volume": v}, headers=idem(), record=False, expect=202)["jobId"])
        wait_for(lambda: all(api.call("job", params={"id": j}, record=False, quiet=True)["status"] in {"succeeded", "failed"} for j in backup_jobs), 90)
        backups = [b["name"] for b in call("volume_backups", params={"name": "shop", "volume": v}, expect=200)["items"]]
        assert len(backups) == 2, f"Expected two backups, found {backups}"
        kept, removed = backups
        call("preview_volume_restore", params={"name": "shop", "volume": v, "backup": kept}, expect=200)
        call("preview_volume_restore", params={"name": "shop", "volume": v, "backup": kept}, query={"safetyBackup": False}, variant="options", expect=200)
        call("restore_volume_backup", params={"name": "shop", "volume": v, "backup": kept}, body={"confirm": v, "safetyBackup": True}, headers=idem(), expect=409)
        call("delete_volume_backup", params={"name": "shop", "volume": v, "backup": removed}, body={"confirm": removed}, expect=204)
        # There is no snapshot to restore or delete (taking one was refused above).
        snapshot = "snap-20261025-120000"
        call("restore_volume_snapshot", params={"name": "shop", "volume": v, "snapshot": snapshot}, body={"confirm": snapshot}, expect=(404, 409, 502))
        call("delete_volume_snapshot", params={"name": "shop", "volume": v, "snapshot": snapshot}, expect=(404, 409, 502))
        call("delete_application_volume", params={"name": "shop", "volume": spare}, body={"confirm": spare}, expect=204)

        # Alerts that the worker raised: the restart of an instance Apelora does not own fails.
        alert = wait_for(lambda: next((a for a in api.call("alerts", record=False, quiet=True)["alerts"] if a.get("state") == "firing" or not a.get("resolvedAt")), None), 60)
        call("alerts", expect=200)
        history = call("alert_history", expect=200)
        if history and history["items"]:
            call("alert_history", query={"limit": 1, "before": history["items"][0]["id"] + 1}, variant="options", expect=200)
        if alert:
            call("acknowledge_alert", params={"id": alert["id"]}, body={"note": "Looking into the failed job"}, expect=200)
        call("delete_alert_channel", params={"id": channel["id"]}, expect=204)
        call("alert_rules", expect=200)

    @section
    def s15_sessions_into_modules():
        """sessions into modules"""
        call("application_access", params={"name": "shop"}, expect=200)
        call("sessions", expect=200)
        # The control plane's fixture cluster has no shop-web-01, so no session opens here.
        call("open_session", token="ada", params={"name": "shop", "instance": "shop-web-01"}, body={"kind": "terminal", "cols": 120, "rows": 32}, expect=(404, 409))
        call("terminate_session", token="ada", params={"id": str(uuid.uuid4())}, expect=404)
        call("application_operation", params={"name": "shop", "id": str(uuid.uuid4())}, expect=404)

    @section
    def s16_audit():
        """audit"""
        audit = call("audit", expect=200)
        call("audit", query={"action": "application.", "outcome": "success", "limit": 5}, variant="options", expect=200)
        call("identity_audit", expect=200)
        call("identity_audit", query={"action": "role.", "limit": 5}, variant="options", expect=200)
        call("audit_export", media="text/csv", expect=200)
        call("audit_export", media="application/x-ndjson", expect=200)
        call("audit_export", media="text/csv", query={"format": "csv", "action": "token.", "from": (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")}, variant="options", expect=200)

    @section
    def s17_finally_the_person_s_own_sessi():
        """finally the person's own session ends"""
        last = call("sign_in_with_password", token=None, body={"username": "ada", "password": people["ada"]["password"]}, record=False, expect=200)
        api.tokens["ada-last"] = last["token"]
        call("sign_out", token="ada-last", expect=204)

    @section
    def s18_refused_here():
        """operations that need a real cluster, identity provider, directory or MAAS: their refusals"""
        call("confirm_fenced", params={"member": "mock-member-01"}, body={"confirm": "mock-member-01", "poweredOff": True}, expect=409)
        call("check_identity_provider", body={"issuer": "https://login.example.invalid/realms/acme"}, expect=(200, 502))
        call("check_directory", body={"settings": {"name": "Head office directory", "url": "ldaps://ldap.example.invalid", "bindTemplate": "uid={username},ou=people,dc=acme,dc=example"},
                                      "username": "ada", "password": "<password>"}, expect=(200, 400, 502))
        for action, extra in (("commission", {}), ("deploy", {"distroSeries": "noble", "userData": ""}), ("release", {"eraseDisks": True}), ("test", {"scripts": ["smartctl-validate"]})):
            call(f"maas_{action}", params={"system_id": "4y3h7n"}, body={"confirm": "rack3-04", **extra}, expect=503)

    @section
    def s19_member_removal():
        """last, because the fixture cluster then has one member fewer"""
        call("remove_member", params={"member": "mock-member-03"}, body={"confirm": "mock-member-03", "force": False}, expect=409)
        call("evacuate_member", params={"member": "mock-member-02"}, body={"confirm": "mock-member-02", "force": False}, record=False, expect=202)
        call("remove_member", params={"member": "mock-member-02"}, body={"confirm": "mock-member-02", "force": False}, record=False, expect=409)

    for fn in sections:
        try:
            fn()
        except Exception as error:  # noqa: BLE001 - in explore mode one failing section must not hide the rest
            if not EXPLORE:
                raise
            MISMATCHES.append(f"{fn.__name__}: {type(error).__name__}: {error}")


def main():
    assert run(str(BINARY), "openapi", cwd=REPO) == SPEC_TEXT, "Rebuild the API binary: its OpenAPI differs from the checkout"
    database = "apelora_docs_" + uuid.uuid4().hex
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    url = f"http://127.0.0.1:{port}"
    backups_dir = tempfile.TemporaryDirectory(prefix="apelora-docs-db-backups-")
    LOCAL[backups_dir.name] = "/var/backups/apelora"
    # Intentionally construct a fresh environment; do not inherit a real Incus URL or identity.
    base = {"PATH": os.environ["PATH"], "DATABASE_URL": f"postgres://apelora:apelora-dev-only@127.0.0.1:15432/{database}", "RUST_LOG": "warn",
            "APELORA_BACKUP_POOL": "mock-local", "APELORA_DEPLOY_PROJECTS": "apelora,shop-prod,default", "APELORA_VOLUME_POOL": "mock-local"}
    env = {**base, "APELORA_API_ADDR": f"127.0.0.1:{port}", "APELORA_DB_BACKUP_DIR": backups_dir.name,
           "APELORA_RATE_LIMIT_WRITES_PER_MIN": "100000", "APELORA_RATE_LIMIT_WRITES_BURST": "100000",
           "APELORA_RATE_LIMIT_PUBLIC_PER_MIN": "100000", "APELORA_RATE_LIMIT_PUBLIC_BURST": "100000"}
    # The worker never delivers outside: no outbox relay, no metrics listener, no supervisor actions.
    worker_env = {**base, "APELORA_OUTBOX_SINK": "off", "APELORA_WORKER_METRICS_ADDR": "off", "APELORA_SUPERVISE_SECS": "0",
                  "APELORA_ALERT_EVALUATE_SECS": "5", "APELORA_WORKER_ID": "docs-worker"}
    server = worker = None
    run("docker", "exec", "apelora-dev-db", "psql", "-U", "apelora", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c", f"CREATE DATABASE {database}")
    try:
        # Capture CLI output in memory only: the one-time bearer secret never enters a file or log.
        token_output = run(str(BINARY), "token", "create", "--name", "docs-verifier", "--role", "fabric-admin", "--expires-in-days", "1", env=env, cwd=REPO)
        token = token_output.strip().splitlines()[-1]
        assert token.startswith("apl_"), "Token CLI returned an unexpected credential format"
        SECRETS.add(token)
        api = Api(url)
        api.tokens["admin"] = token
        with tempfile.TemporaryFile() as log, tempfile.TemporaryFile() as worker_log:
            server = subprocess.Popen([str(BINARY)], cwd=REPO, env=env, stdout=log, stderr=log)

            def start_worker():
                nonlocal worker
                worker = subprocess.Popen([str(WORKER)], cwd=REPO, env=worker_env, stdout=worker_log, stderr=worker_log)
                time.sleep(1)
                assert worker.poll() is None, "The deployment worker exited at start"

            # Health is public, with no credentials. Readiness polling is bounded.
            deadline = time.monotonic() + 30
            while True:
                if server.poll() is not None:
                    raise RuntimeError("Disposable control plane exited before becoming ready")
                try:
                    api.call("health", token=None, expect=200)
                    break
                except urllib.error.URLError:
                    if time.monotonic() >= deadline:
                        raise TimeoutError("Disposable API did not start")
                    time.sleep(0.1)
            assert RESPONSES[-1]["body"]["provider"] == "mock"
            remote = urllib.request.urlopen(url + "/api/v1/openapi.json", timeout=10).read().decode()
            assert remote == SPEC_TEXT, "Served OpenAPI differs from the documentation source"
            try:
                scenario(api, start_worker)
            finally:
                if worker and (EXPLORE or sys.exc_info()[0]):
                    worker_log.seek(0)
                    print(worker_log.read().decode(errors="replace")[-4000:], file=sys.stderr)
            # All collection reads without required parameters.
            for operation_id, (method, path, op) in OPS.items():
                if method != "get" or "{" in path or operation_id in {"health", "sign_in_options", "audit_export"}:
                    continue
                if any(p.get("required") for p in op.get("parameters", [])):
                    continue
                personal = operation_id in {"my_sign_ins", "my_tokens"}
                value = api.call(operation_id, media="text/plain" if operation_id == "metrics" else None, expect=403 if personal else 200)
                if personal:
                    assert value["error"]["code"] == "people_only"
                    CHECKS[-1]["note"] = "a legacy CLI token is refused"
                    ERRORS.append({"operationId": operation_id, "method": "GET", "path": path, "status": 403, "body": value})
            missing = sorted(set(OPS) - {r["operationId"] for r in RESPONSES})
            report = {"verifiedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"), "productCommit": run("git", "rev-parse", "HEAD", cwd=REPO).strip(),
                      "openapiSha256": hashlib.sha256(SPEC_TEXT.encode()).hexdigest(),
                      "environment": "Disposable PostgreSQL database, authenticated loopback control plane and deployment worker, each with the mock Incus provider; nothing sent outside this machine",
                      "recorded": len({r["operationId"] for r in RESPONSES}), "placeholders": {op: UNAVAILABLE.get(op, "not exercised yet") for op in missing},
                      "checks": CHECKS, "errors": ERRORS, "responses": RESPONSES,
                      "requests": [r for r in REQUESTS if r["operationId"] in missing]}
            serialized = json.dumps(report)
            leaked = [s for s in SECRETS if s in serialized]
            assert not leaked and not SECRET_PATTERN.search(serialized), "A credential would be written to the site"
            if "--record" in sys.argv:
                (ROOT / "content/api-examples.json").write_text(json.dumps(report, indent=2) + "\n")
                run("node", "scripts/import-api.mjs", str(REPO), cwd=ROOT)
            print(f"{len(CHECKS)} HTTP checks; {report['recorded']} of {len(OPS)} operations recorded.")
            print("Operations without a recorded success: " + ", ".join(missing))
            unexplained = sorted(set(missing) - set(UNAVAILABLE))
            if unexplained:
                MISMATCHES.append("Not recorded and no reason given in UNAVAILABLE: " + ", ".join(unexplained))
            stale = sorted(set(UNAVAILABLE) - set(missing))
            if stale:
                MISMATCHES.append("Recorded now; remove from UNAVAILABLE: " + ", ".join(stale))
            if MISMATCHES:
                print("\nUnexpected statuses:\n" + "\n".join(MISMATCHES))
                if not EXPLORE:
                    raise AssertionError("unexpected statuses")
            if EXPLORE:
                return
            count = check_examples()
            curl_count = check_curl_examples(env, url, api.tokens)
            ts_count = check_typescript()
            print(f"{count} documented JSON examples schema-validated; {curl_count} exact documented curl commands executed; {ts_count} TypeScript calls type-checked.")
    finally:
        for process in (worker, server):
            if process:
                process.terminate()
                process.wait(timeout=15)
        backups_dir.cleanup()
        run("docker", "exec", "apelora-dev-db", "psql", "-U", "apelora", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c", f"DROP DATABASE {database} WITH (FORCE)")


if __name__ == "__main__":
    main()

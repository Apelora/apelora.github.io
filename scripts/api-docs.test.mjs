import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { apiPages } from "./lib/api-docs.mjs";
import { errorCodes } from "./lib/api-errors.mjs";
import { render } from "./lib/markdown.mjs";

const document = (operation, extra = {}) => ({
  security: [{ bearer: [] }],
  paths: { "/api/v1/things": { get: { operationId: "things", tags: ["system"], responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } }, required: ["ok"] } } } } }, ...operation } } },
  ...extra,
});
const page = (op, extra) => apiPages(document(op, extra))[0].md;

test("public OpenAPI security alternatives omit bearer credentials", () => {
  for (const security of [[], [{}], [{ bearer: [] }, {}]]) {
    const md = page({ security });
    assert.match(md, /this operation is public/);
    assert.doesNotMatch(md, /-H "Authorization:/);
  }
  assert.match(page({}), /-H "Authorization:/);
});

test("operation identity, lowercase needs, complete JSON and every success are documented", () => {
  const schema = { type: "object", required: Array.from({ length: 18 }, (_, i) => `field${i}`), properties: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [`field${i}`, { type: "string" }])) };
  const md = page({ summary: "Read-only; needs `cluster.view`.", responses: { 200: { description: "Found", content: { "application/json": { schema } } }, 202: { description: "Queued", content: { "application/json": { schema } } }, 204: { description: "Done" } } });
  assert.match(md, /Operation ID.*`things`/);
  assert.match(md, /\*\*Needs:\*\* `cluster.view`\./);
  assert.match(md, /Response `202`/);
  assert.match(md, /Response `204`/);
  for (const [, json] of md.matchAll(/```json\n([\s\S]*?)\n```/g)) assert.equal(Object.keys(JSON.parse(json)).length, 18);
  assert.match(md, /placeholder values that show the shape/);
});

test("download and text responses have their media type and correct commands", () => {
  const md = page({ responses: { 200: { description: "Download", content: { "application/x-tar": { schema: { type: "string" } }, "text/csv": { schema: { type: "string" } } } } } });
  assert.match(md, /application\/x-tar/);
  assert.match(md, /text\/csv/);
  assert.match(md, /--output/);
  assert.doesNotMatch(md, /with no body/);
  const capture = { verifiedAt: "2026-10-24", responses: [{ operationId: "things", status: 200, mediaType: "application/x-tar", listing: "bundle/manifest.json" }] };
  const captured = apiPages(document({ responses: { 200: { content: { "application/x-tar": { schema: { type: "string" } } } } } }), {}, capture)[0].md;
  assert.match(captured, /bundle\/manifest.json/);
  assert.doesNotMatch(captured, /undefined/);
});

test("broken or duplicate operation IDs and unresolved references fail generation", () => {
  assert.throws(() => page({ operationId: undefined }), /operationId/);
  assert.throws(() => page({ responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/Missing" } } } } } }), /Missing/);
  const api = document({});
  api.paths["/duplicate"] = api.paths["/api/v1/things"];
  assert.throws(() => apiPages(api), /duplicate operationId/);
});

test("permission extraction preserves prose that uses the word needs", () => {
  const md = page({ summary: "The image servers each class needs with whether it is covered. Needs `read-inventory`." });
  assert.match(md, /each class needs with whether it is covered/);
  assert.match(md, /\*\*Needs:\*\* `read-inventory`\./);
});

test("parameters inherit and resolve component references", () => {
  const api = document({}, { components: { parameters: { Limit: { name: "limit", in: "query", required: true, schema: { type: "integer", minimum: 5 } } } } });
  api.paths["/api/v1/things"].parameters = [{ $ref: "#/components/parameters/Limit" }];
  assert.match(apiPages(api)[0].md, /things\?limit=5/);
});

test("the complete reference defines every operation, valid JSON, shell syntax and matching anchors", () => {
  const api = JSON.parse(readFileSync(new URL("../assets/api/openapi.json", import.meta.url)));
  let total = 0;
  const ids = new Set();
  for (const page of apiPages(api)) {
    const { html, headings } = render(page.md);
    assert.doesNotMatch(html, />undefined<|\u0000/);
    const targets = new Set(headings.map((h) => h.id));
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(targets.has(target), `${page.tag}: missing #${target}`);
    for (const [, value] of page.md.matchAll(/```json\n([\s\S]*?)\n```/g)) JSON.parse(value);
    for (const [, shell] of page.md.matchAll(/```sh\n([\s\S]*?)\n```/g)) execFileSync("bash", ["-n"], { input: shell });
    for (const [, id] of page.md.matchAll(/\*\*Operation ID:\*\* `([^`]+)`/g)) { assert.ok(!ids.has(id)); ids.add(id); }
    total += page.count;
  }
  const expected = Object.values(api.paths).reduce((n, ops) => n + Object.keys(ops).filter((m) => ["get", "post", "put", "patch", "delete"].includes(m)).length, 0);
  assert.equal(total, expected);
  assert.equal(ids.size, expected);
  // Check committed examples too, since captured outputs follow a different generator path.
  for (const file of readdirSync(new URL("../content/docs/api/", import.meta.url))) {
    const md = readFileSync(new URL(`../content/docs/api/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(md, /```(?:json|text)\nundefined\n```/);
    for (const [, value] of md.matchAll(/```json\n([\s\S]*?)\n```/g)) JSON.parse(value);
    for (const [, shell] of md.matchAll(/```sh\n([\s\S]*?)\n```/g)) execFileSync("bash", ["-n"], { input: shell });
  }
});

test("optional query parameters get a second request, defaults, allowed values and paging", () => {
  const parameters = [
    { name: "status", in: "query", schema: { type: "string", enum: ["pending", "failed"] }, description: "Only jobs in this state." },
    { name: "limit", in: "query", schema: { type: "integer" }, description: "Jobs per page, 1 to 200 (default 100)." },
    { name: "before", in: "query", schema: { type: "integer" }, description: "Paging: the id of the last item." },
  ];
  const md = page({ parameters });
  assert.match(md, /\| `status` \| query \| one of `pending`, `failed` \| no \| — \|/);
  assert.match(md, /\| `limit` \| query \| integer \| no \| `100` \|/);
  assert.match(md, /\*\*With options\*\* \(`status`, `limit`, `before`\)/);
  assert.match(md, /things\?status=pending&limit=1&before=1"/);
  assert.match(md, /\*\*Next page:\*\* repeat the request with `before`/);
  assert.match(md, /```ts\nconst result = await client\.request\("things", \{ query: \{ status: "pending", limit: 1, before: 1 \} \}\);\n```/);
  // A recorded call with options supplies its real values.
  const verified = { responses: [{ operationId: "things", variant: "options", status: 200, mediaType: "application/json", path: "/api/v1/things?status=failed", query: { status: "failed" }, body: { ok: true } }] };
  const recorded = apiPages(document({ parameters }), {}, verified)[0].md;
  assert.match(recorded, /\*\*With options\*\* \(`status`\)/);
  assert.match(recorded, /things\?status=failed"/);
  assert.doesNotMatch(page({}), /With options/);
});

test("request bodies list nested fields, variants and defaults; the TypeScript call carries the body", () => {
  const schema = { type: "object", required: ["scope", "name"], properties: {
    name: { type: "string", description: "Its name" },
    dryRun: { type: "boolean", default: false },
    scope: { oneOf: [
      { type: "object", required: ["type"], properties: { type: { type: "string", enum: ["platform"] } } },
      { type: "object", required: ["type", "id"], properties: { type: { type: "string", enum: ["project"] }, id: { type: "string", format: "uuid" } } },
    ] },
    items: { type: "array", items: { type: "object", required: ["port"], properties: { port: { type: "integer" } } } },
  } };
  const md = page({ requestBody: { content: { "application/json": { schema } } }, responses: { 204: { description: "Done" } } });
  assert.match(md, /\| `name` \| string \| yes \| Its name\. \|/);
  assert.match(md, /\| `dryRun` \| boolean \| no \| Default `false`\. \|/);
  assert.match(md, /\| `scope\.type` \| one of `platform`, `project` \| yes \|/);
  assert.match(md, /\| `scope\.id` \| string \(uuid\) \| when `type` is `project` \|/);
  assert.match(md, /\| `items\[\]\.port` \| integer \| yes \|/);
  assert.match(md, /```ts\nawait client\.request\("things", \{ body: \{ scope: \{ type: "platform" \}, name: "example" \} \}\);\n```/);
});

test("errors list the codes the handler returns and the codes observed, never undocumented statuses", () => {
  const responses = { 200: { description: "OK", content: { "application/json": { schema: { type: "object" } } } }, 401: { description: "No" }, 409: { description: "Conflict" } };
  const verified = { checks: [{ operationId: "things", status: 409, errorCode: "seen_here" }] };
  const md = apiPages(document({ responses }), {}, verified, { errorCodes: { things: { 409: ["still_running"], 400: ["invalid_request"] } } })[0].md;
  assert.match(md, /\| `409` \| `seen_here`, `still_running` \|/);
  assert.match(md, /\| `401` \| `unauthenticated`, `invalid_token` \|/);
  assert.doesNotMatch(md, /`400`/);
  assert.match(md, /\/docs\/api\/overview\/#error-codes/);
});

test("error codes are found through helpers, closures and imports, and only in our crate", () => {
  const repo = mkdtempSync(join(tmpdir(), "apelora-errors-"));
  try {
    mkdirSync(join(repo, "services/control-plane/src/api"), { recursive: true });
    writeFileSync(join(repo, "services/control-plane/src/api.rs"), "fn store(s: &S) -> Res<P> { Err(ApiError::new(StatusCode::SERVICE_UNAVAILABLE, \"database_not_configured\", \"x\")) }\n");
    writeFileSync(join(repo, "services/control-plane/src/api/helpers.rs"), "pub(super) fn conflict(code: &'static str, msg: String) -> ApiError { ApiError::new(StatusCode::CONFLICT, code, msg) }\npub(super) fn request() -> ApiError { ApiError::new(StatusCode::CONFLICT, \"unrelated\", \"no\") }\n");
    writeFileSync(join(repo, "services/control-plane/src/api/things.rs"), [
      "use super::helpers::{conflict};",
      "#[utoipa::path(post, path = \"/x\", operation_id = \"make_thing\")]",
      "pub(super) async fn make(s: S) -> Res<()> {",
      "    // ApiError::new(StatusCode::GONE, \"in_a_comment\", \"x\")",
      "    let bad = |m: String| ApiError::new(StatusCode::BAD_REQUEST, \"invalid_request\", m);",
      "    store(&s)?; db::request(); check(&s).map_err(weak)?; if x { return Err(conflict(\"still_running\", \"{}\".into())); }",
      "    Err(bad(format!(\"{x}\")))",
      "}",
      "fn weak(message: String) -> ApiError { ApiError::new(StatusCode::BAD_REQUEST, \"weak_password\", message) }",
      "#[cfg(test)] mod tests { fn t() { ApiError::new(StatusCode::GONE, \"test_only\", \"x\"); } }",
    ].join("\n"));
    assert.deepEqual(errorCodes(repo), { make_thing: { 400: ["invalid_request", "weak_password"], 409: ["still_running"], 503: ["database_not_configured"] } });
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("published pages carry no credentials, a TypeScript call per operation, and the overview's error example was recorded", () => {
  const recorded = JSON.parse(readFileSync(new URL("../content/api-examples.json", import.meta.url)));
  let operations = 0, calls = 0;
  for (const file of readdirSync(new URL("../content/docs/api/", import.meta.url))) {
    const md = readFileSync(new URL(`../content/docs/api/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(md, /\bap[a-z]_[A-Za-z0-9]{20,}/, `${file}: a credential`);
    assert.doesNotMatch(md, /MOCK VERIFIED|REAL INCUS TESTED|CONTRACT VERIFIED/, `${file}: an evidence label`);
    if (file === "overview.md") continue;
    operations += (md.match(/^### `/gm) ?? []).length;
    calls += (md.match(/^\*\*TypeScript:\*\*\n\n```ts\n(?:const result = )?await client\.request\("[a-z_]+", /gm) ?? []).length;
  }
  assert.equal(calls, operations);
  const overview = readFileSync(new URL("../content/docs/api/overview.md", import.meta.url), "utf8");
  const shown = JSON.parse(/## Errors[\s\S]*?```json\n([\s\S]*?)\n```/.exec(overview)[1]);
  assert.ok(recorded.errors.some((e) => JSON.stringify(e.body) === JSON.stringify(shown)), "The overview's error example is not a recorded response");
});

test("parameter notes only fill descriptions the API does not give", () => {
  const api = JSON.parse(readFileSync(new URL("../assets/api/openapi.json", import.meta.url)));
  const { apiParamNotes } = JSON.parse(readFileSync(new URL("../content/docs.json", import.meta.url)));
  const params = new Map(Object.values(api.paths).flatMap((ops) => Object.values(ops)).flatMap((op) => (op.parameters ?? []).map((p) => [`${op.operationId}.${p.name}`, p])));
  for (const key of Object.keys(apiParamNotes)) {
    assert.ok(params.has(key), `${key} is not a parameter`);
    assert.ok(!params.get(key).description, `${key} is described by the API now; remove the note`);
  }
});

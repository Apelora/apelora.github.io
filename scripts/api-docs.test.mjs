import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { apiPages } from "./lib/api-docs.mjs";
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
  assert.match(md, /illustrative/i);
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

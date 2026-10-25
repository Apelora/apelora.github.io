import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { apiPages } from "./api-docs.mjs";
import { errorCodes } from "./api-errors.mjs";

/** Refresh only the API reference, leaving unrelated product-document snapshots alone. */
export function importApi(root, repo) {
  const source = readFileSync(join(repo, "packages/api-client/openapi.json"), "utf8");
  const api = JSON.parse(source);
  const sha256 = createHash("sha256").update(source).digest("hex");
  const config = JSON.parse(readFileSync(join(root, "content/docs.json"), "utf8"));
  const capture = join(root, "content/api-examples.json");
  const verified = existsSync(capture) ? JSON.parse(readFileSync(capture, "utf8")) : {};
  if (verified.openapiSha256 && verified.openapiSha256 !== sha256) throw new Error("API examples are stale. Run the local verifier again before importing the changed OpenAPI document.");
  // The error codes each handler can return, read from the product's source and kept for review.
  const codes = errorCodes(repo);
  writeFileSync(join(root, "content/api-errors.json"), JSON.stringify({ openapiSha256: sha256, operations: Object.fromEntries(Object.entries(codes).sort()) }, null, 1) + "\n");
  const paramNotes = config.apiParamNotes ?? {};
  for (const key of Object.keys(paramNotes)) {
    const [id, name] = key.split(".");
    const p = Object.values(api.paths).flatMap((ops) => Object.values(ops)).find((op) => op.operationId === id)?.parameters?.find((x) => x.name === name);
    if (!p) throw new Error(`apiParamNotes: ${key} is not a parameter of the API`);
    if (p.description) console.warn(`apiParamNotes: the API now describes ${key}; remove the note from content/docs.json`);
  }
  const pages = apiPages(api, config.apiTags, verified, { errorCodes: codes, paramNotes });
  const out = join(root, "content/docs/api");
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(out).filter((f) => f.endsWith(".md"))) {
    if (/^source: packages\/api-client\/openapi.json$/m.test(readFileSync(join(out, f), "utf8"))) rmSync(join(out, f));
  }
  for (const page of pages) {
    const fm = ["---", `title: ${page.title}`, "section: api", `slug: ${page.tag}`, `order: ${page.order}`, `label: ${page.label}`, "source: packages/api-client/openapi.json", `summary: ${page.summary}`, "---", ""].join("\n");
    writeFileSync(join(out, `${page.tag}.md`), fm + page.md);
  }
  mkdirSync(join(root, "assets/api"), { recursive: true });
  writeFileSync(join(root, "assets/api/openapi.json"), source);
  const factsPath = join(root, "content/facts.json");
  const facts = JSON.parse(readFileSync(factsPath, "utf8"));
  facts.apiOperations = pages.reduce((n, p) => n + p.count, 0);
  facts.apiOperationsFloor = Math.floor(facts.apiOperations / 10) * 10;
  facts.apiGroups = pages.length;
  writeFileSync(factsPath, JSON.stringify(facts, null, 2) + "\n");
  return pages.length;
}

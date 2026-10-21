// Snapshots the product repository's documentation into content/docs/ so the site can publish it.
//   node scripts/import-docs.mjs [path to apelora-fabric]        (default: ../apelora-fabric)
// The list of pages, their sections and order are in content/docs.json. Pages written for the site
// (no `source:` line in their front matter) are never touched. Images the pages use are copied
// into assets/docs/ (screenshots as WebP, diagrams as SVG). Links are rewritten at build time.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, copyFileSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(process.argv[2] ?? join(root, "../apelora-fabric"));
const config = JSON.parse(readFileSync(join(root, "content/docs.json"), "utf8"));
if (!existsSync(join(repo, "docs"))) { console.error(`no docs/ in ${repo}`); process.exit(2); }

const out = join(root, "content/docs");
// remove earlier imports (never authored pages)
for (const sec of readdirSync(out, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  for (const f of readdirSync(join(out, sec.name)).filter((x) => x.endsWith(".md"))) {
    if (/^source:/m.test(readFileSync(join(out, sec.name, f), "utf8").split("\n---")[0])) rmSync(join(out, sec.name, f));
  }
}

const slugOf = (src) => config.slugs?.[src] ?? basename(src).toLowerCase().replace(/_/g, "-");
const images = new Set();
const unique = new Set();
let count = 0;

for (const [section, list] of Object.entries(config.imports)) {
  mkdirSync(join(out, section), { recursive: true });
  list.forEach((src, order) => {
    const file = join(repo, "docs", `${src}.md`);
    if (!existsSync(file)) throw new Error(`missing ${file}`);
    const md = readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
    const h1 = md.match(/^# (.+)$/m);
    if (!h1) throw new Error(`${src}: no title`);
    const title = h1[1].replace(/`/g, "").trim();
    const body = md.replace(/^# .+\n+/m, "");
    // summary: the first plain paragraph
    const para = body.split(/\n{2,}/).map((p) => p.trim()).find((p) => p && !/^(#|\||```|[-*>]|\d+\.|<|!\[|\*\*Evidence|\*\*Status|Status:|Date:|Design:|Decision:|Prerequisites)/.test(p) && p.length > 40);
    const summary = (para ?? "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[`*]/g, "").replace(/\s+/g, " ").slice(0, 200).replace(/\s\S*$/, (m) => (para && para.length > 200 ? "…" : m));
    const slug = slugOf(src);
    const key = `${section}/${slug}`;
    if (unique.has(key)) throw new Error(`duplicate ${key}`);
    unique.add(key);
    for (const m of [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g), ...md.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)]) if (!/^https?:/.test(m[1])) images.add(resolve(dirname(file), m[1]));
    const fm = ["---", `title: ${title}`, `section: ${section}`, `slug: ${slug}`, `order: ${order}`, `label: ${config.labels?.[src] ?? ""}`, `source: docs/${src}.md`, `summary: ${summary}`, "---", ""].join("\n");
    writeFileSync(join(out, section, `${slug}.md`), `${fm}${body}`);
    count++;
  });
}

for (const n of config.extraImages ?? []) images.add(join(repo, "docs/screenshots", `${n}.png`));
// API reference, generated from the control plane's OpenAPI document
{
  const api = JSON.parse(readFileSync(join(repo, "packages/api-client/openapi.json"), "utf8"));
  const tags = (api.tags ?? []).map((t) => t.name);
  const byTag = new Map(tags.map((t) => [t, []]));
  for (const [path, ops] of Object.entries(api.paths)) {
    for (const [method, op] of Object.entries(ops)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      const tag = op.tags?.[0] ?? "other";
      if (!byTag.has(tag)) byTag.set(tag, []);
      const first = (op.summary ?? "").replace(/\s+/g, " ").trim().replace(/^(.+?[.!?])\s.*$/, "$1");
      byTag.get(tag).push({ method: method.toUpperCase(), path, text: first === "Public." ? "Public: no sign-in needed." : first });
    }
  }
  const esc = (t) => t.replace(/\|/g, "\\|");
  const total = [...byTag.values()].reduce((n, l) => n + l.length, 0);
  let md = `The control plane's REST API, version \`${api.info.version}\`: ${total} operations. Calls are made with a bearer token (an API token or an identity provider's access token) and checked against the caller's permissions; a few, such as health and sign-in, are public. The complete machine-readable description, with request and response shapes, is the OpenAPI document \`packages/api-client/openapi.json\` in the repository; \`apelora-control-plane openapi\` prints it. This page is generated from it.\n\n`;
  for (const [tag, ops] of byTag) {
    if (!ops.length) continue;
    md += `## ${tag[0].toUpperCase()}${tag.slice(1)}\n\n| Method | Path | What it does |\n|---|---|---|\n`;
    for (const o of ops.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))) md += `| \`${o.method}\` | \`${o.path}\` | ${esc(o.text)} |\n`;
    md += "\n";
  }
  const fm = ["---", "title: API reference", "section: reference", "slug: api", "order: 3", "label: API reference", "source: packages/api-client/openapi.json", `summary: Every operation of the control plane's REST API, by area. Generated from its OpenAPI document.`, "---", ""].join("\n");
  writeFileSync(join(out, "reference", "api.md"), fm + md);
  count++;
}
// images: screenshots to WebP (at most 1440 px wide), diagrams copied
mkdirSync(join(root, "assets/docs/img"), { recursive: true });
mkdirSync(join(root, "assets/docs/svg"), { recursive: true });
for (const img of images) {
  if (!existsSync(img)) { console.warn(`missing image ${img}`); continue; }
  const name = basename(img);
  if (name.endsWith(".svg")) copyFileSync(img, join(root, "assets/docs/svg", name));
  else execFileSync("cwebp", ["-quiet", "-q", "82", "-resize", "1440", "0", img, "-o", join(root, "assets/docs/img", name.replace(/\.\w+$/, ".webp"))]);
}
console.log(`imported ${count} pages, ${images.size} images from ${repo}`);

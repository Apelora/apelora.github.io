// Snapshots the product repository's documentation into content/docs/ so the site can publish it.
//   node scripts/import-docs.mjs [path to apelora-fabric]        (default: ../apelora-fabric)
// The list of pages, their sections and order are in content/docs.json. Pages written for the site
// (no `source:` line in their front matter) are never touched. Images the pages use are copied
// into assets/docs/ (screenshots as WebP, diagrams as SVG). Links are rewritten at build time.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, copyFileSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { importApi } from "./lib/import-api.mjs";

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
  list.forEach((entry, index) => {
    const src = typeof entry === "string" ? entry : entry.src;
    const order = typeof entry === "string" ? index : entry.order;
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

// Facts the site states about the product, read from where they live so that no page repeats a number by hand.
// Pages and documents write {{fact:name}} (or {{fact:name|cap}} to capitalise); build.mjs fills them in.
{
  const read = (f) => readFileSync(join(repo, f), "utf8");
  const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  const nameOf = Object.fromEntries(Object.entries(words).map(([w, n]) => [n, w]));
  const catalog = read("docs/architecture/CATALOG.md");
  const [, modules, categories] = catalog.match(/(\d+) modules in (\d+) categories/);
  const [, deployable] = catalog.match(/(\d+) of \d+ classes have an Incus runtime/);
  // The number of built-in alert rules: the crate's own test asserts `RULES.len()` against this literal.
  const alertRules = Number(read("crates/domain/src/alerts.rs").match(/RULES\.len\(\),\s*(\d+)\)/)[1]);
  const api = JSON.parse(read("packages/api-client/openapi.json"));
  const apiOperations = Object.values(api.paths).reduce((n, ops) => n + Object.keys(ops).filter((m) => ["get", "post", "put", "patch", "delete"].includes(m)).length, 0);
  const lock = read("upstream.lock.yaml");
  const incusSeries = lock.match(/series:\s*"?([\d.]+)"?/)[1];
  const state = read("docs/architecture/current-state.md");
  const labWord = state.match(/\b(two|three|four|five|six)-member/)[1];
  const f = {
    modules, categories, deployable, deployableWord: nameOf[deployable] ?? deployable, alertRules, apiOperations,
    apiOperationsFloor: Math.floor(apiOperations / 10) * 10, apiGroups: new Set(Object.values(api.paths).flatMap((ops) => Object.values(ops).map((o) => o?.tags?.[0]).filter(Boolean))).size, incusSeries, labServers: words[labWord], labServersWord: labWord,
  };
  writeFileSync(join(root, "content/facts.json"), JSON.stringify(f, null, 2) + "\n");
  console.log("facts:", JSON.stringify(f));
}

// API reference: one page per area, every operation with its parameters, an example body and response and a curl command,
// generated from the control plane's OpenAPI document
count += importApi(root, repo);
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

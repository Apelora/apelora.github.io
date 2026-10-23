// Checks the built site: internal links, anchors, images (files, alt text, sizes), one h1 per page,
// titles and descriptions, and that GitHub links into the product repository name files that exist
// there (set REPO to a checkout; default ../apelora-fabric). Run after `node build.mjs`.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = process.env.REPO || join(root, "..", "apelora-fabric");
const problems = [];
const bad = (page, msg) => problems.push(`${page}: ${msg}`);

const pages = [];
const walk = (d) => { for (const f of readdirSync(d)) { if (["node_modules", ".git", "src", "scripts", "assets", "content"].includes(f)) continue; const p = join(d, f); statSync(p).isDirectory() ? walk(p) : f.endsWith(".html") && pages.push(p); } };
walk(root);

const ids = new Map();
const html = new Map();
for (const p of pages) {
  const h = readFileSync(p, "utf8");
  html.set(p, h);
  ids.set(p, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
const fileFor = (url) => {
  let path = url.split("#")[0].split("?")[0];
  if (path.endsWith("/")) path += "index.html";
  return join(root, path);
};

for (const [p, h] of html) {
  const name = p.replace(root + "/", "");
  const h1s = (h.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) bad(name, `${h1s} h1 elements`);
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  if (!title || title.length > 70) bad(name, `title missing or over 70 characters (${title.length})`);
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  if (desc.length < 50 || desc.length > 200) bad(name, `description length ${desc.length}`);
  if (!/<html lang="en">/.test(h)) bad(name, "no lang");
  if (name.startsWith("docs/api/") && /<a\b[^>]*>(?:<code>)?undefined(?:<\/code>)?<\/a>/.test(h)) bad(name, "undefined API operation label");
  if (name.startsWith("docs/api/") && /<code>undefined<\/code>/.test(h)) bad(name, "undefined API example output");
  for (const m of h.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const src = (tag.match(/src="([^"]+)"/) || [])[1];
    if (!/\salt="/.test(tag)) bad(name, `img without alt: ${src}`);
    if (!/\swidth="/.test(tag) || !/\sheight="/.test(tag)) bad(name, `img without width and height: ${src}`);
    if (src && src.startsWith("/") && !existsSync(join(root, src))) bad(name, `missing image ${src}`);
  }
  for (const m of h.matchAll(/<(?:a|link|script)\b[^>]*?(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(mailto:|tel:|data:)/.test(url)) continue;
    if (url.startsWith("#")) { if (url.length > 1 && !ids.get(p).has(url.slice(1))) bad(name, `anchor ${url} has no target`); continue; }
    if (url.startsWith("/")) {
      const f = fileFor(url);
      if (!existsSync(f)) { bad(name, `broken link ${url}`); continue; }
      const frag = url.split("#")[1];
      if (frag && f.endsWith(".html") && !ids.get(f)?.has(frag)) bad(name, `${url}: no #${frag} on that page`);
      continue;
    }
    const gh = url.match(/^https:\/\/github\.com\/Apelora\/apelora-fabric\/(?:blob|tree)\/main\/([^#?]+)/);
    if (gh && existsSync(repo) && !existsSync(join(repo, decodeURIComponent(gh[1].replace(/\/$/, ""))))) bad(name, `repository path not found: ${gh[1]}`);
    if (/^http:\/\//.test(url)) bad(name, `insecure link ${url}`);
  }
  if (/\bApelora Studio\b/.test(h) === false && name === "index.html") bad(name, "the home page should name Apelora Studio");
}
for (const f of ["favicon.svg", "favicon-32.png", "apple-touch-icon.png", "robots.txt", "sitemap.xml", ".nojekyll", "assets/fonts/inter-latin-wght-normal.woff2", "assets/fonts/OFL.txt", "assets/img/logo.svg"]) if (!existsSync(join(root, f))) bad("site", `missing ${f}`);
console.log(`${pages.length} pages checked`);
if (problems.length) { console.log(problems.join("\n")); process.exit(1); }
console.log("no problems");

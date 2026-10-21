// Builds the site: src/pages/*.html + src/partials/*.html -> the files GitHub Pages serves.
// No dependencies. Each page starts with a JSON comment: <!--page {"title":"…","description":"…","path":"/product/","nav":"product"} -->
// Partials are included with {{header}}, {{footer}} and {{cta}}. Run: node build.mjs
// Documentation: content/docs/<section>/<page>.md (see scripts/import-docs.mjs) becomes /docs/<section>/<page>/,
// with a sidebar, an on-page contents list, previous/next links and a search index (assets/docs-index.json).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { render, slugify } from "./scripts/lib/markdown.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const ORIGIN = "https://apelora.github.io";
const read = (p) => readFileSync(join(root, p), "utf8");
const partial = (name) => read(`src/partials/${name}.html`);

const NAV = [
  ["product", "/product/", "Product"],
  ["services", "/services/", "Services"],
  ["pricing", "/pricing/", "Pricing"],
  ["documentation", "/docs/", "Documentation"],
];

function navLinks(active) {
  return NAV.map(([key, href, label]) => `<a href="${href}"${key === active ? ' aria-current="page"' : ""}>${label}</a>`).join("\n        ");
}

/** Width and height of a WebP or SVG file, read from its header. */
function imageSize(file) {
  const b = readFileSync(file);
  if (file.endsWith(".svg")) {
    const t = b.toString("utf8", 0, 2000);
    const vb = t.match(/viewBox="[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/);
    if (vb) return [Math.round(Number(vb[1])), Math.round(Number(vb[2]))];
    const w = t.match(/\swidth="([\d.]+)(?:px)?"/), h = t.match(/\sheight="([\d.]+)(?:px)?"/);
    return w && h ? [Math.round(Number(w[1])), Math.round(Number(h[1]))] : null;
  }
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === "VP8L") { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1]; }
  return null;
}
const withSizes = (html) => html.replace(/<img\b[^>]*>/g, (tag) => {
  if (/\swidth="/.test(tag) && /\sheight="/.test(tag)) return tag;
  const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
  if (!src || !src.startsWith("/") || !existsSync(join(root, src))) return tag;
  const size = imageSize(join(root, src));
  return size ? tag.replace(/<img\b/, `<img width="${size[0]}" height="${size[1]}"`) : tag;
});

function head(p) {
  let title = p.home ? p.title : `${p.title} · Apelora`;
  if (title.length > 68) title = `${p.title.slice(0, 68 - " · Apelora".length - 1).replace(/\s+\S*$/, "")}… · Apelora`;
  if (p.description.length < 60) p.description = `${p.description} Apelora Fabric documentation and website.`;
  const desc = p.description.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const image = `${ORIGIN}${p.image ?? "/assets/img/og.png"}`;
  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${ORIGIN}${p.refresh ?? p.path}">
  <meta name="theme-color" content="#ffffff">
  ${p.refresh ? `<meta http-equiv="refresh" content="0; url=${p.refresh}">` : ""}
  ${p.noindex ? '<meta name="robots" content="noindex">' : ""}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Apelora">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${ORIGIN}${p.path}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-latin-wght-normal.woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/site.css">
  <script>document.documentElement.className += " js";</script>
  <script src="/assets/js/config.js" defer></script>
  <script src="/assets/js/site.js" defer></script>`;
}

const urls = [];
function emit(meta, body) {
  const html = `<!doctype html>
<html lang="en">
<head>
  ${head(meta)}
</head>
<body${meta.body ? ` class="${meta.body}"` : ""}>
${partial("header").replace("{{nav}}", navLinks(meta.nav))}
${withSizes(body).replace("{{cta}}", partial("cta")).replace(/\{\{include:([a-z-]+)\}\}/g, (_, n) => partial(n))}
${partial("footer")}
</body>
</html>
`;
  const out = meta.path === "/" ? "index.html" : meta.path.endsWith(".html") ? meta.path.slice(1) : `${meta.path.slice(1)}index.html`;
  mkdirSync(dirname(join(root, out)), { recursive: true });
  writeFileSync(join(root, out), html);
  if (!meta.noindex) urls.push(meta.path);
  return out;
}

const pages = readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"));
for (const file of pages) {
  const raw = read(`src/pages/${file}`);
  const m = raw.match(/^<!--page (\{[\s\S]*?\}) -->\s*/);
  if (!m) throw new Error(`${file}: missing the <!--page {...} --> header`);
  console.log(emit(JSON.parse(m[1]), raw.slice(m[0].length)));
}

// ---------- documentation ----------
const GITHUB = "https://github.com/Apelora/apelora-fabric";
const docsConfig = JSON.parse(read("content/docs.json"));
const escH = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function frontMatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error("missing front matter");
  const meta = {};
  for (const l of m[1].split("\n")) { const i = l.indexOf(":"); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
  return { meta, body: raw.slice(m[0].length) };
}

const sections = docsConfig.sections;
const docs = [];
for (const sec of sections) {
  const dir = join(root, "content/docs", sec.id);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
    const { meta, body } = frontMatter(readFileSync(join(dir, f), "utf8"));
    const slug = meta.slug || f.replace(/\.md$/, "");
    docs.push({
      section: sec.id, slug, title: meta.title, order: Number(meta.order ?? 99), source: meta.source || "",
      label: meta.label || meta.title.replace(/^ADR (\d+) — /, "$1 · "), body,
      summary: docsConfig.summaries?.[`${sec.id}/${slug}`] ?? meta.summary ?? "",
    });
  }
}
sections.forEach((sec) => { sec.pages = docs.filter((d) => d.section === sec.id).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)); });
const routeOf = (d) => `/docs/${d.section}/${d.slug}/`;
const bySource = new Map(docs.filter((d) => d.source).map((d) => [d.source, d]));
const problems = [];

function resolveLink(doc, href) {
  if (/^(https?:|mailto:|#|\/)/.test(href)) return href;
  if (!doc.source) { problems.push(`${routeOf(doc)}: relative link ${href}`); return href; }
  const [pathPart, anchor] = href.split("#");
  const target = posix.normalize(posix.join(posix.dirname(doc.source), pathPart));
  const hash = anchor ? `#${anchor}` : "";
  const hit = bySource.get(target);
  if (hit) return routeOf(hit) + hash;
  if (/^docs\/(screenshots|assets)\//.test(target)) return imageOf(target);
  return `${GITHUB}/${/\.[a-z0-9]+$/i.test(target) ? "blob" : "tree"}/main/${target}${hash}`;
}
function imageOf(target) {
  const name = posix.basename(target);
  return name.endsWith(".svg") ? `/assets/docs/svg/${name}` : `/assets/docs/img/${name.replace(/\.\w+$/, ".webp")}`;
}
const diagramName = (source, i) => `${source.replace(/^docs\//, "").replace(/\.md$/, "").replace(/\//g, "-").toLowerCase()}-${i}`;

function renderDoc(doc) {
  const r = render(doc.body, {
    link: (h) => resolveLink(doc, h),
    image: (h) => (/^(https?:|\/)/.test(h) ? h : imageOf(posix.normalize(posix.join(posix.dirname(doc.source), h)))),
    diagram: (code, i) => {
      const name = diagramName(doc.source, i);
      if (!existsSync(join(root, `assets/docs/diagrams/${name}.svg`))) { problems.push(`${routeOf(doc)}: no rendered diagram ${name}.svg (run scripts/render-diagrams.mjs)`); }
      return `<figure class="diagram"><a href="/assets/docs/diagrams/${name}.svg"><img src="/assets/docs/diagrams/${name}.svg" alt="Diagram. Its text version is under Diagram source." loading="lazy"></a><details><summary>Diagram source</summary><pre tabindex="0"><code>${escH(code)}</code></pre></details></figure>`;
    },
  });
  // images inside raw HTML blocks, and repository links inside them
  r.html = r.html.replace(/(<img\b[^>]*\ssrc=")([^"]+)(")/g, (m, a, src, b) => (/^(https?:|\/)/.test(src) || !doc.source ? m : `${a}${imageOf(posix.normalize(posix.join(posix.dirname(doc.source), src)))}${b}`));
  r.html = r.html.replace(/<p><strong>Evidence:<\/strong>/g, '<p class="ev"><strong>Evidence:</strong>');
  if (r.unsupported.length) problems.push(`${routeOf(doc)}: not understood: ${r.unsupported.slice(0, 2).join(" | ")}`);
  return r;
}

const chevron = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.25 2 8 6l-3.75 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function sidebar(current) {
  const groups = sections.map((sec) => {
    const open = current && current.section === sec.id;
    const items = sec.pages.map((d) => `<li><a href="${routeOf(d)}"${current && d === current ? ' aria-current="page"' : ""}>${escH(d.label)}</a></li>`).join("");
    return `<details class="dn-group"${open ? " open" : ""}><summary>${escH(sec.title)}${chevron}</summary><ul>${items}</ul></details>`;
  }).join("\n      ");
  return `<nav class="docs-nav" id="docs-nav" aria-label="Documentation">
      <div class="docs-search" role="search">
        <label for="docs-q" class="sr-only">Search the documentation</label>
        <input id="docs-q" type="search" role="combobox" aria-autocomplete="list" placeholder="Search the documentation" autocomplete="off" spellcheck="false" aria-controls="docs-results" aria-expanded="false" hidden>
        <ul id="docs-results" class="docs-results" role="listbox" aria-label="Search results" hidden></ul>
      </div>
      <a class="dn-home" href="/docs/">Documentation home</a>
      ${groups}
    </nav>`;
}

function docsPage(meta, inner, current) {
  return `  <main id="main" class="docs">
    <div class="wrap docs-wrap">
      <button class="docs-menu-btn" type="button" aria-expanded="false" aria-controls="docs-nav" hidden>Documentation menu${chevron}</button>
      ${sidebar(current)}
      ${inner}
    </div>
  </main>`;
}

const searchIndex = [];
const strip = (html) => html.replace(/<pre[\s\S]*?<\/pre>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

const flat = sections.flatMap((s) => s.pages);
for (const doc of docs) {
  const r = renderDoc(doc);
  const route = routeOf(doc);
  const sec = sections.find((s) => s.id === doc.section);
  const i = flat.indexOf(doc);
  const prev = i > 0 ? flat[i - 1] : null;
  const next = i < flat.length - 1 ? flat[i + 1] : null;
  const toc = r.headings.filter((h) => h.level === 2 || h.level === 3);
  const tocHtml = toc.length > 2
    ? `<nav class="docs-toc" aria-labelledby="toc-t"><h2 id="toc-t">On this page</h2><ul>${toc.map((h) => `<li class="l${h.level}"><a href="#${h.id}">${escH(h.text)}</a></li>`).join("")}</ul></nav>`
    : '<div class="docs-toc"></div>';
  const meta = {
    title: `${doc.title} · ${sec.title}`, description: doc.summary || `${doc.title}, in the Apelora Fabric documentation.`, path: route, nav: "documentation",
  };
  const github = doc.source ? `<p class="docs-source">This page is a copy of <a href="${GITHUB}/blob/main/${doc.source}">${doc.source}</a> in the repository, which is the source of truth. <a href="${GITHUB}/edit/main/${doc.source}">Suggest a change</a>.</p>` : "";
  const pager = `<nav class="docs-pager" aria-label="Previous and next page">${prev ? `<a class="prev" href="${routeOf(prev)}"><span>Previous</span>${escH(prev.label)}</a>` : "<span></span>"}${next ? `<a class="next" href="${routeOf(next)}"><span>Next</span>${escH(next.label)}</a>` : "<span></span>"}</nav>`;
  const inner = `<article class="docs-body">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/docs/">Documentation</a><span aria-hidden="true">/</span><a href="/docs/${sec.id}/">${escH(sec.title)}</a></nav>
        <h1>${escH(doc.title)}</h1>
        <div class="prose">
${r.html}
        </div>
        ${github}
        ${pager}
      </article>
      ${tocHtml}`;
  emit(meta, docsPage(meta, inner, doc));
  // search: one entry per second-level section
  const parts = r.html.split(/(?=<h2 id=)/);
  parts.forEach((part, k) => {
    const hm = part.match(/^<h2 id="([^"]+)">([\s\S]*?)<\/h2>/);
    searchIndex.push({ t: doc.title, s: sec.title, u: route + (hm ? `#${hm[1]}` : ""), h: hm ? strip(hm[2]) : "", x: strip(part).slice(0, 600) });
  });
}

// the documentation home
{
  const meta = { title: "Documentation", description: "Documentation for Apelora Fabric: get started, install, design, deploy and manage, with concepts, runbooks, reference and design decisions.", path: "/docs/", nav: "documentation" };
  const cards = `<ul class="sec-cards">${sections.map((sec) => `<li><a href="/docs/${sec.id}/"><b>${escH(sec.title)}</b><span>${escH(sec.blurb)}</span><small>${sec.pages.length} pages</small></a></li>`).join("")}</ul>`;
  emit(meta, docsPage(meta, read("content/docs/_home.html").replace("{{sections}}", cards), null));
}

// a landing page for each section
for (const sec of sections) {
  const meta = { title: `${sec.title} · Documentation`, description: sec.blurb, path: `/docs/${sec.id}/`, nav: "documentation" };
  const inner = `<article class="docs-body">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/docs/">Documentation</a></nav>
        <h1>${escH(sec.title)}</h1>
        <p class="lead">${escH(sec.blurb)}</p>
        <ul class="docs-list">${sec.pages.map((d) => `<li><a href="${routeOf(d)}"><b>${escH(d.label)}</b><span>${escH(d.summary)}</span></a></li>`).join("")}</ul>
      </article>
      <div class="docs-toc"></div>`;
  emit(meta, docsPage(meta, inner, { section: sec.id }));
}
writeFileSync(join(root, "assets/docs-index.json"), JSON.stringify(searchIndex));
if (problems.length) { console.error(problems.join("\n")); process.exitCode = 1; }
console.log(`docs: ${docs.length} pages, ${sections.length} sections, ${searchIndex.length} search entries`);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.sort().map((u) => `  <url><loc>${ORIGIN}${u}</loc></url>`).join("\n")}
</urlset>
`;
writeFileSync(join(root, "sitemap.xml"), sitemap);

// Builds the site: src/pages/*.html + src/partials/*.html -> the files GitHub Pages serves.
// No dependencies. Each page starts with a JSON comment: <!--page {"title":"…","description":"…","path":"/product/","nav":"product"} -->
// Partials are included with {{header}}, {{footer}} and {{cta}}. Run: node build.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const ORIGIN = "https://apelora.github.io";
const read = (p) => readFileSync(join(root, p), "utf8");
const partial = (name) => read(`src/partials/${name}.html`);

const NAV = [
  ["product", "/product/", "Product"],
  ["services", "/services/", "Services"],
  ["pricing", "/pricing/", "Pricing"],
  ["documentation", "/documentation/", "Documentation"],
];

function navLinks(active) {
  return NAV.map(([key, href, label]) => `<a href="${href}"${key === active ? ' aria-current="page"' : ""}>${label}</a>`).join("\n        ");
}

function head(p) {
  const title = p.home ? p.title : `${p.title} · Apelora`;
  const image = `${ORIGIN}${p.image ?? "/assets/img/og.png"}`;
  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${p.description}">
  <link rel="canonical" href="${ORIGIN}${p.path}">
  <meta name="theme-color" content="#ffffff">
  ${p.noindex ? '<meta name="robots" content="noindex">' : ""}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Apelora">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${p.description}">
  <meta property="og:url" content="${ORIGIN}${p.path}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-latin-wght-normal.woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/site.css">
  <script>document.documentElement.className += " js";</script>
  <script src="/assets/js/config.js" defer></script>
  <script src="/assets/js/site.js" defer></script>`;
}

const pages = readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"));
const urls = [];
for (const file of pages) {
  const raw = read(`src/pages/${file}`);
  const m = raw.match(/^<!--page (\{[\s\S]*?\}) -->\s*/);
  if (!m) throw new Error(`${file}: missing the <!--page {...} --> header`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length);
  const html = `<!doctype html>
<html lang="en">
<head>
  ${head(meta)}
</head>
<body${meta.body ? ` class="${meta.body}"` : ""}>
${partial("header").replace("{{nav}}", navLinks(meta.nav))}
${body.replace("{{cta}}", partial("cta"))}
${partial("footer")}
</body>
</html>
`;
  const out = meta.path === "/" ? "index.html" : meta.path.endsWith(".html") ? meta.path.slice(1) : `${meta.path.slice(1)}index.html`;
  mkdirSync(dirname(join(root, out)), { recursive: true });
  writeFileSync(join(root, out), html);
  if (!meta.noindex) urls.push(meta.path);
  console.log(out);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.sort().map((u) => `  <url><loc>${ORIGIN}${u}</loc></url>`).join("\n")}
</urlset>
`;
writeFileSync(join(root, "sitemap.xml"), sitemap);

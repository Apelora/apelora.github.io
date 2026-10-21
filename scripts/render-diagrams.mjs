// Renders the Mermaid diagrams found in the product repository's docs to static SVG files, so the
// published site loads no script for them. Run when a diagram changes:
//   node scripts/render-diagrams.mjs <product-repo> <mermaid.min.js> <playwright-core dir>
// e.g. node scripts/render-diagrams.mjs ../apelora-fabric /tmp/mermaid.min.js ../apelora-fabric/node_modules/playwright-core
// The diagram's file name is the doc's path with "/" turned into "-", plus its index in the doc.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [repo, mermaidJs, pw] = process.argv.slice(2);
if (!repo || !mermaidJs || !pw) { console.error("usage: render-diagrams.mjs <product-repo> <mermaid.min.js> <playwright-core dir>"); process.exit(2); }
const { chromium } = createRequire(import.meta.url)(join(process.cwd(), pw));

export const diagramName = (docPath, i) => `${docPath.replace(/\.md$/, "").replace(/\//g, "-").toLowerCase()}-${i}`;

const found = [];
for (const d of readdirSync(join(repo, "docs"), { withFileTypes: true }).filter((e) => e.isDirectory() && e.name !== "assets" && e.name !== "screenshots")) {
  for (const f of readdirSync(join(repo, "docs", d.name)).filter((x) => x.endsWith(".md"))) {
    const md = readFileSync(join(repo, "docs", d.name, f), "utf8");
    [...md.matchAll(/^```mermaid\n([\s\S]*?)^```/gm)].forEach((m, i) => found.push({ name: diagramName(`${d.name}/${f}`, i), source: m[1] }));
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent("<!doctype html><html><body><div id='out'></div></body></html>");
await page.addScriptTag({ path: mermaidJs });
await page.evaluate(() => {
  // eslint-disable-next-line no-undef
  mermaid.initialize({
    startOnLoad: false,
    htmlLabels: false,
    securityLevel: "strict",
    theme: "base",
    fontFamily: "Helvetica, Arial, sans-serif",
    flowchart: { htmlLabels: false, curve: "basis", useMaxWidth: true },
    themeVariables: {
      primaryColor: "#E6F4F1", primaryBorderColor: "#0F766E", primaryTextColor: "#0F172A", lineColor: "#475569",
      secondaryColor: "#F1F5F9", tertiaryColor: "#FFFFFF", noteBkgColor: "#FEF9C3", noteTextColor: "#0F172A",
      actorBkg: "#E6F4F1", actorBorder: "#0F766E", actorTextColor: "#0F172A", signalColor: "#334155", signalTextColor: "#0F172A",
      fontSize: "14px",
    },
  });
});
mkdirSync(join(root, "assets/docs/diagrams"), { recursive: true });
let n = 0;
for (const d of found) {
  const svg = await page.evaluate(async ({ id, source }) => {
    // eslint-disable-next-line no-undef
    const r = await mermaid.render(id, source);
    // Mermaid emits HTML-style tags (<br>) inside labels; serialising through the DOM makes the file well-formed XML.
    const doc = new DOMParser().parseFromString(r.svg, "text/html");
    return new XMLSerializer().serializeToString(doc.querySelector("svg"));
  }, { id: `d${n}`, source: d.source }).catch((e) => { throw new Error(`${d.name}: ${e.message}`); });
  writeFileSync(join(root, `assets/docs/diagrams/${d.name}.svg`), svg.replace(/style="max-width: ([\d.]+)px;[^"]*"/, 'style="max-width:$1px"'));
  n++;
}
await browser.close();
console.log(`rendered ${n} diagrams`);

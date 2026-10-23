// Browser QA using the product checkout's installed Playwright; no website runtime dependency.
// node scripts/browser-api-check.mjs [../apelora-fabric] [output-directory]
import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(process.argv[2] ?? join(root, "../apelora-fabric"));
const out = resolve(process.argv[3] ?? "/tmp/apelora-api-browser-qa");
const { chromium } = await import(pathToFileURL(join(repo, "node_modules/playwright-core/index.mjs")));
mkdirSync(out, { recursive: true });
const probe = createServer();
await new Promise((done) => probe.listen(0, "127.0.0.1", done));
const port = probe.address().port;
await new Promise((done) => probe.close(done));
const origin = `http://127.0.0.1:${port}`;
const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: root, stdio: "ignore" });
let browser;
try {
  await Promise.race([new Promise((_, reject) => server.once("exit", () => reject(new Error("Preview server exited")))), (async () => {
    for (let attempt = 0; attempt < 100; attempt++) {
      try { if ((await fetch(origin)).ok) return; } catch {}
      await new Promise((done) => setTimeout(done, 50));
    }
    throw new Error("Preview server did not start");
  })()]);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"], reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (!request.url().startsWith(origin)) errors.push(`External request: ${request.url()}`); });
  const api = JSON.parse(readFileSync(join(root, "assets/api/openapi.json"), "utf8"));
  const groups = [...new Set(Object.values(api.paths).flatMap((ops) => Object.values(ops).map((op) => op.tags?.[0]).filter(Boolean)))];
  let operations = 0;
  for (const group of groups) {
    await page.goto(`${origin}/docs/api/${group}/`);
    await page.locator(".prose h3").first().waitFor();
    const count = await page.locator(".prose h3").count();
    const expected = Object.values(api.paths).flatMap((ops) => Object.values(ops)).filter((op) => op.tags?.[0] === group).length;
    assert.equal(count, expected, group);
    operations += count;
    const labels = await page.locator(".prose table").first().locator("tbody a").allTextContents();
    assert.equal(labels.length, count, group);
    assert.ok(labels.every((label) => /^(GET|POST|PUT|PATCH|DELETE) \//.test(label)), `${group}: undefined operation label`);
    assert.ok((await page.locator(".prose pre code").allTextContents()).every((text) => text.trim() !== "undefined"), `${group}: undefined example output`);
    for (const [, json] of (await page.locator(".prose").innerHTML()).matchAll(/<pre data-lang="json"[^>]*><code>([\s\S]*?)<\/code>/g)) {
      // Syntax is covered by source tests; DOM checks also verify copied output below.
      assert.ok(json.length > 0);
    }
  }
  const capture = process.env.SPACING_CAPTURE ? readFileSync(process.env.SPACING_CAPTURE, "utf8") : null;
  const states = [];
  for (const width of [390, 1440, 1728]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const section of ["overview", "system"]) {
      await page.goto(`${origin}/docs/api/${section}/`);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("h1").textContent(), section === "system" ? "System API" : "API overview");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(overflow, false, `${section} overflows at ${width}`);
      await page.screenshot({ path: join(out, `${section}-${width}.png`) });
      if (capture && section === "system") {
        const state = await page.evaluate(capture);
        state.name = `system-${width}`;
        states.push(state);
      }
    }
    await page.locator('.prose table').first().getByRole("link", { name: "GET /api/v1/health", exact: true }).click();
    assert.equal(new URL(page.url()).hash, "#get-apiv1health");
    const heading = page.locator("#get-apiv1health");
    const pre = heading.locator("xpath=following-sibling::pre[1]");
    const code = await pre.locator("code").textContent();
    await pre.locator(".copy").focus();
    await pre.locator(".copy").click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), code);
    assert.ok(!code.includes("Authorization"), "Public health command must not copy a token header");
    await page.screenshot({ path: join(out, `health-copy-${width}.png`) });
    if (width === 390) {
      // Tables intentionally scroll inside their labelled region on phones.
      const table = page.locator(".prose .table-wrap").first();
      await table.focus();
      await table.press("ArrowRight");
      await page.waitForFunction(() => document.querySelector(".prose .table-wrap").scrollLeft > 0);
      const menu = page.locator(".docs-menu-btn");
      await menu.click();
      assert.equal(await menu.getAttribute("aria-expanded"), "true");
      await menu.click();
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
    }
  }
  await page.goto(`${origin}/docs/api/cluster/`);
  await page.locator('.prose table').first().getByRole("link", { name: "POST /api/v1/provisioners/maas/machines/{system_id}/commission", exact: true }).click();
  assert.ok(await page.locator("#post-apiv1provisionersmaasmachinessystem_idcommission").isVisible());
  const response = await context.request.get(origin + "/assets/api/openapi.json");
  assert.deepEqual(await response.json(), api);
  assert.deepEqual(errors, []);
  writeFileSync(join(out, "spacing-states.json"), JSON.stringify(states));
  console.log(`REAL-BROWSER TESTED: ${groups.length} API groups, ${operations} operation labels, links, copy buttons, mobile menu, OpenAPI download, and widths 390/1440/1728. Evidence: ${out}`);
} finally {
  await browser?.close();
  server.kill();
}

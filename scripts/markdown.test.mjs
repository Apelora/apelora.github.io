import test from "node:test";
import assert from "node:assert/strict";
import { inline, render } from "./lib/markdown.mjs";

test("code-formatted operation links keep their label and target", () => {
  assert.equal(inline("[`GET /api/v1/health`](#get-apiv1health)"), '<a href="#get-apiv1health"><code>GET /api/v1/health</code></a>');
  const { html } = render("| Operation |\n|---|\n| [`POST /things/{id}`](#post-thingsid) |\n\n### `POST /things/{id}`");
  assert.match(html, /<a href="#post-thingsid"><code>POST \/things\/\{id\}<\/code><\/a>/);
  assert.doesNotMatch(html, /undefined|\u0000/);
});

test("nested inline content keeps its own escaping and formatting", () => {
  assert.equal(inline('`outside` [**Read** `a<b` and ![chart](chart.svg)](/guide/)'), '<code>outside</code> <a href="/guide/"><strong>Read</strong> <code>a&lt;b</code> and <img src="chart.svg" alt="chart" loading="lazy"></a>');
});

test("heading IDs preserve literal underscores inside code spans", () => {
  const { html, headings } = render("### `POST /machines/{system_id}/test`");
  assert.match(html, /id="post-machinessystem_idtest"/);
  assert.equal(headings[0].text, "POST /machines/{system_id}/test");
});

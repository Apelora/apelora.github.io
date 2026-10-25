# apelora.github.io

The public website of Apelora Fabric, served by GitHub Pages at <https://apelora.github.io>.

Static HTML and one stylesheet: no framework, no tracking, no cookies, nothing loaded from other sites. Inter is self-hosted (SIL Open Font License, `assets/fonts/OFL.txt`). The only scripts add the menu, the preview tabs, scroll reveals and the contact form's behaviour; every page reads without them.

## Edit and preview

Pages are written in `src/pages/`, shared parts (header, footer, closing call to action) in `src/partials/`. `build.mjs` turns them into the files Pages serves (`index.html`, `product/index.html`, …) and writes `sitemap.xml`. The built files are committed.

```sh
node build.mjs            # rebuild after editing src/
node scripts/check.mjs    # links, anchors, images, headings, titles; REPO=<checkout> to check GitHub links against a local clone
python3 -m http.server 4173 --bind 127.0.0.1   # http://127.0.0.1:4173
```

## Documentation

`/docs/` is built from `content/docs/`: pages written for the site (`start/`, no `source:` line in their front matter) and snapshots of the product repository's `docs/` folder. The list, sections, order, short titles and summaries are in `content/docs.json`.

```sh
node scripts/import-docs.mjs ../apelora-fabric     # refresh the snapshots, their images (WebP via cwebp) and the generated API reference
node scripts/render-diagrams.mjs ../apelora-fabric <mermaid.min.js> ../apelora-fabric/node_modules/playwright-core   # Mermaid diagrams to static SVG
node build.mjs && node scripts/check.mjs
```

The imported pages are copies: the repository is the source of truth, and each page says so and links to its source. Links between documents are rewritten to site routes, other repository paths to GitHub. Screenshots in the Get started pages come from `tests/e2e/screenshots*.spec.ts` in the product repository (sample data). Refresh both whenever the product's screens change.

### API reference and working examples

The API reference is generated from `../apelora-fabric/packages/api-client/openapi.json`, also published at `/assets/api/openapi.json`. Refresh the API alone without importing unrelated product-document edits:

```sh
node scripts/import-api.mjs ../apelora-fabric
npm test
npm run build
npm run check
```

To verify and capture actual example output, first build the current product binary (`cargo build -p apelora-control-plane`) and start its development database (`docker compose -f infra/dev/compose.yaml up -d`). With [uv](https://docs.astral.sh/uv/) installed, run from this website checkout:

```sh
uv run scripts/test-api-verifier.py
uv run scripts/verify-api-examples.py ../apelora-fabric --record
npm test
npm run build
npm run check
node scripts/browser-api-check.mjs ../apelora-fabric
```

The verifier uses a unique disposable database on `apelora-dev-db` and an authenticated API on a free loopback port, with an environment that excludes Incus credentials. It exercises reads and application metadata changes, validates statuses, media types and bodies against OpenAPI, checks all documented JSON examples, and executes the exact documented curl commands for successful reads. It stops its API and deletes only its database on exit. `content/api-examples.json` records the successful outputs, checks, product commit, date and OpenAPI hash. A changed contract requires recapturing examples. `--record` refreshes API pages; run the build afterwards. No deployment worker or real Incus operations run.

Browser QA uses the product checkout's installed `playwright-core` and Chromium. It checks every operation label, code copying, anchors, the OpenAPI download and mobile navigation at 390, 1440 and 1728 pixels. Screenshots go to `/tmp/apelora-api-browser-qa` by default; pass another directory as the second argument. `SPACING_CAPTURE=/path/to/capture.js` additionally writes measured DOM states for Better Design review.

Keep generated values labelled **Illustrative** and observed local results labelled **MOCK VERIFIED**. These checks prove the API contract and local behavior; they do not prove a real-machine deployment. Directory sign-in integration requires its separate development service. The API's control-plane test suite is `cargo test -p apelora-control-plane` in the product checkout.

Regression notes: inline code inside Markdown links must share the renderer's placeholder table, and heading slugs must preserve underscores inside code spans. Otherwise operation names become `undefined` or their links miss their targets. Binary captures carry archive listings rather than JSON/text bodies; never render an absent body. The Node tests and site checker cover these failures.

The `Website checks` workflow runs Node regressions, the build, the site checker and a generated-file drift check on pushes and pull requests. Local API and browser verification additionally require the product checkout and its development tools.

## Business details and policy settings

`content/site.json` holds the company's legal name, postal address and contact email, and the numbers the legal pages promise (reply time, refund time, the date they were last updated, and whether a lawyer has reviewed them). Pages read them as `{{site:name}}`; change them there, never in the pages. While `legalReviewed` is `false`, the legal pages say they have not been reviewed yet.

## Moving to another host

GitHub Pages' terms restrict using it mainly to run a commercial business. Before the site sells services, move it to a host that allows that, such as Cloudflare Pages or Netlify: connect this repository, build command none (the built files are committed), output directory the repository root. `_headers` then adds security headers that a page cannot set itself (no framing, HSTS). Point the domain at the new host, then turn GitHub Pages off so there is one copy.

## Publish

Repository `Apelora/apelora.github.io`, Settings → Pages → Deploy from a branch → `main` / root. `.nojekyll` turns off GitHub's own processing.

## The contact form

`assets/js/config.js` holds the form's endpoint, and it is **empty**: the form validates, says plainly that it is not connected, and sends nothing. To connect it, set `endpoint` to a service (or your own server) that accepts a `multipart/form-data` POST and answers 2xx when it has accepted the message. The page says "Message sent" only after such an answer. Then update the privacy section in `src/pages/legal.html`, which currently says the form sends nothing and must name the service. To receive the messages by email through your own SMTP server, run the small program in [`contact-service/`](contact-service/README.md) and point `endpoint` at it.

## Keep the facts true

The site makes claims about what Apelora Fabric does and how each result was checked. Change them in the same commit as the product repository's `docs/architecture/current-state.md`:

- the evidence tags (a result is "Real Incus tested" only when it ran on the lab) and the roadmap table in `src/pages/product.html`;
- the module counts (83 modules in 12 categories, three that deploy; `docs/architecture/CATALOG.md`);
- the licence wording, which must match the product repository's `LICENSE`;
- the proposed service scope and the support coverage in `src/pages/services.html`, which are proposals until approved.

## Images

Screenshots are real, cropped from the product repository's `docs/screenshots/` (sample data; each caption says so). The logo and favicons come from `assets/brand/logo.svg` there, unchanged; the diagram from `docs/assets/diagrams/`. The screenshots show other products' names and logos in the module catalog; the footer and the legal page say they imply no endorsement.

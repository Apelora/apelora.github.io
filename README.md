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

The API reference is generated from `../apelora-fabric/packages/api-client/openapi.json`, also published at `/assets/api/openapi.json`. Each operation gets its parameters (type, default, allowed values), every request-body field with one level of nesting (`parent.child`), a curl command, a second one with its options where it has optional query parameters or headers, a one-line TypeScript call with the generated client, the response, and its error statuses with their codes. Refresh the API alone without importing unrelated product-document edits:

```sh
node scripts/import-api.mjs ../apelora-fabric
npm test
npm run build
npm run check
```

The importer also reads the control plane's handlers (`scripts/lib/api-errors.mjs`) for the error codes each operation can return, through the helpers and functions it calls, and writes them to `content/api-errors.json` for review. `content/docs.json` holds each group's title and introduction (`apiTags`) and descriptions for the few parameters the OpenAPI document does not describe (`apiParamNotes`); a test fails once the API describes one of them itself. The overview (`content/docs/api/overview.md`) is written by hand; a test checks that its error example is one the verifier recorded.

To verify and capture example output, build the product's control plane and worker (`cargo build -p apelora-control-plane -p apelora-deployment-worker`), install its npm packages (`npm ci`, for the TypeScript check) and start its development database (`docker compose -f infra/dev/compose.yaml up -d`). When another session is building in the product checkout, use a separate worktree (`git -C ../apelora-fabric worktree add ../apelora-fabric-apidocs origin/main`) and pass that path instead. With [uv](https://docs.astral.sh/uv/) installed, run from this website checkout:

```sh
uv run scripts/test-api-verifier.py
uv run scripts/verify-api-examples.py ../apelora-fabric --record
npm test
npm run build
npm run check
node scripts/browser-api-check.mjs ../apelora-fabric
```

The verifier creates a unique disposable database on `apelora-dev-db`, starts an authenticated control plane on a free loopback port and, partway through, a deployment worker, both with the mock Incus provider and an environment that excludes Incus credentials. The worker's outbox relay is off, so alert channels are never called and nothing leaves the machine. It seeds an installation (an organisation, project and environments, three local accounts with sign-ins, groups, roles and assignments, a service identity, policies, approvals, tokens, a deployed application with a draft and a published version, jobs, volumes and backups, alert channels, rules and silences, machines and join tokens) and calls every operation that can succeed there. It validates statuses, media types and bodies against OpenAPI, records the first success of each operation and of its options variant, and records the request of each refused operation so its page still shows a realistic call. It then checks every documented JSON example, executes the exact documented curl commands for successful reads (options included, with a person's session where the operation needs one) and type-checks every documented TypeScript call against the product's client. It stops both processes and deletes only its database on exit. `--explore` keeps going after an unexpected status and lists them all.

Credentials never reach the site: every token, setup token, session ticket and password the run sees is replaced by a placeholder such as `<token, shown once>` before anything is written, and the run fails if one would remain. Temporary paths and the product's internal test record (`incusTestedWith`) are replaced the same way. `content/api-examples.json` holds the recorded responses, the refused requests, every check with its error code, the product commit, date and OpenAPI hash, and `placeholders`: the operations without a recorded response and why (they need a real cluster, an identity provider, a directory or MAAS, or the control plane to see what the worker created, which the two separate mock providers do not share). A changed contract requires recapturing examples. `--record` refreshes the API pages; run the build afterwards.

Browser QA uses the product checkout's installed `playwright-core` and Chromium. It checks every operation label, code copying, anchors, the OpenAPI download and mobile navigation at 390, 1440 and 1728 pixels. Screenshots go to `/tmp/apelora-api-browser-qa` by default; pass another directory as the second argument. `SPACING_CAPTURE=/path/to/capture.js` additionally writes measured DOM states for Better Design review.

Reader pages show recorded output as "Example response from a test installation; your IDs, names and times differ." and everything else as "placeholder values that show the shape"; they never carry evidence labels, test dates or issue numbers. These checks prove the API contract and the local behaviour; they do not prove a real-machine deployment. The API's control-plane test suite is `cargo test -p apelora-control-plane` in the product checkout.

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

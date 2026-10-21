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

## Publish

Repository `Apelora/apelora.github.io`, Settings → Pages → Deploy from a branch → `main` / root. `.nojekyll` turns off GitHub's own processing.

## The contact form

`assets/js/config.js` holds the form's endpoint, and it is **empty**: the form validates, says plainly that it is not connected, and sends nothing. To connect it, set `endpoint` to a service (or your own server) that accepts a `multipart/form-data` POST and answers 2xx when it has accepted the message. The page says "Message sent" only after such an answer. Then update the privacy section in `src/pages/legal.html`, which currently says the form sends nothing and must name the service.

## Keep the facts true

The site makes claims about what Apelora Fabric does and how each result was checked. Change them in the same commit as the product repository's `docs/architecture/current-state.md`:

- the evidence tags (a result is "Real Incus tested" only when it ran on the lab) and the roadmap table in `src/pages/product.html`;
- the module counts (83 modules in 12 categories, three that deploy; `docs/architecture/CATALOG.md`);
- the licence wording, which must match the product repository's `LICENSE`;
- the proposed service scope and the support coverage in `src/pages/services.html`, which are proposals until approved.

## Images

Screenshots are real, cropped from the product repository's `docs/screenshots/` (sample data; each caption says so). The logo and favicons come from `assets/brand/logo.svg` there, unchanged; the diagram from `docs/assets/diagrams/`. The screenshots show other products' names and logos in the module catalog; the footer and the legal page say they imply no endorsement.

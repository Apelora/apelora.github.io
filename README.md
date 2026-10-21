# apelora.github.io

The public website of [Apelora](https://github.com/Apelora/apelora-fabric), served by GitHub Pages at <https://apelora.github.io>.

A single static page: HTML and one stylesheet, no build step, no framework, no web fonts, no cookies, no analytics, and nothing loaded from other sites. The only script copies the quick-start commands.

## Preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1   # http://127.0.0.1:4173
```

## Publish

Repository `Apelora/apelora.github.io`, branch `main`, Settings → Pages → Deploy from a branch → `main` / root. Nothing else is needed; `.nojekyll` turns off GitHub's own processing.

## Keep the facts true

The page makes claims about what Apelora does and how each was checked. Change them in the same commit as the repository's `docs/architecture/current-state.md`:

- the **What works today** table in `index.html` (a result is "Real Incus tested" only when it has been run on the lab);
- the module count (`83 modules in 12 categories`, from `docs/architecture/CATALOG.md`);
- the licence wording, which must match the repository's `LICENSE`.

## Assets

Copied from the main repository, not edited here: `assets/img/logo.svg` and `favicon.svg` (`assets/brand/logo.svg`), the screenshots in `assets/img/` (`docs/screenshots/`) and the diagrams in `assets/diagrams/` (`docs/assets/diagrams/`). `assets/img/og.png` is the social preview card, rendered from the logo and the Studio screenshot. The screenshots show other products' names and logos in the module catalog; the page's footer says so.

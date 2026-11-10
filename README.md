# LEDOVIA — Beta website foundation V1.5

Ready for the Adventure. Prepared for the Unexpected.

This repository is the authoritative editable source for the Ledovia customer-facing Beta website. The only planned second repository is `drkrook/ledovia-website-stable`; no Stable site is configured here.

Beta: https://drkrook.github.io/ledovia-website-beta/

## Local development

Use Node 24.22.1 (see .nvmrc).

```sh
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run verify
npm run dev -- --host 0.0.0.0
```

Astro uses the `/ledovia-website-beta/` base path in development and production. Open that path after starting the server. `.npmrc` uses an ignored project-local cache to support managed environments without a writable home cache. Set ASTRO_TELEMETRY_DISABLED=1 where home configuration directories are unavailable.

## Scope and design

Astro + TypeScript + lightweight CSS. Shared layout, responsive header with native mobile navigation, homepage, four solution placeholders, minimal About/How it works/Contact placeholders, footer and custom 404. CSS uses the approved Teal/Forest/Gold/Mist/Slate/Ocean palette, Manrope/Inter names with reliable system fallbacks. No externally loaded fonts or assets. SVG landscape, map concept, and favicon are original local illustrations created for this project; imagery is conceptual, not a working product screen.

Travel and outdoor capabilities are in development. Professional response and agency capabilities are planned and unavailable. No forms, accounts, payments, browser storage, service workers or application integrations. Beta has noindex metadata and restrictive robots guidance; it is PUBLIC, not private.

## Publishing and source preservation

The Pages source must be GitHub Actions. `.github/workflows/pages.yml` runs npm ci, type checks, build, and local route/asset checks before uploading dist through the official Pages artifact action and deploying via the official Pages deployment action. Actions are pinned to commit SHAs. Build has contents:read; only deployment has pages:write and id-token:write. Exact repository/ref guards restrict this to Beta main. No PATs or custom deployment credentials are stored in source. Pushes to main intentionally publish Beta; review future source changes before pushing.

The deployed base is not a custom domain. No CNAME or DNS changes are included. Stable deployment is outside this workflow. To restore a previous Beta release, select a known-good source commit and use a reviewed revert on main; this creates a fresh checked build. Do not force-push. Download a complete source snapshot from GitHub's Code → Download ZIP, or clone this repository. Local workspace-only files are not a backup.

## Verification

`npm run verify` checks nine generated HTML pages, base-prefixed links, fragments, metadata, CSS/JS/SVG assets, no CNAME, and absence of customer forms/storage/service workers. After deployment, `node scripts/verify.mjs --live` checks live routes/resources and compares response bytes with the locally built artifact. This does not prove responsive, keyboard, or assistive-technology behavior. See docs/VALIDATION.md for actual evidence and limitations.

# Beta foundation V1.5 — local evidence

Date: November 10, 2026. Source: drkrook/ledovia-website-beta, main.

## VERIFIED locally before initial publication

- Node 24.22.1, npm 11.9.0; Astro 7.4.10, @astrojs/check 0.9.12, TypeScript 5.9.3.
- npm install: passed, 267 packages. npm ci --offline: passed using the lockfile and populated project cache. The initial npm metadata lookup failed against the unavailable home cache; project-local cache corrected this without home changes.
- ASTRO_TELEMETRY_DISABLED=1 npm run check: 18 files, zero errors/warnings/hints.
- ASTRO_TELEMETRY_DISABLED=1 npm run build: passed; nine HTML pages.
- npm run verify: passed; nine pages, 161 local link/asset references, 13 unique resources. Verified base paths, link targets, fragments, canonical origins, noindex, descriptions, H1/main landmarks, generated CSS/JS/SVG resources, no CNAME, no customer forms, no browser storage or service-worker registrations.
- Initial verification found the 404 canonical used Astro's /404/ route rather than generated /404.html. Targeted correction applied; final checks passed.
- Workflow YAML parsed; main trigger, pinned official action commits, build dependency, repository/ref guards and scoped deployment permissions checked.
- GitHub Pages API reported build_type=workflow before implementation. No further settings change was needed.

## IMPLEMENTED; browser behavior UNVERIFIED

Source includes responsive rules for single-column cards/native mobile navigation at 375px, two-column cards at 768px, and four columns at 1440px; visible focus, skip navigation, semantic headings, decorative empty-alt hero, labeled map concept, reduced motion and Escape handling for mobile navigation.

No browser-control tool is available in the current managed environment. No visual or keyboard review, screenshot, screen reader test, automated browser accessibility audit, or WCAG conformance verification is claimed. The local preview relay is not relied upon. The live HTTP check is a network/byte check, not a rendered browser test.

## Remote publication evidence

The initial push triggers .github/workflows/pages.yml. Its GitHub Actions run is the authoritative remote build/deployment record. Deployment success is not established by this pre-publication document. After a successful run use `node scripts/verify.mjs --live` against the matching local build to check served HTML/assets. The owner receives the run URL, source commit SHA and actual live-check outcome separately.

## Scope

Only the Beta website repository is changed. No third source repository, Stable repository/site, DNS, custom domain, Silent Compass, Cruise Beta, other applications or customer data is created or modified. Beta is publicly accessible and noindex is advisory, not access control.

# QA Report — WishingASR v65 Final Audit

## Scope checked
- All 19 HTML documents, 18 friendly public routes, shared CSS/JavaScript, sitemap, robots.txt, Vercel configuration, local images, and release metadata.
- Main product flows: wish generation, calendar/date selection, greeting-card canvas layout, creative tools, saved wishes, copy/share, and the new occasion drone display.
- All 45 occasion and national-day display IDs used by the homepage occasion effects.

## Automated checks
- Static HTML semantics, accessibility labels, image alt text, local links/assets, SEO metadata, sitemap, Vercel routes, security headers and cache rules: PASS.
- JavaScript syntax checks: PASS.
- Calendar and multi-year date data: PASS.
- Greeting-card canvas layout: PASS.
- Creative tools and growth/share flows: PASS.
- Drone renderer test: PASS for all 45 occasion IDs, complete motif-to-formation mapping, friendly captions, accessible parent-stage name, SVG coordinate bounds, viewport resize behaviour, and point limits (24 mobile / 34 tablet / 52 desktop).
- CSS parser: 0 syntax errors (4,192 top-level rules).
- Local HTTP smoke test: all 18 friendly routes and key asset endpoints return HTTP 200; unknown route returns HTTP 404.
- Archive integrity: PASS.

## Performance refinements in this v65 polish
- Drone point count is capped by viewport class.
- Per-drone motion pauses while the hero is outside the viewport.
- Individual points pulse in place rather than drifting, preserving the formation.
- Reduced-motion preferences disable drone and ambient hero animations.
- Removed unused former hero character image assets and legacy character JS hooks.
- Internal asset query strings use `v=65.1` to bypass immutable caching of the earlier v65 package while the public release remains v65.

## Visual/device limitation
Browser-driven visual navigation is blocked by this environment's administrator policy. The HTML/CSS/JS and route checks do not prove pixel-perfect rendering or GPU performance on every physical Android, iOS, tablet and desktop device. Those final visual checks should be performed in a real browser after deployment.

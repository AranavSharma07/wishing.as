# WishingASR v65.11 — QA Report

Date: 2 November 2026

## Work completed

- Reduced the mobile home hero's vertical footprint, so visitors reach the primary message and actions sooner.
- Improved the mobile hierarchy for the drone panel, eyebrow, headline, paragraph, paired CTAs, language note and feature ticker.
- Reduced mobile header and hero glass blur/shadow intensity to limit unnecessary compositing work.
- Phone drone effects now use a coordinated, short glide-in animation with lower point count (20 mobile / 34 tablet / 52 desktop), a shorter stagger and reduced light filters.
- Preserved the 45 occasion-specific point formations, animation profile definitions, labels and resize behavior. On phones, formations remain occasion-specific while the arrival motion is deliberately calmer and consistent.
- Kept IntersectionObserver-based off-screen pausing and prefers-reduced-motion behavior.
- Updated all page asset tokens to `65.11`.

## Automated results

- `qa_static.py`: PASS — HTML semantics/accessibility, local links, unique SEO metadata/canonicals, sitemap coverage, JSON-LD, JS syntax, card/tool exports, saved-wish backup/restore, planner, drone profile, calendar and Vercel routing/security/cache checks.
- `qa_security_static.py`: PASS — same-origin UI script, no executable inline scripts, button types, viewport/image checks, required security headers, immutable script cache.
- 8 Node runtime suites: PASS — drones, shared site UI, calendar render, calendar data/annual rollover, growth helpers, tool core, tool exports, saved-wish/planner/invitation extras.
- `qa_canvas_layout.cjs`: PASS — five export text/signature fit samples.
- CSS parsing: PASS — 2,298 top-level nodes; zero parse errors.
- Drone regression: PASS — 45 occasion IDs, 45 formations and choreography profiles; 20 mobile / 52 desktop points in the tested viewport sizes.
- ZIP integrity: verified with `ZipFile.testzip()` after packaging.

## Verification boundaries

The browser automation environment has previously blocked Chromium navigation, so this release does not claim fresh visual screenshots, Lighthouse scores, Core Web Vitals, real-device frame-rate or measured before/after load-time results. The supplied Android screenshot motivated the layout changes; final visual confirmation should be done on the deployed build on the user's phone.

## Deployment

Upload the contents of this package's `wishingasr_work` directory to the existing Vercel project. The live site remains unchanged until deployment. After deploy, hard-refresh the Android browser once so it requests the `65.11` assets.

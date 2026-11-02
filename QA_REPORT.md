# WishingASR v65 — Final Re-audit & Performance Report
Date: 2 November 2026

## Release identity
- Public version label: `WishingASR v65` (unchanged)
- Asset cache token: existing `65.8`, plus `site-ui.js?v=65.9`
- Source root: `wishingasr_work`

## Final findings and fixes
1. Replaced the homepage calendar's hard-coded `October 2026` HTML placeholder with `Current month`; existing app code updates it to the visitor's local month at runtime. A `<noscript>` hint explains that JavaScript is required for the interactive calendar.
2. Added explicit `type="button"` to 29 static buttons that previously relied on browser defaults.
3. Consolidated 33 executable inline script blocks into one deferred same-origin `site-ui.js`. Structured-data JSON-LD remains intact.
4. Prevented duplicate homepage menu togglers: `app.js` remains the homepage navigation owner; the shared script handles secondary pages.
5. Preserved copyright year updates, secondary-page mobile menu behavior, contact mailto preparation and the Tools-page horizontal-position guard.
6. Removed the previous domain-allowlist CSP from enforcement because the static Vercel deployment cannot provide AdSense-compatible per-response nonces. Other security headers remain in `vercel.json`. See `SECURITY_AUDIT.md`.
7. Retained the upload allowlist/8 MB/80 MP checks and repaired the duplicate image error handler.
8. Kept all 45 occasion-specific drone formations and their unique choreography profiles.

## Automated regression suites
All 8 Node runtime suites passed:
- Calendar data and annual date rollover.
- Calendar rendering and date selection.
- 45 drone occasion profiles, choreography, accessibility labels and responsive particle limits.
- Growth copy helpers.
- Shared site UI controls and duplicate homepage menu guard.
- Tool exports, reminder ICS and quote-card fallback.
- Saved-wish backup/restore, deduplication and personal-date planner.
- 165 wish combinations, 28 caption combinations and saved-wish flows.

The existing `qa_static.py` suite passed: HTML semantics/accessibility, internal links, unique SEO metadata/canonicals, sitemap coverage, JSON-LD syntax, JS syntax, export regressions, reminder planner, drone profiles, calendar, Vercel routes/security/cache rules.

The additional `qa_security_static.py` suite passed:
- 30 pages load exactly one versioned same-origin page UI script.
- No executable inline scripts.
- Explicit button types.
- Viewport/image metadata checks.
- Required security headers.
- Cached `site-ui.js`.
- Five JavaScript syntax checks.

## HTTP / structure
- 30 HTML documents in the package.
- 29 canonical indexable pages included in the sitemap.
- 39/39 tested local routes and key assets returned HTTP 200.
- Unknown route correctly returned HTTP 404.
- CSS parsed with zero syntax errors.
- 12 HTML images checked; all have alt text and explicit dimensions.
- All 30 pages have viewport metadata and exactly one H1.
- No duplicate HTML IDs found.
- No visible form control without a label found.

## Performance profile
Estimated compressed sizes using local gzip level 9 (not a live server measurement):
| Asset | Raw | gzip |
|---|---:|---:|
| styles.css | 388,913 B | 79,027 B |
| app.js | 219,202 B | 63,351 B |
| tools.js | 27,973 B | 10,154 B |
| tools-extras.js | 18,124 B | 5,998 B |
| growth.js | 1,841 B | 851 B |

The site images are already WebP except the 1200×630 social preview JPG. Largest supplied image assets are approximately 105–107 KB; the social preview is approximately 124 KB. Scripts and styles have versioned URLs and immutable Vercel cache rules.

These are asset-size estimates, not Core Web Vitals. Lighthouse, LCP, INP and CLS were not measured.

## Visual / device test limitation
Playwright/Chromium was attempted but the environment blocked local-page navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. Therefore screenshots, visual inspection, real browser console testing and physical Android/iOS tests could not be completed. Responsive CSS and runtime test suites pass, but that is not proof of rendering on every device.

## Live deployment note
A live crawl of `https://wishingasr.vercel.app/` on 2 November 2026 still returned the static calendar heading `October 2026`. This package replaces that stale fallback with `Current month`; the updated files must be deployed to Vercel before the public site reflects the fix.

## Remaining owner/backend tasks
- Deploy this ZIP to the existing Vercel project.
- Verify AdSense loads and ads render after deployment.
- Configure Search Console, Analytics and consent management with the owner's accounts.
- Add a nonce-capable Vercel runtime before enforcing a strict CSP.
- Add a backend for authentication, rate-limiting, malware scanning or consent-based public greeting links, if those features are introduced.

No guarantee of zero bugs, perfect security or Google ranking is made.

# WishingASR v65 — Final Complete Re-audit
Date: 2 November 2026

## Summary
The latest security-hardened SEO V2 source was re-audited. Public version identity remains **WishingASR v65**.

## Fixes included in this re-audit
- Removed stale static calendar text `October 2026`; homepage now uses `Current month` as the HTML fallback, while app code initializes the visitor's actual local month.
- Added a no-JavaScript explanation below the calendar heading.
- Added explicit `type="button"` to 29 static buttons.
- Moved 33 inline JavaScript blocks into one deferred, same-origin, cacheable `site-ui.js`.
- Kept JSON-LD structured data unchanged.
- Added a guard preventing `site-ui.js` from double-binding the homepage navigation already owned by `app.js`.
- Preserved year labels, secondary-page mobile navigation, contact email preparation and the Tools-page horizontal-position guard.
- Kept AdSense-compatible security trade-offs documented: no enforcing domain-allowlist CSP is shipped because the static setup cannot create per-response nonces.
- Preserved all earlier image validation, tools, calendar, SEO and drone improvements.

## Verification
- 8/8 runtime regression suites passed.
- Existing `qa_static.py` passed.
- Additional `qa_security_static.py` passed.
- 30 HTML pages checked.
- 29 canonical indexable pages matched sitemap coverage.
- 39/39 local HTTP routes/assets returned 200.
- Unknown local route returned 404.
- CSS parse errors: 0.
- Five JavaScript files passed Node syntax checks.
- 45 unique occasion drone profiles passed.
- 165 wish combinations and 28 caption combinations passed.
- No duplicate HTML IDs, unlabelled visible form controls, missing viewport tags, missing image alt/dimensions or executable inline scripts were found.

## Performance notes
Stylesheet and application code already use deferred loading and versioned immutable caching. The new shared page script also has an immutable cache rule. The CSS gzip estimate is ~79 KB and app.js gzip estimate is ~63 KB. These are local compression estimates—not a live CDN transfer measurement or Core Web Vitals result.

All five provided raster assets are already WebP except the social-preview JPG. Supplied profile images are approximately 52–107 KB, and the social preview is approximately 124 KB.

## Limitations
- Playwright/Chromium navigation was attempted but blocked with `ERR_BLOCKED_BY_ADMINISTRATOR`.
- No rendered screenshots, live browser-console inspection, physical Android/iOS testing, Lighthouse score, LCP/INP/CLS measurement or penetration test is claimed.
- The public Vercel deployment is not modified by this ZIP. Deploy the source before the public website receives the calendar fallback and shared-script changes.
- No guarantee of zero bugs or perfect operation on every device is possible without real-device and production monitoring.

See `QA_REPORT.md` and `SECURITY_AUDIT.md` for detailed test and security notes.


## Feedback polish — asset build 65.10
The greeting-card export path now warms its fonts in the background and caps any remaining font wait at 280 ms. Download and Share controls show visible busy states, disable duplicate taps, and announce progress. Canvas export yields before starting CPU work, and the blur pass for alternative output sizes is lighter. All page asset cache tokens were bumped to `65.10`. These changes are code-level improvements; physical-device timing has not been measured.

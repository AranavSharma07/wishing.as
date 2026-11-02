# WishingASR v65 — Final Security Re-audit
Date: 2 November 2026

## Implemented in this source package

### Browser and transport protections
The following headers remain configured in `vercel.json`:

- `Strict-Transport-Security: max-age=31536000`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denies camera, microphone, geolocation, clipboard read and payment; clipboard write is limited to the same origin.
- `Cross-Origin-Opener-Policy: same-origin-allow-popups`
- `Cross-Origin-Resource-Policy: same-origin`
- `Origin-Agent-Cluster: ?1`
- `X-Permitted-Cross-Domain-Policies: none`
- `X-Download-Options: noopen`

### Reduced inline JavaScript
- Consolidated the 33 executable inline script blocks into a single deferred, same-origin `site-ui.js`.
- All 30 HTML pages load the shared script once with a versioned URL.
- JSON-LD structured data remains embedded as non-executable `application/ld+json`.
- `site-ui.js` preserves secondary-page navigation, Escape/outside-click close, copyright years, contact email preparation and the existing Tools-page scroll guard.
- The homepage retains its existing `app.js` navigation handler; `site-ui.js` deliberately skips attaching a second toggle handler there.
- Added an immutable cache rule for `/site-ui.js`.

### User-input and photo handling
- Removed a duplicate image `onerror` handler that had overwritten the complete cleanup path.
- Retained the JPG/PNG/WebP allowlist, 8 MB file size limit and decoded-image 80 MP limit.
- Object URLs are revoked on successful load and decoding failure.
- Saved-wish backup restore validates the JSON structure, limits item count and length, deduplicates entries and handles malformed files.
- Dynamic wish and personal-date text is escaped or assigned through `textContent` in the relevant flows.
- All static HTML buttons now have explicit `type` values so they cannot submit a form accidentally.
- All visible form controls have associated labels.

## CSP / AdSense decision

This release does **not** enforce a `Content-Security-Policy` header. The site currently includes Google AdSense. Google's current AdSense guidance says it supports a nonce-based strict CSP and warns that a domain-allowlist policy may disrupt ad serving. This static Vercel setup does not generate a fresh per-response nonce and cannot attach the same nonce to both the response header and all script elements. Enforcing the previous allowlist CSP would risk breaking monetization.

The inline-script consolidation prepares the code for a future strict nonce-based CSP. Implement that only after introducing a Vercel Edge/server runtime that generates a cryptographically random nonce per response, applies it to the response CSP and every trusted script (including AdSense), and tests actual ad delivery.

Official guidance: https://support.google.com/adsense/answer/16283098

## Automated security checks

- 30/30 HTML pages have no executable inline script blocks.
- No inline HTML event-handler attributes found.
- No duplicate HTML IDs found by the static audit.
- All static buttons have explicit types.
- All visible form controls have labels.
- All image elements have alt attributes and width/height dimensions.
- `site-ui.js` runtime regression tests pass, including no duplicate homepage menu toggle.
- JavaScript syntax checks pass for `app.js`, `tools.js`, `tools-extras.js`, `growth.js` and `site-ui.js`.
- `vercel.json` parses successfully and required non-CSP security headers are present.
- Local HTTP tests: 39/39 routes and key assets returned 200; an unknown route returned 404.

## Limitations

- This is a static frontend bundle. It has no app server/API, so server-side authentication, rate limiting, malicious-file scanning, secure public-link storage and server-side abuse controls are not implemented.
- Browser `localStorage` is device-local and is not encrypted storage. Users should avoid saving highly sensitive information, especially on shared devices.
- Google Search Console, Analytics, AdSense account settings and Vercel account settings require owner access.
- This environment blocked Playwright/Chromium navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; no physical-device test, browser-rendered screenshot, live console inspection, Lighthouse run or real penetration test is claimed.
- No claim of zero vulnerabilities or complete security is made.

## Deployment
Deploy the contents of `wishingasr_work` to the existing Vercel project. After deployment, verify the non-CSP response headers and the AdSense script/auction flow in browser DevTools. Keep the public product version at **WishingASR v65**.

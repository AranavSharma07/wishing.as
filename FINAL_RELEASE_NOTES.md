# WishingASR v65 — Final Re-audit Release Notes

- Preserved the public release name `WishingASR v65`.
- Corrected the stale October 2026 calendar fallback to `Current month`; client-side calendar initialization continues to select the visitor's local month.
- Added accessible no-JavaScript calendar guidance.
- Added explicit button types to 29 static buttons.
- Consolidated 33 executable inline script blocks into the deferred shared `site-ui.js`.
- Kept homepage navigation owned by `app.js` to avoid duplicate click handlers.
- Retained all occasion-specific drone motifs/choreography, greeting generator, Tools, saved-wish backup/restore, calendar and export functionality.
- Repaired duplicate photo load-error handling and retained file type/size/pixel validation.
- Retained transport and browser security headers. Did not enforce an AdSense domain-allowlist CSP because Google recommends nonce-based CSP for AdSense and static Vercel cannot generate a per-response nonce.
- Added final static, runtime and HTTP test reports.

See `QA_REPORT.md` and `SECURITY_AUDIT.md` for exact test coverage and limitations.

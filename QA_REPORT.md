# WishingASR v44 — Production QA Report

## Automated checks completed
- `node --check app.js` — pass.
- `node --check tools.js` — pass.
- `node qa_canvas_layout.cjs` — pass for long English/Hindi strings, unbroken text, and long sender signatures.
- `node qa_tools_runtime.cjs` — pass for wish generation/copy/save, invitation and caption placeholder guards, failed-copy feedback, and corrupted local-storage recovery.
- `python qa_static.py` — pass for HTML semantics/accessibility, form labels, image alt text, local references, canonical/social metadata, JavaScript syntax, sitemap XML, route consistency, Vercel security/cache rules and corrected calendar dates.
- `python -m py_compile run_local_preview.py qa_static.py` — pass.
- `node --check` for both production scripts — pass.
- `vercel.json` JSON parse and sitemap XML parse — pass.
- Versioned HTML references — unified to v44.
- Social preview image — 1200 × 630 JPG, under 300 KB.
- Vercel friendly routes — all nine routes retained.
- New `404.html` fallback page added.

## Fixes and improvements in v44
- Corrected next-cycle festival calendar entries for Pongal / Makara Sankranti, Janmashtami, Ganesh Chaturthi, Sharad Navratri and Dussehra.
- Invitation and caption copy buttons now reject placeholder text until content has been generated.
- Legacy clipboard fallback now reports failure when `execCommand('copy')` returns false.
- Saved-wish storage now validates the saved data shape and safely recovers from malformed local storage.
- Added keyboard skip navigation to all main pages.
- Added one consistent Open Graph / Twitter large-image preview across the site.
- Refreshed sitemap `lastmod` values.
- Hardened Vercel response headers and added immutable cache rules for versioned CSS/JS plus revalidation caching for assets.
- Added a branded not-found page.

## Browser testing limitation
A full visual/end-to-end Chromium run could not be completed in this environment: browser navigation is blocked by the runtime with `ERR_BLOCKED_BY_ADMINISTRATOR`, including local HTTP and `file://` pages. The project has deterministic JavaScript tests and static checks, but this is not a substitute for a final live-device pass.

## Live smoke test recommended before promotion
1. Check desktop and phone widths (320, 360, 390, 768, 1024 and 1440 px).
2. Test occasion filters, occasion selection and mobile menu.
3. Generate English, Hindi and Hinglish wishes with short/long content.
4. Export PNG cards with no photo, square photo and portrait/landscape photos.
5. Test share/copy fallback on Android Chrome and Safari/iOS if supported.
6. Test invitation/caption copy, saved wishes, quote-card download and calendar `.ics` download.
7. Confirm religious/regional dates against local panchang because observances can vary by location and tradition.
8. Verify AdSense serving and Google Search Console indexing after deployment.

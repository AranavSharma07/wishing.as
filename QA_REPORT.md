# QA Report — WishingASR v54

## Automated checks
- HTML semantics, one main landmark, unique IDs, H1 count, skip-link targets, form labels and image alt attributes.
- Local asset and route references, canonical/social metadata and external-link security attributes.
- JavaScript syntax for app.js, tools.js and the rigged character module.
- Card canvas layout regression checks.
- Calendar data/date and interaction runtime checks.
- Wish generation, copy/save, invitation and caption runtime checks.
- Vercel rewrites, security headers, asset cache policy, sitemap XML and release cache-version consistency.
- AA Group copyright and WishingASR parent-brand attribution across every HTML page.
- ZIP archive integrity.

## Manual verification still required
The local browser navigation environment blocked Chromium page loads, so this package has not been visually verified in a live browser session. After deployment, inspect the homepage and all secondary pages on a small Android phone, a larger phone, a tablet and desktop. Also verify Google Fonts and jsDelivr availability, WebGL/GPU performance, character hit targets, photo upload and PNG export on the target device.

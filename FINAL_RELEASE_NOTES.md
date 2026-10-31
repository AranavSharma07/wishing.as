# WishingASR v44 Release Notes — 31 October 2026

- Corrected next-cycle dates for Pongal / Makara Sankranti, Janmashtami, Ganesh Chaturthi, Sharad Navratri and Dussehra.
- Prevented placeholder invitation/caption text from being copied before generation.
- Made clipboard fallback feedback truthful when the browser refuses the copy command.
- Added resilient validation for saved-wish local storage and safer clear/remove feedback.
- Added skip-to-content keyboard navigation across the site.
- Added a 1200 × 630 branded social-sharing preview and consistent Open Graph / Twitter large-image metadata.
- Refreshed sitemap modification dates and unified asset cache-busting references to v44.
- Hardened Vercel security headers, added immutable caching for versioned CSS/JavaScript, and revalidation caching for image assets.
- Added a branded 404 page.
- Added repeatable static and runtime QA scripts; browser visual testing remains blocked by this environment's Chromium navigation policy.

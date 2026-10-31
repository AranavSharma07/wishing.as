# WishingASR v44 — Responsive Production Source

Static HTML/CSS/JavaScript site intended for Vercel deployment.

## Deploy
1. Extract the ZIP.
2. Upload the contents of this folder (not the ZIP archive itself) to the root of the GitHub repository.
3. Commit changes and wait for Vercel to deploy.
4. Hard-refresh the site and test the smoke-test list in `QA_REPORT.md`.

## Windows preview
Requires Python 3. Open `START_LOCAL_PREVIEW.bat`. Keep the terminal open and visit the localhost URL printed there. The preview server maps the Vercel-style routes to static files.

## What's in v44
- Fixed real tools bugs involving placeholder copy actions, clipboard fallback reporting and malformed saved-wish storage.
- Corrected upcoming Indian festival calendar entries; regional and lunar observances may still vary.
- Keyboard skip navigation, consistent social-sharing metadata and a branded 1200 × 630 social preview.
- Stronger Vercel security headers and improved static-asset caching.
- Branded 404 page and refreshed sitemap.
- Repeatable static, canvas and tools-runtime QA scripts.

See `QA_REPORT.md` for tests completed and limitations.

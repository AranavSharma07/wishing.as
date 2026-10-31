# WishingASR v43 — Responsive Production Source

Static HTML/CSS/JavaScript site intended for Vercel deployment.

## Deploy
1. Extract the ZIP.
2. Upload the contents of this folder (not the ZIP archive itself) to the root of the GitHub repository.
3. Commit changes and wait for Vercel to deploy.
4. Hard-refresh the site and test the smoke-test list in `QA_REPORT.md`.

## Windows preview
Requires Python 3. Open `START_LOCAL_PREVIEW.bat`. Keep the terminal open and visit the localhost URL printed there. The preview server maps the Vercel-style routes to static files.

## What's in v43
- Shared cache versions across all HTML pages.
- More defensive card wrapping, fitted title/signature text and separated vertical lanes in PNG exports.
- Local photo downscaling to a maximum 1800 px edge to reduce memory use on mobile devices.
- Protection against duplicate card download/share actions.
- Responsive small-screen layouts for cards, creator form, calendar, navigation, quote/tool pages and mobile tap targets.
- Search remains intentionally removed; browse occasions by category.

See `QA_REPORT.md` for tests completed and limitations.

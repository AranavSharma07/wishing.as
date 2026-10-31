# WishingASR v45 — Responsive Production Source

Static HTML/CSS/JavaScript site intended for Vercel deployment.

## Deploy
1. Extract the ZIP.
2. Upload the contents of this folder (not the ZIP archive itself) to the root of the GitHub repository.
3. Commit changes and wait for Vercel to deploy.
4. Hard-refresh the site and test the smoke-test list in `QA_REPORT.md`.

## Windows preview
Requires Python 3. Open `START_LOCAL_PREVIEW.bat`. Keep the terminal open and visit the localhost URL printed there. The preview server maps the Vercel-style routes to static files.

## What's in v45
- Calendar date selection now displays the selected occasion, date and a direct Create wish action. Non-occasion dates provide an Explore occasions action.
- Month arrows, Today navigation, selected-date accessibility and invalid date handling are improved and covered by runtime regression tests.
- Retains v44's tools bug fixes, updated festival dates, SEO/social metadata, keyboard skip navigation, storage safety, Vercel response headers and branded 404 page.

## QA
Run `python qa_static.py` from this folder. It runs static checks plus calendar, tools and card-layout runtime regression checks. The browser-specific checklist and known limitations are in `QA_REPORT.md`.

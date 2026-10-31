# WishingASR v46 — Responsive Production Source

Static HTML/CSS/JavaScript website for Vercel deployment.

## Deploy
1. Extract the ZIP.
2. Upload the contents of this folder (not the ZIP archive itself) to the root of your GitHub repository.
3. Commit changes and wait for Vercel to deploy.
4. Open the Vercel deployment and hard-refresh the site to clear older cached JavaScript.
5. Run the checks listed in `QA_REPORT.md`.

## Windows preview
Requires Python 3. Open `START_LOCAL_PREVIEW.bat`, keep the terminal open and visit the localhost URL it prints.

## What's new in v46
- Critical startup crash fixed by restoring `renderOccasions()` and `fillSelect()`. This restores festival cards, category filters, occasion dropdown options and calendar initialization.
- Added the missing Buddha Purnima calendar date (20 May 2027).
- Calendar date markers, month navigation, Today, selected-event details and Create wish flow are browser-tested.
- Greeting creator, image upload/export, tools, mobile navigation, SEO, routes and security settings are included in the full regression run.

## QA
Run `python qa_static.py` from this folder. It includes static checks plus deterministic calendar, tools and card-layout runtime tests. `QA_REPORT.md` documents the Chromium checks and remaining live-device verification.

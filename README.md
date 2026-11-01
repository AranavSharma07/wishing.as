# WishingASR v55 — AA Group Premium Production Release

WishingASR is a browser-based greeting-card creator and a digital product of AA Group.

## Deploy to Vercel
1. Keep v54 as a backup.
2. Extract this ZIP and open the `wishingasr_work` folder.
3. Replace the contents of the connected GitHub repository root with the contents of this folder.
4. Commit and push; Vercel will build the static site.
5. After deployment, open `https://wishingasr.vercel.app/` and hard-refresh.

## New SEO-friendly guides
- `/diwali-wishes`
- `/birthday-wishes`
- `/christmas-wishes`
- `/holi-wishes`
- `/eid-wishes`
- `/wedding-wishes`
- `/anniversary-wishes`
- `/raksha-bandhan-wishes`

Each page includes original example messages, copy buttons, useful tips, FAQs, related guides and a direct route to create a greeting for that occasion.

## Run local preview
- Windows: run `START_LOCAL_PREVIEW.bat` and open the localhost URL printed in the terminal.
- Python: run `python run_local_preview.py` from this folder.

## Run QA
Run `python qa_static.py`. This validates page structure, control labels, internal files, metadata, structured data markers, JavaScript syntax, runtime regression suites, sitemap, Vercel routes, cache keys and AA Group attribution.

## Important production notes
- WishingASR does not guarantee search rankings or viral reach. Submit the sitemap in Google Search Console and monitor real query data after launch.
- Do not add fake keyword lists or mass-generated thin pages. Keep examples useful and updated.
- Analytics is not configured because no GA4 measurement ID was supplied.
- Third-party font, ad and optional 3D dependencies require network access. Existing local character illustrations remain the fallback.

© AA Group. All rights reserved.

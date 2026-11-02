# WishingASR v65 — source package

WishingASR is a static HTML/CSS/JavaScript wishes and greeting-card platform. This package preserves the public **WishingASR v65** name; `65.8` in asset URLs is only a cache-busting token.

## Local preview

- Windows: double-click `START_LOCAL_PREVIEW.bat`.
- Then open the localhost URL printed in the command window.
- Keep the command window open while testing. Press Ctrl+C to stop.

## Validation

Run `python qa_static.py` from this folder. It checks HTML semantics, labels, links, metadata, canonical/sitemap matching, JSON-LD syntax, Vercel routes, JavaScript syntax and the runtime regression scripts.

## Deployment

Deploy the contents of this folder to the existing Vercel project. Do not change `VERSION.txt` unless intentionally creating a separately named public release. For the SEO V2 implementation scope and limitations, read `SEO_V2_IMPLEMENTATION_REPORT.md`.

## Important notes

- Saved wishes and birthday/anniversary entries are stored locally in the browser. Use the export features before clearing browser storage.
- The planner exports `.ics` events; it is not a background push notification service.
- Uploaded card photos are processed in-browser and are not uploaded by the card creator.
- Public shareable greeting pages require backend storage and explicit consent; they are not part of this static build.

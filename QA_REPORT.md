# WishingASR v45 — QA Report

## Automated checks completed
- `node --check app.js` and `node --check tools.js` — pass.
- `node qa_calendar_runtime.cjs` — pass: month render, occasion markers, accessible selected state, selected event details, Create wish action, empty-date Explore occasions action, invalid-date rejection.
- `node qa_tools_runtime.cjs` — pass: wish generation/copy/save, invitation and caption placeholder guards, failed-copy feedback, malformed local-storage recovery.
- `node qa_canvas_layout.cjs` — pass for long English/Hindi messages, unbroken strings and long sender signatures.
- `python qa_static.py` — pass: HTML semantics/accessibility, labels and local references, SEO/social metadata, JavaScript syntax, calendar interaction contract and dates, sitemap, Vercel routes/security/cache rules.
- `python -m py_compile run_local_preview.py qa_static.py` — pass.
- Asset cache-busting references unified to v45.

## Calendar behaviour now
1. Previous/Next month redraws the correct month and clears stale selection.
2. Today returns to the current month and selects the current date.
3. Selecting an occasion date highlights the day and displays the occasion, date and Create wish button.
4. Selecting a date without an occasion explains that no occasion is listed and offers Explore occasions.
5. Invalid date values are ignored.

## Browser testing limitation
A full visual/end-to-end Chromium run could not be completed in this environment because browser navigation is blocked by the runtime. A browser/device check on Vercel Preview is still recommended before promotion.

## Live-device smoke test
- Check desktop and phone widths (320, 360, 390, 768, 1024 and 1440 px).
- Use previous/next month, Today, an occasion date (for example Diwali) and a date with no occasion.
- Confirm occasion details appear and Create wish opens the creator with the selected occasion.
- Check occasion filters, mobile menu and wish generation in English, Hindi and Hinglish.
- Export PNG cards and test sharing/copy on Android Chrome.
- Confirm religious/regional dates with a local panchang because observances can vary by location and tradition.

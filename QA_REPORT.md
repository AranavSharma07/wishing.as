# WishingASR v46 — QA Report

## Critical bug identified and fixed
The v45 application initializer called `renderOccasions()` and `fillSelect()`, but neither function was defined in `app.js`. This caused `ReferenceError: renderOccasions is not defined` during startup and stopped the rest of initialization. As a result, the calendar, festival cards, occasion dropdown and dependent creator UI did not render. Both functions are now restored, and `qa_static.py` explicitly checks their presence to prevent recurrence.

## Chromium browser tests
Executed against the production HTML, CSS and JavaScript using an inline document harness (direct browser navigation is restricted by this environment).

- Home page startup: pass; zero uncaught page errors.
- Occasion catalog: 32 cards and 32 dropdown options rendered.
- Category filters: all 32; festival 14; national 7; personal 3; love 8.
- Calendar: October 2026 renders 31 dates; next-month navigation to November works; dated events receive markers; event selection reveals details and Create wish; Today returns to current date.
- Creator: select occasion, personalize recipient/sender, change language/tone/length/style and generate greeting — pass.
- Image: choose a local photo, render preview, remove photo and export PNG — pass.
- Responsive checks: 390 px mobile and 768 px tablet interactive run pass; desktop 1440 px startup/rendering visual check pass.
- Mobile navigation opens and closes with Escape — pass.
- Tools page: greeting generation, save wish, invitation, caption, ICS reminder, quote-card PNG, celebration-page HTML and preferences — pass.
- Other pages: 404, About, Blog, Contact, National Days, Privacy, Quotes and Terms — smoke-tested; headings and mobile navigation work; zero page errors.

## Static / runtime checks
- `node --check app.js` and `node --check tools.js` — pass.
- `node qa_calendar_runtime.cjs` — pass.
- `node qa_tools_runtime.cjs` — pass.
- `node qa_canvas_layout.cjs` — pass.
- `python qa_static.py` — pass.
- Python compilation — pass.
- CSS parse — 1,828 rules, zero top-level parse errors.
- Local HTTP route/asset smoke checks — 18/18 HTTP 200.
- ZIP integrity — verified.

## Calendar and date data
- Diwali 2026: 8 November 2026.
- Chhath Puja 2026: 16 November 2026.
- Buddha Purnima 2027: 20 May 2027.
- Janmashtami, Ganesh Chaturthi, Navratri and Dussehra 2027: included with dates from the current India calendar checks. Lunar observances (such as Eid) may vary with moon sighting and local tradition; confirm locally nearer the date.

## Deployment note
The ZIP is a static source package, not a live deployment. After uploading to GitHub and redeploying on Vercel, hard-refresh or clear cached site data so `?v=46` assets load. A final check on the live Vercel Preview using a physical Android device and desktop is still recommended.

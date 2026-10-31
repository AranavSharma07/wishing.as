# WishingASR v43 — QA Report

## Automated checks completed in this environment
- `node --check app.js` — pass.
- `node --check tools.js` — pass.
- `node qa_canvas_layout.cjs` — pass using a mock canvas context for long English/Hindi strings, unbroken text, and long sender signatures; all generated lines remained inside their configured safe width.
- Python compile check for `run_local_preview.py` — pass.
- XML parse of `sitemap.xml` — pass.
- JSON parse of `vercel.json` — pass.
- HTML parse for all root HTML files — pass.
- Duplicate HTML IDs — none found in the root HTML files.
- Broken local file references — none found in the root HTML files (Vercel friendly routes are mapped in `vercel.json`).
- CSS and JS cache versions — unified to v43 for all occurrences.
- Local HTTP smoke test for `/`, all nine friendly routes, asset retrieval, and `HEAD /create` — pass.
- Archive integrity — check after packaging.

## Code-level improvements
- Card PNG layout uses uncapped wrapping before choosing a title size, then caps extreme titles only after reducing font size.
- Message wrapping preserves explicit newlines and measures grapheme clusters.
- Signature text is fitted to a safe width before drawing.
- Failed photo decoding falls back to a safe title position; selected photos are resized locally to reduce memory load.
- Duplicate card export/share actions are guarded while a card is being rendered/shared.
- CSS adds responsive layout handling for narrow phones, tablets and desktops, keyboard/touch controls and reduced motion.

## Not certified yet
Automated browser interaction tests could not be executed because browser navigation is blocked by this environment (`ERR_BLOCKED_BY_ADMINISTRATOR`). That means card PNGs were not visually rendered and checked here, and clicks/sharing were not tested end-to-end in a real browser. This report does **not** claim that every feature has passed on every device. Before public promotion, smoke-test:
1. Category filters and occasion card selection.
2. Generator in English, Hindi and Hinglish with short and long messages.
3. PNG export with no photo, with a square photo and with a wide/tall photo. Check the downloaded PNG for truncation/overlap.
4. Share/copy fallback.
5. Remove photo and regenerate.
6. Calendar month controls and upcoming occasion buttons.
7. Tools and Quotes page generation/download.
8. Navigation routes `/create`, `/quotes`, `/national-days`, `/blog`, `/tools`, `/about`, `/contact`, `/privacy`, `/terms`.
9. Responsive layout at widths 320, 360, 390, 768, 1024 and 1440 px.

# WishingASR v43 Release Notes

- Unified `styles.css`, `app.js`, and `tools.js` cache versions to v43 where those assets are used.
- Kept search removed per request; occasion filtering remains available.
- Improved PNG title fit so it reduces font size before truncating and allows up to four title lines.
- Preserved manual line breaks in messages when calculating canvas text wrapping.
- Increased robust body wrapping range and kept signature/footer in separate reserved lanes.
- Fitted long sender signatures to a safe width.
- Moved centered decorative motifs away from the header/message area and narrowed exported text lanes so side decorations do not mix with copy.
- Downscaled selected photos client-side before preview/export to improve memory and performance.
- Prevented simultaneous duplicate card downloads/shares.
- Tightened responsive behavior, particularly 320–480 px phones, form controls, category cards, card style picker, calendar, preview action buttons, and page grids.

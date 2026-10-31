# WishingASR v45 Release Notes — 31 October 2026

- Fixed the calendar interaction gap: selecting an occasion date now opens visible occasion details and a direct Create wish action.
- Selecting a date without a listed occasion now shows a clear explanation and an Explore occasions action instead of an unhelpful toast-only response.
- Added accessible selected-state feedback (`aria-pressed`), full date labels, focus-visible styling, and a calendar selection live region.
- Improved month navigation: changing month clears stale date selection; Today returns to the current month and selects today's date.
- Added validation to reject malformed/impossible calendar dates.
- Updated asset cache-busting references to v45.
- Retained all v44 fixes: festival date corrections, tools copy guards, resilient saved-wish storage, skip navigation, social preview metadata, hardened Vercel headers, branded 404, and refreshed sitemap.
- Added deterministic calendar runtime regression coverage for month rendering, event markers, selected state, event details, create action, empty-date path, and invalid-date guard.
- Browser visual testing remains environment-limited; localhost HTTP smoke tests and automated code-level tests are included.

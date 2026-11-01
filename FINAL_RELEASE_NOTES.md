# WishingASR v63 — Navigation & Wish Form Overlap Fix

## Fixes based on the supplied v61 screenshot
- Prevented the Home navigation item from colliding with the WishingASR brand.
- Added a compact navigation mode below 1280px using the existing hamburger menu and `.open` state.
- Kept the desktop navigation in its own flex area with non-overlapping brand and nav regions.
- Rebuilt the wish creator form grid with explicit minmax(0,1fr) columns, full-width controls and safe box sizing.
- Switched the form to a single-column field layout on narrow mobile screens.
- Improved the occasion selector step layout to prevent label/control squeezing.
- Kept preview column responsive and prevented horizontal overflow.
- Standardized local CSS/JS cache query versions to v63.

## Preserved
- All previous pages, AA Group branding, AS portrait, 20 card styles, 9 tools, character illustrations, seasonal themes, calendar, wish generation, photo upload, PNG export and sharing.

## Validation
- Existing static and runtime regression suites retained and run.
- CSS parsing and ZIP integrity checked.
- Browser-driven visual testing and physical-device verification remain necessary.

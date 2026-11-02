# WishingASR v65 — Occasion Drone Light Show (Final Polish)

## Drone-show refinements from the complete v65 audit
- Replaced the original dot-to-dot wireframe links with clean, isolated drone lights.
- Added a dedicated Raksha Bandhan formation rather than falling back to a generic star.
- Corrected captions to use friendly occasion names rather than raw IDs.
- Added individual colour palettes and formation mappings for all 45 occasion/national-day animation themes.
- Added themed formations for Diwali, Christmas, Holi, Eid, New Year, birthdays, weddings, Valentine's occasions, Raksha Bandhan, harvest festivals, national days and more.
- Added responsive drone-point limits: 24 mobile, 34 tablet, 52 desktop.
- Added viewport-resize handling to redraw at the correct point limit.
- Pauses drone animations when the hero leaves the viewport and respects reduced-motion preferences.
- Updated accessibility: the SVG is decorative and the parent stage receives the current occasion-specific accessible name.
- Removed the unused former homepage character images from deployed assets.
- Removed obsolete character caption/prop hooks and updated the local preview server label.

## Performance and cache delivery
- Kept the public release version at v65.
- Set local asset query strings to `v=65.1` to avoid immutable-cache reuse of the earlier v65 build while preserving the public version number.
- Kept the drone fleet under 24 points on phones and 34 on tablets, with a 52-point desktop cap.
- Pauses per-drone animations while the stage is outside the viewport.

## Preserved
- Existing pages, SEO guides, AA Group/AS profile, wish builder, calendar, 20 greeting-card styles, 9 creative tools, sharing and PNG export.

## Validation
- Static HTML/SEO/accessibility/route checks pass.
- Calendar, canvas, tools, growth/share, calendar-data, and new drone rendering runtime suites pass.
- CSS parser reports zero syntax errors.
- Local HTTP smoke tests return 200 for all 18 friendly routes and key assets; invalid route returns 404.
- Archive integrity verified.
- Browser-rendered screenshot testing is blocked by the environment administrator policy; physical device verification remains necessary.

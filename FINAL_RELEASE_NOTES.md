# WishingASR v46 Release Notes — 31 October 2026

## Critical startup fix
- Restored the missing `renderOccasions()` and `fillSelect()` functions used by the application initializer. Their absence caused a `ReferenceError` during startup, preventing calendar, festival cards, dropdown options and dependent creator UI from rendering.
- Added static regression guards requiring both startup functions to exist, so this failure is caught before a release.

## Calendar and occasion data
- Added the missing Buddha Purnima date for 20 May 2027.
- Retained corrected 2027 dates for Pongal, Janmashtami, Ganesh Chaturthi, Navratri and Dussehra.
- Preserved month navigation, Today selection, marked festival dates, visible event details and the direct Create wish action.

## Whole-site verification and polish
- Tested home-page startup, 32 occasion cards, all category filters, occasion dropdown, calendar navigation and event selection in Chromium.
- Tested greeting generation in English, Hindi and Hinglish, photo upload/removal and PNG export.
- Tested Tools page generation, saved wishes, invitations, captions, reminders, quote-card export and celebration-page export.
- Smoke-tested all static pages, mobile navigation, JavaScript syntax, CSS parsing, local asset/routes, SEO metadata, Vercel headers and ZIP integrity.
- Corrected SEO wording so 32 curated occasions are not inaccurately described as 32 festivals.
- Bumped asset cache keys to v46.

## QA note
Chromium tests ran against the production HTML, CSS and JavaScript with an inline document harness because direct browser navigation is restricted in this environment. Local HTTP route/asset smoke checks also passed. Verify the deployed Vercel Preview on a real Android device and desktop before production promotion.

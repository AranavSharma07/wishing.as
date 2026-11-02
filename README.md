# WishingASR v65 — AA Group Drone Light Show Release

WishingASR is a digital product of AA Group. This static site includes personalised wishes in English, Hindi and Hinglish, 20 greeting-card styles, local photo processing, PNG export, an occasion calendar, creative tools, SEO guide pages, social sharing, a dedicated AA Group company page, and a responsive occasion-themed drone light show in place of the former homepage character illustrations.

## AA Group page
- Public route: `/aa-group`
- Owner display: `AS` with the approved public profile portrait.
- Existing team portraits remain compact and scaled by their stated roles.

## Drone light show
- 45 occasion/national-day formations are covered by the drone renderer.
- Formation updates when users select a new occasion.
- Mobile, tablet and desktop point limits are applied, with responsive re-rendering after resize.
- Drone animations pause when the hero is outside the viewport and respect reduced-motion preferences.
- The light show is a browser-based SVG animation, not a real drone-control system.

## Local preview
- Windows: run `START_LOCAL_PREVIEW.bat`.
- Python: run `python run_local_preview.py`.

## Deployment
Upload the contents of `wishingasr_work` to the GitHub repository root connected to Vercel. Vercel uses the included `vercel.json` rewrites for friendly routes.

## Privacy and operation
Photos are resized and composed in the browser. The site does not have a server-side account or photo storage service. Google Fonts and Google AdSense may be requested according to their scripts/settings. Review `privacy.html` and `terms.html`.

## Parent company notice
© 2026 AA Group. All rights reserved. WishingASR is a product of AA Group.

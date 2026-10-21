# Deepotsav — Complete Responsive Website

A fresh static website rebuild for Deepotsav, designed to make festival and personal-occasion themes update consistently from a single selected occasion.

## Features
- One shared occasion data source for theme, hero copy, Hindi/English labels, icons, wish text, preview, and card download.
- Theme changes across the full site via `body[data-theme]` CSS variables. Select any occasion card or change the greeting selector to update the whole experience immediately.
- Festival calendar with month navigation, today's marker, configured festival dates, and upcoming list.
- Original greeting templates for festivals, birthday, wedding, anniversary, and all eight Valentine’s Week days.
- English/Hindi messages and tone choices (heartfelt, short, poetic, formal, playful, romantic, devotional).
- Personalization with recipient/sender names and custom message.
- Optional photo processed locally in browser; creates a PNG greeting card using canvas.
- Download and supported share options with fallback to download/copy.
- Responsive mobile menu, responsive grid and calendar, keyboard focus, reduced-motion support.
- Co-founder profiles for Aranav Sharma and Ritik Yadav.
- About section, Contact, Privacy Policy, Terms of Use, and `ads.txt`.
- AdSense loader retained: `ca-pub-7274245941888092`.

## Deploy
1. Upload the contents of this folder to your static host or to the root of the GitHub repository connected to Vercel.
2. Confirm `index.html`, `app.js`, `styles.css`, `assets/`, and `ads.txt` are at the site root (do not deploy an extra nested folder unless your Vercel root directory is set to it).
3. Redeploy on Vercel. After deployment, open the live site in a private/incognito tab or hard refresh.
4. Verify `https://YOUR-DOMAIN/ads.txt` and the live CSS/JS files load.

## Important notes
- Calendar dates are illustrative/configured dates and may differ by region, local panchang, or annual observance. Confirm dates before publishing or planning events. The website has no live festival feed.
- Automatic theme selection uses a configured event date for today's local date; when no configured occasion matches, it falls back to Diwali. Manual selection changes the whole theme immediately and is remembered for the current browser tab session.
- The contact form opens the visitor's default email app; there is no server-side email service.
- The greeting image is generated locally. Sharing files requires browser support; otherwise, the image downloads and the user can attach it manually.
- AdSense loader presence does not mean the site is approved or ads will serve. Approval, consent requirements, ads.txt status, and ad units must be completed in AdSense.

## Local testing
Open `index.html` in a modern browser or serve the folder using any static server. For the most accurate local test, use a static server instead of `file://`, because browsers may restrict some APIs on file URLs.

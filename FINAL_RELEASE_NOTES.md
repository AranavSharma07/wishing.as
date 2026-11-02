# WishingASR v65.11 — Mobile Hero & Natural Motion Polish

## Feedback addressed
- Reduced the height and visual weight of the drone showcase on mobile so the greeting headline, description and actions appear sooner.
- Tightened mobile hero spacing and reduced heavy glass blur/shadow effects in the header, drone panel, note and feature ticker.
- Kept the two primary actions in a balanced, equal-width row and improved compact-screen typography and tap-target sizing.
- Made mobile drone formations arrive with a shorter, coordinated, low-overshoot glide; reduced mobile drone count to 20 and removed expensive per-light filters on small screens.
- Preserved the individual celebration formations and desktop/tablet occasion-specific animation profiles.
- Retained off-screen animation pausing and added explicit reduced-motion behavior for the new mobile motion.
- Bumped static asset cache version to 65.11.

## Validation
- Run the supplied static, security and Node runtime QA suites before release.
- Browser-based visual/Lighthouse testing and real-device performance timing are not claimed in this package; verify on the deployed Android phone after deployment.

## Deployment
Upload the contents of this folder to the existing WishingASR Vercel project. The live website will not change until this build is deployed.

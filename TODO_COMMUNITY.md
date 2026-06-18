# TODO: Community links

## Goal
Make the footer Community links (Birth Clubs / Forums / App Download) work without errors.

## Current state
- Footer links in `mamasafe/frontend/index.html` call `openCommunitySection('birth-clubs'|'forums'|'app-download')`.
- `openCommunitySection()` was not found/implemented in the front-end script.

## Steps
1. Add `window.openCommunitySection = function(sectionId) { ... }` in `mamasafe/frontend/script-new.js`.
2. Implement DOM rendering for the chosen community section.
3. Add minimal markup sections if missing.
4. Ensure it doesn't conflict with existing `navigateTo()`.
5. Quick manual test in browser.


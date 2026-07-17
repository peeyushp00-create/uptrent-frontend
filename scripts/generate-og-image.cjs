// One-off script to render public/socialrum-og-image.png from an HTML
// design using Playwright's Chromium (already a project dependency).
// Run with: node scripts/generate-og-image.cjs
// Safe to delete after the image is generated — not part of the app build.
const path = require('path');
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file://' + path.resolve(__dirname, 'og-image-source.html'));
  await page.waitForTimeout(300); // let the web font finish loading
  await page.screenshot({ path: path.resolve(__dirname, '../public/socialrum-og-image.png') });
  await browser.close();
  console.log('Wrote public/socialrum-og-image.png');
})();

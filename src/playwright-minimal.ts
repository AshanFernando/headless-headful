import { chromium } from 'playwright';

(async () => {
  try {
    console.log('Launching Chromium...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://www.wikipedia.org');
    console.log('Page loaded.');
    await browser.close();
    console.log('Browser closed successfully.');
  } catch (err) {
    console.error('Minimal Playwright test failed:', err);
    process.exit(1);
  }
})(); 
const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport for a nice desktop screenshot
  await page.setViewport({ width: 1440, height: 900 });

  const artifactDir = process.argv[2] || '.';

  const takeScreenshot = async (url, filename) => {
    console.log(`Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      // Wait a bit for animations/data
      await new Promise(r => setTimeout(r, 2000));
      const path = `${artifactDir}/${filename}`;
      await page.screenshot({ path });
      console.log(`Saved screenshot to ${path}`);
    } catch (e) {
      console.error(`Failed to screenshot ${url}:`, e.message);
    }
  };

  const baseUrl = 'http://localhost:3000';
  await takeScreenshot(baseUrl, 'landing_page_real.png');
  await takeScreenshot(`${baseUrl}/dashboard`, 'dashboard_real.png');
  await takeScreenshot(`${baseUrl}/dashboard/agreements`, 'agreements_real.png');
  await takeScreenshot(`${baseUrl}/dashboard/templates`, 'templates_real.png');

  await browser.close();
  console.log('Done.');
})();

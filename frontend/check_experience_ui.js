const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/experiences/private-chef', { waitUntil: 'networkidle' });
  const el = await page.$('[data-testid="experience-detail-page"]');
  if (!el) {
    console.error('ERROR: data-testid not found');
    console.log('Title:', await page.title());
    const body = await page.content();
    console.log(body.slice(0, 2000));
    await browser.close();
    process.exit(2);
  }
  await page.screenshot({ path: '/tmp/experience-detail.png', fullPage: true });
  console.log('SCREENSHOT:/tmp/experience-detail.png');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

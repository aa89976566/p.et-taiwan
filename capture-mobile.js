const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // 設置為 iPhone 12 Pro 尺寸
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  
  // 訪問頁面
  await page.goto('https://8000-imypepcd5p01jtz1siner-0e616f0a.sandbox.novita.ai/pet-select.html', {
    waitUntil: 'networkidle0'
  });
  
  // 等待視頻加載
  await page.waitForTimeout(2000);
  
  // 截圖
  await page.screenshot({
    path: 'mobile-preview.png',
    fullPage: false
  });
  
  console.log('✅ 手機預覽截圖已生成：mobile-preview.png');
  
  await browser.close();
})();

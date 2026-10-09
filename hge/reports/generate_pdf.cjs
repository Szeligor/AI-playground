const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const htmlPath = path.resolve(__dirname, 'bug_report.html');
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'));
  
  const pdfPath = path.resolve(__dirname, 'BUG_REPORT.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm'
    }
  });

  console.log('PDF generated at:', pdfPath);
  await browser.close();
})();

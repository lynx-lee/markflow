import puppeteer from 'puppeteer';
import { marked } from 'marked';

export class PdfService {
  async convert(markdownContent: string, title: string = 'Document'): Promise<Buffer> {
    const htmlContent = await marked.parse(markdownContent);

    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      line-height: 1.8;
      color: #1a1a1a;
      padding: 40px;
    }
    
    h1 { font-size: 28px; margin: 24px 0 16px; border-bottom: 2px solid #333; padding-bottom: 8px; }
    h2 { font-size: 22px; margin: 20px 0 12px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
    h3 { font-size: 18px; margin: 16px 0 8px; }
    h4 { font-size: 16px; margin: 12px 0 6px; }
    
    p { margin: 8px 0; }
    
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
    }
    
    pre {
      background: #282c34;
      color: #abb2bf;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 12px 0;
    }
    
    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 10px 14px;
      text-align: left;
    }
    
    th {
      background: #f5f7fa;
      font-weight: 700;
    }
    
    tr:nth-child(even) { background: #fafafa; }
    
    blockquote {
      border-left: 4px solid #4a90d9;
      margin: 12px 0;
      padding: 8px 16px;
      background: #f8f9fa;
      color: #555;
    }
    
    ul, ol { padding-left: 24px; margin: 8px 0; }
    li { margin: 4px 0; }
    
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 24px 0;
    }
    
    img { max-width: 100%; }
    
    a { color: #4a90d9; text-decoration: none; }
  </style>
</head>
<body>${htmlContent}</body>
</html>`;

    const launchOptions: any = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };

    // 容器环境使用系统安装的 Chromium
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size:9px; width:100%; text-align:center; color:#999;">
            ${title}
          </div>`,
        footerTemplate: `
          <div style="font-size:9px; width:100%; text-align:center; color:#999;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>`,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}

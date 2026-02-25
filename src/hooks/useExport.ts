import { useCallback } from 'react';
import { saveAs } from 'file-saver';
import { useEditorStore } from '../stores/editorStore';
import { exportApi } from '../services/export.api';

type ExportFormat = 'docx' | 'xlsx' | 'pdf' | 'html' | 'md';

export function useExport() {
  const { content } = useEditorStore();

  const exportDocument = useCallback(
    async (format: ExportFormat, fileName: string) => {
      if (format === 'md') {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, `${fileName}.md`);
        return;
      }

      if (format === 'html') {
        const { marked } = await import('marked');
        const htmlContent = await marked.parse(content);
        const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    body { 
      max-width: 800px; margin: 0 auto; padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6; color: #333;
    }
    h1, h2, h3 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    img { max-width: 100%; }
  </style>
</head>
<body>${htmlContent}</body>
</html>`;
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        saveAs(blob, `${fileName}.html`);
        return;
      }

      try {
        const response = await exportApi.export({
          content,
          format,
          fileName,
        });

        const mimeTypes: Record<string, string> = {
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          pdf: 'application/pdf',
        };

        const blob = new Blob([response.data], { type: mimeTypes[format] });
        saveAs(blob, `${fileName}.${format}`);
      } catch (error) {
        console.error(`Export to ${format} failed:`, error);
        throw error;
      }
    },
    [content]
  );

  return { exportDocument };
}

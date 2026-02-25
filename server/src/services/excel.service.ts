import ExcelJS from 'exceljs';
import { marked } from 'marked';

interface TableData {
  headers: string[];
  rows: string[][];
  title?: string;
}

export class ExcelService {
  async convert(markdownContent: string, fileName: string = 'Document'): Promise<Buffer> {
    const tables = this.extractTables(markdownContent);
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'MarkFlow';
    workbook.created = new Date();

    if (tables.length === 0) {
      const sheet = workbook.addWorksheet('文档内容');
      this.writeContentAsText(sheet, markdownContent);
    } else {
      tables.forEach((table, index) => {
        const rawName = table.title || `表格 ${index + 1}`;
        const sheetName = this.sanitizeSheetName(rawName);
        const sheet = workbook.addWorksheet(sheetName);
        this.writeTable(sheet, table);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private extractTables(markdown: string): TableData[] {
    const tokens = marked.lexer(markdown);
    const tables: TableData[] = [];
    let lastHeading = '';

    for (const token of tokens) {
      if (token.type === 'heading') {
        lastHeading = (token as any).text;
      }

      if (token.type === 'table') {
        const tableToken = token as any;

        const headers = tableToken.header.map((cell: any) =>
          this.stripMarkdown(cell.text || this.extractText(cell.tokens))
        );

        const rows = tableToken.rows.map((row: any[]) =>
          row.map((cell: any) =>
            this.stripMarkdown(cell.text || this.extractText(cell.tokens))
          )
        );

        tables.push({
          headers,
          rows,
          title: lastHeading || undefined,
        });
      }
    }

    return tables;
  }

  private extractText(tokens: any[]): string {
    if (!tokens) return '';
    return tokens.map((t: any) => t.text || t.raw || '').join('');
  }

  /**
   * 移除文本中的 Markdown 标记，保留纯文本内容
   */
  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')   // ***粗斜体***
      .replace(/\*\*(.*?)\*\*/g, '$1')         // **粗体**
      .replace(/\*(.*?)\*/g, '$1')             // *斜体*
      .replace(/~~(.*?)~~/g, '$1')             // ~~删除线~~
      .replace(/`(.*?)`/g, '$1')               // `行内代码`
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [链接](url)
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // ![图片](url)
      .replace(/<[^>]+>/g, '')                  // <html标签>
      .trim();
  }

  private writeTable(sheet: ExcelJS.Worksheet, table: TableData): void {
    const headerRow = sheet.addRow(table.headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12,
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    table.rows.forEach((row, rowIndex) => {
      const dataRow = sheet.addRow(row);
      dataRow.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (rowIndex % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F7FB' },
          };
        }
      });
    });

    sheet.columns.forEach((column, colIndex) => {
      let maxLength = table.headers[colIndex]?.length || 10;
      table.rows.forEach((row) => {
        const cellLength = row[colIndex]?.length || 0;
        if (cellLength > maxLength) maxLength = cellLength;
      });
      column.width = Math.min(Math.max(maxLength + 4, 12), 50);
    });

    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    if (table.headers.length > 0) {
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: table.headers.length },
      };
    }
  }

  /**
   * 清理工作表名称：移除 Markdown 标记和 Excel 非法字符，截断至 31 字符
   */
  private sanitizeSheetName(name: string): string {
    return name
      .replace(/\*\*/g, '')        // 移除 Markdown 粗体 **
      .replace(/\*/g, '')          // 移除 Markdown 斜体 *
      .replace(/[?:\\/\[\]]/g, '') // 移除 Excel 非法字符
      .replace(/\s+/g, ' ')       // 合并多余空格
      .trim()
      .substring(0, 31) || 'Sheet';
  }

  private writeContentAsText(sheet: ExcelJS.Worksheet, content: string): void {
    const lines = content.split('\n');

    sheet.getColumn(1).width = 100;

    lines.forEach((line) => {
      const row = sheet.addRow([line]);
      const cell = row.getCell(1);

      if (line.startsWith('# ')) {
        cell.font = { bold: true, size: 18 };
        cell.value = line.replace(/^#+\s/, '');
      } else if (line.startsWith('## ')) {
        cell.font = { bold: true, size: 16 };
        cell.value = line.replace(/^#+\s/, '');
      } else if (line.startsWith('### ')) {
        cell.font = { bold: true, size: 14 };
        cell.value = line.replace(/^#+\s/, '');
      }
    });
  }
}

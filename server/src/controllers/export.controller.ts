import { Request, Response, NextFunction } from 'express';
import { WordService } from '../services/word.service';
import { ExcelService } from '../services/excel.service';
import { PdfService } from '../services/pdf.service';

export class ExportController {
  private wordService = new WordService();
  private excelService = new ExcelService();
  private pdfService = new PdfService();

  exportDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { content, format, fileName } = req.body;

      if (!content || !format) {
        res.status(400).json({ error: '缺少必要参数: content, format' });
        return;
      }

      let buffer: Buffer;
      let contentType: string;
      let extension: string;

      switch (format) {
        case 'docx':
          buffer = await this.wordService.convert(content, fileName);
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          extension = 'docx';
          break;

        case 'xlsx':
          buffer = await this.excelService.convert(content, fileName);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          break;

        case 'pdf':
          buffer = await this.pdfService.convert(content, fileName);
          contentType = 'application/pdf';
          extension = 'pdf';
          break;

        default:
          res.status(400).json({ error: `不支持的格式: ${format}` });
          return;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileName)}.${extension}"`
      );
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}

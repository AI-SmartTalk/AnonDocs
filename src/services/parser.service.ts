import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export class ParserService {
  /**
   * Parse document based on mime type
   */
  async parseDocument(filePath: string, mimeType: string): Promise<string> {
    switch (mimeType) {
      case 'application/pdf':
        return this.parsePdf(filePath);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.parseDocx(filePath);
      case 'text/plain':
        return this.parseTxt(filePath);
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  private async parsePdf(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  private async parseDocx(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  private async parseTxt(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }
}

export const parserService = new ParserService();

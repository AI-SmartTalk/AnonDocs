import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { parseString, Builder } from 'xml2js';
import { promisify } from 'util';
import { PiiReplacement } from './llm.service';

const parseXml = promisify(parseString);

export class DocxFormatterService {
  private downloadsDir: string;

  constructor(downloadsDir = './downloads') {
    this.downloadsDir = downloadsDir;
    this.ensureDownloadsDirectory();
  }

  private ensureDownloadsDirectory(): void {
    if (!fs.existsSync(this.downloadsDir)) {
      fs.mkdirSync(this.downloadsDir, { recursive: true });
    }
  }

  /**
   * Anonymize a DOCX file using precise PII replacements
   * Preserves ALL formatting by replacing text directly in XML nodes
   */
  async anonymizeDocx(
    inputPath: string,
    replacements: PiiReplacement[]
  ): Promise<{ filePath: string; filename: string }> {
    try {
      console.log('[DOCX] Starting anonymization with', replacements.length, 'replacements');

      // Read the original DOCX
      const data = fs.readFileSync(inputPath);
      const zip = await JSZip.loadAsync(data);

      // Extract document.xml
      const documentXml = await zip.file('word/document.xml')?.async('string');
      if (!documentXml) {
        throw new Error('Invalid DOCX file: word/document.xml not found');
      }

      // Parse XML
      const parsedXml = await parseXml(documentXml);

      // Apply replacements directly to text nodes
      this.applyReplacementsToXml(parsedXml, replacements);

      // Convert back to XML
      const builder = new Builder();
      const newDocumentXml = builder.buildObject(parsedXml);

      // Update the zip
      zip.file('word/document.xml', newDocumentXml);

      // Generate output file
      const filename = `anonymized-${Date.now()}-${Math.round(Math.random() * 1e9)}.docx`;
      const outputPath = path.join(this.downloadsDir, filename);

      // Write the new DOCX
      const buffer = await zip.generateAsync({ type: 'nodebuffer' });
      fs.writeFileSync(outputPath, buffer);

      console.log('[DOCX] Anonymization complete:', filename);
      return { filePath: outputPath, filename };
    } catch (error) {
      console.error('[DOCX] Error anonymizing:', error);
      throw error;
    }
  }

  /**
   * Extract all text nodes from the parsed XML with their positions
   * Adds line breaks between paragraphs
   */
  private extractTextNodes(
    obj: any,
    textNodes: any[] = [],
    path: string[] = [],
    lastWasParagraph = false
  ): any[] {
    if (!obj || typeof obj !== 'object') {
      return textNodes;
    }

    // Check if we're at a paragraph boundary (w:p)
    // Add a line break after each paragraph
    if ('w:p' in obj) {
      // Process the paragraph content first
      const paragraphContent = obj['w:p'];
      if (Array.isArray(paragraphContent)) {
        paragraphContent.forEach((item, index) => {
          this.extractTextNodes(item, textNodes, [...path, 'w:p', `[${index}]`], false);
        });
      } else {
        this.extractTextNodes(paragraphContent, textNodes, [...path, 'w:p'], false);
      }

      // Add line break after paragraph
      const currentPos = textNodes.reduce((sum, node) => sum + node.text.length, 0);
      textNodes.push({
        text: '\n',
        startPos: currentPos,
        endPos: currentPos + 1,
        xmlPath: [...path, '__PARAGRAPH_BREAK__'],
      });

      return textNodes;
    }

    // Check if we found a w:t element (text node)
    if ('w:t' in obj) {
      const textContent = obj['w:t'];

      // Handle both string and array cases
      if (Array.isArray(textContent)) {
        textContent.forEach((item, index) => {
          if (typeof item === 'string') {
            const currentPos = textNodes.reduce((sum, node) => sum + node.text.length, 0);
            textNodes.push({
              text: item,
              startPos: currentPos,
              endPos: currentPos + item.length,
              xmlPath: [...path, 'w:t', `[${index}]`],
            });
          } else if (typeof item === 'object' && item._) {
            const text = item._;
            const currentPos = textNodes.reduce((sum, node) => sum + node.text.length, 0);
            textNodes.push({
              text,
              startPos: currentPos,
              endPos: currentPos + text.length,
              xmlPath: [...path, 'w:t', `[${index}]`],
            });
          }
        });
      } else if (typeof textContent === 'string') {
        const currentPos = textNodes.reduce((sum, node) => sum + node.text.length, 0);
        textNodes.push({
          text: textContent,
          startPos: currentPos,
          endPos: currentPos + textContent.length,
          xmlPath: [...path, 'w:t'],
        });
      } else if (typeof textContent === 'object' && textContent._) {
        const text = textContent._;
        const currentPos = textNodes.reduce((sum, node) => sum + node.text.length, 0);
        textNodes.push({
          text,
          startPos: currentPos,
          endPos: currentPos + text.length,
          xmlPath: [...path, 'w:t'],
        });
      }
    }

    // Recursively traverse the object
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        this.extractTextNodes(item, textNodes, [...path, `[${index}]`], lastWasParagraph);
      });
    } else {
      Object.keys(obj).forEach((key) => {
        this.extractTextNodes(obj[key], textNodes, [...path, key], lastWasParagraph);
      });
    }

    return textNodes;
  }

  /**
   * Apply PII replacements directly to XML text nodes
   * Recursively walks the XML tree and replaces text in <w:t> nodes
   */
  private applyReplacementsToXml(obj: any, replacements: PiiReplacement[]): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // If we found a w:t element (text node), replace text
    if ('w:t' in obj) {
      const textContent = obj['w:t'];

      if (Array.isArray(textContent)) {
        textContent.forEach((item, index) => {
          if (typeof item === 'string') {
            obj['w:t'][index] = this.replaceAllOccurrences(item, replacements);
          } else if (typeof item === 'object' && item._) {
            item._ = this.replaceAllOccurrences(item._, replacements);
          }
        });
      } else if (typeof textContent === 'string') {
        obj['w:t'] = this.replaceAllOccurrences(textContent, replacements);
      } else if (typeof textContent === 'object' && textContent._) {
        textContent._ = this.replaceAllOccurrences(textContent._, replacements);
      }
    }

    // Recursively process all properties
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        this.applyReplacementsToXml(item, replacements);
      });
    } else {
      Object.keys(obj).forEach((key) => {
        this.applyReplacementsToXml(obj[key], replacements);
      });
    }
  }

  /**
   * Replace all occurrences of PII in a text string
   */
  private replaceAllOccurrences(text: string, replacements: PiiReplacement[]): string {
    let result = text;

    // Sort replacements by length (longest first) to avoid partial replacements
    const sortedReplacements = [...replacements].sort(
      (a, b) => b.original.length - a.original.length
    );

    for (const replacement of sortedReplacements) {
      // Use global replace to catch all occurrences
      const regex = new RegExp(this.escapeRegex(replacement.original), 'g');
      result = result.replace(regex, replacement.anonymized);
    }

    return result;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Extract plain text from DOCX (for anonymization)
   */
  async extractText(docxPath: string): Promise<string> {
    try {
      console.log('[DOCX] Extracting text from:', docxPath);
      const data = fs.readFileSync(docxPath);
      console.log('[DOCX] File size:', data.length, 'bytes');

      const zip = await JSZip.loadAsync(data);
      console.log('[DOCX] ZIP loaded, files:', Object.keys(zip.files).slice(0, 10));

      const documentXml = await zip.file('word/document.xml')?.async('string');

      if (!documentXml) {
        console.error('[DOCX] word/document.xml not found in ZIP');
        throw new Error('Invalid DOCX file: word/document.xml not found');
      }

      console.log('[DOCX] document.xml length:', documentXml.length);

      const parsedXml = await parseXml(documentXml);
      console.log('[DOCX] XML parsed successfully');

      const textNodes = this.extractTextNodes(parsedXml);
      console.log('[DOCX] Text nodes found:', textNodes.length);

      const text = textNodes.map((node) => node.text).join('');
      console.log('[DOCX] Extracted text length:', text.length);
      console.log('[DOCX] First 100 chars:', text.substring(0, 100));

      return text;
    } catch (error) {
      console.error('[DOCX] Error extracting text:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  fileExists(filename: string): boolean {
    const filePath = path.join(this.downloadsDir, filename);
    return fs.existsSync(filePath);
  }

  /**
   * Get file path
   */
  getFilePath(filename: string): string {
    return path.join(this.downloadsDir, filename);
  }

  /**
   * Delete file
   */
  deleteFile(filename: string): void {
    const filePath = path.join(this.downloadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Cleanup old files
   */
  cleanupOldFiles(hoursOld = 24): void {
    const files = fs.readdirSync(this.downloadsDir);
    const now = Date.now();
    const maxAge = hoursOld * 60 * 60 * 1000;

    files.forEach((file) => {
      const filePath = path.join(this.downloadsDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    });
  }
}

export const docxFormatterService = new DocxFormatterService();

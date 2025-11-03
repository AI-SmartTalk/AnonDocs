import { Request, Response } from 'express';
import { anonymizationService } from '../services/anonymization.service';
import { parserService } from '../services/parser.service';
import { LLMProvider } from '../services/llm.service';
import fs from 'fs';

export class DocumentController {
  async anonymizeDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'No file uploaded',
        });
        return;
      }

      const { provider } = req.body;

      // Validate provider if provided
      if (provider && !['openai', 'anthropic', 'ollama'].includes(provider)) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        res.status(400).json({
          error: 'Invalid provider. Must be one of: openai, anthropic, ollama',
        });
        return;
      }

      // Parse document to extract text
      const text = await parserService.parseDocument(req.file.path, req.file.mimetype);

      // Clean up uploaded file immediately after parsing
      fs.unlinkSync(req.file.path);

      if (!text || text.trim().length === 0) {
        res.status(400).json({
          error: 'Could not extract text from document',
        });
        return;
      }

      // Reuse the anonymization service
      const result = await anonymizationService.anonymizeText(text, provider as LLMProvider);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Error in anonymizeDocument controller:', error);
      res.status(500).json({
        error: 'Failed to anonymize document',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const documentController = new DocumentController();

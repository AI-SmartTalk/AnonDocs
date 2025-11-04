import { Request, Response } from 'express';
import { EventEmitter } from 'events';
import { anonymizationService, ProgressEvent } from '../services/anonymization.service';
import { parserService } from '../services/parser.service';
import { docxFormatterService } from '../services/docx-formatter.service';
import { LLMProvider } from '../services/llm.service';
import fs from 'fs';

export class StreamController {
  /**
   * Stream text anonymization progress via SSE
   */
  async streamTextAnonymization(req: Request, res: Response): Promise<void> {
    const { text, provider } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      res.status(400).json({
        error: 'Text is required and must be a string',
      });
      return;
    }

    if (text.trim().length === 0) {
      res.status(400).json({
        error: 'Text cannot be empty',
      });
      return;
    }

    if (provider && !['openai', 'anthropic', 'ollama'].includes(provider)) {
      res.status(400).json({
        error: 'Invalid provider. Must be one of: openai, anthropic, ollama',
      });
      return;
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const progressEmitter = new EventEmitter();

    // Listen to progress events and send via SSE
    progressEmitter.on('progress', (event: ProgressEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    try {
      // Start anonymization with progress tracking
      await anonymizationService.anonymizeText(text, provider as LLMProvider, progressEmitter);

      // End the stream
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      const errorEvent: ProgressEvent = {
        type: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
      res.end();
    }
  }

  /**
   * Stream document anonymization progress via SSE
   * - DOCX: Returns download URL with formatting preserved
   * - PDF/TXT: Returns only anonymized text
   */
  async streamDocumentAnonymization(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({
        error: 'No file uploaded',
      });
      return;
    }

    const { provider } = req.body;
    const mimeType = req.file.mimetype;
    const isDocx =
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (provider && !['openai', 'anthropic', 'ollama'].includes(provider)) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({
        error: 'Invalid provider. Must be one of: openai, anthropic, ollama',
      });
      return;
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const progressEmitter = new EventEmitter();

    // Listen to progress events and send via SSE
    progressEmitter.on('progress', (event: ProgressEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    try {
      // Send parsing event
      const parsingEvent: ProgressEvent = {
        type: 'started',
        progress: 0,
        message: 'Parsing document...',
      };
      res.write(`data: ${JSON.stringify(parsingEvent)}\n\n`);

      let text: string;

      if (isDocx) {
        // Extract text from DOCX
        text = await docxFormatterService.extractText(req.file.path);
      } else {
        // Parse PDF/TXT
        text = await parserService.parseDocument(req.file.path, req.file.mimetype);
      }

      if (!text || text.trim().length === 0) {
        fs.unlinkSync(req.file.path);
        const errorEvent: ProgressEvent = {
          type: 'error',
          progress: 0,
          message: 'Could not extract text from document',
        };
        res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
        res.end();
        return;
      }

      // Start anonymization with progress tracking
      const result = await anonymizationService.anonymizeText(
        text,
        provider as LLMProvider,
        progressEmitter
      );

      if (isDocx) {
        // Create anonymized DOCX with formatting preserved using replacements
        const { filename } = await docxFormatterService.anonymizeDocx(
          req.file.path,
          result.replacements
        );

        // Construct download URL
        const protocol = req.protocol;
        const host = req.get('host');
        const downloadUrl = `${protocol}://${host}/api/document/download/${filename}`;

        // Send final event with download URL
        const finalEvent: ProgressEvent = {
          type: 'completed',
          progress: 100,
          message: 'DOCX generated with formatting preserved',
          data: {
            downloadUrl,
            filename,
            originalFilename: req.file.originalname,
          },
        };
        res.write(`data: ${JSON.stringify(finalEvent)}\n\n`);
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // End the stream
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      const errorEvent: ProgressEvent = {
        type: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
      res.end();
    }
  }
}

export const streamController = new StreamController();

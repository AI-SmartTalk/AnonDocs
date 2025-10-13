import { Request, Response, NextFunction } from 'express';
import { documentRepository } from '../repositories/document.repository';
import { anonymizationService } from '../services/anonymization.service';
import { llmService, LLMProvider } from '../services/llm.service';
import { chunkingService } from '../services/chunking.service';
import fs from 'fs/promises';

class DocumentController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const document = await documentRepository.create({
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
      });

      res.status(201).json({
        id: document.id,
        originalName: document.originalName,
        status: document.status,
        createdAt: document.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  async anonymize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { provider } = req.body as { provider?: LLMProvider };

      const document = await documentRepository.findById(id);
      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      if (document.status === 'PROCESSING') {
        res.status(400).json({ error: 'Document is already being processed' });
        return;
      }

      // Start anonymization process (async)
      anonymizationService.processDocument(id, provider).catch((error) => {
        console.error(`Failed to process document ${id}:`, error);
      });

      res.json({
        id: document.id,
        status: 'PROCESSING',
        message: 'Anonymization started',
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const document = await documentRepository.findById(id);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.json({
        id: document.id,
        originalName: document.originalName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        hasAnonymizedVersion: !!document.anonymizedDocument,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnonymized(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await anonymizationService.getAnonymizedDocument(id);

      if (!result) {
        res.status(404).json({ error: 'Anonymized document not found' });
        return;
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documents = await documentRepository.findAll();

      res.json({
        documents: documents.map((doc) => ({
          id: doc.id,
          originalName: doc.originalName,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          status: doc.status,
          createdAt: doc.createdAt,
          hasAnonymizedVersion: !!doc.anonymizedDocument,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const document = await documentRepository.findById(id);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Delete file from filesystem
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }

      // Delete from database
      await documentRepository.delete(id);

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async anonymizeText(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, provider } = req.body as { text: string; provider?: LLMProvider };

      // Validate input
      if (!text || typeof text !== 'string') {
        res.status(400).json({
          error: 'Invalid input',
          message: 'Request body must include "text" field with string content',
        });
        return;
      }

      if (text.length === 0) {
        res.status(400).json({
          error: 'Invalid input',
          message: 'Text content cannot be empty',
        });
        return;
      }

      if (text.length > 50000) {
        res.status(400).json({
          error: 'Text too large',
          message:
            'Text content must be less than 50,000 characters. Use file upload for larger documents.',
        });
        return;
      }

      // Chunk the text
      const chunks = chunkingService.chunkText(text);

      // Process each chunk
      const anonymizedChunks: string[] = [];
      const allPiiDetected: any[] = [];

      for (const chunk of chunks) {
        const result = await llmService.anonymizeChunk(chunk, provider);
        anonymizedChunks.push(result.anonymizedText);
        allPiiDetected.push(result.piiDetected);
      }

      // Combine results
      const anonymizedText = anonymizedChunks.join('\n\n');

      // Merge PII detected across all chunks
      const mergedPii = {
        names: [...new Set(allPiiDetected.flatMap((p) => p.names))],
        addresses: [...new Set(allPiiDetected.flatMap((p) => p.addresses))],
        emails: [...new Set(allPiiDetected.flatMap((p) => p.emails))],
        phoneNumbers: [...new Set(allPiiDetected.flatMap((p) => p.phoneNumbers))],
        dates: [...new Set(allPiiDetected.flatMap((p) => p.dates))],
        organizations: [...new Set(allPiiDetected.flatMap((p) => p.organizations))],
        other: [...new Set(allPiiDetected.flatMap((p) => p.other))],
      };

      res.json({
        anonymizedText,
        piiDetected: mergedPii,
        originalLength: text.length,
        anonymizedLength: anonymizedText.length,
        chunksProcessed: chunks.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();

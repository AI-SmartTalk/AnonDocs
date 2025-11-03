import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { documentController } from '../controllers/document.controller';

const router = Router();

/**
 * POST /api/document
 * Upload and anonymize a document (PDF, DOCX, or TXT)
 *
 * Form data:
 * - file: The document file (required)
 * - provider: LLM provider to use - "openai" | "anthropic" | "ollama" (optional)
 */
router.post('/', upload.single('file'), (req, res) =>
  documentController.anonymizeDocument(req, res)
);

export const documentRouter = router;

import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { documentController } from '../controllers/document.controller';

const router = Router();

/**
 * POST /api/document
 * Upload and anonymize a document
 *
 * Form data:
 * - file: The document file (required)
 * - provider: LLM provider to use - "openai" | "anthropic" | "ollama" (optional)
 *
 * Response format:
 * - DOCX: Returns anonymizedText + downloadUrl (formatting preserved)
 * - PDF/TXT: Returns only anonymizedText (plain text)
 */
router.post('/', upload.single('file'), (req, res) =>
  documentController.anonymizeDocument(req, res)
);

/**
 * GET /api/document/download/:filename
 * Download anonymized DOCX file
 *
 * Only DOCX files are downloadable (formatting preserved)
 */
router.get('/download/:filename', (req, res) => documentController.downloadDocument(req, res));

export const documentRouter = router;

import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { streamController } from '../controllers/stream.controller';

const router = Router();

/**
 * POST /api/stream/anonymize
 * Stream text anonymization progress via Server-Sent Events (SSE)
 *
 * Request body:
 * {
 *   "text": "Text to anonymize",
 *   "provider": "openai" | "anthropic" | "ollama" (optional)
 * }
 *
 * Response: text/event-stream
 */
router.post('/anonymize', (req, res) => streamController.streamTextAnonymization(req, res));

/**
 * POST /api/stream/document
 * Stream document anonymization progress via Server-Sent Events (SSE)
 *
 * Form data:
 * - file: The document file (required)
 * - provider: (optional) LLM provider - "openai", "anthropic", or "ollama"
 *
 * Response: text/event-stream
 */
router.post('/document', upload.single('file'), (req, res) =>
  streamController.streamDocumentAnonymization(req, res)
);

export const streamRouter = router;

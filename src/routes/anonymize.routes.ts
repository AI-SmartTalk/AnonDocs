import { Router } from 'express';
import { anonymizeController } from '../controllers/anonymize.controller';

const router = Router();

/**
 * POST /api/anonymize
 * Anonymize text input
 *
 * Request body:
 * {
 *   "text": "Text to anonymize",
 *   "provider": "openai" | "anthropic" | "ollama" (optional)
 * }
 */
router.post('/', (req, res) => anonymizeController.anonymizeText(req, res));

export const anonymizeRouter = router;

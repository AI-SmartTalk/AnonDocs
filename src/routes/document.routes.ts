import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';

export const documentRouter = Router();

// File upload endpoints
documentRouter.post('/upload', uploadMiddleware, documentController.upload);
documentRouter.post('/:id/anonymize', documentController.anonymize);

// Raw text endpoint (no file upload needed)
documentRouter.post('/anonymize-text', documentController.anonymizeText);

// Document management
documentRouter.get('/:id', documentController.getDocument);
documentRouter.get('/:id/anonymized', documentController.getAnonymized);
documentRouter.get('/', documentController.listDocuments);
documentRouter.delete('/:id', documentController.deleteDocument);

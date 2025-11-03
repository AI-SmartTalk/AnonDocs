import { Request, Response } from 'express';
import { anonymizationService } from '../services/anonymization.service';
import { LLMProvider } from '../services/llm.service';

export class AnonymizeController {
  async anonymizeText(req: Request, res: Response): Promise<void> {
    try {
      const { text, provider } = req.body;

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

      // Validate provider if provided
      if (provider && !['openai', 'anthropic', 'ollama'].includes(provider)) {
        res.status(400).json({
          error: 'Invalid provider. Must be one of: openai, anthropic, ollama',
        });
        return;
      }

      const result = await anonymizationService.anonymizeText(text, provider as LLMProvider);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error in anonymizeText controller:', error);
      res.status(500).json({
        error: 'Failed to anonymize text',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const anonymizeController = new AnonymizeController();

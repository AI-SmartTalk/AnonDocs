import { documentRepository } from '../repositories/document.repository';
import { chunkRepository } from '../repositories/chunk.repository';
import { anonymizedDocumentRepository } from '../repositories/anonymized-document.repository';
import { parserService } from './parser.service';
import { chunkingService } from './chunking.service';
import { llmService, LLMProvider } from './llm.service';
import { config } from '../config';

export class AnonymizationService {
  async processDocument(documentId: string, provider?: LLMProvider): Promise<void> {
    try {
      // Update document status
      await documentRepository.updateStatus(documentId, 'PROCESSING');

      // Get document
      const document = await documentRepository.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Parse document
      const text = await parserService.parseDocument(
        document.filePath,
        document.mimeType
      );

      // Chunk text
      const textChunks = chunkingService.chunkText(text);

      // Save chunks to database
      await chunkRepository.createMany(
        documentId,
        textChunks.map((chunk, index) => ({
          chunkIndex: index,
          originalText: chunk,
        }))
      );

      // Get all chunks
      const chunks = await chunkRepository.findByDocumentId(documentId);

      // Process each chunk with LLM
      const anonymizedChunks: string[] = [];
      for (const chunk of chunks) {
        await chunkRepository.updateStatus(chunk.id, 'PROCESSING');

        const result = await llmService.anonymizeChunk(chunk.originalText, provider);

        await chunkRepository.update(chunk.id, {
          anonymizedText: result.anonymizedText,
          status: 'COMPLETED',
          piiDetected: result.piiDetected,
        });

        anonymizedChunks.push(result.anonymizedText);
      }

      // Combine anonymized chunks
      const anonymizedContent = anonymizedChunks.join('\n\n');

      // Save anonymized document
      const selectedProvider = provider || config.llm.defaultProvider;
      const modelName = selectedProvider === 'openai' 
        ? config.llm.openai?.model || 'gpt-4'
        : selectedProvider === 'anthropic'
        ? config.llm.anthropic?.model || 'claude-3-sonnet-20240229'
        : config.llm.ollama?.model || 'mistral';

      await anonymizedDocumentRepository.create({
        documentId,
        content: anonymizedContent,
        llmProvider: selectedProvider,
        llmModel: modelName,
      });

      // Update document status
      await documentRepository.updateStatus(documentId, 'COMPLETED');
    } catch (error) {
      console.error('Error processing document:', error);
      await documentRepository.updateStatus(documentId, 'FAILED');
      throw error;
    }
  }

  async getAnonymizedDocument(documentId: string): Promise<{
    originalName: string;
    content: string;
    llmProvider: string;
    llmModel: string;
    createdAt: Date;
  } | null> {
    const document = await documentRepository.findById(documentId);
    if (!document || !document.anonymizedDocument) {
      return null;
    }

    return {
      originalName: document.originalName,
      content: document.anonymizedDocument.content,
      llmProvider: document.anonymizedDocument.llmProvider,
      llmModel: document.anonymizedDocument.llmModel,
      createdAt: document.anonymizedDocument.createdAt,
    };
  }
}

export const anonymizationService = new AnonymizationService();


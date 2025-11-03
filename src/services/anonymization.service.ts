import { chunkingService } from './chunking.service';
import { llmService, LLMProvider, AnonymizationResult } from './llm.service';
import { config } from '../config';

export interface AnonymizeTextRequest {
  text: string;
  provider?: LLMProvider;
}

export interface AnonymizeTextResponse {
  anonymizedText: string;
  piiDetected: AnonymizationResult['piiDetected'];
  chunksProcessed: number;
  wordsPerMinute: number;
  processingTimeMs: number;
}

export class AnonymizationService {
  /**
   * Anonymize text by chunking if needed and processing each chunk with LLM
   */
  async anonymizeText(text: string, provider?: LLMProvider): Promise<AnonymizeTextResponse> {
    try {
      const startTime = Date.now();

      // Count words in original text
      const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;

      // Chunk text
      const textChunks = chunkingService.chunkText(text);

      // Process chunks (parallel or sequential based on config)
      const allPiiDetected: AnonymizationResult['piiDetected'] = {
        names: [],
        addresses: [],
        emails: [],
        phoneNumbers: [],
        dates: [],
        organizations: [],
        other: [],
      };

      let results: AnonymizationResult[];

      if (config.chunking.enableParallel) {
        // Process all chunks in parallel
        results = await Promise.all(
          textChunks.map((chunk) => llmService.anonymizeChunk(chunk, provider))
        );
      } else {
        // Process chunks sequentially
        results = [];
        for (const chunk of textChunks) {
          const result = await llmService.anonymizeChunk(chunk, provider);
          results.push(result);
        }
      }

      // Aggregate results
      const anonymizedChunks: string[] = [];
      for (const result of results) {
        anonymizedChunks.push(result.anonymizedText);

        // Aggregate PII detected across all chunks (handle missing properties)
        if (result.piiDetected.names) {
          allPiiDetected.names.push(...result.piiDetected.names);
        }
        if (result.piiDetected.addresses) {
          allPiiDetected.addresses.push(...result.piiDetected.addresses);
        }
        if (result.piiDetected.emails) {
          allPiiDetected.emails.push(...result.piiDetected.emails);
        }
        if (result.piiDetected.phoneNumbers) {
          allPiiDetected.phoneNumbers.push(...result.piiDetected.phoneNumbers);
        }
        if (result.piiDetected.dates) {
          allPiiDetected.dates.push(...result.piiDetected.dates);
        }
        if (result.piiDetected.organizations) {
          allPiiDetected.organizations.push(...result.piiDetected.organizations);
        }
        if (result.piiDetected.other) {
          allPiiDetected.other.push(...result.piiDetected.other);
        }
      }

      // Combine anonymized chunks
      const anonymizedText = anonymizedChunks.join('\n\n');

      // Calculate metrics
      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;
      const processingTimeMinutes = processingTimeMs / 60000;
      const wordsPerMinute = Math.round(wordCount / processingTimeMinutes);

      return {
        anonymizedText,
        piiDetected: allPiiDetected,
        chunksProcessed: textChunks.length,
        wordsPerMinute,
        processingTimeMs,
      };
    } catch (error) {
      console.error('Error anonymizing text:', error);
      throw error;
    }
  }
}

export const anonymizationService = new AnonymizationService();

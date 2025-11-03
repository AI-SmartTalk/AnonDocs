import { chunkingService } from './chunking.service';
import { llmService, LLMProvider, AnonymizationResult } from './llm.service';

export interface AnonymizeTextRequest {
  text: string;
  provider?: LLMProvider;
}

export interface AnonymizeTextResponse {
  anonymizedText: string;
  piiDetected: AnonymizationResult['piiDetected'];
  chunksProcessed: number;
}

export class AnonymizationService {
  /**
   * Anonymize text by chunking if needed and processing each chunk with LLM
   */
  async anonymizeText(text: string, provider?: LLMProvider): Promise<AnonymizeTextResponse> {
    try {
      // Chunk text
      const textChunks = chunkingService.chunkText(text);

      // Process each chunk with LLM
      const anonymizedChunks: string[] = [];
      const allPiiDetected: AnonymizationResult['piiDetected'] = {
        names: [],
        addresses: [],
        emails: [],
        phoneNumbers: [],
        dates: [],
        organizations: [],
        other: [],
      };

      for (const chunk of textChunks) {
        const result = await llmService.anonymizeChunk(chunk, provider);
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

      return {
        anonymizedText,
        piiDetected: allPiiDetected,
        chunksProcessed: textChunks.length,
      };
    } catch (error) {
      console.error('Error anonymizing text:', error);
      throw error;
    }
  }
}

export const anonymizationService = new AnonymizationService();

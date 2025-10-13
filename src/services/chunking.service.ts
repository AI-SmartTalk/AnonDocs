import { config } from '../config';

export class ChunkingService {
  private readonly chunkSize: number = config.chunking.chunkSize;
  private readonly chunkOverlap: number = config.chunking.chunkOverlap;

  chunkText(text: string): string[] {
    // If text is smaller than chunk size, return as single chunk
    if (text.length <= this.chunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + this.chunkSize, text.length);
      let chunk = text.slice(startIndex, endIndex);

      // Try to break at sentence boundaries if not at the end
      if (endIndex < text.length) {
        const sentenceEnd = this.findSentenceBoundary(chunk);
        if (sentenceEnd !== -1) {
          chunk = chunk.slice(0, sentenceEnd + 1);
        }
      }

      const trimmedChunk = chunk.trim();
      if (trimmedChunk.length > 0) {
        chunks.push(trimmedChunk);
      }

      // Move start index forward, accounting for overlap
      // Ensure we always make forward progress
      const advance = Math.max(chunk.length - this.chunkOverlap, this.chunkSize / 2);
      startIndex += advance;
    }

    return chunks;
  }

  private findSentenceBoundary(text: string): number {
    const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
    let lastIndex = -1;

    for (const ender of sentenceEnders) {
      const index = text.lastIndexOf(ender);
      if (index > lastIndex) {
        lastIndex = index;
      }
    }

    return lastIndex;
  }
}

export const chunkingService = new ChunkingService();

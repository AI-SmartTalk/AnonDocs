import { PrismaClient, Chunk, ChunkStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ChunkRepository {
  async createMany(
    documentId: string,
    chunks: { chunkIndex: number; originalText: string }[]
  ): Promise<void> {
    await prisma.chunk.createMany({
      data: chunks.map((chunk) => ({
        documentId,
        ...chunk,
        status: 'PENDING' as ChunkStatus,
      })),
    });
  }

  async findByDocumentId(documentId: string): Promise<Chunk[]> {
    return prisma.chunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: 'asc' },
    });
  }

  async update(
    id: string,
    data: {
      anonymizedText?: string;
      status?: ChunkStatus;
      piiDetected?: any;
    }
  ): Promise<Chunk> {
    return prisma.chunk.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: ChunkStatus): Promise<Chunk> {
    return prisma.chunk.update({
      where: { id },
      data: { status },
    });
  }
}

export const chunkRepository = new ChunkRepository();


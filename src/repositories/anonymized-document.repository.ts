import { PrismaClient, AnonymizedDocument } from '@prisma/client';

const prisma = new PrismaClient();

export class AnonymizedDocumentRepository {
  async create(data: {
    documentId: string;
    content: string;
    llmProvider: string;
    llmModel: string;
  }): Promise<AnonymizedDocument> {
    return prisma.anonymizedDocument.create({
      data,
    });
  }

  async findByDocumentId(documentId: string): Promise<AnonymizedDocument | null> {
    return prisma.anonymizedDocument.findUnique({
      where: { documentId },
    });
  }
}

export const anonymizedDocumentRepository = new AnonymizedDocumentRepository();


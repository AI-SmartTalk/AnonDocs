import { PrismaClient, Document, DocumentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class DocumentRepository {
  async create(data: {
    originalName: string;
    mimeType: string;
    fileSize: number;
    filePath: string;
  }): Promise<Document> {
    return prisma.document.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  }

  async findById(id: string): Promise<Document | null> {
    return prisma.document.findUnique({
      where: { id },
      include: {
        chunks: true,
        anonymizedDocument: true,
      },
    });
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<Document> {
    return prisma.document.update({
      where: { id },
      data: { status },
    });
  }

  async findAll(): Promise<Document[]> {
    return prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        anonymizedDocument: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.document.delete({
      where: { id },
    });
  }
}

export const documentRepository = new DocumentRepository();


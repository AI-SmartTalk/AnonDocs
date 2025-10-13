import { DocumentStatus, ChunkStatus } from '@prisma/client';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface DocumentResponse {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  hasAnonymizedVersion: boolean;
}

export interface DocumentListResponse {
  documents: DocumentResponse[];
}

export interface AnonymizedDocumentResponse {
  originalName: string;
  content: string;
  llmProvider: string;
  llmModel: string;
  createdAt: Date;
}

export interface PIIDetected {
  names: string[];
  addresses: string[];
  emails: string[];
  phoneNumbers: string[];
  dates: string[];
  organizations: string[];
  other: string[];
}

export interface ChunkData {
  id: string;
  chunkIndex: number;
  originalText: string;
  anonymizedText: string | null;
  status: ChunkStatus;
  piiDetected: PIIDetected | null;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
}


# AnonDocs Architecture Documentation

## System Overview

AnonDocs is a document anonymization service that leverages Large Language Models to automatically detect and remove Personally Identifiable Information (PII) from documents.

## High-Level Architecture

```
┌─────────────┐
│   Client    │
│ Application │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────────┐
│          Express.js API Server          │
├─────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────────┐  │
│  │   Helmet   │  │      CORS        │  │
│  │  Security  │  │   Middleware     │  │
│  └────────────┘  └──────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Routes Layer            │   │
│  │   /api/documents/*              │   │
│  └────────────┬────────────────────┘   │
│               │                         │
│  ┌────────────▼────────────────────┐   │
│  │      Controllers Layer          │   │
│  │  - Handle HTTP requests         │   │
│  │  - Validate input               │   │
│  │  - Return responses             │   │
│  └────────────┬────────────────────┘   │
│               │                         │
│  ┌────────────▼────────────────────┐   │
│  │       Services Layer            │   │
│  │  ┌──────────────────────────┐   │   │
│  │  │ Anonymization Service    │   │   │
│  │  │  (Orchestration)         │   │   │
│  │  └───┬──────────────────────┘   │   │
│  │      │                           │   │
│  │  ┌───▼──────┐  ┌──────────┐    │   │
│  │  │  Parser  │  │ Chunking │    │   │
│  │  │ Service  │  │ Service  │    │   │
│  │  └──────────┘  └──────────┘    │   │
│  │                                 │   │
│  │  ┌──────────────────────────┐  │   │
│  │  │     LLM Service          │  │   │
│  │  │  - OpenAI Provider       │  │   │
│  │  │  - Anthropic Provider    │  │   │
│  │  └──────────────────────────┘  │   │
│  └────────────┬────────────────────┘   │
│               │                         │
│  ┌────────────▼────────────────────┐   │
│  │    Repository Layer             │   │
│  │  - DocumentRepository           │   │
│  │  - ChunkRepository              │   │
│  │  - AnonymizedDocRepository      │   │
│  └────────────┬────────────────────┘   │
└───────────────┼─────────────────────────┘
                │
       ┌────────┴────────┐
       │                 │
┌──────▼──────┐   ┌─────▼──────┐
│  PostgreSQL │   │  File      │
│  Database   │   │  System    │
└─────────────┘   └────────────┘
       │
┌──────▼──────────┐
│     Prisma      │
│  (ORM Layer)    │
└─────────────────┘
```

## Request Flow

### 1. Document Upload Flow

```
Client → POST /api/documents/upload
  ↓
Multer Middleware (validates file type & size)
  ↓
Document Controller
  ↓
Document Repository (save metadata to DB)
  ↓
File saved to filesystem
  ↓
Response: { id, status: "PENDING" }
```

### 2. Anonymization Flow

```
Client → POST /api/documents/:id/anonymize
  ↓
Document Controller (starts async process)
  ↓
Anonymization Service
  ├─→ Parse Document (PDF/DOCX → text)
  ├─→ Chunk Text (split into manageable pieces)
  ├─→ For each chunk:
  │   ├─→ Send to LLM Service
  │   ├─→ LLM detects PII
  │   ├─→ LLM replaces PII with placeholders
  │   └─→ Save to Chunk Repository
  └─→ Combine chunks
      └─→ Save to AnonymizedDocument Repository
  ↓
Document status updated to "COMPLETED"
```

### 3. Retrieval Flow

```
Client → GET /api/documents/:id/anonymized
  ↓
Document Controller
  ↓
Anonymization Service
  ↓
AnonymizedDocument Repository
  ↓
Response: { content, metadata }
```

## Component Details

### Controllers
**Responsibility**: HTTP layer, request/response handling

- `DocumentController`
  - upload(): Handle file uploads
  - anonymize(): Trigger anonymization
  - getDocument(): Get document status
  - getAnonymized(): Get anonymized content
  - listDocuments(): List all documents
  - deleteDocument(): Remove document

### Services
**Responsibility**: Business logic

- `AnonymizationService`
  - Orchestrates the entire anonymization process
  - Coordinates between parser, chunking, and LLM services
  - Manages document processing state

- `ParserService`
  - Extracts text from PDF files
  - Extracts text from DOCX files
  - Handles parsing errors gracefully

- `ChunkingService`
  - Splits text into optimal chunks
  - Respects sentence boundaries
  - Handles overlap for context preservation

- `LLMService`
  - Abstracts LLM providers
  - Sends prompts to LLMs
  - Parses LLM responses
  - Manages provider selection

### Repositories
**Responsibility**: Data access

- `DocumentRepository`
  - CRUD operations for documents
  - Status updates
  - Cascading deletes

- `ChunkRepository`
  - Bulk chunk creation
  - Status tracking
  - PII detection storage

- `AnonymizedDocumentRepository`
  - Store final anonymized content
  - Link to original document

## Data Models

### Document
```typescript
{
  id: UUID
  originalName: string
  mimeType: string
  fileSize: number
  filePath: string
  status: PENDING | PROCESSING | COMPLETED | FAILED
  createdAt: DateTime
  updatedAt: DateTime
  chunks: Chunk[]
  anonymizedDocument: AnonymizedDocument?
}
```

### Chunk
```typescript
{
  id: UUID
  documentId: UUID
  chunkIndex: number
  originalText: string
  anonymizedText: string?
  status: PENDING | PROCESSING | COMPLETED | FAILED
  piiDetected: JSON?
  createdAt: DateTime
  updatedAt: DateTime
}
```

### AnonymizedDocument
```typescript
{
  id: UUID
  documentId: UUID
  content: string
  llmProvider: string
  llmModel: string
  createdAt: DateTime
}
```

## Security Architecture

### Input Validation
- File type checking (whitelist approach)
- File size limits
- MIME type validation

### HTTP Security
- Helmet.js headers
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
- CORS configuration

### Data Security
- Environment variables for secrets
- No hardcoded credentials
- Database connection pooling

### Recommended Additions
- Rate limiting per IP
- Authentication middleware
- API key validation
- Request logging
- Audit trails

## Scalability Considerations

### Current Architecture
- Single server
- Synchronous chunk processing
- In-memory file handling

### Scaling Options

#### Horizontal Scaling
- Add load balancer
- Multiple API instances
- Shared file storage (S3, NFS)
- Connection pooling to database

#### Asynchronous Processing
- Add job queue (Redis, RabbitMQ)
- Background workers for anonymization
- Webhook notifications

#### Database Optimization
- Read replicas
- Connection pooling
- Index optimization
- Partitioning large tables

#### Caching
- Redis for frequently accessed data
- CDN for static content
- LLM response caching (with caution)

## Deployment Architecture

### Development
```
Docker Compose:
- PostgreSQL container
- API runs locally with tsx
```

### Production
```
Option 1: Docker
- PostgreSQL container
- API container
- Reverse proxy (nginx)

Option 2: Cloud Platform
- Managed PostgreSQL (RDS, Cloud SQL)
- Container service (ECS, Cloud Run)
- Object storage (S3)

Option 3: Kubernetes
- PostgreSQL StatefulSet
- API Deployment
- Ingress controller
- Persistent volumes
```

## Monitoring & Observability

### Recommended Additions

**Logging**
- Structured logging (Winston, Pino)
- Log levels (error, warn, info, debug)
- Centralized logging (ELK, Datadog)

**Metrics**
- Request rate
- Error rate
- Response time
- Document processing time
- LLM API latency
- Database query performance

**Tracing**
- Distributed tracing (OpenTelemetry)
- Request correlation IDs
- Service dependency mapping

**Alerting**
- High error rates
- Slow response times
- Database connection issues
- Disk space warnings
- Failed anonymizations

## Error Handling

### Strategy
- Try-catch blocks in async code
- Error middleware for Express
- Graceful degradation
- User-friendly error messages

### Error Types
- 400: Bad Request (invalid file type)
- 404: Not Found (document not found)
- 413: Payload Too Large (file too big)
- 500: Internal Server Error

## Configuration Management

### Environment-based Config
- Development (.env.development)
- Staging (.env.staging)
- Production (.env.production)

### Config Object
Centralized in `src/config/index.ts`
- Type-safe configuration
- Default values
- Validation on startup

## Testing Strategy (Recommended)

### Unit Tests
- Services (mocked repositories)
- Utilities
- Middleware

### Integration Tests
- API endpoints
- Database operations
- File upload/download

### E2E Tests
- Complete anonymization flow
- Error scenarios
- Multiple document types

### Load Tests
- Concurrent uploads
- Processing throughput
- Database performance

## Development Workflow

### Local Development
```bash
npm run dev          # Start with hot reload
npm run prisma:studio # Database GUI
docker-compose logs -f # Monitor PostgreSQL
```

### Code Quality
```bash
npm run lint         # ESLint
npm run format       # Prettier
npm run build        # TypeScript compilation
```

### Database Management
```bash
npm run prisma:migrate    # Apply migrations
npm run prisma:generate   # Generate client
```

## Future Architecture Considerations

### Microservices Split
- Document Service
- Anonymization Service
- LLM Gateway Service
- Storage Service

### Event-Driven Architecture
- Event bus (Kafka, EventBridge)
- Pub/sub for processing updates
- Event sourcing for audit

### API Gateway
- Rate limiting
- Authentication
- Request routing
- API versioning

---

This architecture provides a solid foundation for a production-grade document anonymization service with clear separation of concerns and scalability paths.


# AnonDocs - Project Summary

## Overview
AnonDocs is a production-ready, open-source API for anonymizing documents using Large Language Models (LLMs). It supports PDF and DOCX files and can work with multiple LLM providers through LangChainJS.

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **LLM Integration**: LangChainJS

### Key Dependencies
- `@langchain/core` - LLM abstraction
- `@langchain/openai` - OpenAI integration
- `@langchain/anthropic` - Anthropic Claude integration
- `pdf-parse` - PDF document parsing
- `mammoth` - DOCX document parsing
- `multer` - File upload handling
- `helmet` - Security headers
- `cors` - Cross-origin resource sharing

## Architecture

### Design Patterns
- **Repository Pattern**: All database operations isolated in repository classes
- **Service Layer**: Business logic separated from HTTP concerns
- **Middleware Pattern**: Request processing pipeline (upload, error handling)
- **Strategy Pattern**: Pluggable LLM providers

### Project Structure
```
anondocs-api/
├── src/
│   ├── config/              # Configuration management
│   ├── controllers/         # HTTP request handlers
│   ├── middleware/          # Express middleware
│   ├── repositories/        # Database operations (Prisma)
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   │   ├── parser.service.ts         # Document parsing
│   │   ├── chunking.service.ts       # Text chunking
│   │   ├── llm.service.ts            # LLM integration
│   │   └── anonymization.service.ts  # Orchestration
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── scripts/                # Setup and utility scripts
├── examples/               # Sample documents
└── .github/workflows/      # CI/CD pipelines
```

## Core Features

### 1. Document Upload
- Accepts PDF and DOCX files
- File type validation
- Size limits (default 10MB)
- Secure file storage

### 2. Document Parsing
- PDF text extraction using pdf-parse
- DOCX text extraction using mammoth
- Error handling for corrupted files

### 3. Text Chunking
- Intelligent chunking with sentence boundary detection
- Configurable chunk size (default 1500 chars)
- Overlap between chunks (default 200 chars)
- Maintains context across chunks

### 4. PII Detection & Anonymization
Uses LLM to detect and replace:
- Personal names → [NAME]
- Physical addresses → [ADDRESS]
- Email addresses → [EMAIL]
- Phone numbers → [PHONE]
- Dates → [DATE]
- Organizations → [ORGANIZATION]
- Financial info → [FINANCIAL_INFO]
- ID numbers → [ID_NUMBER]

### 5. Multi-LLM Support
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3 family)
- Extensible for additional providers
- Runtime provider selection

### 6. Database Tracking
- Document metadata storage
- Chunk-level tracking
- PII detection results
- Processing status
- Anonymized document storage

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/documents/upload` | Upload document |
| POST | `/api/documents/:id/anonymize` | Start anonymization |
| GET | `/api/documents/:id` | Get document status |
| GET | `/api/documents/:id/anonymized` | Get anonymized content |
| GET | `/api/documents` | List all documents |
| DELETE | `/api/documents/:id` | Delete document |

## Data Flow

```
1. Client uploads document
   ↓
2. Document stored in filesystem & database
   ↓
3. Client triggers anonymization
   ↓
4. Document parsed (PDF/DOCX → text)
   ↓
5. Text split into chunks
   ↓
6. Each chunk sent to LLM for anonymization
   ↓
7. Anonymized chunks stored in database
   ↓
8. Combined anonymized document created
   ↓
9. Client retrieves anonymized document
```

## Database Schema

### Documents Table
- id, originalName, mimeType, fileSize
- filePath, status, timestamps
- Relations: chunks, anonymizedDocument

### Chunks Table
- id, documentId, chunkIndex
- originalText, anonymizedText
- status, piiDetected (JSON), timestamps

### AnonymizedDocuments Table
- id, documentId (unique)
- content, llmProvider, llmModel
- timestamp

## Security Features

- Helmet.js for HTTP security headers
- CORS configuration
- File type validation
- File size limits
- Environment variable management
- No authentication (add via middleware/proxy)

## Development Tools

- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Prisma Studio**: Database GUI
- **Docker Compose**: Local development
- **GitHub Actions**: CI/CD

## Deployment Options

1. **Docker**: Dockerfile + docker-compose.prod.yml
2. **Platform as a Service**: Heroku, Railway, Render
3. **Container Orchestration**: Kubernetes, ECS
4. **Serverless**: Adapt for AWS Lambda, Cloud Functions

## Configuration

All configuration via environment variables:
- Server (port, environment)
- Database (connection URL)
- LLM providers (API keys, models)
- Upload settings (size limits, directory)

## Testing

- Health endpoint for liveness checks
- Sample documents in examples/
- Postman collection for API testing
- Test script for automation

## Future Enhancements

- [ ] Additional document formats (TXT, RTF, HTML)
- [ ] Batch processing
- [ ] Webhook notifications
- [ ] Custom PII patterns
- [ ] More LLM providers (Mistral, Llama)
- [ ] Export in original format
- [ ] Rate limiting
- [ ] Authentication/Authorization
- [ ] OpenAPI/Swagger documentation
- [ ] Unit and integration tests
- [ ] Performance monitoring

## Performance Considerations

- Asynchronous processing (non-blocking)
- Chunking for memory efficiency
- Database indexes on foreign keys
- Connection pooling (Prisma)
- File streaming for large documents

## Limitations

1. **LLM Accuracy**: May miss some PII or create false positives
2. **Format Preservation**: Text-only output (no formatting)
3. **Processing Time**: Depends on document size and LLM response time
4. **Cost**: LLM API calls have associated costs
5. **Language Support**: Depends on LLM capabilities

## Maintenance

- Keep dependencies updated
- Monitor LLM API changes
- Review anonymization quality regularly
- Implement logging and monitoring
- Set up alerts for failures

## Contributing

See CONTRIBUTING.md for:
- Development setup
- Code guidelines
- Pull request process
- Adding new features

## License

MIT License - See LICENSE file

---

**Built with ❤️ for privacy and security**


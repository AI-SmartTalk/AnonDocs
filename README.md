# AnonDocs

Open-source API for anonymizing documents using LLM technology. Supports PDF and DOCX files with configurable LLM providers through LangChainJS.

## Features

- 📄 **Document Support**: PDF and DOCX file processing
- 🤖 **Multi-LLM Support**: OpenAI, Anthropic (Claude), and extensible for other providers
- 🔒 **PII Detection**: Automatically detects and removes:
  - Personal names
  - Physical addresses
  - Email addresses
  - Phone numbers
  - Dates
  - Organizations
  - Financial information
- 📊 **Chunking Strategy**: Intelligent document chunking for efficient processing
- 🗄️ **Database Tracking**: PostgreSQL with Prisma ORM for document lifecycle management
- 🏗️ **Clean Architecture**: Repository pattern for maintainable code

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI or Anthropic API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/anondocs-api.git
cd anondocs-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Docker Setup

Use Docker Compose for a quick setup with PostgreSQL:

```bash
docker-compose up -d
```

## API Endpoints

### Anonymize Raw Text (NEW! 🎉)

```bash
POST /api/documents/anonymize-text
Content-Type: application/json

# Example with curl
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{"text": "John Smith lives at 123 Main St. Call him at 555-1234."}'
```

**Perfect for:** Quick text snippets, real-time anonymization, API integrations  
**See:** [TEXT_API.md](TEXT_API.md) for complete guide with examples

### Upload Document

```bash
POST /api/documents/upload
Content-Type: multipart/form-data

# Example with curl
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@/path/to/document.pdf"
```

**Perfect for:** PDF/DOCX files, large documents, batch processing

### Start Anonymization

```bash
POST /api/documents/:id/anonymize
Content-Type: application/json

# Example
curl -X POST http://localhost:3000/api/documents/{document-id}/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai"}'
```

### Get Document Status

```bash
GET /api/documents/:id

# Example
curl http://localhost:3000/api/documents/{document-id}
```

### Get Anonymized Document

```bash
GET /api/documents/:id/anonymized

# Example
curl http://localhost:3000/api/documents/{document-id}/anonymized
```

### List All Documents

```bash
GET /api/documents

# Example
curl http://localhost:3000/api/documents
```

### Delete Document

```bash
DELETE /api/documents/:id

# Example
curl -X DELETE http://localhost:3000/api/documents/{document-id}
```

## Configuration

### Environment Variables

| Variable               | Description                                | Default                    |
| ---------------------- | ------------------------------------------ | -------------------------- |
| `PORT`                 | Server port                                | `3000`                     |
| `DATABASE_URL`         | PostgreSQL connection string               | Required                   |
| `OPENAI_API_KEY`       | OpenAI API key                             | Optional                   |
| `OPENAI_MODEL`         | OpenAI model to use                        | `gpt-4`                    |
| `OPENAI_BASE_URL`      | Custom OpenAI endpoint                     | Optional                   |
| `ANTHROPIC_API_KEY`    | Anthropic API key                          | Optional                   |
| `ANTHROPIC_MODEL`      | Anthropic model to use                     | `claude-3-sonnet-20240229` |
| `OLLAMA_BASE_URL`      | Ollama server URL                          | `http://localhost:11434`   |
| `OLLAMA_MODEL`         | Ollama model name                          | `mistral`                  |
| `DEFAULT_LLM_PROVIDER` | Default provider (openai/anthropic/ollama) | `openai`                   |
| `MAX_FILE_SIZE`        | Max upload size in bytes                   | `10485760` (10MB)          |
| `UPLOAD_DIR`           | Directory for uploaded files               | `./uploads`                |

**💡 See [ENV_EXAMPLES.md](ENV_EXAMPLES.md) for complete configuration examples!**

### Supported LLM Providers

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Ollama**: Mistral, Mixtral, Llama2, and more (runs locally, FREE!)

More providers can be added by extending the `LLMService` class.

**Want to use Ollama with Mistral?** See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for a complete guide.

## Architecture

```
src/
├── controllers/       # Request handlers
├── services/         # Business logic
│   ├── parser.service.ts          # PDF/DOCX parsing
│   ├── chunking.service.ts        # Text chunking
│   ├── llm.service.ts             # LLM integration
│   └── anonymization.service.ts   # Orchestration
├── repositories/     # Database operations (Prisma)
├── routes/          # API routes
├── middleware/      # Express middleware
└── utils/           # Utility functions
```

## Development

### Build

```bash
npm run build
```

### Run Production

```bash
npm start
```

### Database Management

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Roadmap

- [ ] Support for more document formats (TXT, RTF, HTML)
- [ ] Batch processing
- [ ] Webhook notifications
- [ ] Custom PII patterns
- [ ] Support for more LLM providers (Mistral, Llama, etc.)
- [ ] Export anonymized documents in original format
- [ ] REST API documentation with Swagger/OpenAPI

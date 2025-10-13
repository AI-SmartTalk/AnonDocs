# Quick Start Guide

Get AnonDocs up and running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (recommended)
- OpenAI or Anthropic API key

## Installation

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/anondocs-api.git
cd anondocs-api

# Run the setup script
./scripts/setup.sh
```

The script will:
- Install dependencies
- Create `.env` file
- Start PostgreSQL in Docker
- Run database migrations
- Create uploads directory

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start PostgreSQL
docker-compose up -d

# Run migrations
npm run prisma:generate
npm run prisma:migrate

# Create uploads directory
mkdir -p uploads
```

## Configuration

Edit `.env` and add your API key:

```env
# For OpenAI
OPENAI_API_KEY=sk-your-key-here
DEFAULT_LLM_PROVIDER=openai

# OR for Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
DEFAULT_LLM_PROVIDER=anthropic
```

## Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Test It Out

### 1. Check Health
```bash
curl http://localhost:3000/health
```

### 2. Upload a Document
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@examples/sample-document.txt"
```

Response:
```json
{
  "id": "abc123...",
  "originalName": "sample-document.txt",
  "status": "PENDING",
  "createdAt": "2025-10-13T..."
}
```

### 3. Start Anonymization
```bash
# Replace {document-id} with the ID from step 2
curl -X POST http://localhost:3000/api/documents/{document-id}/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai"}'
```

### 4. Check Status
```bash
curl http://localhost:3000/api/documents/{document-id}
```

Wait until status is "COMPLETED"

### 5. Get Anonymized Document
```bash
curl http://localhost:3000/api/documents/{document-id}/anonymized
```

## Using Postman

Import `postman_collection.json` into Postman for a ready-to-use API collection.

## Using the Test Script

```bash
./scripts/test-api.sh examples/sample-document.txt
```

## Next Steps

- Read the [full documentation](README.md)
- Check out [security best practices](SECURITY.md)
- Learn about [contributing](CONTRIBUTING.md)
- Explore [example documents](examples/)

## Troubleshooting

### Database connection failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart
```

### Port already in use
```bash
# Change the port in .env
PORT=3001
```

### LLM provider error
- Verify your API key is correct
- Check your API key has sufficient credits
- Ensure the model name is valid

### File upload fails
- Check file size (default max: 10MB)
- Verify file type (PDF or DOCX only)
- Ensure uploads directory exists

## Production Deployment

For production deployment:

```bash
# Build the project
npm run build

# Use production Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to your platform
# See README.md for detailed deployment guides
```

## Support

- Open an issue on GitHub
- Check existing issues for solutions
- Read the full documentation

Happy anonymizing! 🎉


# AnonDocs API

A privacy-first API for anonymizing text and documents using **open source Large Language Models (LLMs)**. Automatically detects and redacts personally identifiable information (PII) from text, PDF, DOCX, and TXT files - **100% locally, no data sent to third parties**.

**Proudly made open source by [AI SmartTalk](https://aismarttalk.tech)**

## Why AnonDocs?

🔐 **GDPR Compliant** - Process sensitive data locally without sending it to external APIs  
🆓 **100% Open Source** - Use free, open source LLMs via Ollama or compatible APIs  
🏠 **Local Processing** - All anonymization happens on your infrastructure  
🔒 **Zero Data Leakage** - No data stored, logged, or sent to third parties

## Features

- 🔒 **Smart PII Detection** - Automatically identifies names, emails, phone numbers, addresses, dates, organizations, and more
- 📄 **Multiple Format Support** - Process plain text, PDF, DOCX, and TXT files
- 🚀 **Parallel Processing** - Optional chunk parallelization for faster processing
- 📊 **Performance Metrics** - Track words per minute and processing time
- 🤖 **Open Source LLMs** - Support for Ollama, vLLM, LM Studio, LocalAI, and any OpenAI-compatible API
- 🔧 **Zero Database** - Stateless API with no persistence required

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- An open source LLM running locally:
  - **Ollama** (recommended) - easiest setup
  - **vLLM** - high performance serving
  - **LM Studio** - GUI-based local models
  - **LocalAI** - OpenAI-compatible local API
  - Any other OpenAI-compatible API serving open source models

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd anondocs-api

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your settings

# Run in development mode
npm run dev

# Or build and run in production
npm run build
npm start
```

### Environment Configuration

Create a `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# LLM Provider - Use open source models for GDPR compliance
DEFAULT_LLM_PROVIDER=ollama

# Option 1: Ollama (recommended - easiest setup)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral-nemo

# Option 2: OpenAI-compatible API (vLLM, LM Studio, LocalAI, etc.)
# OPENAI_BASE_URL=http://localhost:8000/v1
# OPENAI_MODEL=mistralai/Mistral-7B-Instruct-v0.2
# OPENAI_API_KEY=not-required-for-local

# Processing Configuration
CHUNK_SIZE=1500
CHUNK_OVERLAP=0
ENABLE_PARALLEL_CHUNKS=false
```

## API Endpoints

> **🔄 Real-time Progress Tracking**: For integration teams needing progress updates, see [STREAMING_API.md](./STREAMING_API.md) for detailed SSE streaming documentation.

### 1. Anonymize Text

Anonymize plain text input.

**Endpoint:** `POST /api/anonymize`

**Request Body:**

```json
{
  "text": "My name is John Smith and my email is john@example.com",
  "provider": "ollama"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "anonymizedText": "My name is [NAME] and my email is [EMAIL]",
    "piiDetected": {
      "names": ["John Smith"],
      "emails": ["john@example.com"],
      "addresses": [],
      "phoneNumbers": [],
      "dates": [],
      "organizations": [],
      "other": []
    },
    "chunksProcessed": 1,
    "wordsPerMinute": 450,
    "processingTimeMs": 1234
  }
}
```

### 2. Anonymize Document

Upload and anonymize PDF, DOCX, or TXT files.

**Endpoint:** `POST /api/document`

**Request:** Multipart form data

- `file`: The document file (PDF/DOCX/TXT)
- `provider`: (optional) LLM provider - "openai", "anthropic", or "ollama"

**Example with curl:**

```bash
curl -X POST http://localhost:3000/api/document \
  -F "file=@/path/to/document.pdf" \
  -F "provider=ollama"
```

**Response:** Same format as text anonymization endpoint

### 3. Health Check

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-11-03T12:00:00.000Z"
}
```

### 4. Stream Text Anonymization (SSE)

**Endpoint:** `POST /api/stream/anonymize`

Stream real-time progress updates via Server-Sent Events.

**Request:** Same as `/api/anonymize`

**Response:** `text/event-stream` with progress events

📖 See [STREAMING_API.md](./STREAMING_API.md) for detailed integration guide with code examples.

### 5. Stream Document Anonymization (SSE)

**Endpoint:** `POST /api/stream/document`

Stream real-time progress updates for document processing.

**Request:** Same as `/api/document`

**Response:** `text/event-stream` with progress events

📖 See [STREAMING_API.md](./STREAMING_API.md) for detailed integration guide with code examples.

## Usage Examples

### JavaScript/TypeScript

```javascript
// Anonymize text
const response = await fetch('http://localhost:3000/api/anonymize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Contact Jane Doe at jane@example.com or call 555-1234',
    provider: 'ollama',
  }),
});

const result = await response.json();
console.log(result.data.anonymizedText);
```

### cURL - Text

```bash
curl -X POST http://localhost:3000/api/anonymize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My SSN is 123-45-6789 and I live at 123 Main St",
    "provider": "ollama"
  }'
```

### cURL - Document

```bash
curl -X POST http://localhost:3000/api/document \
  -F "file=@contract.pdf" \
  -F "provider=ollama"
```

### Python

```python
import requests

# Text anonymization
response = requests.post('http://localhost:3000/api/anonymize', json={
    'text': 'Email me at user@example.com',
    'provider': 'ollama'
})
print(response.json()['data']['anonymizedText'])

# Document anonymization
with open('document.pdf', 'rb') as f:
    files = {'file': f}
    data = {'provider': 'ollama'}
    response = requests.post('http://localhost:3000/api/document',
                           files=files, data=data)
    print(response.json()['data'])
```

## LLM Providers (Open Source & Local)

### Option 1: Ollama (Recommended - Easiest Setup)

**Best for**: Quick setup, ease of use, automatic model management

1. Install Ollama from https://ollama.ai
2. Pull a model:
   ```bash
   ollama pull mistral-nemo       # Recommended - great for PII detection
   # or
   ollama pull llama3.1           # Alternative
   ollama pull mistral            # Smaller, faster
   ```
3. Start Ollama (usually starts automatically):
   ```bash
   ollama serve
   ```
4. Configure `.env`:
   ```env
   DEFAULT_LLM_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=mistral-nemo
   ```

### Option 2: vLLM (High Performance)

**Best for**: Production deployments, high throughput, GPU acceleration

1. Install vLLM: https://docs.vllm.ai/
2. Start vLLM server with an open source model:
   ```bash
   python -m vllm.entrypoints.openai.api_server \
     --model mistralai/Mistral-7B-Instruct-v0.2 \
     --host 0.0.0.0 \
     --port 8000
   ```
3. Configure `.env`:
   ```env
   DEFAULT_LLM_PROVIDER=openai
   OPENAI_BASE_URL=http://localhost:8000/v1
   OPENAI_MODEL=mistralai/Mistral-7B-Instruct-v0.2
   OPENAI_API_KEY=not-required
   ```

### Option 3: LM Studio (GUI-Based)

**Best for**: Desktop users, visual interface, model testing

1. Download LM Studio: https://lmstudio.ai/
2. Download a model through the GUI (e.g., Mistral 7B Instruct)
3. Start the local server in LM Studio (default port: 1234)
4. Configure `.env`:
   ```env
   DEFAULT_LLM_PROVIDER=openai
   OPENAI_BASE_URL=http://localhost:1234/v1
   OPENAI_MODEL=mistral-7b-instruct
   OPENAI_API_KEY=not-required
   ```

### Option 4: LocalAI

**Best for**: Self-hosted, Docker deployments, OpenAI API compatibility

1. Run LocalAI with Docker:
   ```bash
   docker run -p 8080:8080 \
     -v $PWD/models:/models \
     localai/localai:latest
   ```
2. Configure `.env`:
   ```env
   DEFAULT_LLM_PROVIDER=openai
   OPENAI_BASE_URL=http://localhost:8080/v1
   OPENAI_MODEL=your-model-name
   OPENAI_API_KEY=not-required
   ```

### Recommended Models for PII Detection

| Model            | Size | Quality    | Speed      | Best For              |
| ---------------- | ---- | ---------- | ---------- | --------------------- |
| **mistral-nemo** | 12B  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | Best overall accuracy |
| **llama3.1**     | 8B   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | Good balance          |
| **mistral**      | 7B   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | Fastest, good quality |
| **phi-3**        | 3.8B | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | Low resource usage    |

## Configuration Options

| Variable                 | Default  | Description                                          |
| ------------------------ | -------- | ---------------------------------------------------- |
| `PORT`                   | `3000`   | Server port                                          |
| `DEFAULT_LLM_PROVIDER`   | `ollama` | Provider: `ollama` or `openai` (for compatible APIs) |
| `OLLAMA_BASE_URL`        | -        | Ollama server URL (e.g., http://localhost:11434)     |
| `OLLAMA_MODEL`           | -        | Ollama model name (e.g., mistral-nemo)               |
| `OPENAI_BASE_URL`        | -        | For vLLM, LM Studio, LocalAI, etc.                   |
| `OPENAI_MODEL`           | -        | Model name for OpenAI-compatible API                 |
| `CHUNK_SIZE`             | `1500`   | Characters per chunk                                 |
| `CHUNK_OVERLAP`          | `0`      | Overlap between chunks                               |
| `ENABLE_PARALLEL_CHUNKS` | `false`  | Process chunks in parallel (faster, more memory)     |

## Performance

- **Sequential Processing**: Processes one chunk at a time (safer, uses less memory)
- **Parallel Processing**: Enable with `ENABLE_PARALLEL_CHUNKS=true` for faster processing of large documents

Example performance metrics:

- Small text (< 1500 chars): ~200-500 words/minute
- Large documents: Varies based on LLM provider and parallelization

## Development

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── config/              # Configuration management
├── controllers/         # Request handlers
│   ├── anonymize.controller.ts
│   └── document.controller.ts
├── middleware/          # Express middleware
│   ├── error.middleware.ts
│   └── upload.middleware.ts
├── routes/             # API routes
│   ├── anonymize.routes.ts
│   └── document.routes.ts
├── services/           # Business logic
│   ├── anonymization.service.ts
│   ├── chunking.service.ts
│   ├── llm.service.ts
│   └── parser.service.ts
└── index.ts            # Application entry point
```

## Privacy & Security

### GDPR Compliance

✅ **Data Never Leaves Your Infrastructure**

- All LLM processing happens locally on your servers
- No data sent to OpenAI, Anthropic, or any third-party APIs
- Perfect for handling sensitive personal data, medical records, legal documents

✅ **Zero Data Retention**

- Uploaded files are immediately deleted after processing
- No data stored in databases
- All processing happens in memory only
- No logging of sensitive content

✅ **Open Source & Auditable**

- Full source code available for security audits
- No black-box APIs or proprietary services
- You control the entire data pipeline

### Production Security Recommendations

- Run behind a reverse proxy with rate limiting
- Use HTTPS/TLS for all connections
- Implement authentication/authorization for API access
- Run in an isolated network segment for sensitive data
- Consider running on air-gapped systems for maximum security
- Regular security updates for dependencies

## Troubleshooting

**Port already in use:**

```bash
lsof -ti:3000 | xargs kill -9
```

**Ollama connection failed:**

- Ensure Ollama is running: `ollama serve`
- Check base URL is correct: `http://localhost:11434`
- Verify model is pulled: `ollama list`

**vLLM/OpenAI-compatible API connection failed:**

- Check if the server is running on the specified port
- Verify `OPENAI_BASE_URL` includes `/v1` suffix
- Test the API directly: `curl http://localhost:8000/v1/models`

**Poor PII detection quality:**

- Use larger models (mistral-nemo, llama3.1 recommended)
- Adjust `CHUNK_SIZE` - smaller chunks can improve accuracy
- Try different models - some are better at entity recognition

**Out of memory:**

- Reduce `CHUNK_SIZE`
- Disable `ENABLE_PARALLEL_CHUNKS`
- Use smaller models (mistral 7B, phi-3)
- Increase system RAM or use models with lower parameters

## License

MIT

## Use Cases

- 🏥 **Healthcare**: Anonymize patient records before sharing with researchers
- ⚖️ **Legal**: Redact sensitive information from legal documents
- 💼 **HR**: Process employee data while maintaining privacy
- 🏦 **Finance**: Sanitize financial documents for analysis
- 📊 **Research**: Share datasets without exposing personal information
- 🔐 **Compliance**: Meet GDPR, HIPAA, and other privacy regulations

## Credits

**Proudly made open source by [AI SmartTalk](https://aismarttalk.tech)**

Building privacy-first, open source AI solutions for document processing.

---

**Remember**: With great power comes great responsibility. Always verify anonymization results before sharing sensitive documents. This tool assists with PII detection but should be part of a comprehensive data protection strategy.

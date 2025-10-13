# Environment Configuration Examples

This guide shows you different `.env` configurations for various LLM setups.

## Quick Configuration Templates

Copy one of these configurations to your `.env` file based on your needs.

---

## 1. OpenAI (Cloud - Official API)

**Use case**: Best quality, fast, paid per use

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-key-here
OPENAI_MODEL=gpt-4
DEFAULT_LLM_PROVIDER=openai

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Models you can use:**
- `gpt-4` - Best quality (recommended)
- `gpt-4-turbo-preview` - Faster, cheaper
- `gpt-3.5-turbo` - Fast, cheap, good quality

---

## 2. Anthropic Claude (Cloud)

**Use case**: Alternative to OpenAI, excellent quality

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
DEFAULT_LLM_PROVIDER=anthropic

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Models you can use:**
- `claude-3-opus-20240229` - Highest quality
- `claude-3-sonnet-20240229` - Balanced (recommended)
- `claude-3-haiku-20240307` - Fast & cheap

---

## 3. Ollama (Local - FREE!)

**Use case**: Free, private, runs on your machine

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
DEFAULT_LLM_PROVIDER=ollama

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Setup:**
```bash
# Install Ollama
brew install ollama  # or from https://ollama.ai

# Start Ollama
ollama serve

# Pull a model
ollama pull mistral
```

**Available models:**
- `mistral` - Fast, 7B params (recommended)
- `mixtral:8x7b` - Better quality, needs 32GB RAM
- `llama2` - Alternative, 7B params
- `codellama` - Good for code/technical docs

---

## 4. LM Studio (Local, OpenAI-compatible)

**Use case**: Local LLMs with nice GUI, OpenAI-compatible API

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

# LM Studio Configuration (via OpenAI compatibility)
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_MODEL=local-model
OPENAI_API_KEY=lm-studio
DEFAULT_LLM_PROVIDER=openai

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Setup:**
1. Download LM Studio: https://lmstudio.ai
2. Download a model (Mistral 7B recommended)
3. Start the local server (it runs on port 1234)

---

## 5. LocalAI (Self-hosted, OpenAI-compatible)

**Use case**: Self-hosted alternative to OpenAI, supports many models

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

# LocalAI Configuration
OPENAI_BASE_URL=http://localhost:8080/v1
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=not-needed
DEFAULT_LLM_PROVIDER=openai

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Setup LocalAI with Docker:**
```bash
docker run -p 8080:8080 -v $PWD/models:/models \
  localai/localai:latest
```

---

## 6. Multiple Providers (Hybrid Setup)

**Use case**: Have multiple options, switch between them

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

# OpenAI (for high-priority documents)
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4

# Anthropic (alternative cloud option)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Ollama (for free/local processing)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Use Ollama by default (free), but have cloud options available
DEFAULT_LLM_PROVIDER=ollama

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Then choose per document:**
```bash
# Use Ollama (free)
curl -X POST http://localhost:3000/api/documents/{id}/anonymize \
  -d '{"provider": "ollama"}'

# Use OpenAI (paid, better quality)
curl -X POST http://localhost:3000/api/documents/{id}/anonymize \
  -d '{"provider": "openai"}'

# Use Anthropic
curl -X POST http://localhost:3000/api/documents/{id}/anonymize \
  -d '{"provider": "anthropic"}'
```

---

## 7. Remote Ollama Server

**Use case**: Ollama running on another machine/server

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

# Remote Ollama
OLLAMA_BASE_URL=http://192.168.1.100:11434
OLLAMA_MODEL=mistral
DEFAULT_LLM_PROVIDER=ollama

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

---

## 8. Azure OpenAI

**Use case**: Using OpenAI through Azure

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

# Azure OpenAI
OPENAI_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment
OPENAI_API_KEY=your-azure-api-key
OPENAI_MODEL=gpt-4
DEFAULT_LLM_PROVIDER=openai

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

---

## Configuration Options Reference

### Server
- `PORT` - API server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Database
- `DATABASE_URL` - PostgreSQL connection string

### OpenAI / OpenAI-compatible
- `OPENAI_API_KEY` - Your API key (optional for some local setups)
- `OPENAI_MODEL` - Model name to use
- `OPENAI_BASE_URL` - Custom API endpoint (for LocalAI, LM Studio, Azure, etc.)
- `OPENAI_TEMPERATURE` - Creativity level (0-1, default: 0)

### Anthropic
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `ANTHROPIC_MODEL` - Claude model to use
- `ANTHROPIC_TEMPERATURE` - Creativity level (0-1, default: 0)

### Ollama
- `OLLAMA_BASE_URL` - Ollama server URL (default: http://localhost:11434)
- `OLLAMA_MODEL` - Model name (e.g., mistral, mixtral)
- `OLLAMA_TEMPERATURE` - Creativity level (0-1, default: 0)

### General
- `DEFAULT_LLM_PROVIDER` - Which provider to use by default (openai/anthropic/ollama)
- `MAX_FILE_SIZE` - Maximum upload size in bytes (default: 10MB)
- `UPLOAD_DIR` - Directory for uploaded files (default: ./uploads)
- `CHUNK_SIZE` - Text chunk size in characters (default: 1500)
- `CHUNK_OVERLAP` - Overlap between chunks (default: 200)

---

## Testing Your Configuration

After setting up your `.env` file:

```bash
# Start the server
npm run dev

# You should see output like:
# ✓ OpenAI initialized: gpt-4
# ✓ Ollama initialized: mistral (http://localhost:11434)
# 📋 Available providers: openai, ollama
# 🎯 Default provider: ollama
```

If you see: `⚠️ No LLM providers configured!`, check your `.env` file.

---

## Quick Comparison

| Provider | Cost | Privacy | Speed | Quality | Setup |
|----------|------|---------|-------|---------|-------|
| OpenAI | $$$ | Cloud | Fast | ⭐⭐⭐⭐⭐ | Easy |
| Anthropic | $$$ | Cloud | Fast | ⭐⭐⭐⭐⭐ | Easy |
| Ollama | Free | Local | Medium | ⭐⭐⭐⭐ | Medium |
| LM Studio | Free | Local | Medium | ⭐⭐⭐⭐ | Easy |
| LocalAI | Free | Local | Medium | ⭐⭐⭐⭐ | Hard |

---

## Need Help?

- Can't connect to Ollama? Make sure `ollama serve` is running
- API key not working? Check it's correctly copied (no spaces)
- Want to switch providers? Just change `DEFAULT_LLM_PROVIDER`
- Need multiple providers? Configure all of them, choose per document

For more help, see the main [README.md](README.md) or [OLLAMA_SETUP.md](OLLAMA_SETUP.md).


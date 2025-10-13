# Quick Start: Ollama + Mistral

Get started with local, free LLM anonymization in 3 minutes!

## 1️⃣ Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai/download

## 2️⃣ Start Ollama & Pull Mistral

```bash
# Start Ollama (in one terminal)
ollama serve

# In another terminal, pull Mistral
ollama pull mistral
```

## 3️⃣ Configure AnonDocs

Edit your `.env` file (or create from .env.example):

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Make it the default
DEFAULT_LLM_PROVIDER=ollama
```

## 4️⃣ Install & Run

```bash
# Install the new Ollama dependency
npm install

# Start AnonDocs
npm run dev
```

## 5️⃣ Test It!

```bash
# Upload a document
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@examples/sample-document.txt"

# Note the document ID, then anonymize
curl -X POST http://localhost:3000/api/documents/{doc-id}/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "ollama"}'

# Check status
curl http://localhost:3000/api/documents/{doc-id}

# Get anonymized result
curl http://localhost:3000/api/documents/{doc-id}/anonymized
```

## ✨ Benefits

✅ **FREE** - No API costs  
✅ **PRIVATE** - Data never leaves your machine  
✅ **OFFLINE** - Works without internet  
✅ **UNLIMITED** - No rate limits  

## 🚀 Other Models

```bash
# Larger, more capable (needs more RAM)
ollama pull mixtral:8x7b

# Alternative models
ollama pull llama2
ollama pull codellama
```

Then update `.env`:
```env
OLLAMA_MODEL=mixtral:8x7b
```

## 📚 Full Documentation

See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for complete guide, troubleshooting, and advanced configuration.

## Need Help?

**Test Ollama is working:**
```bash
curl http://localhost:11434/api/tags
```

**Test model directly:**
```bash
ollama run mistral "Anonymize: John Smith lives at 123 Main St"
```

**Check available models:**
```bash
ollama list
```

That's it! You're now using local AI for document anonymization! 🎉


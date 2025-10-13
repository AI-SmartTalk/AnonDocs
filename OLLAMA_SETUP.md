# Using AnonDocs with Ollama and Mistral

This guide shows you how to use AnonDocs with Ollama, allowing you to run LLMs locally without API costs.

## What is Ollama?

Ollama is a tool that lets you run large language models locally on your machine. It's perfect for:
- Privacy-sensitive documents (data never leaves your machine)
- Cost savings (no API fees)
- Offline operation

## Prerequisites

1. Install Ollama: https://ollama.ai/download
2. At least 8GB RAM (16GB recommended for larger models)

## Step 1: Install and Start Ollama

### On macOS or Linux:
```bash
# Download and install from https://ollama.ai/download
# Or use Homebrew on macOS:
brew install ollama

# Start Ollama server
ollama serve
```

### On Windows:
Download the installer from https://ollama.ai/download and run it.

## Step 2: Pull the Mistral Model

In a new terminal:
```bash
# Pull Mistral 7B (recommended for most use cases)
ollama pull mistral

# Or use other models:
ollama pull mistral:7b-instruct    # Instruction-tuned version
ollama pull mixtral:8x7b           # Larger, more capable model
ollama pull llama2                 # Alternative model
```

## Step 3: Configure AnonDocs

Edit your `.env` file:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Set Ollama as default provider
DEFAULT_LLM_PROVIDER=ollama

# Optional: Keep other providers configured
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Start AnonDocs

```bash
npm run dev
```

## Usage

### Use Ollama for All Documents (Default)
If you set `DEFAULT_LLM_PROVIDER=ollama` in `.env`, all documents will use Ollama by default:

```bash
# Upload document
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@document.pdf"

# Anonymize (will use Ollama by default)
curl -X POST http://localhost:3000/api/documents/{doc-id}/anonymize \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Explicitly Choose Ollama
```bash
curl -X POST http://localhost:3000/api/documents/{doc-id}/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "ollama"}'
```

### Switch Between Providers
```bash
# Use OpenAI for this document
curl -X POST http://localhost:3000/api/documents/{doc-id}/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai"}'

# Use Ollama for another document
curl -X POST http://localhost:3000/api/documents/{doc-id2}/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "ollama"}'
```

## Available Ollama Models

| Model | Size | RAM Required | Best For |
|-------|------|--------------|----------|
| mistral | 7B | 8GB | General use, good balance |
| mistral:7b-instruct | 7B | 8GB | Following instructions |
| mixtral:8x7b | 47B | 32GB | Complex tasks, high quality |
| llama2 | 7B | 8GB | Alternative to Mistral |
| llama2:13b | 13B | 16GB | Better quality |
| codellama | 7B | 8GB | Code-heavy documents |

## Change the Model

To use a different model:

1. Pull it:
```bash
ollama pull mixtral:8x7b
```

2. Update `.env`:
```env
OLLAMA_MODEL=mixtral:8x7b
```

3. Restart AnonDocs

## Troubleshooting

### "LLM provider 'ollama' is not configured"

**Cause**: Ollama server is not running or `OLLAMA_BASE_URL` is not set.

**Solution**:
```bash
# Make sure Ollama is running
ollama serve

# Check your .env has:
OLLAMA_BASE_URL=http://localhost:11434
```

### Slow Processing

**Cause**: Model is large or running on CPU.

**Solutions**:
- Use a smaller model (mistral instead of mixtral)
- Ensure you have enough RAM
- Use GPU acceleration if available
- Reduce chunk size in configuration

### Connection Refused

**Cause**: Ollama not running or wrong port.

**Solution**:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Should return list of models
```

### Model Not Found

**Cause**: Model not downloaded.

**Solution**:
```bash
# Pull the model
ollama pull mistral

# List available models
ollama list
```

## Performance Comparison

| Provider | Speed | Cost | Privacy | Quality |
|----------|-------|------|---------|---------|
| Ollama (Mistral) | Medium | Free | ✅ Local | Good |
| OpenAI (GPT-4) | Fast | $$ | ☁️ Cloud | Excellent |
| Anthropic (Claude) | Fast | $$ | ☁️ Cloud | Excellent |

## Docker Setup with Ollama

If running AnonDocs in Docker, you'll need to configure network access to Ollama:

### Option 1: Run Ollama on Host
```env
# In .env
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### Option 2: Run Ollama in Docker
Add to `docker-compose.yml`:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - anondocs-network

  api:
    # ... existing configuration
    environment:
      OLLAMA_BASE_URL: http://ollama:11434
    depends_on:
      - ollama

volumes:
  ollama_data:
```

Then pull models in the container:
```bash
docker exec -it ollama-container ollama pull mistral
```

## Production Considerations

### Advantages of Ollama
- No API costs
- Complete data privacy
- No rate limits
- Offline operation

### Disadvantages
- Requires powerful hardware
- Slower than cloud APIs
- Need to manage infrastructure
- Limited to smaller models

### Recommendations
- Use Ollama for sensitive documents
- Use cloud APIs for high-volume processing
- Mix providers based on document sensitivity
- Monitor resource usage

## Advanced Configuration

### Custom Ollama Host
```env
# Remote Ollama server
OLLAMA_BASE_URL=http://192.168.1.100:11434
OLLAMA_MODEL=mistral
```

### Multiple Models
You can't configure multiple Ollama models simultaneously, but you can change models by:
1. Updating `OLLAMA_MODEL` in `.env`
2. Restarting the service

### Model Parameters
To customize model behavior, edit `src/services/llm.service.ts`:

```typescript
new ChatOllama({
  baseUrl: config.llm.ollama.baseUrl,
  model: config.llm.ollama.model,
  temperature: 0,        // Change for creativity
  numPredict: 2048,     // Max tokens to generate
  topK: 40,             // Top-k sampling
  topP: 0.9,            // Top-p sampling
})
```

## Resources

- Ollama Documentation: https://github.com/ollama/ollama
- Model Library: https://ollama.ai/library
- LangChain Ollama: https://js.langchain.com/docs/integrations/chat/ollama

## Support

If you encounter issues:
1. Check Ollama is running: `ollama list`
2. Test Ollama directly: `ollama run mistral "Hello"`
3. Check logs: `docker logs anondocs-api` (if using Docker)
4. Open an issue on GitHub

Happy local anonymizing! 🚀


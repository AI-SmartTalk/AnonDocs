# How to Switch Between LLM Providers

Quick guide to easily switch between different LLM providers using environment variables.

## 🚀 Quick Switch Commands

### Switch to Ollama (Local, Free)
```bash
# Edit .env
DEFAULT_LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Restart server
npm run dev
```

### Switch to OpenAI
```bash
# Edit .env
DEFAULT_LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4

# Restart server
npm run dev
```

### Switch to Anthropic
```bash
# Edit .env
DEFAULT_LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Restart server
npm run dev
```

---

## 📝 Copy-Paste .env Templates

### Template 1: Ollama Only (Free & Local)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
DEFAULT_LLM_PROVIDER=ollama

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Template 2: OpenAI Only
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4
DEFAULT_LLM_PROVIDER=openai

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Template 3: LM Studio (Local OpenAI-compatible)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_MODEL=local-model
OPENAI_API_KEY=lm-studio
DEFAULT_LLM_PROVIDER=openai

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Template 4: All Providers (Switch Anytime!)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://anondocs:anondocs_password@localhost:5432/anondocs?schema=public"

# OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Use Ollama by default, but can override per document
DEFAULT_LLM_PROVIDER=ollama

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

---

## 🔧 Advanced Customization

### Custom Base URLs

**Use a remote Ollama server:**
```env
OLLAMA_BASE_URL=http://192.168.1.100:11434
OLLAMA_MODEL=mistral
```

**Use LocalAI:**
```env
OPENAI_BASE_URL=http://localhost:8080/v1
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=not-needed
DEFAULT_LLM_PROVIDER=openai
```

**Use Azure OpenAI:**
```env
OPENAI_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment
OPENAI_API_KEY=your-azure-key
OPENAI_MODEL=gpt-4
DEFAULT_LLM_PROVIDER=openai
```

### Change Temperature (Creativity)

```env
# More focused (default)
OPENAI_TEMPERATURE=0
OLLAMA_TEMPERATURE=0
ANTHROPIC_TEMPERATURE=0

# More creative
OPENAI_TEMPERATURE=0.7
OLLAMA_TEMPERATURE=0.7
```

### Change Model Settings

```env
# Use different OpenAI models
OPENAI_MODEL=gpt-4-turbo-preview  # Faster
OPENAI_MODEL=gpt-3.5-turbo        # Cheaper

# Use different Ollama models
OLLAMA_MODEL=mistral              # 7B, balanced
OLLAMA_MODEL=mixtral:8x7b         # 47B, better quality
OLLAMA_MODEL=llama2               # Alternative

# Use different Claude models
ANTHROPIC_MODEL=claude-3-opus-20240229     # Best quality
ANTHROPIC_MODEL=claude-3-sonnet-20240229   # Balanced
ANTHROPIC_MODEL=claude-3-haiku-20240307    # Fast & cheap
```

---

## 🎯 Per-Document Provider Override

Even with a default provider, you can choose per document:

```bash
# Use default provider (from .env)
curl -X POST http://localhost:3000/api/documents/{id}/anonymize

# Force use of Ollama
curl -X POST http://localhost:3000/api/documents/{id}/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "ollama"}'

# Force use of OpenAI (even if Ollama is default)
curl -X POST http://localhost:3000/api/documents/{id}/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai"}'

# Force use of Anthropic
curl -X POST http://localhost:3000/api/documents/{id}/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "anthropic"}'
```

---

## 🔍 Verify Your Configuration

When you start the server with `npm run dev`, you'll see:

```
✓ OpenAI initialized: gpt-4
✓ Ollama initialized: mistral (http://localhost:11434)
📋 Available providers: openai, ollama
🎯 Default provider: ollama
AnonDocs API running on port 3000
```

If you see:
```
⚠️  No LLM providers configured!
```

Then check your `.env` file - you need at least one provider configured!

---

## 💡 Recommendations

| Scenario | Recommended Setup |
|----------|-------------------|
| **Development** | Ollama (free, no limits) |
| **Production - High Volume** | OpenAI/Anthropic (fast, reliable) |
| **Production - Sensitive Data** | Ollama (data stays local) |
| **Testing** | Ollama (no cost) |
| **Best Quality** | GPT-4 or Claude 3 Opus |
| **Budget Conscious** | Ollama or GPT-3.5-turbo |

---

## 🆘 Troubleshooting

### "No LLM providers configured"
**Solution:** Set at least one provider in `.env`:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

### "LLM provider 'ollama' is not configured"
**Solution:** Make sure Ollama server is running:
```bash
ollama serve
```

### "OpenAI API key invalid"
**Solution:** Check your API key is correct and has no spaces:
```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### Custom base URL not working
**Solution:** Include the full path, including `/v1`:
```env
OPENAI_BASE_URL=http://localhost:1234/v1
```

---

## 📚 Related Documentation

- [ENV_EXAMPLES.md](ENV_EXAMPLES.md) - Complete configuration examples
- [OLLAMA_SETUP.md](OLLAMA_SETUP.md) - Ollama setup guide
- [QUICK_OLLAMA_START.md](QUICK_OLLAMA_START.md) - 3-minute Ollama setup

---

**Need to switch providers? Just edit `.env` and restart!** 🚀


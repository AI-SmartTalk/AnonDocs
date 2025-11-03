import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  llm: {
    // OpenAI or OpenAI-compatible APIs (LocalAI, LM Studio, etc.)
    openai:
      process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL
        ? {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-4',
            baseURL: process.env.OPENAI_BASE_URL, // Optional: for OpenAI-compatible APIs
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0'),
          }
        : undefined,

    // Anthropic Claude
    anthropic: process.env.ANTHROPIC_API_KEY
      ? {
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
          temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0'),
        }
      : undefined,

    // Ollama (local LLMs)
    ollama: process.env.OLLAMA_BASE_URL
      ? {
          baseUrl: process.env.OLLAMA_BASE_URL,
          model: process.env.OLLAMA_MODEL || 'mistral',
          temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0'),
        }
      : undefined,

    // Default provider selection
    defaultProvider: (process.env.DEFAULT_LLM_PROVIDER || 'openai') as
      | 'openai'
      | 'anthropic'
      | 'ollama',
  },
  chunking: {
    chunkSize: parseInt(process.env.CHUNK_SIZE || '1500', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '200', 10),
  },
} as const;

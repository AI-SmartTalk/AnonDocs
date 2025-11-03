import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../config';

export type LLMProvider = 'openai' | 'anthropic' | 'ollama';

export interface AnonymizationResult {
  anonymizedText: string;
  piiDetected: {
    names: string[];
    addresses: string[];
    emails: string[];
    phoneNumbers: string[];
    dates: string[];
    organizations: string[];
    other: string[];
  };
}

export class LLMService {
  private models: Map<LLMProvider, BaseChatModel> = new Map();

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    // Initialize OpenAI (or OpenAI-compatible APIs like LocalAI, LM Studio)
    if (config.llm.openai) {
      const openaiConfig: any = {
        modelName: config.llm.openai.model,
        temperature: config.llm.openai.temperature,
      };

      // Add API key if provided (not needed for some local setups)
      if (config.llm.openai.apiKey) {
        openaiConfig.openAIApiKey = config.llm.openai.apiKey;
      }

      // Add custom base URL if provided (for OpenAI-compatible APIs)
      if (config.llm.openai.baseURL) {
        openaiConfig.configuration = {
          baseURL: config.llm.openai.baseURL,
        };
      }

      this.models.set('openai', new ChatOpenAI(openaiConfig));
      console.log(
        `✓ OpenAI initialized: ${config.llm.openai.model}${
          config.llm.openai.baseURL ? ` (${config.llm.openai.baseURL})` : ''
        }`
      );
    }

    // Initialize Anthropic
    if (config.llm.anthropic) {
      this.models.set(
        'anthropic',
        new ChatAnthropic({
          anthropicApiKey: config.llm.anthropic.apiKey,
          modelName: config.llm.anthropic.model,
          temperature: config.llm.anthropic.temperature,
        })
      );
      console.log(`✓ Anthropic initialized: ${config.llm.anthropic.model}`);
    }

    // Initialize Ollama (local LLM runtime)
    if (config.llm.ollama) {
      this.models.set(
        'ollama',
        new ChatOllama({
          baseUrl: config.llm.ollama.baseUrl,
          model: config.llm.ollama.model,
          temperature: config.llm.ollama.temperature,
        })
      );
      console.log(
        `✓ Ollama initialized: ${config.llm.ollama.model} (${config.llm.ollama.baseUrl})`
      );
    }

    // Log available providers
    const providers = Array.from(this.models.keys());
    if (providers.length === 0) {
      console.warn('⚠️  No LLM providers configured! Please set up at least one provider in .env');
    } else {
      console.log(`📋 Available providers: ${providers.join(', ')}`);
      console.log(`🎯 Default provider: ${config.llm.defaultProvider}`);
    }
  }

  async anonymizeChunk(text: string, provider?: LLMProvider): Promise<AnonymizationResult> {
    const selectedProvider = provider || config.llm.defaultProvider;
    const model = this.models.get(selectedProvider);

    if (!model) {
      throw new Error(
        `LLM provider "${selectedProvider}" is not configured. ` +
          `Please check your environment variables (${selectedProvider.toUpperCase()}_BASE_URL, ${selectedProvider.toUpperCase()}_MODEL).`
      );
    }

    const systemPrompt = `You are an expert document anonymization assistant. Your task is to:
1. Identify and remove all Personally Identifiable Information (PII) from the text
2. Replace PII with generic placeholders like [NAME], [ADDRESS], [EMAIL], [PHONE], [DATE], [ORGANIZATION]
3. Maintain the document's structure and readability
4. Return both the anonymized text and a JSON list of detected PII

Keep the original language of the text.

PII includes:
- Personal names
- Physical addresses
- Email addresses
- Phone numbers
- Dates of birth or identifying dates
- Organization names that could identify individuals
- ID numbers (social security, passport, driver's license, etc.)
- Financial information (credit card, bank account numbers)

Respond with a JSON object in this exact format:
{
  "anonymizedText": "the anonymized text here",
  "piiDetected": {
    "names": ["list of detected names"],
    "addresses": ["list of detected addresses"],
    "emails": ["list of detected emails"],
    "phoneNumbers": ["list of detected phone numbers"],
    "dates": ["list of detected dates"],
    "organizations": ["list of detected organizations"],
    "other": ["any other PII detected"]
  }
}`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Anonymize the following text:\n\n${text}`),
    ];

    try {
      const response = await model.invoke(messages);
      const content = response.content.toString();

      try {
        // Extract JSON from response (handle cases where LLM adds markdown formatting)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const result = JSON.parse(jsonMatch[0]) as AnonymizationResult;
        return result;
      } catch (error) {
        console.error('Failed to parse LLM response:', content);
        throw new Error('Failed to parse anonymization response from LLM');
      }
    } catch (error: any) {
      // Handle connection errors with helpful messages
      if (error.cause) {
        const cause = error.cause;

        if (cause.code === 'ECONNREFUSED' || cause.code === 'ENOTFOUND') {
          const providerInfo = this.getProviderConnectionInfo(selectedProvider);
          throw new Error(
            `Cannot connect to ${selectedProvider.toUpperCase()} at ${providerInfo.url}. ` +
              `${providerInfo.suggestion}`
          );
        }

        if (cause.code === 'ETIMEDOUT') {
          throw new Error(
            `Connection timeout to ${selectedProvider.toUpperCase()}. The LLM server is not responding.`
          );
        }
      }

      // Re-throw original error if not a connection issue
      throw error;
    }
  }

  private getProviderConnectionInfo(provider: LLMProvider): { url: string; suggestion: string } {
    switch (provider) {
      case 'ollama':
        const ollamaUrl = config.llm.ollama?.baseUrl || 'not configured';
        return {
          url: ollamaUrl,
          suggestion: 'Make sure Ollama is running (ollama serve) and accessible at this URL.',
        };
      case 'openai':
        const openaiUrl = config.llm.openai?.baseURL || 'https://api.openai.com/v1';
        return {
          url: openaiUrl,
          suggestion: 'Check your network connection and API key configuration.',
        };
      case 'anthropic':
        return {
          url: 'https://api.anthropic.com',
          suggestion: 'Check your network connection and API key configuration.',
        };
      default:
        return {
          url: 'unknown',
          suggestion: 'Check your provider configuration.',
        };
    }
  }

  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.models.keys());
  }
}

export const llmService = new LLMService();

import { LLMProvider } from './llm.service';

export type ProviderFailure = 'auth' | 'unreachable' | 'error';

interface ProviderState {
  lastFailure?: ProviderFailure;
  lastFailureAt?: string;
  lastSuccessAt?: string;
}

/**
 * Santé passive des fournisseurs, déduite des vrais appels : un health-check
 * qui interrogerait le modèle serait facturé à chaque sonde. Une clé révoquée
 * passe donc l'état en `auth` dès le premier appel refusé.
 */
class ProviderHealthService {
  private states = new Map<LLMProvider, ProviderState>();

  recordSuccess(provider: LLMProvider): void {
    this.states.set(provider, { lastSuccessAt: new Date().toISOString() });
  }

  recordFailure(provider: LLMProvider, error: unknown): void {
    const previous = this.states.get(provider) ?? {};
    this.states.set(provider, {
      ...previous,
      lastFailure: classify(error),
      lastFailureAt: new Date().toISOString(),
    });
  }

  get(provider: LLMProvider): ProviderState {
    return this.states.get(provider) ?? {};
  }
}

function classify(error: unknown): ProviderFailure {
  const err = error as { status?: number; code?: string; cause?: { code?: string } };
  if (err?.status === 401 || err?.status === 403) return 'auth';
  const code = err?.cause?.code ?? err?.code;
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') return 'unreachable';
  return 'error';
}

export const providerHealthService = new ProviderHealthService();

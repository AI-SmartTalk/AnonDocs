/**
 * Erreur dont le message peut être montré au client tel quel.
 *
 * Toute autre erreur (SDK du fournisseur, réseau, parsing) est remplacée par un
 * message générique : celles des fournisseurs recopient des fragments de clé
 * d'API et des noms de variables d'environnement.
 */
export class ClientSafeError extends Error {}

const GENERIC_MESSAGE = 'Anonymization failed. Please try again later.';

export function toClientMessage(error: unknown): string {
  return error instanceof ClientSafeError ? error.message : GENERIC_MESSAGE;
}

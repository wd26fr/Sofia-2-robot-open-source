import { AiProviderConfig } from '../types';

const AI_CONFIG_KEY = 'sofia_ai_provider_config_v2';

export const DEFAULT_AI_CONFIG: AiProviderConfig = {
  provider: 'gemini',
  apiKey: '',
  baseUrl: '',
  modelName: 'gemini-3.1-flash-lite'
};

export function getStoredAiConfig(): AiProviderConfig {
  try {
    const saved = localStorage.getItem(AI_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration automatique si un modèle obsolète (ex: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash) était mémorisé
      if (
        parsed.provider === 'gemini' &&
        (!parsed.modelName ||
          parsed.modelName.startsWith('gemini-2.') ||
          parsed.modelName.startsWith('gemini-1.'))
      ) {
        parsed.modelName = 'gemini-3.1-flash-lite';
        saveStoredAiConfig(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Erreur lecture config AI locale:', err);
  }
  return DEFAULT_AI_CONFIG;
}

export function saveStoredAiConfig(config: AiProviderConfig): void {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Erreur sauvegarde config AI locale:', err);
  }
}

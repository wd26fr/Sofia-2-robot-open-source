import React, { useState, useEffect } from 'react';
import { AiProviderConfig, AiProviderType } from '../types';
import { getStoredAiConfig, saveStoredAiConfig, DEFAULT_AI_CONFIG } from '../lib/aiConfig';
import { 
  Cpu, 
  Key, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  X,
  Server,
  Zap
} from 'lucide-react';

interface AiProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: AiProviderConfig) => void;
}

const PROVIDER_OPTIONS: {
  id: AiProviderType;
  nom: string;
  defaultModel: string;
  placeholderKey: string;
  description: string;
  requiresBaseUrl?: boolean;
  defaultBaseUrl?: string;
}[] = [
  {
    id: 'gemini',
    nom: 'Google Gemini',
    defaultModel: 'gemini-3.1-flash-lite',
    placeholderKey: 'AIzaSy... (ou vide pour utiliser la clé serveur)',
    description: 'Modèle haute performance par défaut pour les émotions et le raisonnement physique.'
  },
  {
    id: 'openai',
    nom: 'OpenAI (GPT-4o / ChatGPT)',
    defaultModel: 'gpt-4o-mini',
    placeholderKey: 'sk-proj-...',
    description: 'Compatible avec tous les modèles OpenAI (GPT-4o, GPT-4o-mini, o1-mini).'
  },
  {
    id: 'anthropic',
    nom: 'Anthropic Claude',
    defaultModel: 'claude-3-5-haiku-20241022',
    placeholderKey: 'sk-ant-...',
    description: 'Haute subtilité littéraire, ton naturel et sensibilité empathique.'
  },
  {
    id: 'mistral',
    nom: 'Mistral AI (France)',
    defaultModel: 'mistral-small-latest',
    placeholderKey: 'mistral-...',
    description: 'IA souveraine française, excellente maîtrise des nuances linguistiques francophones.'
  },
  {
    id: 'groq',
    nom: 'Groq (Ultra-Rapide LPU)',
    defaultModel: 'llama-3.3-70b-versatile',
    placeholderKey: 'gsk_...',
    description: 'Inférence ultra-rapide (<300ms) propulsée par architecture LPU.'
  },
  {
    id: 'deepseek',
    nom: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    placeholderKey: 'sk-...',
    description: 'Modèle DeepSeek V3 pour raisonnement conversationnel économique.'
  },
  {
    id: 'custom_ollama',
    nom: 'Ollama / Endpoint Local / Custom',
    defaultModel: 'llama3.2',
    placeholderKey: 'Facultatif ou clé personnalisée',
    description: 'Connectez un serveur Ollama, vLLM ou n\'importe quelle API compatible OpenAI.',
    requiresBaseUrl: true,
    defaultBaseUrl: 'http://localhost:11434/v1'
  }
];

export const AiProviderSettingsModal: React.FC<AiProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [config, setConfig] = useState<AiProviderConfig>(getStoredAiConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredAiConfig());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProviderMeta = PROVIDER_OPTIONS.find(p => p.id === config.provider) || PROVIDER_OPTIONS[0];

  const handleProviderChange = (newProvider: AiProviderType) => {
    const meta = PROVIDER_OPTIONS.find(p => p.id === newProvider);
    setConfig(prev => ({
      ...prev,
      provider: newProvider,
      modelName: meta?.defaultModel || prev.modelName,
      baseUrl: meta?.requiresBaseUrl ? (meta.defaultBaseUrl || '') : ''
    }));
  };

  const handleSave = () => {
    saveStoredAiConfig(config);
    setSavedSuccess(true);
    if (onSaved) onSaved(config);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a0a10] border border-cyan-500/30 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Fournisseur d'IA Multi-Plateforme</h3>
              <p className="text-xs text-slate-400">Clé API universelle : Gemini, OpenAI, Claude, Mistral, Groq, DeepSeek, Ollama</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Provider Selector */}
          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-1.5 uppercase tracking-wider">
              1. Sélectionnez le fournisseur d'IA
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROVIDER_OPTIONS.map((prov) => {
                const isSelected = config.provider === prov.id;
                return (
                  <button
                    key={prov.id}
                    onClick={() => handleProviderChange(prov.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                    }`}
                  >
                    <span className="font-semibold block truncate">{prov.nom.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-500 truncate mt-1">{prov.defaultModel}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic">
              {currentProviderMeta.description}
            </p>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                2. Clé API ({currentProviderMeta.nom})
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Stockée localement dans votre navigateur</span>
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={currentProviderMeta.placeholderKey}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white placeholder-slate-600"
            />
          </div>

          {/* Model Name Input */}
          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              3. Nom du modèle
            </label>
            <input
              type="text"
              value={config.modelName}
              onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
              placeholder={currentProviderMeta.defaultModel}
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white placeholder-slate-600"
            />
          </div>

          {/* Base URL Input if needed */}
          {(currentProviderMeta.requiresBaseUrl || config.provider === 'custom_ollama') && (
            <div>
              <label className="block text-xs font-mono text-cyan-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                URL de Base (Endpoint personnalisé)
              </label>
              <input
                type="text"
                value={config.baseUrl || ''}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="http://localhost:11434/v1"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white placeholder-slate-600"
              />
            </div>
          )}

          {/* Security note */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Liberté totale :</strong> Votre clé API n'est jamais sauvegardée sur nos serveurs de façon permanente. Elle transite uniquement pour proxyfier vos requêtes vers le fournisseur de votre choix.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              setConfig(DEFAULT_AI_CONFIG);
              saveStoredAiConfig(DEFAULT_AI_CONFIG);
            }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Réinitialiser
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)]"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

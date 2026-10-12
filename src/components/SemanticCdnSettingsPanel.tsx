import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Zap,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  SemanticCdnConfig,
  getSemanticCdnConfig,
  saveSemanticCdnConfig,
  resetSemanticCdnConfig,
  verifySemanticCoherence,
  SemanticVerificationResult
} from '../lib/semanticCdnMatcher';

export const SemanticCdnSettingsPanel: React.FC = () => {
  const [config, setConfig] = useState<SemanticCdnConfig>(getSemanticCdnConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sandbox de test
  const [testInput, setTestInput] = useState("Bonjour Sofia, comment tu vas aujourd'hui ?");
  const [testTarget, setTestTarget] = useState("Bonjour mon cher ami ! Je vais très bien.");
  const [testKeywords, setTestKeywords] = useState("bonjour, salut, coucou");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<SemanticVerificationResult | null>(null);

  useEffect(() => {
    setConfig(getSemanticCdnConfig());
  }, []);

  const handleSave = () => {
    saveSemanticCdnConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    const def = resetSemanticCdnConfig();
    setConfig(def);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    const keywordsList = testKeywords.split(',').map(k => k.trim()).filter(Boolean);
    const result = await verifySemanticCoherence(testInput, testTarget, keywordsList, config);
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-wide">
                Moteur IA CDN & Filtre Sémantique Anti-Faux Positifs (0-Token)
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                config.enabled 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {config.enabled ? 'ACTIF' : 'DÉSACTIVÉ'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Valide la relation sémantique entre l'entrée utilisateur et la réponse locale pour éliminer les déclenchements accidentels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Restaurer la configuration CDN par défaut"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Par défaut
          </button>
          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/30 cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" /> Enregistré !
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CDN URL */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>URL du CDN IA (Script Transformers.js / ONNX)</span>
              <span className="text-[10px] text-cyan-400 font-mono">CDN configurable</span>
            </label>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-slate-500">Presets :</span>
              <button
                onClick={() => setConfig(prev => ({ ...prev, cdnUrl: 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js' }))}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                jsDelivr
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => setConfig(prev => ({ ...prev, cdnUrl: 'https://unpkg.com/@xenova/transformers@2.17.2/dist/transformers.min.js' }))}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Unpkg
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => setConfig(prev => ({ ...prev, cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/transformers/2.17.2/transformers.min.js' }))}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Cloudflare
              </button>
            </div>
          </div>
          <input
            type="text"
            value={config.cdnUrl}
            onChange={(e) => setConfig(prev => ({ ...prev, cdnUrl: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            placeholder="https://cdn.jsdelivr.net/npm/@xenova/transformers..."
          />
        </div>

        {/* Model Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Modèle d'Embeddings / Comparaison Sémantique
          </label>
          <input
            type="text"
            value={config.modelName}
            onChange={(e) => setConfig(prev => ({ ...prev, modelName: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            placeholder="Xenova/all-MiniLM-L6-v2"
          />
        </div>

        {/* Similarity Threshold */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Seuil de Proximité Sémantique Minimale</span>
            <span className="text-cyan-400 font-mono font-bold">
              {Math.round(config.similarityThreshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.90"
            step="0.02"
            value={config.similarityThreshold}
            onChange={(e) => setConfig(prev => ({ ...prev, similarityThreshold: parseFloat(e.target.value) }))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>30% (Tolérant)</span>
            <span>62% (Équilibré)</span>
            <span>90% (Strict)</span>
          </div>
        </div>

        {/* Negation Guard Toggle */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Garde-fou Négation & Refus</span>
            <span className="text-[11px] text-slate-400">Rejette automatiquement si l'utilisateur dit "ne me dis pas...", "arrête de...", "déteste".</span>
          </div>
          <button
            type="button"
            onClick={() => setConfig(prev => ({ ...prev, negationGuard: !prev.negationGuard }))}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              config.negationGuard ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                config.negationGuard ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Enable / Disable Verification */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Activer le Vérificateur Sémantique</span>
            <span className="text-[11px] text-slate-400">Passe les déclencheurs déterministes par ce filtre avant de valider la réponse.</span>
          </div>
          <button
            type="button"
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              config.enabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Interactive Semantic Testbed */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Banc d'Essai du Filtre Sémantique Anti-Faux Positifs
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Test direct en mémoire</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Phrase utilisateur testée :</label>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
              placeholder="Ex: Ne me dis pas bonjour !"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Mots-clés déclencheurs de la règle :</label>
            <input
              type="text"
              value={testKeywords}
              onChange={(e) => setTestKeywords(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
              placeholder="bonjour, salut"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-slate-400 font-medium">Réponse cible attendue :</label>
            <input
              type="text"
              value={testTarget}
              onChange={(e) => setTestTarget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
              placeholder="Ex: Bonjour ! Je suis Sofia..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleRunTest}
            disabled={isTesting}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Tester la cohérence sémantique
          </button>

          {/* Quick preset queries */}
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span className="text-slate-500 self-center">Essayer :</span>
            <button
              onClick={() => {
                setTestInput("Ne me dis surtout pas bonjour !");
                setTestKeywords("bonjour, salut");
                setTestTarget("Bonjour mon amour !");
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-mono cursor-pointer border border-rose-500/20"
            >
              Faux positif (Négation)
            </button>
            <button
              onClick={() => {
                setTestInput("Bonjour ma chérie, tu vas bien ?");
                setTestKeywords("bonjour, salut");
                setTestTarget("Bonjour ! Je vais très bien.");
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono cursor-pointer border border-emerald-500/20"
            >
              Vrai positif (Cohérent)
            </button>
          </div>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 mt-2 ${
            testResult.isValid
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
          }`}>
            {testResult.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {testResult.isValid 
                    ? '✅ Match Local 0-Token Validé Sémantiquement' 
                    : '🚫 Match Rejeté (Routage sécurisé vers le LLM Gemini)'}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10">
                  Score : {Math.round(testResult.score * 100)}% • Moteur : {testResult.engineUsed}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{testResult.reason}</p>
              {testResult.isNegationDetected && (
                <div className="text-[10px] text-rose-300 font-mono">
                  Garde-fou actif : Négation ou opposition détectée dans la phrase saisie.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

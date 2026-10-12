import React, { useState } from 'react';
import { Sparkles, Bot, Terminal, Plus, Trash2, Check, RefreshCw, Cpu, HelpCircle, X, ShieldAlert, Zap, Layers, Flame, Heart, Smile, Sun, Moon, Coffee, HeartHandshake, Laugh } from 'lucide-react';
import { LocalDeterministicRule, RobotPersonality, DeterministicBranchResponse, GAUGE_LABELS, EmotionalGauges } from '../types';

interface AiRuleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  onInsertRule?: (rule: LocalDeterministicRule) => void;
  onRuleGenerated?: (rule: LocalDeterministicRule) => void;
}

export const AiRuleGeneratorModal: React.FC<AiRuleGeneratorModalProps> = ({
  isOpen,
  onClose,
  robot,
  onInsertRule,
  onRuleGenerated
}) => {
  const handleApply = (rule: LocalDeterministicRule) => {
    if (onInsertRule) onInsertRule(rule);
    if (onRuleGenerated) onRuleGenerated(rule);
  };
  const [prompt, setPrompt] = useState<string>(
    "Salutation matinale chaleureuse : souhaiter une merveilleuse journée avec tendresse si l'affection est élevée, demander comment s'est passée la nuit et proposer de passer un bon moment ensemble."
  );
  const [category, setCategory] = useState<string>('quotidien');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedRule, setGeneratedRule] = useState<LocalDeterministicRule | null>(null);
  const [activeBranchIndex, setActiveBranchIndex] = useState<number>(0);
  const [newVariantInputs, setNewVariantInputs] = useState<Record<number, string>>({});

  if (!isOpen) return null;

  const categories = [
    { id: 'quotidien', label: 'Routines & Quotidien', icon: Sun },
    { id: 'empathie', label: 'Écoute & Réconfort', icon: HeartHandshake },
    { id: 'humour', label: 'Humour & Complicité', icon: Laugh },
    { id: 'affection', label: 'Tendresse & Respect', icon: Heart },
    { id: 'gestuelle_ros', label: 'Mouvements ROS 2', icon: Cpu },
    { id: 'intimite', label: 'Intimité Sensuelle', icon: Flame },
  ];

  const quickPresets = [
    {
      title: "Salutation Matinale Chaleureuse (Touche 'B')",
      icon: Sun,
      category: 'quotidien',
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300",
      prompt: "Salutation matinale chaleureuse : souhaiter le bonjour avec tendresse si l'affection est élevée, demander comment s'est passée la nuit et proposer de passer un moment complice. Hausse bien-être (+8) et humeur (+8). Raccourci 'B'."
    },
    {
      title: "Écoute & Réconfort Bienveillant (Touche 'E')",
      icon: HeartHandshake,
      category: 'empathie',
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300",
      prompt: "Détection de fatigue ou coup de blues ('sale journée', 'je suis fatigué', 'j'en ai marre', 'stress'). Présence apaisante sans jugement, écoute attentive, hausse de bien-être (+12) et affection (+10). Raccourci 'E'."
    },
    {
      title: "Humour & Complicité Pétillante (Touche 'H')",
      icon: Laugh,
      category: 'humour',
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300",
      prompt: "Partager un bon mot ou un rire complice ('raconte une blague', 'fais-moi rire', 'haha'). Réparties pétillantes et joyeuses avec hausse d'humeur (+15) et rire communicatif. Raccourci 'H'."
    },
    {
      title: "Compliments & Respect Réciproque (Touche 'A')",
      icon: Heart,
      category: 'affection',
      color: "from-rose-500/20 to-purple-500/20 border-rose-500/40 text-rose-300",
      prompt: "Compliment ou marque de tendresse ('tu es adorable', 'j'aime ton sourire', 'merci pour tout'). Hausse affection (+12) et gratitude sincère valorisant le respect mutuel. Raccourci 'A'."
    },
    {
      title: "Caresse Tête & Regard ROS 2 (Touche 'C')",
      icon: Cpu,
      category: 'gestuelle_ros',
      color: "from-cyan-500/20 to-sky-500/20 border-cyan-500/40 text-cyan-300",
      prompt: "Caresse sur la tête '/sensor/tactile/head' ou commande 'regarde-moi avec douceur'. Réaction haptique apaisante, incline la tête et sourit via topics ROS. Raccourci 'C'."
    },
    {
      title: "Capteur Intime & Plaisir Sexuel (Touche 'S')",
      icon: Flame,
      category: 'intimite',
      color: "from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-300",
      prompt: "Capteur tactile érogène intime ou touche 'S' : variations graduées de sensualité selon le palier de plaisir sexuel (≥80%, ≥40%, <40%)."
    }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Veuillez saisir une description ou choisir un modèle prêt à l'emploi.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-deterministic-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          category,
          robot
        })
      });

      const data = await res.json();
      if (data.success && data.rule) {
        // Nettoyer et valider la structure
        const rule: LocalDeterministicRule = {
          ...data.rule,
          id: data.rule.id || `rule_${Date.now()}`
        };

        // S'assurer que chaque branche a ses variantes
        rule.reponses = (rule.reponses || []).map((b, idx) => ({
          ...b,
          id: b.id || `branch_${idx + 1}_${Date.now()}`,
          reponsesPossibles: Array.isArray(b.reponsesPossibles) && b.reponsesPossibles.length > 0
            ? b.reponsesPossibles
            : [b.texte || '']
        }));

        if (rule.reponseSinon) {
          rule.reponseSinon.reponsesPossibles = Array.isArray(rule.reponseSinon.reponsesPossibles) && rule.reponseSinon.reponsesPossibles.length > 0
            ? rule.reponseSinon.reponsesPossibles
            : [rule.reponseSinon.texte || ''];
        }

        setGeneratedRule(rule);
        setActiveBranchIndex(0);
      } else {
        setError(data.error || "Impossible de générer la règle.");
      }
    } catch (e: any) {
      console.error('Erreur génération aide IA règle:', e);
      setError("Erreur réseau lors de la génération. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariantToBranch = (branchIndex: number) => {
    const inputVal = (newVariantInputs[branchIndex] || '').trim();
    if (!inputVal || !generatedRule) return;

    const updated = { ...generatedRule };
    const branch = updated.reponses[branchIndex];
    if (branch) {
      const currentList = branch.reponsesPossibles || [branch.texte];
      if (!currentList.includes(inputVal)) {
        branch.reponsesPossibles = [...currentList, inputVal];
        setGeneratedRule(updated);
      }
      setNewVariantInputs(prev => ({ ...prev, [branchIndex]: '' }));
    }
  };

  const handleRemoveVariantFromBranch = (branchIndex: number, variantIndex: number) => {
    if (!generatedRule) return;
    const updated = { ...generatedRule };
    const branch = updated.reponses[branchIndex];
    if (branch && branch.reponsesPossibles) {
      const nextList = branch.reponsesPossibles.filter((_, i) => i !== variantIndex);
      branch.reponsesPossibles = nextList.length > 0 ? nextList : [branch.texte];
      if (nextList.length > 0 && branch.texte === branch.reponsesPossibles[variantIndex]) {
        branch.texte = nextList[0];
      }
      setGeneratedRule(updated);
    }
  };

  const handleSaveAndInsert = () => {
    if (!generatedRule) return;
    handleApply(generatedRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Aide IA : Générateur de Règle Déterministe & Multi-Réponses
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  0-Token Runtime
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Créez en langage naturel des règles matérielles (capteurs ROS, raccourcis clavier) avec répliques multiples aléatoires vivantes pour <strong>{robot.nom}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Thématique de l'interaction souhaitée :
              </span>
              <span className="text-[10px] text-slate-400">Généraliste & adaptable sur-mesure</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Modèles Prêts à l'Emploi (Cliquez pour charger) :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPresets.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(preset.prompt);
                      setCategory(preset.category);
                    }}
                    className={`p-3 rounded-xl bg-gradient-to-r ${preset.color} border text-left hover:brightness-110 transition-all flex items-start gap-2.5 cursor-pointer`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">{preset.title}</div>
                      <div className="text-[10px] opacity-80 line-clamp-2 mt-0.5">{preset.prompt}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span>Décrivez la règle souhaitée en français naturel :</span>
              <span className="text-[10px] text-slate-400">Routines, réconfort, humour, gestes ROS ou intimité</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Salutation matinale avec tendresse, ou réconfort après une rude journée, ou éclat de rire complice, ou commande ROS..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Generate Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Génération IA par Gemini avec fallback procédural instantané</span>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Conception de la Règle Déterministe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Générer la Règle & les Multi-Réponses</span>
                </>
              )}
            </button>
          </div>

          {/* Preview of Generated Rule */}
          {generatedRule && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Règle Prête
                    </span>
                    <h4 className="text-sm font-bold text-white">{generatedRule.nom}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{generatedRule.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {generatedRule.raccourciClavier && (
                    <span className="px-2 py-1 rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold">
                      Touche Clavier : [{generatedRule.raccourciClavier.toUpperCase()}]
                    </span>
                  )}
                  {generatedRule.declencheurCapteurRos && (
                    <span className="px-2 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold truncate max-w-[180px]">
                      ROS : {generatedRule.declencheurCapteurRos}
                    </span>
                  )}
                </div>
              </div>

              {/* Triggers recap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Mots-clés déclencheurs :</span>
                  <div className="flex flex-wrap gap-1">
                    {(generatedRule.motsCles || []).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10px] font-mono">
                        "{kw}"
                      </span>
                    ))}
                  </div>
                </div>
                {generatedRule.regexPattern && (
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 block mb-1">Capture Regex :</span>
                    <code className="text-[10px] text-purple-300 bg-purple-950/30 px-2 py-1 rounded block truncate">
                      /{generatedRule.regexPattern}/i
                    </code>
                  </div>
                )}
              </div>

              {/* Branches & Multi-Responses Variations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Branches & Variantes de Répliques Aléatoires ({generatedRule.reponses?.length || 0} branches) :
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Une phrase différente est dite aléatoirement à chaque déclenchement !
                  </span>
                </div>

                {/* Tabs for branches */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {(generatedRule.reponses || []).map((branch, bi) => (
                    <button
                      key={bi}
                      type="button"
                      onClick={() => setActiveBranchIndex(bi)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        activeBranchIndex === bi
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{branch.nomBranche || `Branche ${bi + 1}`}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[9px]">
                        {(branch.reponsesPossibles?.length || 1)} phrases
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active branch details */}
                {generatedRule.reponses[activeBranchIndex] && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    {/* Conditions on gauges */}
                    {generatedRule.reponses[activeBranchIndex].conditions && generatedRule.reponses[activeBranchIndex].conditions!.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">Condition requise :</span>
                        {generatedRule.reponses[activeBranchIndex].conditions!.map((c, ci) => (
                          <span key={ci} className="px-2 py-0.5 rounded-md bg-pink-950/40 border border-pink-500/30 text-pink-300 font-mono text-[10px]">
                            {GAUGE_LABELS[c.jauge]?.label || c.jauge} {c.operateur} {c.valeur}%
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Gauge modifiers */}
                    {generatedRule.reponses[activeBranchIndex].modificateursJauges && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">Impact émotionnel :</span>
                        {Object.entries(generatedRule.reponses[activeBranchIndex].modificateursJauges!).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
                            {GAUGE_LABELS[k as keyof EmotionalGauges]?.label || k} : {v > 0 ? `+${v}` : v}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Variations list */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <span>Variantes de répliques proposées (le robot en choisit une aléatoirement) :</span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          🎲 {generatedRule.reponses[activeBranchIndex].reponsesPossibles?.length || 1} variantes actives
                        </span>
                      </label>

                      <div className="space-y-1.5">
                        {(generatedRule.reponses[activeBranchIndex].reponsesPossibles || [generatedRule.reponses[activeBranchIndex].texte]).map((phrase, pi) => (
                          <div key={pi} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 group">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">#{pi + 1}</span>
                            <span className="text-xs text-white flex-1 font-medium italic">« {phrase} »</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantFromBranch(activeBranchIndex, pi)}
                              className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Supprimer cette variante"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new variant input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newVariantInputs[activeBranchIndex] || ''}
                          onChange={(e) => setNewVariantInputs({ ...newVariantInputs, [activeBranchIndex]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddVariantToBranch(activeBranchIndex);
                            }
                          }}
                          placeholder="Ajouter une autre réplique alternative pour cette branche..."
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddVariantToBranch(activeBranchIndex)}
                          className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Insert Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveAndInsert}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Insérer cette Règle dans {robot.nom} & Enregistrer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

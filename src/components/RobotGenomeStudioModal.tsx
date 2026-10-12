import React, { useState, useEffect } from 'react';
import { RobotPersonality, UserProfileLocal } from '../types';
import {
  Code,
  FileCode,
  FolderOpen,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BrainCircuit,
  Sliders,
  Users,
  Heart,
  Tag,
  Volume2,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { getStoredAiConfig } from '../lib/aiConfig';

interface RobotGenomeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  userProfile: UserProfileLocal;
  onUpdateRobot: (updated: RobotPersonality) => void;
  onUpdateUserProfile: (updated: UserProfileLocal) => void;
}

interface VirtualFile {
  id: string;
  name: string;
  path: string;
  category: string;
  icon: any;
  getContent: (robot: RobotPersonality, userProfile: UserProfileLocal) => string;
  applyContent: (content: string, robot: RobotPersonality, userProfile: UserProfileLocal) => {
    updatedRobot?: RobotPersonality;
    updatedUserProfile?: UserProfileLocal;
  };
}

const VIRTUAL_FILES: VirtualFile[] = [
  {
    id: 'identity.json',
    name: 'identity.json',
    path: 'brain/config/identity.json',
    category: 'Identité & Caractère',
    icon: Sparkles,
    getContent: (r) => JSON.stringify({
      nom: r.nom,
      titre: r.titre,
      ageApparent: r.ageApparent,
      description: r.description,
      temperament: r.temperament,
      traits: r.traits,
      attentes: r.attentes,
      philosophie: r.philosophie,
      citationFavorite: r.citationFavorite,
      vibeDating: r.vibeDating
    }, null, 2),
    applyContent: (content, r) => {
      const parsed = JSON.parse(content);
      return {
        updatedRobot: {
          ...r,
          nom: parsed.nom ?? r.nom,
          titre: parsed.titre ?? r.titre,
          ageApparent: parsed.ageApparent ?? r.ageApparent,
          description: parsed.description ?? r.description,
          temperament: parsed.temperament ?? r.temperament,
          traits: parsed.traits ?? r.traits,
          attentes: parsed.attentes ?? r.attentes,
          philosophie: parsed.philosophie ?? r.philosophie,
          citationFavorite: parsed.citationFavorite ?? r.citationFavorite,
          vibeDating: parsed.vibeDating ?? r.vibeDating
        }
      };
    }
  },
  {
    id: 'local-rules.json',
    name: 'local-rules.json',
    path: 'brain/cognitive/local-rules.json',
    category: 'Moteur Déterministe 0-Token',
    icon: BrainCircuit,
    getContent: (r) => JSON.stringify(r.reglesLocales || [], null, 2),
    applyContent: (content, r) => {
      const parsed = JSON.parse(content);
      return {
        updatedRobot: {
          ...r,
          reglesLocales: Array.isArray(parsed) ? parsed : r.reglesLocales
        }
      };
    }
  },
  {
    id: 'system-prompt.md',
    name: 'system-prompt.md',
    path: 'brain/prompts/system-prompt.md',
    category: 'Instructions IA Fondamentales',
    icon: FileText,
    getContent: (r) => r.promptSystemePrincipal || r.promptSystemePersonnalise || `# Instructions Système pour ${r.nom}\n\nAgir comme une compagne empathique, spontanée et attentive.`,
    applyContent: (content, r) => {
      return {
        updatedRobot: {
          ...r,
          promptSystemePrincipal: content,
          promptSystemePersonnalise: content
        }
      };
    }
  },
  {
    id: 'voice-dialogue.json',
    name: 'voice-dialogue.json',
    path: 'brain/voice/voice-dialogue.json',
    category: 'Synthèse Vocale & Élocution',
    icon: Volume2,
    getContent: (r) => JSON.stringify({
      voix: r.voix,
      dialogueConfig: r.dialogueConfig || {
        longueurReponse: 'equilibree',
        styleOral: 'naturel',
        frequenceRelance: 'normale'
      }
    }, null, 2),
    applyContent: (content, r) => {
      const parsed = JSON.parse(content);
      return {
        updatedRobot: {
          ...r,
          voix: parsed.voix || r.voix,
          dialogueConfig: parsed.dialogueConfig || r.dialogueConfig
        }
      };
    }
  },
  {
    id: 'psychological-profile.json',
    name: 'psychological-profile.json',
    path: 'brain/psychology/profiles.json',
    category: 'Profils Psychologiques',
    icon: Heart,
    getContent: (r, u) => JSON.stringify({
      robot: {
        specs: r.specs,
        evolutionPsychologique: r.evolutionPsychologique || {
          stadeAttachement: 'Affection grandissante',
          maturiteRelationnelle: 85
        }
      },
      utilisateur: {
        profilPsychologique: u.profilPsychologique || {
          traitsDominants: ['Curieux', 'Bienveillant'],
          besoinsAffectifs: ['Écoute active']
        }
      }
    }, null, 2),
    applyContent: (content, r, u) => {
      const parsed = JSON.parse(content);
      return {
        updatedRobot: parsed.robot?.evolutionPsychologique ? {
          ...r,
          evolutionPsychologique: parsed.robot.evolutionPsychologique
        } : undefined,
        updatedUserProfile: parsed.utilisateur?.profilPsychologique ? {
          ...u,
          profilPsychologique: parsed.utilisateur.profilPsychologique
        } : undefined
      };
    }
  },
  {
    id: 'relational-graph.json',
    name: 'relational-graph.json',
    path: 'brain/memory/relational-graph.json',
    category: 'Cercle Relationnel & Anecdotes',
    icon: Users,
    getContent: (_, u) => JSON.stringify({
      cercleRelationnel: u.cercleRelationnel || [],
      anecdotes: u.anecdotes || []
    }, null, 2),
    applyContent: (content, _, u) => {
      const parsed = JSON.parse(content);
      return {
        updatedUserProfile: {
          ...u,
          cercleRelationnel: parsed.cercleRelationnel || u.cercleRelationnel,
          anecdotes: parsed.anecdotes || u.anecdotes
        }
      };
    }
  },
  {
    id: 'tastes-evolution.json',
    name: 'tastes-evolution.json',
    path: 'brain/memory/tastes-evolution.json',
    category: 'Goûts & Passions',
    icon: Tag,
    getContent: (r) => JSON.stringify(r.gouts || [], null, 2),
    applyContent: (content, r) => {
      const parsed = JSON.parse(content);
      return {
        updatedRobot: {
          ...r,
          gouts: Array.isArray(parsed) ? parsed : r.gouts
        }
      };
    }
  },
  {
    id: 'memory-facts.json',
    name: 'memory-facts.json',
    path: 'brain/memory/user-facts.json',
    category: 'Faits Mémorisés Consolidés',
    icon: FileCode,
    getContent: (_, u) => JSON.stringify(u.faits || [], null, 2),
    applyContent: (content, _, u) => {
      const parsed = JSON.parse(content);
      return {
        updatedUserProfile: {
          ...u,
          faits: Array.isArray(parsed) ? parsed : u.faits
        }
      };
    }
  }
];

export const RobotGenomeStudioModal: React.FC<RobotGenomeStudioModalProps> = ({
  isOpen,
  onClose,
  robot,
  userProfile,
  onUpdateRobot,
  onUpdateUserProfile
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(VIRTUAL_FILES[0].id);
  const [editorContent, setEditorContent] = useState<string>('');
  const [hasSyntaxError, setHasSyntaxError] = useState<boolean>(false);
  const [syntaxErrorMessage, setSyntaxErrorMessage] = useState<string>('');
  const [history, setHistory] = useState<{ [fileId: string]: string[] }>({});
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // AI self-modify state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiModifying, setIsAiModifying] = useState<boolean>(false);
  const [aiProposal, setAiProposal] = useState<{
    modifiedContent: string;
    explanation: string;
    diffSummary: string[];
  } | null>(null);

  const currentFile = VIRTUAL_FILES.find(f => f.id === selectedFileId) || VIRTUAL_FILES[0];

  // Initialize content on file select or open
  useEffect(() => {
    if (isOpen) {
      const content = currentFile.getContent(robot, userProfile);
      setEditorContent(content);
      setAiProposal(null);
      setIsSaved(true);
      validateSyntax(content, currentFile.id);
    }
  }, [selectedFileId, isOpen]);

  if (!isOpen) return null;

  const validateSyntax = (content: string, fileId: string): boolean => {
    if (fileId.endsWith('.json')) {
      try {
        JSON.parse(content);
        setHasSyntaxError(false);
        setSyntaxErrorMessage('');
        return true;
      } catch (e: any) {
        setHasSyntaxError(true);
        setSyntaxErrorMessage(e.message || 'JSON non valide');
        return false;
      }
    }
    setHasSyntaxError(false);
    setSyntaxErrorMessage('');
    return true;
  };

  const handleEditorChange = (val: string) => {
    setEditorContent(val);
    setIsSaved(false);
    validateSyntax(val, currentFile.id);
  };

  const handleSaveManual = () => {
    if (!validateSyntax(editorContent, currentFile.id)) return;

    // Save previous to history
    const prevContent = currentFile.getContent(robot, userProfile);
    setHistory(prev => ({
      ...prev,
      [currentFile.id]: [...(prev[currentFile.id] || []), prevContent]
    }));

    // Apply
    const result = currentFile.applyContent(editorContent, robot, userProfile);
    if (result.updatedRobot) onUpdateRobot(result.updatedRobot);
    if (result.updatedUserProfile) onUpdateUserProfile(result.updatedUserProfile);

    setIsSaved(true);
    setAiProposal(null);
  };

  const handleRollback = () => {
    const fileHistory = history[currentFile.id] || [];
    if (fileHistory.length === 0) return;

    const previousContent = fileHistory[fileHistory.length - 1];
    setEditorContent(previousContent);

    // Apply previous
    const result = currentFile.applyContent(previousContent, robot, userProfile);
    if (result.updatedRobot) onUpdateRobot(result.updatedRobot);
    if (result.updatedUserProfile) onUpdateUserProfile(result.updatedUserProfile);

    setHistory(prev => ({
      ...prev,
      [currentFile.id]: fileHistory.slice(0, -1)
    }));
    setIsSaved(true);
    setAiProposal(null);
  };

  const handleAiModifyRequest = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiModifying(true);
    try {
      const activeAiConfig = getStoredAiConfig();
      const res = await fetch('/api/robot-files/ai-modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: currentFile.id,
          currentContent: editorContent,
          userRequest: aiPrompt,
          robot,
          aiConfig: activeAiConfig
        })
      });

      const data = await res.json();
      if (data.success && data.modifiedContent) {
        setAiProposal({
          modifiedContent: data.modifiedContent,
          explanation: data.explanation,
          diffSummary: data.diffSummary || []
        });
      }
    } catch (err) {
      console.error('Erreur auto-modification IA:', err);
    } finally {
      setIsAiModifying(false);
    }
  };

  const handleAcceptAiProposal = () => {
    if (!aiProposal) return;
    setEditorContent(aiProposal.modifiedContent);

    // Save previous to history
    const prevContent = currentFile.getContent(robot, userProfile);
    setHistory(prev => ({
      ...prev,
      [currentFile.id]: [...(prev[currentFile.id] || []), prevContent]
    }));

    const result = currentFile.applyContent(aiProposal.modifiedContent, robot, userProfile);
    if (result.updatedRobot) onUpdateRobot(result.updatedRobot);
    if (result.updatedUserProfile) onUpdateUserProfile(result.updatedUserProfile);

    setAiProposal(null);
    setAiPrompt('');
    setIsSaved(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canRollback = (history[currentFile.id] || []).length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0a0c10] border border-white/10 rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                Studio Génome & Auto-Édition des Fichiers ({robot.nom})
              </h3>
              <p className="text-[11px] text-slate-400">
                Accès introspectif aux modules cognitifs • Modification IA sécurisée sans risque de panne
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garde-fous Actifs • Rollback Sécurisé</span>
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-mono hover:bg-white/5 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Workspace Body: Sidebar + Editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-64 border-r border-white/10 bg-slate-950/50 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-white/5 text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Arborescence Cerveau</span>
            </div>

            <div className="p-2 space-y-1">
              {VIRTUAL_FILES.map((file) => {
                const Icon = file.icon;
                const isSelected = file.id === selectedFileId;
                const hasHist = (history[file.id] || []).length > 0;
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer font-mono ${
                      isSelected
                        ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    {hasHist && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 ml-1" title="Versions précédentes disponibles" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            <div className="mt-auto p-3 border-t border-white/5 bg-white/[0.02] text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Sécurité d'exécution</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                Chaque fichier représente un module cognitif. Le robot peut les inspecter et les ajuster sans risque d'altérer le serveur.
              </p>
            </div>
          </div>

          {/* Editor & AI Assistant Area */}
          <div className="flex-1 flex flex-col bg-[#07090e] overflow-hidden">
            {/* File Path & Action Toolbar */}
            <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-slate-950/40 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">src/</span>
                <span className="text-cyan-400">{currentFile.path}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  {currentFile.category}
                </span>
                {!isSaved && (
                  <span className="text-[10px] text-amber-400 font-sans italic">
                    (modifications non enregistrées)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canRollback && (
                  <button
                    onClick={handleRollback}
                    title="Restaurer la version précédente de ce fichier"
                    className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/40 text-xs flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rollback</span>
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-mono cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copier</span>
                </button>

                <button
                  onClick={handleSaveManual}
                  disabled={hasSyntaxError || isSaved}
                  className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 font-mono cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>

            {/* AI Auto-Modification Prompt Bar */}
            <div className="p-3 border-b border-white/10 bg-gradient-to-r from-indigo-950/30 via-slate-950/40 to-purple-950/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiModifyRequest()}
                    placeholder={`Demander à l'IA de modifier ${currentFile.name} (ex: "Ajoute une réaction tendre pour mon retour du travail")...`}
                    className="w-full bg-slate-900 border border-indigo-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
                <button
                  onClick={handleAiModifyRequest}
                  disabled={isAiModifying || !aiPrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(99,102,241,0.3)] disabled:opacity-50 transition-all font-mono shrink-0 cursor-pointer"
                >
                  {isAiModifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Modification en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Demander à l'IA</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Proposal Diff Viewer */}
              {aiProposal && (
                <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Proposition de modification par l'IA :</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAiProposal(null)}
                        className="px-2.5 py-1 rounded text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
                      >
                        Rejeter
                      </button>
                      <button
                        onClick={handleAcceptAiProposal}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)] cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Appliquer au Cerveau</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    "{aiProposal.explanation}"
                  </p>

                  {aiProposal.diffSummary && aiProposal.diffSummary.length > 0 && (
                    <ul className="text-[11px] text-indigo-200 list-disc list-inside space-y-0.5">
                      {aiProposal.diffSummary.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Syntax Error Alert */}
            {hasSyntaxError && (
              <div className="px-4 py-2 bg-rose-950/60 border-b border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shrink-0 font-mono">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Erreur de syntaxe : {syntaxErrorMessage}</span>
              </div>
            )}

            {/* Editor Textarea */}
            <div className="flex-1 relative overflow-hidden flex">
              <textarea
                value={editorContent}
                onChange={(e) => handleEditorChange(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-cyan-500/30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

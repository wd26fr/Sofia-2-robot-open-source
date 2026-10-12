import React, { useState } from 'react';
import { RobotPersonality, UserProfileLocal, UserMemoryFact, TasteEntry } from '../types';
import { 
  Brain, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Heart, 
  Smile, 
  Flame,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { getStoredAiConfig } from '../lib/aiConfig';

interface AdminMemoryManagerPanelProps {
  robot: RobotPersonality;
  clientMemories: string[];
  onUpdateClientMemories: (memories: string[]) => void;
  onUpdateRobot: (robot: RobotPersonality) => void;
}

export const AdminMemoryManagerPanel: React.FC<AdminMemoryManagerPanelProps> = ({
  robot,
  clientMemories,
  onUpdateClientMemories,
  onUpdateRobot
}) => {
  const [newMemory, setNewMemory] = useState('');
  const [newTasteNom, setNewTasteNom] = useState('');
  const [newTasteStatut, setNewTasteStatut] = useState<TasteEntry['statut']>('aime');
  const [newTasteComment, setNewTasteComment] = useState('');

  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileReport, setReconcileReport] = useState<{
    summary: string;
    duplicatesRemoved: number;
    success: boolean;
  } | null>(null);

  // Ajout manuel d'un souvenir
  const handleAddMemory = () => {
    if (!newMemory.trim()) return;
    const clean = newMemory.trim();
    // Vérification anti-doublon simple en local
    if (clientMemories.some(m => m.toLowerCase() === clean.toLowerCase())) {
      alert("Ce souvenir est déjà présent dans la mémoire.");
      return;
    }
    onUpdateClientMemories([...clientMemories, clean]);
    setNewMemory('');
  };

  const handleRemoveMemory = (idx: number) => {
    onUpdateClientMemories(clientMemories.filter((_, i) => i !== idx));
  };

  // Ajout manuel d'un goût
  const handleAddTaste = () => {
    if (!newTasteNom.trim()) return;
    const cleanNom = newTasteNom.trim();
    if (robot.gouts.some(g => g.nom.toLowerCase() === cleanNom.toLowerCase())) {
      alert("Ce sujet/goût est déjà répertorié dans la liste des goûts du robot.");
      return;
    }
    const updatedGouts: TasteEntry[] = [
      ...robot.gouts,
      {
        nom: cleanNom,
        statut: newTasteStatut,
        commentaire: newTasteComment.trim() || undefined,
        decouvertAvecUtilisateur: true
      }
    ];
    onUpdateRobot({ ...robot, gouts: updatedGouts });
    setNewTasteNom('');
    setNewTasteComment('');
  };

  const handleRemoveTaste = (nom: string) => {
    const updatedGouts = robot.gouts.filter(g => g.nom !== nom);
    onUpdateRobot({ ...robot, gouts: updatedGouts });
  };

  const handleUpdateTasteStatus = (nom: string, newStatut: TasteEntry['statut']) => {
    const updatedGouts = robot.gouts.map(g => 
      g.nom === nom ? { ...g, statut: newStatut } : g
    );
    onUpdateRobot({ ...robot, gouts: updatedGouts });
  };

  // Déclenchement de l'audit et réconciliation par l'IA
  const handleTriggerAiReconciliation = async () => {
    setIsReconciling(true);
    setReconcileReport(null);

    try {
      const activeAiConfig = getStoredAiConfig();
      // Formater pour l'API
      const simulatedProfile: UserProfileLocal = {
        id: `user_${robot.id}`,
        prenom: '',
        faits: clientMemories.map((m, idx) => ({
          id: `fact_${idx}`,
          categorie: 'gouts',
          fait: m,
          date: new Date().toISOString(),
          importance: 'haute'
        })),
        centresInteret: [],
        dateRencontre: new Date().toISOString(),
        scoreCompatibilite: 85,
        impressionsDuRobot: []
      };

      const res = await fetch('/api/reconcile-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot,
          userProfile: simulatedProfile,
          aiConfig: activeAiConfig
        })
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const data = await res.json();

      if (data.reconciledFacts && Array.isArray(data.reconciledFacts)) {
        const cleanMemList = data.reconciledFacts.map((f: any) => f.fait);
        onUpdateClientMemories(cleanMemList);
      }

      if (data.reconciledTastes && Array.isArray(data.reconciledTastes)) {
        onUpdateRobot({
          ...robot,
          gouts: data.reconciledTastes
        });
      }

      setReconcileReport({
        summary: data.summary || "Audit terminé : doublons éliminés et goûts synchronisés.",
        duplicatesRemoved: data.duplicatesRemoved ?? 0,
        success: true
      });
    } catch (err: any) {
      setReconcileReport({
        summary: `Erreur lors de la réconciliation : ${err.message}`,
        duplicatesRemoved: 0,
        success: false
      });
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar d'Audit IA Globale */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/50 border border-purple-500/30 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                Audit & Réconciliation Intelligente de la Mémoire par l'IA
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Anti-Redondance
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Vérifie par l'IA que les faits mémorisés n'ont pas de doublons sémantiques et met à jour les goûts du robot et du propriétaire qui ont évolué.
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerAiReconciliation}
            disabled={isReconciling}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-950/40 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isReconciling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Audit & Déduplication IA en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Nettoyer & Réconcilier par l'IA</span>
              </>
            )}
          </button>
        </div>

        {/* Rapport de Réconciliation */}
        {reconcileReport && (
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 mt-2 ${
            reconcileReport.success 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
              : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
          }`}>
            {reconcileReport.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                <span>{reconcileReport.success ? 'Rapport d\'Audit Mémoire IA :' : 'Échec de l\'audit :'}</span>
                {reconcileReport.duplicatesRemoved > 0 && (
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {reconcileReport.duplicatesRemoved} doublon(s) consolidé(s)
                  </span>
                )}
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">{reconcileReport.summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid 2 colonnes: Faits Propriétaire & Goûts du Robot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne 1: Souvenirs & Faits sur le Propriétaire */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-pink-400" />
                Faits Mémorisés sur l'Utilisateur ({clientMemories.length})
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Injectés en temps réel dans le prompt pour personnaliser les interactions.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMemory()}
              placeholder="Ajouter un souvenir (ex: 'Boit son café sans sucre')..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-400"
            />
            <button
              onClick={handleAddMemory}
              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {clientMemories.map((mem, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5">#{idx + 1}</span>
                  <span className="text-slate-200 leading-relaxed">{mem}</span>
                </div>
                <button
                  onClick={() => handleRemoveMemory(idx)}
                  className="text-rose-400 hover:text-rose-300 font-bold px-2 py-1 hover:bg-rose-500/10 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {clientMemories.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-xl">
                Aucun fait mémorisé pour l'instant.
              </div>
            )}
          </div>
        </div>

        {/* Colonne 2: Goûts et Affinités Évolutives du Robot */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-cyan-400" />
                Goûts & Passions de {robot.nom} ({robot.gouts.length})
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Définissent ses affinités, ses centres d'intérêt et ses avis évolutifs.
              </p>
            </div>
          </div>

          {/* Formulaire d'ajout d'un goût */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTasteNom}
                onChange={(e) => setNewTasteNom(e.target.value)}
                placeholder="Sujet ou domaine (ex: 'Art abstrait', 'Randonnée')..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <select
                value={newTasteStatut}
                onChange={(e: any) => setNewTasteStatut(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="adore">Adore ❤️</option>
                <option value="aime">Aime ✨</option>
                <option value="mitige">Mitigé 💭</option>
                <option value="deteste">Déteste ❌</option>
                <option value="inconnu">Curieux ❓</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTasteComment}
                onChange={(e) => setNewTasteComment(e.target.value)}
                placeholder="Commentaire ou nuance (optionnel)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAddTaste}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter Goût
              </button>
            </div>
          </div>

          {/* Liste des goûts */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {robot.gouts.map((g, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{g.nom}</span>
                    <select
                      value={g.statut}
                      onChange={(e: any) => handleUpdateTasteStatus(g.nom, e.target.value)}
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border focus:outline-none ${
                        g.statut === 'adore' ? 'bg-rose-950 text-rose-300 border-rose-500/30' :
                        g.statut === 'aime' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30' :
                        g.statut === 'deteste' ? 'bg-red-950 text-red-300 border-red-500/30' :
                        'bg-amber-950 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <option value="adore">Adore ❤️</option>
                      <option value="aime">Aime ✨</option>
                      <option value="mitige">Mitigé 💭</option>
                      <option value="deteste">Déteste ❌</option>
                      <option value="inconnu">Curieux ❓</option>
                    </select>
                    {g.decouvertAvecUtilisateur && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        Appris en échange
                      </span>
                    )}
                  </div>
                  {g.commentaire && (
                    <p className="text-slate-400 text-[11px] italic">"{g.commentaire}"</p>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveTaste(g.nom)}
                  className="text-rose-400 hover:text-rose-300 px-2 py-1 hover:bg-rose-500/10 rounded-lg text-xs cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

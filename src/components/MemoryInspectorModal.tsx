import React, { useState } from 'react';
import { RobotPersonality, UserProfileLocal, UserMemoryFact, TasteEntry } from '../types';
import { 
  BrainCircuit, 
  User, 
  Sparkles, 
  Heart, 
  Tag, 
  Trash2, 
  Plus, 
  Database,
  Calendar,
  Layers,
  BookOpen,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getStoredAiConfig } from '../lib/aiConfig';

interface MemoryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  userProfile: UserProfileLocal;
  onAddUserFact: (fact: string, category: any) => void;
  onUpdateUserProfile?: (profile: UserProfileLocal) => void;
  onUpdateRobot?: (robot: RobotPersonality) => void;
}

export const MemoryInspectorModal: React.FC<MemoryInspectorModalProps> = ({
  isOpen,
  onClose,
  robot,
  userProfile,
  onAddUserFact,
  onUpdateUserProfile,
  onUpdateRobot
}) => {
  const [activeTab, setActiveTab] = useState<'user' | 'robot'>('user');
  const [newFactText, setNewFactText] = useState('');
  const [newFactCategory, setNewFactCategory] = useState<'gouts' | 'travail' | 'famille_amis' | 'emotions' | 'anecdotes'>('gouts');
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconciliationReport, setReconciliationReport] = useState<{
    summary: string;
    duplicatesRemoved: number;
    success: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactText.trim()) return;
    onAddUserFact(newFactText.trim(), newFactCategory);
    setNewFactText('');
  };

  const handleTriggerAiReconciliation = async () => {
    setIsReconciling(true);
    setReconciliationReport(null);
    try {
      const activeAiConfig = getStoredAiConfig();
      const res = await fetch('/api/reconcile-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot,
          userProfile,
          aiConfig: activeAiConfig
        })
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      
      if (data.reconciledFacts && Array.isArray(data.reconciledFacts) && onUpdateUserProfile) {
        const updatedProfile = {
          ...userProfile,
          faits: data.reconciledFacts
        };
        onUpdateUserProfile(updatedProfile);
      }

      if (data.reconciledTastes && Array.isArray(data.reconciledTastes) && onUpdateRobot) {
        const updatedRobot = {
          ...robot,
          gouts: data.reconciledTastes
        };
        onUpdateRobot(updatedRobot);
      }

      setReconciliationReport({
        summary: data.summary || "Audit et réconciliation terminés : doublons éliminés et goûts synchronisés.",
        duplicatesRemoved: data.duplicatesRemoved ?? 0,
        success: true
      });
    } catch (err: any) {
      setReconciliationReport({
        summary: `Erreur lors de la réconciliation : ${err.message}`,
        duplicatesRemoved: 0,
        success: false
      });
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#08080c] border border-white/10 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono tracking-wide">
                Mémoire IndexedDB & Altérité
              </h3>
              <p className="text-xs text-slate-400">
                Profils étanches et apprentissage partagé de la relation
              </p>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex bg-black/60 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('user')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ce qu'elle sait ({userProfile.faits?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('robot')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'robot'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Goûts de {robot.nom} ({robot.gouts?.length || 0})
            </button>
          </div>
        </div>

        {/* Notification Banner for AI Reconciliation */}
        {reconciliationReport && (
          <div className={`p-3 rounded-xl border my-2 flex items-start gap-2.5 text-xs ${
            reconciliationReport.success
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
          }`}>
            {reconciliationReport.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                <span>{reconciliationReport.success ? 'Réconciliation IA Réussie' : 'Échec de la Réconciliation'}</span>
                {reconciliationReport.duplicatesRemoved > 0 && (
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {reconciliationReport.duplicatesRemoved} doublon(s) éliminé(s)
                  </span>
                )}
              </div>
              <p className="text-slate-300 mt-0.5 leading-relaxed">{reconciliationReport.summary}</p>
            </div>
          </div>
        )}

        {/* Global AI Action Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-slate-900 border border-purple-500/20 my-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">Audit & Consolidation Sémantique par l'IA</span>
              <span className="text-[10px] text-slate-400">Élimine les doublons, résout les contradictions et synchronise l'évolution des goûts.</span>
            </div>
          </div>
          <button
            onClick={handleTriggerAiReconciliation}
            disabled={isReconciling}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isReconciling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Audit en cours...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Réconcilier par l'IA</span>
              </>
            )}
          </button>
        </div>

        {/* Tab 1: User Profile stored in IndexedDB */}
        {activeTab === 'user' && (
          <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Compatibility & Encounter stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-slate-400 block mb-1">Score de Compatibilité :</span>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {userProfile.scoreCompatibilite || 82}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Matching asymétrique</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-slate-400 block mb-1">Première Rencontre :</span>
                <span className="text-xs font-medium text-slate-200 font-mono">
                  {new Date(userProfile.dateRencontre || Date.now()).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] text-slate-400 block mb-1">Stockage :</span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Database className="w-3 h-3" /> 100% IndexedDB
                </span>
              </div>
            </div>

            {/* List of Facts extracted */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                Souvenirs mémorisés au fil de vos discussions :
              </span>
              
              {userProfile.faits && userProfile.faits.length > 0 ? (
                <div className="space-y-2">
                  {userProfile.faits.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Tag className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">{f.fait}</p>
                          <span className="text-[10px] font-mono text-slate-500">
                            Catégorie: {f.categorie} • Importance: {f.importance}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-white/[0.01] border border-dashed border-white/10 text-center text-xs text-slate-500 font-mono">
                  Aucun fait extrait pour le moment. Discutez avec votre compagnon ou lancez une consolidation nocturne pour alimenter sa mémoire !
                </div>
              )}
            </div>

            {/* Manual Fact addition for test / lab */}
            <form onSubmit={handleAddFact} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block font-mono">
                Ajouter manuellement un fait dans la mémoire du robot :
              </span>
              <div className="flex gap-2">
                <select
                  value={newFactCategory}
                  onChange={(e: any) => setNewFactCategory(e.target.value)}
                  className="bg-black/60 border border-white/10 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
                >
                  <option value="gouts">Goûts</option>
                  <option value="travail">Travail</option>
                  <option value="famille_amis">Famille & Amis</option>
                  <option value="emotions">Émotions</option>
                  <option value="anecdotes">Anecdotes</option>
                </select>
                <input
                  type="text"
                  placeholder="Ex: Passionné par les voyages au Japon et le café filtre..."
                  value={newFactText}
                  onChange={(e) => setNewFactText(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-sans"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-1 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Robot's Own Evolved Profile & Tastes */}
        {activeTab === 'robot' && (
          <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Personality overview */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white font-mono">{robot.nom} • {robot.titre}</h4>
              <p className="text-xs text-slate-300 italic">"{robot.philosophie}"</p>
              <p className="text-xs text-slate-400">{robot.temperament}</p>
            </div>

            {/* Taste Table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider block">
                Goûts, passions & sujets à découvrir :
              </span>

              <div className="space-y-2">
                {robot.gouts.map((g, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-200">{g.nom}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          g.statut === 'adore' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' :
                          g.statut === 'aime' ? 'bg-teal-950/60 text-teal-300 border border-teal-500/30' :
                          g.statut === 'deteste' ? 'bg-red-950/60 text-red-300 border border-red-500/30' :
                          'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                        }`}>
                          {g.statut.toUpperCase()}
                        </span>
                        {g.decouvertAvecUtilisateur && (
                          <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">
                            Découvert avec vous
                          </span>
                        )}
                      </div>
                      {g.commentaire && (
                        <p className="text-slate-400 text-[11px]">{g.commentaire}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono font-semibold transition-colors"
          >
            Fermer l'inspecteur
          </button>
        </div>
      </div>
    </div>
  );
};

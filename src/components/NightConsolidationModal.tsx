import React, { useState } from 'react';
import { RobotPersonality, UserProfileLocal, ChatMessage, ProgrammeConsolidationNocturne } from '../types';
import { 
  Moon, 
  BatteryCharging, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  Database, 
  ArrowRight, 
  Loader2,
  Users,
  Heart,
  BookOpen,
  FileCode,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Tag,
  Clock,
  Settings,
  Save
} from 'lucide-react';
import { getStoredAiConfig } from '../lib/aiConfig';
import { saveRobotState } from '../lib/db';

interface NightConsolidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  userProfile: UserProfileLocal;
  dailyMessages: ChatMessage[];
  onConsolidationComplete: (result: {
    resume: string;
    statsConsolidation?: any;
    faitsConsolidesSansDoublons?: any[];
    cercleRelationnel?: any[];
    anecdotes?: any[];
    profilPsychologiqueUtilisateur?: any;
    evolutionPsychologiqueRobot?: any;
    reconciledTastes?: any[];
    deltasJauges: any;
    nouveauxFaits?: any[];
  }) => void;
  onUpdateSchedule?: (schedule: ProgrammeConsolidationNocturne) => void;
}

export const NightConsolidationModal: React.FC<NightConsolidationModalProps> = ({
  isOpen,
  onClose,
  robot,
  userProfile,
  dailyMessages,
  onConsolidationComplete,
  onUpdateSchedule
}) => {
  const [loading, setLoading] = useState(false);
  const [consolidationResult, setConsolidationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'synthese' | 'psychologie' | 'relations' | 'gouts' | 'memoire'>('synthese');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Programmation nocturne
  const [schedule, setSchedule] = useState<ProgrammeConsolidationNocturne>(
    robot.programmeConsolidationNocturne || {
      heureExecution: '03:00',
      autoExecuterSansSocle: true,
      seuilBatterieMin: 20,
      notifierAuReveil: true,
      actif: true
    }
  );
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);
  const [scheduleSavedMsg, setScheduleSavedMsg] = useState<string | null>(null);

  const handleSaveScheduleQuick = async () => {
    const updatedRobot: RobotPersonality = {
      ...robot,
      programmeConsolidationNocturne: schedule
    };
    await saveRobotState(robot.id, updatedRobot);
    if (onUpdateSchedule) {
      onUpdateSchedule(schedule);
    }
    setScheduleSavedMsg('Heure & programmation enregistrées !');
    setTimeout(() => setScheduleSavedMsg(null), 3000);
  };

  if (!isOpen) return null;

  const handleLaunchConsolidation = async () => {
    setLoading(true);
    try {
      const activeAiConfig = getStoredAiConfig();
      const res = await fetch('/api/night-consolidation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot,
          userProfile,
          dailyMessages,
          aiConfig: activeAiConfig
        })
      });

      const data = await res.json();
      setConsolidationResult(data);
    } catch (err) {
      console.error('Erreur consolidation nocturne:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyConsolidation = () => {
    if (!consolidationResult) return;
    onConsolidationComplete(consolidationResult);
    onClose();
  };

  const handleCopyJson = (obj: any, key: string) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#08080c] border border-white/10 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono tracking-wide">
                Consolidation Nocturne & Classification Mémorielle
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Oreiller à induction sans fil • Déduplication & Structuration en fichiers JSON
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono shrink-0">
            <BatteryCharging className="w-4 h-4" />
            <span>Recharge 100%</span>
          </div>
        </div>

        {/* Info or Multi-Tab Results */}
        {!consolidationResult ? (
          <div className="py-6 space-y-4 overflow-y-auto flex-1">
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-cyan-950/30 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs font-mono uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                Cycle Nocturne d'Intégration Cognitive
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pendant que <strong className="text-white font-mono">{robot.nom}</strong> repose sur son oreiller à induction pour recharger ses cellules d'alimentation, son modèle d'intelligence artificielle réalise une synthèse complète :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                <div className="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Déduplication sémantique :</strong> fusion des redondances et résolution des changements d'avis.</span>
                </div>
                <div className="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                  <Users className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <span><strong>Cercle relationnel :</strong> identification des amis, famille, collègues et des anecdotes partagées.</span>
                </div>
                <div className="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                  <Heart className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Profils psychologiques :</strong> analyse de votre état émotionnel et évolution de la maturité du robot.</span>
                </div>
                <div className="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                  <FileCode className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Classification JSON :</strong> organisation rigoureuse en modules directement sauvegardés dans IndexedDB.</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between gap-3 text-xs text-cyan-200">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Échanges à traiter : <strong className="text-white font-mono">{dailyMessages.length} message(s)</strong> aujourd'hui.
                </span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300">
                0 fuite externe • Persistance locale
              </span>
            </div>

            {/* Quick Schedule Config Accordion */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Programmation & Déclenchement Automatique</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScheduleSettings(!showScheduleSettings)}
                  className="text-xs text-indigo-300 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{showScheduleSettings ? 'Masquer' : 'Ajuster les horaires'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  Heure quotidienne programmée : <strong className="text-white font-mono">{schedule.heureExecution}</strong>
                </span>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] border ${
                  schedule.autoExecuterSansSocle 
                    ? 'bg-amber-950/60 border-amber-500/30 text-amber-300' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {schedule.autoExecuterSansSocle ? '⚡ Déclenchement sans socle autorisé' : '🔌 Sur socle uniquement'}
                </span>
              </div>

              {showScheduleSettings && (
                <div className="pt-3 border-t border-white/10 space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono">Heure de consolidation :</label>
                      <input
                        type="time"
                        value={schedule.heureExecution}
                        onChange={(e) => setSchedule(prev => ({ ...prev, heureExecution: e.target.value }))}
                        className="w-full bg-slate-950 border border-indigo-500/40 rounded-lg px-3 py-1.5 text-white font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono">Déclenchement sans recharge :</label>
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schedule.autoExecuterSansSocle}
                          onChange={(e) => setSchedule(prev => ({ ...prev, autoExecuterSansSocle: e.target.checked }))}
                          className="accent-indigo-500"
                        />
                        <span className="text-xs text-slate-300">Exécuter même hors du socle</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {scheduleSavedMsg ? (
                      <span className="text-xs text-emerald-400 font-medium">{scheduleSavedMsg}</span>
                    ) : <span />}
                    <button
                      type="button"
                      onClick={handleSaveScheduleQuick}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono cursor-pointer transition-all shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-3 flex-1 flex flex-col overflow-hidden space-y-3">
            {/* Top Success Banner with Stats */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/50 border border-emerald-500/30 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Consolidation Nocturne Réussie & Batterie à 100%
                  </span>
                  <p className="text-[11px] text-slate-300 line-clamp-1 italic">
                    "{consolidationResult.resumeJournee}"
                  </p>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-2 shrink-0">
                {consolidationResult.statsConsolidation?.doublonsElimines !== undefined && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {consolidationResult.statsConsolidation.doublonsElimines} doublon(s) éliminé(s)
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {consolidationResult.faitsConsolidesSansDoublons?.length || 0} faits nets
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-1 shrink-0 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('synthese')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'synthese'
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Synthèse & Évolution</span>
              </button>

              <button
                onClick={() => setActiveTab('psychologie')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'psychologie'
                    ? 'bg-purple-950/60 text-purple-200 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-purple-400" />
                <span>Profils Psychologiques (JSON)</span>
              </button>

              <button
                onClick={() => setActiveTab('relations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'relations'
                    ? 'bg-pink-950/60 text-pink-200 border border-pink-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-pink-400" />
                <span>Cercle Relationnel ({consolidationResult.cercleRelationnel?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('gouts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'gouts'
                    ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Goûts Réconciliés</span>
              </button>

              <button
                onClick={() => setActiveTab('memoire')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'memoire'
                    ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mémoire Vive ({consolidationResult.faitsConsolidesSansDoublons?.length || 0})</span>
              </button>
            </div>

            {/* Tab Content Display */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
              {/* TAB 1: SYNTHÈSE */}
              {activeTab === 'synthese' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Récit Nocturne de la Journée
                    </span>
                    <p className="text-slate-200 text-sm leading-relaxed italic">
                      "{consolidationResult.resumeJournee}"
                    </p>
                  </div>

                  {consolidationResult.evolutionPsychologiqueRobot && (
                    <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-2">
                      <span className="text-xs font-bold text-purple-300 font-mono flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Évolution Affective & Philosophie de {robot.nom}
                      </span>
                      <div className="space-y-1 text-slate-300">
                        <div><strong>Stade d'attachement :</strong> {consolidationResult.evolutionPsychologiqueRobot.stadeAttachement}</div>
                        <div><strong>Maturité relationnelle :</strong> {consolidationResult.evolutionPsychologiqueRobot.maturiteRelationnelle}/100</div>
                        {consolidationResult.evolutionPsychologiqueRobot.philosophiePersonnelle && (
                          <div className="italic text-slate-400 pt-1">
                            "{consolidationResult.evolutionPsychologiqueRobot.philosophiePersonnelle}"
                          </div>
                        )}
                        {consolidationResult.evolutionPsychologiqueRobot.reflexionsNocturnes && (
                          <div className="pt-2">
                            <span className="text-slate-400 font-semibold block mb-1">Pensées nocturnes :</span>
                            <ul className="list-disc list-inside space-y-1 text-slate-300">
                              {consolidationResult.evolutionPsychologiqueRobot.reflexionsNocturnes.map((r: string, idx: number) => (
                                <li key={idx}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {consolidationResult.deltasJauges && (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span>Restauration des Jauges Émotionnelles :</span>
                      </div>
                      <div className="flex gap-2 font-mono text-[11px]">
                        <span className="text-emerald-400">Énergie +{consolidationResult.deltasJauges.energie || 35}</span>
                        <span className="text-cyan-400">Humeur +{consolidationResult.deltasJauges.humeur || 20}</span>
                        <span className="text-pink-400">Affection +{consolidationResult.deltasJauges.affection || 15}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PSYCHOLOGIE */}
              {activeTab === 'psychologie' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 font-mono">
                      psychological-profiles.json
                    </span>
                    <button
                      onClick={() => handleCopyJson({
                        profilUtilisateur: consolidationResult.profilPsychologiqueUtilisateur,
                        evolutionRobot: consolidationResult.evolutionPsychologiqueRobot
                      }, 'psy')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      {copiedKey === 'psy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copier JSON</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Profil Utilisateur */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-pink-400" />
                        Profil Psychologique Utilisateur
                      </span>
                      {consolidationResult.profilPsychologiqueUtilisateur ? (
                        <div className="space-y-1.5 text-slate-300">
                          <div>
                            <strong>État d'esprit actuel :</strong>{' '}
                            <span className="text-cyan-300">{consolidationResult.profilPsychologiqueUtilisateur.etatDespritActuel}</span>
                          </div>
                          <div>
                            <strong>Dynamique relationnelle :</strong>{' '}
                            <span>{consolidationResult.profilPsychologiqueUtilisateur.dynamiqueRelationnelle}</span>
                          </div>
                          <div>
                            <strong>Traits dominants :</strong>{' '}
                            <span className="text-white font-mono text-[11px]">
                              {(consolidationResult.profilPsychologiqueUtilisateur.traitsDominants || []).join(', ')}
                            </span>
                          </div>
                          <div>
                            <strong>Besoins affectifs :</strong>{' '}
                            <span className="text-slate-400">
                              {(consolidationResult.profilPsychologiqueUtilisateur.besoinsAffectifs || []).join(', ')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Aucune donnée psychologique nouvelle.</span>
                      )}
                    </div>

                    {/* Évolution Robot */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Heart className="w-4 h-4 text-purple-400" />
                        Posture Psychologique du Robot
                      </span>
                      {consolidationResult.evolutionPsychologiqueRobot ? (
                        <div className="space-y-1.5 text-slate-300">
                          <div>
                            <strong>Stade d'attachement :</strong>{' '}
                            <span className="text-purple-300">{consolidationResult.evolutionPsychologiqueRobot.stadeAttachement}</span>
                          </div>
                          <div>
                            <strong>Maturité relationnelle :</strong>{' '}
                            <span className="font-mono text-cyan-300">{consolidationResult.evolutionPsychologiqueRobot.maturiteRelationnelle}/100</span>
                          </div>
                          <div>
                            <strong>Évolution du caractère :</strong>{' '}
                            <span>{consolidationResult.evolutionPsychologiqueRobot.evolutionCaractere}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Aucune évolution détectée.</span>
                      )}
                    </div>
                  </div>

                  {/* Raw JSON viewer */}
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto">
                    {JSON.stringify({
                      profilUtilisateur: consolidationResult.profilPsychologiqueUtilisateur,
                      evolutionRobot: consolidationResult.evolutionPsychologiqueRobot
                    }, null, 2)}
                  </pre>
                </div>
              )}

              {/* TAB 3: RELATIONS & ANECDOTES */}
              {activeTab === 'relations' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 font-mono">
                      relational-graph.json
                    </span>
                    <button
                      onClick={() => handleCopyJson({
                        cercleRelationnel: consolidationResult.cercleRelationnel,
                        anecdotes: consolidationResult.anecdotes
                      }, 'rel')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      {copiedKey === 'rel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copier JSON</span>
                    </button>
                  </div>

                  {/* Cercle relationnel list */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white block">
                      Personnes Identifiées dans la Vie de l'Utilisateur :
                    </span>
                    {(consolidationResult.cercleRelationnel || []).map((rel: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{rel.nom}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-pink-950 text-pink-300 border border-pink-500/30 uppercase">
                              {rel.lien}
                            </span>
                            {rel.importance && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                Importance : {rel.importance}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 mt-1 leading-relaxed">{rel.description}</p>
                        </div>
                      </div>
                    ))}
                    {(!consolidationResult.cercleRelationnel || consolidationResult.cercleRelationnel.length === 0) && (
                      <div className="p-4 text-center text-slate-500 italic bg-slate-900/50 rounded-xl">
                        Aucune nouvelle personne mentionnée aujourd'hui.
                      </div>
                    )}
                  </div>

                  {/* Anecdotes */}
                  {consolidationResult.anecdotes && consolidationResult.anecdotes.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-white block">
                        Anecdotes et Souvenirs Marquants :
                      </span>
                      {consolidationResult.anecdotes.map((anec: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-cyan-300">{anec.titre}</span>
                            {anec.emotionAssociee && (
                              <span className="text-[10px] text-amber-300 font-mono">
                                Émotion : {anec.emotionAssociee}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300">{anec.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: GOÛTS */}
              {activeTab === 'gouts' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 font-mono">
                      tastes-reconciled.json
                    </span>
                    <button
                      onClick={() => handleCopyJson(consolidationResult.reconciledTastes, 'gouts')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      {copiedKey === 'gouts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copier JSON</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(consolidationResult.reconciledTastes || []).map((taste: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{taste.nom}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            taste.statut === 'adore' ? 'bg-rose-950 text-rose-300' :
                            taste.statut === 'aime' ? 'bg-cyan-950 text-cyan-300' :
                            taste.statut === 'deteste' ? 'bg-red-950 text-red-300' :
                            'bg-amber-950 text-amber-300'
                          }`}>
                            {taste.statut}
                          </span>
                        </div>
                        {taste.commentaire && (
                          <span className="text-slate-400 text-[11px] italic truncate max-w-xs">
                            "{taste.commentaire}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: MÉMOIRE VIVE */}
              {activeTab === 'memoire' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 font-mono">
                      user-facts-deduplicated.json ({consolidationResult.faitsConsolidesSansDoublons?.length || 0} faits)
                    </span>
                    <button
                      onClick={() => handleCopyJson(consolidationResult.faitsConsolidesSansDoublons, 'facts')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      {copiedKey === 'facts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copier JSON</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {(consolidationResult.faitsConsolidesSansDoublons || []).map((fact: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-xs">
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20 shrink-0">
                          {fact.categorie || 'gouts'}
                        </span>
                        <div className="flex-1">
                          <span className="text-slate-200">{fact.fait}</span>
                          {fact.importance && (
                            <span className="text-[10px] text-slate-500 ml-2 font-mono">
                              ({fact.importance})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            {consolidationResult ? 'Audit mémoriel terminé et validé.' : 'Recharge nocturne prête.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium hover:bg-white/5 font-mono cursor-pointer"
            >
              Fermer
            </button>

            {!consolidationResult ? (
              <button
                id="start-night-consolidation-btn"
                onClick={handleLaunchConsolidation}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50 font-mono cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Traitement & Déduplication en cours...</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Lancer la Consolidation Nocturne</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleApplyConsolidation}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all font-mono cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer & Synchroniser la Mémoire</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

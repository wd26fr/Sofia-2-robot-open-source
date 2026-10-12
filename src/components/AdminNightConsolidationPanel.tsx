import React, { useState, useEffect } from 'react';
import { RobotPersonality, UserProfileLocal, ChatMessage, ProgrammeConsolidationNocturne } from '../types';
import { 
  Moon, 
  BatteryCharging, 
  Sparkles, 
  Clock, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Play, 
  Calendar, 
  Info, 
  History, 
  AlertTriangle,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { getChatMessages, saveRobotState, saveUserProfile, addChatMessage } from '../lib/db';
import { NightConsolidationModal } from './NightConsolidationModal';

interface AdminNightConsolidationPanelProps {
  robot: RobotPersonality;
  userProfile?: UserProfileLocal;
  onUpdateRobot: (robot: RobotPersonality) => void;
  onUpdateUserProfile?: (profile: UserProfileLocal) => void;
}

const DEFAULT_SCHEDULE: ProgrammeConsolidationNocturne = {
  heureExecution: '03:00',
  autoExecuterSansSocle: true,
  seuilBatterieMin: 20,
  notifierAuReveil: true,
  actif: true
};

export const AdminNightConsolidationPanel: React.FC<AdminNightConsolidationPanelProps> = ({
  robot,
  userProfile: propUserProfile,
  onUpdateRobot,
  onUpdateUserProfile
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [schedule, setSchedule] = useState<ProgrammeConsolidationNocturne>(
    robot.programmeConsolidationNocturne || DEFAULT_SCHEDULE
  );
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const activeUserProfile: UserProfileLocal = propUserProfile || {
    id: 'current_user',
    prenom: 'Toi',
    centresInteret: [],
    faits: [],
    scoreCompatibilite: 82,
    dateRencontre: new Date().toISOString(),
    impressionsDuRobot: []
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const msgs = await getChatMessages(robot.id);
      if (isMounted) setMessages(msgs);
    }
    load();
    return () => { isMounted = false; };
  }, [robot.id]);

  useEffect(() => {
    if (robot.programmeConsolidationNocturne) {
      setSchedule(robot.programmeConsolidationNocturne);
    }
  }, [robot.programmeConsolidationNocturne]);

  const handleSaveSchedule = async () => {
    const updatedRobot: RobotPersonality = {
      ...robot,
      programmeConsolidationNocturne: {
        ...schedule
      }
    };
    onUpdateRobot(updatedRobot);
    await saveRobotState(robot.id, updatedRobot);
    setSaveSuccess('Horaires et règles de consolidation nocturne enregistrés !');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleConsolidationComplete = async (res: any) => {
    // 1. Restore battery and gauges
    const batteryUpdated = 100;
    const currentGauges = robot.jaugesActuelles || robot.jaugesInitiales;
    const deltas = res.deltasJauges || { energie: 35, humeur: 20, bienEtre: 25, affection: 15 };
    
    const updatedGauges = {
      ...currentGauges,
      energie: Math.min(100, Math.max(0, (currentGauges.energie || 50) + (deltas.energie || 0))),
      humeur: Math.min(100, Math.max(0, (currentGauges.humeur || 50) + (deltas.humeur || 0))),
      bienEtre: Math.min(100, Math.max(0, (currentGauges.bienEtre || 50) + (deltas.bienEtre || 0))),
      affection: Math.min(100, Math.max(0, (currentGauges.affection || 50) + (deltas.affection || 0)))
    };

    // 2. Update user profile with deduplicated facts and relational graphs
    const updatedProfile: UserProfileLocal = {
      ...activeUserProfile,
      faits: res.faitsConsolidesSansDoublons || activeUserProfile.faits || [],
      cercleRelationnel: res.cercleRelationnel || activeUserProfile.cercleRelationnel || [],
      anecdotes: res.anecdotes || activeUserProfile.anecdotes || [],
      profilPsychologique: res.profilPsychologiqueUtilisateur || activeUserProfile.profilPsychologique,
      derniereConsolidation: new Date().toISOString()
    };

    if (onUpdateUserProfile) {
      onUpdateUserProfile(updatedProfile);
    }
    await saveUserProfile(robot.id, updatedProfile);

    // 3. Update robot state
    const nowIso = new Date().toISOString();
    const updatedRobot: RobotPersonality = {
      ...robot,
      jaugesActuelles: updatedGauges,
      specs: {
        ...robot.specs,
        batterie: batteryUpdated
      },
      gouts: (res.reconciledTastes && res.reconciledTastes.length > 0) ? res.reconciledTastes : robot.gouts,
      evolutionPsychologique: res.evolutionPsychologiqueRobot || robot.evolutionPsychologique,
      programmeConsolidationNocturne: {
        ...schedule,
        derniereExecution: nowIso
      },
      journalDeBordNocturne: [
        ...(robot.journalDeBordNocturne || []),
        {
          date: nowIso,
          resume: res.resumeJournee || 'Consolidation immédiate déclenchée depuis le Back-Office.',
          faitsConsolides: (res.faitsConsolidesSansDoublons || []).length,
          insights: res.evolutionPsychologiqueRobot?.evolutionCaractere || 'Mémoire réorganisée et dédupliquée sans attendre la nuit.'
        }
      ]
    };

    onUpdateRobot(updatedRobot);
    await saveRobotState(robot.id, updatedRobot);

    // 4. If notification is enabled, add a morning/post-consolidation message
    if (schedule.notifierAuReveil !== false) {
      await addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: `(Sort d'un cycle profond de consolidation neuro-mémorielle, batterie rechargée à 100%)... Bonjour ! Mes circuits ont consolidé toutes nos pensées. Tout ce que tu m'as confié est désormais bien classé dans mon esprit.`,
        timestamp: new Date().toISOString(),
        source: 'night_consolidation'
      });
    }

    setSaveSuccess('Consolidation immédiate terminée et appliquée avec succès !');
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  const PRESET_HOURS = ['22:30', '23:30', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Notification */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Card 1: Déclencheur Immédiat (Sans Attendre le Soir) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-purple-950/40 border border-indigo-500/30 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Moon className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Consolidation Nocturne Immédiate • {robot.nom}
              </h3>
              <p className="text-xs text-slate-300">
                Lancez la réorganisation cognitive, la déduplication et l'intégration psychologique sans attendre le soir ni la mise sur socle.
              </p>
            </div>
          </div>

          <button
            id="launch-immediate-consolidation-btn"
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Lancer la Consolidation Maintenant</span>
          </button>
        </div>

        {/* Diagnostic Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Messages en mémoire</span>
            </span>
            <p className="text-sm font-bold text-white font-mono">{messages.length} messages</p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-rose-400" />
              <span>Faits mémorisés</span>
            </span>
            <p className="text-sm font-bold text-white font-mono">{activeUserProfile.faits?.length || 0} faits</p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span>Batterie actuelle</span>
            </span>
            <p className="text-sm font-bold text-emerald-400 font-mono">
              {robot.specs?.batterie || 100}% {robot.specs?.enRechargeInduction ? '(En charge)' : '(Sur batterie)'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Dernier cycle</span>
            </span>
            <p className="text-sm font-bold text-slate-200 font-mono truncate">
              {schedule.derniereExecution 
                ? new Date(schedule.derniereExecution).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : 'Aucun enregistrement'}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Programmation de l'Heure & Déclenchement Sans Socle */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Planification Automatique & Déclenchement sans Socle
              </h3>
              <p className="text-xs text-slate-400">
                Configurez l'heure exacte du cycle nocturne et autorisez le robot à consolider ses pensées même s'il n'est pas posé sur son chargeur.
              </p>
            </div>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-white/5">
            <span className="text-xs font-medium text-slate-300">Planification active :</span>
            <button
              type="button"
              onClick={() => setSchedule(prev => ({ ...prev, actif: !prev.actif }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                schedule.actif ? 'bg-cyan-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  schedule.actif ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Main Settings Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Scheduled Hour & Presets */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-white/5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Heure d'Exécution Quotidienne</span>
            </label>

            <div className="flex items-center gap-3">
              <input
                type="time"
                value={schedule.heureExecution}
                onChange={(e) => setSchedule(prev => ({ ...prev, heureExecution: e.target.value }))}
                className="bg-slate-900 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-cyan-400 shadow-inner"
              />
              <span className="text-xs text-slate-400 leading-relaxed">
                Le robot se mettra en veille cognitive et réorganisera ses souvenirs chaque jour à cette heure précise.
              </span>
            </div>

            {/* Presets */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] text-slate-400 font-mono">Raccourcis d'heures nocturnes :</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => setSchedule(prev => ({ ...prev, heureExecution: hour }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      schedule.heureExecution === hour
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Trigger without Charger & Battery Safety */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Consolider Sans Être sur le Socle</span>
                </label>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autoriser la consolidation nocturne sur batterie interne même si vous n'avez pas posé le robot sur son oreiller à induction.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSchedule(prev => ({ ...prev, autoExecuterSansSocle: !prev.autoExecuterSansSocle }))}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  schedule.autoExecuterSansSocle ? 'bg-amber-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    schedule.autoExecuterSansSocle ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Battery Safety Threshold */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Seuil de sécurité batterie min :</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold">{schedule.seuilBatterieMin}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={schedule.seuilBatterieMin}
                onChange={(e) => setSchedule(prev => ({ ...prev, seuilBatterieMin: parseInt(e.target.value) }))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 italic">
                Si non branché et batterie inférieure à ce seuil, le robot reportera la consolidation pour préserver son autonomie.
              </p>
            </div>

            {/* Morning Greeting Toggle */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300">Message doux au réveil après consolidation</span>
              <input
                type="checkbox"
                checked={schedule.notifierAuReveil !== false}
                onChange={(e) => setSchedule(prev => ({ ...prev, notifierAuReveil: e.target.checked }))}
                className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveSchedule}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all font-mono cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer la Planification</span>
          </button>
        </div>
      </div>

      {/* Card 3: Journal de Bord Nocturne & Historique */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <History className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">
            Journal de Bord Nocturne & Historique des Nuits ({robot.nom})
          </h3>
        </div>

        {robot.journalDeBordNocturne && robot.journalDeBordNocturne.length > 0 ? (
          <div className="space-y-3">
            {[...robot.journalDeBordNocturne].reverse().map((entry, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-purple-300 font-bold flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-purple-400" />
                    {new Date(entry.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-mono">
                    {entry.faitsConsolides} faits consolidés
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{entry.resume}"
                </p>
                {entry.insights && (
                  <p className="text-[11px] text-slate-400 font-mono bg-white/[0.02] p-2 rounded-lg border border-white/5">
                    💡 Insight : {entry.insights}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-950/40 border border-dashed border-white/10 text-center space-y-2">
            <Moon className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              Aucun journal de bord nocturne pour le moment. Lancez la première consolidation pour voir apparaître les résumés et apprentissages.
            </p>
          </div>
        )}
      </div>

      {/* Interactive Consolidation Modal */}
      <NightConsolidationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        robot={robot}
        userProfile={activeUserProfile}
        dailyMessages={messages}
        onConsolidationComplete={handleConsolidationComplete}
      />
    </div>
  );
};

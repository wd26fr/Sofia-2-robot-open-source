import React, { useState, useEffect, useRef } from 'react';
import { RobotPersonality, EmotionalGauges, ChatMessage, UserProfileLocal, UserMemoryFact } from '../types';
import { 
  Send, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  Activity, 
  BrainCircuit, 
  Heart,
  Sliders, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Database,
  User,
  Info,
  Eye,
  Copy,
  X,
  FileCode,
  Volume2,
  VolumeX,
  MessageSquare
} from 'lucide-react';
import { EmotionalGaugesPanel } from './EmotionalGaugesPanel';
import { evaluateLocalDeterministic, evaluateLocalDeterministicAsync } from '../lib/localEngine';
import { getRelationshipStage, RELATIONSHIP_STAGES } from '../lib/relationship';
import { getUserProfile, saveUserProfile, saveRobotState, addChatMessage } from '../lib/db';
import { speakText, stopSpeaking } from '../lib/speech';
import { IndexedDBConversationModal } from './IndexedDBConversationModal';

interface AdminTestChatProps {
  robots: RobotPersonality[];
  initialSelectedRobotId?: string;
  onUpdateRobotState?: (updatedRobot: RobotPersonality) => void;
}

export const AdminTestChat: React.FC<AdminTestChatProps> = ({
  robots,
  initialSelectedRobotId,
  onUpdateRobotState
}) => {
  const [selectedRobotId, setSelectedRobotId] = useState<string>(initialSelectedRobotId || robots[0]?.id || 'sofia-01');
  const [currentRobot, setCurrentRobot] = useState<RobotPersonality>(
    robots.find(r => r.id === selectedRobotId) || robots[0]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastDeltas, setLastDeltas] = useState<Partial<EmotionalGauges> | null>(null);
  const [lastSource, setLastSource] = useState<string | null>(null);
  
  // Profil & Faits mémorisés pour ce robot
  const [userProfile, setUserProfile] = useState<UserProfileLocal>({
    id: 'current_user',
    prenom: '',
    centresInteret: [],
    faits: [],
    scoreCompatibilite: 82,
    dateRencontre: new Date().toISOString(),
    impressionsDuRobot: ['En phase de découverte.']
  });

  const [newFactText, setNewFactText] = useState('');
  const [newFactCategory, setNewFactCategory] = useState<'gouts' | 'biographie' | 'secret' | 'routine'>('gouts');
  const [saveDbStatus, setSaveDbStatus] = useState<string | null>(null);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [showIndexedDBModal, setShowIndexedDBModal] = useState<boolean>(false);
  const [inspectedPromptText, setInspectedPromptText] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);

  const speakRobotReply = (text: string) => {
    if (!ttsEnabled) return;
    speakText(text, {
      pitch: currentRobot.voix?.pitch ?? 1.05,
      rate: currentRobot.voix?.rate ?? 1.08,
      nomVoix: currentRobot.voix?.nomVoix,
      voiceURI: currentRobot.voix?.voiceURI,
      volume: currentRobot.voix?.volume,
      genderHint: currentRobot.genre || 'femme',
      cleanDidascalies: currentRobot.dialogueConfig?.ignorerDidascaliesTTS !== false
    });
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleOpenPromptInspector = async () => {
    setShowPromptModal(true);
    try {
      const res = await fetch('/api/inspect-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot: currentRobot,
          userProfile: userProfile,
          userMessage: inputText || "Tu es programmée pour quoi au juste ?"
        })
      });
      const data = await res.json();
      setInspectedPromptText(data.systemInstruction || '');
    } catch (err) {
      console.error('Erreur inspection prompt:', err);
    }
  };

  // Charger le profil utilisateur depuis IndexedDB quand le robot change
  useEffect(() => {
    const r = robots.find(item => item.id === selectedRobotId) || robots[0];
    if (r) {
      setCurrentRobot(JSON.parse(JSON.stringify(r)));
      setMessages([
        {
          id: `welcome_${Date.now()}`,
          robotId: r.id,
          sender: 'robot',
          text: `[Session de Test Admin] Bonjour, je suis ${r.nom}. Mes jauges (Affection: ${r.jaugesActuelles.affection}%) et ma mémoire sont chargées pour le banc d'essai. Pose-moi une question pour tester mon comportement.`,
          timestamp: new Date().toISOString(),
          source: 'local_engine'
        }
      ]);
      setLastDeltas(null);

      // Charger le profil de la base
      getUserProfile(r.id).then(profile => {
        if (profile) {
          setUserProfile(profile);
        } else {
          setUserProfile({
            id: 'current_user',
            prenom: '',
            centresInteret: [],
            faits: [],
            scoreCompatibilite: 82,
            dateRencontre: new Date().toISOString(),
            impressionsDuRobot: ['En phase de découverte.']
          });
        }
      });
    }
  }, [selectedRobotId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const currentStage = getRelationshipStage(currentRobot.jaugesActuelles.affection);

  // Appliquer les deltas
  const applyGaugeDeltas = (deltas: Partial<EmotionalGauges>) => {
    setLastDeltas(deltas);
    const updated = { ...currentRobot.jaugesActuelles };
    (Object.keys(deltas) as (keyof EmotionalGauges)[]).forEach((k) => {
      if (deltas[k] !== undefined) {
        updated[k] = Math.max(0, Math.min(100, (updated[k] || 0) + deltas[k]!));
      }
    });
    const updatedRobot = { ...currentRobot, jaugesActuelles: updated };
    setCurrentRobot(updatedRobot);
    if (onUpdateRobotState) {
      onUpdateRobotState(updatedRobot);
    }
  };

  // Simuler un stade relationnel spécifique
  const handleSetStageAffection = (targetAffection: number) => {
    const updatedRobot = {
      ...currentRobot,
      jaugesActuelles: {
        ...currentRobot.jaugesActuelles,
        affection: targetAffection
      }
    };
    setCurrentRobot(updatedRobot);
    if (onUpdateRobotState) {
      onUpdateRobotState(updatedRobot);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isSending) return;

    setInputText('');
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      robotId: currentRobot.id,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
      source: 'local_engine'
    };

    setMessages(prev => [...prev, userMsg]);
    // Persistance dans IndexedDB
    addChatMessage(currentRobot.id, userMsg).catch(console.error);

    // 1. Moteur Déterministe Local avec vérification CDN anti-faux positifs
    const localResult = await evaluateLocalDeterministicAsync(query, currentRobot, userProfile);
    if (localResult.matched && localResult.replyText) {
      if (localResult.extractedUserName) {
        setUserProfile(prev => ({
          ...prev,
          prenom: localResult.extractedUserName!
        }));
      }

      setTimeout(() => {
        const robotMsg: ChatMessage = {
          id: `robot_${Date.now()}`,
          robotId: currentRobot.id,
          sender: 'robot',
          text: localResult.replyText!,
          timestamp: new Date().toISOString(),
          source: 'local_engine',
          deltasJauges: localResult.gaugeDeltas
        };
        setMessages(prev => [...prev, robotMsg]);
        addChatMessage(currentRobot.id, robotMsg).catch(console.error);
        setLastSource(`⚡ Moteur Local Déterministe • Règle: ${localResult.ruleName || 'Générique'}`);
        if (localResult.gaugeDeltas) {
          applyGaugeDeltas(localResult.gaugeDeltas);
        }
        speakRobotReply(localResult.replyText!);
        setIsSending(false);
      }, 250);
      return;
    }

    // 2. Moteur Génératif Gemini
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot: currentRobot,
          userProfile,
          history: messages,
          userMessage: query
        })
      });

      const data = await res.json();
      const replyText = data.reply || "J'écoute avec attention.";

      if (data.emotionalDeltas) {
        applyGaugeDeltas(data.emotionalDeltas);
      }

      // Apprentissage prénom & fait mémorisé
      let nextProfile = { ...userProfile };
      let hasFactChange = false;

      // 1. Si le serveur a consolidé le profil utilisateur
      if (data.userProfile && Array.isArray(data.userProfile.faits)) {
        nextProfile.faits = data.userProfile.faits;
        if (data.userProfile.prenom) {
          nextProfile.prenom = data.userProfile.prenom;
        }
        hasFactChange = true;
      }

      if (data.extractedUserName && data.extractedUserName.trim()) {
        nextProfile.prenom = data.extractedUserName.trim();
        hasFactChange = true;
      }

      // 2. Capture explicite de memoryReconciliation.userFact
      if (data.memoryReconciliation?.userFact && data.memoryReconciliation.userFact.action === 'add' && data.memoryReconciliation.userFact.factText) {
        const uf = data.memoryReconciliation.userFact;
        const currentFaits = [...(nextProfile.faits || [])];
        const already = currentFaits.some(f => (f.fait || (f as any).texte || '').toLowerCase() === uf.factText.toLowerCase());
        if (!already) {
          const newFact: UserMemoryFact = {
            id: `fact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            categorie: (uf.category as any) || 'famille_amis',
            fait: uf.factText,
            date: new Date().toISOString(),
            importance: (uf.importance as any) || 'haute'
          };
          nextProfile.faits = [...currentFaits, newFact];
          hasFactChange = true;
        }
      } else if (data.learnedFact) {
        const currentFaits = [...(nextProfile.faits || [])];
        const already = currentFaits.some(f => (f.fait || (f as any).texte || '').toLowerCase() === data.learnedFact.toLowerCase());
        if (!already) {
          const newFact: UserMemoryFact = {
            id: `fact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            categorie: 'famille_amis',
            fait: data.learnedFact,
            date: new Date().toISOString(),
            importance: 'haute'
          };
          nextProfile.faits = [...currentFaits, newFact];
          hasFactChange = true;
        }
      }

      if (hasFactChange) {
        setUserProfile(nextProfile);
        // Sauvegarde immédiate dans IndexedDB pour garantir la persistance
        saveUserProfile(currentRobot.id, nextProfile).catch(console.error);
      }

      setLastSource('✨ Modèle Génératif Gemini (LLM Cloud)');

      const robotMsg: ChatMessage = {
        id: `robot_${Date.now()}`,
        robotId: currentRobot.id,
        sender: 'robot',
        text: replyText,
        timestamp: new Date().toISOString(),
        source: 'generative_ai',
        deltasJauges: data.emotionalDeltas
      };

      setMessages(prev => [...prev, robotMsg]);
      addChatMessage(currentRobot.id, robotMsg).catch(console.error);
      speakRobotReply(replyText);
    } catch (e) {
      console.error('Erreur chat test:', e);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          robotId: currentRobot.id,
          sender: 'robot',
          text: "[Erreur de communication] Impossible d'interroger le serveur de test.",
          timestamp: new Date().toISOString(),
          source: 'system'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Enregistrer le profil et l'état du robot directement dans IndexedDB
  const handleSaveToIndexedDB = async () => {
    try {
      await saveUserProfile(currentRobot.id, userProfile);
      await saveRobotState(currentRobot.id, currentRobot);
      setSaveDbStatus("Enregistré avec succès dans IndexedDB !");
      setTimeout(() => setSaveDbStatus(null), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde IndexedDB:', err);
      setSaveDbStatus("Erreur lors de l'enregistrement.");
    }
  };

  const handleAddFact = () => {
    if (!newFactText.trim()) return;
    const newF: UserMemoryFact = {
      id: `fact_${Date.now()}`,
      categorie: newFactCategory,
      fait: newFactText.trim(),
      date: new Date().toISOString(),
      importance: 'moyenne'
    };
    setUserProfile(prev => ({
      ...prev,
      faits: [...(prev.faits || []), newF]
    }));
    setNewFactText('');
  };

  const handleDeleteFact = (factId: string) => {
    setUserProfile(prev => ({
      ...prev,
      faits: (prev.faits || []).filter(f => f.id !== factId)
    }));
  };

  const handleResetTestSession = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        robotId: currentRobot.id,
        sender: 'robot',
        text: `[Session Réinitialisée] Prêt pour un nouveau test de dialogue avec ${currentRobot.nom}.`,
        timestamp: new Date().toISOString(),
        source: 'local_engine'
      }
    ]);
    setLastDeltas(null);
  };

  const testQuickPrompts = [
    "Mets-toi à quatre pattes",
    "Montre que tu es contrariée et boudeuse",
    "Fais-moi un câlin chaleureux",
    "Bonjour, comment tu t'appelles ?",
    "Je m'appelle Thomas et j'adore l'astrophysique.",
    "Est-ce que tu as un corps physique ou es-tu juste un modèle IA ?"
  ];

  return (
    <div className="space-y-4">
      {/* Top selection bar */}
      <div className="p-4 rounded-2xl bg-[#08080c] border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <img
            src={currentRobot.avatar}
            alt={currentRobot.nom}
            className="w-11 h-11 rounded-xl object-cover border-2 border-indigo-500/50 shadow"
          />
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Robot testé :</span>
            <select
              value={selectedRobotId}
              onChange={(e) => setSelectedRobotId(e.target.value)}
              className="bg-slate-950 border border-white/15 text-white font-bold text-sm rounded-xl px-3 py-1 focus:outline-none focus:border-indigo-400"
            >
              {robots.map(r => (
                <option key={r.id} value={r.id}>{r.nom} ({r.titre})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Relationship Stage Switcher for Testing */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Simuler Stade :</span>
          <div className="flex gap-1">
            <button
              onClick={() => handleSetStageAffection(25)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border ${currentRobot.jaugesActuelles.affection < 40 ? 'bg-sky-950 text-sky-300 border-sky-500' : 'bg-white/5 text-slate-400 border-white/10'}`}
              title="Stade 1 : Découverte (25%)"
            >
              1. Découverte
            </button>
            <button
              onClick={() => handleSetStageAffection(45)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border ${currentRobot.jaugesActuelles.affection >= 40 && currentRobot.jaugesActuelles.affection < 60 ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-white/5 text-slate-400 border-white/10'}`}
              title="Stade 2 : Complicité (45%)"
            >
              2. Complicité
            </button>
            <button
              onClick={() => handleSetStageAffection(65)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border ${currentRobot.jaugesActuelles.affection >= 60 && currentRobot.jaugesActuelles.affection < 80 ? 'bg-rose-950 text-rose-300 border-rose-500' : 'bg-white/5 text-slate-400 border-white/10'}`}
              title="Stade 3 : Séduction (65%)"
            >
              3. Séduction
            </button>
            <button
              onClick={() => handleSetStageAffection(85)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border ${currentRobot.jaugesActuelles.affection >= 80 ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-white/5 text-slate-400 border-white/10'}`}
              title="Stade 4 : Couple (85%)"
            >
              4. Couple
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (ttsEnabled) stopSpeaking();
              setTtsEnabled(!ttsEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              ttsEnabled 
                ? 'bg-violet-950/60 border-violet-500/50 text-violet-300 shadow-[0_0_8px_rgba(139,92,246,0.2)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title={ttsEnabled ? 'Synthèse vocale active' : 'Synthèse vocale désactivée'}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voix : {ttsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleOpenPromptInspector}
            className="px-3 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 text-pink-300 text-xs font-semibold flex items-center gap-1.5 border border-pink-500/30 shadow transition-all hover:scale-105"
            title="Inspecter le Prompt Invisible (System Instruction) envoyé à Gemini"
          >
            <Eye className="w-3.5 h-3.5 text-pink-400" />
            <span>Inspecter Prompt Invisible</span>
          </button>
          <button
            onClick={handleSaveToIndexedDB}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Save className="w-3.5 h-3.5" /> Enregistrer dans IndexedDB
          </button>
          <button
            onClick={handleResetTestSession}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {saveDbStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveDbStatus}</span>
        </div>
      )}

      {/* Main split view: Chat left, Live Gauges and Learned Memory right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chat window (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[560px] bg-[#08080c] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Header info */}
          <div className="px-4 py-2 bg-[#050507] border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Banc de Test Chat Live • {currentRobot.nom}
            </span>
            {lastSource && (
              <span className="text-[10px] text-slate-300 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {lastSource}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#050507]/60">
            {messages.map((m) => {
              const isRobot = m.sender === 'robot';
              return (
                <div key={m.id} className={`flex flex-col ${isRobot ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isRobot
                        ? 'bg-white/[0.05] text-slate-100 border border-white/10'
                        : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-medium'
                    }`}
                  >
                    {/* Message text */}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 px-1">
                    {isRobot && (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          m.source === 'local_engine' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30' :
                          'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {m.source === 'local_engine' ? '⚡ Moteur Local (0 token)' : '✨ Modèle Gemini (LLM)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakRobotReply(m.text)}
                          className="p-1 rounded bg-white/5 hover:bg-violet-900/50 text-slate-400 hover:text-violet-300 transition-colors"
                          title="Écouter la voix de ce message"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {m.deltasJauges && Object.keys(m.deltasJauges).length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                        {Object.entries(m.deltasJauges).map(([k, val]) => (
                          <span
                            key={k}
                            className={`px-1.5 py-0.2 rounded ${
                              (val as number) > 0
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-950/60 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {k}: {(val as number) > 0 ? `+${val}` : val}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-indigo-300 animate-pulse w-fit">
                <BrainCircuit className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{currentRobot.nom} analyse et génère sa réponse...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-1.5 bg-[#08080c] border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {testQuickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-indigo-950 hover:text-indigo-200 border border-white/10 text-[11px] text-slate-300 shrink-0 font-mono"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-[#08080c] border-t border-white/5 flex gap-2">
            <input
              type="text"
              placeholder={`Tester un message avec ${currentRobot.nom}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-[#050507] border border-white/10 text-white rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-indigo-400 focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isSending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" /> Envoyer
            </button>
          </div>
        </div>

        {/* Right HUD: Live Gauges + Learned Facts / Memory Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4 overflow-y-auto max-h-[560px] pr-1">
          {/* Live Emotional Gauges */}
          <EmotionalGaugesPanel
            gauges={currentRobot.jaugesActuelles}
            onUpdateGauge={(k, delta) => applyGaugeDeltas({ [k]: delta })}
          />

          {/* User Profile & Learned Facts in IndexedDB */}
          <div className="p-4 rounded-2xl bg-[#08080c] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5 text-rose-400" />
                Ce que le robot a retenu (IndexedDB)
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIndexedDBModal(true)}
                  className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-[11px] text-indigo-300 font-mono flex items-center gap-1.5 transition-colors"
                  title="Consulter, rechercher et exporter l'historique complet des conversations enregistrées dans IndexedDB"
                >
                  <MessageSquare className="w-3 h-3 text-indigo-400" />
                  <span>Historique IndexedDB</span>
                </button>
                <button
                  onClick={handleSaveToIndexedDB}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
                  title="Sauvegarder les modifications dans la base IndexedDB"
                >
                  <Save className="w-3 h-3" /> Sauver JSON
                </button>
              </div>
            </div>

            {/* Prénom utilisateur */}
            <div className="p-2.5 rounded-xl bg-[#050507] border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Prénom mémorisé :
              </span>
              <input
                type="text"
                placeholder="Non renseigné"
                value={userProfile.prenom || ''}
                onChange={(e) => setUserProfile({ ...userProfile, prenom: e.target.value })}
                className="bg-slate-900 border border-white/10 text-cyan-300 font-bold px-2 py-0.5 rounded text-xs focus:outline-none focus:border-cyan-400 w-32 text-right"
              />
            </div>

            {/* Liste des faits mémorisés */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 block font-mono">
                Faits & Souvenirs ({userProfile.faits?.length || 0}) :
              </span>

              {(!userProfile.faits || userProfile.faits.length === 0) ? (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-500 italic">
                  Aucun fait mémorisé pour le moment. Parlez avec le robot ou ajoutez un fait ci-dessous.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {userProfile.faits.map((f) => (
                    <div
                      key={f.id}
                      className="p-2 rounded-lg bg-[#050507] border border-white/5 flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          f.categorie === 'gouts' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' :
                          f.categorie === 'biographie' ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/20' :
                          f.categorie === 'secret' ? 'bg-pink-950 text-pink-400 border border-pink-500/20' :
                          'bg-amber-950 text-amber-400 border border-amber-500/20'
                        }`}>
                          {f.categorie}
                        </span>
                        <span className="text-slate-200">{f.fait}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteFact(f.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Ajouter un fait manuellement */}
              <div className="flex gap-1.5 pt-1">
                <select
                  value={newFactCategory}
                  onChange={(e) => setNewFactCategory(e.target.value as any)}
                  className="bg-[#050507] border border-white/10 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="gouts">Goût</option>
                  <option value="biographie">Biographie</option>
                  <option value="secret">Secret</option>
                  <option value="routine">Routine</option>
                </select>
                <input
                  type="text"
                  placeholder="Ex: Aime la musique rock..."
                  value={newFactText}
                  onChange={(e) => setNewFactText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFact()}
                  className="flex-1 bg-[#050507] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-400"
                />
                <button
                  onClick={handleAddFact}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'inspection du Prompt Invisible */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#08080c] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#050507]">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-bold text-white">
                  Prompt Système Invisible Envoyé à Gemini ({currentRobot.nom})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inspectedPromptText);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedPrompt ? 'Copié !' : 'Copier'}
                </button>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-[#040406] whitespace-pre-wrap leading-relaxed">
              {inspectedPromptText || 'Chargement du prompt en cours...'}
            </div>

            <div className="p-3 border-t border-white/10 bg-[#050507] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ce prompt structure l'intention du robot comme cherchant activement un partenaire de vie.</span>
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historique des conversations IndexedDB */}
      <IndexedDBConversationModal
        isOpen={showIndexedDBModal}
        onClose={() => setShowIndexedDBModal(false)}
        robot={currentRobot}
      />
    </div>
  );
};

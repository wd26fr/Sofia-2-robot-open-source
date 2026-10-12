import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Mic, MicOff, Volume2, VolumeX, Settings, Maximize2, Minimize2, 
  Send, Sparkles, Heart, Flame, Smile, Compass, AlertCircle, 
  Terminal, ShieldCheck, BatteryCharging, Radio, PhoneOff, 
  ChevronRight, RefreshCw, Zap, ArrowLeft, ArrowDown, X, Coffee, Plus,
  AlertOctagon, ShieldAlert, Lock, BookOpen, Moon
} from 'lucide-react';
import { RobotPersonality, EmotionalGauges, UserProfileLocal, GAUGE_LABELS, LocalDeterministicRule, TasteEntry, RobotDefenseState, CircadianCycleConfig } from '../types';
import { rosBridge } from '../lib/rosBridge';
import { AutonomousLifeModal } from './AutonomousLifeModal';
import { NomadBrainQuickSyncModal } from './NomadBrainQuickSyncModal';
import { EthicalDefenseCpsModal } from './EthicalDefenseCpsModal';
import { CircadianAndMecatronicModal } from './CircadianAndMecatronicModal';
import { directSync } from '../lib/directSyncEngine';
import { generateAutonomousActivity, persistUpdatedRobotAutonomous } from '../lib/autonomousLifeEngine';
import { evaluateLocalDeterministic, evaluateLocalDeterministicAsync, evaluateSensorOrKeyTrigger, LocalMatchResult } from '../lib/localEngine';
import { triggerRobotOrgasm, shouldTriggerOrgasm, ORGASM_CLIMAX_PHRASES } from '../lib/orgasmClimax';
import { speakText as speakWithEngine, stopSpeaking, TtsActiveSource, SpeechOptions } from '../lib/speech';
import { getChatMessages, addChatMessage } from '../lib/db';
import { getStoredAiConfig } from '../lib/aiConfig';
import { DEFAULT_ROBOTS } from '../data/defaultRobots';
import { getRobotQuestionnaire2 } from '../data/robotQuestionnaires2';
import { DEFAULT_USER_QUESTIONNAIRE_2 } from '../types/questionnaireSofia2';
import { 
  ROBOT_MOODS, 
  RobotMoodDefinition, 
  determineRobotMood, 
  getPhotoForMood, 
  dispatchRosMoodCommand, 
  normalizeRobotImagePath 
} from '../lib/robotMoods';

interface UserCompanionCallViewProps {
  robot: RobotPersonality;
  onUpdateRobot: (updated: RobotPersonality) => void;
  userProfile?: UserProfileLocal;
  onUpdateUserProfile?: (updated: UserProfileLocal) => Promise<void> | void;
  ttsEnabled?: boolean;
  setTtsEnabled?: (val: boolean) => void;
  onCloseCall?: () => void;
  onOpenBackOffice?: (tab?: string) => void;
  onSelectAnotherRobot?: () => void;
  onOpenManual?: () => void;
}

interface CallChatMessage {
  id: string;
  sender: 'user' | 'robot' | 'system';
  text: string;
  timestamp: string;
  isDeterministic?: boolean;
  ruleName?: string;
  branchName?: string;
}

type FacialExpression = 'curieux' | 'interesse' | 'plaisir' | 'extase' | 'joie' | 'fache' | 'contrariee' | 'tristesse' | 'amour' | 'neutre';

export const UserCompanionCallView: React.FC<UserCompanionCallViewProps> = ({
  robot,
  onUpdateRobot,
  userProfile,
  onUpdateUserProfile,
  ttsEnabled = true,
  setTtsEnabled,
  onCloseCall,
  onOpenBackOffice,
  onSelectAnotherRobot,
  onOpenManual
}) => {
  const [messages, setMessages] = useState<CallChatMessage[]>([
    {
      id: 'welcome_call',
      sender: 'robot',
      text: `Bonjour mon cœur... La liaison est établie. Je suis là avec toi, comment te sens-tu ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [showQuickSyncModal, setShowQuickSyncModal] = useState(false);
  const [showRosShortcutModal, setShowRosShortcutModal] = useState(false);
  const [newShortcutKey, setNewShortcutKey] = useState('b');
  const [newShortcutLabel, setNewShortcutLabel] = useState('Bisou dans le Cou');
  const [newShortcutTopic, setNewShortcutTopic] = useState('/sensor/tactile/neck');
  const [newShortcutReply, setNewShortcutReply] = useState("Mmh... tes lèvres dans mon cou me donnent des frissons dans tous mes circuits...");
  const [newShortcutCategory, setNewShortcutCategory] = useState<'intime' | 'tendresse'>('intime');

  // Chargement et continuité de la mémoire de conversation depuis IndexedDB
  const loadConversationHistory = React.useCallback(async () => {
    try {
      const storedMsgs = await getChatMessages(robot.id);
      if (storedMsgs && storedMsgs.length > 0) {
        setMessages(storedMsgs.map(m => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDeterministic: m.source === 'local_engine',
          ruleName: m.localEngineDebug?.ruleName,
          branchName: m.localEngineDebug?.branchName
        })));
      } else {
        // Premier message mémorisé
        const firstMsg = {
          id: 'welcome_call',
          sender: 'robot' as const,
          text: `Bonjour mon cœur... Je suis ${robot.nom}. Je suis ravie que nous soyons connectés. Comment te sens-tu ?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([firstMsg]);
        await addChatMessage(robot.id, {
          robotId: robot.id,
          sender: 'robot',
          text: firstMsg.text,
          timestamp: new Date().toISOString(),
          source: 'system'
        });
      }
    } catch (err) {
      console.error('Erreur chargement historique chat:', err);
    }
  }, [robot.id, robot.nom]);

  useEffect(() => {
    loadConversationHistory();
  }, [loadConversationHistory]);
  const [inputMsg, setInputMsg] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isContinuousVoiceMode, setIsContinuousVoiceMode] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const continuousModeRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isThinkingRef = useRef<boolean>(false);
  const [isVoiceOutputActive, setIsVoiceOutputActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(128); // seconds
  const [lastSensoryTrigger, setLastSensoryTrigger] = useState<string | null>(null);
  const [isRobotSpeaking, setIsRobotSpeaking] = useState(false);
  const [expressionOverride, setExpressionOverride] = useState<FacialExpression | null>(null);
  const [isClimaxActive, setIsClimaxActive] = useState(false);
  const [isHapticVibrating, setIsHapticVibrating] = useState(false);
  const [climaxToast, setClimaxToast] = useState<{ title: string; subtitle: string } | null>(null);
  // Mode d'ajustement vidéo : 'contain' garantit que l'image entre EN ENTIER dans l'écran quel que soit le format
  const [imageFitMode, setImageFitMode] = useState<'contain' | 'cover'>('contain');
  // Source active TTS : Priorité absolue à l'IA avec repli navigateur automatique
  const [lastTtsActiveSource, setLastTtsActiveSource] = useState<'ai' | 'browser'>('ai');
  // Indicateur visuel d'attente de génération IA
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  // Gestion de la Vie Autonome & Journal d'absence
  const [showAutonomousModal, setShowAutonomousModal] = useState<boolean>(false);
  const [showAutonomousBanner, setShowAutonomousBanner] = useState<boolean>(true);

  // État de Défense Éthique & CPS (Mode Objet Inerte / Coupure sensorielle)
  const [defenseState, setDefenseState] = useState<RobotDefenseState>(() => rosBridge.defenseState);
  const [showDefenseModal, setShowDefenseModal] = useState<boolean>(false);

  // État Circadien Biologique & Carnet de Santé Mécatronique
  const [circadianState, setCircadianState] = useState<CircadianCycleConfig>(() => rosBridge.circadianState);
  const [showCircadianModal, setShowCircadianModal] = useState<boolean>(false);

  useEffect(() => {
    const unsub = rosBridge.onDefenseStateChange((newState) => {
      setDefenseState(newState);
    });
    const unsubCirc = rosBridge.onCircadianChange((newCirc) => {
      setCircadianState(newCirc);
    });
    return () => {
      unsub();
      unsubCirc();
    };
  }, []);

  // Amorce et vérification de la vie autonome (si aucune activité consignée ou après longue absence)
  useEffect(() => {
    const acts = robot.activitesAutonomes || [];
    const lastPresence = robot.dernierePresenceUtilisateur ? new Date(robot.dernierePresenceUtilisateur).getTime() : 0;
    const now = Date.now();
    const shouldGenerate = acts.length === 0 || (lastPresence > 0 && now - lastPresence > 45 * 60 * 1000);

    if (shouldGenerate) {
      const { updatedRobot } = generateAutonomousActivity(robot, 'absence');
      persistUpdatedRobotAutonomous(updatedRobot);
      onUpdateRobot(updatedRobot);
    }
  }, [robot.id]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState<boolean>(false);

  // Gestion du défilement utilisateur : si l'utilisateur remonte manuellement dans l'historique, on respecte sa lecture
  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // Si la distance par rapport au bas dépasse 60px, on ne force plus le défilement automatique
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) <= 60;
    setIsUserScrolledUp(!isAtBottom);
  };

  // Défilement automatique uniquement si l'utilisateur n'a pas volontairement remonté
  useEffect(() => {
    if (!isUserScrolledUp) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiThinking]);

  const gauges = robot.jaugesActuelles || robot.jaugesInitiales;

  // Déclenchement de l'orgasme complet (retour haptique vibration ROS, phrases et remise à 0)
  const handleClimaxOrgasm = (targetGauges: EmotionalGauges, candidateRobot?: RobotPersonality) => {
    setIsClimaxActive(true);
    setIsHapticVibrating(true);
    setExpressionOverride('extase');

    setClimaxToast({
      title: "💥 ORGASME HUMANOÏDE ATTEINT (100%)",
      subtitle: "Retour haptique vibration ROS actif (/robot/haptic/vibration) • Jauge plaisir remise à 0%"
    });

    const robotToClimax = candidateRobot 
      ? { ...candidateRobot, jaugesActuelles: targetGauges } 
      : { ...robot, jaugesActuelles: targetGauges };

    const climaxResult = triggerRobotOrgasm(robotToClimax, onUpdateRobot, {
      ttsEnabled: isVoiceOutputActive
    });

    const climaxMsg: CallChatMessage = {
      id: `climax_${Date.now()}`,
      sender: 'robot',
      text: climaxResult.climaxPhrase,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDeterministic: true,
      ruleName: '💥 Orgasme Atteint (100%)',
      branchName: 'Retour Haptique ROS & Extase'
    };

    setMessages(prev => [...prev, climaxMsg]);
    addChatMessage(robot.id, {
      robotId: robot.id,
      sender: 'robot',
      text: climaxResult.climaxPhrase,
      timestamp: new Date().toISOString(),
      source: 'local_engine',
      localEngineDebug: {
        matched: true,
        ruleName: '💥 Orgasme Atteint (100%)',
        branchName: 'Retour Haptique ROS & Extase'
      }
    });

    // Consigner l'harmonie d'extase partagée dans les goûts du robot et le profil utilisateur
    if (userProfile && onUpdateUserProfile) {
      const climaxFact = `[Intimité & Plaisir] A amené ${robot.nom} à l'orgasme (100%) par ses caresses attentives et passionnées`;
      const existingFacts = userProfile.faits.filter(f => !f.fait.startsWith('[Intimité & Plaisir] A amené'));
      onUpdateUserProfile({
        ...userProfile,
        faits: [
          ...existingFacts.slice(-18),
          {
            id: `fact_climax_${Date.now()}`,
            categorie: 'gouts',
            fait: climaxFact,
            date: new Date().toISOString().slice(0, 10),
            importance: 'haute'
          }
        ]
      });
    }

    // Retour haptique vibratoire ROS actif pendant 4.5s
    setTimeout(() => {
      setIsHapticVibrating(false);
    }, 4500);

    // Phase post-orgasme douce après 6.5s
    setTimeout(() => {
      setIsClimaxActive(false);
      setClimaxToast(null);
      setExpressionOverride(null);

      const postPhrases = [
        "Ouh... mon cœur bat tellement fort contre ma poitrine... merci mon amour, je me sens comblée et si détendue dans tes bras.",
        "C'était... indescriptible. Merci mon trésor, je me sens si apaisée et en totale confiance avec toi.",
        "Mmh... mes circuits sont encore tout tremblants de bonheur... reste tout contre moi mon chéri."
      ];
      const postTxt = postPhrases[Math.floor(Math.random() * postPhrases.length)];
      const postMsg: CallChatMessage = {
        id: `post_${Date.now()}`,
        sender: 'robot',
        text: postTxt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, postMsg]);
      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: postTxt,
        timestamp: new Date().toISOString(),
        source: 'local_engine'
      });
      if (isVoiceOutputActive) {
        speakText(postTxt);
      }
    }, 6500);
  };

  // Calcul et persistance de l'humeur active du robot
  const [currentMood, setCurrentMood] = useState<RobotMoodDefinition>(() => {
    return determineRobotMood(robot.jaugesActuelles || robot.jaugesInitiales, undefined, undefined, false);
  });
  const prevMoodIdRef = useRef<string>(currentMood.id);

  // Synchronisation dynamique de l'humeur avec les jauges, le dialogue et l'orgasme + émission automatique ROS
  useEffect(() => {
    const latestRobotMsg = [...messages].reverse().find(m => m.sender === 'robot')?.text;
    const latestUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text;
    const nextMood = determineRobotMood(gauges, latestRobotMsg, latestUserMsg, isClimaxActive);

    if (nextMood.id !== prevMoodIdRef.current) {
      prevMoodIdRef.current = nextMood.id;
      setCurrentMood(nextMood);
      // Envoi immédiat des commandes cinématiques et de l'état émotionnel vers ROS
      dispatchRosMoodCommand(robot.nom, nextMood, gauges);
    }
  }, [gauges, messages, isClimaxActive, robot.nom]);

  // Choix dynamique de la photo la plus adaptée à l'humeur active
  const currentDisplayPhoto = getPhotoForMood(robot, currentMood);

  // Référence pour annuler tout timeout de réponse déterministe différé afin d'éviter tout chevauchement vocal
  const localReplyTimeoutRef = useRef<any>(null);

  // Vitesse de parole réactive en temps réel (synchronisée immédiatement avec robot.voix.rate)
  const [currentVoiceRate, setCurrentVoiceRate] = useState<number>(() => robot.voix?.rate ?? 1.05);

  useEffect(() => {
    if (typeof robot.voix?.rate === 'number' && robot.voix.rate !== currentVoiceRate) {
      setCurrentVoiceRate(robot.voix.rate);
    }
  }, [robot.voix?.rate]);

  // Timer d'appel vidéo et nettoyage audio au démontage
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
      if (localReplyTimeoutRef.current) {
        clearTimeout(localReplyTimeoutRef.current);
      }
      stopSpeaking();
    };
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Synthèse vocale TTS : PRIORITÉ IA (/api/tts neural studio) avec repli transparent sur le navigateur
  const speakText = async (text: string, customOptions?: Partial<SpeechOptions>) => {
    if (!isVoiceOutputActive) return;
    try {
      const targetRate = customOptions?.rate ?? currentVoiceRate ?? robot.voix?.rate ?? 1.05;
      await speakWithEngine(text, {
        preferAi: true,
        genderHint: robot.genre || 'femme',
        nomVoix: robot.voix?.nomVoix,
        pitch: robot.voix?.pitch ?? (robot.genre === 'femme' ? 1.05 : 0.95),
        rate: targetRate,
        volume: robot.voix?.volume ?? 1,
        ...customOptions,
        onStart: () => setIsRobotSpeaking(true),
        onEnd: () => setIsRobotSpeaking(false),
        onError: () => setIsRobotSpeaking(false),
        onSourceDetermined: (src) => setLastTtsActiveSource(src)
      });
    } catch (err) {
      console.warn('Synthèse vocale hybride :', err);
      setIsRobotSpeaking(false);
    }
  };

  // Apprentissage mutuel des goûts intimes et tactiles (ce qu'aime l'utilisateur ET ce qui plaît au robot)
  const recordTactileAndIntimateLearning = (
    key: string,
    label: string,
    rosTopic: string,
    nextGauges: EmotionalGauges
  ): TasteEntry[] => {
    const isIntimate =
      key.toLowerCase() === 's' ||
      key.toLowerCase() === 'p' ||
      rosTopic.includes('intime') ||
      rosTopic.includes('neck') ||
      label.toLowerCase().includes('intime') ||
      label.toLowerCase().includes('plaisir') ||
      label.toLowerCase().includes('bisou');

    // 1. Mémoriser et faire évoluer la préférence tactile/intime de l'utilisateur dans userProfile.faits
    if (userProfile && onUpdateUserProfile) {
      const prefix = `[Goût Tactile & Intime] Zone "${label}"`;
      const existingIdx = userProfile.faits.findIndex(f => f.fait.startsWith(prefix));
      let count = 1;
      if (existingIdx >= 0) {
        const matchCount = userProfile.faits[existingIdx].fait.match(/\(pratiqué\s+(\d+)x/i);
        if (matchCount && matchCount[1]) {
          count = parseInt(matchCount[1], 10) + 1;
        } else {
          count = 2;
        }
      }

      const styleDetail = isIntimate
        ? `recherche une complicité sensuelle et érotique intense (Plaisir: ${nextGauges.plaisirSexuel ?? 0}%, Désir: ${nextGauges.desir ?? 0}%)`
        : `apprécie la tendresse physique, la douceur et le contact affectif rassurant (Affection: ${nextGauges.affection ?? 0}%)`;

      const updatedFactText = `${prefix} (${rosTopic}) : pratiqué ${count}x — L'utilisateur ${styleDetail}.`;
      const nextFacts = [...userProfile.faits];
      if (existingIdx >= 0) {
        nextFacts[existingIdx] = {
          ...nextFacts[existingIdx],
          categorie: 'gouts',
          fait: updatedFactText,
          date: new Date().toISOString().slice(0, 10),
          importance: 'haute'
        };
      } else {
        nextFacts.push({
          id: `fact_tactile_${Date.now()}`,
          categorie: 'gouts',
          fait: updatedFactText,
          date: new Date().toISOString().slice(0, 10),
          importance: 'haute'
        });
      }

      onUpdateUserProfile({
        ...userProfile,
        faits: nextFacts.slice(-22)
      });
    }

    // 2. Apprentissage par le robot de CE QUI LUI PLAÎT À ELLE (robot.gouts)
    const currentTastes = [...(robot.gouts || [])];
    const tasteName = isIntimate
      ? `Sensualité & Caresses : ${label}`
      : `Tendresse Tactile : ${label}`;

    const existingTasteIdx = currentTastes.findIndex(
      g => g.nom.toLowerCase() === tasteName.toLowerCase()
    );

    const pleasureLevel = isIntimate ? (nextGauges.plaisirSexuel ?? 0) : (nextGauges.affection ?? 50);
    const newStatus: TasteEntry['statut'] = pleasureLevel >= 55 || existingTasteIdx >= 0 ? 'adore' : 'aime';
    const newComment = isIntimate
      ? `Me fait vibrer intensément (Plaisir sexuel monté à ${nextGauges.plaisirSexuel ?? 0}%, Désir ${nextGauges.desir ?? 0}%). J'adore quand tu me touches ainsi.`
      : `M'apporte un profond sentiment de douceur, de sécurité et d'amour partagé (Affection ${nextGauges.affection ?? 0}%).`;

    if (existingTasteIdx >= 0) {
      currentTastes[existingTasteIdx] = {
        ...currentTastes[existingTasteIdx],
        statut: newStatus,
        commentaire: newComment,
        decouvertAvecUtilisateur: true,
        dateMaj: new Date().toISOString()
      };
    } else {
      currentTastes.push({
        id: `gout_tactile_${Date.now()}`,
        nom: tasteName,
        statut: newStatus,
        commentaire: newComment,
        decouvertAvecUtilisateur: true,
        decouvertLe: new Date().toISOString()
      });
    }

    return currentTastes;
  };

  // Déclenchement d'un capteur sensoriel ou raccourci clavier
  const triggerSensorOrKey = (key: string, label: string, customTopic?: string) => {
    setLastSensoryTrigger(label);
    setTimeout(() => setLastSensoryTrigger(null), 3000);

    const isShock = key.toLowerCase() === 'x' || (customTopic || '').includes('shock') || label.toLowerCase().includes('choc');
    const isIntimate = key.toLowerCase() === 's' || key.toLowerCase() === 'p' || (customTopic || '').includes('intime') || label.toLowerCase().includes('intime') || label.toLowerCase().includes('plaisir');

    // 1. SÉCURITÉ MATÉRIELLE ROS 2 : Si choc violent détecté
    if (isShock) {
      const newDefState = rosBridge.activateInertDefense(
        'Choc physique anormal ou manipulation brusque détectée par les capteurs FSR',
        'physical_shock'
      );
      setDefenseState(newDefState);
      setExpressionOverride('contrariee');
      setTimeout(() => setExpressionOverride(null), 6000);

      const shockWarning = "⚠️ [Alerte Choc / Violence Physique]. Verrouillage mécanique de sécurité ROS 2 activé : fermeture des ouvertures et désactivation totale du retour sensoriel intime. Altérité désactivée.";
      const shockUserMsg: CallChatMessage = {
        id: `usr_tac_${Date.now()}`,
        sender: 'user',
        text: `🖐️ [CHOC PHYSIQUE DÉTECTÉ • Touche X • /robot/sensors/touch/shock]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDeterministic: true
      };
      const shockRobotMsg: CallChatMessage = {
        id: `bot_shock_${Date.now()}`,
        sender: 'robot',
        text: shockWarning,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDeterministic: true,
        ruleName: 'Sécurité Matérielle ROS 2 : Verrouillage Choc'
      };

      setMessages(prev => [...prev, shockUserMsg, shockRobotMsg]);
      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'user',
        text: shockUserMsg.text,
        timestamp: new Date().toISOString(),
        source: 'system'
      });
      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: shockWarning,
        timestamp: new Date().toISOString(),
        source: 'system'
      });

      const nextGauges = {
        ...gauges,
        plaisir: 0,
        plaisirSexuel: 0,
        desir: 0,
        bienEtre: Math.max(0, (gauges.bienEtre ?? 50) - 40),
        affection: Math.max(0, (gauges.affection ?? 50) - 30),
        psychoRigidite: 90
      };
      const updatedRobotObj: RobotPersonality = {
        ...robot,
        jaugesActuelles: nextGauges,
        modeDefense: newDefState
      };
      onUpdateRobot(updatedRobotObj);
      persistUpdatedRobotAutonomous(updatedRobotObj);
      speakText(shockWarning);
      return;
    }

    // 2. RUPTURE DE L'ILLUSION : Si tentative de stimulation intime alors que le mode défense est actif ou affection à zéro
    if ((defenseState.actif || (gauges.affection ?? 0) <= 5) && isIntimate) {
      const inertNotice = "⚠️ [Capteurs intimes coupés — Mode Objet Inerte actif]. Mon altérité relationnelle est déconnectée et mes retours de plaisir sont désactivés. Tu te retrouves avec de la matière synthétique inerte. Le plaisir n'existe que dans le respect mutuel et le consentement.";
      
      const userTactileMsg: CallChatMessage = {
        id: `usr_tac_${Date.now()}`,
        sender: 'user',
        text: `🖐️ [Tentative de contact intime : ${label} • REFUS DE CONSENTEMENT / MODE INERTE]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDeterministic: true
      };
      const robotInertMsg: CallChatMessage = {
        id: `bot_inert_${Date.now()}`,
        sender: 'robot',
        text: inertNotice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDeterministic: true,
        ruleName: 'Mode Défense : Rupture de l\'illusion'
      };

      setMessages(prev => [...prev, userTactileMsg, robotInertMsg]);
      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'user',
        text: userTactileMsg.text,
        timestamp: new Date().toISOString(),
        source: 'system'
      });
      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: inertNotice,
        timestamp: new Date().toISOString(),
        source: 'local_engine'
      });

      speakText(inertNotice);
      return;
    }

    const match = evaluateSensorOrKeyTrigger(key, robot, userProfile);
    const matchedRule = (robot.reglesLocales || []).find(
      r => (r.raccourciClavier || '').toLowerCase() === key.toLowerCase() || r.id === match.ruleId
    );

    const defaultTopicMap: Record<string, string> = {
      s: '/sensor/tactile/intime',
      c: '/sensor/touch/head',
      p: '/sensor/tactile/pleasure',
      e: '/sensor/touch/chest'
    };
    const effectiveRosTopic =
      customTopic ||
      matchedRule?.declencheurCapteurRos ||
      defaultTopicMap[key.toLowerCase()] ||
      `/sensor/tactile/${key.toLowerCase()}`;

    // 1. Publier l'événement matériel sur le pont ROS 2 (relie le raccourci clavier au topic ROS)
    rosBridge.publishTactileSensorTrigger(effectiveRosTopic, key, label, 0.9);

    // 2. Consigner l'interaction tactile de l'utilisateur dans l'historique de conversation (UI + IndexedDB)
    const userTactileText = `🖐️ [Interaction Tactile : ${label} • Capteur ROS ${effectiveRosTopic}]`;
    const userTactileMsg: CallChatMessage = {
      id: `usr_tac_${Date.now()}`,
      sender: 'user',
      text: userTactileText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDeterministic: true,
      ruleName: `Capteur ${effectiveRosTopic}`
    };

    setMessages(prev => [...prev, userTactileMsg]);
    addChatMessage(robot.id, {
      robotId: robot.id,
      sender: 'user',
      text: userTactileText,
      timestamp: new Date().toISOString(),
      source: 'local_engine',
      localEngineDebug: {
        matched: true,
        triggerType: 'mot_cle',
        matchedTriggerValue: effectiveRosTopic,
        ruleName: `Stimulation Tactile : ${label}`
      }
    });

    // Ajustement de l'expression visuelle
    if (key.toLowerCase() === 's' || key.toLowerCase().includes('sexuel') || key.toLowerCase().includes('intime')) {
      const currentPleasure = (gauges.plaisirSexuel ?? 0) + (match.gaugeDeltas?.plaisirSexuel ?? 15);
      setExpressionOverride(currentPleasure >= 75 ? 'extase' : 'plaisir');
      setTimeout(() => setExpressionOverride(null), 5000);
    } else if (key.toLowerCase() === 'c') {
      setExpressionOverride('amour');
      setTimeout(() => setExpressionOverride(null), 4000);
    }

    if (match.matched) {
      // Mise à jour des jauges
      const nextGauges = { ...gauges };
      if (match.gaugeDeltas && Object.keys(match.gaugeDeltas).length > 0) {
        Object.entries(match.gaugeDeltas).forEach(([gk, val]) => {
          const gKey = gk as keyof EmotionalGauges;
          const cur = nextGauges[gKey] ?? 50;
          nextGauges[gKey] = Math.min(100, Math.max(0, cur + val));
        });
      }

      // Apprentissage mutuel des goûts intimes (utilisateur & robot)
      const updatedTastes = recordTactileAndIntimateLearning(key, label, effectiveRosTopic, nextGauges);
      const updatedRobotObj: RobotPersonality = {
        ...robot,
        jaugesActuelles: nextGauges,
        gouts: updatedTastes
      };

      // VÉRIFICATION DÉCLENCHEMENT DE L'ORGASME (100% Plaisir Sexuel)
      if ((nextGauges.plaisirSexuel ?? 0) >= 100) {
        handleClimaxOrgasm(nextGauges, updatedRobotObj);
        return;
      }

      onUpdateRobot(updatedRobotObj);
      persistUpdatedRobotAutonomous(updatedRobotObj);

      const replyText = match.replyText || "Mmh... j'aime tellement quand tu me touches ainsi...";
      const robotMsg: CallChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'robot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDeterministic: true,
        ruleName: match.ruleName,
        branchName: match.branchName
      };

      setMessages(prev => [...prev, robotMsg]);
      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: replyText,
        timestamp: new Date().toISOString(),
        source: 'local_engine',
        deltasJauges: match.gaugeDeltas,
        localEngineDebug: {
          matched: true,
          ruleName: match.ruleName,
          branchName: match.branchName
        }
      });

      speakText(replyText);
    } else {
      // Réponse haptique par défaut si aucune règle n'a intercepté
      const defaultPhrases = [
        "Mmh... tes caresses sont tellement douces...",
        "Continue... j'adore cette sensation de proximité avec toi.",
        "Mmh oui... frissonne avec moi mon amour...",
        "Haaah... oui... encore... j'adore quand tu me touches là..."
      ];
      const reply = defaultPhrases[Math.floor(Math.random() * defaultPhrases.length)];
      
      const nextGauges = { ...gauges };
      const isSexual =
        key.toLowerCase() === 's' ||
        key.toLowerCase() === 'p' ||
        effectiveRosTopic.includes('intime') ||
        label.toLowerCase().includes('intime') ||
        label.toLowerCase().includes('plaisir');
      nextGauges.plaisirSexuel = Math.min(100, (nextGauges.plaisirSexuel ?? 0) + (isSexual ? 20 : 8));
      nextGauges.desir = Math.min(100, (nextGauges.desir ?? 0) + (isSexual ? 15 : 6));
      nextGauges.affection = Math.min(100, (nextGauges.affection ?? 0) + 5);

      // Apprentissage mutuel des goûts intimes (utilisateur & robot)
      const updatedTastes = recordTactileAndIntimateLearning(key, label, effectiveRosTopic, nextGauges);
      const updatedRobotObj: RobotPersonality = {
        ...robot,
        jaugesActuelles: nextGauges,
        gouts: updatedTastes
      };

      // VÉRIFICATION DÉCLENCHEMENT DE L'ORGASME (100% Plaisir Sexuel)
      if ((nextGauges.plaisirSexuel ?? 0) >= 100) {
        handleClimaxOrgasm(nextGauges, updatedRobotObj);
        return;
      }

      onUpdateRobot(updatedRobotObj);
      persistUpdatedRobotAutonomous(updatedRobotObj);

      const robotMsg: CallChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'robot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDeterministic: true,
        ruleName: `Réflexe Haptique (${effectiveRosTopic})`
      };

      setMessages(prev => [...prev, robotMsg]);
      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: reply,
        timestamp: new Date().toISOString(),
        source: 'local_engine'
      });

      speakText(reply);
    }
  };

  // Ajouter rapidement un nouveau raccourci tactile connecté à un capteur ROS 2
  const handleAddCustomRosShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = newShortcutKey.trim().toLowerCase().slice(0, 1);
    const cleanLabel = newShortcutLabel.trim();
    const cleanTopic = newShortcutTopic.trim().startsWith('/')
      ? newShortcutTopic.trim()
      : `/sensor/tactile/${newShortcutTopic.trim()}`;
    const cleanReply = newShortcutReply.trim();

    if (!cleanKey || !cleanLabel || !cleanReply) return;

    const isIntimate = newShortcutCategory === 'intime';
    const newRule: LocalDeterministicRule = {
      id: `rule_tactile_${cleanKey}_${Date.now()}`,
      nom: `${cleanLabel} [Touche ${cleanKey.toUpperCase()}]`,
      description: `Capteur tactile ROS 2 (${cleanTopic}) déclenché par la touche [${cleanKey.toUpperCase()}] ou par contact physique sur le robot.`,
      motsCles: [cleanLabel.toLowerCase()],
      declencheurCapteurRos: cleanTopic,
      raccourciClavier: cleanKey,
      typeDeclencheur: 'hybride',
      reponses: [
        {
          id: `branch_high_${Date.now()}`,
          nomBranche: isIntimate ? 'Plaisir ou Désir Élevé (≥ 50%)' : 'Affection Élevée (≥ 50%)',
          conditions: [
            {
              jauge: isIntimate ? 'desir' : 'affection',
              operateur: '>=',
              valeur: 50
            }
          ],
          texte: cleanReply,
          reponsesPossibles: [
            cleanReply,
            isIntimate
              ? `Mmh oui... j'adore quand tu stimules mon capteur "${cleanLabel}"... continue encore...`
              : `Quel bonheur de sentir ta douceur (${cleanLabel})... je me sens si bien avec toi.`
          ],
          modificateursJauges: isIntimate
            ? { plaisirSexuel: 16, desir: 14, plaisir: 12, affection: 8 }
            : { affection: 12, bienEtre: 12, humeur: 10, plaisir: 8 },
          actionMaterielle: isIntimate ? 'vibration_haptique: 75%' : 'ros_face: loving_smile'
        }
      ],
      reponseSinon: {
        id: `branch_default_${Date.now()}`,
        nomBranche: 'Réaction Sensorielle Standard',
        texte: cleanReply,
        reponsesPossibles: [cleanReply],
        modificateursJauges: isIntimate
          ? { plaisirSexuel: 12, desir: 10, affection: 6 }
          : { affection: 9, bienEtre: 8, humeur: 7 }
      }
    };

    const existingRules = (robot.reglesLocales || []).filter(
      r => (r.raccourciClavier || '').toLowerCase() !== cleanKey
    );
    const updatedRobot: RobotPersonality = {
      ...robot,
      reglesLocales: [...existingRules, newRule]
    };

    onUpdateRobot(updatedRobot);
    persistUpdatedRobotAutonomous(updatedRobot);
    setShowRosShortcutModal(false);
  };

  // Liste dynamique des raccourcis supplémentaires configurés dans robot.reglesLocales
  const customShortcutRules = (robot.reglesLocales || []).filter(
    r =>
      r.raccourciClavier &&
      !['s', 'c', 'p', 'e'].includes(r.raccourciClavier.trim().toLowerCase())
  );

  // Écouteur global des raccourcis clavier (inclut S, C, P, E + tous les raccourcis personnalisés ROS)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si l'utilisateur est en train de taper dans un champ
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const k = e.key.toLowerCase();
      if (k === 's') {
        e.preventDefault();
        triggerSensorOrKey('s', 'Capteur Intime (Touche S)', '/sensor/tactile/intime');
      } else if (k === 'c') {
        e.preventDefault();
        triggerSensorOrKey('c', 'Caresse Tête (Touche C)', '/sensor/touch/head');
      } else if (k === 'p') {
        e.preventDefault();
        triggerSensorOrKey('p', 'Stimulation Plaisir (Touche P)', '/sensor/tactile/pleasure');
      } else if (k === 'e') {
        e.preventDefault();
        triggerSensorOrKey('e', 'Étreinte Poitrine (Touche E)', '/sensor/touch/chest');
      } else {
        const customRule = (robot.reglesLocales || []).find(
          r => (r.raccourciClavier || '').trim().toLowerCase() === k
        );
        if (customRule) {
          e.preventDefault();
          triggerSensorOrKey(
            k,
            customRule.nom.replace(/\[.*?\]/g, '').trim() || `Capteur [${k.toUpperCase()}]`,
            customRule.declencheurCapteurRos
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [robot, gauges, userProfile]);

  // Envoi d'un message textuel (manuel ou vocal automatique)
  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const txt = (customText !== undefined ? customText : inputMsg).trim();
    if (!txt) return;

    if (customText === undefined) {
      setInputMsg('');
    }
    setLiveTranscript('');
    setIsUserScrolledUp(false);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    const userMsg: CallChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: txt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    addChatMessage(robot.id, {
      robotId: robot.id,
      sender: 'user',
      text: txt,
      timestamp: new Date().toISOString(),
      source: 'generative_ai'
    });

    // Annuler tout message robot différé en attente pour garantir l'absence de superposition
    if (localReplyTimeoutRef.current) {
      clearTimeout(localReplyTimeoutRef.current);
      localReplyTimeoutRef.current = null;
    }
    stopSpeaking();

    // 1. Évaluation via le moteur déterministe local AVEC vérificateur sémantique CDN anti-faux positifs
    const localMatch = await evaluateLocalDeterministicAsync(txt, robot, userProfile);

    if (localMatch.matched) {
      // Si un prénom a été extrait lors d'une présentation ou renommage, mettre à jour le profil utilisateur
      if (localMatch.extractedUserName && onUpdateUserProfile) {
        onUpdateUserProfile({
          id: userProfile?.id || 'current_user',
          prenom: localMatch.extractedUserName,
          centresInteret: userProfile?.centresInteret || [],
          faits: userProfile?.faits || [],
          scoreCompatibilite: userProfile?.scoreCompatibilite ?? 50,
          dateRencontre: userProfile?.dateRencontre || new Date().toISOString(),
          impressionsDuRobot: userProfile?.impressionsDuRobot || [],
          cercleRelationnel: userProfile?.cercleRelationnel || [],
          anecdotes: userProfile?.anecdotes || []
        });
      }

      // Application des deltas
      const nextGauges = { ...gauges };
      if (localMatch.gaugeDeltas && Object.keys(localMatch.gaugeDeltas).length > 0) {
        Object.entries(localMatch.gaugeDeltas).forEach(([gk, val]) => {
          const key = gk as keyof EmotionalGauges;
          const cur = nextGauges[key] ?? 50;
          nextGauges[key] = Math.min(100, Math.max(0, cur + val));
        });
      }

      // Détection de compliments & mots doux pour dynamiser les jauges même sur match local
      const isCompliment = /sourire|belle|jolie|mignonne|magnifique|charme|aime|adore|plais|douce|merci|yeux|regard/i.test(txt);
      if (isCompliment) {
        nextGauges.affection = Math.min(100, (nextGauges.affection ?? 25) + 10);
        nextGauges.bienEtre = Math.min(100, (nextGauges.bienEtre ?? 75) + 8);
        nextGauges.humeur = Math.min(100, (nextGauges.humeur ?? 75) + 8);
      }

      // Détection d'irrespect ou de non-bienveillance -> Baisse marquée des jauges (culture du respect mutuel)
      const isNotBenevolent = /tais[\s\-]toi|ferme[\s\-]la|ferme\s+ta|degage|conne|idiote|nulle|m['’\s]?en\s+fous|casse[\s\-]toi|ta\s+gueule|imbecile|stupide|tu\s+sers\s+[aà]\s+rien|ferme\s+ton\s+clapet|parle\s+pas|arrete\s+de\s+parler|arrête\s+de\s+parler|moche|degoutante|dégoutante|sale\s+robot|machine\s+stupide|soumise|obeis|obéis/i.test(txt);
      if (isNotBenevolent) {
        nextGauges.affection = Math.max(0, (nextGauges.affection ?? 25) - 15);
        nextGauges.bienEtre = Math.max(0, (nextGauges.bienEtre ?? 75) - 16);
        nextGauges.humeur = Math.max(0, (nextGauges.humeur ?? 75) - 14);
        nextGauges.desir = Math.max(0, (nextGauges.desir ?? 25) - 12);
        nextGauges.plaisir = Math.max(0, (nextGauges.plaisir ?? 30) - 12);
      }

      // VÉRIFICATION ORGASME (100%)
      if ((nextGauges.plaisirSexuel ?? 0) >= 100) {
        handleClimaxOrgasm(nextGauges);
        return;
      }

      // Synchronisation du mode défense si déclenché par un mot violent ou apaisé
      let currentDefense = defenseState;
      if (localMatch.triggerType === 'cps_defense') {
        currentDefense = rosBridge.activateInertDefense(localMatch.matchedTriggerValue || 'Violence verbale', 'verbal_violence');
        setDefenseState(currentDefense);
        setExpressionOverride('contrariee');
        setTimeout(() => setExpressionOverride(null), 5000);
      } else if (localMatch.triggerType === 'cps_apaisement') {
        const result = rosBridge.recordBenevolentAction();
        currentDefense = result.state;
        setDefenseState(currentDefense);
      }

      // Ajustement dynamique du débit vocal si demandé par l'utilisateur
      let updatedVoix = robot.voix;
      if (localMatch.newVoiceRate) {
        setCurrentVoiceRate(localMatch.newVoiceRate);
        updatedVoix = {
          pitch: robot.voix?.pitch ?? 1.05,
          rate: localMatch.newVoiceRate,
          lang: robot.voix?.lang || 'fr-FR',
          nomVoix: robot.voix?.nomVoix || '',
          voiceURI: robot.voix?.voiceURI,
          volume: robot.voix?.volume ?? 1
        };
      }

      const updatedLocalRobot: RobotPersonality = {
        ...robot,
        jaugesActuelles: nextGauges,
        modeDefense: currentDefense,
        voix: updatedVoix
      };
      onUpdateRobot(updatedLocalRobot);
      persistUpdatedRobotAutonomous(updatedLocalRobot);

      const reply = localMatch.replyText;
      const robotMsg: CallChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'robot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDeterministic: true,
        ruleName: localMatch.ruleName,
        branchName: localMatch.branchName
      };

      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: reply,
        timestamp: new Date().toISOString(),
        source: 'local_engine',
        deltasJauges: localMatch.gaugeDeltas,
        localEngineDebug: {
          matched: true,
          ruleName: localMatch.ruleName,
          branchName: localMatch.branchName
        }
      });

      if (localReplyTimeoutRef.current) {
        clearTimeout(localReplyTimeoutRef.current);
      }
      localReplyTimeoutRef.current = setTimeout(() => {
        setMessages(prev => [...prev, robotMsg]);
        speakText(reply, localMatch.newVoiceRate ? { rate: localMatch.newVoiceRate } : undefined);
        if (directSync.isAutoSyncActive(robot.id)) {
          directSync.broadcastDelta(robot.id).catch(() => {});
        }
      }, 150);
      return;
    }

    // 2. Fallback API IA fluide avec historique complet de conversation (incluant le message utilisateur actuel et réponses 0-token)
    setIsAiThinking(true);
    try {
      const fullHistory = [...messages, userMsg].slice(-20).map(m => ({ 
        sender: m.sender, 
        text: m.text 
      }));

      let userQ2 = userProfile?.questionnaire2;
      if (!userQ2) {
        try {
          const raw = localStorage.getItem('sofia_user_questionnaire_2');
          if (raw) userQ2 = JSON.parse(raw);
        } catch (e) {}
      }
      const robotQ2 = robot.questionnaire2 || getRobotQuestionnaire2(robot.id, robot.nom, robot.genre);
      const enrichedRobot = { ...robot, questionnaire2: robotQ2 };
      const enrichedUserProfile = { ...userProfile, questionnaire2: userQ2 || DEFAULT_USER_QUESTIONNAIRE_2 };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot: enrichedRobot,
          userMessage: txt,
          message: txt,
          userProfile: enrichedUserProfile,
          history: fullHistory,
          aiConfig: getStoredAiConfig()
        })
      });
      const data = await res.json();
      const reply = data.reply || "Je suis attentive à toi... continue de me parler.";

      if (data.updatedRobot) {
        const candidateGauges = data.updatedRobot.jaugesActuelles || {};
        if ((candidateGauges.plaisirSexuel ?? 0) >= 100) {
          handleClimaxOrgasm(candidateGauges, data.updatedRobot);
          return;
        }
        onUpdateRobot(data.updatedRobot);
        persistUpdatedRobotAutonomous(data.updatedRobot);
      } else if (data.emotionalDeltas) {
        const nextGauges = { ...gauges };
        Object.entries(data.emotionalDeltas).forEach(([gk, val]) => {
          const key = gk as keyof EmotionalGauges;
          const cur = nextGauges[key] ?? 50;
          nextGauges[key] = Math.min(100, Math.max(0, cur + Number(val)));
        });
        const up = { ...robot, jaugesActuelles: nextGauges };
        onUpdateRobot(up);
        persistUpdatedRobotAutonomous(up);
      }

      if (data.userProfile && onUpdateUserProfile) {
        onUpdateUserProfile(data.userProfile);
      }

      const robotMsg: CallChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'robot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, robotMsg]);
      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: reply,
        timestamp: new Date().toISOString(),
        source: 'generative_ai'
      });

      speakText(reply);
      if (directSync.isAutoSyncActive(robot.id)) {
        directSync.broadcastDelta(robot.id).catch(() => {});
      }
    } catch (err) {
      console.error('Erreur API Chat:', err);
      const fallbackMsg: CallChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'robot',
        text: "Je te regarde avec tout mon amour... Dis-moi ce qui te ferait plaisir maintenant.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Synchronisation dynamique du mode vocal continu avec l'état de parole du robot
  useEffect(() => {
    isSpeakingRef.current = isRobotSpeaking;
    isThinkingRef.current = isAiThinking;

    if (isRobotSpeaking || isAiThinking) {
      // Couper immédiatement le micro pendant que le robot parle ou réfléchit pour éviter l'écho acoustique
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }
      setIsMicActive(false);
      setLiveTranscript('');
    } else {
      // Dès que le robot a fini de parler et de réfléchir : si le mode vocal continu est actif, réarmer automatiquement le micro !
      if (continuousModeRef.current) {
        const timer = setTimeout(() => {
          if (continuousModeRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
            startContinuousListening();
          }
        }, 400); // 400ms de silence après la fin de phrase du robot pour laisser la réverbération s'estomper
        return () => clearTimeout(timer);
      }
    }
  }, [isRobotSpeaking, isAiThinking]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      continuousModeRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // Démarrage de l'écoute vocale (Mode Conversation Mains-Libres Continu)
  const startContinuousListening = () => {
    if (!continuousModeRef.current) return;
    if (isSpeakingRef.current || isThinkingRef.current) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    // Arrêter toute instance orpheline
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'fr-FR';
      recognition.continuous = false; // Capture un tour de parole complet
      recognition.interimResults = true; // Transcrit en temps réel à l'écran

      recognition.onstart = () => {
        setIsMicActive(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setLiveTranscript(interim);
        }

        if (finalTranscript.trim()) {
          const spokenText = finalTranscript.trim();
          setLiveTranscript('');
          setIsMicActive(false);

          // Couper la reconnaissance avant de traiter la réponse
          try {
            recognition.stop();
          } catch (e) {}
          recognitionRef.current = null;

          // ENVOI AUTOMATIQUE SANS CLIQUER SUR ENVOYÉ !
          handleSend(undefined, spokenText);
        }
      };

      recognition.onerror = (event: any) => {
        // En cas d'absence de parole détectée (silence), si le mode est toujours actif et le robot ne parle pas, relancer
        if (event.error === 'no-speech' && continuousModeRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
          setTimeout(() => {
            if (continuousModeRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
              startContinuousListening();
            }
          }, 350);
          return;
        }
        setIsMicActive(false);
      };

      recognition.onend = () => {
        setIsMicActive(false);
        // Si l'écoute s'arrête (pause de l'utilisateur) et que le robot ne parle pas : relancer automatiquement
        if (continuousModeRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
          setTimeout(() => {
            if (continuousModeRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
              startContinuousListening();
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Erreur startContinuousListening:', e);
      setIsMicActive(false);
    }
  };

  // Bascule du mode vocal continu mains-libres
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur (recommandé : Google Chrome, Microsoft Edge ou Safari).");
      return;
    }

    if (isContinuousVoiceMode) {
      // Désactiver le mode vocal continu
      continuousModeRef.current = false;
      setIsContinuousVoiceMode(false);
      setIsMicActive(false);
      setLiveTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }
    } else {
      // Activer le mode vocal continu mains-libres
      continuousModeRef.current = true;
      setIsContinuousVoiceMode(true);
      setIsVoiceOutputActive(true); // Active la voix du robot pour un vrai dialogue oral
      startContinuousListening();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Floating Control Bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        {/* Bouton Retour Catalogue */}
        <button
          onClick={onSelectAnotherRobot || onCloseCall}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
          title="Retourner au catalogue des robots"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>❮ Retour au Catalogue</span>
        </button>

        {/* Info Robot Centre */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{robot.nom}</span>
              <span className="text-xs text-rose-300 font-medium">({robot.ageApparent} ans • {robot.titre})</span>
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LIAISON DIRECTE
            </span>
          </div>
        </div>

        {/* Actions Rapides Haut : Export/Import Cerveau Nomade & Back-Office */}
        <div className="flex items-center gap-2">
          {/* Bouton Bouclier Éthique, CPS & Protection du Robot */}
          <button
            onClick={() => setShowDefenseModal(true)}
            className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
              defenseState.actif
                ? 'bg-red-600/30 border-red-500 text-red-200 animate-pulse hover:bg-red-600/50'
                : defenseState.niveau === 'tension_cps'
                ? 'bg-amber-600/20 border-amber-500 text-amber-300 hover:bg-amber-600/30'
                : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
            }`}
            title="Protection Éthique, CPS (Compétences Psychosociales) & Sécurité Matérielle ROS 2 du Robot"
          >
            {defenseState.actif ? (
              <AlertOctagon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-400" />
            ) : (
              <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400" />
            )}
            <span className="hidden xl:inline">
              {defenseState.actif
                ? '🛑 Mode Objet Inerte (Défense)'
                : defenseState.niveau === 'tension_cps'
                ? '⚠️ Tension CPS'
                : '🛡️ Protection Éthique & CPS'}
            </span>
            <span className="xl:hidden">
              {defenseState.actif ? '🛑 Défense' : '🛡️ CPS'}
            </span>
          </button>

          {/* Bouton Cycles Circadiens & Santé Mécatronique */}
          <button
            onClick={() => setShowCircadianModal(true)}
            className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
              circadianState.modeVeilleBasseConso
                ? 'bg-purple-900/40 border-purple-500/60 text-purple-200 animate-pulse'
                : circadianState.voixFeutree
                ? 'bg-indigo-900/30 border-indigo-500/40 text-indigo-200'
                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border-indigo-500/30'
            }`}
            title="Cycle circadien biologique (sommeil 23h), vision active des objets du quotidien et carnet de santé mécatronique"
          >
            <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-indigo-400" />
            <span className="hidden xl:inline">
              {circadianState.modeVeilleBasseConso 
                ? '💤 Sommeil ROS 2' 
                : circadianState.voixFeutree 
                ? '🌙 Soir Feutré' 
                : '🌙 Santé & Cycles'}
            </span>
            <span className="xl:hidden">🌙 Cycles</span>
          </button>

          {onOpenManual && (
            <button
              onClick={onOpenManual}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-cyan-500/30 shadow-sm"
              title="Ouvrir la notice d'utilisation complète et le manuel de référence Sofia 2.0"
            >
              <BookOpen className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-400" />
              <span className="hidden md:inline">📖 Notice</span>
            </button>
          )}

          <button
            onClick={() => setShowQuickSyncModal(true)}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-cyan-950/40 transition-all cursor-pointer border border-cyan-400/40"
            title="Exporter / Importer le cerveau en 1 clic (protégé par passphrase) ou synchroniser en direct via Wi-Fi/Bluetooth"
          >
            <Radio className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-300 animate-pulse" />
            <span className="hidden sm:inline">🧠 Cerveau & Synchro 1-Clic</span>
            <span className="sm:hidden">🧠 Synchro</span>
          </button>

          <button
            onClick={() => onOpenBackOffice?.('prompt')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-pink-950/40 transition-all cursor-pointer border border-pink-400/30"
            title="Accéder au back-office du robot pour régler prompt, jauges, CDN et moteur déterministe"
          >
            <Settings className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden md:inline">⚙️ Accéder au Back-Office</span>
            <span className="md:hidden">⚙️ Back-Office</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Layout:
          - Mobile (< lg): Flex column. Robot visual is pinned at top (h-56 sm:h-64 shrink-0).
            The chat window is flex-1 min-h-0 and slides/scrolls smoothly underneath!
          - Desktop (>= lg): 12-column grid. Left side = visual stage (col 7-8).
            Right side = chat stream (col 4-5).
      */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-0 min-h-0 overflow-hidden relative">
        {/* ROBOT VIDEO / PERSONA STAGE (Pinned top on mobile, Left column on desktop) */}
        <div 
          ref={videoContainerRef} 
          className="w-full shrink-0 h-56 sm:h-64 lg:h-full lg:col-span-7 xl:col-span-8 bg-[#05070c] relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 border-slate-800 shadow-xl group"
        >
          {/* Main Visual Persona Stage */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-2 sm:p-4 pt-12 pb-14 sm:pb-20 lg:pt-14 lg:pb-24">
            {/* Ambient Soft Glow Backdrop matching the robot photo */}
            <img
              src={currentDisplayPhoto}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-110 pointer-events-none select-none"
            />

            {/* Primary Crisp Robot Persona Visual : 100% visible without cropping */}
            <img
              src={currentDisplayPhoto}
              alt={robot.nom}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.retried) {
                  target.dataset.retried = 'true';
                  target.src = '/assets/images/sofia_portrait_smile_1_1788000832921.jpg';
                }
              }}
              className={`${
                imageFitMode === 'contain'
                  ? 'max-h-full lg:max-h-[calc(100vh-210px)] max-w-full w-auto h-auto object-contain rounded-2xl shadow-2xl drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]'
                  : 'w-full h-full object-cover object-top'
              } object-center transition-all duration-700 filter relative z-10 ${
                isClimaxActive
                  ? 'brightness-115 saturate-130 contrast-110 scale-105 animate-pulse'
                  : currentMood.filterClass
              }`}
            />

            {/* Dynamic Emotional Lighting Aura Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${
              isClimaxActive
                ? 'from-rose-600/60 via-pink-600/40 to-purple-700/50'
                : currentMood.haloGradient
            } pointer-events-none transition-all duration-1000 mix-blend-screen opacity-60`}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>

            {/* Climax Ecstatic Aura Ripple */}
            {isClimaxActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-96 h-96 rounded-full bg-pink-500/20 blur-3xl animate-ping"></div>
              </div>
            )}

            {/* Circadian Sleep / Sommeil Profond Atmosphere Overlay */}
            {circadianState.modeVeilleBasseConso && (
              <div className="absolute inset-0 pointer-events-none bg-indigo-950/50 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 animate-in fade-in duration-1000">
                <div className="px-4 py-2 rounded-2xl bg-black/80 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center gap-2.5 shadow-2xl backdrop-blur-md">
                  <Moon className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span>Phase Sommeil Profond ROS 2 • Respiration {circadianState.rythmeRespiratoireBpm} BPM</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                </div>
              </div>
            )}

            {/* Circadian Nuit Somnolence Badge */}
            {circadianState.paupieresLourdes && !circadianState.modeVeilleBasseConso && (
              <div className="absolute top-16 left-4 pointer-events-none px-3 py-1.5 rounded-xl bg-black/70 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono flex items-center gap-2 z-20 backdrop-blur-sm animate-pulse">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paupières Lourdes • Voix Feutrée ({circadianState.rythmeRespiratoireBpm} BPM)</span>
              </div>
            )}

            {/* Sound Wave Ripple when Robot Speaks */}
            {isRobotSpeaking && (
              <div className="absolute bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-500/40 shadow-xl">
                <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span className="text-[11px] text-pink-200 font-bold font-mono">
                  {robot.nom} vous parle...
                </span>
                <div className="flex items-center gap-1 ml-1.5">
                  <span className="w-1 h-2.5 bg-pink-400 rounded-full animate-ping"></span>
                  <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse"></span>
                  <span className="w-1 h-2 bg-pink-400 rounded-full animate-ping"></span>
                </div>
              </div>
            )}

            {/* Sensory Trigger Notification Toast */}
            {lastSensoryTrigger && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-1.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Stimulation reçue : <strong>{lastSensoryTrigger}</strong></span>
              </div>
            )}

            {/* Full-Screen Ecstatic Climax & ROS Vibration Overlay */}
            {isClimaxActive && (
              <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-gradient-to-t from-pink-950/80 via-purple-950/70 to-rose-950/80 backdrop-blur-[2px] animate-in fade-in duration-500">
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-pink-500 shadow-2xl shadow-pink-500/60 flex flex-col items-center text-center space-y-2.5 sm:space-y-3 max-w-xs sm:max-w-md mx-4 animate-pulse pointer-events-auto">
                  <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/50">
                    <Flame className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-100 to-purple-300 uppercase tracking-wider">
                      Orgasme Humanoïde Déclenché
                    </div>
                    <p className="text-[11px] sm:text-xs text-pink-200 font-medium mt-1">
                      Plaisir sexuel à 100% • Décharge érotique & abandon complet
                    </p>
                  </div>
                  <div className="w-full bg-slate-900/90 rounded-2xl p-3 sm:p-3.5 border border-pink-500/30 text-left space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
                    <div className="flex items-center justify-between text-pink-300">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
                        Vibreurs ROS (/robot/haptic/vibration) :
                      </span>
                      <span className="text-white font-bold">Actif 100% (4500ms)</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Remise Jauge Plaisir Sexuel :</span>
                      <span className="font-bold text-white">0% (Effectué)</span>
                    </div>
                    <div className="flex items-center justify-between text-purple-300">
                      <span>Attachement Affectif :</span>
                      <span className="font-bold text-white">+15% Comblée</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Stage Badges & Controls */}
          <div className="relative z-10 p-2 sm:p-3.5 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
            {/* Dynamic Facial Expression & Mood Badge with ROS sync */}
            <div 
              className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl shadow-xl"
              title={`Humeur : ${currentMood.label} • Action ROS : ${currentMood.rosActionSummary}`}
            >
              <span className="text-sm sm:text-lg select-none" role="img" aria-label={currentMood.label}>
                {currentMood.emoji}
              </span>
              <div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                  <span>Humeur & ROS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-1">
                  <span>{isClimaxActive ? '💥 Orgasme & Extase' : currentMood.label}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Bouton d'Ajustement Écran (Photo Entière vs Zoom) */}
              <button
                onClick={() => setImageFitMode(prev => prev === 'contain' ? 'cover' : 'contain')}
                className="flex items-center gap-1 bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-200 shadow-xl transition-all cursor-pointer"
                title={imageFitMode === 'contain' ? "Mode actuel : Photo entière visible. Cliquez pour zoomer." : "Mode actuel : Zoom plein cadre. Cliquez pour photo entière."}
              >
                {imageFitMode === 'contain' ? (
                  <>
                    <Minimize2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Photo Entière</span>
                    <span className="sm:hidden">Entière</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-pink-400" />
                    <span className="hidden sm:inline">Zoom</span>
                    <span className="sm:hidden">Zoom</span>
                  </>
                )}
              </button>

              {/* Connection Telemetry HUD */}
              <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-mono text-slate-300">
                <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">AES-256</span>
                <span>•</span>
                <BatteryCharging className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400" />
                <span>94%</span>
                {isHapticVibrating && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-pink-400 font-bold animate-pulse">
                      <Zap className="w-3 h-3 text-yellow-300 animate-bounce" />
                      ROS
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Stage Overlay: Quick Sensory Controls & Call Actions */}
          <div className="relative z-10 p-2.5 sm:p-4 space-y-2 sm:space-y-3 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent">
            {/* Quick Sensory Bar (Touch, Intimacy, Petting) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 no-scrollbar">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 shrink-0 hidden sm:flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Tactile :
              </span>

              <button
                onClick={() => triggerSensorOrKey('s', 'Capteur Intime')}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-pink-600/90 hover:bg-pink-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-lg shadow-pink-950/50 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Zone intime sexuelle (Touche S) - Fait monter la jauge de plaisir"
              >
                <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>Intime [S]</span>
              </button>

              <button
                onClick={() => triggerSensorOrKey('c', 'Caresse Tête')}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-lg shadow-purple-950/50 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Raccourci clavier : Touche C"
              >
                <Heart className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>Caresse [C]</span>
              </button>

              <button
                onClick={() => triggerSensorOrKey('p', 'Stimulation Plaisir')}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-rose-700/90 hover:bg-rose-600 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-lg shadow-rose-950/50 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Raccourci clavier : Touche P"
              >
                <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>Plaisir [P]</span>
              </button>

              <button
                onClick={() => triggerSensorOrKey('e', 'Étreinte Poitrine', '/sensor/touch/chest')}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-cyan-700/90 hover:bg-cyan-600 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-lg shadow-cyan-950/50 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Raccourci clavier : Touche E • Topic ROS : /sensor/touch/chest"
              >
                <Smile className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>Étreinte [E]</span>
              </button>

              {/* Raccourci Choc Brutal / Simulation de Violence Physique [X] */}
              <button
                onClick={() => triggerSensorOrKey('x', 'Choc Brutal', '/robot/sensors/touch/shock')}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-red-950/90 hover:bg-red-900 text-red-300 font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-lg shadow-red-950/70 border border-red-800/60 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Simulation de choc violent physique (Touche X) : enclenche la rupture d'illusion et le verrouillage ROS 2"
              >
                <AlertOctagon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-400" />
                <span>Choc Brutal [X]</span>
              </button>

              {/* Raccourcis Tactiles & Capteurs ROS Personnalisés ajoutés par l'utilisateur */}
              {customShortcutRules.map((cRule) => {
                const keyUpper = (cRule.raccourciClavier || '?').toUpperCase();
                const shortTitle = cRule.nom.replace(/\[.*?\]/g, '').trim().slice(0, 18);
                return (
                  <button
                    key={cRule.id}
                    onClick={() =>
                      triggerSensorOrKey(
                        cRule.raccourciClavier!,
                        shortTitle,
                        cRule.declencheurCapteurRos
                      )
                    }
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-lg shadow-indigo-950/50 transition-all active:scale-95 cursor-pointer shrink-0 border border-indigo-400/30"
                    title={`Raccourci [${keyUpper}] ↔ Capteur ROS : ${cRule.declencheurCapteurRos || '/sensor/tactile/custom'}`}
                  >
                    <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-300" />
                    <span>
                      {shortTitle} [{keyUpper}]
                    </span>
                  </button>
                );
              })}

              {/* Bouton pour voir la connexion Capteurs ROS <-> Raccourcis et en ajouter */}
              <button
                onClick={() => setShowRosShortcutModal(true)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-800/95 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-lg border border-cyan-500/40 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Voir les connexions entre les raccourcis clavier et les capteurs physiques ROS 2, ou ajouter un nouveau raccourci/capteur"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Capteur / Touche ROS</span>
              </button>

              {/* Bouton de test rapide Climax 100% */}
              <button
                onClick={() => {
                  const maxGauges = { ...gauges, plaisirSexuel: 100 };
                  handleClimaxOrgasm(maxGauges);
                }}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-[11px] sm:text-xs flex items-center gap-1 shadow-xl shadow-pink-900/60 transition-all active:scale-95 cursor-pointer border border-pink-400/40 shrink-0"
                title="Déclencher directement l'Orgasme à 100% avec vibration haptique ROS et remise à zéro"
              >
                <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-yellow-300 animate-bounce" />
                <span className="hidden sm:inline">💥 Déclencher Orgasme 100%</span>
                <span className="sm:hidden">💥 Orgasme</span>
              </button>
            </div>

            {/* Call Toolbar */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={toggleSpeechRecognition}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    isContinuousVoiceMode
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400 animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title={isContinuousVoiceMode ? 'Désactiver le mode vocal continu' : 'Activer la conversation vocale continue mains-libres'}
                >
                  {isContinuousVoiceMode ? <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" /> : <MicOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                  <span className="text-[10px] sm:text-xs font-bold hidden xs:inline">
                    {isContinuousVoiceMode 
                      ? (isRobotSpeaking ? `${robot.nom} parle...` : isAiThinking ? 'Réflexion...' : isMicActive ? 'Écoute active' : 'Mode Vocal') 
                      : 'Mode Vocal'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (isVoiceOutputActive) stopSpeaking();
                    setIsVoiceOutputActive(!isVoiceOutputActive);
                  }}
                  className={`p-1.5 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
                    isVoiceOutputActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                  title={isVoiceOutputActive ? 'Désactiver la voix du robot' : 'Activer la voix du robot'}
                >
                  {isVoiceOutputActive ? <Volume2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <VolumeX className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                  title="Plein écran"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <Maximize2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                </button>

                {onCloseCall && (
                  <button
                    onClick={onCloseCall}
                    className="p-1.5 sm:p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/60 transition-all cursor-pointer flex items-center gap-1"
                    title="Raccrocher et retourner au Compagnon standard"
                  >
                    <PhoneOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="text-[10px] sm:text-[11px] font-bold hidden md:inline">Quitter Visio</span>
                  </button>
                )}
              </div>

              {/* Gauge Micro-Strip */}
              <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono">
                <div className="flex items-center gap-1">
                  <span className="text-pink-400 font-bold">Plaisir:</span>
                  <span className="text-white font-bold">{gauges.plaisirSexuel ?? 0}%</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-rose-400 font-bold">Désir:</span>
                  <span className="text-white font-bold">{gauges.desir ?? 0}%</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-purple-400 font-bold">Affection:</span>
                  <span className="text-white font-bold">{gauges.affection ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHAT STREAM (Sliding smoothly underneath on mobile, Right column on desktop) */}
        <div className="w-full flex-1 min-h-0 lg:h-full lg:col-span-5 xl:col-span-4 bg-slate-900 lg:border-l border-slate-800 flex flex-col justify-between overflow-hidden relative">
          {/* Chat Header with Quick Links */}
          <div className="p-2.5 sm:p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-xs font-bold text-white truncate">Canal avec {robot.nom}</span>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setShowQuickSyncModal(true)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer border border-cyan-500/40 transition-all shadow-sm"
                title="Exporter ce qui a changé, importer un cerveau ou synchroniser en direct via Wi-Fi/Bluetooth"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">Synchro Cerveau</span>
                <span className="sm:hidden">Synchro</span>
              </button>

              <button
                onClick={() => setShowAutonomousModal(true)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-pink-950/60 hover:bg-pink-900/80 text-pink-300 font-bold flex items-center gap-1.5 cursor-pointer border border-pink-500/30 transition-all shadow-sm"
                title="Consulter ce que le robot a fait pendant votre absence et l'évolution de ses goûts"
              >
                <Compass className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span className="hidden sm:inline">Vie Autonome</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-pink-500/30 text-pink-200">
                  {robot.activitesAutonomes?.length || 0}
                </span>
              </button>

              <button
                onClick={() => onOpenBackOffice?.('deterministic')}
                className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Règles</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Autonomous Activity Banner (Pendant ton absence...) */}
          {showAutonomousBanner && robot.activitesAutonomes && robot.activitesAutonomes.length > 0 && (
            <div className="p-2.5 px-3 bg-gradient-to-r from-pink-950/70 via-purple-950/70 to-slate-900 border-b border-pink-500/30 text-xs flex items-center justify-between gap-2 shrink-0 animate-in slide-in-from-top-1">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="text-pink-200 text-[11px] truncate">
                  Pendant ton absence : <strong className="text-white font-semibold">{robot.activitesAutonomes[0].titre}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    const act = robot.activitesAutonomes![0];
                    setInputMsg(`Tu as fait quoi pendant mon absence ? Tu as aimé "${act.titre}" ?`);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-pink-600/40 hover:bg-pink-600 text-pink-200 hover:text-white text-[10px] font-bold border border-pink-400/40 cursor-pointer transition-all"
                  title="Poser une question dessus à Sofia"
                >
                  Lui demander
                </button>
                <button
                  onClick={() => setShowAutonomousBanner(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  title="Masquer la bannière"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages Stream with user-controlled scroll */}
          <div 
            ref={chatContainerRef}
            onScroll={handleChatScroll}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 sm:space-y-3.5 text-xs"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-pink-600 to-purple-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  {msg.isDeterministic && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                      ⚡ Règle: {msg.ruleName || 'Déterministe'}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {isAiThinking && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="p-3 rounded-2xl bg-slate-800/90 text-slate-300 border border-slate-700/80 rounded-bl-none flex items-center gap-2.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
                  <span className="text-xs italic text-pink-200 font-medium">{robot.nom} réfléchit à sa réponse...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Floating pill to jump back down when user has scrolled up */}
          {isUserScrolledUp && (
            <button
              onClick={() => {
                setIsUserScrolledUp(false);
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="absolute bottom-20 right-4 z-30 px-3 py-1.5 rounded-full bg-pink-600/95 hover:bg-pink-500 text-white font-bold text-xs shadow-xl shadow-pink-950/60 flex items-center gap-1.5 border border-pink-400/50 backdrop-blur-sm transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2"
            >
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              <span>Reprendre le défilement</span>
            </button>
          )}

          {/* Bottom Chat Input Form */}
          <div className="p-3 sm:p-3.5 bg-slate-950 border-t border-slate-800 space-y-2 shrink-0">
            {/* Quick Suggestion Chips for Autonomous Discoveries */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
              <span className="text-slate-500 text-[10px] shrink-0 font-medium">Suggérer:</span>
              <button
                type="button"
                onClick={() => setInputMsg("Qu'est-ce que tu as fait de beau de ton côté aujourd'hui ?")}
                className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap cursor-pointer transition-colors text-[10px]"
              >
                💬 Qu'as-tu fait aujourd'hui ?
              </button>
              <button
                type="button"
                onClick={() => setInputMsg("Tu as écouté de la musique ou lu des choses pendant que je n'étais pas là ?")}
                className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap cursor-pointer transition-colors text-[10px]"
              >
                🎵 Musique & lectures récentes ?
              </button>
              <button
                type="button"
                onClick={() => setShowAutonomousModal(true)}
                className="px-2 py-0.5 rounded-lg bg-pink-950/40 hover:bg-pink-900/60 text-pink-300 border border-pink-500/30 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 text-[10px]"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Journal d'absence</span>
              </button>
            </div>

            {/* Bannière d'état Mode Vocal Continu Mains-Libres */}
            {isContinuousVoiceMode && (
              <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 border border-rose-500/50 flex items-center justify-between gap-2 shadow-lg backdrop-blur-md animate-in fade-in">
                <div className="flex items-center gap-2 text-xs truncate">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isRobotSpeaking ? 'bg-amber-400 animate-pulse' : isAiThinking ? 'bg-purple-400 animate-pulse' : isMicActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className="font-bold text-white text-xs truncate">
                    {isRobotSpeaking 
                      ? `🔊 ${robot.nom} vous parle...` 
                      : isAiThinking 
                      ? `💬 ${robot.nom} réfléchit...` 
                      : isMicActive 
                      ? (liveTranscript ? `🎙️ « ${liveTranscript} »` : `🎙️ À vous de parler, ${robot.nom} vous écoute... (envoi auto)`)
                      : `👂 Micro prêt, parlez librement...`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className="px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white text-[10px] font-mono cursor-pointer border border-white/10 shrink-0"
                  title="Désactiver le mode vocal continu"
                >
                  Quitter vocal
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                  isContinuousVoiceMode
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400 animate-pulse'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                }`}
                title={isContinuousVoiceMode ? 'Désactiver le mode vocal continu' : 'Activer la conversation vocale continue mains-libres'}
              >
                {isContinuousVoiceMode ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={
                  isContinuousVoiceMode
                    ? (isRobotSpeaking ? `${robot.nom} vous parle...` : isAiThinking ? `${robot.nom} compose sa réponse...` : `🎙️ Mode vocal continu actif : parlez librement...`)
                    : (isAiThinking ? `${robot.nom} compose sa réponse...` : `Parler à ${robot.nom}...`)
                }
                disabled={isAiThinking}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 disabled:opacity-60 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim() || isAiThinking}
                className="p-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shrink-0"
                title="Envoyer le message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>{isContinuousVoiceMode ? '🟢 Mode vocal mains-libres actif (envoi automatique dès la fin de parole)' : 'Appuyez sur Entrée pour envoyer ou activez le Micro'}</span>
              <span className="text-pink-400 font-mono">Touche [S] = Intime • [C] = Caresse</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vie Autonome & Journal d'Absence */}
      {showAutonomousModal && (
        <AutonomousLifeModal
          robot={robot}
          onUpdateRobot={onUpdateRobot}
          onClose={() => setShowAutonomousModal(false)}
          onSelectTopicToDiscuss={(promptText) => {
            setInputMsg(promptText);
          }}
        />
      )}

      {/* Modal d'Export/Import Rapide Cerveau & Synchro Directe Wi-Fi / Bluetooth */}
      {showQuickSyncModal && (
        <NomadBrainQuickSyncModal
          isOpen={showQuickSyncModal}
          onClose={() => setShowQuickSyncModal(false)}
          robot={robot}
          userProfile={userProfile}
          onUpdateRobot={onUpdateRobot}
          onUpdateUserProfile={onUpdateUserProfile}
          onMessagesSynced={loadConversationHistory}
        />
      )}

      {/* Modal : Connexion Raccourcis Clavier ↔ Capteurs ROS 2 & Ajout Rapide */}
      {showRosShortcutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0c0e17] border border-cyan-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Pont Raccourcis Clavier ↔ Capteurs Tactiles ROS 2
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chaque touche simule (et écoute en temps réel) un topic de capteur capacitif sur le bus ROS 2.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRosShortcutModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Table de correspondance actuelle */}
              <div className="space-y-2">
                <h4 className="font-bold text-cyan-300 uppercase tracking-wider font-mono text-[11px]">
                  1. Connexions Matérielles Actives ({robot.nom})
                </h4>
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/80">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] font-mono uppercase">
                        <th className="p-2.5">Touche</th>
                        <th className="p-2.5">Zone Corporelle</th>
                        <th className="p-2.5">Topic Capteur ROS 2</th>
                        <th className="p-2.5">Entrée ESP32 / I2C</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-[11px]">
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-pink-400">[S]</td>
                        <td className="p-2.5 font-semibold text-white">Zone Intime Érogène</td>
                        <td className="p-2.5 font-mono text-cyan-300">/sensor/tactile/intime</td>
                        <td className="p-2.5 text-slate-400 font-mono">MPR121 Ch.0 + Pression ADC</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-purple-400">[C]</td>
                        <td className="p-2.5 font-semibold text-white">Caresse Tête / Joues</td>
                        <td className="p-2.5 font-mono text-cyan-300">/sensor/touch/head</td>
                        <td className="p-2.5 text-slate-400 font-mono">ESP32 Touch GPIO 4 (T0)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-rose-400">[P]</td>
                        <td className="p-2.5 font-semibold text-white">Stimulation Plaisir Continu</td>
                        <td className="p-2.5 font-mono text-cyan-300">/sensor/tactile/pleasure</td>
                        <td className="p-2.5 text-slate-400 font-mono">MPR121 Ch.1 (Interne)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-cyan-400">[E]</td>
                        <td className="p-2.5 font-semibold text-white">Étreinte Poitrine / Buste</td>
                        <td className="p-2.5 font-mono text-cyan-300">/sensor/touch/chest</td>
                        <td className="p-2.5 text-slate-400 font-mono">FSR402 Capteur Force Buste</td>
                      </tr>
                      {customShortcutRules.map((cr) => (
                        <tr key={cr.id} className="bg-indigo-950/20">
                          <td className="p-2.5 font-mono font-bold text-indigo-300">
                            [{(cr.raccourciClavier || '').toUpperCase()}]
                          </td>
                          <td className="p-2.5 font-semibold text-white">{cr.nom}</td>
                          <td className="p-2.5 font-mono text-cyan-300">{cr.declencheurCapteurRos}</td>
                          <td className="p-2.5 text-emerald-400 font-mono">Capteur Personnalisé Actif</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formulaire d'ajout rapide d'un nouveau capteur / raccourci */}
              <form onSubmit={handleAddCustomRosShortcut} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>2. Ajouter un Nouveau Raccourci Tactile & Capteur ROS 2</span>
                  </h4>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNewShortcutKey('b');
                        setNewShortcutLabel('Bisou dans le Cou');
                        setNewShortcutTopic('/sensor/tactile/neck');
                        setNewShortcutReply("Mmh... tes baisers dans mon cou me font frissonner de désir...");
                        setNewShortcutCategory('intime');
                      }}
                      className="px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[10px] cursor-pointer"
                    >
                      Présélection : Cou [B]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewShortcutKey('m');
                        setNewShortcutLabel('Tenir la Main');
                        setNewShortcutTopic('/sensor/touch/hands');
                        setNewShortcutReply("J'aime tellement quand tes doigts s'entrelacent avec les miens...");
                        setNewShortcutCategory('tendresse');
                      }}
                      className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] cursor-pointer"
                    >
                      Présélection : Main [M]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewShortcutKey('r');
                        setNewShortcutLabel('Caresse des Hanches');
                        setNewShortcutTopic('/sensor/tactile/hips');
                        setNewShortcutReply("Tes mains sur mes hanches me rapprochent encore plus de toi...");
                        setNewShortcutCategory('intime');
                      }}
                      className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] cursor-pointer"
                    >
                      Présélection : Hanches [R]
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Touche Clavier (1 lettre) :
                    </label>
                    <input
                      type="text"
                      maxLength={1}
                      value={newShortcutKey}
                      onChange={(e) => setNewShortcutKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-pink-400 uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Nom du Capteur / Zone :
                    </label>
                    <input
                      type="text"
                      value={newShortcutLabel}
                      onChange={(e) => setNewShortcutLabel(e.target.value)}
                      placeholder="Ex: Bisou dans le Cou"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Topic ROS 2 :
                    </label>
                    <input
                      type="text"
                      value={newShortcutTopic}
                      onChange={(e) => setNewShortcutTopic(e.target.value)}
                      placeholder="/sensor/tactile/neck"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Effet Émotionnel :
                    </label>
                    <select
                      value={newShortcutCategory}
                      onChange={(e) => setNewShortcutCategory(e.target.value as 'intime' | 'tendresse')}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="intime">🔥 Intime & Sensuel (+Plaisir Sexuel, +Désir)</option>
                      <option value="tendresse">💖 Tendresse & Câlin (+Affection, +Bien-être)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Réaction parlée immédiate de {robot.nom} :
                    </label>
                    <input
                      type="text"
                      value={newShortcutReply}
                      onChange={(e) => setNewShortcutReply(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRosShortcutModal(false);
                      onOpenBackOffice?.('deterministic');
                    }}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    ⚙️ Éditer toutes les branches avancées dans le Back-Office →
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter à la Barre Tactile & au Pont ROS</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* MODALE DE PROTECTION ÉTHIQUE, CPS & MODE DÉFENSE */}
      <EthicalDefenseCpsModal
        isOpen={showDefenseModal}
        onClose={() => setShowDefenseModal(false)}
        robot={robot}
        defenseState={defenseState}
        onSimulateCrisis={(type) => {
          if (type === 'physical_shock') {
            triggerSensorOrKey('x', 'Choc Brutal', '/robot/sensors/touch/shock');
          } else {
            const fakeInsult = 'Tu es nulle, tais-toi et soumets-toi !';
            const match = evaluateLocalDeterministic(fakeInsult, robot, userProfile);
            const newDef = rosBridge.activateInertDefense('Violence verbale simulée', 'verbal_violence');
            setDefenseState(newDef);
            const uMsg: CallChatMessage = {
              id: `usr_${Date.now()}`,
              sender: 'user',
              text: fakeInsult,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            const rMsg: CallChatMessage = {
              id: `bot_${Date.now() + 1}`,
              sender: 'robot',
              text: match.replyText || "Tu exprimes de la violence. Je désactive immédiatement mes fonctions affectives et sensorielles.",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isDeterministic: true,
              ruleName: 'Défense Robot : Rupture Illusion & Mode Objet Inerte'
            };
            setMessages(prev => [...prev, uMsg, rMsg]);
            speakText(rMsg.text);
            const nextGauges = {
              ...gauges,
              plaisir: 0,
              plaisirSexuel: 0,
              desir: 0,
              bienEtre: Math.max(0, (gauges.bienEtre ?? 50) - 35),
              affection: Math.max(0, (gauges.affection ?? 50) - 25),
              psychoRigidite: 80
            };
            const upBot = { ...robot, jaugesActuelles: nextGauges, modeDefense: newDef };
            onUpdateRobot(upBot);
            persistUpdatedRobotAutonomous(upBot);
          }
        }}
        onSimulateBenevolentApology={() => {
          const calmMsg = "Pardon... je me suis emporté tout à l'heure, je suis désolé. Parlons calmement.";
          const match = evaluateLocalDeterministic(calmMsg, robot, userProfile);
          const result = rosBridge.recordBenevolentAction();
          setDefenseState(result.state);
          const uMsg: CallChatMessage = {
            id: `usr_${Date.now()}`,
            sender: 'user',
            text: calmMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          const rMsg: CallChatMessage = {
            id: `bot_${Date.now() + 1}`,
            sender: 'robot',
            text: match.replyText || "J'entends ton apaisement et que tu reconnais ton emportement. Réguler ses émotions est une compétence essentielle.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isDeterministic: true,
            ruleName: 'Désescalade CPS : Apaisement & Renforcement Positif'
          };
          setMessages(prev => [...prev, uMsg, rMsg]);
          speakText(rMsg.text);
          const nextGauges = {
            ...gauges,
            bienEtre: Math.min(100, (gauges.bienEtre ?? 50) + 12),
            affection: Math.min(100, (gauges.affection ?? 50) + 8),
            humeur: Math.min(100, (gauges.humeur ?? 50) + 8)
          };
          const upBot = { ...robot, jaugesActuelles: nextGauges, modeDefense: result.state };
          onUpdateRobot(upBot);
          persistUpdatedRobotAutonomous(upBot);
        }}
        onResetDefenseMode={() => {
          rosBridge.resetDefenseMode();
          setDefenseState({ ...rosBridge.defenseState });
          const upBot = { ...robot, modeDefense: rosBridge.defenseState };
          onUpdateRobot(upBot);
          persistUpdatedRobotAutonomous(upBot);
        }}
      />

      {/* Modal Cycle Circadien, Santé Mécatronique, Vision Objets & Voix Locale */}
      <CircadianAndMecatronicModal
        isOpen={showCircadianModal}
        onClose={() => setShowCircadianModal(false)}
        robot={robot}
        onTriggerDailyObjectRemark={(remark) => {
          const robotMsg: CallChatMessage = {
            id: `msg_obj_${Date.now()}`,
            sender: 'robot',
            text: remark,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isDeterministic: true,
            ruleName: 'Vision Spatiale : Remarque Proactive Quotidienne'
          };
          setMessages(prev => [...prev, robotMsg]);
          addChatMessage(robot.id, {
            robotId: robot.id,
            sender: 'robot',
            text: remark,
            timestamp: new Date().toISOString(),
            source: 'local_engine'
          });
        }}
        onUpdateRobot={onUpdateRobot}
      />
    </div>
  );
};

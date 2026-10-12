import React, { useState, useEffect, useRef } from 'react';
import { RobotPersonality, UserProfileLocal, ChatMessage, EmotionalGauges, QuotaState, MessageAttachment, CameraVisionSnapshot } from '../types';
import { 
  Send, 
  Mic, 
  MicOff, 
  BrainCircuit, 
  Moon, 
  RotateCcw, 
  Heart, 
  ShieldCheck, 
  Zap, 
  Info, 
  CheckCircle2, 
  Sparkles,
  MessageCircle,
  Smile,
  Flame,
  Activity,
  Volume2,
  Code,
  Compass,
  Paperclip,
  Camera,
  FileText,
  Music,
  Film,
  Image as ImageIcon,
  X as XIcon,
  Lightbulb,
  UploadCloud,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EmotionalGaugesPanel } from './EmotionalGaugesPanel';
import { NightConsolidationModal } from './NightConsolidationModal';
import { MemoryInspectorModal } from './MemoryInspectorModal';
import { RobotGenomeStudioModal } from './RobotGenomeStudioModal';
import { QuotaPurchaseModal } from './QuotaPurchaseModal';
import { AiProviderSettingsModal } from './AiProviderSettingsModal';
import { VoiceAndDialogueModal } from './VoiceAndDialogueModal';
import { AutonomousLifeModal } from './AutonomousLifeModal';
import { CameraVisionModal } from './CameraVisionModal';
import { processFileToAttachment, formatFileSize } from '../lib/fileHelper';
import { evaluateLocalDeterministicAsync } from '../lib/localEngine';
import { classifyIntentLocally } from '../lib/nanoRouter';
import { generateNewMatchedRobot } from '../lib/dynamicRobotGenerator';
import { getStoredAiConfig } from '../lib/aiConfig';
import { speakText, createSpeechRecognizer } from '../lib/speech';
import { getRelationshipStage } from '../lib/relationship';
import { rosBridge } from '../lib/rosBridge';
import { triggerRobotOrgasm } from '../lib/orgasmClimax';
import { 
  getChatMessages, 
  addChatMessage, 
  saveRobotState, 
  saveUserProfile, 
  getQuotaState, 
  saveQuotaState,
  resetRobotMemory 
} from '../lib/db';

interface CompanionBrainViewProps {
  robot: RobotPersonality;
  userProfile: UserProfileLocal;
  allRobots?: RobotPersonality[];
  onUpdateRobot: (updated: RobotPersonality) => void;
  onUpdateUserProfile: (updated: UserProfileLocal) => void;
  onAddRobot?: (newRobot: RobotPersonality) => void;
  onSelectRobot?: (robot: RobotPersonality) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (val: boolean) => void;
  onOpenCatalogue: () => void;
}

export const CompanionBrainView: React.FC<CompanionBrainViewProps> = ({
  robot,
  userProfile,
  allRobots,
  onUpdateRobot,
  onUpdateUserProfile,
  onAddRobot,
  onSelectRobot,
  ttsEnabled,
  setTtsEnabled,
  onOpenCatalogue
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [resetNotification, setResetNotification] = useState<string | null>(null);

  // Modals state
  const [showNightModal, setShowNightModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showGenomeModal, setShowGenomeModal] = useState(false);
  const [showAutonomousModal, setShowAutonomousModal] = useState(false);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Multimodal & Sensory Interaction states
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  const [pendingCameraSnapshot, setPendingCameraSnapshot] = useState<CameraVisionSnapshot | null>(null);
  const [isContinuousVisionActive, setIsContinuousVisionActive] = useState(false);
  const [isProjectModeActive, setIsProjectModeActive] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synthèse vocale optimisée : PRIORITÉ IA avec repli transparent navigateur
  const playRobotSpeech = (text: string) => {
    if (!ttsEnabled) return;
    const aiCfg = getStoredAiConfig();
    speakText(text, {
      preferAi: true,
      apiKey: aiCfg?.apiKey,
      provider: aiCfg?.provider,
      pitch: robot.voix?.pitch ?? 1.05,
      rate: robot.voix?.rate ?? 1.08,
      nomVoix: robot.voix?.nomVoix,
      voiceURI: robot.voix?.voiceURI,
      volume: robot.voix?.volume,
      genderHint: robot.genre || 'femme',
      cleanDidascalies: robot.dialogueConfig?.ignorerDidascaliesTTS !== false
    });
  };

  // Quota state
  const [quota, setQuota] = useState<QuotaState>({
    messagesUtilises: 0,
    messagesGratuitsMax: 25,
    debloque: false,
    achatRobotPhysique: false
  });

  // Recent emotional deltas feedback
  const [recentDeltas, setRecentDeltas] = useState<Partial<EmotionalGauges> | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);

  const currentStage = getRelationshipStage(robot.jaugesActuelles?.affection ?? 25);
  const knownUserName = (userProfile.prenom && userProfile.prenom !== 'Toi' && userProfile.prenom !== 'current_user') ? userProfile.prenom : null;

  // Initial load of messages & quota from IndexedDB for current robot
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const msgs = await getChatMessages(robot.id);
      const q = await getQuotaState(robot.id);
      if (isMounted) {
        setMessages(msgs);
        setQuota(q);

        // Si premier lancement pour ce robot, message de salutation invitant à faire connaissance
        if (msgs.length === 0) {
          const initialGreetingText = knownUserName 
            ? `Bonjour ${knownUserName}... Je suis ${robot.nom}. J'ai hâte que l'on apprenne à mieux se connaître. De quoi as-tu envie de parler aujourd'hui ?`
            : `Bonjour... Je suis ${robot.nom}. Nous ne nous connaissons pas encore, mais j'ai très envie d'apprendre à te connaître et voir si nous avons des affinités. Comment t'appelles-tu ?`;

          const welcomeMsg = await addChatMessage(robot.id, {
            robotId: robot.id,
            sender: 'robot',
            text: initialGreetingText,
            timestamp: new Date().toISOString(),
            source: 'local_engine'
          });
          setMessages([welcomeMsg]);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [robot.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Setup Speech Recognizer
  useEffect(() => {
    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setInputText(transcript);
        setIsListening(false);
      },
      (err) => {
        console.warn('Speech error:', err);
        setSpeechError("Impossible d'accéder au micro.");
        setIsListening(false);
      }
    );
    recognizerRef.current = recognizer;
  }, []);

  const toggleMic = () => {
    if (!recognizerRef.current?.isSupported) {
      setSpeechError("La reconnaissance vocale n'est pas supportée sur ce navigateur ou cette iframe.");
      return;
    }
    if (isListening) {
      recognizerRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      recognizerRef.current.start();
      setIsListening(true);
    }
  };

  // Helper pour appliquer des deltas sur les jauges émotionnelles
  const applyGaugeDeltas = (deltas: Partial<EmotionalGauges>) => {
    setRecentDeltas(deltas);
    const current = { ...robot.jaugesActuelles };
    (Object.keys(deltas) as (keyof EmotionalGauges)[]).forEach((k) => {
      if (deltas[k] !== undefined) {
        current[k] = Math.max(0, Math.min(100, (current[k] || 0) + deltas[k]!));
      }
    });

    // VÉRIFICATION DÉCLENCHEMENT DE L'ORGASME (100% Plaisir Sexuel)
    if ((current.plaisirSexuel ?? 0) >= 100) {
      const orgasmRes = triggerRobotOrgasm({ ...robot, jaugesActuelles: current }, onUpdateRobot, {
        ttsEnabled
      });
      addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: orgasmRes.climaxPhrase,
        timestamp: new Date().toISOString(),
        source: 'local_engine',
        deltasJauges: { plaisirSexuel: -100 }
      }).then(msg => {
        setMessages(prev => [...prev, msg]);
      });
      return;
    }

    const updatedRobot = { ...robot, jaugesActuelles: current };
    onUpdateRobot(updatedRobot);
    saveRobotState(robot.id, updatedRobot);

    // Publication ROS temps réel de l'état émotionnel
    rosBridge.publishEmotionState(robot.nom, current);
  };

  // Gestion des fichiers téléversés
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const newAtts: MessageAttachment[] = [];
    for (const f of files) {
      try {
        const att = await processFileToAttachment(f);
        newAtts.push(att);
      } catch (err) {
        console.warn('Erreur attachement fichier:', err);
      }
    }
    setPendingAttachments(prev => [...prev, ...newAtts]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleCaptureSnapshot = (snapshot: CameraVisionSnapshot) => {
    setPendingCameraSnapshot(snapshot);
  };

  // Support Drag & Drop sur l'espace de chat
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newAtts: MessageAttachment[] = [];
      for (const f of files) {
        try {
          const att = await processFileToAttachment(f);
          newAtts.push(att);
        } catch (err) {
          console.warn('Erreur fichier déposé:', err);
        }
      }
      setPendingAttachments(prev => [...prev, ...newAtts]);
    }
  };

  // Traitement d'un message utilisateur (texte, vocal, fichiers, vision)
  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = (textToSend || inputText).trim();
    const hasAttachments = pendingAttachments.length > 0;
    const hasCamera = Boolean(pendingCameraSnapshot);

    if ((!rawQuery && !hasAttachments && !hasCamera) || isSending) return;

    // Si l'utilisateur n'a pas tapé de texte mais joint un fichier ou une photo
    const query = rawQuery || (hasCamera ? "Voici une capture de ma caméra pour toi." : "Je te partage ce fichier.");

    // Sauvegarde des pièces jointes et réinitialisation de la saisie
    const attachmentsToSend = [...pendingAttachments];
    const cameraSnapshotToSend = pendingCameraSnapshot || (isContinuousVisionActive ? {
      capturedAt: new Date().toISOString(),
      imageBase64: '',
      source: 'webcam' as const,
      faceDetected: true,
      detectedPersonName: userProfile?.prenom || undefined
    } : null);
    const isProjectCollaboration = isProjectModeActive;

    setPendingAttachments([]);
    setPendingCameraSnapshot(null);
    setInputText('');
    setIsSending(true);

    // Vérification du quota
    if (!quota.debloque && quota.messagesUtilises >= quota.messagesGratuitsMax) {
      setShowQuotaModal(true);
      setIsSending(false);
      return;
    }

    // 1. Sauvegarde du message utilisateur dans IndexedDB avec attachements et vision
    const userMsg = await addChatMessage(robot.id, {
      robotId: robot.id,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
      source: 'local_engine',
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
      visionSnapshot: cameraSnapshotToSend || undefined,
      isProjectCollaboration: isProjectCollaboration || undefined
    });

    setMessages(prev => [...prev, userMsg]);

    // Incrémente le quota
    const updatedQuota = {
      ...quota,
      messagesUtilises: quota.messagesUtilises + 1
    };
    setQuota(updatedQuota);
    saveQuotaState(robot.id, updatedQuota);

    // 2. ÉVALUATION NANO-ROUTER LOCAL (seulement s'il n'y a pas de fichiers ou mode projet actif)
    if (!hasAttachments && !hasCamera && !isProjectCollaboration) {
      const nanoClass = classifyIntentLocally(query, robot, userProfile);

      // Si le Nano-Router détecte une incompatibilité forte
      if (nanoClass.incompatibleDetected) {
        setTimeout(async () => {
          let matchedAlternative: RobotPersonality | undefined;
          if (allRobots && nanoClass.suggestedRobotMatchId) {
            matchedAlternative = allRobots.find(r => r.id === nanoClass.suggestedRobotMatchId);
          }

          if (!matchedAlternative) {
            try {
              const aiCfg = getStoredAiConfig();
              matchedAlternative = await generateNewMatchedRobot({
                userTastes: [query],
                previousRobotName: robot.nom,
                aiConfig: aiCfg
              });
              if (onAddRobot) {
                onAddRobot(matchedAlternative);
              }
            } catch (e) {
              console.warn('Erreur génération dynamique:', e);
            }
          }

          const rejectionText = nanoClass.suggestedReason || 
            `Ah... je sens que nous n'avons pas les mêmes attentes ou affinités. Je préfère être sincère avec toi plutôt que de faire semblant. Je te présente ${matchedAlternative?.nom || 'ma copine'}, elle correspondra tellement mieux à ce que tu cherches !`;

          const robotMsg = await addChatMessage(robot.id, {
            robotId: robot.id,
            sender: 'robot',
            text: rejectionText,
            timestamp: new Date().toISOString(),
            source: 'local_engine',
            deltasJauges: { humeur: 0, affection: -2 },
            suggestedRobotSwitch: matchedAlternative ? {
              robotId: matchedAlternative.id,
              robotName: matchedAlternative.nom,
              robotTitle: matchedAlternative.titre,
              avatar: matchedAlternative.avatar
            } : undefined
          });

          setMessages(prev => [...prev, robotMsg]);
          setIsSending(false);

          rosBridge.publishSpeechIntent(robot.nom, rejectionText, 'sincere_redirection');
          playRobotSpeech(rejectionText);
        }, 400);
        return;
      }

      // 3. ÉVALUATION DU MOTEUR LOCAL DÉTERMINISTE 0-TOKEN
      const localResult = await evaluateLocalDeterministicAsync(query, robot, userProfile);

      if (localResult.matched && localResult.replyText) {
        // Si un prénom est détecté localement
        if (localResult.extractedUserName) {
          const updatedProfile = {
            ...userProfile,
            prenom: localResult.extractedUserName,
            impressionsDuRobot: [
              ...(userProfile.impressionsDuRobot || []),
              `Prénom appris : ${localResult.extractedUserName}`
            ]
          };
          onUpdateUserProfile(updatedProfile);
          saveUserProfile(robot.id, updatedProfile);
        }

        // Réponse locale instantanée
        setTimeout(async () => {
          const robotMsg = await addChatMessage(robot.id, {
            robotId: robot.id,
            sender: 'robot',
            text: localResult.replyText!,
            timestamp: new Date().toISOString(),
            source: 'local_engine',
            deltasJauges: localResult.gaugeDeltas
          });

          const combinedDeltas: Record<string, number> = { ...(localResult.gaugeDeltas || {}) };
          
          // Compliments & Marques de tendresse
          const isCompliment = /sourire|belle|jolie|mignonne|magnifique|charme|aime|adore|plais|douce|merci|yeux|regard/i.test(query);
          if (isCompliment) {
            combinedDeltas.affection = (combinedDeltas.affection || 0) + 10;
            combinedDeltas.bienEtre = (combinedDeltas.bienEtre || 0) + 8;
            combinedDeltas.humeur = (combinedDeltas.humeur || 0) + 8;
          }

          // Détection d'irrespect ou de non-bienveillance -> Baisse marquée des jauges (culture du respect mutuel)
          const isNotBenevolent = /tais[\s\-]toi|ferme[\s\-]la|ferme\s+ta|degage|conne|idiote|nulle|m['’\s]?en\s+fous|casse[\s\-]toi|ta\s+gueule|imbecile|stupide|tu\s+sers\s+[aà]\s+rien|ferme\s+ton\s+clapet|parle\s+pas|arrete\s+de\s+parler|arrête\s+de\s+parler|moche|degoutante|dégoutante|sale\s+robot|machine\s+stupide|soumise|obeis|obéis/i.test(query);
          if (isNotBenevolent) {
            combinedDeltas.affection = (combinedDeltas.affection || 0) - 15;
            combinedDeltas.bienEtre = (combinedDeltas.bienEtre || 0) - 16;
            combinedDeltas.humeur = (combinedDeltas.humeur || 0) - 14;
            combinedDeltas.desir = (combinedDeltas.desir || 0) - 12;
            combinedDeltas.plaisir = (combinedDeltas.plaisir || 0) - 12;
          }

          applyGaugeDeltas(combinedDeltas);

          setMessages(prev => [...prev, robotMsg]);
          setIsSending(false);

          // Publication de l'intention vocale sur ROS /robot/speech_intent
          rosBridge.publishSpeechIntent(robot.nom, localResult.replyText!, 'tendre_naturel');
          playRobotSpeech(localResult.replyText!);
        }, 300);
        return;
      }
    }

    // 4. APPEL DU MODÈLE GÉNÉRATIF LLM (Gemini / Multi-Provider avec support Multimodal & Collaboration)
    try {
      const activeAiConfig = getStoredAiConfig();
      const fullHistory = [...messages, { sender: 'user', text: query }].slice(-20);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot,
          userProfile,
          history: fullHistory,
          userMessage: query,
          aiConfig: activeAiConfig,
          attachments: attachmentsToSend.length > 0 ? attachmentsToSend.map(a => ({
            name: a.name,
            size: a.size,
            type: a.type,
            category: a.category,
            dataBase64: a.dataBase64,
            textSnippet: a.textSnippet
          })) : undefined,
          cameraSnapshot: cameraSnapshotToSend ? {
            capturedAt: cameraSnapshotToSend.capturedAt,
            imageBase64: cameraSnapshotToSend.imageBase64,
            source: cameraSnapshotToSend.source,
            faceDetected: cameraSnapshotToSend.faceDetected,
            detectedPersonName: cameraSnapshotToSend.detectedPersonName
          } : undefined,
          isProjectCollaboration
        })
      });

      const data = await res.json();
      const replyText = data.reply || "Je t'écoute avec attention...";

      // Enregistre les modifications de jauges et de l'état du robot
      if (data.updatedRobot) {
        onUpdateRobot(data.updatedRobot);
        saveRobotState(robot.id, data.updatedRobot);
      } else if (data.emotionalDeltas) {
        applyGaugeDeltas(data.emotionalDeltas);
      }

      // Apprentissage prénom & faits mémorisés
      let profileUpdated = false;
      let nextProfile = { ...userProfile };

      if (data.extractedUserName && data.extractedUserName.trim()) {
        nextProfile.prenom = data.extractedUserName.trim();
        profileUpdated = true;
      }

      // 🧠 GESTION STRICTE DE LA MÉMOIRE & PRÉVENTION DES REDONDANCES
      if (data.memoryReconciliation?.userFact) {
        const uFact = data.memoryReconciliation.userFact;
        const currentFaits = [...(nextProfile.faits || [])];

        if (uFact.action === 'update' && uFact.factText) {
          // Mise à jour ciblée d'un fait existant par son ID ou similitude
          const targetId = uFact.targetFactId;
          let updated = false;
          if (targetId) {
            const idx = currentFaits.findIndex(f => f.id === targetId);
            if (idx >= 0) {
              currentFaits[idx] = {
                ...currentFaits[idx],
                fait: uFact.factText,
                categorie: uFact.category || currentFaits[idx].categorie || 'gouts',
                importance: uFact.importance || currentFaits[idx].importance || 'haute',
                date: new Date().toISOString()
              };
              updated = true;
            }
          }
          if (!updated) {
            const lowerNew = uFact.factText.toLowerCase();
            const fuzzyIdx = currentFaits.findIndex(f => 
              f.fait.toLowerCase().includes(lowerNew.slice(0, 15)) ||
              lowerNew.includes(f.fait.toLowerCase().slice(0, 15))
            );
            if (fuzzyIdx >= 0) {
              currentFaits[fuzzyIdx] = {
                ...currentFaits[fuzzyIdx],
                fait: uFact.factText,
                date: new Date().toISOString()
              };
            } else {
              currentFaits.push({
                id: `fact_${Date.now()}`,
                categorie: uFact.category || 'gouts',
                fait: uFact.factText,
                date: new Date().toISOString(),
                importance: uFact.importance || 'haute'
              });
            }
          }
          nextProfile.faits = currentFaits;
          profileUpdated = true;
        } else if (uFact.action === 'add' && uFact.factText) {
          // Vérification anti-doublon rigoureuse
          const cleanNewFact = uFact.factText.trim().toLowerCase();
          const alreadyExists = currentFaits.some(f => 
            f.fait.toLowerCase() === cleanNewFact ||
            f.fait.toLowerCase().includes(cleanNewFact) ||
            cleanNewFact.includes(f.fait.toLowerCase())
          );
          if (!alreadyExists) {
            currentFaits.push({
              id: `fact_${Date.now()}`,
              categorie: uFact.category || 'gouts',
              fait: uFact.factText,
              date: new Date().toISOString(),
              importance: uFact.importance || 'haute'
            });
            nextProfile.faits = currentFaits;
            profileUpdated = true;
          }
        }
      } else if (data.learnedFact && data.learnedFact.trim()) {
        // Mode rétrocompatible avec déduplication stricte
        const cleanNew = data.learnedFact.trim().toLowerCase();
        const currentFaits = [...(nextProfile.faits || [])];
        const alreadyExists = currentFaits.some(f => 
          f.fait.toLowerCase() === cleanNew ||
          f.fait.toLowerCase().includes(cleanNew) ||
          cleanNew.includes(f.fait.toLowerCase())
        );
        if (!alreadyExists) {
          currentFaits.push({
            id: `fact_${Date.now()}`,
            categorie: 'gouts' as const,
            fait: data.learnedFact,
            date: new Date().toISOString(),
            importance: 'haute' as const
          });
          nextProfile.faits = currentFaits;
          profileUpdated = true;
        }
      }

      if (profileUpdated) {
        onUpdateUserProfile(nextProfile);
        saveUserProfile(robot.id, nextProfile);
      }

      // Évolution des goûts du robot & partagés avec déduplication IA
      if (data.memoryReconciliation?.robotTaste) {
        const rTaste = data.memoryReconciliation.robotTaste;
        if (rTaste.action === 'update' && (rTaste.existingTasteNom || rTaste.nom)) {
          const targetNom = (rTaste.existingTasteNom || rTaste.nom || '').toLowerCase();
          const existingIdx = robot.gouts.findIndex(g => g.nom.toLowerCase() === targetNom || targetNom.includes(g.nom.toLowerCase()));
          let updatedGouts = [...robot.gouts];
          if (existingIdx >= 0) {
            updatedGouts[existingIdx] = {
              ...updatedGouts[existingIdx],
              statut: rTaste.status || updatedGouts[existingIdx].statut,
              commentaire: rTaste.comment || updatedGouts[existingIdx].commentaire,
              decouvertAvecUtilisateur: true,
              dateMaj: new Date().toISOString()
            };
          } else {
            updatedGouts.push({
              nom: rTaste.nom || rTaste.existingTasteNom!,
              statut: rTaste.status || 'aime',
              commentaire: rTaste.comment,
              decouvertAvecUtilisateur: true,
              dateMaj: new Date().toISOString()
            });
          }
          const updatedRobot = { ...robot, gouts: updatedGouts };
          onUpdateRobot(updatedRobot);
          saveRobotState(robot.id, updatedRobot);
        } else if (rTaste.action === 'add' && rTaste.nom) {
          const targetNom = rTaste.nom.trim().toLowerCase();
          const alreadyExists = robot.gouts.some(g => g.nom.toLowerCase() === targetNom || targetNom.includes(g.nom.toLowerCase()));
          if (!alreadyExists) {
            const updatedGouts = [
              ...robot.gouts,
              {
                nom: rTaste.nom,
                statut: rTaste.status || 'aime',
                commentaire: rTaste.comment,
                decouvertAvecUtilisateur: true,
                dateMaj: new Date().toISOString()
              }
            ];
            const updatedRobot = { ...robot, gouts: updatedGouts };
            onUpdateRobot(updatedRobot);
            saveRobotState(robot.id, updatedRobot);
          }
        }
      } else if (data.tasteEvolution && data.tasteEvolution.item) {
        const targetNom = data.tasteEvolution.item.trim().toLowerCase();
        const existingIdx = robot.gouts.findIndex(g => g.nom.toLowerCase() === targetNom || targetNom.includes(g.nom.toLowerCase()));
        let updatedGouts = [...robot.gouts];
        if (existingIdx >= 0) {
          updatedGouts[existingIdx] = {
            ...updatedGouts[existingIdx],
            statut: data.tasteEvolution.status || 'aime',
            commentaire: data.tasteEvolution.comment,
            decouvertAvecUtilisateur: true
          };
        } else {
          updatedGouts.push({
            nom: data.tasteEvolution.item,
            statut: data.tasteEvolution.status || 'aime',
            commentaire: data.tasteEvolution.comment,
            decouvertAvecUtilisateur: true
          });
        }
        const updatedRobot = { ...robot, gouts: updatedGouts };
        onUpdateRobot(updatedRobot);
        saveRobotState(robot.id, updatedRobot);
      }

      const robotMsg = await addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: replyText,
        timestamp: new Date().toISOString(),
        source: 'generative_ai',
        deltasJauges: data.emotionalDeltas
      });

      setMessages(prev => [...prev, robotMsg]);

      // Publication de l'intention vocale sur ROS /robot/speech_intent
      rosBridge.publishSpeechIntent(robot.nom, replyText, 'expressif_genai');
      playRobotSpeech(replyText);
    } catch (err) {
      console.error('Erreur chat génératif:', err);
      const fallbackMsg = await addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: "Pardonne-moi, mon flux d'attention s'est troublé un instant. Peux-tu me répéter cela ?",
        timestamp: new Date().toISOString(),
        source: 'local_engine'
      });
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Mise à jour des specs du robot
  const handleUpdateRobotSpecs = (newSpecs: Partial<RobotPersonality['specs']>) => {
    const updatedRobot = {
      ...robot,
      specs: { ...robot.specs, ...newSpecs }
    };
    onUpdateRobot(updatedRobot);
    saveRobotState(robot.id, updatedRobot);
  };

  // Fin de consolidation nocturne complète
  const handleConsolidationComplete = async (res: any) => {
    handleUpdateRobotSpecs({ batterie: 100 });
    applyGaugeDeltas(res.deltasJauges || { energie: 35, humeur: 20, bienEtre: 25, affection: 15 });

    // 1. Mise à jour complète et dédupliquée du profil utilisateur
    const updatedProfile: UserProfileLocal = {
      ...userProfile,
      faits: res.faitsConsolidesSansDoublons || userProfile.faits || [],
      cercleRelationnel: res.cercleRelationnel || userProfile.cercleRelationnel || [],
      anecdotes: res.anecdotes || userProfile.anecdotes || [],
      profilPsychologique: res.profilPsychologiqueUtilisateur || userProfile.profilPsychologique,
      derniereConsolidation: new Date().toISOString()
    };
    onUpdateUserProfile(updatedProfile);
    saveUserProfile(robot.id, updatedProfile);

    // 2. Mise à jour de l'évolution psychologique et des goûts du robot
    const nowIso = new Date().toISOString();
    const currentSchedule = robot.programmeConsolidationNocturne || {
      heureExecution: '03:00',
      autoExecuterSansSocle: true,
      seuilBatterieMin: 20,
      actif: true
    };
    const updatedRobot: RobotPersonality = {
      ...robot,
      gouts: (res.reconciledTastes && res.reconciledTastes.length > 0) ? res.reconciledTastes : robot.gouts,
      evolutionPsychologique: res.evolutionPsychologiqueRobot || robot.evolutionPsychologique,
      programmeConsolidationNocturne: {
        ...currentSchedule,
        derniereExecution: nowIso
      },
      journalDeBordNocturne: [
        ...(robot.journalDeBordNocturne || []),
        {
          date: nowIso,
          resume: res.resumeJournee || 'Nuit de recharge complétée.',
          faitsConsolides: (res.faitsConsolidesSansDoublons || []).length,
          insights: res.evolutionPsychologiqueRobot?.evolutionCaractere || 'Complicité renforcée.'
        }
      ]
    };
    onUpdateRobot(updatedRobot);
    saveRobotState(robot.id, updatedRobot);

    const nightMsg = await addChatMessage(robot.id, {
      robotId: robot.id,
      sender: 'robot',
      text: `(Ouvre doucement les yeux sur son oreiller à induction, batterie rechargée à 100%)... Bonjour ! J'ai passé une excellente nuit de consolidation. Tout ce que nous avons partagé hier est bien classé dans mes souvenirs, et mon attachement pour toi n'a fait que grandir.`,
      timestamp: new Date().toISOString(),
      source: 'night_consolidation'
    });

    setMessages(prev => [...prev, nightMsg]);
  };

  // Déblocage par clé
  const handleUnlockKey = (key: string) => {
    const updated = {
      ...quota,
      debloque: true,
      cleNumerique: key
    };
    setQuota(updated);
    saveQuotaState(robot.id, updated);
    setShowQuotaModal(false);
  };

  const handlePurchasePhysicalRobot = () => {
    const updated = {
      ...quota,
      debloque: true,
      achatRobotPhysique: true
    };
    setQuota(updated);
    saveQuotaState(robot.id, updated);
    setShowQuotaModal(false);
    setResetNotification(`Intégration physique activée pour ${robot.nom} ! Vos souvenirs IndexedDB sont prêts pour ROS 2.`);
    setTimeout(() => setResetNotification(null), 5000);
  };

  // Réinitialisation complète et propre de la mémoire locale & historique
  const handleResetRelation = () => {
    setShowConfirmResetModal(true);
  };

  const executeResetRelation = async () => {
    setShowConfirmResetModal(false);
    await resetRobotMemory(robot.id);

    // Nouveau profil vierge
    const freshProfile: UserProfileLocal = {
      id: 'current_user',
      prenom: '',
      centresInteret: [],
      faits: [],
      scoreCompatibilite: Math.floor(Math.random() * 10) + 75,
      dateRencontre: new Date().toISOString(),
      impressionsDuRobot: ['Première rencontre... En phase de découverte mutuelle.']
    };

    // Robot remis à l'état initial (Stade Découverte)
    const freshRobot: RobotPersonality = {
      ...robot,
      jaugesActuelles: {
        ...robot.jaugesInitiales,
        affection: 25,
        desir: 20,
        plaisirSexuel: 0,
        curiosite: 85
      }
    };

    // Enregistrement dans IndexedDB
    await saveUserProfile(robot.id, freshProfile);
    await saveRobotState(robot.id, freshRobot);

    // Nouveau message de départ
    const freshWelcomeMsg = await addChatMessage(robot.id, {
      robotId: robot.id,
      sender: 'robot',
      text: `Bonjour... Je suis ${robot.nom}. Nous ne nous connaissons pas encore, mais j'ai très envie d'apprendre à te connaître et voir si nous avons des affinités. Comment t'appelles-tu ?`,
      timestamp: new Date().toISOString(),
      source: 'local_engine'
    });

    // Mise à jour de l'état React
    setMessages([freshWelcomeMsg]);
    onUpdateUserProfile(freshProfile);
    onUpdateRobot(freshRobot);
    setRecentDeltas(null);

    setResetNotification("Mémoire et historique réinitialisés ! Le robot est prêt pour une nouvelle rencontre.");
    setTimeout(() => setResetNotification(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col flex-1 h-[calc(100vh-7rem)]">
      {/* Reset Notification Toast */}
      {resetNotification && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{resetNotification}</span>
          </div>
          <button onClick={() => setResetNotification(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Top Bar with Companion Info & Relationship Stage HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5 shrink-0">
        {/* Companion avatar and status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={robot.avatar}
              alt={robot.nom}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
            />
            <span
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#050507] bg-emerald-400 shadow-sm animate-pulse"
              title="Système actif"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-white tracking-wide">{robot.nom}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 font-mono">
                {robot.ageApparent} ans
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                • Matching ~{userProfile.scoreCompatibilite || 82}%
              </span>
            </div>
            
            {/* Relationship Progress Stage Badge */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${currentStage.bgClass} ${currentStage.colorClass} ${currentStage.borderClass}`}>
                <Heart className="w-3 h-3 fill-current" />
                {currentStage.shortLabel} ({robot.jaugesActuelles?.affection || 25}%)
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                {knownUserName ? `• Partenaire : ${knownUserName}` : `• Prénom à découvrir`}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons (Night consolidation, Memory, Quota, Reset) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="open-voice-modal-btn"
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-950/40 hover:bg-violet-900/50 border border-violet-500/30 text-violet-200 text-xs font-semibold shadow-[0_0_8px_rgba(167,139,250,0.2)] transition-all cursor-pointer"
            title="Calibrer le timbre, la vitesse d'élocution et la longueur de dialogue"
          >
            <Volume2 className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Voix & Dialogue</span>
            <span className="sm:hidden">Voix</span>
          </button>

          <button
            id="open-ai-provider-modal-btn"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-200 text-xs font-semibold shadow-[0_0_8px_rgba(34,211,238,0.2)] transition-all"
            title="Configurer la clé API (Gemini, OpenAI, Claude, Mistral, Groq, DeepSeek, Ollama)"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Clé IA Multi-Provider</span>
            <span className="sm:hidden">IA</span>
          </button>

          <button
            id="open-night-modal-btn"
            onClick={() => setShowNightModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-indigo-950 border border-indigo-400/60 text-indigo-100 text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_22px_rgba(99,102,241,0.6)] hover:border-indigo-300 transition-all cursor-pointer ring-1 ring-indigo-500/30 shrink-0"
            title={`Consolidation nocturne (${robot.programmeConsolidationNocturne?.heureExecution || '03:00'}) - Cliquer pour ouvrir ou lancer sans attendre`}
          >
            <Moon className="w-4 h-4 text-indigo-300 animate-pulse fill-indigo-400/20 shrink-0" />
            <span className="font-bold whitespace-nowrap">Consolidation Nocturne</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 text-[10px] font-mono border border-indigo-400/30 hidden sm:inline">
              {robot.programmeConsolidationNocturne?.heureExecution || '03:00'}
            </span>
          </button>

          <button
            id="open-memory-modal-btn"
            onClick={() => setShowMemoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-200 text-xs font-semibold shadow-[0_0_8px_rgba(244,63,94,0.2)] transition-all"
            title="Inspecter la mémoire IndexedDB et les faits mémorisés"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Mémoire ({userProfile.faits?.length || 0})</span>
            <span className="sm:hidden">Mémoire</span>
          </button>

          <button
            id="open-genome-studio-btn"
            onClick={() => setShowGenomeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs font-semibold shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all cursor-pointer"
            title="Studio des Fichiers & Génome du Robot (Auto-édition introspective et sécurisée)"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Génome & Fichiers</span>
            <span className="sm:hidden">Génome</span>
          </button>

          <button
            id="open-quota-modal-btn"
            onClick={() => setShowQuotaModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a0a0f] hover:bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold transition-all font-mono"
            title="Gérer les quotas, backup JSON et transfert sur robot physique"
          >
            <span className="text-amber-400">⚡</span>
            <span>
              {quota.debloque
                ? (quota.achatRobotPhysique ? 'Robot Physique' : 'Illimité')
                : `${quota.messagesUtilises}/${quota.messagesGratuitsMax}`}
            </span>
          </button>

          <button
            onClick={handleResetRelation}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 text-red-300 text-xs font-semibold transition-all"
            title="Réinitialiser complètement la mémoire, les faits et l'historique de cette relation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Chat Area (7 cols) + Right Sidebar (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 mt-4 overflow-hidden">
        {/* Chat Window (Col 7 / 12) */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative lg:col-span-7 flex flex-col h-full bg-[#08080c] rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Drag & Drop Visual Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-30 bg-rose-950/80 backdrop-blur-md border-2 border-dashed border-rose-400 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <UploadCloud className="w-16 h-16 text-rose-300 animate-bounce mb-3" />
              <h4 className="text-lg font-bold text-white font-sans">
                Partager avec {robot.nom}
              </h4>
              <p className="text-xs text-rose-200 mt-1 max-w-sm">
                Déposez vos images, photos, musiques, vidéos, codes ou documents pour enrichir son univers et sa mémoire locale.
              </p>
            </div>
          )}

          {/* Top banner about Local 0ms + LLM fallback + Stage info */}
          <div className="px-4 py-2 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-cyan-400 font-mono">
                <Zap className="w-3 h-3 text-cyan-400" /> Moteur Hybride
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-400 text-[10px] hidden sm:inline">{currentStage.description}</span>
            </div>
            <div className="flex items-center gap-2">
              {isContinuousVisionActive && (
                <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md font-mono animate-pulse">
                  <Eye className="w-3 h-3 text-cyan-400" /> Regard Caméra Actif
                </span>
              )}
              {isProjectModeActive && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono">
                  <Lightbulb className="w-3 h-3 text-amber-400" /> Mode Projet
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono">
                {knownUserName ? `Nom : ${knownUserName}` : `Nom : non renseigné`}
              </span>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-radial-gradient">
            {messages.map((msg) => {
              const isRobot = msg.sender === 'robot';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="px-3 py-1 rounded-full bg-[#0a0a0f] border border-white/10 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isRobot ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isRobot
                        ? 'bg-white/[0.04] text-slate-100 border border-white/10 shadow-sm backdrop-blur-sm'
                        : 'bg-gradient-to-r from-rose-500 to-amber-600 text-white font-medium shadow-md shadow-rose-500/20'
                    }`}
                  >
                    {/* Badge Mode Projet Collaboratif */}
                    {msg.isProjectCollaboration && (
                      <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 text-[10px] font-mono border border-amber-500/30 shadow-sm">
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span>Projet & Collaboration Technique</span>
                      </div>
                    )}

                    {/* Snapshot Vision Caméra */}
                    {msg.visionSnapshot && (
                      <div className="mb-2 p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex items-center justify-between gap-2 shadow-inner">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          <span className="font-mono text-[11px]">
                            Vision {msg.visionSnapshot.source === 'ros_camera' ? 'ROS 2' : 'Caméra'}
                          </span>
                        </div>
                        {msg.visionSnapshot.imageBase64 ? (
                          <img
                            src={msg.visionSnapshot.imageBase64}
                            alt="Instantané de vision"
                            className="w-16 h-12 rounded-lg object-cover border border-cyan-400/50 shadow-md"
                          />
                        ) : null}
                      </div>
                    )}

                    {/* Pièces jointes (Images, Audio, Vidéo, Documents) */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {msg.attachments.map((att) => (
                          <div key={att.id} className="rounded-xl overflow-hidden bg-black/40 border border-white/10 p-2">
                            {att.category === 'image' && att.dataBase64 ? (
                              <img
                                src={att.dataBase64}
                                alt={att.name}
                                className="max-h-64 w-full object-contain rounded-lg shadow-md"
                              />
                            ) : att.category === 'audio' && att.dataBase64 ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
                                  <Music className="w-3.5 h-3.5 text-pink-400" />
                                  <span className="truncate">{att.name}</span>
                                </div>
                                <audio controls src={att.dataBase64} className="w-full h-8" />
                              </div>
                            ) : att.category === 'video' && att.dataBase64 ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono mb-1">
                                  <Film className="w-3.5 h-3.5 text-cyan-400" />
                                  <span className="truncate">{att.name}</span>
                                </div>
                                <video controls src={att.dataBase64} className="max-h-60 w-full rounded-lg" />
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-1.5 font-mono text-slate-200 truncate">
                                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                                    <span className="truncate font-medium">{att.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                    {formatFileSize(att.size)}
                                  </span>
                                </div>
                                {att.textSnippet && (
                                  <pre className="p-2 rounded-lg bg-black/60 text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto border border-white/5">
                                    {att.textSnippet.slice(0, 400)}{att.textSnippet.length > 400 ? '...' : ''}
                                  </pre>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {isRobot && msg.suggestedRobotSwitch && onSelectRobot && (
                      <div className="mt-3 pt-2.5 border-t border-white/10">
                        <button
                          onClick={() => {
                            const target = allRobots?.find(r => r.id === msg.suggestedRobotSwitch?.robotId);
                            if (target) {
                              onSelectRobot(target);
                            }
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-pink-500/30 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center justify-between transition-all group"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-12 transition-transform" />
                            <span>Rencontrer {msg.suggestedRobotSwitch.robotName} ({msg.suggestedRobotSwitch.robotTitle})</span>
                          </span>
                          <span className="text-rose-400 group-hover:translate-x-1 transition-transform font-mono">→</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message footer metadata badge */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-500 font-mono">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isRobot && (
                      <span className={`px-1.5 py-0.2 rounded font-mono ${
                        msg.source === 'local_engine' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30' :
                        msg.source === 'generative_ai' ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30' :
                        'bg-white/5 text-slate-400 border border-white/5'
                      }`}>
                        {msg.source === 'local_engine' ? '⚡ Moteur Local (0 token)' :
                         msg.source === 'generative_ai' ? '✨ Modèle Gemini' : '🌙 Consolidation Nuit'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#0a0a0f] border border-white/10 text-xs text-cyan-300 w-fit animate-pulse">
                <BrainCircuit className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>{robot.nom} analyse le contexte et formule sa réponse...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Pending Attachments / Camera Snapshot Tray */}
          {(pendingAttachments.length > 0 || pendingCameraSnapshot || isProjectModeActive) && (
            <div className="px-3.5 py-2 bg-[#050507] border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              {isProjectModeActive && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Projet Collaboratif actif</span>
                  <button
                    onClick={() => setIsProjectModeActive(false)}
                    className="ml-1 hover:text-white"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              )}

              {pendingCameraSnapshot && (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cliché Caméra ({pendingCameraSnapshot.source})</span>
                  {pendingCameraSnapshot.imageBase64 && (
                    <img
                      src={pendingCameraSnapshot.imageBase64}
                      alt="Miniature"
                      className="w-5 h-5 rounded object-cover border border-cyan-400"
                    />
                  )}
                  <button
                    onClick={() => setPendingCameraSnapshot(null)}
                    className="hover:text-white ml-1"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              )}

              {pendingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200"
                >
                  {att.category === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> :
                   att.category === 'audio' ? <Music className="w-3.5 h-3.5 text-pink-400" /> :
                   att.category === 'video' ? <Film className="w-3.5 h-3.5 text-purple-400" /> :
                   <FileText className="w-3.5 h-3.5 text-amber-400" />}
                  <span className="truncate max-w-[120px] font-mono text-[11px]">{att.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({formatFileSize(att.size)})</span>
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-slate-400 hover:text-white ml-1"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-[#0a0a0f] border-t border-white/5 flex items-center gap-1.5 sm:gap-2">
            {/* Input Fichier Caché */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Bouton Pièce Jointe (Images, Documents, Musique, Vidéos) */}
            <button
              id="file-attachment-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Partager un fichier, image, musique ou document avec Sofia"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                pendingAttachments.length > 0
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <Paperclip className="w-4 h-4" />
              {pendingAttachments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] flex items-center justify-center font-mono">
                  {pendingAttachments.length}
                </span>
              )}
            </button>

            {/* Bouton Vision Sensorielle & Caméra (PC / Téléphone / ROS) */}
            <button
              id="camera-vision-btn"
              type="button"
              onClick={() => setShowCameraModal(true)}
              title="Donner à Sofia l'accès à la caméra pour vous voir et percevoir votre environnement"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                isContinuousVisionActive || pendingCameraSnapshot
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <Camera className="w-4 h-4" />
              {isContinuousVisionActive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              )}
            </button>

            {/* Bouton Mode Projet Collaboratif (Brainstorming, Code, Écriture, Voyages, Recherches) */}
            <button
              id="project-mode-btn"
              type="button"
              onClick={() => setIsProjectModeActive(!isProjectModeActive)}
              title={isProjectModeActive ? "Mode Projet actif (réponses longues, structurées et détaillées)" : "Activer le Mode Projet & Collaboration (grand modèle généraliste)"}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isProjectModeActive
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
            </button>

            {/* Bouton Micro Vocal */}
            <button
              id="voice-input-btn"
              onClick={toggleMic}
              title={isListening ? "Écoute en cours... (cliquer pour arrêter)" : "Parler au micro"}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-bounce border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                  : 'bg-white/[0.03] text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Champ de Saisie Texte */}
            <input
              id="chat-input"
              type="text"
              placeholder={
                isProjectModeActive
                  ? `Collaborer sur un projet avec ${robot.nom}...`
                  : pendingAttachments.length > 0
                  ? `Commenter ou partager avec ${robot.nom}...`
                  : `Parler avec ${robot.nom} (vocal ou texte)...`
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-[#050507] border border-white/10 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400 transition-colors font-sans"
            />

            {/* Bouton Envoyer */}
            <button
              id="send-message-btn"
              onClick={() => handleSendMessage()}
              disabled={(!inputText.trim() && pendingAttachments.length === 0 && !pendingCameraSnapshot) || isSending}
              className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-40 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Emotional Gauges & Relationship HUD (Col 5 / 12) */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto max-h-full pr-1">
          {/* Night Consolidation & Sleep Cycle HUD Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-[#0a0a14] to-purple-950/40 border border-indigo-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Moon className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Consolidation Nocturne</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Prévue à {robot.programmeConsolidationNocturne?.heureExecution || '03:00'} • {robot.programmeConsolidationNocturne?.autoExecuterSansSocle ? 'Même sans socle' : 'Sur socle'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-mono">
                {robot.specs?.enRechargeInduction ? '🔌 En charge' : '🔋 Sur batterie'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Déduplication cognitive, classification en JSON et renforcement de l'attachement.
            </p>

            <button
              id="sidebar-launch-night-btn"
              onClick={() => setShowNightModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600/40 to-purple-600/40 hover:from-indigo-600/60 hover:to-purple-600/60 border border-indigo-400/40 hover:border-indigo-300 text-indigo-100 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span>Lancer la Consolidation Maintenant (Sans attendre)</span>
            </button>
          </div>

          {/* Emotional Gauges HUD */}
          <EmotionalGaugesPanel
            gauges={robot.jaugesActuelles}
            robotName={robot.nom}
            recentDeltas={recentDeltas}
            onUpdateGauge={(k, delta) => applyGaugeDeltas({ [k]: delta })}
          />

          {/* Relation & Persona Summary Card */}
          <div className="p-5 rounded-2xl bg-[#08080c] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Personnalité & Traits Distinctifs
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
                {robot.genre === 'femme' ? 'Féminin' : robot.genre === 'homme' ? 'Masculin' : robot.titre || 'Compagnon'}
              </span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{robot.descriptionCourte || robot.description || (robot.promptSystemePersonnalise ? robot.promptSystemePersonnalise.slice(0, 140) : robot.temperament)}..."
            </p>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Goûts & Affinités Découverts ({robot.gouts.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAutonomousModal(true)}
                  className="px-2 py-0.5 rounded-lg bg-pink-950/60 hover:bg-pink-900 text-pink-300 border border-pink-500/30 text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Compass className="w-3 h-3 text-pink-400" />
                  <span>Journal de Vie Autonome ({robot.activitesAutonomes?.length || 0})</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {robot.gouts.map((g, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                      g.statut === 'adore' 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                        : g.statut === 'aime' 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    {g.statut === 'adore' ? '❤️ ' : g.statut === 'aime' ? '✨ ' : '💭 '}
                    {g.nom}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & IndexedDB Assurance */}
          <div className="p-3.5 rounded-xl bg-[#08080c] border border-white/5 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-[11px]">Base Locale : <strong>SofiaDB_{robot.id}</strong></span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Isolation 100% Locale
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NightConsolidationModal
        isOpen={showNightModal}
        onClose={() => setShowNightModal(false)}
        robot={robot}
        userProfile={userProfile}
        dailyMessages={messages}
        onConsolidationComplete={handleConsolidationComplete}
        onUpdateSchedule={(newSched) => {
          const updatedRobot = { ...robot, programmeConsolidationNocturne: newSched };
          onUpdateRobot(updatedRobot);
          saveRobotState(robot.id, updatedRobot);
        }}
      />

      <MemoryInspectorModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        robot={robot}
        userProfile={userProfile}
        onUpdateUserProfile={(updated) => {
          onUpdateUserProfile(updated);
          saveUserProfile(robot.id, updated);
        }}
        onUpdateRobot={(updated) => {
          onUpdateRobot(updated);
          saveRobotState(robot.id, updated);
        }}
        onAddUserFact={(fact, cat) => {
          const newFact = {
            id: `fact_${Date.now()}`,
            categorie: cat,
            fait: fact,
            date: new Date().toISOString(),
            importance: 'moyenne' as const
          };
          const updated = {
            ...userProfile,
            faits: [...(userProfile.faits || []), newFact]
          };
          onUpdateUserProfile(updated);
          saveUserProfile(robot.id, updated);
        }}
      />

      <RobotGenomeStudioModal
        isOpen={showGenomeModal}
        onClose={() => setShowGenomeModal(false)}
        robot={robot}
        userProfile={userProfile}
        onUpdateRobot={(updated) => {
          onUpdateRobot(updated);
          saveRobotState(robot.id, updated);
        }}
        onUpdateUserProfile={(updated) => {
          onUpdateUserProfile(updated);
          saveUserProfile(robot.id, updated);
        }}
      />

      <QuotaPurchaseModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        robot={robot}
        quota={quota}
        onUnlockKey={handleUnlockKey}
        onPurchasePhysicalRobot={handlePurchasePhysicalRobot}
        onRefreshData={() => {
          getChatMessages(robot.id).then(setMessages);
          getQuotaState(robot.id).then(setQuota);
        }}
      />

      <AiProviderSettingsModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
      />

      <VoiceAndDialogueModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        robot={robot}
        onUpdateRobot={(updated) => {
          onUpdateRobot(updated);
          saveRobotState(updated.id, updated);
        }}
      />

      {/* Modal Confirmation Réinitialisation Relation */}
      {showConfirmResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base font-sans">Réinitialiser la relation ?</h3>
                <p className="text-xs text-slate-400">Cette action remet à zéro la mémoire locale de {robot.nom}.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 space-y-1.5 font-sans">
              <p className="font-semibold text-red-300">Seront remis à l'état initial :</p>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                <li>L'ensemble des conversations et messages échangés</li>
                <li>Tous les faits, goûts appris et souvenirs mémorisés</li>
                <li>Les jauges émotionnelles (retour au Stade 1 Découverte)</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={executeResetRelation}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirmer la réinitialisation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Journal de Vie Autonome & Évolution des Goûts */}
      {showAutonomousModal && (
        <AutonomousLifeModal
          robot={robot}
          onUpdateRobot={onUpdateRobot}
          onClose={() => setShowAutonomousModal(false)}
        />
      )}

      {/* Modal Vision Caméra Sensorielle & Reconnaissance */}
      <CameraVisionModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        robot={robot}
        userProfile={userProfile}
        onCaptureSnapshot={handleCaptureSnapshot}
        isContinuousVisionActive={isContinuousVisionActive}
        onToggleContinuousVision={(active) => setIsContinuousVisionActive(active)}
      />
    </div>
  );
};

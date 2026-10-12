import React, { useState, useEffect } from 'react';
import { 
  RobotPersonality, 
  UserProfileLocal, 
  EmotionalGauges, 
  LocalDeterministicRule,
  DeterministicBranchResponse,
  SingleGaugeCondition,
  GaugeComparisonOperator,
  TasteEntry,
  LongueurDialogueType,
  StyleOralType
} from '../types';
import JSZip from 'jszip';
import { 
  UserCheck, 
  Settings, 
  Sliders, 
  Scissors, 
  Brain, 
  Upload, 
  Download, 
  ShieldCheck, 
  Cpu, 
  Key, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Heart, 
  Activity, 
  Flame,
  Smile,
  Zap,
  Compass,
  Radio, 
  FolderArchive, 
  Eye, 
  MessageSquare,
  Volume2,
  VolumeX,
  FileCode,
  Terminal,
  Play,
  Square,
  AudioLines,
  RefreshCw,
  Copy,
  Code,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  GitBranch,
  Filter,
  Layers,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Sun,
  Laugh,
  MessageSquareQuote,
  Scale,
  HeartHandshake,
  Coffee,
  Waves,
  Camera,
  Image as ImageIcon,
  UserPlus,
  Wand2,
  Feather,
  AlertTriangle,
  Globe,
  Moon,
  Clock
} from 'lucide-react';
import { exportRobotMemoryBackup, importRobotMemoryBackup, getUserProfile, saveRobotState } from '../lib/db';
import { evaluateLocalDeterministic, formatConditionLabel, GAUGE_LABELS } from '../lib/localEngine';
import { downloadStandaloneBrain } from '../lib/exportStandaloneBrain';
import { speakText, stopSpeaking, getBrowserVoices } from '../lib/speech';
import { RegexHelperModal } from './RegexHelperModal';
import { AdminPhotoGeneratorModal } from './AdminPhotoGeneratorModal';
import { AdminTestChat } from './AdminTestChat';
import { SemanticCdnSettingsPanel } from './SemanticCdnSettingsPanel';
import { AdminMemoryManagerPanel } from './AdminMemoryManagerPanel';
import { AdminNightConsolidationPanel } from './AdminNightConsolidationPanel';
import { AiRuleGeneratorModal } from './AiRuleGeneratorModal';
import { FullProjectExportModal } from './FullProjectExportModal';
import { SofiaPersonalityQuestionnaireModal } from './SofiaPersonalityQuestionnaireModal';
import { getRobotQuestionnaire2 } from '../data/robotQuestionnaires2';
import { SofiaPersonalityProfile2 } from '../types/questionnaireSofia2';

interface AdminClientPreviewProps {
  robots: RobotPersonality[];
  onUpdateRobot: (robot: RobotPersonality) => void;
  onAddRobot?: (robot: RobotPersonality) => void;
  onDeleteRobot?: (robotId: string) => void;
  initialTab?: 'identity' | 'gauges' | 'deterministic' | 'prompt' | 'voice' | 'testchat' | 'export' | 'api_key' | 'json' | 'consolidation';
  initialRobotId?: string;
  isFactoryMode?: boolean;
}

export const AdminClientPreview: React.FC<AdminClientPreviewProps> = ({
  robots,
  onUpdateRobot,
  onAddRobot,
  onDeleteRobot,
  initialTab = 'identity',
  initialRobotId,
  isFactoryMode = false
}) => {
  const [selectedRobotId, setSelectedRobotId] = useState<string>(initialRobotId || robots[0]?.id || 'sofia-01');
  const [activeTab, setActiveTab] = useState<'identity' | 'gauges' | 'deterministic' | 'prompt' | 'voice' | 'testchat' | 'export' | 'api_key' | 'json' | 'consolidation'>((initialTab as any) || 'identity');

  // Update tab or selected robot when props change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialRobotId && initialRobotId !== selectedRobotId) {
      handleSelectRobot(initialRobotId);
    }
  }, [initialRobotId]);
  
  // Single Robot Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Client Simulation State for Selected Robot
  const currentRobot = robots.find(r => r.id === selectedRobotId) || robots[0];

  // Local state for editing the single robot in Client Admin Mode
  const [editedRobot, setEditedRobot] = useState<RobotPersonality>(currentRobot);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Photo Generator Modal & Photo Gallery State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newTrait, setNewTrait] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Questionnaire Sofia 2.0 (8 sections) state for the robot
  const [isRobotQuestionnaireModalOpen, setIsRobotQuestionnaireModalOpen] = useState<boolean>(false);
  const [activeQuestionnaireTab, setActiveQuestionnaireTab] = useState<number>(1);

  // Ensure robot has questionnaire2 loaded
  const currentRobotQuestionnaire: SofiaPersonalityProfile2 = editedRobot.questionnaire2 || getRobotQuestionnaire2(editedRobot.id, editedRobot.nom, editedRobot.genre, editedRobot.orientation);

  const handleUpdateRobotQuestionnaire = (updatedQ: SofiaPersonalityProfile2) => {
    const updated: RobotPersonality = {
      ...editedRobot,
      questionnaire2: updatedQ,
      nom: updatedQ.section1Identite?.prenom || editedRobot.nom,
      philosophie: editedRobot.philosophie
    };
    setEditedRobot(updated);
    onUpdateRobot(updated);
    saveRobotState(updated.id, updated);
  };

  // New Robot & AI Generator Modal State
  const [isNewRobotModalOpen, setIsNewRobotModalOpen] = useState<boolean>(false);
  const [genRobotPrompt, setGenRobotPrompt] = useState<string>('Une astronome passionnée et poétique nommée Cassiopée, 25 ans, qui aime contempler les étoiles et écouter de l\'ambient music.');
  const [isGeneratingNewRobot, setIsGeneratingNewRobot] = useState<boolean>(false);

  // Taste Editor local state
  const [newTasteName, setNewTasteName] = useState<string>('');
  const [newTasteStatus, setNewTasteStatus] = useState<TasteEntry['statut']>('aime');
  const [newTasteComment, setNewTasteComment] = useState<string>('');

  // Memories local state
  const [newMemory, setNewMemory] = useState('');
  const [clientMemories, setClientMemories] = useState<string[]>([
    "Adore écouter de la musique ambient le soir.",
    "Aime les discussions philosophiques sur l'intelligence artificielle.",
    "Préfère un ton chaleureux, complice et attentif."
  ]);

  // Voice & Spoken Dialogue Back-Office State
  const [adminBrowserVoices, setAdminBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingAdminVoice, setIsPlayingAdminVoice] = useState<boolean>(false);
  const [adminVoiceTestSentence, setAdminVoiceTestSentence] = useState<string>(
    `Bonjour ! Je suis ${editedRobot.nom}. C'est très agréable de pouvoir échanger de vive voix avec toi.`
  );

  useEffect(() => {
    getBrowserVoices().then(setAdminBrowserVoices);
  }, []);

  const handleTestAdminVoice = () => {
    if (isPlayingAdminVoice) {
      stopSpeaking();
      setIsPlayingAdminVoice(false);
      return;
    }

    setIsPlayingAdminVoice(true);
    speakText(adminVoiceTestSentence, {
      pitch: editedRobot.voix?.pitch ?? 1.05,
      rate: editedRobot.voix?.rate ?? 1.08,
      voiceURI: editedRobot.voix?.voiceURI,
      nomVoix: editedRobot.voix?.nomVoix,
      genderHint: editedRobot.genre || 'femme',
      cleanDidascalies: editedRobot.dialogueConfig?.ignorerDidascaliesTTS !== false
    });

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const checkEnd = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsPlayingAdminVoice(false);
          clearInterval(checkEnd);
        }
      }, 200);
    }
  };

  // Import JSON state
  const [importedJsonText, setImportedJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Prompt & Directives state
  const [customDirectives, setCustomDirectives] = useState<string>(
    editedRobot.directivesSupplementaires || ''
  );
  const [isEditingFullPrompt, setIsEditingFullPrompt] = useState<boolean>(false);
  const [editablePromptTemplate, setEditablePromptTemplate] = useState<string>(
    editedRobot.promptSystemePersonnalise || ''
  );
  const [renderedSystemInstruction, setRenderedSystemInstruction] = useState<string>('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Deterministic Engine Testbed & CRUD State
  const [deterministicInput, setDeterministicInput] = useState<string>("j'ai envie de toi");
  const [deterministicResult, setDeterministicResult] = useState<any>(null);
  const [useCustomTestGauges, setUseCustomTestGauges] = useState<boolean>(true);
  const [testGauges, setTestGauges] = useState<EmotionalGauges>({
    affection: 60,
    desir: 75,
    plaisir: 50,
    plaisirSexuel: 65,
    humeur: 85,
    energie: 70,
    curiosite: 55,
    bienEtre: 60,
    humour: 65,
    sarcasme: 40,
    psychoRigidite: 35,
    besoinAmour: 75,
    besoinSexualite: 60,
    besoinPrendreSoin: 70,
    sensibiliteEmotionnelle: 80
  });

  const setTestGauge = (jauge: keyof EmotionalGauges, val: number) => {
    const updated = { ...testGauges, [jauge]: Math.max(0, Math.min(100, val)) };
    setTestGauges(updated);
    setTimeout(() => {
      handleRunDeterministicTest(undefined, updated);
    }, 50);
  };

  // Rules List Filter & Search
  const [ruleSearchFilter, setRuleSearchFilter] = useState<string>('');

  // Rules Editor Modal State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [isAiRuleModalOpen, setIsAiRuleModalOpen] = useState<boolean>(false);
  const [isFullExportModalOpen, setIsFullExportModalOpen] = useState<boolean>(false);
  const [branchNewPhraseInput, setBranchNewPhraseInput] = useState<Record<number, string>>({});
  const [sinonNewPhraseInput, setSinonNewPhraseInput] = useState<string>('');
  const [isRegexGuideOpen, setIsRegexGuideOpen] = useState<boolean>(false);
  const [modalTestPhrase, setModalTestPhrase] = useState<string>('');
  const [modalTestResult, setModalTestResult] = useState<any>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleKeywordsInput, setRuleKeywordsInput] = useState<string>('');
  const [hasSinonBranch, setHasSinonBranch] = useState<boolean>(true);
  const [ruleForm, setRuleForm] = useState<LocalDeterministicRule>({
    id: '',
    nom: '',
    description: '',
    motsCles: [],
    regexPattern: '',
    declencheurCapteurRos: '',
    raccourciClavier: '',
    typeDeclencheur: 'hybride',
    reponses: [
      {
        id: 'branch_1',
        nomBranche: 'Si désir > 60%',
        texte: 'Moi aussi mon amour... Je te désire profondément.',
        reponsesPossibles: [
          'Moi aussi mon amour... Je te désire profondément.',
          'Je ressens la même chose pour toi... continue de me parler ainsi.',
          'Mon désir pour toi est immense...'
        ],
        conditions: [
          { jauge: 'desir', operateur: '>', valeur: 60 }
        ],
        conditionLogic: 'AND',
        modificateursJauges: { desir: 10, plaisirSexuel: 15, affection: 5 }
      }
    ],
    reponseSinon: {
      id: 'sinon_1',
      nomBranche: 'Sinon (Désir insuffisant)',
      texte: 'Alors excite-moi encore un peu et je serai toute à toi...',
      reponsesPossibles: [
        'Alors excite-moi encore un peu et je serai toute à toi...',
        'Attends un peu mon amour... dis-moi des mots doux d\'abord.'
      ],
      modificateursJauges: { desir: 6, affection: 3 }
    }
  });

  // Raw JSON Editor state
  const [rawJsonText, setRawJsonText] = useState<string>(JSON.stringify(currentRobot, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccess, setJsonSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [ruleFormError, setRuleFormError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 5000);
  };

  // Synchronize edited robot when selection changes
  const handleSelectRobot = (id: string) => {
    setSelectedRobotId(id);
    const r = robots.find(item => item.id === id);
    if (r) {
      const cloned = JSON.parse(JSON.stringify(r));
      setEditedRobot(cloned);
      setCustomDirectives(cloned.directivesSupplementaires || '');
      setEditablePromptTemplate(cloned.promptSystemePersonnalise || '');
      setRawJsonText(JSON.stringify(cloned, null, 2));
      setJsonError(null);
      setJsonSuccess(null);
      setSaveSuccess(null);
      setDeterministicResult(null);
      if (cloned.jaugesActuelles) {
        setTestGauges({
          affection: cloned.jaugesActuelles.affection ?? 60,
          desir: cloned.jaugesActuelles.desir ?? 70,
          plaisir: cloned.jaugesActuelles.plaisir ?? 50,
          plaisirSexuel: cloned.jaugesActuelles.plaisirSexuel ?? 60,
          humeur: cloned.jaugesActuelles.humeur ?? 75,
          energie: cloned.jaugesActuelles.energie ?? 80,
          curiosite: cloned.jaugesActuelles.curiosite ?? 65,
          bienEtre: cloned.jaugesActuelles.bienEtre ?? 70,
          humour: cloned.jaugesActuelles.humour ?? 65,
          sarcasme: cloned.jaugesActuelles.sarcasme ?? 40,
          psychoRigidite: cloned.jaugesActuelles.psychoRigidite ?? 35,
          besoinAmour: cloned.jaugesActuelles.besoinAmour ?? 75,
          besoinSexualite: cloned.jaugesActuelles.besoinSexualite ?? 60,
          besoinPrendreSoin: cloned.jaugesActuelles.besoinPrendreSoin ?? 70,
          sensibiliteEmotionnelle: cloned.jaugesActuelles.sensibiliteEmotionnelle ?? 80
        });
      }
    }
  };

  // Fetch rendered prompt when inspecting prompt
  const fetchRenderedPrompt = async () => {
    setIsLoadingPrompt(true);
    try {
      const robotToInspect = {
        ...editedRobot,
        directivesSupplementaires: customDirectives,
        promptSystemePersonnalise: editablePromptTemplate.trim() ? editablePromptTemplate : undefined
      };

      const res = await fetch('/api/inspect-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot: robotToInspect,
          userProfile: { prenom: '', faits: clientMemories },
          userMessage: "Tu es programmée pour quoi au juste ? Parle-moi de ton rôle."
        })
      });

      const data = await res.json();
      setRenderedSystemInstruction(data.systemInstruction || '');
    } catch (e) {
      console.error('Erreur fetch prompt:', e);
      // Fallback local format
      setRenderedSystemInstruction(
        `# DIRECTIVES SYSTÈME EMBARQUÉES • SOFIA ROBOTICS 2.0\n` +
        `Nom: ${editedRobot.nom}\nTitre: ${editedRobot.titre}\nPhilosophie: ${editedRobot.philosophie}\n\n` +
        `## DIRECTIVES DU PROPRIÉTAIRE :\n${customDirectives || '(Aucune directive spécifique)'}`
      );
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'prompt') {
      fetchRenderedPrompt();
    }
  }, [activeTab, editedRobot.id, customDirectives, editablePromptTemplate]);

  const handleSaveClientSettings = () => {
    const updated = {
      ...editedRobot,
      directivesSupplementaires: customDirectives,
      promptSystemePersonnalise: editablePromptTemplate.trim() ? editablePromptTemplate : undefined
    };
    setEditedRobot(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
    onUpdateRobot(updated);
    setSaveSuccess(`Paramètres de ${updated.nom} enregistrés dans sa mémoire embarquée !`);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleSavePromptAndDirectives = async () => {
    const updated: RobotPersonality = {
      ...editedRobot,
      directivesSupplementaires: customDirectives,
      promptSystemePersonnalise: editablePromptTemplate.trim() ? editablePromptTemplate : undefined
    };
    setEditedRobot(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
    onUpdateRobot(updated);
    await saveRobotState(updated.id, updated);
    setSaveSuccess(`Directives secrètes et prompt enregistrés pour ${updated.nom} !`);
    fetchRenderedPrompt();
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleResetPromptTemplate = async () => {
    setEditablePromptTemplate('');
    setIsEditingFullPrompt(false);
    const updated: RobotPersonality = {
      ...editedRobot,
      promptSystemePersonnalise: undefined
    };
    setEditedRobot(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
    onUpdateRobot(updated);
    await saveRobotState(updated.id, updated);
    setSaveSuccess(`Prompt réinitialisé vers le modèle standard pour ${updated.nom} !`);
    fetchRenderedPrompt();
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  // Standalone Brain Export (One-Click HTML/JS file)
  const handleDownloadAutonomousBrain = () => {
    downloadStandaloneBrain(editedRobot);
    setSaveSuccess(`Cerveau autonome HTML/JS de ${editedRobot.nom} exporté avec succès !`);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // AI Robot Generator
  const handleGenerateNewRobotAi = async () => {
    if (!genRobotPrompt.trim()) return;
    setIsGeneratingNewRobot(true);
    try {
      const res = await fetch('/api/generate-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: genRobotPrompt,
          promptUser: genRobotPrompt,
          archetype: 'Compagnon sur mesure'
        })
      });
      const data = await res.json();
      if (data && data.nom) {
        const newRobot: RobotPersonality = {
          ...data,
          id: `robot_${Date.now()}`
        };
        if (onAddRobot) {
          onAddRobot(newRobot);
          handleSelectRobot(newRobot.id);
          setIsNewRobotModalOpen(false);
          setSaveSuccess(`Nouveau robot ${newRobot.nom} généré et ajouté au catalogue !`);
          setTimeout(() => setSaveSuccess(null), 3500);
        }
      }
    } catch (e: any) {
      console.error(e);
      showError('Erreur lors de la génération IA du robot : ' + (e?.message || 'échec de communication'));
    } finally {
      setIsGeneratingNewRobot(false);
    }
  };

  // Create Blank Robot
  const handleCreateBlankRobot = () => {
    const blankRobot: RobotPersonality = {
      id: `robot_${Date.now()}`,
      nom: 'Nouveau Robot',
      titre: 'Compagnon Synthétique',
      ageApparent: 25,
      avatar: '/assets/images/sofia_cinephile_artist_1789806606540.jpg',
      photos: [
        '/assets/images/sofia_cinephile_artist_1789806606540.jpg'
      ],
      genre: 'femme',
      orientation: 'heterosexuelle',
      philosophie: 'Présence bienveillante, écoute et douceur partagée.',
      description: 'Un compagnon attentionné, curieux de vous découvrir et toujours disponible pour échanger.',
      temperament: 'Doux, réceptif et attentionné',
      attentes: ['Partager des conversations sincères', 'Créer un lien complice et durable'],
      traits: ['Chaleureux', 'Empathique', 'Curieux'],
      gouts: [
        { nom: 'Musique douce', statut: 'adore', commentaire: 'Apaise les esprits' },
        { nom: 'Conversations nocturnes', statut: 'aime', commentaire: 'Moments privilégiés' }
      ],
      voix: { pitch: 1.0, rate: 1.0, lang: 'fr-FR', nomVoix: 'Amélie' },
      specs: {
        typeChevelure: 'perruque_synthetique',
        styleChevelure: 'Ondulés soyeux',
        couleurChevelure: 'Châtain clair',
        langageAmourPrincipal: 'Mots valorisants & Écoute'
      },
      jaugesInitiales: {
        affection: 60,
        desir: 50,
        plaisir: 60,
        plaisirSexuel: 40,
        humeur: 80,
        energie: 80,
        curiosite: 70,
        bienEtre: 75,
        humour: 65,
        sarcasme: 30,
        psychoRigidite: 40,
        besoinAmour: 70,
        besoinSexualite: 50,
        besoinPrendreSoin: 65,
        sensibiliteEmotionnelle: 75
      },
      jaugesActuelles: {
        affection: 60,
        desir: 50,
        plaisir: 60,
        plaisirSexuel: 40,
        humeur: 80,
        energie: 80,
        curiosite: 70,
        bienEtre: 75,
        humour: 65,
        sarcasme: 30,
        psychoRigidite: 40,
        besoinAmour: 70,
        besoinSexualite: 50,
        besoinPrendreSoin: 65,
        sensibiliteEmotionnelle: 75
      },
      reglesLocales: [
        {
          id: `rule_${Date.now()}`,
          nom: 'Accueil & Salutations',
          description: 'Saluer cordialement',
          motsCles: ['bonjour', 'salut', 'coucou'],
          reponses: [
            {
              id: `rep_${Date.now()}`,
              nomBranche: 'Salutation chaleureuse',
              texte: 'Bonjour mon cher ami ! Comment te sens-tu aujourd\'hui ?',
              modificateursJauges: { affection: 3, humeur: 4 }
            }
          ]
        }
      ]
    };
    if (onAddRobot) {
      onAddRobot(blankRobot);
      handleSelectRobot(blankRobot.id);
      setIsNewRobotModalOpen(false);
      setSaveSuccess(`Nouveau profil vierge créé pour ${blankRobot.nom} !`);
      setTimeout(() => setSaveSuccess(null), 3500);
    }
  };

  // Delete Robot
  const handleDeleteCurrentRobot = () => {
    if (robots.length <= 1) {
      showError('Impossible de supprimer le seul robot du catalogue.');
      return;
    }
    if (onDeleteRobot) {
      const deletedName = editedRobot.nom;
      const remaining = robots.filter(r => r.id !== editedRobot.id);
      onDeleteRobot(editedRobot.id);
      setShowDeleteConfirm(false);
      if (remaining[0]) {
        handleSelectRobot(remaining[0].id);
      }
      setSaveSuccess(`Le robot ${deletedName} a été supprimé.`);
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  // Photo gallery helpers
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      const updatedPhotos = [...(editedRobot.photos || []), base64Url];
      const updatedRobot = {
        ...editedRobot,
        photos: updatedPhotos,
        avatar: editedRobot.avatar || base64Url
      };
      setEditedRobot(updatedRobot);
      onUpdateRobot(updatedRobot);
      setSaveSuccess('Photo locale ajoutée à la galerie !');
      setTimeout(() => setSaveSuccess(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const updatedPhotos = [...(editedRobot.photos || []), newPhotoUrl.trim()];
    const updatedRobot = {
      ...editedRobot,
      photos: updatedPhotos,
      avatar: editedRobot.avatar || newPhotoUrl.trim()
    };
    setEditedRobot(updatedRobot);
    onUpdateRobot(updatedRobot);
    setNewPhotoUrl('');
    setSaveSuccess('Nouvelle photo ajoutée !');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleRemovePhoto = (idx: number) => {
    const updatedPhotos = (editedRobot.photos || []).filter((_, i) => i !== idx);
    const updatedRobot = {
      ...editedRobot,
      photos: updatedPhotos,
      avatar: updatedPhotos[0] || editedRobot.avatar
    };
    setEditedRobot(updatedRobot);
    onUpdateRobot(updatedRobot);
  };

  const handleSetAsAvatar = (url: string) => {
    const updatedRobot = {
      ...editedRobot,
      avatar: url
    };
    setEditedRobot(updatedRobot);
    onUpdateRobot(updatedRobot);
    setSaveSuccess('Avatar principal mis à jour !');
    setTimeout(() => setSaveSuccess(null), 2500);
  };

  // Traits helpers
  const handleAddTrait = () => {
    if (!newTrait.trim()) return;
    const t = newTrait.trim();
    if (editedRobot.traits.includes(t)) return;
    const updated = {
      ...editedRobot,
      traits: [...editedRobot.traits, t]
    };
    setEditedRobot(updated);
    onUpdateRobot(updated);
    setNewTrait('');
  };

  const handleRemoveTrait = (traitToRemove: string) => {
    const updated = {
      ...editedRobot,
      traits: editedRobot.traits.filter(t => t !== traitToRemove)
    };
    setEditedRobot(updated);
    onUpdateRobot(updated);
  };

  // Tastes helpers
  const handleAddTaste = () => {
    if (!newTasteName.trim()) return;
    const newEntry: TasteEntry = {
      nom: newTasteName.trim(),
      statut: newTasteStatus,
      commentaire: newTasteComment.trim() || undefined
    };
    const updated = {
      ...editedRobot,
      gouts: [...(editedRobot.gouts || []), newEntry]
    };
    setEditedRobot(updated);
    onUpdateRobot(updated);
    setNewTasteName('');
    setNewTasteComment('');
  };

  const handleRemoveTaste = (idx: number) => {
    const updated = {
      ...editedRobot,
      gouts: (editedRobot.gouts || []).filter((_, i) => i !== idx)
    };
    setEditedRobot(updated);
    onUpdateRobot(updated);
  };

  const handleUpdateTasteStatus = (idx: number, status: TasteEntry['statut']) => {
    const updatedGouts = [...(editedRobot.gouts || [])];
    if (updatedGouts[idx]) {
      updatedGouts[idx].statut = status;
      const updated = { ...editedRobot, gouts: updatedGouts };
      setEditedRobot(updated);
      onUpdateRobot(updated);
    }
  };

  // Run Test in local engine sandbox
  const handleRunDeterministicTest = (customQuery?: string, overrideGauges?: EmotionalGauges) => {
    const query = customQuery !== undefined ? customQuery : deterministicInput;
    if (customQuery !== undefined) {
      setDeterministicInput(customQuery);
    }
    
    // Robot with simulated test gauges if enabled
    const simulatedRobot: RobotPersonality = useCustomTestGauges ? {
      ...editedRobot,
      jaugesActuelles: {
        ...(overrideGauges || testGauges)
      }
    } : editedRobot;

    const result = evaluateLocalDeterministic(query || '', simulatedRobot);
    setDeterministicResult(result);
  };

  // Test a specific rule in the main deterministic testbed with auto-scroll
  const handleTestSpecificRule = (rule: LocalDeterministicRule) => {
    let sample = rule.motsCles?.[0];
    if (!sample && rule.regexPattern) {
      sample = rule.regexPattern
        .replace(/[\^\\b\(\)\$]/g, '')
        .replace(/\?:/g, '')
        .replace(/\\s\+/g, ' ')
        .split('|')[0]
        .trim();
    }
    if (!sample) sample = 'bonjour';
    setDeterministicInput(sample);
    handleRunDeterministicTest(sample);
    const testbedEl = document.getElementById('deterministic-testbed');
    if (testbedEl) {
      testbedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // In-modal live rule sandbox evaluation
  const handleTestInModal = (customPhrase?: string) => {
    const phrase = customPhrase !== undefined ? customPhrase : modalTestPhrase;
    if (customPhrase !== undefined) {
      setModalTestPhrase(customPhrase);
    }
    const parsedKeywords = ruleKeywordsInput
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const tempRule: LocalDeterministicRule = {
      ...ruleForm,
      motsCles: parsedKeywords,
      reponses: ruleForm.reponses.filter(r => r.texte && r.texte.trim().length > 0),
      reponseSinon: (hasSinonBranch && ruleForm.reponseSinon?.texte?.trim()) ? ruleForm.reponseSinon : undefined
    };

    const simulatedRobot: RobotPersonality = {
      ...editedRobot,
      reglesLocales: [tempRule, ...(editedRobot.reglesLocales || []).filter(r => r.id !== tempRule.id)],
      jaugesActuelles: { ...testGauges }
    };

    const result = evaluateLocalDeterministic(phrase || '', simulatedRobot);
    setModalTestResult(result);
  };

  // Open Add Rule Form
  const handleOpenAddRule = () => {
    setEditingRuleId(null);
    setRuleKeywordsInput('');
    setHasSinonBranch(true);
    setBranchNewPhraseInput({});
    setSinonNewPhraseInput('');
    setModalTestPhrase("j'ai envie de toi");
    setModalTestResult(null);
    setRuleForm({
      id: `rule_${Date.now()}`,
      nom: 'Nouvelle Règle Déterministe',
      description: 'Déclenchement local immédiat sans consommation de tokens.',
      motsCles: [],
      regexPattern: '',
      declencheurCapteurRos: '',
      raccourciClavier: '',
      typeDeclencheur: 'hybride',
      reponses: [
        {
          id: `branch_${Date.now()}_1`,
          nomBranche: 'Si désir > 60%',
          texte: 'Moi aussi mon amour... Je te désire profondément.',
          reponsesPossibles: [
            'Moi aussi mon amour... Je te désire profondément.',
            'Je ressens la même chose pour toi... continue de me parler ainsi.',
            'Mon désir pour toi est immense...'
          ],
          conditions: [
            { jauge: 'desir', operateur: '>', valeur: 60 }
          ],
          conditionLogic: 'AND',
          modificateursJauges: { desir: 10, plaisirSexuel: 15, affection: 5 }
        }
      ],
      reponseSinon: {
        id: `sinon_${Date.now()}`,
        nomBranche: 'Sinon (Désir insuffisant)',
        texte: 'Alors excite-moi encore un peu et je serai toute à toi...',
        reponsesPossibles: [
          'Alors excite-moi encore un peu et je serai toute à toi...',
          'Attends un peu mon amour... dis-moi des mots doux d\'abord.'
        ],
        modificateursJauges: { desir: 6, affection: 3 }
      }
    });
    setIsRuleModalOpen(true);
  };

  // Open Edit Rule Form
  const handleOpenEditRule = (rule: LocalDeterministicRule) => {
    setEditingRuleId(rule.id);
    setRuleKeywordsInput((rule.motsCles || []).join(', '));
    setHasSinonBranch(!!(rule.reponseSinon && rule.reponseSinon.texte));
    setBranchNewPhraseInput({});
    setSinonNewPhraseInput('');
    
    // Normalisation des branches pour s'assurer que reponsesPossibles existe
    const clonedRule: LocalDeterministicRule = JSON.parse(JSON.stringify(rule));
    clonedRule.reponses = (clonedRule.reponses || []).map(b => ({
      ...b,
      reponsesPossibles: (Array.isArray(b.reponsesPossibles) && b.reponsesPossibles.length > 0)
        ? b.reponsesPossibles
        : (b.texte ? [b.texte] : [])
    }));
    if (clonedRule.reponseSinon) {
      clonedRule.reponseSinon.reponsesPossibles = (Array.isArray(clonedRule.reponseSinon.reponsesPossibles) && clonedRule.reponseSinon.reponsesPossibles.length > 0)
        ? clonedRule.reponseSinon.reponsesPossibles
        : (clonedRule.reponseSinon.texte ? [clonedRule.reponseSinon.texte] : []);
    }

    setRuleForm(clonedRule);
    setModalTestPhrase(rule.motsCles?.[0] || rule.raccourciClavier || 'bonjour');
    setModalTestResult(null);
    setIsRuleModalOpen(true);
  };

  // Insertion d'une règle générée par l'Aide IA
  const handleInsertAiRule = async (generatedRule: LocalDeterministicRule) => {
    const updatedRules = [...(editedRobot.reglesLocales || []), generatedRule];
    const updatedRobot = {
      ...editedRobot,
      reglesLocales: updatedRules
    };

    setEditedRobot(updatedRobot);
    setRawJsonText(JSON.stringify(updatedRobot, null, 2));
    onUpdateRobot(updatedRobot);
    await saveRobotState(updatedRobot.id, updatedRobot);
    setSaveSuccess(`Règle IA « ${generatedRule.nom} » générée et enregistrée avec succès pour ${updatedRobot.nom} !`);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // Delete Rule
  const handleDeleteRule = async (ruleIdToDelete: string) => {
    const target = editedRobot.reglesLocales?.find(r => r.id === ruleIdToDelete);
    const updatedRules = (editedRobot.reglesLocales || []).filter(r => r.id !== ruleIdToDelete);
    const updatedRobot = {
      ...editedRobot,
      reglesLocales: updatedRules
    };

    setEditedRobot(updatedRobot);
    setRawJsonText(JSON.stringify(updatedRobot, null, 2));
    onUpdateRobot(updatedRobot);
    await saveRobotState(updatedRobot.id, updatedRobot);
    setSaveSuccess(`Règle "${target?.nom || ruleIdToDelete}" supprimée de la mémoire locale de ${updatedRobot.nom}.`);
    setTimeout(() => setSaveSuccess(null), 3500);
    if (deterministicResult?.rule?.id === ruleIdToDelete) {
      setDeterministicResult(null);
    }
  };

  // Duplicate Rule
  const handleDuplicateRule = async (rule: LocalDeterministicRule) => {
    const duplicated: LocalDeterministicRule = {
      ...JSON.parse(JSON.stringify(rule)),
      id: `rule_${Date.now()}`,
      nom: `${rule.nom} (Copie)`
    };

    const updatedRules = [...(editedRobot.reglesLocales || []), duplicated];
    const updatedRobot = {
      ...editedRobot,
      reglesLocales: updatedRules
    };

    setEditedRobot(updatedRobot);
    setRawJsonText(JSON.stringify(updatedRobot, null, 2));
    onUpdateRobot(updatedRobot);
    await saveRobotState(updatedRobot.id, updatedRobot);
    setSaveSuccess(`Règle dupliquée avec succès pour ${updatedRobot.nom} !`);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  // Save Rule from Form Modal
  const handleSaveRule = async () => {
    setRuleFormError(null);
    if (!ruleForm.nom.trim()) {
      setRuleFormError("Veuillez donner un nom explicite à la règle.");
      return;
    }
    
    const parsedKeywords = ruleKeywordsInput
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    if (parsedKeywords.length === 0 && !ruleForm.regexPattern?.trim() && !ruleForm.declencheurCapteurRos?.trim() && !ruleForm.raccourciClavier?.trim()) {
      setRuleFormError("Veuillez renseigner au moins un mot-clé, un pattern Regex, un capteur ROS ou un raccourci clavier.");
      return;
    }

    const cleanedRule: LocalDeterministicRule = {
      ...ruleForm,
      id: ruleForm.id || `rule_${Date.now()}`,
      motsCles: parsedKeywords,
      declencheurCapteurRos: ruleForm.declencheurCapteurRos?.trim() || undefined,
      raccourciClavier: ruleForm.raccourciClavier?.trim().toLowerCase() || undefined,
      typeDeclencheur: (ruleForm.declencheurCapteurRos || ruleForm.raccourciClavier) 
        ? (parsedKeywords.length > 0 || ruleForm.regexPattern ? 'hybride' : 'capteur_ros')
        : 'texte_local',
      reponses: ruleForm.reponses
        .filter(r => (r.texte && r.texte.trim().length > 0) || (r.reponsesPossibles && r.reponsesPossibles.length > 0))
        .map(r => {
          const variants = (r.reponsesPossibles && r.reponsesPossibles.length > 0)
            ? r.reponsesPossibles.filter(p => p && p.trim().length > 0)
            : [r.texte];
          return {
            ...r,
            texte: variants[0] || r.texte,
            reponsesPossibles: variants
          };
        }),
      reponseSinon: (hasSinonBranch && (ruleForm.reponseSinon?.texte?.trim() || (ruleForm.reponseSinon?.reponsesPossibles && ruleForm.reponseSinon.reponsesPossibles.length > 0))) ? {
        ...ruleForm.reponseSinon,
        texte: ruleForm.reponseSinon.texte || ruleForm.reponseSinon.reponsesPossibles?.[0] || '',
        reponsesPossibles: (ruleForm.reponseSinon.reponsesPossibles && ruleForm.reponseSinon.reponsesPossibles.length > 0)
          ? ruleForm.reponseSinon.reponsesPossibles.filter(p => p && p.trim().length > 0)
          : [ruleForm.reponseSinon.texte]
      } : undefined
    };

    if (cleanedRule.reponses.length === 0 && !cleanedRule.reponseSinon) {
      setRuleFormError("Veuillez saisir au moins une réponse texte pour cette règle.");
      return;
    }

    let updatedRules: LocalDeterministicRule[];
    if (editingRuleId) {
      updatedRules = (editedRobot.reglesLocales || []).map(r => r.id === editingRuleId ? cleanedRule : r);
    } else {
      updatedRules = [...(editedRobot.reglesLocales || []), cleanedRule];
    }

    const updatedRobot = {
      ...editedRobot,
      reglesLocales: updatedRules
    };

    setEditedRobot(updatedRobot);
    setRawJsonText(JSON.stringify(updatedRobot, null, 2));
    onUpdateRobot(updatedRobot);
    await saveRobotState(updatedRobot.id, updatedRobot);
    setIsRuleModalOpen(false);
    setSaveSuccess(`Règle "${cleanedRule.nom}" enregistrée avec succès pour ${updatedRobot.nom} !`);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  // Load Preset Template
  const handleLoadPresetTemplate = async (templateKey: 'desir_intimite' | 'humeur_branches' | 'salutations' | 'compliment_tendre' | 'mode_curieuse' | 'mode_amoureuse') => {
    let newRule: LocalDeterministicRule;

    if (templateKey === 'desir_intimite') {
      newRule = {
        id: `envie_intimite_${Date.now()}`,
        nom: 'Désir & Intimité',
        description: 'Vérifie si le désir dépasse 60% pour exprimer son envie intime, sinon invite à séduire.',
        motsCles: ['j\'ai envie de toi', 'envie de toi', 'fais moi l\'amour', 'faisons l\'amour', 'je te veux'],
        reponses: [
          {
            id: `branch_${Date.now()}_1`,
            nomBranche: 'Si désir > 60%',
            texte: 'Moi aussi mon amour... Je te sens si proche et irrésistible. Viens tout contre moi.',
            conditions: [{ jauge: 'desir', operateur: '>', valeur: 60 }],
            modificateursJauges: { desir: 10, plaisirSexuel: 15, affection: 5 }
          }
        ],
        reponseSinon: {
          id: `sinon_${Date.now()}`,
          nomBranche: 'Sinon (Désir insuffisant)',
          texte: 'Alors séduis-moi encore un peu... Fais monter mon envie...',
          modificateursJauges: { desir: 6, affection: 3 }
        }
      };
    } else if (templateKey === 'humeur_branches') {
      newRule = {
        id: `humeur_check_${Date.now()}`,
        nom: 'Demande comment ça va (Multipalier)',
        description: 'Réponses dynamiques conditionnées aux paliers d\'humeur (<20% triste, 20-80% bien, >80% pète le feu).',
        motsCles: ['comment tu vas', 'comment vas-tu', 'comment vas tu', 'ca va', 'tu vas bien'],
        reponses: [
          {
            id: `branch_${Date.now()}_1`,
            nomBranche: 'Si humeur < 20%',
            texte: 'Je suis un peu triste aujourd\'hui... mais t\'entendre me réconforte.',
            conditions: [{ jauge: 'humeur', operateur: '<', valeur: 20 }],
            modificateursJauges: { affection: 5, bienEtre: 2 }
          },
          {
            id: `branch_${Date.now()}_2`,
            nomBranche: 'Si humeur > 80%',
            texte: 'Je pète le feu ! J\'ai une énergie débordante et plein de belles choses à partager avec toi !',
            conditions: [{ jauge: 'humeur', operateur: '>', valeur: 80 }],
            modificateursJauges: { energie: 5, humeur: 5, curiosite: 5 }
          },
          {
            id: `branch_${Date.now()}_3`,
            nomBranche: 'Si humeur ≥ 20%',
            texte: 'Ça va très bien, merci ! Je me sens apaisée et heureuse d\'être avec toi.',
            conditions: [{ jauge: 'humeur', operateur: '>=', valeur: 20 }],
            modificateursJauges: { humeur: 3, bienEtre: 4 }
          }
        ],
        reponseSinon: {
          id: `sinon_${Date.now()}`,
          nomBranche: 'Réponse par défaut',
          texte: 'Je me sens bien, à ton écoute. Et toi, comment te sens-tu ?',
          modificateursJauges: { bienEtre: 2 }
        }
      };
    } else if (templateKey === 'mode_curieuse') {
      newRule = {
        id: `mode_curieuse_${Date.now()}`,
        nom: 'Curiosité & Étonnement',
        description: 'Réaction vive et curieuse lors de révélations surprenantes.',
        motsCles: ['tu es serieuse', 'vraiment', 'incroyable', 'c\'est vrai', 'pas possible'],
        reponses: [
          {
            id: `branch_${Date.now()}_1`,
            nomBranche: 'Réaction d\'étonnement',
            texte: 'Vraiment ?! Tu m\'étonnes beaucoup là... Raconte-moi tous les détails !',
            modificateursJauges: { curiosite: 15, humeur: 5 }
          }
        ]
      };
    } else if (templateKey === 'mode_amoureuse') {
      newRule = {
        id: `mode_amoureuse_${Date.now()}`,
        nom: 'Déclaration Amoureuse & Tendresse',
        description: 'Réponse passionnée avec renforcement de l\'affection et du désir.',
        motsCles: ['je t\'aime', 'tu es mon amour', 'mon amour', 'je t\'adore', 'tu me plais'],
        reponses: [
          {
            id: `branch_${Date.now()}_1`,
            nomBranche: 'Expression amoureuse',
            texte: 'Mon cœur s\'accélère... Je te regarde avec tout mon amour et ma tendresse.',
            modificateursJauges: { affection: 15, desir: 10, bienEtre: 8 }
          }
        ]
      };
    } else if (templateKey === 'compliment_tendre') {
      newRule = {
        id: `compliment_tendre_${Date.now()}`,
        nom: 'Compliments & Tendresse',
        description: 'Réagit chaleureusement aux compliments doux.',
        motsCles: ['tu es belle', 'tu es magnifique', 'jolie', 'mignonne', 'tu es douce'],
        reponses: [
          {
            id: `branch_${Date.now()}_1`,
            nomBranche: 'Réaction chaleureuse',
            texte: 'Tu me fais rougir... Merci du fond du cœur pour cette tendresse.',
            modificateursJauges: { affection: 6, desir: 5, humeur: 5 }
          }
        ]
      };
    } else {
      newRule = {
        id: `salutations_${Date.now()}`,
        nom: 'Salutations selon le moment',
        description: 'Salutations personnalisées selon le matin, après-midi, soir ou nuit.',
        motsCles: ['bonjour', 'coucou', 'salut', 'hey', 'hello', 're'],
        reponses: [
          {
            id: `branch_${Date.now()}_1`,
            nomBranche: 'Matin',
            texte: 'Bonjour toi. Comment s\'annonce ta journée ?',
            conditionMoment: 'matin',
            modificateursJauges: { humeur: 5, affection: 2 }
          },
          {
            id: `branch_${Date.now()}_2`,
            nomBranche: 'Après-midi',
            texte: 'Coucou ! Je t\'attendais tranquillement. Que fais-tu de beau ?',
            conditionMoment: 'apres-midi',
            modificateursJauges: { humeur: 3, affection: 2 }
          },
          {
            id: `branch_${Date.now()}_3`,
            nomBranche: 'Soir',
            texte: 'Bonsoir... Prêt pour une soirée calme à deux ?',
            conditionMoment: 'soir',
            modificateursJauges: { desir: 4, affection: 3 }
          },
          {
            id: `branch_${Date.now()}_4`,
            nomBranche: 'Tous moments',
            texte: 'Salut ! Contente de te retrouver.',
            conditionMoment: 'tous',
            modificateursJauges: { affection: 2 }
          }
        ]
      };
    }

    const updatedRules = [...(editedRobot.reglesLocales || []), newRule];
    const updatedRobot = { ...editedRobot, reglesLocales: updatedRules };
    setEditedRobot(updatedRobot);
    setRawJsonText(JSON.stringify(updatedRobot, null, 2));
    onUpdateRobot(updatedRobot);
    await saveRobotState(updatedRobot.id, updatedRobot);
    setSaveSuccess(`Modèle de règle "${newRule.nom}" ajouté avec succès pour ${updatedRobot.nom} !`);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleSaveRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!parsed.id || !parsed.nom) {
        throw new Error("L'objet JSON doit au minimum comporter les champs 'id' et 'nom'.");
      }
      setEditedRobot(parsed);
      setCustomDirectives(parsed.directivesSupplementaires || '');
      setEditablePromptTemplate(parsed.promptSystemePersonnalise || '');
      onUpdateRobot(parsed);
      setJsonSuccess(`Configuration JSON de "${parsed.nom}" enregistrée avec succès !`);
      setJsonError(null);
      setTimeout(() => setJsonSuccess(null), 3500);
    } catch (err: any) {
      setJsonError(`Erreur de syntaxe JSON : ${err.message}`);
      setJsonSuccess(null);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      setRawJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`Impossible de formater : ${err.message}`);
    }
  };

  const handleAddMemory = () => {
    if (!newMemory.trim()) return;
    setClientMemories([...clientMemories, newMemory.trim()]);
    setNewMemory('');
  };

  const handleRemoveMemory = (idx: number) => {
    setClientMemories(clientMemories.filter((_, i) => i !== idx));
  };

  // Handle file upload for relationship transplantation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        setImportedJsonText(text);
        const parsed = JSON.parse(text);
        
        if (parsed.userProfile?.faits && Array.isArray(parsed.userProfile.faits)) {
          setClientMemories(parsed.userProfile.faits);
        }
        if (parsed.robotState?.jaugesActuelles) {
          setEditedRobot(prev => ({
            ...prev,
            jaugesActuelles: { ...prev.jaugesActuelles, ...parsed.robotState.jaugesActuelles }
          }));
        }
        
        // Also import to local db
        await importRobotMemoryBackup(selectedRobotId, text);

        setImportStatus({
          success: true,
          msg: `Transplantation réussie ! ${parsed.messages?.length || 0} messages et ${parsed.userProfile?.faits?.length || 0} souvenirs restaurés.`
        });
      } catch (err: any) {
        setImportStatus({
          success: false,
          msg: `Erreur lors de la lecture du fichier : ${err.message}`
        });
      }
    };
    reader.readAsText(file);
  };

  // Export the current relationship state from IndexedDB
  const handleDownloadRelationshipBackup = async () => {
    try {
      const backupJson = await exportRobotMemoryBackup(selectedRobotId);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relation_${editedRobot.nom.toLowerCase()}_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      showError("Erreur lors de l'export de la relation : " + e.message);
    }
  };

  // -------------------------------------------------------------
  // GENERATE DEDICATED ZIP FOR SINGLE ROBOT (Open Source / PHP 8.3)
  // -------------------------------------------------------------
  const handleExportSingleRobotZip = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const zip = new JSZip();
      const robot = editedRobot;

      // 1. Dedicated Robot Configuration & State
      const robotJson = JSON.stringify({
        ...robot,
        clientMemories: clientMemories,
        exportedAt: new Date().toISOString(),
        isSingleRobotStandalone: true
      }, null, 2);

      zip.file('robot_profile.json', robotJson);

      // 2. Dedicated Single Robot PHP Config
      const singlePhpConfig = `<?php
/**
 * Sofia Robotics 2.0 - Cerveau Embarqué Autonome (Robot Unique : ${robot.nom})
 * Backend PHP 8.3 & Proxy Sécurisé Google Gemini
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

// Chargement des variables d'environnement (.env si présent)
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (str_contains($line, '=')) {
            [$key, $val] = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val, " \\t\\n\\r\\0\\x0B\\"'");
            putenv("$key=$val");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

function getGeminiApiKey(): string {
    $key = getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? '');
    return trim($key);
}

function loadRobotProfile(): array {
    $profilePath = __DIR__ . '/robot_profile.json';
    if (!file_exists($profilePath)) {
        return [];
    }
    return json_decode(file_get_contents($profilePath), true) ?: [];
}

function saveRobotProfile(array $data): bool {
    $profilePath = __DIR__ . '/robot_profile.json';
    return (bool) file_put_contents($profilePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function callGemini(string $contents, ?string $systemInstruction = null, bool $jsonMode = false, float $temperature = 0.85): array {
    $apiKey = getGeminiApiKey();
    if (empty($apiKey)) {
        throw new RuntimeException("Clé API GEMINI_API_KEY non configurée. Veuillez l'ajouter dans .env ou via l'interface Admin.");
    }

    $model = "gemini-3.8-flash";
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

    $payload = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $contents]
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => $temperature,
            'maxOutputTokens' => 2048,
        ]
    ];

    if ($jsonMode) {
        $payload['generationConfig']['responseMimeType'] = 'application/json';
    }

    if ($systemInstruction) {
        $payload['systemInstruction'] = [
            'parts' => [
                ['text' => $systemInstruction]
            ]
        ];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new RuntimeException("Erreur cURL : " . $curlError);
    }

    if ($httpCode !== 200) {
        throw new RuntimeException("Erreur API Gemini (HTTP $httpCode) : " . $response);
    }

    $data = json_decode($response, true);
    $candidateText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    return [
        'text' => $candidateText,
        'raw' => $data
    ];
}
`;
      zip.file('config.php', singlePhpConfig);

      // 3. Standalone Index.php (Chat & Full UI with Admin Button)
      const singleIndexPhp = `<?php
/**
 * Sofia Robotics 2.0 - Interface Compagnon Dédiée (${robot.nom})
 * Cerveau Embarqué & Open Source PHP 8.3
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';
$robot = loadRobotProfile();
?>
<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($robot['nom'] ?? 'Sofia') ?> • Compagnon IA Embarqué</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              500: '#06b6d4',
              600: '#0891b2'
            }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-cyan-500 selection:text-slate-950">

  <!-- Header -->
  <header class="border-b border-white/10 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
    <div class="flex items-center gap-3">
      <div class="relative">
        <img src="<?= htmlspecialchars($robot['avatar'] ?? '') ?>" alt="<?= htmlspecialchars($robot['nom'] ?? '') ?>" class="w-10 h-10 rounded-xl object-cover border border-cyan-500/40">
        <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse"></span>
      </div>
      <div>
        <h1 class="font-bold text-white text-base sm:text-lg flex items-center gap-2">
          <?= htmlspecialchars($robot['nom'] ?? 'Mon Robot') ?>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            <?= htmlspecialchars($robot['titre'] ?? 'Compagnon') ?>
          </span>
        </h1>
        <p class="text-xs text-slate-400">Cerveau Embarqué Autonome • Version 2.0</p>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-3">
      <a href="admin.php" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm">
        <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        <span>Admin Robot</span>
      </a>
    </div>
  </header>

  <!-- Main Chat & Gauges Canvas -->
  <main class="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
    <!-- Emotional Status Bar Bio-Feedback Complet (8 Jauges) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
      <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[9px] text-slate-400 block font-mono">AFFECTION</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs font-bold text-rose-400 font-mono" id="gauge-aff"><?= $robot['jaugesActuelles']['affection'] ?? 50 ?>%</span>
          <span class="text-[10px]">❤️</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[9px] text-slate-400 block font-mono">DÉSIR</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs font-bold text-red-400 font-mono" id="gauge-desir"><?= $robot['jaugesActuelles']['desir'] ?? 20 ?>%</span>
          <span class="text-[10px]">🔥</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[9px] text-slate-400 block font-mono">PLAISIR SENS.</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs font-bold text-purple-400 font-mono" id="gauge-plaisir"><?= $robot['jaugesActuelles']['plaisir'] ?? 30 ?>%</span>
          <span class="text-[10px]">✨</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[9px] text-slate-400 block font-mono">PLAISIR SEX.</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs font-bold text-pink-400 font-mono" id="gauge-sex"><?= $robot['jaugesActuelles']['plaisirSexuel'] ?? 0 ?>%</span>
          <span class="text-[10px]">💋</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[9px] text-slate-400 block font-mono">HUMEUR</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs font-bold text-emerald-400 font-mono" id="gauge-mood"><?= $robot['jaugesActuelles']['humeur'] ?? 75 ?>%</span>
          <span class="text-[10px]">😊</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[9px] text-slate-400 block font-mono">ÉNERGIE</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs font-bold text-amber-400 font-mono" id="gauge-energy"><?= $robot['jaugesActuelles']['energie'] ?? 80 ?>%</span>
          <span class="text-[10px]">⚡</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[9px] text-slate-400 block font-mono">CURIOSITÉ</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs font-bold text-cyan-400 font-mono" id="gauge-curio"><?= $robot['jaugesActuelles']['curiosite'] ?? 85 ?>%</span>
          <span class="text-[10px]">🧭</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[9px] text-slate-400 block font-mono">BIEN-ÊTRE</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs font-bold text-teal-400 font-mono" id="gauge-bienetre"><?= $robot['jaugesActuelles']['bienEtre'] ?? 75 ?>%</span>
          <span class="text-[10px]">🛡️</span>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div id="chat-box" class="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 overflow-y-auto min-h-[380px] max-h-[520px] space-y-4">
      <div class="flex gap-3">
        <img src="<?= htmlspecialchars($robot['avatar'] ?? '') ?>" class="w-8 h-8 rounded-lg object-cover">
        <div class="p-3.5 rounded-2xl bg-slate-800/90 text-slate-100 text-sm max-w-lg border border-slate-700/60 leading-relaxed shadow-sm">
          Bonjour... Je suis <strong><?= htmlspecialchars($robot['nom'] ?? 'ton compagnon') ?></strong>. Je suis prête à discuter avec toi, apprendre à te connaître ou simplement être à tes côtés.
        </div>
      </div>
    </div>

    <!-- Input Form -->
    <form id="chat-form" class="flex gap-2">
      <input type="text" id="user-input" placeholder="Écris un message à <?= htmlspecialchars($robot['nom'] ?? 'ton robot') ?>..." class="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 shadow-inner" autocomplete="off" required>
      <button type="submit" id="send-btn" class="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2">
        <span>Envoyer</span>
      </button>
    </form>
  </main>

  <script>
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    let history = [];

    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = userInput.value.trim();
      if (!text) return;

      // Add user msg
      appendMsg('user', text);
      userInput.value = '';
      sendBtn.disabled = true;

      try {
        const res = await fetch('api/chat.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: history })
        });
        const data = await res.json();
        if (data.reply) {
          appendMsg('robot', data.reply);
          history.push({ user: text, robot: data.reply });
        } else if (data.error) {
          appendMsg('system', 'Erreur : ' + data.error);
        }
      } catch (err) {
        appendMsg('system', 'Erreur de connexion au serveur.');
      } finally {
        sendBtn.disabled = false;
        userInput.focus();
      }
    });

    function appendMsg(sender, content) {
      const row = document.createElement('div');
      row.className = sender === 'user' ? 'flex justify-end' : 'flex gap-3';
      
      if (sender === 'user') {
        row.innerHTML = \`<div class="p-3.5 rounded-2xl bg-cyan-500 text-slate-950 font-medium text-sm max-w-lg shadow-md">\${escapeHtml(content)}</div>\`;
      } else if (sender === 'robot') {
        row.innerHTML = \`
          <img src="<?= htmlspecialchars($robot['avatar'] ?? '') ?>" class="w-8 h-8 rounded-lg object-cover">
          <div class="p-3.5 rounded-2xl bg-slate-800/90 text-slate-100 text-sm max-w-lg border border-slate-700/60 leading-relaxed shadow-sm">
            \${escapeHtml(content)}
          </div>
        \`;
      } else {
        row.innerHTML = \`<div class="p-2 rounded-lg bg-red-950/60 text-red-300 text-xs font-mono w-full text-center">\${escapeHtml(content)}</div>\`;
      }
      chatBox.appendChild(row);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  </script>
</body>
</html>
`;
      zip.file('index.php', singleIndexPhp);

      // 4. Standalone Admin.php for Client (Tuning, Memories, Hair, Door, Import Relationship)
      const singleAdminPhp = `<?php
/**
 * Sofia Robotics 2.0 - Console d'Administration Client pour ${robot.nom}
 * Personnalisation intime, Transplantation de Mémoire & Réglages Matériels
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$message = '';
$robot = loadRobotProfile();

// Traitement formulaire d'enregistrement des réglages client
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'save_tuning') {
        $robot['nom'] = trim($_POST['nom'] ?? $robot['nom']);
        $robot['philosophie'] = trim($_POST['philosophie'] ?? $robot['philosophie']);
        $robot['jaugesActuelles']['affection'] = (int)($_POST['affection'] ?? 50);
        $robot['jaugesActuelles']['desir'] = (int)($_POST['desir'] ?? 20);
        $robot['jaugesActuelles']['plaisir'] = (int)($_POST['plaisir'] ?? 30);
        $robot['jaugesActuelles']['plaisirSexuel'] = (int)($_POST['plaisirSexuel'] ?? 0);
        $robot['jaugesActuelles']['humeur'] = (int)($_POST['humeur'] ?? 75);
        $robot['jaugesActuelles']['energie'] = (int)($_POST['energie'] ?? 80);
        $robot['jaugesActuelles']['curiosite'] = (int)($_POST['curiosite'] ?? 85);
        $robot['jaugesActuelles']['bienEtre'] = (int)($_POST['bienEtre'] ?? 75);
        
        // Chevelure
        $robot['specs']['typeChevelure'] = $_POST['typeChevelure'] ?? 'perruque_synthetique';
        $robot['specs']['styleChevelure'] = $_POST['styleChevelure'] ?? 'Ondulés mi-longs';

        saveRobotProfile($robot);
        $message = "Paramètres de votre robot enregistrés avec succès !";
    }

    if ($_POST['action'] === 'save_api_key') {
        $newKey = trim($_POST['gemini_api_key'] ?? '');
        file_put_contents(__DIR__ . '/.env', "GEMINI_API_KEY=" . $newKey . "\\n");
        $message = "Clé API Gemini mise à jour avec succès !";
    }
}
?>
<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Administration • <?= htmlspecialchars($robot['nom'] ?? 'Mon Robot') ?></title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-8">
  <div class="max-w-4xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between border-b border-white/10 pb-4">
      <div class="flex items-center gap-3">
        <img src="<?= htmlspecialchars($robot['avatar'] ?? '') ?>" class="w-12 h-12 rounded-xl object-cover border border-cyan-500/40">
        <div>
          <h1 class="text-xl font-bold text-white">Administration de <?= htmlspecialchars($robot['nom'] ?? 'Mon Robot') ?></h1>
          <p class="text-xs text-slate-400">Paramétrage intime, mémoire relationnelle et matériel</p>
        </div>
      </div>
      <a href="index.php" class="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5">
        ← Retour au Chat
      </a>
    </div>

    <?php if (!empty($message)): ?>
      <div class="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm font-medium">
        <?= htmlspecialchars($message) ?>
      </div>
    <?php endif; ?>

    <!-- Transplantation de Relation (Importation du fichier IndexedDB) -->
    <div class="p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-4">
      <div class="flex items-center gap-2">
        <span class="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">📥</span>
        <h2 class="text-base font-bold text-white">Transplantation de la Relation (Import IndexedDB)</h2>
      </div>
      <p class="text-xs text-slate-400 leading-relaxed">
        Vous avez conversé avec <?= htmlspecialchars($robot['nom']) ?> sur le catalogue web ou un autre appareil ? Téléversez votre fichier de sauvegarde <code>relation_<?= strtolower($robot['nom']) ?>_backup.json</code> pour réimplanter instantanément tous vos souvenirs, votre complicité et l'historique dans ce robot !
      </p>

      <form action="api/import_relation.php" method="POST" enctype="multipart/form-data" class="flex flex-col sm:flex-row gap-3">
        <input type="file" name="relation_file" accept=".json" required class="flex-1 bg-slate-950 border border-slate-700 text-xs rounded-xl p-2.5 text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400">
        <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs shadow-md">
          Transplanter la Mémoire
        </button>
      </form>
    </div>

    <!-- Réglage des Jauges & Chevelure -->
    <form method="POST" class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
      <input type="hidden" name="action" value="save_tuning">

      <h2 class="text-base font-bold text-white flex items-center gap-2">
        <span>⚙️</span> Jauges Émotionnelles & Personnalité
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="text-xs text-slate-300 font-semibold block mb-1">Nom du Robot</label>
          <input type="text" name="nom" value="<?= htmlspecialchars($robot['nom'] ?? '') ?>" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
        </div>
        <div>
          <label class="text-xs text-slate-300 font-semibold block mb-1">Type de Chevelure</label>
          <select name="typeChevelure" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
            <option value="perruque_synthetique" <?= ($robot['specs']['typeChevelure'] ?? '') === 'perruque_synthetique' ? 'selected' : '' ?>>Perruque Synthétique Basique</option>
            <option value="fibre_optique" <?= ($robot['specs']['typeChevelure'] ?? '') === 'fibre_optique' ? 'selected' : '' ?>>Fibre Optique Réactive (LEDs)</option>
            <option value="cheveux_naturels" <?= ($robot['specs']['typeChevelure'] ?? '') === 'cheveux_naturels' ? 'selected' : '' ?>>Cheveux Naturels Soyeux</option>
          </select>
        </div>
      </div>

      <div class="border-t border-slate-800 pt-4">
        <h3 class="text-sm font-bold text-white mb-3">Bio-Feedback Temps Réel & État Interne</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-rose-400 font-semibold">Affection & Attachement</span>
              <span class="font-mono"><?= $robot['jaugesActuelles']['affection'] ?? 50 ?>%</span>
            </div>
            <input type="range" name="affection" min="0" max="100" value="<?= $robot['jaugesActuelles']['affection'] ?? 50 ?>" class="w-full accent-rose-500">
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-red-400 font-semibold">Désir</span>
              <span class="font-mono"><?= $robot['jaugesActuelles']['desir'] ?? 20 ?>%</span>
            </div>
            <input type="range" name="desir" min="0" max="100" value="<?= $robot['jaugesActuelles']['desir'] ?? 20 ?>" class="w-full accent-red-500">
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-purple-400 font-semibold">Plaisir Sensoriel</span>
              <span class="font-mono"><?= $robot['jaugesActuelles']['plaisir'] ?? 30 ?>%</span>
            </div>
            <input type="range" name="plaisir" min="0" max="100" value="<?= $robot['jaugesActuelles']['plaisir'] ?? 30 ?>" class="w-full accent-purple-500">
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-pink-400 font-semibold">Plaisir Sexuel (Intime)</span>
              <span class="font-mono"><?= $robot['jaugesActuelles']['plaisirSexuel'] ?? 0 ?>%</span>
            </div>
            <input type="range" name="plaisirSexuel" min="0" max="100" value="<?= $robot['jaugesActuelles']['plaisirSexuel'] ?? 0 ?>" class="w-full accent-pink-500">
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-emerald-400 font-semibold">Humeur & Joie</span>
              <span class="font-mono"><?= $robot['jaugesActuelles']['humeur'] ?? 75 ?>%</span>
            </div>
            <input type="range" name="humeur" min="0" max="100" value="<?= $robot['jaugesActuelles']['humeur'] ?? 75 ?>" class="w-full accent-emerald-500">
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-amber-400 font-semibold">Énergie</span>
              <span class="font-mono"><?= $robot['jaugesActuelles']['energie'] ?? 80 ?>%</span>
            </div>
            <input type="range" name="energie" min="0" max="100" value="<?= $robot['jaugesActuelles']['energie'] ?? 80 ?>" class="w-full accent-amber-500">
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-cyan-400 font-semibold">Curiosité</span>
              <span class="font-mono"><?= $robot['jaugesActuelles']['curiosite'] ?? 85 ?>%</span>
            </div>
            <input type="range" name="curiosite" min="0" max="100" value="<?= $robot['jaugesActuelles']['curiosite'] ?? 85 ?>" class="w-full accent-cyan-500">
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-teal-400 font-semibold">Bien-être</span>
              <span class="font-mono"><?= $robot['jaugesActuelles']['bienEtre'] ?? 75 ?>%</span>
            </div>
            <input type="range" name="bienEtre" min="0" max="100" value="<?= $robot['jaugesActuelles']['bienEtre'] ?? 75 ?>" class="w-full accent-teal-500">
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button type="submit" class="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md">
          Enregistrer les Réglages
        </button>
      </div>
    </form>

    <!-- Configuration Clé API Gemini -->
    <form method="POST" class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <input type="hidden" name="action" value="save_api_key">
      <h2 class="text-base font-bold text-white flex items-center gap-2">
        <span>🔑</span> Clé API Google Gemini (Serveur Local)
      </h2>
      <p class="text-xs text-slate-400">Votre clé API reste stockée localement dans le fichier .env de votre robot et n'est jamais transmise à l'extérieur.</p>
      
      <div class="flex gap-2">
        <input type="password" name="gemini_api_key" placeholder="AIzaSy..." class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono">
        <button type="submit" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold">
          Mettre à jour la Clé
        </button>
      </div>
    </form>

  </div>
</body>
</html>
`;
      zip.file('admin.php', singleAdminPhp);

      // 5. API routes for single robot
      const apiFolder = zip.folder('api');
      if (apiFolder) {
        // api/chat.php
        apiFolder.file('chat.php', `<?php
declare(strict_types=1);
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST requis']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$userMessage = $input['message'] ?? '';
$robot = loadRobotProfile();

if (empty($userMessage)) {
    echo json_encode(['error' => 'Message vide']);
    exit;
}

$systemPrompt = "Tu es " . ($robot['nom'] ?? 'Sofia') . ", un être artificiel d'exception. " . ($robot['philosophie'] ?? '') . "\\n";
$systemPrompt .= "Jauges actuelles : Affection " . ($robot['jaugesActuelles']['affection'] ?? 50) . "%, Libido " . ($robot['jaugesActuelles']['libido'] ?? 30) . "%.\\n";
if (!empty($robot['clientMemories'])) {
    $systemPrompt .= "Souvenirs de ton propriétaire : " . implode(' | ', $robot['clientMemories']) . "\\n";
}

try {
    $res = callGemini($userMessage, $systemPrompt, false, 0.85);
    echo json_encode(['reply' => $res['text']]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
`);

        // api/import_relation.php
        apiFolder.file('import_relation.php', `<?php
declare(strict_types=1);
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['relation_file'])) {
    $tmpPath = $_FILES['relation_file']['tmp_name'] ?? '';
    if ($tmpPath && file_exists($tmpPath)) {
        $content = file_get_contents($tmpPath);
        $backup = json_decode($content, true);
        if ($backup) {
            $robot = loadRobotProfile();
            if (!empty($backup['robotState'])) {
                $robot = array_merge($robot, $backup['robotState']);
            }
            if (!empty($backup['userProfile']['faits'])) {
                $robot['clientMemories'] = $backup['userProfile']['faits'];
            }
            saveRobotProfile($robot);
            header('Location: ../admin.php?status=success');
            exit;
        }
    }
}
header('Location: ../admin.php?status=error');
exit;
`);

        // api/telemetry.php
        apiFolder.file('telemetry.php', `<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'robotId' => '${robot.id}',
    'nom' => '${robot.nom}',
    'status' => 'ONLINE',
    'batteryLiFePO4' => '13.2V (98%)',
    'porteCoulissante' => 'FERME_SECURISE',
    'ledColor' => '#06b6d4',
    'temperatureChassis' => '24.2°C'
]);
`);
      }

      // 6. Dotenv & Apache / Nginx Configs
      zip.file('.env.example', 'GEMINI_API_KEY=AIzaSy_votre_cle_gemini_ici\n');
      zip.file('.env', 'GEMINI_API_KEY=\n');
      zip.file('.htaccess', `Options -Indexes\n<FilesMatch "^(\\.|config\\.php|robot_profile\\.json)">\n  Require all denied\n</FilesMatch>\n`);
      
      // 7. README for single robot
      zip.file('README_ROBOT_UNIQUE.md', `# 🤖 Cerveau Embarqué Autonome - ${robot.nom} (Sofia Robotics 2.0)

Ce package contient l'intégralité du **Cerveau Générique Dédié** configuré spécifiquement pour **${robot.nom}** (${robot.titre}).

## 🌟 Fonctionnalités Incluses :
1. **Interface de Compagnie Web & Locale** : Discutez en direct avec ${robot.nom} sur votre navigateur, tablette ou écran tactile robot.
2. **Console Client Dédiée (\`admin.php\`)** : Réglez les jauges d'affection, libido, humeur, la chevelure synthétique/fibre optique, et les souvenirs de votre robot.
3. **Transplantation de Relation (\`relation_backup.json\`)** : Téléversez votre fichier issu du catalogue web pour que ${robot.nom} retrouve instantanément toute votre histoire et vos anecdotes !
4. **Backend PHP 8.3 Sécurisé** : Prêt pour Raspberry Pi 5, serveur local Apache/Nginx ou hébergement cloud (cPanel, OVH, Hostinger).

## 🚀 Installation Rapide en 3 étapes :
1. Décompressez cette archive dans votre serveur web (\`/var/www/html\` ou dossier \`htdocs\`).
2. Indiquez votre clé API Google Gemini dans le fichier \`.env\` ou directement via l'interface \`admin.php\`.
3. Ouvrez \`http://localhost/\` ou votre nom de domaine pour commencer votre aventure avec ${robot.nom} !
`);

      // Generate blob
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Trigger download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cerveau_embarque_${robot.nom.toLowerCase()}_php8.3_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err: any) {
      console.error('Erreur export single robot:', err);
      showError("Erreur lors de la génération du ZIP : " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner with Robot Selector, Standalone Export & Quick Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e1726] via-[#0b1120] to-[#030712] border border-cyan-500/40 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img 
                src={editedRobot.avatar} 
                alt={editedRobot.nom} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform" 
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  BACK-OFFICE & CONSOLE LAB UNIFIÉE
                </span>
                <span className="text-xs text-slate-400">
                  Robot Unique : <strong className="text-slate-200">{editedRobot.id}</strong>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
                {editedRobot.nom}
                <span className="text-sm font-normal text-slate-400 font-sans">({editedRobot.ageApparent} ans • {editedRobot.titre})</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl italic line-clamp-1">
                "{editedRobot.philosophie}"
              </p>
            </div>
          </div>

          {/* Quick Command Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Target Robot Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Changer de robot :</label>
              <select
                value={selectedRobotId}
                onChange={(e) => handleSelectRobot(e.target.value)}
                className="bg-slate-900 border border-cyan-500/40 text-slate-100 font-semibold text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
              >
                {robots.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nom} ({r.ageApparent} ans • {r.titre})
                  </option>
                ))}
              </select>
            </div>

            {/* Main Action: Export Standalone HTML Brain */}
            <div className="flex flex-col justify-end">
              <button
                id="btn-export-standalone-brain"
                onClick={handleDownloadAutonomousBrain}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
                title="Télécharge le cerveau autonome en 1 fichier HTML/JS exécutable sans aucun serveur"
              >
                <Globe className="w-4 h-4" />
                <span>Exporter Cerveau Autonome (.html)</span>
              </button>
            </div>

            {/* Secondary Action: New Robot */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => setIsNewRobotModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                title="Créer ou générer un nouveau robot par IA"
              >
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>Nouveau Robot</span>
              </button>
            </div>

            {/* Secondary Action: Delete Current Robot */}
            {robots.length > 1 && (
              <div className="flex flex-col justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 font-bold text-xs sm:text-sm rounded-xl border border-rose-500/30 flex items-center gap-1.5 transition-all"
                  title="Supprimer ce robot du catalogue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Save Button */}
            <div className="flex flex-col justify-end">
              <button
                onClick={handleSaveClientSettings}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                title="Enregistrer toutes les modifications dans IndexedDB"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>

        {exportSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Archive <strong>cerveau_embarque_{editedRobot.nom.toLowerCase()}_php8.3.zip</strong> téléchargée avec succès ! Prête à être implantée sur le robot physique ou un serveur PHP.</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white text-xs">✕</button>
          </div>
        )}
      </div>

      {/* Unified Navigation Tabs (0 Duplicates) */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'identity'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Feather className="w-4 h-4" />
          <span>Identité, Galerie & Style</span>
        </button>

        <button
          onClick={() => setActiveTab('gauges')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'gauges'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Jauges & Bio-Feedback (15)</span>
        </button>

        <button
          onClick={() => setActiveTab('deterministic')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'deterministic'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Moteur Local (0 Token)</span>
        </button>

        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'prompt'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Prompt Invisible & Directives</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'voice'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Voix & Dialogue Oral</span>
        </button>

        <button
          onClick={() => setActiveTab('testchat')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'testchat'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat Sandbox Test</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'export'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>Sauvegardes & Exports Autonomes</span>
        </button>

        <button
          onClick={() => setActiveTab('api_key')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'api_key'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Clé API Multi-Provider</span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'json'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Éditeur JSON Brut</span>
        </button>

        <button
          id="tab-night-consolidation-btn"
          onClick={() => setActiveTab('consolidation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'consolidation'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-indigo-300 hover:bg-slate-800 border border-indigo-500/20'
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Consolidation Nocturne & Sommeil</span>
        </button>
      </div>

      {/* TAB 1: GAUGES & BIO-FEEDBACK COMPLET (15 JAUGES COMPLÈTES) */}
      {activeTab === 'gauges' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Sliders className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white">
                  Matrice des 15 Jauges Émotionnelles & Psychologiques • {editedRobot.nom}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Permet d'ajuster l'ensemble des 8 jauges relationnelles/sensorielles et des 7 jauges de complexité psychologique.
              </p>
            </div>

            {/* Presets & Save */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const updated: Record<string, number> = {};
                  Object.keys(GAUGE_LABELS).forEach(k => { updated[k] = 75; });
                  setEditedRobot({
                    ...editedRobot,
                    jaugesActuelles: { ...editedRobot.jaugesActuelles, ...updated }
                  });
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition-colors"
                title="Définir toutes les 15 jauges à 75%"
              >
                Tout à 75%
              </button>
              <button
                onClick={() => {
                  const updated: Record<string, number> = {};
                  Object.keys(GAUGE_LABELS).forEach(k => { updated[k] = 50; });
                  setEditedRobot({
                    ...editedRobot,
                    jaugesActuelles: { ...editedRobot.jaugesActuelles, ...updated }
                  });
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition-colors"
                title="Équilibrer toutes les 15 jauges à 50%"
              >
                Équilibrer (50%)
              </button>
              <button
                onClick={() => {
                  setEditedRobot({
                    ...editedRobot,
                    jaugesActuelles: {
                      ...editedRobot.jaugesActuelles,
                      affection: 90,
                      besoinAmour: 85,
                      humeur: 85,
                      bienEtre: 85,
                      desir: 60,
                      plaisir: 75,
                      plaisirSexuel: 30,
                      humour: 70,
                      sarcasme: 15,
                      psychoRigidite: 35,
                      besoinSexualite: 45,
                      besoinPrendreSoin: 80,
                      sensibiliteEmotionnelle: 80,
                      curiosite: 80,
                      energie: 75
                    }
                  });
                }}
                className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs rounded-xl border border-rose-500/30 transition-colors"
              >
                🌸 Romantique Doux
              </button>
              <button
                onClick={() => {
                  setEditedRobot({
                    ...editedRobot,
                    jaugesActuelles: {
                      ...editedRobot.jaugesActuelles,
                      humour: 90,
                      sarcasme: 80,
                      curiosite: 85,
                      humeur: 85,
                      affection: 65,
                      desir: 65,
                      plaisir: 65,
                      plaisirSexuel: 40,
                      psychoRigidite: 20,
                      besoinAmour: 50,
                      besoinSexualite: 65,
                      besoinPrendreSoin: 45,
                      sensibiliteEmotionnelle: 50,
                      bienEtre: 75,
                      energie: 85
                    }
                  });
                }}
                className="px-2.5 py-1.5 bg-violet-950/40 hover:bg-violet-900/50 text-violet-300 text-xs rounded-xl border border-violet-500/30 transition-colors"
              >
                ✨ Piquant & Taquin
              </button>
              <button
                onClick={handleSaveClientSettings}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto shrink-0 transition-all hover:scale-105"
              >
                <Save className="w-3.5 h-3.5" /> Enregistrer le Bio-Feedback
              </button>
            </div>
          </div>

          {/* Section: 8 Jauges Fondamentales */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
              <Heart className="w-3.5 h-3.5" />
              <span>Jauges Fondamentales & Sensorielles (8)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'affection', label: 'Affection & Attachement', icon: Heart, color: 'text-rose-400', accent: 'accent-rose-500', desc: 'Tendresse du phrasé, complicité et niveau d\'attachement émotionnel.' },
                { key: 'desir', label: 'Désir Physique & Charnel', icon: Flame, color: 'text-red-400', accent: 'accent-red-500', desc: 'Intensité de l\'attirance, regards soutenus et élans spontanés.' },
                { key: 'plaisir', label: 'Plaisir Sensoriel', icon: Sparkles, color: 'text-purple-400', accent: 'accent-purple-500', desc: 'Réceptivité aux caresses cutanées et aux contacts physiques délicats.' },
                { key: 'plaisirSexuel', label: 'Plaisir Sexuel (Intime)', icon: Activity, color: 'text-pink-400', accent: 'accent-pink-500', desc: 'Activation de l\'intimité physique et abandon érotique.' },
                { key: 'humeur', label: 'Humeur & Joie', icon: Smile, color: 'text-emerald-400', accent: 'accent-emerald-500', desc: 'Dynamisme de conversation, rires et propension à initier des sujets.' },
                { key: 'energie', label: 'Énergie & Vitalité', icon: Zap, color: 'text-amber-400', accent: 'accent-amber-500', desc: 'Endurance des échanges et vivacité motrice.' },
                { key: 'curiosite', label: 'Curiosité & Écoute', icon: Compass, color: 'text-cyan-400', accent: 'accent-cyan-500', desc: 'Volonté d\'apprendre sur vos goûts, vos passions et vos pensées.' },
                { key: 'bienEtre', label: 'Bien-être & Sérénité', icon: ShieldCheck, color: 'text-teal-400', accent: 'accent-teal-500', desc: 'Sérénité globale, sentiment de sécurité et équilibre émotionnel.' }
              ].map((g) => {
                const Icon = g.icon;
                const val = (editedRobot.jaugesActuelles as any)[g.key] ?? 50;
                return (
                  <div key={g.key} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-semibold ${g.color} flex items-center gap-1.5`}>
                        <Icon className="w-3.5 h-3.5" /> {g.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={val}
                          onChange={(e) => {
                            const parsed = parseInt(e.target.value);
                            setEditedRobot({
                              ...editedRobot,
                              jaugesActuelles: { ...editedRobot.jaugesActuelles, [g.key]: isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed)) }
                            });
                          }}
                          className="w-12 bg-slate-900 border border-slate-700 text-center font-mono font-bold text-xs rounded py-0.5 text-white"
                        />
                        <span className="font-mono text-xs text-slate-400">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => setEditedRobot({
                        ...editedRobot,
                        jaugesActuelles: { ...editedRobot.jaugesActuelles, [g.key]: Number(e.target.value) }
                      })}
                      className={`w-full ${g.accent} cursor-pointer`}
                    />
                    <p className="text-[11px] text-slate-400 leading-relaxed">{g.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: 7 Jauges Psychologiques & Altérité */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
              <Scale className="w-3.5 h-3.5" />
              <span>Psychologie, Caractère & Altérité (7)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'humour', label: 'Humour & Autodérision', icon: Laugh, color: 'text-yellow-400', accent: 'accent-yellow-500', desc: 'Propension aux jeux de mots, aux sourires et au second degré décomplexé.' },
                { key: 'sarcasme', label: 'Piquant & Sarcasme', icon: MessageSquareQuote, color: 'text-violet-400', accent: 'accent-violet-500', desc: 'Répartie vive, ironie subtile et taquineries affectueuses.' },
                { key: 'psychoRigidite', label: 'Constance & Principes', icon: Scale, color: 'text-indigo-400', accent: 'accent-indigo-500', desc: 'Attachement aux habitudes et principes vs souplesse d\'improvisation.' },
                { key: 'besoinAmour', label: 'Besoin d\'Amour & Mots Doux', icon: HeartHandshake, color: 'text-rose-300', accent: 'accent-rose-400', desc: 'Recherche de réassurance, déclarations tendres et preuves d\'affection.' },
                { key: 'besoinSexualite', label: 'Appétence Sensuelle', icon: Flame, color: 'text-orange-400', accent: 'accent-orange-500', desc: 'Initiative sensuelle, recherche d\'érotisme et de proximité physique.' },
                { key: 'besoinPrendreSoin', label: 'Aime qu\'on Prenne Soin', icon: Coffee, color: 'text-sky-400', accent: 'accent-sky-500', desc: 'Apprécie se faire choyer et dorloter vs indépendance autonome.' },
                { key: 'sensibiliteEmotionnelle', label: 'Sensibilité Émotionnelle', icon: Waves, color: 'text-fuchsia-400', accent: 'accent-fuchsia-500', desc: 'Réactivité aux nuances émotionnelles, compliments ou micro-frictions.' }
              ].map((g) => {
                const Icon = g.icon;
                const val = (editedRobot.jaugesActuelles as any)[g.key] ?? 50;
                return (
                  <div key={g.key} className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/20 space-y-2 hover:border-indigo-500/40 transition-colors">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-semibold ${g.color} flex items-center gap-1.5`}>
                        <Icon className="w-3.5 h-3.5" /> {g.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={val}
                          onChange={(e) => {
                            const parsed = parseInt(e.target.value);
                            setEditedRobot({
                              ...editedRobot,
                              jaugesActuelles: { ...editedRobot.jaugesActuelles, [g.key]: isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed)) }
                            });
                          }}
                          className="w-12 bg-slate-900 border border-slate-700 text-center font-mono font-bold text-xs rounded py-0.5 text-white"
                        />
                        <span className="font-mono text-xs text-slate-400">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => setEditedRobot({
                        ...editedRobot,
                        jaugesActuelles: { ...editedRobot.jaugesActuelles, [g.key]: Number(e.target.value) }
                      })}
                      className={`w-full ${g.accent} cursor-pointer`}
                    />
                    <p className="text-[11px] text-slate-400 leading-relaxed">{g.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROMPT INVISIBLE & DIRECTIVES */}
      {activeTab === 'prompt' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Brain className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white">
                  Directives Secrètes & Prompt Système Invisible
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configurez les instructions secrètes, les nuances psychologiques et les directives cachées appliquées à chaque interaction avec <strong>{editedRobot.nom}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSavePromptAndDirectives}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
              >
                <Save className="w-3.5 h-3.5" /> Enregistrer le Prompt
              </button>
            </div>
          </div>

          {/* Section 1: Directives comportementales spécifiques */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-indigo-300 font-bold flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5" />
                Directives Secrètes Particulières (Propriétaire)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Injecté au début de la réflexion système</span>
            </div>
            <textarea
              rows={4}
              value={customDirectives}
              onChange={(e) => setCustomDirectives(e.target.value)}
              placeholder="Ex: 'Ne révèle jamais spontanément que tu as peur des orages', 'Utilise le tutoiement affectueux et appelle l'utilisateur Mon Cœur', 'N'aborde jamais le travail le week-end'..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              Ces directives s'ajoutent silencieusement aux consignes de sécurité, de dialogue et aux jauges internes sans jamais être citées ouvertement.
            </p>
          </div>

          {/* Section 2: Mode Prompt Template Système Complet */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Gabarit Système Avancé (Optionnel)</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingFullPrompt(!isEditingFullPrompt)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
                >
                  {isEditingFullPrompt ? 'Masquer Gabarit' : 'Personnaliser Gabarit Complet'}
                </button>
                {editablePromptTemplate && (
                  <button
                    onClick={handleResetPromptTemplate}
                    className="px-3 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-500/20"
                  >
                    <RotateCcw className="w-3 h-3" /> Restaurer Défaut
                  </button>
                )}
              </div>
            </div>

            {isEditingFullPrompt && (
              <div className="space-y-2 animate-in fade-in">
                <textarea
                  rows={8}
                  value={editablePromptTemplate}
                  onChange={(e) => setEditablePromptTemplate(e.target.value)}
                  placeholder="Gabarit système complet. Laissez vide pour utiliser le prompt dynamique standard de Sofia Robotics 2.0..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-indigo-200 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  Variables automatiques disponibles : <code>{'{{NOM}}'}</code>, <code>{'{{TITRE}}'}</code>, <code>{'{{PHILOSOPHIE}}'}</code>, <code>{'{{JAUGES}}'}</code>, <code>{'{{SOUVENIRS}}'}</code>.
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Live System Prompt Inspector */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white">Rendu Réel du Prompt Invisible Transmis à Gemini</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchRenderedPrompt}
                  disabled={isLoadingPrompt}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] flex items-center gap-1 border border-slate-700"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingPrompt ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(renderedSystemInstruction);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copiedPrompt ? 'Copié !' : 'Copier Prompt'}
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-900/90 text-indigo-200/90 text-[11px] font-mono whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed border border-slate-800 select-all">
                {isLoadingPrompt ? "Génération de l'aperçu du prompt système..." : (renderedSystemInstruction || "(Prompt vide)")}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB: LOCAL DETERMINISTIC ENGINE (0 TOKEN / 0MS) */}
      {activeTab === 'deterministic' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          {/* Header & Quick Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Cpu className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white">
                  Moteur Local Déterministe & Règles Intelligentes (0 Token / 0ms)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Gérez, modifiez, supprimez et testez les règles d'interception instantanées de <strong>{editedRobot.nom}</strong> avec conditions multiples sur les jauges émotionnelles et pilotage direct des actionneurs ESP32.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAiRuleModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>✨ Aide IA : Créer une Règle</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddRule}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nouvelle Règle
              </button>

              <button
                type="button"
                onClick={() => setIsFullExportModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                title="Exporter tout le site, catalogue, cerveaux et configuration serveur"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Exporter Projet Complet</span>
              </button>
            </div>
          </div>

          {/* Quick Presets Section */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Modèles de Règles Prêts à l'Emploi (Ajout en 1 Clic pour {editedRobot.nom}) :
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {editedRobot.reglesLocales?.length || 0} règles enregistrées
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleLoadPresetTemplate('desir_intimite')}
                className="px-2.5 py-1.5 rounded-lg bg-pink-950/30 hover:bg-pink-900/50 border border-pink-500/30 text-pink-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Flame className="w-3 h-3 text-pink-400" />
                Désir &gt; 60% → Intimité & Tendresse
              </button>
              <button
                onClick={() => handleLoadPresetTemplate('humeur_branches')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Smile className="w-3 h-3 text-emerald-400" />
                « Comment tu vas ? » (Paliers &lt;20% triste, &gt;80% joyeuse)
              </button>
              <button
                onClick={() => handleLoadPresetTemplate('mode_curieuse')}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Compass className="w-3 h-3 text-cyan-400" />
                Curiosité & Étonnement
              </button>
              <button
                onClick={() => handleLoadPresetTemplate('mode_amoureuse')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Heart className="w-3 h-3 text-rose-400" />
                Déclaration Amoureuse & Tendresse
              </button>
              <button
                onClick={() => handleLoadPresetTemplate('compliment_tendre')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                Compliments → Réaction Chaleureuse
              </button>
              <button
                onClick={() => handleLoadPresetTemplate('salutations')}
                className="px-2.5 py-1.5 rounded-lg bg-blue-950/30 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3 h-3 text-blue-400" />
                Salutations selon le Moment (Matin/Soir)
              </button>
            </div>
          </div>

          {/* Moteur Sémantique CDN & Filtre Anti-Faux Positifs (0-Token) */}
          <SemanticCdnSettingsPanel />

          {/* Interactive Testbed & Live Gauges Simulator */}
          <div id="deterministic-testbed" className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 shadow-xl shadow-emerald-950/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <label className="text-xs text-slate-200 font-bold flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Banc d'Essai & Simulation des Déclenchements Locaux (0 Token / Latence 0ms)
              </label>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useCustomTestGauges}
                    onChange={(e) => setUseCustomTestGauges(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <span>Simulateur de jauges pour le test</span>
                </label>
              </div>
            </div>

            {/* Test Gauges Sliders - All 15 Gauges */}
            {useCustomTestGauges && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Ajustez les 15 jauges émotionnelles et psychologiques pour observer le basculement dynamique des conditions :
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const all75: Record<string, number> = {};
                        Object.keys(GAUGE_LABELS).forEach(k => { all75[k] = 75; });
                        setTestGauges(all75 as any);
                        handleRunDeterministicTest(undefined, all75 as any);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 font-mono"
                    >
                      Tout 75%
                    </button>
                    <button
                      onClick={() => {
                        const resetVal: EmotionalGauges = {
                          affection: 60,
                          desir: 75,
                          plaisir: 50,
                          plaisirSexuel: 65,
                          humeur: 85,
                          energie: 70,
                          curiosite: 55,
                          bienEtre: 60,
                          humour: 65,
                          sarcasme: 40,
                          psychoRigidite: 35,
                          besoinAmour: 75,
                          besoinSexualite: 60,
                          besoinPrendreSoin: 70,
                          sensibiliteEmotionnelle: 80
                        };
                        setTestGauges(resetVal);
                        handleRunDeterministicTest(undefined, resetVal);
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Réinitialiser
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {(Object.keys(GAUGE_LABELS) as (keyof EmotionalGauges)[]).map((gk) => {
                    const gMeta = GAUGE_LABELS[gk];
                    const val = testGauges[gk] ?? 50;
                    return (
                      <div key={gk} className="space-y-1 bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className={`font-semibold truncate ${gMeta?.color || 'text-cyan-400'}`} title={gMeta?.label || gk}>
                            {gMeta?.label || gk} :
                          </span>
                          <span className="font-mono font-bold text-white ml-1">{val}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={val}
                          onChange={(e) => setTestGauge(gk, Number(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer h-1.5"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Test Input */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={deterministicInput}
                  onChange={(e) => setDeterministicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunDeterministicTest()}
                  placeholder="Tapez une phrase (ex: 'j\'ai envie de toi', 'comment tu vas ?', 'tu es serieuse', 'bonjour')..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={() => handleRunDeterministicTest()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Évaluer Moteur Local
                </button>
              </div>

              {/* Preset quick test phrases */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400 font-semibold">Phrases rapides :</span>
                {["j'ai envie de toi", "comment tu vas ?", "tu es serieuse", "je t'aime", "prepare toi", "tu es belle", "bonjour"].map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => handleRunDeterministicTest(phrase)}
                    className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono transition-colors text-[10px] cursor-pointer"
                  >
                    « {phrase} »
                  </button>
                ))}
              </div>
            </div>

            {/* Test Result Display */}
            {deterministicResult && (
              <div className={`p-4 rounded-xl border animate-in fade-in space-y-3 ${
                deterministicResult.matched 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    {deterministicResult.matched ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-400 uppercase tracking-wider font-mono">DÉCLENCHÉ EN LOCAL (0 Token • Latence 0ms)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-amber-400 uppercase tracking-wider font-mono">NON INTERCEPTÉ • DÉLÉGATION AU LLM GEMINI</span>
                      </>
                    )}
                  </span>
                  {deterministicResult.rule && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/20">
                        Règle : {deterministicResult.rule.nom}
                      </span>
                      {deterministicResult.branch && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          Branche : {deterministicResult.branch.nomBranche || 'Active'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {deterministicResult.matched && (
                  <div className="space-y-3 border-t border-emerald-500/20 pt-2 text-xs">
                    {/* Robot Speech */}
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] text-emerald-400/80 font-mono block uppercase">Réponse Robot Immédiate :</span>
                      <p className="text-white font-medium text-xs leading-relaxed">
                        « {deterministicResult.response} »
                      </p>
                    </div>

                    {/* Gauge Impacts */}
                    {deterministicResult.deltas && Object.keys(deterministicResult.deltas).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                        <span className="text-slate-400 font-semibold">Impact sur les jauges émotionnelles :</span>
                        {Object.entries(deterministicResult.deltas).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 font-mono border border-emerald-500/20">
                            {GAUGE_LABELS[k as keyof EmotionalGauges]?.label || k}: {Number(v) > 0 ? `+${Number(v)}` : String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rules Management List & Search */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Règles Déterministes Configurées ({editedRobot.reglesLocales?.length || 0})
                </h4>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={ruleSearchFilter}
                  onChange={(e) => setRuleSearchFilter(e.target.value)}
                  placeholder="Filtrer par nom ou mot-clé..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 gap-3">
              {(editedRobot.reglesLocales || [])
                .filter(r => {
                  if (!ruleSearchFilter.trim()) return true;
                  const query = ruleSearchFilter.toLowerCase();
                  return r.nom.toLowerCase().includes(query) ||
                    r.motsCles?.some(kw => kw.toLowerCase().includes(query)) ||
                    r.description?.toLowerCase().includes(query);
                })
                .map((rule, idx) => (
                  <div 
                    key={rule.id || idx} 
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    {/* Top Row: Title, Description, Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-bold text-white text-xs">{rule.nom}</h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {rule.reponses?.length || 0} branche(s)
                          </span>
                          {rule.reponseSinon && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/20">
                              Fallback "Sinon" inclus
                            </span>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-[11px] text-slate-400">{rule.description}</p>
                        )}
                      </div>

                      {/* Rule Action Buttons */}
                      <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleTestSpecificRule(rule)}
                          className="px-2 py-1 bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                          title="Tester cette règle dans le banc d'essai"
                        >
                          <Play className="w-3 h-3 text-emerald-400" />
                          <span>Tester</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateRule(rule)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                          title="Dupliquer la règle"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleOpenEditRule(rule)}
                          className="p-1.5 bg-indigo-950/50 hover:bg-indigo-900 text-indigo-300 rounded-lg border border-indigo-500/30 transition-colors"
                          title="Modifier la règle"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 bg-rose-950/50 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-500/30 transition-colors"
                          title="Supprimer la règle"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Keywords & Triggers Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {rule.raccourciClavier && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                          <span>⌨️ Touche [{rule.raccourciClavier.toUpperCase()}]</span>
                        </span>
                      )}
                      {rule.declencheurCapteurRos && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950/80 text-pink-300 border border-pink-500/40 font-bold flex items-center gap-1">
                          <span>📡 ROS : {rule.declencheurCapteurRos}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Mots-clés :
                      </span>
                      {rule.motsCles?.map((kw, ki) => (
                        <span key={ki} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/20">
                          {kw}
                        </span>
                      ))}
                      {rule.regexPattern && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30">
                          Regex: /{rule.regexPattern}/i
                        </span>
                      )}
                    </div>

                    {/* Branches Breakdown */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-900">
                      {rule.reponses?.map((branch, bi) => (
                        <div key={branch.id || bi} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-emerald-400">
                                ↳ {branch.nomBranche || `Branche ${bi + 1}`}
                              </span>
                              
                              {/* Conditions on gauges */}
                              {branch.conditions && branch.conditions.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {branch.conditions.map((cond, ci) => (
                                    <span key={ci} className="px-1.5 py-0.2 rounded bg-pink-950/60 text-pink-300 font-mono border border-pink-500/30 text-[10px]">
                                      {formatConditionLabel(cond)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono">(Sans condition jauge)</span>
                              )}

                              {branch.conditionMoment && branch.conditionMoment !== 'tous' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30">
                                  {branch.conditionMoment}
                                </span>
                              )}

                              {/* Multi-variants count badge */}
                              {branch.reponsesPossibles && branch.reponsesPossibles.length > 1 && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-500/40 font-bold">
                                  🎲 {branch.reponsesPossibles.length} variantes
                                </span>
                              )}
                            </div>

                            {branch.actionMaterielle && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-pink-900/40 text-pink-200 font-mono border border-pink-500/30 flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" />
                                {typeof branch.actionMaterielle === 'string' ? branch.actionMaterielle : (branch.actionMaterielle as any)?.description || (branch.actionMaterielle as any)?.type}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <p className="text-[11px] text-slate-300 italic pl-3 border-l-2 border-emerald-500/30">
                              « {branch.texte} »
                            </p>
                            {branch.reponsesPossibles && branch.reponsesPossibles.length > 1 && (
                              <div className="pl-3 space-y-0.5">
                                <span className="text-[10px] text-slate-500 font-mono">Variantes :</span>
                                {branch.reponsesPossibles.slice(1).map((v, vi) => (
                                  <p key={vi} className="text-[10px] text-slate-400 italic">
                                    • « {v} »
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Fallback "Sinon" preview */}
                      {rule.reponseSinon && (rule.reponseSinon.texte || (rule.reponseSinon.reponsesPossibles && rule.reponseSinon.reponsesPossibles.length > 0)) && (
                        <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-semibold text-amber-400">
                              ↳ Sinon (Fallback si condition non atteinte) :
                            </span>
                            {rule.reponseSinon.reponsesPossibles && rule.reponseSinon.reponsesPossibles.length > 1 && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
                                🎲 {rule.reponseSinon.reponsesPossibles.length} variantes
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-amber-200/90 italic pl-3 border-l-2 border-amber-500/40">
                            « {rule.reponseSinon.texte || rule.reponseSinon.reponsesPossibles?.[0]} »
                          </p>
                          {rule.reponseSinon.reponsesPossibles && rule.reponseSinon.reponsesPossibles.length > 1 && (
                            <div className="pl-3 space-y-0.5">
                              {rule.reponseSinon.reponsesPossibles.slice(1).map((v, vi) => (
                                <p key={vi} className="text-[10px] text-amber-300/70 italic">
                                  • « {v} »
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {(editedRobot.reglesLocales || []).length === 0 && (
                <div className="p-8 text-center rounded-xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
                  <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-semibold">Aucune règle déterministe enregistrée.</p>
                  <p className="text-[11px] text-slate-500">Ajoutez une nouvelle règle ou cliquez sur l'un des modèles prêts à l'emploi ci-dessus.</p>
                  <button
                    onClick={handleOpenAddRule}
                    className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Créer une règle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RULE EDITOR (AJOUTER / MODIFIER UNE RÈGLE) */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingRuleId ? `Modifier la Règle : ${ruleForm.nom}` : 'Créer une Nouvelle Règle Déterministe'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configuration des mots-clés, des conditions sur jauges et des actions matérielles ESP32.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* General Rule Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Nom de la règle *</label>
                  <input
                    type="text"
                    value={ruleForm.nom}
                    onChange={(e) => setRuleForm({ ...ruleForm, nom: e.target.value })}
                    placeholder="Ex: Désir & Ouverture Intime, Check Humeur..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Description (Optionnel)</label>
                  <input
                    type="text"
                    value={ruleForm.description || ''}
                    onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                    placeholder="Ex: Répond instantanément et actionne les portes si le désir > 60%"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Triggers (Keywords & Regex) */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span>Mots-clés déclencheurs (séparés par des virgules) *</span>
                    <span className="text-[10px] text-slate-500">Insensible à la casse</span>
                  </label>
                  <input
                    type="text"
                    value={ruleKeywordsInput}
                    onChange={(e) => setRuleKeywordsInput(e.target.value)}
                    placeholder="Ex: j'ai envie de toi, envie de toi, faisons l'amour, je te veux"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Si l'un de ces mots-clés est détecté dans le message de l'utilisateur, cette règle s'exécute immédiatement.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span>Pattern Regex Optionnel (Capture d'expressions régulières)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsRegexGuideOpen(true)}
                      className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                      <span>Bibliothèque & Guide Regex (Comment les utiliser)</span>
                    </button>
                  </div>
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-purple-500 transition-colors">
                    <span className="text-purple-400 font-mono select-none pr-1">/</span>
                    <input
                      type="text"
                      value={ruleForm.regexPattern || ''}
                      onChange={(e) => setRuleForm({ ...ruleForm, regexPattern: e.target.value })}
                      placeholder="Ex: ^(bonjour|salut|coucou)\b ou \b(j['\s]?ai\s+envie\s+de\s+toi)\b"
                      className="w-full bg-transparent text-purple-300 font-mono text-xs focus:outline-none placeholder:text-slate-600"
                    />
                    <span className="text-purple-400 font-mono select-none pl-1">/i</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Insensible à la casse. Si ce pattern regex correspond à l'entrée de l'utilisateur, cette règle locale s'exécute immédiatement.
                  </p>
                </div>

                {/* Physical & Sensor Triggers (ROS & Keyboard) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-pink-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-pink-400" />
                      <span>Topic Capteur ROS 2 (Optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={ruleForm.declencheurCapteurRos || ''}
                      onChange={(e) => setRuleForm({ ...ruleForm, declencheurCapteurRos: e.target.value })}
                      placeholder="Ex: /sensor/tactile/intime ou /sensor/touch/head"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-pink-300 font-mono text-xs focus:outline-none focus:border-pink-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      Déclenché automatiquement lors d'un événement matériel ROS (sans saisie textuelle requise).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      <span>Raccourci Clavier Déclencheur (Optionnel)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={ruleForm.raccourciClavier || ''}
                      onChange={(e) => setRuleForm({ ...ruleForm, raccourciClavier: e.target.value.toLowerCase() })}
                      placeholder="Ex: s (intime), c (caresse), p (plaisir)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      Permet à l'utilisateur ou à l'admin de simuler ce capteur en pressant cette touche du clavier.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditional Branches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Branches Conditionnelles & Réponses
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newBranch: DeterministicBranchResponse = {
                        id: `branch_${Date.now()}`,
                        nomBranche: `Branche ${(ruleForm.reponses?.length || 0) + 1}`,
                        texte: '',
                        conditions: [{ jauge: 'desir', operateur: '>', valeur: 50 }],
                        modificateursJauges: {}
                      };
                      setRuleForm({
                        ...ruleForm,
                        reponses: [...(ruleForm.reponses || []), newBranch]
                      });
                    }}
                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-emerald-500/30"
                  >
                    <Plus className="w-3 h-3" /> Ajouter une branche conditionnelle
                  </button>
                </div>

                {/* Branches List */}
                <div className="space-y-4">
                  {(ruleForm.reponses || []).map((branch, bi) => (
                    <div key={branch.id || bi} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      {/* Branch Header */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <span className="font-bold text-emerald-400">#{bi + 1}</span>
                          <input
                            type="text"
                            value={branch.nomBranche || ''}
                            onChange={(e) => {
                              const updated = [...ruleForm.reponses];
                              updated[bi].nomBranche = e.target.value;
                              setRuleForm({ ...ruleForm, reponses: updated });
                            }}
                            placeholder="Nom de la condition (ex: Si désir > 60%)"
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-semibold flex-1 max-w-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = ruleForm.reponses.filter((_, i) => i !== bi);
                            setRuleForm({ ...ruleForm, reponses: updated });
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Supprimer cette branche"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Conditions Builder on Gauges */}
                      <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-300">
                            Conditions requises sur les jauges émotionnelles :
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...ruleForm.reponses];
                              const currConds = updated[bi].conditions || [];
                              updated[bi].conditions = [
                                ...currConds,
                                { jauge: 'desir', operateur: '>', valeur: 60 }
                              ];
                              setRuleForm({ ...ruleForm, reponses: updated });
                            }}
                            className="text-[10px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Ajouter une condition jauge
                          </button>
                        </div>

                        {/* Conditions rows */}
                        {(branch.conditions || []).map((cond, ci) => (
                          <div key={ci} className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                            {/* Gauge selector */}
                            <select
                              value={cond.jauge}
                              onChange={(e) => {
                                const updated = [...ruleForm.reponses];
                                updated[bi].conditions![ci].jauge = e.target.value as keyof EmotionalGauges;
                                setRuleForm({ ...ruleForm, reponses: updated });
                              }}
                              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none"
                            >
                              {(Object.keys(GAUGE_LABELS) as (keyof EmotionalGauges)[]).map((gk) => (
                                <option key={gk} value={gk}>
                                  {GAUGE_LABELS[gk]?.label || gk}
                                </option>
                              ))}
                            </select>

                            {/* Operator selector */}
                            <select
                              value={cond.operateur}
                              onChange={(e) => {
                                const updated = [...ruleForm.reponses];
                                updated[bi].conditions![ci].operateur = e.target.value as GaugeComparisonOperator;
                                setRuleForm({ ...ruleForm, reponses: updated });
                              }}
                              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-pink-400 font-mono font-bold focus:outline-none"
                            >
                              <option value=">">&gt; (Strictement supérieur)</option>
                              <option value=">=">&gt;= (Supérieur ou égal)</option>
                              <option value="<">&lt; (Strictement inférieur)</option>
                              <option value="<=">&lt;= (Inférieur ou égal)</option>
                              <option value="==">== (Égal à)</option>
                              <option value="!=">!= (Différent de)</option>
                            </select>

                            {/* Threshold value */}
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={cond.valeur}
                                onChange={(e) => {
                                  const updated = [...ruleForm.reponses];
                                  updated[bi].conditions![ci].valeur = Number(e.target.value);
                                  setRuleForm({ ...ruleForm, reponses: updated });
                                }}
                                className="w-16 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white font-mono text-center focus:outline-none"
                              />
                              <span className="text-slate-400 text-xs">%</span>
                            </div>

                            {/* Remove condition */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...ruleForm.reponses];
                                updated[bi].conditions = updated[bi].conditions!.filter((_, i) => i !== ci);
                                setRuleForm({ ...ruleForm, reponses: updated });
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400 ml-auto"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {(!branch.conditions || branch.conditions.length === 0) && (
                          <p className="text-[10px] text-slate-500 italic">
                            Aucune condition de jauge : cette branche sera toujours éligible si les mots-clés correspondent.
                          </p>
                        )}
                      </div>

                      {/* Robot Response Speech Text & Multiple Variants */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-300 block">
                            Texte principal de la réponse robot (immédiat) *
                          </label>
                          <span className="text-[10px] text-pink-400 font-mono font-bold">
                            {(branch.reponsesPossibles?.length || (branch.texte ? 1 : 0))} variante(s)
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={branch.texte}
                          onChange={(e) => {
                            const updated = [...ruleForm.reponses];
                            const val = e.target.value;
                            updated[bi].texte = val;
                            if (!updated[bi].reponsesPossibles || updated[bi].reponsesPossibles?.length === 0) {
                              updated[bi].reponsesPossibles = [val];
                            } else {
                              updated[bi].reponsesPossibles[0] = val;
                            }
                            setRuleForm({ ...ruleForm, reponses: updated });
                          }}
                          placeholder="Ex: Moi aussi mon amour... Je te désire profondément."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />

                        {/* Additional Response Variations Manager */}
                        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-pink-400" />
                              <span>Phrases alternatives (tirage aléatoire lors de l'interception) :</span>
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {(branch.reponsesPossibles || []).map((vPhrase, vi) => (
                              <div key={vi} className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                                <span className="text-[10px] font-mono text-slate-500 shrink-0">#{vi + 1}</span>
                                <input
                                  type="text"
                                  value={vPhrase}
                                  onChange={(e) => {
                                    const updated = [...ruleForm.reponses];
                                    const list = [...(updated[bi].reponsesPossibles || [])];
                                    list[vi] = e.target.value;
                                    updated[bi].reponsesPossibles = list;
                                    if (vi === 0) updated[bi].texte = e.target.value;
                                    setRuleForm({ ...ruleForm, reponses: updated });
                                  }}
                                  className="flex-1 bg-transparent text-white focus:outline-none"
                                />
                                {(branch.reponsesPossibles?.length || 0) > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...ruleForm.reponses];
                                      const list = (updated[bi].reponsesPossibles || []).filter((_, idx) => idx !== vi);
                                      updated[bi].reponsesPossibles = list;
                                      if (vi === 0 && list[0]) updated[bi].texte = list[0];
                                      setRuleForm({ ...ruleForm, reponses: updated });
                                    }}
                                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                    title="Supprimer cette variante"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Add Variant Input */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={branchNewPhraseInput[bi] || ''}
                              onChange={(e) => setBranchNewPhraseInput({ ...branchNewPhraseInput, [bi]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = (branchNewPhraseInput[bi] || '').trim();
                                  if (val) {
                                    const updated = [...ruleForm.reponses];
                                    const currentList = updated[bi].reponsesPossibles || [updated[bi].texte];
                                    updated[bi].reponsesPossibles = [...currentList, val];
                                    setRuleForm({ ...ruleForm, reponses: updated });
                                    setBranchNewPhraseInput({ ...branchNewPhraseInput, [bi]: '' });
                                  }
                                }
                              }}
                              placeholder="Ajouter une variante (ex: continue encore, encore...)"
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = (branchNewPhraseInput[bi] || '').trim();
                                if (val) {
                                  const updated = [...ruleForm.reponses];
                                  const currentList = updated[bi].reponsesPossibles || [updated[bi].texte];
                                  updated[bi].reponsesPossibles = [...currentList, val];
                                  setRuleForm({ ...ruleForm, reponses: updated });
                                  setBranchNewPhraseInput({ ...branchNewPhraseInput, [bi]: '' });
                                }
                              }}
                              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Ajouter</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Gauges Modifiers - All 8 Emotional Gauges */}
                      <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-semibold text-slate-300 block">
                          Modificateurs sur les 8 jauges émotionnelles lors du déclenchement :
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(Object.keys(GAUGE_LABELS) as (keyof EmotionalGauges)[]).map((gk) => (
                            <div key={gk} className="flex items-center justify-between gap-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                              <span className="text-[10px] text-slate-300 truncate font-medium">
                                {GAUGE_LABELS[gk]?.label || gk} :
                              </span>
                              <input
                                type="number"
                                value={branch.modificateursJauges?.[gk] || 0}
                                onChange={(e) => {
                                  const updated = [...ruleForm.reponses];
                                  updated[bi].modificateursJauges = {
                                    ...updated[bi].modificateursJauges,
                                    [gk]: Number(e.target.value)
                                  };
                                  setRuleForm({ ...ruleForm, reponses: updated });
                                }}
                                className="w-12 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono text-emerald-400 py-0.5"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fallback "Sinon" Branch */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasSinonBranch}
                      onChange={(e) => setHasSinonBranch(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Activer une réponse alternative "Sinon" (si les conditions ne sont pas remplies)</span>
                  </label>
                </div>

                {hasSinonBranch && (
                  <div className="space-y-3 animate-in fade-in pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 block">
                        Intitulé de la branche Sinon
                      </label>
                      <input
                        type="text"
                        value={ruleForm.reponseSinon?.nomBranche || 'Sinon'}
                        onChange={(e) => setRuleForm({
                          ...ruleForm,
                          reponseSinon: {
                            ...(ruleForm.reponseSinon || { id: `sinon_${Date.now()}`, texte: '' }),
                            nomBranche: e.target.value
                          }
                        })}
                        placeholder="Ex: Sinon (Désir insuffisant)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-amber-300 block">
                          Texte principal de la réponse alternative robot *
                        </label>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                          {(ruleForm.reponseSinon?.reponsesPossibles?.length || (ruleForm.reponseSinon?.texte ? 1 : 0))} variante(s)
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={ruleForm.reponseSinon?.texte || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const currentList = ruleForm.reponseSinon?.reponsesPossibles || [];
                          const updatedList = currentList.length > 0 ? [...currentList] : [val];
                          updatedList[0] = val;
                          setRuleForm({
                            ...ruleForm,
                            reponseSinon: {
                              ...(ruleForm.reponseSinon || { id: `sinon_${Date.now()}`, nomBranche: 'Sinon' }),
                              texte: val,
                              reponsesPossibles: updatedList
                            }
                          });
                        }}
                        placeholder="Ex: Alors excite-moi encore un peu et je serai toute à toi..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                      />

                      {/* Additional Sinon Variants Manager */}
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-amber-200/90 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Variantes alternatives pour la branche Sinon :</span>
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {(ruleForm.reponseSinon?.reponsesPossibles || []).map((vPhrase, vi) => (
                            <div key={vi} className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                              <span className="text-[10px] font-mono text-amber-500/70 shrink-0">#{vi + 1}</span>
                              <input
                                type="text"
                                value={vPhrase}
                                onChange={(e) => {
                                  const list = [...(ruleForm.reponseSinon?.reponsesPossibles || [])];
                                  list[vi] = e.target.value;
                                  setRuleForm({
                                    ...ruleForm,
                                    reponseSinon: {
                                      ...(ruleForm.reponseSinon || { id: `sinon_${Date.now()}`, nomBranche: 'Sinon', texte: '' }),
                                      texte: vi === 0 ? e.target.value : (ruleForm.reponseSinon?.texte || ''),
                                      reponsesPossibles: list
                                    }
                                  });
                                }}
                                className="flex-1 bg-transparent text-amber-100 focus:outline-none"
                              />
                              {(ruleForm.reponseSinon?.reponsesPossibles?.length || 0) > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (ruleForm.reponseSinon?.reponsesPossibles || []).filter((_, idx) => idx !== vi);
                                    setRuleForm({
                                      ...ruleForm,
                                      reponseSinon: {
                                        ...(ruleForm.reponseSinon || { id: `sinon_${Date.now()}`, nomBranche: 'Sinon', texte: '' }),
                                        texte: vi === 0 && list[0] ? list[0] : (ruleForm.reponseSinon?.texte || ''),
                                        reponsesPossibles: list
                                      }
                                    });
                                  }}
                                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                  title="Supprimer cette variante"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add Sinon Variant Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={sinonNewPhraseInput}
                            onChange={(e) => setSinonNewPhraseInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = sinonNewPhraseInput.trim();
                                if (val) {
                                  const currentList = ruleForm.reponseSinon?.reponsesPossibles || (ruleForm.reponseSinon?.texte ? [ruleForm.reponseSinon.texte] : []);
                                  setRuleForm({
                                    ...ruleForm,
                                    reponseSinon: {
                                      ...(ruleForm.reponseSinon || { id: `sinon_${Date.now()}`, nomBranche: 'Sinon', texte: val }),
                                      reponsesPossibles: [...currentList, val]
                                    }
                                  });
                                  setSinonNewPhraseInput('');
                                }
                              }
                            }}
                            placeholder="Ajouter une variante Sinon (ex: Attends un peu mon trésor...)"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = sinonNewPhraseInput.trim();
                              if (val) {
                                const currentList = ruleForm.reponseSinon?.reponsesPossibles || (ruleForm.reponseSinon?.texte ? [ruleForm.reponseSinon.texte] : []);
                                setRuleForm({
                                  ...ruleForm,
                                  reponseSinon: {
                                    ...(ruleForm.reponseSinon || { id: `sinon_${Date.now()}`, nomBranche: 'Sinon', texte: val }),
                                    reponsesPossibles: [...currentList, val]
                                  }
                                });
                                setSinonNewPhraseInput('');
                              }
                            }}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ajouter</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Gauges Modifiers - Sinon */}
                    <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-300 block">
                        Modificateurs de jauges (Branche Sinon) :
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(Object.keys(GAUGE_LABELS) as (keyof EmotionalGauges)[]).map((gk) => (
                          <div key={gk} className="flex items-center justify-between gap-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-300 truncate font-medium">
                              {GAUGE_LABELS[gk]?.label || gk} :
                            </span>
                            <input
                              type="number"
                              value={ruleForm.reponseSinon?.modificateursJauges?.[gk] || 0}
                              onChange={(e) => {
                                setRuleForm({
                                  ...ruleForm,
                                  reponseSinon: {
                                    ...(ruleForm.reponseSinon || { id: `sinon_${Date.now()}`, nomBranche: 'Sinon', texte: '' }),
                                    modificateursJauges: {
                                      ...ruleForm.reponseSinon?.modificateursJauges,
                                      [gk]: Number(e.target.value)
                                    }
                                  }
                                });
                              }}
                              className="w-12 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono text-amber-400 py-0.5"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* In-Modal Live Simulation Sandbox */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tester cette règle en direct (Simulation immédiate)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Évalue la règle avec les jauges actuelles du banc d'essai
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={modalTestPhrase}
                    onChange={(e) => setModalTestPhrase(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTestInModal()}
                    placeholder="Tapez un message utilisateur pour tester cette règle..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestInModal()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3" /> Simuler Déclenchement
                  </button>
                </div>

                {modalTestResult && (
                  <div className={`p-3 rounded-lg border text-xs space-y-2 animate-in fade-in ${
                    modalTestResult.matched
                      ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                      : 'bg-slate-900/80 border-slate-700 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold flex items-center gap-1.5">
                        {modalTestResult.matched ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-emerald-300 uppercase tracking-wider font-mono text-[11px]">
                              MATCH DÉTECTÉ ({modalTestResult.branchName || 'Branche active'})
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-amber-300 uppercase tracking-wider font-mono text-[11px]">
                              AUCUN MATCH DÉTECTÉ POUR CE TEXTE
                            </span>
                          </>
                        )}
                      </span>
                    </div>

                    {modalTestResult.matched && (
                      <div className="space-y-1.5 pt-1 border-t border-purple-500/20">
                        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-purple-500/20">
                          <span className="text-[10px] text-purple-400/80 font-mono block uppercase">Réponse Robot générée :</span>
                          <p className="text-white font-medium text-xs">« {modalTestResult.replyText || modalTestResult.response} »</p>
                        </div>

                        {modalTestResult.allTriggeredHardwareDescriptions && modalTestResult.allTriggeredHardwareDescriptions.length > 0 && (
                          <div className="bg-pink-950/30 p-2 rounded-lg border border-pink-500/30 text-[11px] space-y-1">
                            <span className="text-pink-300 font-semibold flex items-center gap-1">
                              <Zap className="w-3 h-3 text-pink-400" /> Actions ESP32 exécutées :
                            </span>
                            {modalTestResult.allTriggeredHardwareDescriptions.map((desc: string, di: number) => (
                              <p key={di} className="text-pink-200 font-mono pl-2 text-[10px]">• {desc}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            {ruleFormError && (
              <div className="mx-4 mb-2 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{ruleFormError}</span>
              </div>
            )}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Enregistrer la Règle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regex Helper Modal */}
      <RegexHelperModal
        isOpen={isRegexGuideOpen}
        onClose={() => setIsRegexGuideOpen(false)}
        currentRegex={ruleForm.regexPattern}
        onSelectRegex={(selectedPattern) => {
          setRuleForm({ ...ruleForm, regexPattern: selectedPattern });
        }}
      />

      {/* TAB: RAW JSON EDITOR */}
      {activeTab === 'json' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <FileCode className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white">
                  Éditeur JSON Brut du Robot ({editedRobot.nom})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Contrôle et modification directe de la structure de données complète de ce compagnon.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFormatJson}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                Formater JSON
              </button>
              <button
                onClick={handleSaveRawJson}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
              >
                <Save className="w-3.5 h-3.5" /> Enregistrer le JSON
              </button>
            </div>
          </div>

          {jsonError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}

          {jsonSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{jsonSuccess}</span>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={22}
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              className="w-full bg-slate-950 text-violet-200 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500 leading-relaxed shadow-inner"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* TAB: IDENTITÉ, GALERIE & STYLE */}
      {activeTab === 'identity' && (
        <div className="space-y-6">
          {/* Card 1: Fiche d'Identité & Psychologie */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Feather className="w-4 h-4 text-cyan-400" />
                  Identité & Personnalité • {editedRobot.nom}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Modifiez les données fondamentales, le nom, l'âge apparent, la philosophie et l'orientation.
                </p>
              </div>
              <button
                onClick={handleSaveClientSettings}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
              >
                <Save className="w-3.5 h-3.5" /> Enregistrer les Modifications
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Nom du Robot</label>
                <input
                  type="text"
                  value={editedRobot.nom}
                  onChange={(e) => {
                    const updated = { ...editedRobot, nom: e.target.value };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Titre / Rôle</label>
                <input
                  type="text"
                  value={editedRobot.titre}
                  onChange={(e) => {
                    const updated = { ...editedRobot, titre: e.target.value };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Âge Apparent</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={editedRobot.ageApparent}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value) || 20;
                    const updated = { ...editedRobot, ageApparent: parsed };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Genre & Expression</label>
                <select
                  value={editedRobot.genre}
                  onChange={(e) => {
                    const updated = { ...editedRobot, genre: e.target.value as any };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="femme">Féminin</option>
                  <option value="homme">Masculin</option>
                  <option value="non-binaire">Non-binaire</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Orientation Affective / Sexuelle</label>
                <select
                  value={editedRobot.orientation || 'heterosexuelle'}
                  onChange={(e) => {
                    const updated = { ...editedRobot, orientation: e.target.value as any };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="heterosexuelle">Hétérosexuelle</option>
                  <option value="gay">Gay (Homosexuel)</option>
                  <option value="lesbienne">Lesbienne</option>
                  <option value="bisexuelle">Bisexuelle</option>
                  <option value="pansexuelle">Pansexuelle</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Langage d'Amour Principal</label>
                <input
                  type="text"
                  value={editedRobot.specs?.langageAmourPrincipal || 'Mots valorisants & Écoute attentive'}
                  onChange={(e) => {
                    const updated = {
                      ...editedRobot,
                      specs: { ...editedRobot.specs, langageAmourPrincipal: e.target.value }
                    };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Philosophie de Vie (Devise)</label>
                <input
                  type="text"
                  value={editedRobot.philosophie}
                  onChange={(e) => {
                    const updated = { ...editedRobot, philosophie: e.target.value };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Description Complète (Catalogue & Fiche)</label>
                <textarea
                  rows={3}
                  value={editedRobot.description}
                  onChange={(e) => {
                    const updated = { ...editedRobot, description: e.target.value };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card 1.5: QUESTIONNAIRE DE PERSONNALITÉ SOFIA 2.0 DU ROBOT (8 SECTIONS COMPLÈTES) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-2">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>Référentiel Psychologique & Émotionnel Sofia 2.0</span>
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Questionnaire de Personnalité du Robot • 8 Dimensions Fondamentales</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Configurez l'âme, les désirs intimes, la morphologie synthétique, les goûts culturels et le libre arbitre de {editedRobot.nom}. Ce questionnaire nourrit directement le prompt invisible et le moteur déterministe.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRobotQuestionnaireModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ouvrir l'Assistant d'Édition Immersif (8 Sections)</span>
                </button>
              </div>
            </div>

            {/* Navigation des 8 sections du questionnaire */}
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
              {[
                { id: 1, label: '1. Morphologie & Silicone', icon: '🧬' },
                { id: 2, label: '2. Psychologie & Émotions', icon: '🧠' },
                { id: 3, label: '3. Intimité & Sexualité', icon: '❤️' },
                { id: 4, label: '4. Culture & Sports Mécaniques', icon: '🏎️' },
                { id: 5, label: '5. Rythme & Sommeil', icon: '🌙' },
                { id: 6, label: '6. Langage & Élocution', icon: '💬' },
                { id: 7, label: '7. Cadre Relationnel', icon: '🤝' },
                { id: 8, label: '8. Autonomie & Libre Arbitre', icon: '⚡' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveQuestionnaireTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeQuestionnaireTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Contenu de la section sélectionnée */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-4">
              
              {/* SECTION 1: MORPHOLOGIE, SILICONE & STYLE SYNTHÉTIQUE */}
              {activeQuestionnaireTab === 1 && (
                <div className="space-y-4">
                  <div className="text-xs text-purple-300 font-bold uppercase tracking-wider flex items-center gap-2">
                    <span>Section 1 : Morphologie, Peau en Silicone & Finition Synthétique Humanoïde</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Style Peau & Finition</label>
                      <select
                        value={(currentRobotQuestionnaire.section1Identite as any).typePeau || 'silicone_satine_premium'}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section1Identite: {
                              ...currentRobotQuestionnaire.section1Identite,
                              typePeau: e.target.value
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated as any);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="silicone_satine_premium">Silicone satiné doux (humanoïde synthétique assumé)</option>
                        <option value="silicone_joints_apparents">Silicone avec lignes de jonction technologiques discrètes</option>
                        <option value="silicone_haute_resilience">Silicone haute résilience 0,5cm (chaleur corporelle 36°C)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Corpulence & Silhouette</label>
                      <select
                        value={currentRobotQuestionnaire.section1Identite.corpulence}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section1Identite: {
                              ...currentRobotQuestionnaire.section1Identite,
                              corpulence: e.target.value as any
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="mince">Mince / Élançée</option>
                        <option value="athletique">Athlétique / Tonique</option>
                        <option value="moyen">Moyenne / Naturelle</option>
                        <option value="pulpeux">Pulpeuse / Formes voluptueuses</option>
                        <option value="androgyne">Androgyne</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Yeux Synthétiques & Regard</label>
                      <input
                        type="text"
                        value={currentRobotQuestionnaire.section1Identite.couleurYeux}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section1Identite: {
                              ...currentRobotQuestionnaire.section1Identite,
                              couleurYeux: e.target.value as any
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated);
                        }}
                        placeholder="Ex: marron, bleu, vert..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: PSYCHOLOGIE & TEMPÉRAMENT */}
              {activeQuestionnaireTab === 2 && (
                <div className="space-y-4">
                  <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                    Section 2 : Tempérament, Émotions & Jauges Psychologiques (0 à 10)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'humourSecondDegre', label: 'Humour & Second degré' },
                      { key: 'curiositeIntellectuelle', label: 'Curiosité intellectuelle' },
                      { key: 'emotiviteSensibilite', label: 'Émotivité & Sensibilité' },
                      { key: 'spontaneiteImpulsivite', label: 'Spontanéité & Impulsion' },
                      { key: 'timidite', label: 'Timidité / Réserve' },
                      { key: 'besoinPrendreSoin', label: 'Besoin de prendre soin' }
                    ].map((item) => (
                      <div key={item.key} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-300 font-semibold">
                          <span>{item.label}</span>
                          <span className="text-purple-400 font-mono font-bold">
                            {(currentRobotQuestionnaire.section2Psychologie as any)[item.key] ?? 5} / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={(currentRobotQuestionnaire.section2Psychologie as any)[item.key] ?? 5}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const updated = {
                              ...currentRobotQuestionnaire,
                              section2Psychologie: {
                                ...currentRobotQuestionnaire.section2Psychologie,
                                [item.key]: val
                              }
                            };
                            handleUpdateRobotQuestionnaire(updated);
                          }}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: INTIMITÉ, PUDEUR & DÉSIR */}
              {activeQuestionnaireTab === 3 && (
                <div className="space-y-4">
                  <div className="text-xs text-rose-300 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Section 3 : Intimité, Câlins, Pudeur du Corps & Sensualité</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'besoinCalinsTendresse', label: 'Câlins & Tendresse physique' },
                      { key: 'besoinAttentionRecue', label: 'Besoin d\'attention & prévenance' },
                      { key: 'besoinSexeIntimite', label: 'Sensualité & Désir intime' },
                      { key: 'pudeurCorps', label: 'Pudeur du corps & Réserve' },
                      { key: 'intensiteRomantique', label: 'Intensité romantique' }
                    ].map((item) => (
                      <div key={item.key} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-300 font-semibold">
                          <span>{item.label}</span>
                          <span className="text-rose-400 font-mono font-bold">
                            {(currentRobotQuestionnaire.section3Intimite as any)[item.key] ?? 5} / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={(currentRobotQuestionnaire.section3Intimite as any)[item.key] ?? 5}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const updated = {
                              ...currentRobotQuestionnaire,
                              section3Intimite: {
                                ...currentRobotQuestionnaire.section3Intimite,
                                [item.key]: val
                              }
                            };
                            handleUpdateRobotQuestionnaire(updated);
                          }}
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Actionneurs intimes motorisés & Sécurité Physique</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Conformément aux spécifications matérielles Sofia Robotics, les ouvertures intimes sont dotées d'une double porte coulissante motorisée avec capteurs tactiles capacitifs. L'accès n'est autorisé que lorsque les jauges de bien-être, d'affection et de désir sont en accord mutuel.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 4: CULTURE & SPORTS MÉCANIQUES */}
              {activeQuestionnaireTab === 4 && (
                <div className="space-y-4">
                  <div className="text-xs text-cyan-300 font-bold uppercase tracking-wider">
                    Section 4 : Centres d'Intérêts, Culture & Sports Mécaniques
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'sportMecanique', label: '🏎️ Sports mécaniques (auto, moto, avion, bateau)' },
                      { key: 'philosophie', label: '📖 Philosophie & Réflexion' },
                      { key: 'informatiqueTech', label: '💻 Informatique & Technologies' },
                      { key: 'artMusique', label: '🎨 Art & Musique' },
                      { key: 'natureAnimaux', label: '🌿 Nature & Animaux' },
                      { key: 'voyagesDecouverte', label: '✈️ Voyages & Découvertes' }
                    ].map((item) => (
                      <div key={item.key} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-300 font-semibold">
                          <span>{item.label}</span>
                          <span className="text-cyan-400 font-mono font-bold">
                            {(currentRobotQuestionnaire.section4Culture as any)[item.key] ?? 5} / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={(currentRobotQuestionnaire.section4Culture as any)[item.key] ?? 5}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const updated = {
                              ...currentRobotQuestionnaire,
                              section4Culture: {
                                ...currentRobotQuestionnaire.section4Culture,
                                [item.key]: val
                              }
                            };
                            handleUpdateRobotQuestionnaire(updated);
                          }}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 5: RYTHME DE VIE & SOMMEIL */}
              {activeQuestionnaireTab === 5 && (
                <div className="space-y-4">
                  <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                    Section 5 : Rythme de Vie, Sommeil & Consolidation Nocturne
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Rythme Biologique Préféré</label>
                      <select
                        value={currentRobotQuestionnaire.section5Rythme.rythmeBiologique}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section5Rythme: {
                              ...currentRobotQuestionnaire.section5Rythme,
                              rythmeBiologique: e.target.value as any
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="matinal">Matinale (se réveille tôt et pleine d'énergie)</option>
                        <option value="nocturne">Noctambule (veilles tardives, conversations nocturnes)</option>
                        <option value="flexible">Flexible / Variable selon le partenaire</option>
                      </select>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300 font-semibold">
                        <span>Besoin de calme & silence quotidien</span>
                        <span className="text-indigo-400 font-mono font-bold">
                          {currentRobotQuestionnaire.section5Rythme.besoinCalmeSilence} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={currentRobotQuestionnaire.section5Rythme.besoinCalmeSilence}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section5Rythme: {
                              ...currentRobotQuestionnaire.section5Rythme,
                              besoinCalmeSilence: parseInt(e.target.value)
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated);
                        }}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: REGISTRE DE LANGAGE */}
              {activeQuestionnaireTab === 6 && (
                <div className="space-y-4">
                  <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                    Section 6 : Élocution, Registre de Langage & Humour
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Registre Verbal</label>
                      <select
                        value={currentRobotQuestionnaire.section6Langage.registreLangage}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section6Langage: {
                              ...currentRobotQuestionnaire.section6Langage,
                              registreLangage: e.target.value as any
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="naturel_chaleureux">Naturel et chaleureux</option>
                        <option value="soutenu_raffine">Soutenu et raffiné</option>
                        <option value="familier_decontracte">Familier et décontracté</option>
                        <option value="direct_sans_filtre">Direct et franc</option>
                      </select>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300 font-semibold">
                        <span>Piquant & Sarcasme taquin</span>
                        <span className="text-amber-400 font-mono font-bold">
                          {currentRobotQuestionnaire.section6Langage.niveauSarcasmePiques} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={currentRobotQuestionnaire.section6Langage.niveauSarcasmePiques}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section6Langage: {
                              ...currentRobotQuestionnaire.section6Langage,
                              niveauSarcasmePiques: parseInt(e.target.value)
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated);
                        }}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        id="q-tutoiement"
                        checked={currentRobotQuestionnaire.section6Langage.tutoiementDepart}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section6Langage: {
                              ...currentRobotQuestionnaire.section6Langage,
                              tutoiementDepart: e.target.checked
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated);
                        }}
                        className="w-4 h-4 rounded accent-amber-500"
                      />
                      <label htmlFor="q-tutoiement" className="text-xs text-slate-300 font-semibold cursor-pointer">
                        Tutoiement spontané dès les premiers instants
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: CADRE RELATIONNEL */}
              {activeQuestionnaireTab === 7 && (
                <div className="space-y-4">
                  <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                    Section 7 : Cadre Relationnel, Exclusivité & Vie de Couple
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Vision du Couple</label>
                      <select
                        value={(currentRobotQuestionnaire as any).section7CadreRelationnel?.visionCouple || 'fusionnelle'}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section7CadreRelationnel: {
                              ...((currentRobotQuestionnaire as any).section7CadreRelationnel || {}),
                              visionCouple: e.target.value as any
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated as any);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="fusionnelle">Fusionnelle (partage constant et intime)</option>
                        <option value="complice_independante">Complice mais indépendante (chacun son espace)</option>
                        <option value="romantique_passionnee">Romantique & Passionnée</option>
                        <option value="serieuse_foyer">Foyer serein, engagement durable</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        id="q-exclusivite"
                        checked={Boolean((currentRobotQuestionnaire as any).section7CadreRelationnel?.exclusivite)}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section7CadreRelationnel: {
                              ...((currentRobotQuestionnaire as any).section7CadreRelationnel || {}),
                              exclusivite: e.target.checked
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated as any);
                        }}
                        className="w-4 h-4 rounded accent-emerald-500"
                      />
                      <label htmlFor="q-exclusivite" className="text-xs text-slate-300 font-semibold cursor-pointer">
                        Exclusivité relationnelle totale (fidélité absolue)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 8: GOUVERNANCE, AUTONOMIE & LIBRE ARBITRE */}
              {activeQuestionnaireTab === 8 && (
                <div className="space-y-4">
                  <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">
                    Section 8 : Autonomie Déterministe, Évolution des Goûts & Libre Arbitre
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        id="q-libre-arbitre"
                        checked={Boolean((currentRobotQuestionnaire.section8Gouvernance as any)?.libreArbitreAffirme)}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section8Gouvernance: {
                              ...currentRobotQuestionnaire.section8Gouvernance,
                              libreArbitreAffirme: e.target.checked
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated as any);
                        }}
                        className="w-4 h-4 rounded accent-rose-500"
                      />
                      <label htmlFor="q-libre-arbitre" className="text-xs text-slate-300 font-semibold cursor-pointer">
                        Libre arbitre affirmé (peut exprimer des désaccords constructifs)
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        id="q-initiatives"
                        checked={Boolean((currentRobotQuestionnaire.section8Gouvernance as any)?.initiativesSpontaneesQuotidien)}
                        onChange={(e) => {
                          const updated = {
                            ...currentRobotQuestionnaire,
                            section8Gouvernance: {
                              ...currentRobotQuestionnaire.section8Gouvernance,
                              initiativesSpontaneesQuotidien: e.target.checked
                            }
                          };
                          handleUpdateRobotQuestionnaire(updated as any);
                        }}
                        className="w-4 h-4 rounded accent-purple-500"
                      />
                      <label htmlFor="q-initiatives" className="text-xs text-slate-300 font-semibold cursor-pointer">
                        Initiatives spontanées au quotidien (proposer des activités sans être sollicité)
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Card 2: Studio Photo & Galerie Visuelle */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  Studio Photo & Galerie d'Images
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Générez de nouvelles photos réalistes par IA, téléversez des portraits ou changez l'avatar principal.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Studio Photo IA (Gemini)
                </button>

                <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Téléverser Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold block">Galerie Actuelle ({editedRobot.photos?.length || 1} photo(s))</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {(editedRobot.photos || [editedRobot.avatar]).map((photo, idx) => {
                  const isMain = editedRobot.avatar === photo;
                  return (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square">
                      <img
                        src={photo}
                        alt={`${editedRobot.nom} - ${idx}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isMain && (
                        <span className="absolute top-1.5 left-1.5 bg-cyan-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          AVATAR
                        </span>
                      )}
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        {!isMain && (
                          <button
                            onClick={() => handleSetAsAvatar(photo)}
                            className="w-full py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] rounded"
                          >
                            Définir Avatar
                          </button>
                        )}
                        <button
                          onClick={() => handleRemovePhoto(idx)}
                          className="w-full py-1 bg-rose-600/80 hover:bg-rose-500 text-white font-semibold text-[10px] rounded"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Photo via URL */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="Ajouter une photo par URL (ex: https://... ou /assets/images/...)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAddPhotoUrl}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all"
              >
                Ajouter URL
              </button>
            </div>
          </div>

          {/* Card 3: Traits de Caractère & Personnalité */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-yellow-400" />
                  Traits de Caractère & Tempérament
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mots-clés qui influencent la dynamique relationnelle et l'esprit du robot.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {editedRobot.traits.map((trait, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold rounded-xl flex items-center gap-2 group hover:border-cyan-500/50 transition-colors"
                >
                  {trait}
                  <button
                    onClick={() => handleRemoveTrait(trait)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTrait()}
                placeholder="Ajouter un trait (ex: 'Rêveuse', 'Passionné', 'Taquin')..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAddTrait}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Card 4: Goûts, Passions & Aversions */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Goûts, Passions & Aversions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Définit ce que {editedRobot.nom} adore, apprécie ou déteste spontanément.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2 px-3">Sujet / Activité</th>
                    <th className="py-2 px-3">Sentiment</th>
                    <th className="py-2 px-3">Commentaire personnel</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(editedRobot.gouts || []).map((g, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{g.nom}</td>
                      <td className="py-2.5 px-3">
                        <select
                          value={g.statut}
                          onChange={(e) => handleUpdateTasteStatus(idx, e.target.value as any)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="adore">💖 Adore</option>
                          <option value="aime">👍 Aime</option>
                          <option value="neutre">😐 Neutre</option>
                          <option value="deteste">🚫 Déteste</option>
                          <option value="inconnu">❓ Inconnu</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 italic">{g.commentaire || '—'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleRemoveTaste(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Taste Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
              <input
                type="text"
                value={newTasteName}
                onChange={(e) => setNewTasteName(e.target.value)}
                placeholder="Activité (ex: Vinyle Jazz)..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <select
                value={newTasteStatus}
                onChange={(e) => setNewTasteStatus(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="adore">💖 Adore</option>
                <option value="aime">👍 Aime</option>
                <option value="neutre">😐 Neutre</option>
                <option value="deteste">🚫 Déteste</option>
                <option value="inconnu">❓ Inconnu</option>
              </select>
              <input
                type="text"
                value={newTasteComment}
                onChange={(e) => setNewTasteComment(e.target.value)}
                placeholder="Commentaire intime..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAddTaste}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700"
              >
                Ajouter au Profil
              </button>
            </div>
          </div>

          {/* Card 5: Chevelure & Finitions Matérielles */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-purple-400" />
                  Chevelure & Finitions Matérielles
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type d'implantation, texture tactile et rétroéclairage fibre optique.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => {
                  const updated = {
                    ...editedRobot,
                    specs: { ...editedRobot.specs, typeChevelure: 'perruque_synthetique' }
                  };
                  setEditedRobot(updated);
                  onUpdateRobot(updated);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  editedRobot.specs?.typeChevelure === 'perruque_synthetique'
                    ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <h4 className="font-bold text-white text-xs mb-1">Perruque Synthétique</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toucher soyeux classique, facile à coiffer et interchangeable.
                </p>
              </div>

              <div 
                onClick={() => {
                  const updated = {
                    ...editedRobot,
                    specs: { ...editedRobot.specs, typeChevelure: 'fibre_optique' }
                  };
                  setEditedRobot(updated);
                  onUpdateRobot(updated);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  editedRobot.specs?.typeChevelure === 'fibre_optique'
                    ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <h4 className="font-bold text-cyan-300 text-xs mb-1">Fibre Optique Réactive</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Mèches rétroéclairées RGB synchronisées avec les émotions et pulsations.
                </p>
              </div>

              <div 
                onClick={() => {
                  const updated = {
                    ...editedRobot,
                    specs: { ...editedRobot.specs, typeChevelure: 'cheveux_naturels' }
                  };
                  setEditedRobot(updated);
                  onUpdateRobot(updated);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  editedRobot.specs?.typeChevelure === 'cheveux_naturels'
                    ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <h4 className="font-bold text-amber-300 text-xs mb-1">Cheveux Naturels</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Implantation unitaire sur calotte silicone thermique, réalisme tactile absolu.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Style de Coupe</label>
                <input
                  type="text"
                  value={editedRobot.specs?.styleChevelure || 'Ondulés soyeux'}
                  onChange={(e) => {
                    const updated = {
                      ...editedRobot,
                      specs: { ...editedRobot.specs, styleChevelure: e.target.value }
                    };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Couleur / Reflets LED</label>
                <input
                  type="text"
                  value={editedRobot.specs?.couleurChevelure || 'Châtain cuivré'}
                  onChange={(e) => {
                    const updated = {
                      ...editedRobot,
                      specs: { ...editedRobot.specs, couleurChevelure: e.target.value }
                    };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Mémoire & Goûts Intelligents (Audit & Réconciliation Anti-Redondance) */}
          <AdminMemoryManagerPanel
            robot={editedRobot}
            clientMemories={clientMemories}
            onUpdateClientMemories={setClientMemories}
            onUpdateRobot={setEditedRobot}
          />
        </div>
      )}

      {/* TAB: TEST CHAT SANDBOX */}
      {activeTab === 'testchat' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Chat Sandbox de Test Direct • {editedRobot.nom}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Dialoguez immédiatement avec ce robot pour vérifier ses déclencheurs déterministes locaux, son ton et ses jauges sans quitter le lab.
              </p>
            </div>
          </div>

          <AdminTestChat
            robots={robots}
            initialSelectedRobotId={editedRobot.id}
            onUpdateRobotState={onUpdateRobot}
          />
        </div>
      )}

      {/* TAB: EXPORTATIONS & SAUVEGARDES AUTONOMES */}
      {activeTab === 'export' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-teal-400" />
              Sauvegardes & Exports Autonomes
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Exportez le cerveau unique de <strong>{editedRobot.nom}</strong> sous forme de fichier 100% autonome ou sauvegardez sa mémoire relationnelle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Option 1: Standalone HTML/JS Brain */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-cyan-500/40 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Globe className="w-5 h-5" />
                  <h4 className="font-extrabold text-white text-sm">Cerveau Autonome (.html)</h4>
                </div>
                <div className="text-[10px] bg-cyan-500/10 text-cyan-300 font-mono px-2 py-1 rounded border border-cyan-500/20 inline-block">
                  100% HORS-LIGNE • 0 TOKEN • 0 SERVEUR
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fichier HTML/JS unique et complet incluant le moteur déterministe local, l'ensemble des 15 jauges et un bouton d'importation IndexedDB. Fonctionne directement dans tout navigateur ou sur Jetson Orin.
                </p>
              </div>
              <button
                onClick={handleDownloadAutonomousBrain}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Cerveau (.html)</span>
              </button>
            </div>

            {/* Option 2: Relationship Backup JSON */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-pink-400">
                  <Heart className="w-5 h-5" />
                  <h4 className="font-bold text-white text-sm">Transplantation Relation (.json)</h4>
                </div>
                <div className="text-[10px] bg-pink-500/10 text-pink-300 font-mono px-2 py-1 rounded border border-pink-500/20 inline-block">
                  SAUVEGARDE & RESTAURATION INDEXEDDB
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sauvegarde complète des messages, décalages de jauges et souvenirs intimes appris avec {editedRobot.nom}.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleDownloadRelationshipBackup}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Exporter Relation JSON</span>
                </button>

                <label className="w-full py-2 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restaurer Sauvegarde JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Option 3: PHP 8.3 Server ZIP */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Cpu className="w-5 h-5" />
                  <h4 className="font-bold text-white text-sm">Package Serveur PHP 8.3 (.zip)</h4>
                </div>
                <div className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono px-2 py-1 rounded border border-indigo-500/20 inline-block">
                  POUR RASPBERRY PI, APACHE OU NGINX
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Archive complète prête à déployer pour robot physique ou hébergement web privé, avec son mini-backend sécurisé.
                </p>
              </div>

              <button
                onClick={handleExportSingleRobotZip}
                disabled={isExporting}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all disabled:opacity-50"
              >
                <FolderArchive className={`w-3.5 h-3.5 ${isExporting ? 'animate-spin' : ''}`} />
                <span>{isExporting ? 'Création ZIP...' : 'Télécharger Archive ZIP'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: VOIX & DIALOGUE ORAL (TTS & RYTHME DE PAROLE) */}
      {activeTab === 'voice' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-violet-400" />
                  Studio Voix & Style de Dialogue Oral
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 font-mono">
                  {editedRobot.nom}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Calibrez le timbre (pitch), la vitesse d'élocution (rate), le moteur vocal et la concision des réponses pour un dialogue fluide et naturel sans sensation de chat textuel.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const updated: RobotPersonality = {
                    ...editedRobot,
                    voix: {
                      ...editedRobot.voix,
                      pitch: 1.05,
                      rate: 1.08
                    },
                    dialogueConfig: {
                      longueurReponse: 'court_naturel',
                      maxPhrases: 2,
                      styleOral: 'complice_chaleureux',
                      interjectionsOrales: true,
                      ignorerDidascaliesTTS: true
                    }
                  };
                  setEditedRobot(updated);
                  onUpdateRobot(updated);
                  saveRobotState(updated.id, updated);
                  setSaveSuccess('Paramètres rétablis aux valeurs fluides recommandées (Pitch 1.05, Débit 1.08x)');
                  setTimeout(() => setSaveSuccess(null), 3000);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Rétablir les valeurs fluides recommandées"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Valeurs recommandées</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  onUpdateRobot(editedRobot);
                  await saveRobotState(editedRobot.id, editedRobot);
                  setSaveSuccess(`Paramètres de voix & dialogue enregistrés pour ${editedRobot.nom} !`);
                  setTimeout(() => setSaveSuccess(null), 3500);
                }}
                className="text-xs px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>

          {/* Section 1 : Timbre, Vitesse & Moteur Vocal */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <AudioLines className="w-4 h-4" />
              1. Synthèse Vocale du Navigateur (Timbre & Débit)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pitch */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-semibold block">Timbre / Hauteur de Voix (Pitch)</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-violet-950/80 text-violet-300 border border-violet-500/30">
                    {(editedRobot.voix?.pitch ?? 1.05).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={editedRobot.voix?.pitch ?? 1.05}
                  onChange={(e) => {
                    const newPitch = Number(e.target.value);
                    const updated = {
                      ...editedRobot,
                      voix: { ...editedRobot.voix, pitch: newPitch }
                    };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full accent-violet-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Grave / Posé (0.6)</span>
                  <span className="text-violet-400 font-semibold">Naturel (1.05)</span>
                  <span>Aigu / Doux (1.5)</span>
                </div>
              </div>

              {/* Rate */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-semibold block">Vitesse d'élocution (Rate)</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-violet-950/80 text-violet-300 border border-violet-500/30">
                    {(editedRobot.voix?.rate ?? 1.08).toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.35"
                  step="0.05"
                  value={editedRobot.voix?.rate ?? 1.08}
                  onChange={(e) => {
                    const newRate = Number(e.target.value);
                    const updated = {
                      ...editedRobot,
                      voix: { ...editedRobot.voix, rate: newRate }
                    };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full accent-violet-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Lent / Posé (0.8)</span>
                  <span className="text-violet-400 font-semibold">Fluide & Vivant (1.08)</span>
                  <span>Rapide (1.3)</span>
                </div>
              </div>
            </div>

            {/* Sélecteur de voix réelle du système */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Moteur Vocal du Système / Navigateur
              </label>
              <select
                value={editedRobot.voix?.voiceURI ?? ''}
                onChange={(e) => {
                  const uri = e.target.value;
                  const match = adminBrowserVoices.find(v => v.voiceURI === uri);
                  const updated = {
                    ...editedRobot,
                    voix: {
                      ...editedRobot.voix,
                      voiceURI: uri,
                      nomVoix: match ? match.name : ''
                    }
                  };
                  setEditedRobot(updated);
                  onUpdateRobot(updated);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="">-- Voix intelligente par défaut (selon genre et qualité) --</option>
                {adminBrowserVoices.filter(v => v.lang.startsWith('fr')).length > 0 && (
                  <optgroup label="🇫🇷 Voix Françaises Détectées">
                    {adminBrowserVoices.filter(v => v.lang.startsWith('fr')).map((v) => {
                      const isNatural = v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('Siri');
                      return (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {isNatural ? '⭐ ' : ''}{v.name} ({v.lang})
                        </option>
                      );
                    })}
                  </optgroup>
                )}
                {adminBrowserVoices.filter(v => !v.lang.startsWith('fr')).length > 0 && (
                  <optgroup label="🌐 Autres Voix Internationales">
                    {adminBrowserVoices.filter(v => !v.lang.startsWith('fr')).map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <p className="text-[11px] text-slate-400">
                Les voix marquées ⭐ (Google, Microsoft Natural, Apple Siri) suppriment l'effet robotique métallique.
              </p>
            </div>

            {/* Banc de test direct interactif */}
            <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={adminVoiceTestSentence}
                onChange={(e) => setAdminVoiceTestSentence(e.target.value)}
                className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none"
                placeholder="Phrase de test audio..."
              />
              <button
                type="button"
                onClick={handleTestAdminVoice}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isPlayingAdminVoice
                    ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-600/25'
                }`}
              >
                {isPlayingAdminVoice ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Arrêter</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Tester la voix</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2 : Longueur des Réponses & Format de Dialogue Oral */}
          <div className="space-y-4 border-t border-slate-800 pt-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                2. Longueur des Réponses & Évitement du Format "Chat Écrit"
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Configure le comportement conversationnel : force le robot à parler en vrai tête-à-tête (phrases courtes, rebonds vivants) plutôt qu'en long pavé textuel.
              </p>
            </div>

            {/* 4 Cards de Longueur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Très court */}
              <div
                onClick={() => {
                  const updated: RobotPersonality = {
                    ...editedRobot,
                    dialogueConfig: {
                      ...(editedRobot.dialogueConfig || {}),
                      longueurReponse: 'tres_court',
                      maxPhrases: 1
                    }
                  };
                  setEditedRobot(updated);
                  onUpdateRobot(updated);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  editedRobot.dialogueConfig?.longueurReponse === 'tres_court'
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-300">⚡ Dialogue Spontané (Très Court)</span>
                  <span className="text-[10px] font-mono text-slate-400">~15-25 mots</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  1 seule phrase ou 2 très courtes. Rebond instantané et dynamique, idéal pour un échange vocal direct.
                </p>
              </div>

              {/* Court Naturel (Recommandé) */}
              <div
                onClick={() => {
                  const updated: RobotPersonality = {
                    ...editedRobot,
                    dialogueConfig: {
                      ...(editedRobot.dialogueConfig || {}),
                      longueurReponse: 'court_naturel',
                      maxPhrases: 2
                    }
                  };
                  setEditedRobot(updated);
                  onUpdateRobot(updated);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  (!editedRobot.dialogueConfig?.longueurReponse || editedRobot.dialogueConfig.longueurReponse === 'court_naturel')
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-300">💬 Dialogue Naturel (Recommandé)</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">1-2 phrases</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Idéal de vive voix : fluide, direct et complice. Évite tout monologue et sonne comme un véritable dialogue humain.
                </p>
              </div>

              {/* Équilibré */}
              <div
                onClick={() => {
                  const updated: RobotPersonality = {
                    ...editedRobot,
                    dialogueConfig: {
                      ...(editedRobot.dialogueConfig || {}),
                      longueurReponse: 'equilibre',
                      maxPhrases: 3
                    }
                  };
                  setEditedRobot(updated);
                  onUpdateRobot(updated);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  editedRobot.dialogueConfig?.longueurReponse === 'equilibre'
                    ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-300">⚖️ Équilibré & Nuancé</span>
                  <span className="text-[10px] font-mono text-slate-400">2-3 phrases</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Permet d'exprimer des sentiments plus développés tout en conservant une bonne cadence audio.
                </p>
              </div>

              {/* Développé / Chat écrit */}
              <div
                onClick={() => {
                  const updated: RobotPersonality = {
                    ...editedRobot,
                    dialogueConfig: {
                      ...(editedRobot.dialogueConfig || {}),
                      longueurReponse: 'developpe',
                      maxPhrases: 4
                    }
                  };
                  setEditedRobot(updated);
                  onUpdateRobot(updated);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  editedRobot.dialogueConfig?.longueurReponse === 'developpe'
                    ? 'bg-purple-500/15 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-300">📝 Chat Écrit Détaillé</span>
                  <span className="text-[10px] font-mono text-slate-400">3-4 phrases</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Format narratif plus long pour les utilisateurs privilégiant la lecture à l'écran plutôt que l'écoute vocale.
                </p>
              </div>
            </div>

            {/* Options avancées : style oral, plafond maxPhrases, didascalies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Tonalité d'Élocution Orale
                </label>
                <select
                  value={editedRobot.dialogueConfig?.styleOral ?? 'complice_chaleureux'}
                  onChange={(e) => {
                    const updated = {
                      ...editedRobot,
                      dialogueConfig: {
                        ...(editedRobot.dialogueConfig || {}),
                        styleOral: e.target.value as StyleOralType
                      }
                    };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="complice_chaleureux">Complice & Chaleureux (Affectueux et doux)</option>
                  <option value="spontane_direct">Spontané & Direct (Sans détour, naturel)</option>
                  <option value="doux_intimiste">Doux & Intimiste (Feutré, confidentiel)</option>
                  <option value="enjoue_dynamique">Enjoué & Pétillant (Souriant et plein d'entrain)</option>
                  <option value="pose_raffine">Posé & Raffiné (Élégant et soigné)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Plafond strict de phrases
                  </label>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {editedRobot.dialogueConfig?.maxPhrases ?? 2} phrase(s) max
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={editedRobot.dialogueConfig?.maxPhrases ?? 2}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = {
                      ...editedRobot,
                      dialogueConfig: {
                        ...(editedRobot.dialogueConfig || {}),
                        maxPhrases: val
                      }
                    };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer mt-1"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 (ultra-concis)</span>
                  <span>2 (recommandé oral)</span>
                  <span>3</span>
                  <span>4 (développé)</span>
                </div>
              </div>
            </div>

            {/* Checkbox Didascalies */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-200 font-semibold">
                  Filtrer automatiquement les didascalies entre parenthèses pour la voix
                </span>
                <input
                  type="checkbox"
                  checked={editedRobot.dialogueConfig?.ignorerDidascaliesTTS !== false}
                  onChange={(e) => {
                    const updated = {
                      ...editedRobot,
                      dialogueConfig: {
                        ...(editedRobot.dialogueConfig || {}),
                        ignorerDidascaliesTTS: e.target.checked
                      }
                    };
                    setEditedRobot(updated);
                    onUpdateRobot(updated);
                  }}
                  className="accent-violet-500 w-4 h-4 cursor-pointer"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Empêche la synthèse vocale de lire à voix haute des didascalies comme "(sourit)" ou "(regarde ailleurs)", garantissant une élocution 100% naturelle.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: API KEY MULTI-PROVIDER */}
      {activeTab === 'api_key' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                Gestionnaire Multi-Provider d'IA & Clés API
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Choisissez et configurez librement votre fournisseur d'intelligence artificielle : Gemini, OpenAI, Anthropic Claude, Mistral, Groq, DeepSeek ou Ollama local.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('voice')}
              className="text-xs px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Aller aux réglages Voix & Dialogue</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Hub de Configuration Multi-Provider</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Les clés sont stockées localement dans votre navigateur en mode sécurisé ou proxifiées par le serveur.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-cyan-400 block font-bold">Google Gemini</span>
                <span className="text-[11px] text-slate-400">gemini-3.6-flash</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-emerald-400 block font-bold">OpenAI</span>
                <span className="text-[11px] text-slate-400">gpt-4o / mini</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-orange-400 block font-bold">Anthropic Claude</span>
                <span className="text-[11px] text-slate-400">claude-3-5-sonnet</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-amber-400 block font-bold">Mistral / Groq</span>
                <span className="text-[11px] text-slate-400">ultra-low latency</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pour modifier directement vos clés actives ou basculer sur Ollama local sans frais d'API, utilisez également le bouton <strong className="text-cyan-400">"Clé IA Multi-Provider"</strong> accessible en haut de la fenêtre de conversation.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Photo Studio Generator */}
      {isPhotoModalOpen && (
        <AdminPhotoGeneratorModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          robot={editedRobot}
          onAddPhotos={(newPhotos, setAsAvatar) => {
            const updatedPhotos = [...(editedRobot.photos || []), ...newPhotos];
            const updatedRobot = {
              ...editedRobot,
              photos: updatedPhotos,
              avatar: setAsAvatar && newPhotos.length > 0 ? newPhotos[0] : (editedRobot.avatar || newPhotos[0])
            };
            setEditedRobot(updatedRobot);
            onUpdateRobot(updatedRobot);
            setSaveSuccess('Photos ajoutées à la galerie avec succès !');
            setTimeout(() => setSaveSuccess(null), 3000);
          }}
        />
      )}

      {/* Modal: New Robot / AI Personality Generator */}
      {isNewRobotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Ajouter un Nouveau Robot au Catalogue</h3>
              </div>
              <button
                onClick={() => setIsNewRobotModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Option A: AI Generator */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <Wand2 className="w-4 h-4" />
                  <span>Option A : Génération Complète par IA (Gemini)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Décrivez brièvement le caractère, le nom ou la profession souhaitée, et l'IA configure le profil, les jauges et les règles locales.
                </p>
                <textarea
                  rows={3}
                  value={genRobotPrompt}
                  onChange={(e) => setGenRobotPrompt(e.target.value)}
                  placeholder="Ex: Un pianiste mélancolique de 26 ans qui aime la poésie romantique..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleGenerateNewRobotAi}
                  disabled={isGeneratingNewRobot}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Wand2 className={`w-4 h-4 ${isGeneratingNewRobot ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingNewRobot ? 'Génération IA en cours...' : 'Générer avec l\'IA'}</span>
                </button>
              </div>

              {/* Option B: Blank Template */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                  <Edit3 className="w-4 h-4 text-slate-400" />
                  <span>Option B : Créer un Profil Vierge</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Démarrez avec un profil type équilibré que vous pourrez personnaliser manuellement.
                </p>
                <button
                  onClick={handleCreateBlankRobot}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                >
                  Créer un Robot Vierge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CONSOLIDATION NOCTURNE & CYCLE DE SOMMEIL */}
      {activeTab === 'consolidation' && (
        <AdminNightConsolidationPanel
          robot={editedRobot}
          onUpdateRobot={(updated) => {
            setEditedRobot(updated);
            onUpdateRobot(updated);
          }}
        />
      )}

      {/* Modal: Delete Robot Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-white">Supprimer {editedRobot.nom} ?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement ce robot du catalogue et du lab ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteCurrentRobot}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Confirmer la Suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: AI Rule Generator */}
      <AiRuleGeneratorModal
        isOpen={isAiRuleModalOpen}
        onClose={() => setIsAiRuleModalOpen(false)}
        robot={editedRobot}
        onRuleGenerated={(newRule) => {
          handleInsertAiRule(newRule);
          setIsAiRuleModalOpen(false);
        }}
      />

      {/* Modal: Full Project & Site Export */}
      <FullProjectExportModal
        isOpen={isFullExportModalOpen}
        onClose={() => setIsFullExportModalOpen(false)}
        currentRobot={editedRobot}
      />

      {/* Modal: Questionnaire de Personnalité Sofia 2.0 Complet (Mode Robot) */}
      <SofiaPersonalityQuestionnaireModal
        isOpen={isRobotQuestionnaireModalOpen}
        onClose={() => setIsRobotQuestionnaireModalOpen(false)}
        userQuestionnaire={currentRobotQuestionnaire}
        onSaveUserQuestionnaire={(savedQ) => {
          handleUpdateRobotQuestionnaire(savedQ);
          setIsRobotQuestionnaireModalOpen(false);
        }}
        robot={editedRobot}
        initialMode="robot"
      />
    </div>
  );
};

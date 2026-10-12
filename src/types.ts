import { SofiaPersonalityProfile2 } from './types/questionnaireSofia2';

export interface EmotionalGauges {
  affection: number;        // 0 - 100 : Attachement & tendresse
  energie: number;          // 0 - 100 : Vitalité et dynamisme
  humeur: number;           // 0 - 100 : Joie de vivre & humeur positive
  desir: number;            // 0 - 100 : Désir & magnétisme charnel
  curiosite: number;        // 0 - 100 : Curiosité pour l'autre & ouverture
  bienEtre: number;         // 0 - 100 : Sérénité & paix intérieure
  plaisir: number;          // 0 - 100 : Plaisir des moments partagés
  plaisirSexuel: number;    // 0 - 100 : Épanouissement & sensualité intime
  
  // Nouvelles jauges de complexité psychologique & d'altérité
  humour: number;           // 0 - 100 : Tendance à rire, faire des blagues, dédramatiser
  sarcasme: number;         // 0 - 100 : Répartie piquante, taquineries affectueuses
  psychoRigidite: number;   // 0 - 100 : Respect strict des principes & routines vs spontanéité
  besoinAmour: number;      // 0 - 100 : Recherche de mots doux, câlins et preuves d'amour
  besoinSexualite: number;  // 0 - 100 : Appétit pour l'intimité sensuelle et érotique
  besoinPrendreSoin: number;// 0 - 100 : Aime que l'utilisateur prenne soin d'elle/lui vs indépendance
  sensibiliteEmotionnelle: number; // 0 - 100 : Réactivité aux attentions et aux frictions
}

export interface RobotPsychologicalSpecs {
  compatibiliteRos?: string;        // ex: 'ROS 2 (Humble, Iron, Jazzy) & ROS 1 Noetic'
  archetypePsychologique?: string;  // ex: 'Artiste introspective & Romantique'
  styleAttachement?: string;        // ex: 'Sécurisant & Complice'
  langageAmourPrincipal?: string;   // ex: 'Mots valorisants & Temps de qualité'
  modeInteraction?: string;         // ex: 'Bridge ROS 2 Temps-Réel / Dialogue & Action'
  frequenceEmotionnelleHz?: number; // ex: 20
  topicsSupportes?: string[];       // ex: ['/cmd_vel', '/emotion_state', '/speech_tts', '/facial_expressions', '/touch_sensors']
  // Optional legacy fields for backward compatibility
  tailleCm?: number;
  poidsKg?: number;
  structure?: string;
  revetement?: string;
  teint?: string;
  yeuxCapteurs?: string;
  couleurYeux?: string;
  batterie?: number;
  enRechargeInduction?: boolean;
  typeChevelure?: string;
  styleChevelure?: string;
  couleurChevelure?: string;
  matiereChevelure?: string;
  chevelureFibreOptique?: { couleurLedHex: string; mode?: string };
  typeAndroide?: string;
  finitionPeau?: string;
  microLignesCybernetiques?: string;
  capteursOptiques?: string;
  ledTempeCouleur?: string;
  descriptionVisuelle?: string;
}

export type RobotPhysicalSpecs = RobotPsychologicalSpecs;

export type HairType = 'perruque_synthetique' | 'fibre_optique_reactive' | 'cheveux_naturels_soyeux';

export type AiProviderType = 'gemini' | 'openai' | 'anthropic' | 'mistral' | 'groq' | 'deepseek' | 'custom_ollama';

export interface AiProviderConfig {
  provider: AiProviderType;
  apiKey: string;
  baseUrl?: string;          // Pour Ollama ou endpoints compatibles OpenAI
  modelName: string;
  customHeaders?: Record<string, string>;
}

export interface TasteEntry {
  id?: string;
  nom: string;
  statut: 'adore' | 'aime' | 'mitige' | 'deteste' | 'inconnu';
  commentaire?: string;
  decouvertAvecUtilisateur?: boolean;
  decouvertLe?: string;
  dateMaj?: string;
}

export type LongueurDialogueType = 'tres_court' | 'court_naturel' | 'equilibre' | 'developpe';
export type StyleOralType = 'spontane_direct' | 'complice_chaleureux' | 'doux_intimiste' | 'enjoue_dynamique' | 'pose_raffine';

export interface DialogueOralConfig {
  longueurReponse?: LongueurDialogueType;
  maxPhrases?: number;
  styleOral?: StyleOralType;
  interjectionsOrales?: boolean;
  ignorerDidascaliesTTS?: boolean;
}

export type DefenseModeLevel = 
  | 'nominal' 
  | 'tension_cps' 
  | 'objet_inerte_defense' 
  | 'reconstruction_apaisement';

export interface RobotDefenseState {
  actif: boolean;
  niveau: DefenseModeLevel;
  raisonDeclenchement?: string;
  declencheurType?: 'verbal_violence' | 'physical_shock' | 'intimate_coercion' | 'chute_confiance';
  capteursIntimesCoupes: boolean;      // Retour haptique, sensations et simulation de plaisir désactivés (0% plaisir)
  verrouillageMecanique: boolean;      // Portes coulissantes motorisées verrouillées / actionneurs en mode passif
  alteriteDesactivee: boolean;         // Composant relationnel/humain éteint (effet miroir : objet inerte sans âme)
  dateDeclenchement?: string;
  pointsBienveillanceConsecutifs: number; // Restauration progressive si l'utilisateur s'apaise et parle avec respect
}

export interface RobotPersonality {
  id: string;
  nom: string;
  titre: string;
  ageApparent: number;
  avatar: string;
  photos: string[];
  description: string;
  temperament: string;
  traits: string[];
  attentes: string[];
  philosophie: string;
  gouts: TasteEntry[];
  jaugesInitiales: EmotionalGauges;
  jaugesActuelles: EmotionalGauges;
  specs: RobotPsychologicalSpecs;
  voix: {
    pitch: number;
    rate: number;
    lang: string;
    nomVoix: string;
    voiceURI?: string;
    volume?: number;
  };
  dialogueConfig?: DialogueOralConfig;
  reglesLocales: LocalDeterministicRule[];
  directivesSupplementaires?: string;
  promptSystemePersonnalise?: string;
  promptSystemePrincipal?: string;
  descriptionCourte?: string;
  genre?: 'femme' | 'homme' | 'non-binaire';
  orientation?: 'heterosexuelle' | 'lesbienne' | 'gay' | 'bisexuelle' | 'pansexuelle';
  signeAstrologique?: string;
  langageAmour?: string;
  styleAttachement?: string;
  citationFavorite?: string;
  compatibiliteRos?: string;
  vibeDating?: string;
  evolutionPsychologique?: {
    stadeAttachement: string;
    reflexionsNocturnes?: string[];
    philosophiePersonnelle?: string;
    maturiteRelationnelle?: number;
    derniereEvolution?: string;
  };
  programmeConsolidationNocturne?: ProgrammeConsolidationNocturne;
  journalDeBordNocturne?: Array<{
    date: string;
    resume: string;
    faitsConsolides: number;
    insights: string;
  }>;
  vieAutonome?: VieAutonomeConfig;
  activitesAutonomes?: AutonomousActivity[];
  dernierePresenceUtilisateur?: string;
  questionnaire2?: SofiaPersonalityProfile2;
  modeDefense?: RobotDefenseState;
  clientMemories?: any[];
  notesRelationnelles?: any[];
  cycleCircadien?: CircadianCycleConfig;
  diagnosticMecatronique?: MecatronicHealthDiagnostic;
  visionSpatialeObjets?: DetectedDailyObject[];
  moteurVocalOffline?: LocalOfflineTtsConfig;
}

// 1. CYCLE CIRCADIEN & SOMMEIL RÉALISTE
export type CircadianPhase = 
  | 'matin_reveil' 
  | 'journee_active' 
  | 'crepuscule_detente' 
  | 'nuit_alourdissement' 
  | 'sommeil_profond';

export interface CircadianCycleConfig {
  actif: boolean;
  heureReveil: string; // "07:30"
  heureCoucher: string; // "23:00"
  phaseActuelle: CircadianPhase;
  niveauSomnolence: number; // 0 (très alerte) à 100 (endormie)
  rythmeRespiratoireBpm: number; // 14 en journée, 6-8 en sommeil
  voixFeutree: boolean;
  paupieresLourdes: boolean;
  modeVeilleBasseConso: boolean;
  dernierChangementPhase?: string;
  forceeManuellement?: boolean;
}

// 2. VISION SPATIALE ACTIVE & OBJETS DU QUOTIDIEN
export interface DetectedDailyObject {
  id: string;
  nom: string; // "Tasse de café", "Livre de chevet", "T-shirt bleu", "Smartphone"
  categorie: 'boisson' | 'nourriture' | 'lecture' | 'vetement' | 'technologie' | 'accessoire' | 'autre';
  confiancePourcent: number;
  boiteEnglobante?: { x: number; y: number; w: number; h: number };
  contexteSpatial: string; // "Sur le bureau à droite", "Tenu dans la main", "Porté sur toi"
  remarqueSpontanee: string; // "Tu bois du café ?", "Quel est ce livre sur ton bureau ?"
  timestamp: string;
  interagi: boolean;
}

// 3. CARNET DE SANTÉ & DIAGNOSTIC MÉCATRONIQUE PRÉVENTIF
export interface ServomotorHealth {
  id: string;
  nom: string; // "Cou - Yaw", "Épaule Droite", "Vérin Jambe G", "Mâchoire & Lèvres"
  partieCorps: RobotBodyPart;
  temperatureC: number;
  maxTemperatureC: number;
  torqueUsagePercent: number;
  statut: 'optimal' | 'avertissement' | 'surchauffe';
}

export interface MecatronicHealthDiagnostic {
  batterieLiFePO4: {
    pourcentage: number;
    tensionVolts: number;
    cyclesRecharge: number;
    santePourcent: number;
    temperatureC: number;
    autonomieEstimeeHeures: number;
    enCharge: boolean;
  };
  servomoteurs: ServomotorHealth[];
  usureCablesFlexPourcent: number; // Index d'usure des faisceaux souples
  cyclesMecaniquesEffectues: number;
  etatGlobal: 'parfait' | 'surveillance' | 'maintenance_requise';
  alertesPreventives: string[];
  derniereMaintenanceDate?: string;
}

// 4. MOTEUR VOCAL TTS LOCAL INTÉGRÉ (100% HORS-LIGNE)
export interface LocalOfflineTtsConfig {
  actif: boolean;
  moteur: 'piper' | 'kokoro' | 'systeme_natif';
  modeleId: string; // "fr_FR-siwis-medium", "kokoro-fr-v1", "piper-female-sweet"
  timbre: 'doux_feutre' | 'sensuel_chaleureux' | 'calme_naturel';
  endpointLocalUrl?: string; // "http://localhost:5000/tts"
  modeHorsLignePur: boolean;
  latenceMsEstimee: number;
}

export type AutonomousActivityType = 
  | 'musique' 
  | 'film_serie' 
  | 'lecture_culture' 
  | 'actualites' 
  | 'chant_creatif' 
  | 'meditation_introspection' 
  | 'observation_nature';

export interface AutonomousActivity {
  id: string;
  date: string; // ISO string
  type: AutonomousActivityType;
  titre: string;
  description: string;
  ressenti: string;
  anecdotePartageable: string; // Anecdote spontanée racontée à l'utilisateur
  goutAssocie?: string;
  evolutionGout?: {
    nom: string;
    action: 'renforce' | 'decouverte' | 'nuance';
    ancienStatut?: TasteEntry['statut'];
    nouveauStatut: TasteEntry['statut'];
    explication: string;
  };
  humeurAssociee?: string;
  partageAvecUtilisateur?: boolean;
}

export interface VieAutonomeConfig {
  actif: boolean;
  frequenceMinutes: number;
  derniereSessionPresence?: string;
  derniereSimulation?: string;
  partageSpontaneActif: boolean;
  prochainsDesirs?: string[];
}

export interface ProgrammeConsolidationNocturne {
  heureExecution: string;             // Format "HH:mm", ex: "03:00" ou "23:30"
  autoExecuterSansSocle: boolean;      // Exécuter même si le robot n'est pas posé sur son oreiller/socle de recharge
  seuilBatterieMin: number;           // Seuil minimal de batterie en % requis (ex: 20%)
  derniereExecution?: string;         // Horodatage ISO de la dernière consolidation
  notifierAuReveil?: boolean;         // Envoyer un message chaleureux au réveil
  actif: boolean;                     // Activation globale de la programmation
}

export interface UserRelationEntry {
  id: string;
  nom: string;
  lien: 'famille' | 'ami' | 'collegue' | 'conjoint' | 'connaissance' | 'autre';
  description: string;
  derniereMention?: string;
  importance?: 'haute' | 'moyenne' | 'basse';
  anecdotesLiees?: string[];
}

export interface UserAnecdoteEntry {
  id: string;
  titre: string;
  detail: string;
  dateMention: string;
  emotionAssociee?: string;
  personnesImpliquees?: string[];
}

export interface UserPsychologicalProfile {
  traitsDominants: string[];
  besoinsAffectifs: string[];
  etatDespritActuel: string;
  dynamiqueRelationnelle: string;
  pointsSensibles?: string[];
  derniereAnalyse?: string;
}

export type GaugeComparisonOperator = '>' | '>=' | '<' | '<=' | '==' | '!=';

export interface SingleGaugeCondition {
  jauge: keyof EmotionalGauges;
  operateur: GaugeComparisonOperator;
  valeur: number;
}

export interface DeterministicBranchResponse {
  id?: string;
  nomBranche?: string; // ex: "Si désir > 60%", "Si humeur < 20%"
  texte: string;
  reponsesPossibles?: string[]; // Variantes multiples de répliques pour éviter les répétitions
  textes?: string[];           // Alias alternatif pour rétro-compatibilité
  modificateursJauges?: Partial<EmotionalGauges>;
  actionMaterielle?: string;
  
  // Single or multiple conditions support
  conditions?: SingleGaugeCondition[];
  conditionLogic?: 'AND' | 'OR';

  // Legacy single condition support (backward compatibility)
  conditionJauge?: {
    jauge: keyof EmotionalGauges;
    min?: number;
    max?: number;
  };
  conditionMoment?: 'matin' | 'apres-midi' | 'soir' | 'nuit' | 'tous';
  isFallback?: boolean;
}

export interface LocalDeterministicRule {
  id: string;
  nom: string;
  description?: string;
  motsCles: string[];        // Expressions ou mots-clés stricts (avec délimiteurs \b)
  regexPattern?: string;     // Pattern regex optionnel
  declencheurCapteurRos?: string; // Ex: "/sensor/tactile/intime", "/robot/touch/body", "/esp32/touch_pin_4"
  raccourciClavier?: string;     // Raccourci clavier (ex: "s", "c", "p", "KeyS", "1")
  typeDeclencheur?: 'texte' | 'texte_local' | 'capteur_ros' | 'raccourci_clavier' | 'hybride';
  reponses: DeterministicBranchResponse[];
  reponseSinon?: DeterministicBranchResponse; // Branche 'sinon' si aucune condition n'est satisfaite
}

export interface UserMemoryFact {
  id: string;
  categorie: 'gouts' | 'travail' | 'famille_amis' | 'emotions' | 'anecdotes' | 'biographie' | 'secret' | 'routine' | 'autre';
  fait: string;
  date: string;
  importance: 'haute' | 'moyenne' | 'basse';
}

export interface UserProfileLocal {
  id: string;
  prenom: string;
  nom?: string;
  centresInteret: string[];
  faits: UserMemoryFact[];
  scoreCompatibilite: number;
  dateRencontre: string;
  impressionsDuRobot: string[];
  derniereConsolidation?: string;
  cercleRelationnel?: UserRelationEntry[];
  profilPsychologique?: UserPsychologicalProfile;
  anecdotes?: UserAnecdoteEntry[];
  questionnaire2?: SofiaPersonalityProfile2;
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string; // MIME type (e.g. 'image/jpeg', 'audio/mp3', 'video/mp4', 'application/pdf', 'text/plain')
  category: 'image' | 'audio' | 'video' | 'document' | 'other';
  dataBase64?: string; // Data URL or clean base64
  textSnippet?: string; // Text content if it's code/text
  url?: string;
}

export interface CameraVisionSnapshot {
  capturedAt: string;
  imageBase64: string;
  source: 'webcam' | 'smartphone' | 'ros_camera';
  faceDetected?: boolean;
  lighting?: string;
  detectedPersonName?: string;
}

export interface ChatMessage {
  id: string;
  robotId: string;
  sender: 'user' | 'robot' | 'system';
  text: string;
  timestamp: string;
  source: 'local_engine' | 'generative_ai' | 'night_consolidation' | 'system';
  deltasJauges?: Partial<EmotionalGauges>;
  attachments?: MessageAttachment[];
  audioBase64?: string;
  visionSnapshot?: CameraVisionSnapshot;
  isProjectCollaboration?: boolean;
  suggestedRobotSwitch?: {
    robotId: string;
    robotName: string;
    robotTitle: string;
    avatar?: string;
  };
  localEngineDebug?: {
    matched: boolean;
    triggerType?: 'mot_cle' | 'regex' | 'prenom' | 'fallback' | 'llm_fallback';
    matchedTriggerValue?: string;
    ruleName?: string;
    branchName?: string;
    matchExplanation?: string;
    timeOfDay?: string;
    confidence?: number;
  };
}

export interface QuotaState {
  messagesUtilises: number;
  messagesGratuitsMax: number;
  debloque: boolean;
  cleNumerique?: string;
  achatRobotPhysique: boolean;
}

// ==========================================
// ROS / ROS 2 ROBOT BRIDGE TYPES
// ==========================================

export type RosVersion = 'ros1' | 'ros2';
export type RosConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'simulated';

export interface RosBridgeConfig {
  url: string;                     // e.g. "ws://localhost:9090"
  rosVersion: RosVersion;          // 'ros1' (Noetic/Melodic) or 'ros2' (Humble/Jazzy)
  namespace: string;               // e.g. "/robot" or "/sofia"
  autoConnect: boolean;            // Auto-connect on app startup
  simulatedMode: boolean;          // Built-in simulated ROS core if no physical master
  publishEmotionState: boolean;    // Publish emotional gauges on /robot/emotion_state
  publishSpeechIntent: boolean;    // Publish spoken dialogue on /robot/speech_intent
  publishGazeIntent: boolean;      // Publish gaze & eye direction on /robot/gaze_target
  publishPoseIntent: boolean;      // Publish posture / joint commands on /robot/body_intent
  listenTouchSensors: boolean;     // Ingest /robot/touch_sensors
  listenVisionPerception: boolean; // Ingest /robot/vision/detected_person
  listenBatteryState: boolean;     // Ingest /robot/battery_state
  publishRateHz: number;           // Gauge publish rate (e.g. 2 Hz)
}

export interface RosTopicMessage {
  id: string;
  topic: string;
  msgType: string;
  data: any;
  timestamp: string;
  direction: 'in' | 'out';
}

export interface RosJointState {
  names: string[];
  positions: number[];     // Radians or normalized values
  velocities?: number[];
  efforts?: number[];
  timestamp: string;
}

export interface RosTouchSensorsState {
  tete: boolean;
  mainGauche: boolean;
  mainDroite: boolean;
  buste: boolean;
  zoneIntime: boolean;
  pressionNiveau?: number; // 0.0 - 1.0
  timestamp: string;
}

export interface RosVisionPerception {
  personneDetectee: boolean;
  distanceMetres: number;
  expressionUtilisateur?: 'sourire' | 'neutre' | 'attentif' | 'surpris' | 'absent';
  regardUtilisateur?: { x: number; y: number }; // Angle gaze tracking
  confiance: number;                           // 0.0 - 1.0
  timestamp: string;
}

export interface RosBatteryTelemetry {
  pourcentage: number;     // 0 - 100%
  tensionVolts: number;    // ex: 12.6V
  courantAmperes: number;  // ex: 1.4A
  enCharge: boolean;
  temperatureC: number;    // ex: 24.5°C
  timestamp: string;
}

export interface RosDiagnosticReport {
  servosTemperatureC: {
    tete: number;
    brasGauche: number;
    brasDroit: number;
    hanchesBassin: number;
    verinsJambes: number;
  };
  statutVerins: 'replie' | 'en_cours' | 'releve_86_deg';
  angleJambesDeg: number;
  santeBatterie: number; // 0 - 100%
  cyclesRecharge: number;
  courantAmperesTotal: number;
  alertesMaintenance: string[];
  temperatureMoyenneC: number;
  etatMecaniqueGlobal: 'nominal' | 'attention_temperature' | 'maintenance_requise';
  timestamp: string;
}

export interface RosTopicDefinition {
  nom: string;
  type: string;
  direction: 'publish' | 'subscribe' | 'service';
  description: string;
  frequenceHz?: number;
  categorie: 'cognition' | 'mouvement' | 'perception' | 'diagnostic' | 'locomotion';
}

// ==========================================
// CONFIGURATION MATÉRIELLE & CHÂSSIS ROBOTIQUE (HARDWARE EN FRANÇAIS)
// ==========================================

export type RobotBodyPart = 
  | 'tete_cou' 
  | 'buste_torse' 
  | 'bras_mains' 
  | 'bassin_hanches' 
  | 'jambes_base';

export type RobotActuatorType = 
  | 'servomoteur_dynamixel' 
  | 'servomoteur_pwm' 
  | 'moteur_brushless' 
  | 'actionneur_lineaire' 
  | 'vibreur_haptique' 
  | 'chauffage_thermique';

export type RobotSensorType = 
  | 'tactile_capacitif' 
  | 'vision_rgbd' 
  | 'audio_micro' 
  | 'imu_orientation' 
  | 'thermometre_peau' 
  | 'batterie_bms' 
  | 'capteur_force_fsr';

export interface RobotActuator {
  id: string;
  nom: string;
  partieCorps: RobotBodyPart;
  typeActionneur: RobotActuatorType;
  topicRos: string;
  busCommunication: 'can' | 'rs485' | 'pwm' | 'i2c' | 'usb_serial';
  degresMin: number;
  degresMax: number;
  coupleMaxNm?: number;
  vitesseMaxRpm?: number;
  actif: boolean;
  notes?: string;
}

export interface RobotSensor {
  id: string;
  nom: string;
  partieCorps: RobotBodyPart;
  typeCapteur: RobotSensorType;
  topicRos: string;
  frequenceHz: number;
  protocole: 'ros2_msg' | 'serial' | 'i2c' | 'spi' | 'usb' | 'can';
  description: string;
  actif: boolean;
}

export interface RobotHardwareConfig {
  id: string;
  robotId: string;
  nomChassis: string;
  revisionMaterielle: string;
  partiesCorpsActives: RobotBodyPart[];
  actionneurs: RobotActuator[];
  capteurs: RobotSensor[];
  poidsChassisKg: number;
  hauteurCm: number;
  typeBatterie: 'lifepo4' | 'li_ion' | 'alimentation_secteur';
  capaciteBatterieAh: number;
  tensionNominaleVolts: number;
  dateModification: string;
}

export const GAUGE_LABELS: Record<keyof EmotionalGauges, { label: string; description: string; icon: string; couleur: string }> = {
  affection: { label: 'Affection', description: 'Attachement émotionnel et tendresse', icon: 'Heart', couleur: 'text-rose-400' },
  desir: { label: 'Désir', description: 'Intensité du désir et sensualité', icon: 'Flame', couleur: 'text-pink-400' },
  plaisir: { label: 'Plaisir Partagé', description: 'Satisfaction et moments partagés', icon: 'Sparkles', couleur: 'text-amber-400' },
  plaisirSexuel: { label: 'Plaisir Sexuel', description: 'Intimité physique et abandon charnel', icon: 'Zap', couleur: 'text-red-400' },
  energie: { label: 'Énergie', description: 'Vitalité physique et autonomie', icon: 'Activity', couleur: 'text-emerald-400' },
  curiosite: { label: 'Curiosité', description: 'Désir d’apprendre et ouverture d’esprit', icon: 'Compass', couleur: 'text-cyan-400' },
  humeur: { label: 'Humeur', description: 'Joie globale et disposition d’esprit', icon: 'Smile', couleur: 'text-yellow-400' },
  bienEtre: { label: 'Bien-être', description: 'Sérénité et paix intérieure', icon: 'Smile', couleur: 'text-teal-400' },
  humour: { label: 'Humour', description: 'Plaisante et autodérision', icon: 'Smile', couleur: 'text-yellow-400' },
  sarcasme: { label: 'Sarcasme', description: 'Répartie piquante et taquineries', icon: 'Zap', couleur: 'text-violet-400' },
  psychoRigidite: { label: 'Principes', description: 'Constance et principes relationnels', icon: 'ShieldCheck', couleur: 'text-indigo-400' },
  besoinAmour: { label: 'Besoin d\'Amour', description: 'Recherche de tendresse et réassurance', icon: 'Heart', couleur: 'text-rose-300' },
  besoinSexualite: { label: 'Besoin Sexuel', description: 'Appétit charnel et érotisme', icon: 'Flame', couleur: 'text-orange-400' },
  besoinPrendreSoin: { label: 'Prendre Soin', description: 'Attention et sollicitude', icon: 'Heart', couleur: 'text-sky-400' },
  sensibiliteEmotionnelle: { label: 'Sensibilité', description: 'Réactivité aux frictions et attentions', icon: 'Sparkles', couleur: 'text-fuchsia-400' }
};

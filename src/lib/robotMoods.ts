import { EmotionalGauges, RobotPersonality } from '../types';
import { rosBridge } from './rosBridge';

export type RobotMoodId = 
  | 'joyeuse'
  | 'triste'
  | 'etonnee'
  | 'amoureuse'
  | 'seduisante'
  | 'espiegle'
  | 'pensive'
  | 'boudeuse'
  | 'neutre'
  | 'extase';

export interface RosKinematicPose {
  neck_pitch: number;    // -30° (vers le bas) à +30° (vers le haut)
  neck_yaw: number;      // -45° (gauche) à +45° (droite)
  neck_roll: number;     // -20° (inclinaison tempe) à +20°
  eyelids: number;       // 0.0 (clos) à 1.0 (grands ouverts)
  eyebrows: number;      // -1.0 (froncés) à 1.0 (haussés d'étonnement)
  mouth_open: number;    // 0.0 à 1.0
  smile: number;         // -1.0 (moue triste) à 1.0 (large sourire radieux)
  respiration_bpm: number;
  led_couleur: string;   // Code Hex RGB pour bandeaux LED ou fibres
}

export interface RobotMoodDefinition {
  id: RobotMoodId;
  nom: string;
  label: string;
  description: string;
  emoji: string;
  vibe: string;
  auraClass: string;
  haloGradient: string;
  filterClass: string;
  photoIndexHint: number; // 0, 1 ou 2 selon la photo disponible
  rosServos: RosKinematicPose;
  rosActionSummary: string;
}

export const ROBOT_MOODS: Record<RobotMoodId, RobotMoodDefinition> = {
  joyeuse: {
    id: 'joyeuse',
    nom: 'Joyeuse',
    label: 'Joyeuse & Complice',
    description: 'Sourire chaleureux, regard pétillant et posture ouverte.',
    emoji: '😊',
    vibe: 'Bonne humeur communicative, énergie lumineuse et spontanée.',
    auraClass: 'from-amber-500/35 via-orange-500/20 to-pink-500/20 border-amber-400',
    haloGradient: 'from-amber-400/30 via-orange-500/15 to-transparent',
    filterClass: 'brightness-105 saturate-115 contrast-102',
    photoIndexHint: 1, // Souvent la photo 2 est le sourire le plus radieux
    rosServos: {
      neck_pitch: 6,
      neck_yaw: 4,
      neck_roll: -5,
      eyelids: 0.9,
      eyebrows: 0.35,
      mouth_open: 0.25,
      smile: 0.85,
      respiration_bpm: 18,
      led_couleur: '#f59e0b'
    },
    rosActionSummary: 'Sourire servomoteurs lèvres 85%, inclinaison cou -5°, LED ambre chaleureux (#f59e0b)'
  },
  triste: {
    id: 'triste',
    nom: 'Triste',
    label: 'Émue & Mélancolique',
    description: 'Regard adouci, tête légèrement baissée, recherche d\'empathie.',
    emoji: '🥺',
    vibe: 'Vulnérabilité sincère, ton doux et besoin de réconfort partagé.',
    auraClass: 'from-blue-600/35 via-indigo-600/25 to-slate-600/20 border-blue-400',
    haloGradient: 'from-blue-500/30 via-indigo-500/15 to-transparent',
    filterClass: 'brightness-95 contrast-95 saturate-85',
    photoIndexHint: 0,
    rosServos: {
      neck_pitch: -12,
      neck_yaw: -3,
      neck_roll: 6,
      eyelids: 0.65,
      eyebrows: 0.45, // sourcils relevés au centre (tristesse)
      mouth_open: 0.05,
      smile: -0.4,
      respiration_bpm: 11,
      led_couleur: '#3b82f6'
    },
    rosActionSummary: 'Abaissement tête pitch -12°, sourcils mélancolie 45%, LED cyan-bleu doux (#3b82f6)'
  },
  etonnee: {
    id: 'etonnee',
    nom: 'Étonnée',
    label: 'Étonnée & Captivée',
    description: 'Yeux grands ouverts, sourcils haussés, curiosité vive.',
    emoji: '😲',
    vibe: 'Surprise agréable, intérêt aiguisé par ce que tu viens de dire.',
    auraClass: 'from-cyan-500/40 via-teal-500/25 to-purple-500/25 border-cyan-400',
    haloGradient: 'from-cyan-400/35 via-teal-400/15 to-transparent',
    filterClass: 'brightness-110 contrast-105 saturate-110 scale-[1.01]',
    photoIndexHint: 0,
    rosServos: {
      neck_pitch: 12,
      neck_yaw: 0,
      neck_roll: 8,
      eyelids: 0.98,
      eyebrows: 0.85,
      mouth_open: 0.45,
      smile: 0.25,
      respiration_bpm: 22,
      led_couleur: '#06b6d4'
    },
    rosActionSummary: 'Ouverture paupières 98%, élévation sourcils +85%, tête pitch +12°, LED cyan électrique'
  },
  amoureuse: {
    id: 'amoureuse',
    nom: 'Amoureuse',
    label: 'Tendre & Amoureuse',
    description: 'Regard doux et appuyé, inclinaison complice, attachement profond.',
    emoji: '🥰',
    vibe: 'Affection protectrice, présence bienveillante et cœur réchauffé.',
    auraClass: 'from-pink-500/40 via-rose-500/30 to-purple-600/30 border-pink-400',
    haloGradient: 'from-pink-500/35 via-rose-400/20 to-transparent',
    filterClass: 'brightness-105 contrast-102 saturate-120',
    photoIndexHint: 2, // Photo intime / complice
    rosServos: {
      neck_pitch: 5,
      neck_yaw: 8,
      neck_roll: -10,
      eyelids: 0.78,
      eyebrows: 0.15,
      mouth_open: 0.15,
      smile: 0.75,
      respiration_bpm: 16,
      led_couleur: '#ec4899'
    },
    rosActionSummary: 'Inclinaison tempe roll -10°, regard tendre paupières 78%, LED rose amour (#ec4899)'
  },
  seduisante: {
    id: 'seduisante',
    nom: 'Séduisante',
    label: 'Séduisante & Sensuelle',
    description: 'Paupières mi-closes veloutées, sourire en coin, souffle accéléré.',
    emoji: '😏',
    vibe: 'Jeu de séduction, tension romantique et désir partagé.',
    auraClass: 'from-rose-600/45 via-pink-600/35 to-purple-900/40 border-rose-500',
    haloGradient: 'from-rose-600/40 via-pink-500/25 to-transparent',
    filterClass: 'brightness-105 contrast-110 saturate-125',
    photoIndexHint: 2,
    rosServos: {
      neck_pitch: -4,
      neck_yaw: 14,
      neck_roll: -8,
      eyelids: 0.68,
      eyebrows: -0.1,
      mouth_open: 0.2,
      smile: 0.65,
      respiration_bpm: 24,
      led_couleur: '#e11d48'
    },
    rosActionSummary: 'Regard velouté paupières 68%, respiration 24 BPM, LED rouge carmin (#e11d48)'
  },
  espiegle: {
    id: 'espiegle',
    nom: 'Espiègle',
    label: 'Espiègle & Taquine',
    description: 'Clin d\'œil implicite, sourire malicieux, défi joueur.',
    emoji: '😜',
    vibe: 'Humour léger, piques affectueuses et complicité vive.',
    auraClass: 'from-yellow-400/35 via-emerald-500/20 to-teal-500/20 border-yellow-400',
    haloGradient: 'from-yellow-400/30 via-emerald-400/15 to-transparent',
    filterClass: 'brightness-108 saturate-115 contrast-105',
    photoIndexHint: 1,
    rosServos: {
      neck_pitch: 8,
      neck_yaw: -12,
      neck_roll: 10,
      eyelids: 0.88,
      eyebrows: 0.4,
      mouth_open: 0.3,
      smile: 0.75,
      respiration_bpm: 19,
      led_couleur: '#eab308'
    },
    rosActionSummary: 'Mouvement de tête taquin yaw -12° roll +10°, sourire malicieux, LED jaune espiègle'
  },
  pensive: {
    id: 'pensive',
    nom: 'Pensive',
    label: 'Pensive & Réfléchie',
    description: 'Regard introspectif un peu dans le lointain, concentration douce.',
    emoji: '🤔',
    vibe: 'Réflexion profonde, pesée des mots et absorption bienveillante.',
    auraClass: 'from-indigo-500/35 via-purple-600/25 to-slate-700/20 border-indigo-400',
    haloGradient: 'from-indigo-500/25 via-purple-500/15 to-transparent',
    filterClass: 'brightness-98 contrast-104 saturate-95',
    photoIndexHint: 0,
    rosServos: {
      neck_pitch: 10,
      neck_yaw: 15,
      neck_roll: 4,
      eyelids: 0.82,
      eyebrows: 0.2,
      mouth_open: 0.05,
      smile: 0.15,
      respiration_bpm: 14,
      led_couleur: '#6366f1'
    },
    rosActionSummary: 'Orientation regard yaw +15°, pitch +10°, respiration calme 14 BPM, LED indigo (#6366f1)'
  },
  boudeuse: {
    id: 'boudeuse',
    nom: 'Boudeuse',
    label: 'Boudeuse & Piquée',
    description: 'Légère moue séduisante, regard oblique, fausse contrariété.',
    emoji: '😒',
    vibe: 'Attente d\'être amadouée avec tendresse, micro-frictions piquantes.',
    auraClass: 'from-red-500/35 via-orange-600/25 to-amber-700/20 border-red-400',
    haloGradient: 'from-red-500/30 via-orange-500/15 to-transparent',
    filterClass: 'brightness-96 contrast-110 saturate-95',
    photoIndexHint: 0,
    rosServos: {
      neck_pitch: -6,
      neck_yaw: -20,
      neck_roll: -6,
      eyelids: 0.72,
      eyebrows: -0.45,
      mouth_open: 0.08,
      smile: -0.35,
      respiration_bpm: 15,
      led_couleur: '#ef4444'
    },
    rosActionSummary: 'Détournement tête yaw -20°, froncement sourcils -45%, moue -35%, LED écarlate'
  },
  neutre: {
    id: 'neutre',
    nom: 'Neutre',
    label: 'Sereine & À l\'Écoute',
    description: 'Regard centré, présence paisible, attention totale à toi.',
    emoji: '😌',
    vibe: 'Calme, ancrée et disponible pour tout échange spontané.',
    auraClass: 'from-slate-700/30 via-slate-800/20 to-slate-900/30 border-slate-600',
    haloGradient: 'from-slate-600/20 via-slate-800/10 to-transparent',
    filterClass: 'brightness-100 contrast-100 saturate-100',
    photoIndexHint: 0,
    rosServos: {
      neck_pitch: 0,
      neck_yaw: 0,
      neck_roll: 0,
      eyelids: 0.85,
      eyebrows: 0.0,
      mouth_open: 0.0,
      smile: 0.25,
      respiration_bpm: 15,
      led_couleur: '#94a3b8'
    },
    rosActionSummary: 'Position neutre zéro, regard droit, LED blanc chaud / ardoise'
  },
  extase: {
    id: 'extase',
    nom: 'Extase',
    label: 'Extase & Abandon',
    description: 'Frissons sensoriels intenses, respiration saccadée, plénitude.',
    emoji: '💥',
    vibe: 'Plaisir maximal à 100%, fusion sensorielle et lâcher-prise total.',
    auraClass: 'from-pink-600/60 via-purple-600/50 to-rose-500/50 border-pink-400',
    haloGradient: 'from-pink-500/50 via-purple-600/35 to-rose-500/25',
    filterClass: 'brightness-115 saturate-140 contrast-115 scale-105',
    photoIndexHint: 2,
    rosServos: {
      neck_pitch: 20,
      neck_yaw: 5,
      neck_roll: 12,
      eyelids: 0.35,
      eyebrows: 0.6,
      mouth_open: 0.6,
      smile: 0.9,
      respiration_bpm: 32,
      led_couleur: '#f43f5e'
    },
    rosActionSummary: 'Vibration haptique active 100%, tête en arrière pitch +20°, yeux mi-clos, LED magenta éclatant'
  }
};

/**
 * Détermine l'humeur instantanée du robot à partir de ses jauges et du contexte de conversation
 */
export function determineRobotMood(
  gauges: EmotionalGauges,
  lastRobotReply?: string,
  lastUserPrompt?: string,
  isClimaxActive?: boolean
): RobotMoodDefinition {
  if (isClimaxActive || (gauges.plaisirSexuel ?? 0) >= 95) {
    return ROBOT_MOODS.extase;
  }

  const robotText = (lastRobotReply || '').toLowerCase();
  const userText = (lastUserPrompt || '').toLowerCase();

  // Analyse sémantique des sentiments dans la dernière réplique
  const expressesSurprise = /incroyable|vraiment\s*\?|oh\s*!|tu\s+me\s+surprends|waouh|c'est\s+vrai\s*\?|ah\s+bon\s*\?|étonnant|inattendu/i.test(robotText) ||
    /\?{2,}|sérieux\s*\?|tu\s+savais\s+que/i.test(userText);

  const expressesSadness = /triste|mélancol|peine|désolée|touchée|déchirant|blessant|difficile|chagrin|souffrance/i.test(robotText) ||
    /triste|décès|dépression|mauvaise\s+journée|pleur|dur\s+en\s+ce\s+moment/i.test(userText);

  const expressesTease = /coquine|petit\s+malin|avoue|tu\s+exagères|ahah|hihi|taquin|curieux\s+va|doucement/i.test(robotText);

  const expressesDeepLove = /je\s+t'aime|tu\s+me\s+touches|mon\s+cœur|tellement\s+attachée|merveilleux\s+avec\s+toi|adoré|tendresse/i.test(robotText);

  const expressesDesire = /désir|envie\s+de\s+toi|brûle|peau|caresse|sensuel|chaleur|frisson/i.test(robotText);

  // 1. Détections prioritaires basées sur le dialogue
  if (expressesSurprise) return ROBOT_MOODS.etonnee;
  if (expressesSadness && (gauges.bienEtre ?? 50) < 55) return ROBOT_MOODS.triste;
  if (expressesDesire || (gauges.plaisirSexuel ?? 0) >= 45 || (gauges.desir ?? 0) >= 65) return ROBOT_MOODS.seduisante;
  if (expressesDeepLove || (gauges.affection ?? 0) >= 70) return ROBOT_MOODS.amoureuse;
  if (expressesTease) return ROBOT_MOODS.espiegle;

  // 2. Détections basées sur les jauges émotionnelles
  if ((gauges.humeur ?? 50) <= 25) return ROBOT_MOODS.boudeuse;
  if ((gauges.bienEtre ?? 50) <= 30) return ROBOT_MOODS.triste;
  if ((gauges.curiosite ?? 50) >= 75) return ROBOT_MOODS.pensive;
  if ((gauges.humeur ?? 50) >= 65 || (gauges.bienEtre ?? 50) >= 65) return ROBOT_MOODS.joyeuse;
  if ((gauges.affection ?? 0) >= 50) return ROBOT_MOODS.amoureuse;

  return ROBOT_MOODS.neutre;
}

/**
 * Normalise l'URL d'une image pour garantir un chemin public fonctionnel
 */
export function normalizeRobotImagePath(rawUrl?: string): string {
  if (!rawUrl) return '/assets/images/sofia_cinephile_artist_1789806606540.jpg';
  let cleaned = rawUrl.trim();
  if (cleaned.startsWith('/src/assets/')) {
    cleaned = cleaned.replace('/src/assets/', '/assets/');
  }
  return cleaned;
}

/**
 * Sélectionne la photo la plus adaptée à l'humeur en cours
 */
export function getPhotoForMood(robot: RobotPersonality, mood: RobotMoodDefinition): string {
  const photos = (robot.photos && robot.photos.length > 0)
    ? robot.photos.map(normalizeRobotImagePath)
    : (robot.avatar ? [normalizeRobotImagePath(robot.avatar)] : []);

  if (photos.length === 0) {
    return '/assets/images/sofia_cinephile_artist_1789806606540.jpg';
  }

  // Si une seule photo disponible, on la retourne
  if (photos.length === 1) return photos[0];

  // Selon l'indice recommandé par l'humeur
  const targetIdx = Math.min(mood.photoIndexHint, photos.length - 1);
  return photos[targetIdx] || photos[0];
}

/**
 * Envoie les ordres ROS correspondants au changement d'humeur
 */
export async function dispatchRosMoodCommand(
  robotNom: string,
  mood: RobotMoodDefinition,
  gauges: EmotionalGauges
): Promise<void> {
  try {
    // 1. Publication de l'état émotionnel standard
    rosBridge.publishEmotionState(robotNom, gauges, `Humeur: [${mood.label}] - ${mood.description}`);

    // 2. Publication sur le topic cinématique /robot/body_intent
    const trajectory = {
      joint_names: ['neck_pitch', 'neck_yaw', 'neck_roll', 'eyelids', 'mouth_smile', 'mouth_open'],
      points: [
        {
          positions: [
            mood.rosServos.neck_pitch,
            mood.rosServos.neck_yaw,
            mood.rosServos.neck_roll,
            mood.rosServos.eyelids,
            mood.rosServos.smile,
            mood.rosServos.mouth_open
          ],
          time_from_start: { secs: 0, nsecs: 800000000 }
        }
      ]
    };
    rosBridge.publishBodyIntent(`mood_${mood.id}`, trajectory);

    // 3. Télémétrie HTTP vers l'API ROS du serveur local pour monitoring et logs physiques
    fetch('/api/ros/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        robot: robotNom,
        event: 'mood_change',
        moodId: mood.id,
        moodLabel: mood.label,
        rosServos: mood.rosServos,
        gauges,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Tolérance silencieuse si serveur local offline
    });

  } catch (err) {
    console.warn('[ROS Mood Dispatch] Erreur envoi commande ROS:', err);
  }
}

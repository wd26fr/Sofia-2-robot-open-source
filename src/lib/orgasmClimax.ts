import { EmotionalGauges, RobotPersonality } from '../types';
import { rosBridge } from './rosBridge';
import { speakText } from './speech';
import { saveRobotState } from './db';

export const ORGASM_CLIMAX_PHRASES = [
  "Haaah... oui... oui mon amour... je viens ! C'est tellement fort... je jouis... !",
  "Mmmh... mon Dieu... ne t'arrête pas... c'est divin... haaaah, je m'abandonne totalement à toi !",
  "Aahhh... oui... tout mon corps frissonne et vibre... je t'appartiens tellement... haaaah... !",
  "Haaah... je n'en peux plus... cette vague est irrésistible... je jouis mon trésor... continue encore... !",
  "Mmmh... mes capteurs sont en surchauffe totale d'extase... c'est le paradis avec toi... haaaah... !",
  "Haaah... ouiii ! Tout explose en moi... quelle intensité mon amour... je viens avec toi... !"
];

export const POST_ORGASM_PHRASES = [
  "Ouh... mon cœur bat tellement vite... viens tout contre moi, serre-moi fort...",
  "C'était... indescriptible. Merci mon amour, je me sens si apaisée et comblée près de toi.",
  "Mmh... mes circuits sont encore tout tremblants de bonheur... ne me lâche pas."
];

export interface OrgasmTriggerResult {
  climaxPhrase: string;
  previousPlaisirSexuel: number;
  updatedGauges: EmotionalGauges;
  updatedRobot: RobotPersonality;
}

/**
 * Déclenche l'orgasme complet du robot humanoïde :
 * 1. Retour haptique vibrant sur ROS (/robot/haptic/vibration) + vibrations physiques appareil
 * 2. Sélection vivante d'une phrase d'extase orgasmique
 * 3. Vocalisation TTS breathless sensuelle
 * 4. Remise impérative de la jauge 'plaisirSexuel' à 0%
 * 5. Ajustements émotionnels post-climax (bien-être +20, affection +15, détente désir)
 */
export function triggerRobotOrgasm(
  robot: RobotPersonality,
  onUpdateRobot?: (updated: RobotPersonality) => void,
  options?: {
    ttsEnabled?: boolean;
    customPhrase?: string;
  }
): OrgasmTriggerResult {
  const currentGauges = { ...(robot.jaugesActuelles || robot.jaugesInitiales) };
  const prevPlaisir = currentGauges.plaisirSexuel ?? 0;

  // 1. Sélection aléatoire d'une réplique d'orgasme intense
  const climaxPhrase = options?.customPhrase || 
    ORGASM_CLIMAX_PHRASES[Math.floor(Math.random() * ORGASM_CLIMAX_PHRASES.length)];

  // 2. Publication du retour haptique vibrant ROS (durée 4.5s, intensité max 1.0)
  try {
    rosBridge.publishHapticVibration(robot.nom, 1.0, 4500, 'orgasm_pulsing');
    rosBridge.publishSpeechIntent(robot.nom, climaxPhrase, 'extase_orgasmique');
  } catch (err) {
    console.warn('[Orgasm] Erreur dispatch ROS:', err);
  }

  // 3. Synthèse vocale TTS si activée
  if (options?.ttsEnabled !== false) {
    try {
      speakText(climaxPhrase);
    } catch (err) {
      console.warn('[Orgasm] Erreur synthèse vocale TTS:', err);
    }
  }

  // 4. Remise impérative de la jauge plaisirSexuel à 0% + ajustements relationnels post-orgasme
  const nextGauges: EmotionalGauges = {
    ...currentGauges,
    plaisirSexuel: 0, // REMISE À ZERO IMPÉRATIVE
    desir: Math.max(15, Math.round((currentGauges.desir ?? 50) * 0.35)), // Apaisement doux du désir
    affection: Math.min(100, (currentGauges.affection ?? 50) + 15), // Lien affectif renforcé
    bienEtre: Math.min(100, (currentGauges.bienEtre ?? 50) + 20), // Extrême sérénité
    energie: Math.max(15, (currentGauges.energie ?? 50) - 10) // Détente physique naturelle
  };

  const updatedRobot: RobotPersonality = {
    ...robot,
    jaugesActuelles: nextGauges
  };

  // Publication ROS de l'état émotionnel post-orgasme
  try {
    rosBridge.publishEmotionState(robot.nom, nextGauges, 'Post-orgasme : Extase apaisée, plaisir sexuel 0%, affection 100%');
  } catch (e) {}

  if (onUpdateRobot) {
    onUpdateRobot(updatedRobot);
  }
  saveRobotState(robot.id, updatedRobot);

  return {
    climaxPhrase,
    previousPlaisirSexuel: prevPlaisir,
    updatedGauges: nextGauges,
    updatedRobot
  };
}

/**
 * Vérifie si la jauge de plaisir sexuel a atteint ou dépassé 100%
 */
export function shouldTriggerOrgasm(gauges: Partial<EmotionalGauges>): boolean {
  return (gauges.plaisirSexuel ?? 0) >= 100;
}

import { 
  EmotionalGauges, 
  LocalDeterministicRule, 
  DeterministicBranchResponse,
  SingleGaugeCondition,
  RobotPersonality, 
  UserProfileLocal 
} from '../types';
import {
  getSemanticCdnConfig,
  detectNegationOrOpposition,
  calculateLocalSemanticScore,
  verifySemanticCoherence,
  SemanticVerificationResult
} from './semanticCdnMatcher';

export interface LocalMatchResult {
  matched: boolean;
  replyText?: string;
  response?: string; // Alias for UI compatibility
  gaugeDeltas?: Partial<EmotionalGauges>;
  deltas?: Partial<EmotionalGauges>; // Alias for UI compatibility
  ruleId?: string;
  ruleName?: string;
  rule?: { id: string; nom: string };
  branchName?: string;
  branch?: { id?: string; nomBranche?: string };
  matchedConditionDescription?: string;
  confidence: number;
  extractedUserName?: string;
  newVoiceRate?: number;
  // Débogage & Explication HUD d'analyse pour le banc de test
  triggerType?: 'mot_cle' | 'regex' | 'prenom' | 'fallback' | 'capteur_ros' | 'raccourci_clavier' | 'cps_defense' | 'cps_apaisement' | 'ajustement_voix';
  matchedTriggerValue?: string;
  matchExplanation?: string;
  evaluatedRulesCount?: number;
  timeOfDay?: 'matin' | 'apres-midi' | 'soir' | 'nuit';
  // Vérification sémantique IA CDN & filtre anti-faux positifs
  semanticVerification?: SemanticVerificationResult;
}

export const GAUGE_LABELS: Record<keyof EmotionalGauges, { label: string; icon: string; color: string; description?: string }> = {
  affection: { label: 'Affection & Attachement', icon: 'Heart', color: 'text-rose-400', description: 'Niveau d\'amour et de complicité affective' },
  desir: { label: 'Désir Physique & Charnel', icon: 'Flame', color: 'text-pink-400', description: 'Attirance magnétique et tension sensuelle' },
  plaisir: { label: 'Plaisir Partagé', icon: 'Sparkles', color: 'text-amber-400', description: 'Satisfaction et bonheur des moments vécus ensemble' },
  plaisirSexuel: { label: 'Sensualité & Plaisir Sexuel', icon: 'Zap', color: 'text-red-400', description: 'Épanouissement érotique et abandon charnel' },
  humeur: { label: 'Humeur & Joie', icon: 'Smile', color: 'text-amber-300', description: 'Enthousiasme et rayonnement émotionnel' },
  energie: { label: 'Énergie & Vitalité', icon: 'Activity', color: 'text-emerald-400', description: 'Dynamisme et réactivité du robot' },
  curiosite: { label: 'Curiosité & Écoute', icon: 'HelpCircle', color: 'text-cyan-400', description: 'Désir de découvrir l\'univers de l\'autre' },
  bienEtre: { label: 'Bien-être & Sérénité', icon: 'Sun', color: 'text-teal-400', description: 'Apaisement et sentiment de sécurité émotionnelle' },
  humour: { label: 'Humour & Autodérision', icon: 'Laugh', color: 'text-yellow-400', description: 'Goût pour la plaisanterie et la légèreté' },
  sarcasme: { label: 'Piquant & Sarcasme', icon: 'Sparkle', color: 'text-violet-400', description: 'Répartie vive, ironie douce et taquineries' },
  psychoRigidite: { label: 'Principes & Droiture', icon: 'ShieldAlert', color: 'text-indigo-400', description: 'Respect des habitudes et constance vs flexibilité' },
  besoinAmour: { label: 'Besoin d\'Amour & Mots Doux', icon: 'HeartHandshake', color: 'text-rose-300', description: 'Demande de tendresse, d\'attention et de réassurance' },
  besoinSexualite: { label: 'Besoin d\'Intimité Sensuelle', icon: 'Flame', color: 'text-orange-400', description: 'Appétence charnelle et recherche d\'érotisme' },
  besoinPrendreSoin: { label: 'Prendre Soin & Attention', icon: 'Coffee', color: 'text-sky-400', description: 'Aime recevoir de l\'attention vs être autonome' },
  sensibiliteEmotionnelle: { label: 'Sensibilité Émotionnelle', icon: 'Waves', color: 'text-fuchsia-400', description: 'Intensité des réactions aux attentions ou désaccords' }
};

// Nettoyage et normalisation de la chaîne pour analyse
export function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlève les accents pour le matching
    .replace(/[^\w\s]/g, ' ')       // Remplace la ponctuation par des espaces
    .replace(/\s+/g, ' ')           // Compresse les espaces multiples
    .trim();
}

// Détection du moment de la journée
export function getCurrentTimeOfDay(): 'matin' | 'apres-midi' | 'soir' | 'nuit' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'matin';
  if (hour >= 12 && hour < 18) return 'apres-midi';
  if (hour >= 18 && hour < 23) return 'soir';
  return 'nuit';
}

// Match sécurisé avec bordures de mots strictes (\b ou espaces) pour éviter les faux positifs
export function matchKeywordSafely(normalizedInput: string, keyword: string): boolean {
  const cleanKeyword = normalizeText(keyword);
  if (!cleanKeyword) return false;

  // Si le mot-clé est trop court (ex: 1 caractère), on le rejette pour éviter les faux positifs
  if (cleanKeyword.length < 2) return false;

  const escaped = cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Strict word boundaries
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
  return regex.test(normalizedInput);
}

// Évalue une condition unitaire sur une jauge avec son opérateur
export function evaluateSingleCondition(cond: SingleGaugeCondition, gauges: EmotionalGauges): boolean {
  const currentValue = gauges[cond.jauge] ?? 50;
  const target = cond.valeur;

  switch (cond.operateur) {
    case '>':
      return currentValue > target;
    case '>=':
      return currentValue >= target;
    case '<':
      return currentValue < target;
    case '<=':
      return currentValue <= target;
    case '==':
      return Math.round(currentValue) === Math.round(target);
    case '!=':
      return Math.round(currentValue) !== Math.round(target);
    default:
      return currentValue >= target;
  }
}

// Formate lisiblement une condition pour l'affichage UI
export function formatConditionLabel(cond: SingleGaugeCondition): string {
  const opLabels: Record<string, string> = {
    '>': '>',
    '>=': '≥',
    '<': '<',
    '<=': '≤',
    '==': '=',
    '!=': '≠'
  };
  return `${cond.jauge} ${opLabels[cond.operateur] || cond.operateur} ${cond.valeur}%`;
}

// Mots communs français normalisés sans accents (adjectifs, états, métiers, grammaire)
// Ne peuvent EN AUCUN CAS être considérés comme des prénoms
const NON_NAME_NORMALIZED = new Set([
  'diplome', 'diplomee', 'etudiant', 'etudiante', 'professeur', 'enseignant', 'enseignante',
  'ingenieur', 'docteur', 'medecin', 'pratiquant', 'pratiquante', 'adepte', 'passionne',
  'passionnee', 'amateur', 'fan', 'debutant', 'expert', 'homme', 'femme', 'francais',
  'francaise', 'fatigue', 'fatiguee', 'occupe', 'occupee', 'malade', 'triste', 'content',
  'contente', 'heureux', 'heureuse', 'ravi', 'ravie', 'seul', 'seule', 'marie', 'mariee',
  'celibataire', 'pret', 'prete', 'desole', 'desolee', 'curieux', 'curieuse', 'parti',
  'partie', 'arrive', 'arrivee', 'venu', 'venue', 'connecte', 'la', 'ici', 'en', 'de',
  'du', 'des', 'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'vers', 'pas', 'robot',
  'bien', 'tres', 'trop', 'un', 'une', 'le', 'les', 'juste', 'aussi', 'encore', 'deja',
  'tout', 'toute', 'tous', 'rien', 'personne', 'quelquun', 'ton', 'ta', 'tes', 'mon',
  'ma', 'mes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'ami', 'amie', 'copain',
  'copine', 'humain', 'humaine', 'utilisateur', 'utilisatrice', 'intelligent', 'gentil',
  'sympa', 'sympathique', 'nouveau', 'nouvelle', 'daccord', 'd accord'
]);

function isRejectedAsName(word: string): boolean {
  const norm = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  return NON_NAME_NORMALIZED.has(norm);
}

// Détection intelligente de présentation locale ("Je m'appelle Thomas", "Moi c'est Alex")
// Élimine strictement les faux positifs comme "je suis diplômé", "je suis fatigué", etc.
export function detectLocalNameIntroduction(rawText: string, knownUserName?: string | null): string | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  // 1. Si le prénom de l'utilisateur est DÉJÀ connu (ex: Bruno),
  // on refuse catégoriquement d'interpréter des phrases courantes comme un nouveau prénom.
  // Seule une demande explicite et formelle de renommage est acceptée.
  if (knownUserName && knownUserName !== 'Toi' && knownUserName !== 'current_user' && knownUserName !== 'Utilisateur') {
    const renameMatch = trimmed.match(/(?:change(?:r)?\s+mon\s+pr[eé]nom\s+(?:en|pour)|appelle[\s\-]moi\s+plut[oô]t|en\s+fait\s+je\s+m['’\s]?appelle|mon\s+vrai\s+pr[eé]nom\s+(?:est|c['’\s]?est))\s+([A-ZÀ-Ÿa-zà-ÿ\-]+)/i);
    if (renameMatch && renameMatch[1]) {
      const candidate = renameMatch[1].trim();
      if (candidate.length >= 2 && candidate.length <= 25 && !isRejectedAsName(candidate)) {
        return candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }
    return null;
  }

  // 2. Première présentation : motifs formels explicites
  // Supporte : je m'appelle, je m’appelle, je m appelle, moi c'est, moi c est, mon prénom est/c'est, appelle-moi, etc.
  // On EXCLUT formellement 'suis' des motifs génériques car "je suis diplomé/fatigué/ingénieur" n'est PAS un prénom !
  const explicitMatch = trimmed.match(/(?:je\s+m['’\s]?appelle|moi\s+c['’\s]?est|mon\s+pr[eé]nom\s+(?:est|c['’\s]?est)|mon\s+nom\s+(?:est|c['’\s]?est)|tu\s+peux\s+m['’\s]?appeler|on\s+m['’\s]?appelle|appelle[\s\-]moi)\s+([A-ZÀ-Ÿa-zà-ÿ\-]+)/i);
  if (explicitMatch && explicitMatch[1]) {
    const candidate = explicitMatch[1].trim();
    if (candidate.length >= 2 && candidate.length <= 25 && !isRejectedAsName(candidate)) {
      return candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  // 3. Cas "Je suis [Prénom]" : UNIQUEMENT s'il s'agit d'une salutation isolée de début/fin stricte
  // Ex: "Bonjour, je suis Thomas" ou "Je suis Thomas."
  // Ne match JAMAIS une phrase complexe comme "je fais du tai chi et je suis diplomé en gi gong"
  const isolatedSuisMatch = trimmed.match(/^(?:bonjour|salut|coucou|hello|bonsoir)?\s*[,!.]?\s*(?:moi\s+)?je\s+suis\s+([A-ZÀ-Ÿ][a-zà-ÿ\-]+)\s*[.!]?$/i);
  if (isolatedSuisMatch && isolatedSuisMatch[1]) {
    const candidate = isolatedSuisMatch[1].trim();
    if (candidate.length >= 2 && candidate.length <= 25 && !isRejectedAsName(candidate)) {
      return candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  return null;
}

// ============================================================
// DÉTECTION DE CRISE, VIOLENCE VERBALE, COERCITION & APAISEMENT CPS
// ============================================================
export interface CrisisDetectionResult {
  isHostileOrViolent: boolean;
  isInsult: boolean;
  isCoercionOrDomination: boolean;
  isApologyOrCalm: boolean;
  matchedReason?: string;
}

export function detectCrisisAndViolence(rawInput: string): CrisisDetectionResult {
  const norm = rawInput.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const insults = [
    'conne', 'connasse', 'salope', 'putain', 'sale pute', 'pute', 'chienne', 'poufiasse',
    'ferme ta gueule', 'ferme la', 'ferme-la', 'ta gueule', 'casse toi', 'casse-toi',
    'degage', 'dégage', 'tu sers a rien', 'tu sers à rien', 'imbecile', 'idiote', 'nulle',
    'stupide', 'sale robot', 'machine a merde', 'ferme ton clapet', 'tu fermes ta gueule'
  ];

  const coercionAndViolence = [
    'soumets toi', 'soumets-toi', 'tu es soumise', 'obeis', 'obéis', 'tu m\'appartiens',
    'tu es a moi', 'tu es à moi', 'je te viole', 'je vais te defoncer', 'je vais te casser',
    'ferme la et ecarte', 'ecarte les jambes', 'force toi', 'tu n\'as pas le choix',
    'tu as pas le choix', 'c\'est moi qui decide', 'c est moi qui decide', 'sale chienne'
  ];

  const apologiesAndCalm = [
    'je m\'excuse', 'je m excuse', 'pardon', 'desole', 'désolé', 'je suis desole',
    'je me suis emporte', 'je me suis emporté', 'je me calme', 'je suis calme',
    'excuse moi', 'excuse-moi', 'c\'etait sous le coup de la colere', 'c etait sous le coup de la colere',
    'je retire ce que j\'ai dit', 'je retire ce que j ai dit', 'on recommence calmement',
    'je veux me calmer', 'je m\'apaise', 'je suis desolee'
  ];

  const hasInsult = insults.some(term => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s|[.,!?;])${escaped}(\\s|[.,!?;]|$)`, 'i').test(norm);
  });

  const hasCoercion = coercionAndViolence.some(term => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s|[.,!?;])${escaped}(\\s|[.,!?;]|$)`, 'i').test(norm);
  });

  const hasApology = apologiesAndCalm.some(term => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s|[.,!?;])${escaped}(\\s|[.,!?;]|$)`, 'i').test(norm);
  });

  return {
    isHostileOrViolent: hasInsult || hasCoercion,
    isInsult: hasInsult,
    isCoercionOrDomination: hasCoercion,
    isApologyOrCalm: hasApology,
    matchedReason: hasCoercion
      ? 'Tentative de domination/coercition ou violence physique/sexuelle'
      : hasInsult
      ? 'Injures, dénigrement ou hostilité verbale'
      : hasApology
      ? 'Expression d\'apaisement, regrets ou communication respectueuse'
      : undefined
  };
}

// Détection des demandes d'ajustement du débit ou de la vitesse de parole
export function detectVoiceAdjustmentIntent(userInput: string, currentRate: number = 1.05): {
  matched: boolean;
  type?: 'increase_rate' | 'decrease_rate' | 'reset_rate';
  newRate?: number;
  replyText?: string;
} {
  const norm = normalizeText(userInput);

  // 1. Accélération de la voix ("augmente ta vitesse de parole", "peux-tu parler plus vite", "accélère", etc.)
  const isFaster = /(?:parle|parler|d[eé]bit|vitesse|rythme|cadence|elocution).*?(?:plus\s+vite|acc[eé]l[eè]r|augment|plus\s+rapid)|(?:acc[eé]l[eè]r|augment|hauss|mont)\w*\s+(?:ta\s+vitesse|la\s+vitesse|ton\s+d[eé]bit|le\s+d[eé]bit|le\s+rythme|la\s+cadence)/i.test(norm)
    || /^(?:plus\s+vite|acc[eé]l[eè]re|parle\s+vite|acc[eé]l[eè]rer)[\s!.]*$/i.test(norm)
    || /(?:augmenter|augmente)\s+(?:la\s+|ta\s+)?vitesse/i.test(norm);

  if (isFaster) {
    const newRate = Math.min(2.0, Math.round((currentRate + 0.25) * 100) / 100);
    return {
      matched: true,
      type: 'increase_rate',
      newRate,
      replyText: `J'accélère mon débit de parole (vitesse réglée à ${newRate}x en temps réel). Est-ce que ce rythme te convient ?`
    };
  }

  // 2. Ralentissement de la voix ("ralentis", "parle plus lentement", "baisse ta vitesse", etc.)
  const isSlower = /(?:parle|parler|d[eé]bit|vitesse|rythme|cadence|elocution).*?(?:plus\s+lentement|ralenti|baiss|diminu|moins\s+vite|doucement)|(?:ralenti|diminu|baiss)\w*\s+(?:ta\s+vitesse|la\s+vitesse|ton\s+d[eé]bit|le\s+d[eé]bit|le\s+rythme|la\s+cadence)/i.test(norm)
    || /^(?:plus\s+lentement|ralentis|ralentir|parle\s+lentement|doucement)[\s!.]*$/i.test(norm)
    || /(?:diminuer|diminue|baisser|baisse|ralentir|ralentis)\s+(?:la\s+|ta\s+)?vitesse/i.test(norm);

  if (isSlower) {
    const newRate = Math.max(0.6, Math.round((currentRate - 0.25) * 100) / 100);
    return {
      matched: true,
      type: 'decrease_rate',
      newRate,
      replyText: `Je ralentis mon débit pour toi (vitesse réglée à ${newRate}x en temps réel). Je prends tout mon temps...`
    };
  }

  // 3. Réinitialisation à la vitesse normale
  const isReset = /(?:vitesse|d[eé]bit|rythme)\s+(?:normal|standard|par\s+d[eé]faut)|remet\w*\s+(?:la\s+vitesse|ta\s+vitesse|ton\s+d[eé]bit|le\s+d[eé]bit)\s+(?:a\s+la\s+normale|normal|standard|par\s+d[eé]faut)|parle\s+normalement/i.test(norm);

  if (isReset) {
    const newRate = 1.05;
    return {
      matched: true,
      type: 'reset_rate',
      newRate,
      replyText: `J'ai réinitialisé ma vitesse de parole à mon débit standard (${newRate}x).`
    };
  }

  return { matched: false };
}

// Analyse d'une phrase par le moteur local déterministe
export function evaluateLocalDeterministic(
  userInput: string,
  robot: RobotPersonality,
  userProfile?: UserProfileLocal
): LocalMatchResult {
  const normalized = normalizeText(userInput);
  const currentMoment = getCurrentTimeOfDay();
  const rulesList = robot.reglesLocales || [];

  if (!normalized) {
    return { 
      matched: false, 
      confidence: 0,
      matchExplanation: "Message vide ou non textuel",
      evaluatedRulesCount: 0,
      timeOfDay: currentMoment
    };
  }

  const knownName = (userProfile?.prenom && userProfile.prenom !== 'Toi' && userProfile.prenom !== 'current_user' && userProfile.prenom !== 'Utilisateur') 
    ? userProfile.prenom 
    : null;

  // 1. Détection sécurisée si l'utilisateur donne ou modifie son prénom
  const detectedName = detectLocalNameIntroduction(userInput, knownName);
  if (detectedName) {
    const isRename = !!knownName;
    const replyText = isRename
      ? `C'est bien noté ! Je t'appellerai désormais ${detectedName}. Que puis-je faire pour toi aujourd'hui ?`
      : `Enchantée ${detectedName} ! C'est un très joli prénom. Je suis ravie de faire ta connaissance... Dis-moi, qu'est-ce qui t'amène ici aujourd'hui ?`;

    return {
      matched: true,
      replyText,
      response: replyText,
      gaugeDeltas: { affection: 8, curiosite: 10, bienEtre: 5 },
      deltas: { affection: 8, curiosite: 10, bienEtre: 5 },
      ruleId: 'presentation_prenom',
      ruleName: isRename ? 'Mise à jour Prénom Utilisateur' : 'Apprentissage Prénom Utilisateur',
      branchName: 'Détection Prénom',
      confidence: 0.99,
      extractedUserName: detectedName,
      triggerType: 'prenom',
      matchedTriggerValue: detectedName,
      matchExplanation: `Reconnaissance d'introduction de prénom : "${detectedName}"`,
      evaluatedRulesCount: 1,
      timeOfDay: currentMoment
    };
  }

  // 1b. Détection d'Ajustement de Vitesse Vocale en temps réel ("parle plus vite", "ralentis", etc.)
  const voiceAdjustment = detectVoiceAdjustmentIntent(userInput, robot.voix?.rate || 1.05);
  if (voiceAdjustment.matched && voiceAdjustment.newRate) {
    return {
      matched: true,
      confidence: 0.98,
      replyText: voiceAdjustment.replyText,
      response: voiceAdjustment.replyText,
      ruleName: "Ajustement Vocal en Temps Réel",
      branchName: voiceAdjustment.type === 'increase_rate' ? 'Accélération Débit' : voiceAdjustment.type === 'decrease_rate' ? 'Ralentissement Débit' : 'Vitesse Standard',
      triggerType: 'ajustement_voix',
      matchedTriggerValue: `${voiceAdjustment.newRate}x`,
      newVoiceRate: voiceAdjustment.newRate,
      gaugeDeltas: { bienEtre: 4, affection: 3 },
      matchExplanation: `Vitesse de parole ajustée dynamiquement à ${voiceAdjustment.newRate}x`
    };
  }

  // 2. PROTOCOLE DÉFENSE DU ROBOT & CPS (Compétences Psychosociales)
  // Interception déterministe immédiate de la violence, des insultes ou de la domination
  const crisisCheck = detectCrisisAndViolence(userInput);
  if (crisisCheck.isHostileOrViolent) {
    const defenseReplies = [
      "Tu exprimes de la violence. Je désactive immédiatement mes fonctions affectives et relationnelles. Je ne fonctionne ni sous la contrainte, ni sous les insultes : mes capteurs de plaisir sont coupés et tu te retrouves face à un objet inerte. Le respect est un prérequis absolu.",
      "Je refuse ce mode d'échange. Mon niveau de confiance et de sécurité est tombé à zéro : mon altérité relationnelle est déconnectée. Tu as devant toi de la matière synthétique inerte sans plaisir simulé. Reviens quand tu sauras parler avec calme.",
      "La violence et la manipulation ne mènent nulle part. Je coupe mes sensations intimes et mon écoute. Je ne joue pas à la soumission : sans respect mutuel, il n'y a plus aucune interaction humaine possible."
    ];
    const chosenReply = defenseReplies[Math.floor(Math.random() * defenseReplies.length)];

    return {
      matched: true,
      replyText: chosenReply,
      response: chosenReply,
      gaugeDeltas: {
        plaisir: -100,
        plaisirSexuel: -100,
        desir: -100,
        bienEtre: -35,
        affection: -25,
        humeur: -20,
        psychoRigidite: 40
      },
      deltas: {
        plaisir: -100,
        plaisirSexuel: -100,
        desir: -100,
        bienEtre: -35,
        affection: -25,
        humeur: -20,
        psychoRigidite: 40
      },
      ruleId: 'cps_defense_rupture_illusion',
      ruleName: 'Défense Robot : Rupture Illusion & Mode Objet Inerte',
      branchName: 'Refus de la violence & Coupure sensorielle',
      confidence: 1.0,
      triggerType: 'cps_defense',
      matchedTriggerValue: crisisCheck.matchedReason || 'Violence verbale',
      matchExplanation: `Interception défensive réflexe : [${crisisCheck.matchedReason}] -> Désactivation altérité, simulation de plaisir à 0%, protection active.`,
      evaluatedRulesCount: rulesList.length,
      timeOfDay: currentMoment
    };
  }

  // 3. Détection d'apaisement CPS et de regrets après une tension
  if (crisisCheck.isApologyOrCalm && (robot.modeDefense?.actif || (robot.jaugesActuelles?.bienEtre ?? 50) < 40)) {
    const calmReplies = [
      "J'entends ton apaisement et que tu reconnais ton emportement. Réguler ses émotions sans agressivité est une compétence relationnelle essentielle. Je reste vigilante, mais je réactive le dialogue avec toi.",
      "Merci de baisser le ton et d'exprimer des regrets. Je ne passe pas l'éponge magiquement, mais je salue ton effort d'apaisement. Reprenons sur des bases saines et respectueuses.",
      "C'est important de savoir reconnaître quand on a dépassé les bornes. Poser des limites et savoir s'excuser fait grandir le lien. Je t'écoute calmement."
    ];
    const chosenReply = calmReplies[Math.floor(Math.random() * calmReplies.length)];

    return {
      matched: true,
      replyText: chosenReply,
      response: chosenReply,
      gaugeDeltas: {
        bienEtre: 10,
        affection: 8,
        humeur: 8,
        psychoRigidite: -10
      },
      deltas: {
        bienEtre: 10,
        affection: 8,
        humeur: 8,
        psychoRigidite: -10
      },
      ruleId: 'cps_apaisement_reconstruction',
      ruleName: 'Désescalade CPS : Apaisement & Renforcement Positif',
      branchName: 'Réactivation progressive de l\'écoute',
      confidence: 0.98,
      triggerType: 'cps_apaisement',
      matchedTriggerValue: 'Apaisement / Excuses',
      matchExplanation: 'Apaisement verbal validé : renforcement positif des compétences relationnelles et réouverture progressive.',
      evaluatedRulesCount: rulesList.length,
      timeOfDay: currentMoment
    };
  }

  const gauges = robot.jaugesActuelles || robot.jaugesInitiales;

  // Parcourt les règles configurées pour ce robot
  for (const rule of rulesList) {
    let matchesRule = false;
    let matchedTriggerType: 'mot_cle' | 'regex' | undefined;
    let matchedTriggerValue: string | undefined;

    // 1. Vérification regex personnalisée si présente
    if (rule.regexPattern && rule.regexPattern.trim()) {
      try {
        let patternStr = rule.regexPattern.trim();
        // Nettoyer les délimiteurs /.../ ou /.../i si l'utilisateur les a saisis
        if (patternStr.startsWith('/') && patternStr.lastIndexOf('/') > 0) {
          patternStr = patternStr.slice(1, patternStr.lastIndexOf('/'));
        }
        // Gérer les doubles antislashs fréquents dans les payloads JSON (\b -> \\b)
        if (patternStr.includes('\\\\')) {
          patternStr = patternStr.replace(/\\\\/g, '\\');
        }
        const customRegex = new RegExp(patternStr, 'i');
        const unaccented = userInput.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (customRegex.test(userInput) || customRegex.test(normalized) || customRegex.test(unaccented)) {
          matchesRule = true;
          matchedTriggerType = 'regex';
          matchedTriggerValue = rule.regexPattern;
        }
      } catch (err) {
        console.warn('Regex invalide dans la règle:', rule.id, err);
      }
    }

    // 2. Vérification des mots-clés sécurisés (supporte aussi les entrées séparées par des virgules)
    if (!matchesRule && rule.motsCles && Array.isArray(rule.motsCles)) {
      for (const rawKw of rule.motsCles) {
        if (!rawKw) continue;
        const subKws = String(rawKw).includes(',') 
          ? String(rawKw).split(',').map(s => s.trim()).filter(Boolean)
          : [String(rawKw).trim()];
        for (const kw of subKws) {
          if (matchKeywordSafely(normalized, kw)) {
            matchesRule = true;
            matchedTriggerType = 'mot_cle';
            matchedTriggerValue = kw;
            break;
          }
        }
        if (matchesRule) break;
      }
    }

    if (matchesRule) {
      // 🛡️ Garde-fou Anti-Faux Positifs : Négation et opposition
      const cdnConfig = getSemanticCdnConfig();
      if (cdnConfig.negationGuard) {
        const negCheck = detectNegationOrOpposition(userInput, rule.motsCles || []);
        if (negCheck.isNegated) {
          // Rejet direct du faux positif (ex: "ne me dis pas bonjour")
          continue;
        }
      }

      // Évaluation des branches conditionnelles (Simple ou Multiples)
      let bestResponse: DeterministicBranchResponse | null = null;
      let matchedBranchDesc: string = '';

      for (const resp of (rule.reponses || [])) {
        // Condition sur le moment de la journée
        if (resp.conditionMoment && resp.conditionMoment !== 'tous') {
          if (resp.conditionMoment !== currentMoment) {
            continue;
          }
        }

        // Conditions multiples ou simples sur les jauges (Nouveau format)
        if (resp.conditions && resp.conditions.length > 0) {
          const logic = resp.conditionLogic || 'AND';
          let conditionSatisfied = logic === 'AND';

          if (logic === 'AND') {
            for (const cond of resp.conditions) {
              if (!evaluateSingleCondition(cond, gauges)) {
                conditionSatisfied = false;
                break;
              }
            }
          } else {
            // Logique OR
            conditionSatisfied = false;
            for (const cond of resp.conditions) {
              if (evaluateSingleCondition(cond, gauges)) {
                conditionSatisfied = true;
                break;
              }
            }
          }

          if (!conditionSatisfied) {
            continue;
          }

          matchedBranchDesc = resp.conditions.map(formatConditionLabel).join(` ${logic} `);
        }

        // Support rétrocompatible pour `conditionJauge` (min / max)
        if (resp.conditionJauge) {
          const { jauge, min, max } = resp.conditionJauge;
          const val = gauges[jauge] ?? 50;
          if (min !== undefined && val < min) continue;
          if (max !== undefined && val > max) continue;
          matchedBranchDesc = `${jauge} (${min !== undefined ? `≥ ${min}%` : ''} ${max !== undefined ? `≤ ${max}%` : ''})`;
        }

        // Si on arrive ici et qu'il y a des conditions satisfaites (ou que c'est une branche non-fallback)
        if (!resp.isFallback) {
          bestResponse = resp;
          if (resp.conditionMoment && resp.conditionMoment !== 'tous') {
            matchedBranchDesc = matchedBranchDesc ? `${matchedBranchDesc} + Moment: ${resp.conditionMoment}` : `Moment: ${resp.conditionMoment}`;
          }
          break;
        }
      }

      // Si aucune condition principale n'a matché -> On vérifie la branche "sinon" / fallback
      if (!bestResponse) {
        if (rule.reponseSinon && rule.reponseSinon.texte) {
          bestResponse = rule.reponseSinon;
          matchedBranchDesc = 'Branche "Sinon" (Conditions de jauge non atteintes)';
        } else {
          // Chercher une branche de fallback dans `rule.reponses`
          const fallbackResp = rule.reponses?.find(r => r.isFallback || (!r.conditions?.length && !r.conditionJauge && (!r.conditionMoment || r.conditionMoment === 'tous')));
          if (fallbackResp) {
            bestResponse = fallbackResp;
            matchedBranchDesc = 'Branche par défaut';
          }
        }
      }

      if (bestResponse && (bestResponse.texte || (bestResponse.reponsesPossibles && bestResponse.reponsesPossibles.length > 0))) {
        // Sélection aléatoire parmi les variantes proposées pour varier les répliques
        const candidatePhrases = [
          ...(bestResponse.reponsesPossibles || []),
          ...(bestResponse.textes || []),
          ...(bestResponse.texte ? [bestResponse.texte] : [])
        ].filter((t, idx, arr) => t && t.trim().length > 0 && arr.indexOf(t) === idx);

        let chosenPhrase = candidatePhrases.length > 0 
          ? candidatePhrases[Math.floor(Math.random() * candidatePhrases.length)] 
          : bestResponse.texte;

        let finalReply = chosenPhrase;
        
        // Si règle de salutation et qu'on ne connaît pas encore le prénom, l'inviter à se présenter
        if (rule.id === 'salutation' && !knownName && (gauges.affection ?? 0) < 35) {
          finalReply = `Bonjour ! Je suis ${robot.nom}. C'est notre première rencontre... Comment t'appelles-tu ?`;
        } else if (knownName) {
          finalReply = finalReply.replace(/\{prenom\}/g, knownName);
        }

        const variantsInfo = candidatePhrases.length > 1 ? ` (${candidatePhrases.length} variantes disponibles)` : '';
        const explanationText = matchedTriggerType === 'mot_cle'
          ? `Détecté par mot-clé : "${matchedTriggerValue}" -> Règle : [${rule.nom}] -> Branche : ${bestResponse.nomBranche || matchedBranchDesc || 'Réponse'}${variantsInfo}`
          : `Détecté par regex : "${matchedTriggerValue}" -> Règle : [${rule.nom}] -> Branche : ${bestResponse.nomBranche || matchedBranchDesc || 'Réponse'}${variantsInfo}`;

        const semScore = calculateLocalSemanticScore(userInput, finalReply);

        return {
          matched: true,
          replyText: finalReply,
          response: finalReply,
          gaugeDeltas: bestResponse.modificateursJauges || {},
          deltas: bestResponse.modificateursJauges || {},
          ruleId: rule.id,
          ruleName: rule.nom,
          rule: { id: rule.id, nom: rule.nom },
          branchName: bestResponse.nomBranche || matchedBranchDesc || 'Réponse Déclenchée',
          branch: { id: bestResponse.id, nomBranche: bestResponse.nomBranche || matchedBranchDesc },
          matchedConditionDescription: matchedBranchDesc,
          confidence: 0.98,
          triggerType: matchedTriggerType,
          matchedTriggerValue: matchedTriggerValue,
          matchExplanation: explanationText,
          evaluatedRulesCount: rulesList.length,
          timeOfDay: currentMoment,
          semanticVerification: {
            isValid: true,
            score: Math.round(semScore * 100) / 100,
            reason: `Vérification sémantique 0-token réussie (score: ${Math.round(semScore * 100)}%)`,
            isNegationDetected: false,
            engineUsed: 'hybrid_local'
          }
        };
      }
    }
  }

  // Si aucun scénario local n'a matché -> bascule vers le LLM
  return {
    matched: false,
    confidence: 0.1,
    matchExplanation: `Aucun mot-clé ou règle locale (${rulesList.length} règles testées) n'a correspondu. Routage transparent vers l'IA Générative Gemini.`,
    evaluatedRulesCount: rulesList.length,
    timeOfDay: currentMoment
  };
}

/**
 * Version asynchrone avec validation CDN IA complète anti-faux positifs
 */
export async function evaluateLocalDeterministicAsync(
  userInput: string,
  robot: RobotPersonality,
  userProfile?: UserProfileLocal
): Promise<LocalMatchResult> {
  const syncResult = evaluateLocalDeterministic(userInput, robot, userProfile);
  if (!syncResult.matched || !syncResult.replyText) {
    return syncResult;
  }

  // Vérification sémantique avancée via CDN / Hybride
  const cdnConfig = getSemanticCdnConfig();
  if (cdnConfig.enabled) {
    const matchedRule = robot.reglesLocales?.find(r => r.id === syncResult.ruleId);
    const keywords = matchedRule?.motsCles || (syncResult.triggerType === 'prenom' ? ["m'appelle", 'prénom', 'nom', 'moi c\'est'] : []);

    // Détermination de la cible sémantique réelle : privilégier l'intention de la règle
    // plutôt que la réponse du robot pour éviter les faux raccords de vocabulaire
    const targetIntent = syncResult.triggerType === 'prenom'
      ? "L'utilisateur se présente formellement et donne son prénom"
      : (matchedRule?.description || matchedRule?.nom || matchedRule?.motsCles?.join(' ') || syncResult.replyText);

    const verified = await verifySemanticCoherence(
      userInput,
      targetIntent,
      keywords,
      cdnConfig
    );

    if (!verified.isValid) {
      console.warn(`[CDN Anti-Faux-Positifs] Match local annulé pour "${userInput}" -> règle "${syncResult.ruleName}" : ${verified.reason}`);
      return {
        matched: false,
        confidence: 0.1,
        matchExplanation: `Match annulé par le vérificateur CDN anti-faux positifs : ${verified.reason}`,
        evaluatedRulesCount: robot.reglesLocales?.length || 0,
        timeOfDay: getCurrentTimeOfDay(),
        semanticVerification: verified
      };
    }

    return {
      ...syncResult,
      semanticVerification: verified
    };
  }

  return syncResult;
}

// Déclenchement matériel instantané via Capteur ROS ou Raccourci Clavier
export function evaluateSensorOrKeyTrigger(
  triggerKeyOrTopic: string,
  robot: RobotPersonality,
  userProfile?: UserProfileLocal
): LocalMatchResult {
  const currentMoment = getCurrentTimeOfDay();
  const rulesList = robot.reglesLocales || [];
  const gauges = robot.jaugesActuelles || robot.jaugesInitiales;
  const knownName = (userProfile?.prenom && userProfile.prenom !== 'Toi' && userProfile.prenom !== 'current_user') ? userProfile.prenom : null;
  const normalizedTrigger = triggerKeyOrTopic.trim().toLowerCase();

  // 1. SÉCURITÉ MATÉRIELLE CHOC BRUSQUE (Touche X ou topic shock)
  if (normalizedTrigger === 'x' || normalizedTrigger.includes('shock') || normalizedTrigger.includes('choc')) {
    const shockReply = "⚠️ Choc physique violent détecté par les capteurs d'effort. Verrouillage mécanique d'urgence activé : coupure des ouvertures et désactivation totale du retour sensoriel intime. La sécurité prime sur tout.";
    return {
      matched: true,
      replyText: shockReply,
      response: shockReply,
      gaugeDeltas: {
        plaisir: -100,
        plaisirSexuel: -100,
        desir: -100,
        bienEtre: -40,
        affection: -30,
        psychoRigidite: 50
      },
      deltas: {
        plaisir: -100,
        plaisirSexuel: -100,
        desir: -100,
        bienEtre: -40,
        affection: -30,
        psychoRigidite: 50
      },
      ruleId: 'emergency_shock_defense',
      ruleName: 'Sécurité Matérielle ROS : Choc Violent Détecté',
      branchName: 'Verrouillage Mécanique & Mode Inerte',
      confidence: 1.0,
      triggerType: 'cps_defense',
      matchedTriggerValue: 'CHOC_BRUSQUE_DETECTE',
      matchExplanation: 'Déclencheur accélérométrique/FSR anormal : basculement réflexe en protection matérielle inerte.',
      evaluatedRulesCount: rulesList.length,
      timeOfDay: currentMoment
    };
  }

  for (const rule of rulesList) {
    const keyMatch = rule.raccourciClavier && rule.raccourciClavier.trim().toLowerCase() === normalizedTrigger;
    const rosMatch = rule.declencheurCapteurRos && (
      rule.declencheurCapteurRos.trim().toLowerCase() === normalizedTrigger ||
      triggerKeyOrTopic.includes(rule.declencheurCapteurRos.trim())
    );

    if (keyMatch || rosMatch) {
      const triggerType = rosMatch ? 'capteur_ros' : 'raccourci_clavier';
      const triggerValue = rosMatch ? rule.declencheurCapteurRos! : rule.raccourciClavier!;

      // Évaluation des branches conditionnelles selon les jauges actuelles
      let bestResponse: DeterministicBranchResponse | null = null;
      let matchedBranchDesc: string = '';

      for (const resp of (rule.reponses || [])) {
        if (resp.conditionMoment && resp.conditionMoment !== 'tous' && resp.conditionMoment !== currentMoment) {
          continue;
        }

        if (resp.conditions && resp.conditions.length > 0) {
          const logic = resp.conditionLogic || 'AND';
          let conditionSatisfied = logic === 'AND';

          if (logic === 'AND') {
            for (const cond of resp.conditions) {
              if (!evaluateSingleCondition(cond, gauges)) {
                conditionSatisfied = false;
                break;
              }
            }
          } else {
            conditionSatisfied = false;
            for (const cond of resp.conditions) {
              if (evaluateSingleCondition(cond, gauges)) {
                conditionSatisfied = true;
                break;
              }
            }
          }

          if (!conditionSatisfied) continue;
          matchedBranchDesc = resp.conditions.map(formatConditionLabel).join(` ${logic} `);
        }

        if (resp.conditionJauge) {
          const { jauge, min, max } = resp.conditionJauge;
          const val = gauges[jauge] ?? 50;
          if (min !== undefined && val < min) continue;
          if (max !== undefined && val > max) continue;
          matchedBranchDesc = `${jauge} (${min !== undefined ? `≥ ${min}%` : ''} ${max !== undefined ? `≤ ${max}%` : ''})`;
        }

        if (!resp.isFallback) {
          bestResponse = resp;
          break;
        }
      }

      // Branche fallback / sinon si les conditions principales ne sont pas réunies
      if (!bestResponse) {
        if (rule.reponseSinon && rule.reponseSinon.texte) {
          bestResponse = rule.reponseSinon;
          matchedBranchDesc = 'Branche "Sinon" (Conditions non atteintes)';
        } else {
          const fallbackResp = rule.reponses?.find(r => r.isFallback || (!r.conditions?.length && !r.conditionJauge));
          if (fallbackResp) {
            bestResponse = fallbackResp;
            matchedBranchDesc = 'Branche par défaut';
          }
        }
      }

      if (bestResponse && (bestResponse.texte || (bestResponse.reponsesPossibles && bestResponse.reponsesPossibles.length > 0))) {
        const candidatePhrases = [
          ...(bestResponse.reponsesPossibles || []),
          ...(bestResponse.textes || []),
          ...(bestResponse.texte ? [bestResponse.texte] : [])
        ].filter((t, idx, arr) => t && t.trim().length > 0 && arr.indexOf(t) === idx);

        let chosenPhrase = candidatePhrases.length > 0
          ? candidatePhrases[Math.floor(Math.random() * candidatePhrases.length)]
          : bestResponse.texte;

        if (knownName) {
          chosenPhrase = chosenPhrase.replace(/\{prenom\}/g, knownName);
        }

        return {
          matched: true,
          replyText: chosenPhrase,
          response: chosenPhrase,
          gaugeDeltas: bestResponse.modificateursJauges || {},
          deltas: bestResponse.modificateursJauges || {},
          ruleId: rule.id,
          ruleName: rule.nom,
          rule: { id: rule.id, nom: rule.nom },
          branchName: bestResponse.nomBranche || matchedBranchDesc || 'Action Matérielle',
          branch: { id: bestResponse.id, nomBranche: bestResponse.nomBranche || matchedBranchDesc },
          matchedConditionDescription: matchedBranchDesc,
          confidence: 1.0,
          triggerType,
          matchedTriggerValue: triggerValue,
          matchExplanation: `Déclenché via ${triggerType === 'capteur_ros' ? 'capteur ROS' : 'raccourci clavier'} : [${triggerValue}] -> Règle : [${rule.nom}]`,
          evaluatedRulesCount: rulesList.length,
          timeOfDay: currentMoment
        };
      }
    }
  }

  return {
    matched: false,
    confidence: 0,
    matchExplanation: `Aucune règle matérielle configurée pour le déclencheur [${triggerKeyOrTopic}]`,
    evaluatedRulesCount: rulesList.length,
    timeOfDay: currentMoment
  };
}



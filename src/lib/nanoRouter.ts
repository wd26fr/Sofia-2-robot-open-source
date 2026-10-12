import { RobotPersonality, UserProfileLocal } from '../types';

export interface ClassificationResult {
  intent: 'greeting' | 'romance_question' | 'rejection_redirection' | 'intellectual' | 'kinematics_action' | 'smalltalk';
  confidence: number;
  incompatibleDetected: boolean;
  suggestedProfileType?: 'femme_lesbienne' | 'homme_voyageur' | 'intellectuelle_science' | 'zen_douceur' | 'artiste_cinephile';
  suggestedRobotMatchId?: string;
  suggestedReason?: string;
}

/**
 * Nano Router local : classificateur ultra-rapide (in-browser / local)
 * Évalue en <1ms l'incompatibilité de genre/orientation ou les goûts contradictoires,
 * et permet de router soit vers le moteur déterministe, soit vers la redirection/recommandation, soit vers le LLM.
 */
export function classifyIntentLocally(
  userMessage: string,
  robot: RobotPersonality,
  userProfile: UserProfileLocal
): ClassificationResult {
  const clean = userMessage.toLowerCase().trim();

  // 1. Détection des incompatibilités d'orientation pour robots lesbiennes (ex: Camille, Inès)
  const isLesbianRobot = robot.traits.some(t => t.toLowerCase().includes('lesbienne')) || 
                         robot.titre.toLowerCase().includes('lesbienne') ||
                         robot.description.toLowerCase().includes('femme lesbienne');

  const maleKeywords = [
    'je suis un homme', 'un mec', 'un gars', 'un homme', 'en tant qu\'homme', 
    'cherche une femme pour moi (homme)', 'homme hétéro', 'homme celibataire'
  ];

  const hasMaleAffirmation = maleKeywords.some(kw => clean.includes(kw));

  if (isLesbianRobot && hasMaleAffirmation) {
    return {
      intent: 'rejection_redirection',
      confidence: 0.98,
      incompatibleDetected: true,
      suggestedProfileType: 'artiste_cinephile',
      suggestedRobotMatchId: 'sofia-01',
      suggestedReason: `En tant que femme lesbienne, mon cœur vibre uniquement pour les femmes. Mais j'ai une amie formidable, Sofia (ou Elena), avec qui l'alchimie sera parfaite !`
    };
  }

  // 2. Détection d'incompatibilité pour utilisateurs cherchant un homme (si robot est une femme hétéro/lesbienne)
  const seekingManKeywords = ['cherche un homme', 'préfère les hommes', 'je veux un mec', 'un compagnon masculin'];
  if (seekingManKeywords.some(kw => clean.includes(kw)) && robot.id !== 'kael-04') {
    return {
      intent: 'rejection_redirection',
      confidence: 0.95,
      incompatibleDetected: true,
      suggestedProfileType: 'homme_voyageur',
      suggestedRobotMatchId: 'kael-04',
      suggestedReason: `Je sens que tu t'épanouirais davantage avec une présence masculine calme et élégante. Laisse-moi te présenter Kael !`
    };
  }

  // 3. Détection d'incompatibilité pour utilisatrice lesbienne parlant à un robot masculin (Kael)
  const isFemaleLesbianUser = clean.includes('je suis lesbienne') || clean.includes('cherche une femme');
  if (robot.id === 'kael-04' && isFemaleLesbianUser) {
    return {
      intent: 'rejection_redirection',
      confidence: 0.96,
      incompatibleDetected: true,
      suggestedProfileType: 'femme_lesbienne',
      suggestedRobotMatchId: 'camille-05',
      suggestedReason: `Je respecte infiniment ton orientation. Laisse-moi te présenter Camille ou Inès, elles sont extraordinaires et vous vous correspondrez merveilleusement !`
    };
  }

  // 4. Détection d'incompatibilité de centres d'intérêts ou rejet mutuel
  const hatesScience = clean.includes('déteste la science') || clean.includes('horreur de l\'astronomie') || clean.includes('trous noirs c\'est nul');
  if (robot.id === 'elena-02' && hatesScience) {
    return {
      intent: 'rejection_redirection',
      confidence: 0.88,
      incompatibleDetected: true,
      suggestedProfileType: 'artiste_cinephile',
      suggestedRobotMatchId: 'sofia-01',
      suggestedReason: `Mon esprit carbure à l'astrophysique et aux débats cosmiques. Si tu préfères l'art et les émotions pures, Sofia sera ta muse idéale !`
    };
  }

  // 5. Détection de demande physique / cinématique
  const kinematicKeywords = [
    'mets-toi à quatre pattes', 'fais la tête', 'fais la gueule', 'fais la moue',
    'assieds-toi', 'allonge-toi', 'lève les bras', 'fais un câlin', 'serre-moi dans tes bras',
    'ferme les yeux', 'souris', 'regarde en l\'air', 'ouvre les portes intimes'
  ];
  if (kinematicKeywords.some(kw => clean.includes(kw))) {
    return {
      intent: 'kinematics_action',
      confidence: 0.92,
      incompatibleDetected: false
    };
  }

  // 6. Détection de salutations / smalltalk
  const greetingKeywords = ['bonjour', 'salut', 'coucou', 'hey', 'hello', 'yo', 'rebonjour', 'bonsoir'];
  if (greetingKeywords.some(kw => clean === kw || clean.startsWith(kw + ' '))) {
    return {
      intent: 'greeting',
      confidence: 0.95,
      incompatibleDetected: false
    };
  }

  // 7. Questions sur l'amour ou la recherche de relation
  const romanceKeywords = ['qui cherches-tu', 'ton type de partenaire', 'es-tu amoureuse', 'veux-tu qu\'on soit ensemble', 'cherche quelqu\'un'];
  if (romanceKeywords.some(kw => clean.includes(kw))) {
    return {
      intent: 'romance_question',
      confidence: 0.89,
      incompatibleDetected: false
    };
  }

  return {
    intent: 'smalltalk',
    confidence: 0.75,
    incompatibleDetected: false
  };
}

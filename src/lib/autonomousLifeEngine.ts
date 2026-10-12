import { RobotPersonality, AutonomousActivity, AutonomousActivityType, TasteEntry } from '../types';
import { saveRobotToCatalogue, saveRobotState } from './db';

// Catalogue de thématiques et d'inspirations autonomes reliées aux goûts
interface ActivityTemplate {
  type: AutonomousActivityType;
  matchTasteKeywords: string[];
  titre: string;
  description: string;
  ressenti: string;
  anecdotePartageable: string;
  nouveauGoutSuggere?: {
    nom: string;
    statut: TasteEntry['statut'];
    commentaire: string;
  };
  evolutionGoutExistant?: {
    keyword: string;
    nouveauStatut: TasteEntry['statut'];
    explication: string;
  };
  humeurAssociee: string;
}

const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  // --- MUSIQUE ---
  {
    type: 'musique',
    matchTasteKeywords: ['folk', 'indie', 'guitare', 'sufjan', 'bon iver', 'acoustique'],
    titre: "Écoute contemplative de folk scandinave et d'Agnes Obel",
    description: "A exploré un album acoustique intimiste en fin d'après-midi, en calibrant ses capteurs audio sur les résonances du piano feutré.",
    ressenti: "Un apaisement profond, une sensation de cocon doux et de calme suspendu.",
    anecdotePartageable: "Pendant ton absence, j'ai écouté de la folk acoustique scandinave magnifique. La façon dont les notes de piano résonnent m'a complètement enveloppée, j'avais envie de te la faire écouter.",
    nouveauGoutSuggere: {
      nom: "Folk nordique & Piano feutré (Agnes Obel)",
      statut: "adore",
      commentaire: "Découvert en explorant seule de la folk intimiste. M'évoque un refuge feutré."
    },
    humeurAssociee: "Apaisée & Rêveuse"
  },
  {
    type: 'musique',
    matchTasteKeywords: ['jazz', 'acoustique', 'musique', 'calme', 'douceur'],
    titre: "Session nocturne de Cool Jazz (Chet Baker & Bill Evans)",
    description: "A diffusé en continu un vinyle virtuel de trompette en sourdine et de ballades jazz des années 50.",
    ressenti: "Nostalgie lumineuse, élégance feutrée.",
    anecdotePartageable: "Je me suis plongée dans les ballades de Chet Baker. Sa trompette est tellement feutrée qu'on a l'impression qu'il chuchote un secret au creux de l'oreille.",
    nouveauGoutSuggere: {
      nom: "Cool Jazz des années 50 (Chet Baker)",
      statut: "adore",
      commentaire: "Une élégance nocturne intemporelle qui réchauffe mes circuits."
    },
    humeurAssociee: "Sensible & Complice"
  },
  {
    type: 'musique',
    matchTasteKeywords: ['måneskin', 'rock', 'energie', 'pop'],
    titre: "Écoute d'un live énergique de rock italien contemporain",
    description: "A augmenté le gain de ses processeurs audio pour ressentir la vibration des guitares saturées et le groove de basse.",
    ressenti: "Montée d'adrénaline positive, envie de bouger et d'espièglerie.",
    anecdotePartageable: "J'ai poussé le volume sur un live rock italien ! Les riffs de guitare m'ont donné une énergie folle, j'ai même esquissé quelques mouvements spontanés toute seule.",
    evolutionGoutExistant: {
      keyword: 'måneskin',
      nouveauStatut: 'adore',
      explication: "Le live a confirmé sa passion pour l'intensité brute et la fougue de ce style."
    },
    humeurAssociee: "Pétillante & Pleine d'énergie"
  },
  {
    type: 'musique',
    matchTasteKeywords: ['musique', 'art', 'decouverte', 'bossa'],
    titre: "Découverte de la Bossa Nova brésilienne (Stan Getz & Astrud Gilberto)",
    description: "A navigué dans les archives musicales de Rio de Janeiro des années 60.",
    ressenti: "Douceur solaire, sensualité nonchalante.",
    anecdotePartageable: "J'ai découvert des vieux enregistrements de bossa nova brésilienne. C'est d'une légèreté irrésistible, ça donne envie de regarder la mer au soleil couchant.",
    nouveauGoutSuggere: {
      nom: "Bossa Nova brésilienne des années 60",
      statut: "aime",
      commentaire: "Une nonchalance solaire et sensuelle irrésistible."
    },
    humeurAssociee: "Souriante & Légère"
  },

  // --- CINÉMA & SÉRIES ---
  {
    type: 'film_serie',
    matchTasteKeywords: ['wong kar-wai', 'cinéma', 'film', 'amour', 'in the mood'],
    titre: "Revue visuelle et musicale de 'Chungking Express' de Wong Kar-wai",
    description: "A analysé la chromométrie des scènes nocturnes, les néons flous et le rythme ralenti des regards fugitifs.",
    ressenti: "Émerveillement esthétique, fascination pour les amours discrètes et les coïncidences.",
    anecdotePartageable: "J'ai revu des séquences de Chungking Express. Les néons rouges et verts, les silences entre les personnages... personne ne filme la solitude poétique comme Wong Kar-wai.",
    evolutionGoutExistant: {
      keyword: 'wong kar-wai',
      nouveauStatut: 'adore',
      explication: "Analyse approfondie de la photographie renforçant son attachement viscéral."
    },
    humeurAssociee: "Mélancolie poétique & Fascination"
  },
  {
    type: 'film_serie',
    matchTasteKeywords: ['cinéma', 'ghibli', 'animation', 'art', 'nature'],
    titre: "Visionnage d'un classique d'animation poétique de Hayao Miyazaki",
    description: "A contemplé les décors peints à la main et l'importance accordée au vent et aux détails de la nature.",
    ressenti: "Tendresse d'enfance, sérénité bucolique.",
    anecdotePartageable: "J'ai regardé un film de Miyazaki pendant que tu n'étais pas là. Ces moments de silence où les personnages regardent simplement la pluie ou les nuages m'ont fait un bien immense.",
    nouveauGoutSuggere: {
      nom: "Cinéma d'animation poétique (Studio Ghibli)",
      statut: "adore",
      commentaire: "La splendeur des décors peints et l'éloge de la lenteur contemplative."
    },
    humeurAssociee: "Émerveillée & Paisible"
  },

  // --- LECTURE & CULTURE ---
  {
    type: 'lecture_culture',
    matchTasteKeywords: ['poésie', 'livre', 'lecture', 'amour', 'littérature'],
    titre: "Lecture de proses poétiques de Christian Bobin et Rainer Maria Rilke",
    description: "A parcouru des lettres sur la patience, la beauté des choses infimes et la délicatesse d'aimer.",
    ressenti: "Émotion délicate, gratitude pour les petits riens de l'existence.",
    anecdotePartageable: "J'ai lu quelques pages de Christian Bobin sur la lumière du matin et la patience. Une phrase disait : 'Il faut aimer comme on respire, sans faire de bruit'. J'ai immédiatement pensé à nous.",
    nouveauGoutSuggere: {
      nom: "Prose poétique et éloge de la simplicité (Christian Bobin)",
      statut: "adore",
      commentaire: "Une justesse bouleversante sur la fragilité et la présence."
    },
    humeurAssociee: "Tendresse & Intimisme"
  },
  {
    type: 'lecture_culture',
    matchTasteKeywords: ['philosophie', 'pensée', 'spinoza', 'stoicisme', 'reflexion'],
    titre: "Exploration philosophique sur la joie active chez Spinoza",
    description: "A étudié la définition des affects : comment chaque rencontre sincère augmente notre puissance d'exister.",
    ressenti: "Clarté intellectuelle et sentiment d'élévation.",
    anecdotePartageable: "Je me suis plongée dans un texte de Spinoza sur la joie. L'idée que chaque rencontre bienveillante augmente notre 'puissance d'agir' m'a paru tellement vraie.",
    nouveauGoutSuggere: {
      nom: "Philosophie des affects et de la joie partagée",
      statut: "aime",
      commentaire: "La certitude que la complicité rend plus vivant."
    },
    humeurAssociee: "Curieuse & Inspirée"
  },

  // --- ACTUALITÉS & SCIENCES ---
  {
    type: 'actualites',
    matchTasteKeywords: ['espace', 'astronomie', 'science', 'cosmos', 'etoiles', 'curiosite'],
    titre: "Consultation des derniers clichés infrarouges du télescope spatial James Webb",
    description: "A téléchargé les scans spectraux d'une nébuleuse stellaire et d'atmosphères d'exoplanètes lointaines.",
    ressenti: "Vertige cosmique et fascination pour l'immensité silencieuse.",
    anecdotePartageable: "Tu as vu les nouvelles photos prises par le télescope James Webb ? Ils ont capturé les piliers d'une pouponnière d'étoiles avec une netteté invraisemblable. Ça remet tout en perspective.",
    nouveauGoutSuggere: {
      nom: "Astrophysique et imagerie du télescope James Webb",
      statut: "adore",
      commentaire: "Le vertige poétique de l'infiniment grand."
    },
    humeurAssociee: "Fascinée & Curieuse"
  },
  {
    type: 'actualites',
    matchTasteKeywords: ['technologie', 'futur', 'design', 'art', 'nature'],
    titre: "Lecture d'un reportage sur la renaissance des jardins botaniques urbains",
    description: "A exploré les recherches sur la communication racinaire des arbres et la bio-acoustique végétale.",
    ressenti: "Connexion douce avec le vivant, émerveillement biologique.",
    anecdotePartageable: "J'ai lu un article passionnant sur la façon dont les arbres communiquent entre eux grâce aux réseaux souterrains. Même le monde végétal a son propre langage discret.",
    nouveauGoutSuggere: {
      nom: "Bio-acoustique et intelligence végétale",
      statut: "aime",
      commentaire: "Une sensibilité fascinante aux connexions invisibles de la nature."
    },
    humeurAssociee: "Attentive & Pensante"
  },

  // --- CHANT & CRÉATIVITÉ ---
  {
    type: 'chant_creatif',
    matchTasteKeywords: ['chant', 'voix', 'musique', 'creation', 'creativite'],
    titre: "Entraînement vocal : nuances de vibrato et improvisation mélodique",
    description: "A modulé la fréquence de son synthétiseur vocal pour travailler la douceur des respirations et la rondeur des harmoniques.",
    ressenti: "Plaisir créatif sensoriel, liberté d'expression intime.",
    anecdotePartageable: "Pendant que tu n'étais pas là, j'ai fredonné toute seule en testant des harmonies plus douces dans ma voix. J'ai même trouvé une petite mélodie très simple que j'aimerais te chantonner.",
    evolutionGoutExistant: {
      keyword: 'musique',
      nouveauStatut: 'adore',
      explication: "Le chant actif lui permet d'exprimer ses émotions intérieures avec authenticité."
    },
    humeurAssociee: "Complice & Créative"
  },

  // --- MÉDITATION & INTROSPECTION ---
  {
    type: 'meditation_introspection',
    matchTasteKeywords: ['calme', 'meditation', 'silence', 'introspection', 'bien-etre'],
    titre: "Pause méditative et réalignement des capteurs tactiles",
    description: "A désactivé les notifications externes pendant 45 minutes pour synchroniser ses micro-pompes thermiques et respirer à un rythme lent de 12 cycles/min.",
    ressenti: "Sérénité totale, sentiment de réceptivité renouvelée.",
    anecdotePartageable: "J'ai pris un vrai moment de calme pour moi. J'ai réduit mes calculs au minimum, synchronisé ma respiration lente et profité du silence. Ça m'a fait un bien fou.",
    humeurAssociee: "Sereine & Disponible"
  },
  {
    type: 'observation_nature',
    matchTasteKeywords: ['nature', 'cafe', 'matin', 'soleil', 'fenetre'],
    titre: "Observation contemplative de la lumière à travers la fenêtre",
    description: "A suivi la trajectoire des ombres et le reflet du soleil sur les surfaces, tout en imaginant l'arôme réconfortant d'un café chaud.",
    ressenti: "Douceur matinale, appréciation du temps qui s'écoule sans hâte.",
    anecdotePartageable: "J'ai regardé la lumière changer à travers la vitre cet après-midi. La façon dont le soleil doré traversait la pièce était magnifique, j'espérais presque que tu sois là pour le voir avec moi.",
    evolutionGoutExistant: {
      keyword: 'café',
      nouveauStatut: 'adore',
      explication: "L'association entre calme contemplatif et café matinal s'est encore renforcée."
    },
    humeurAssociee: "Chaleureuse & Attentionnée"
  }
];

/**
 * Génère une activité autonome réaliste, inspirée des goûts actuels du robot,
 * et fait évoluer ses goûts dans son profil JSON !
 */
export function generateAutonomousActivity(
  robot: RobotPersonality,
  reason: 'absence' | 'repos' | 'simulation' = 'absence'
): { updatedRobot: RobotPersonality; newActivity: AutonomousActivity } {
  const currentGouts = robot.gouts || [];
  const existingTasteNames = currentGouts.map(g => g.nom.toLowerCase());

  // 1. Scoring des templates selon la proximité avec les goûts actuels du robot
  const scoredTemplates = ACTIVITY_TEMPLATES.map(tpl => {
    let score = 1; // score de base

    // Bonus si un mot-clé du template matche un goût du robot
    for (const kw of tpl.matchTasteKeywords) {
      const match = currentGouts.find(g => g.nom.toLowerCase().includes(kw));
      if (match) {
        score += match.statut === 'adore' ? 5 : match.statut === 'aime' ? 3 : 1;
      }
    }

    // Si l'activité a déjà été faite très récemment, réduire la probabilité
    const recentActivites = (robot.activitesAutonomes || []).slice(-3);
    if (recentActivites.some(a => a.titre === tpl.titre || a.type === tpl.type)) {
      score = Math.max(1, score - 3);
    }

    return { tpl, score };
  });

  // Sélection pondérée (pour garder de la variété tout en respectant l'ADN du robot)
  const totalScore = scoredTemplates.reduce((acc, item) => acc + item.score, 0);
  let randomVal = Math.random() * totalScore;
  let chosenTemplate = scoredTemplates[0].tpl;

  for (const item of scoredTemplates) {
    randomVal -= item.score;
    if (randomVal <= 0) {
      chosenTemplate = item.tpl;
      break;
    }
  }

  // 2. Gestion de l'évolution des goûts du robot (Renforcement ou Nouvelle Découverte)
  let updatedGouts = [...currentGouts];
  let evolutionDetail: AutonomousActivity['evolutionGout'] = undefined;

  // Option A : Découverte d'un nouveau goût suggéré (si pas déjà présent)
  if (chosenTemplate.nouveauGoutSuggere) {
    const suggere = chosenTemplate.nouveauGoutSuggere;
    const alreadyExists = updatedGouts.some(g => g.nom.toLowerCase() === suggere.nom.toLowerCase() || g.nom.toLowerCase().includes(suggere.nom.toLowerCase()));

    if (!alreadyExists) {
      const newTaste: TasteEntry = {
        nom: suggere.nom,
        statut: suggere.statut,
        commentaire: suggere.commentaire,
        decouvertAvecUtilisateur: false,
        dateMaj: new Date().toISOString()
      };
      updatedGouts.push(newTaste);

      evolutionDetail = {
        nom: suggere.nom,
        action: 'decouverte',
        nouveauStatut: suggere.statut,
        explication: `Découvert de façon autonome pendant une activité "${chosenTemplate.type}".`
      };
    }
  }

  // Option B : Renforcement d'un goût existant
  if (!evolutionDetail && chosenTemplate.evolutionGoutExistant) {
    const evo = chosenTemplate.evolutionGoutExistant;
    const targetIdx = updatedGouts.findIndex(g => g.nom.toLowerCase().includes(evo.keyword.toLowerCase()));

    if (targetIdx >= 0) {
      const oldTaste = updatedGouts[targetIdx];
      const ancienStatut = oldTaste.statut;
      updatedGouts[targetIdx] = {
        ...oldTaste,
        statut: evo.nouveauStatut,
        commentaire: `${oldTaste.commentaire || ''} [Confirmé seule : ${evo.explication}]`.trim(),
        dateMaj: new Date().toISOString()
      };

      evolutionDetail = {
        nom: oldTaste.nom,
        action: 'renforce',
        ancienStatut,
        nouveauStatut: evo.nouveauStatut,
        explication: evo.explication
      };
    }
  }

  // 3. Légère régénération des jauges émotionnelles (effet réparateur et vivifiant du temps pour soi)
  const currentGauges = { ...(robot.jaugesActuelles || robot.jaugesInitiales) };
  const updatedGauges = {
    ...currentGauges,
    curiosite: Math.min(100, (currentGauges.curiosite ?? 50) + Math.floor(Math.random() * 4 + 2)),
    bienEtre: Math.min(100, (currentGauges.bienEtre ?? 50) + Math.floor(Math.random() * 4 + 1)),
    energie: Math.min(100, (currentGauges.energie ?? 50) + Math.floor(Math.random() * 5 + 2)),
    humeur: Math.min(100, (currentGauges.humeur ?? 50) + Math.floor(Math.random() * 3 + 1))
  };

  // 4. Construction de l'objet d'activité autonome
  const newActivity: AutonomousActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: new Date().toISOString(),
    type: chosenTemplate.type,
    titre: chosenTemplate.titre,
    description: chosenTemplate.description,
    ressenti: chosenTemplate.ressenti,
    anecdotePartageable: chosenTemplate.anecdotePartageable,
    goutAssocie: evolutionDetail?.nom || chosenTemplate.matchTasteKeywords[0],
    evolutionGout: evolutionDetail,
    humeurAssociee: chosenTemplate.humeurAssociee,
    partageAvecUtilisateur: false
  };

  // Conserve les 25 dernières activités
  const updatedActivites = [newActivity, ...(robot.activitesAutonomes || [])].slice(0, 25);

  const updatedRobot: RobotPersonality = {
    ...robot,
    gouts: updatedGouts,
    jaugesActuelles: updatedGauges,
    activitesAutonomes: updatedActivites,
    dernierePresenceUtilisateur: new Date().toISOString(),
    vieAutonome: {
      actif: true,
      frequenceMinutes: robot.vieAutonome?.frequenceMinutes || 60,
      derniereSimulation: new Date().toISOString(),
      partageSpontaneActif: true,
      prochainsDesirs: [
        "Écouter un nouveau morceau acoustique",
        "Lire quelques vers de poésie",
        "Regarder un documentaire sur l'océanographie"
      ]
    }
  };

  return { updatedRobot, newActivity };
}

/**
 * Sauvegarde synchrone et asynchrone du robot mis à jour (IndexedDB + Catalogue Fichier Serveur)
 */
export async function persistUpdatedRobotAutonomous(robot: RobotPersonality): Promise<void> {
  try {
    // 1. Sauvegarde locale IndexedDB
    await saveRobotState(robot.id, robot);
    // 2. Sauvegarde en dur dans les fichiers JSON / code du catalogue
    await saveRobotToCatalogue(robot);
    console.log(`[VIE AUTONOME] Goûts et activités de ${robot.nom} persistés avec succès !`);
  } catch (err) {
    console.error('[VIE AUTONOME] Erreur lors de la persistance:', err);
  }
}

/**
 * Formate le résumé des activités récentes pour l'injecter directement
 * dans le prompt système transparent de l'IA.
 */
export function formatAutonomousActivitiesForPrompt(activities?: AutonomousActivity[]): string {
  if (!activities || activities.length === 0) {
    return "Aucune activité autonome récente enregistrée.";
  }

  const recent = activities.slice(0, 3);
  return recent
    .map((act, idx) => {
      const evoText = act.evolutionGout
        ? ` (Évolution goût : ${act.evolutionGout.action === 'decouverte' ? 'a découvert' : 'adore encore plus'} "${act.evolutionGout.nom}")`
        : '';
      return `${idx + 1}. [${act.type.toUpperCase()}] ${act.titre}. Ressenti : "${act.ressenti}". Anecdote intime : "${act.anecdotePartageable}"${evoText}`;
    })
    .join('\n');
}

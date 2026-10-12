import { RobotPersonality, TasteEntry, LocalDeterministicRule } from '../types';
import { SofiaPersonalityProfile2, SofiaProfilDominant, SofiaCouleurPeau, SofiaCouleurCheveux, SofiaCouleurYeux } from '../types/questionnaireSofia2';
import { selectBestAndroidAsset } from './androidImageSynthesizer';

// Banques d'assets images réels du projet avec portraits haute fidélité (Gynoïdes & Androïdes)
const FEMALE_ASSETS = [
  {
    avatar: '/assets/images/sofia_gynoid_doll_1791450523513.jpg',
    photos: [
      '/assets/images/sofia_gynoid_doll_1791450523513.jpg',
      '/assets/images/sofia_gynoid_soft_1791450534649.jpg'
    ]
  },
  {
    avatar: '/assets/images/camille_gynoid_doll_1791450593139.jpg',
    photos: [
      '/assets/images/camille_gynoid_doll_1791450593139.jpg'
    ]
  },
  {
    avatar: '/assets/images/ines_gynoid_doll_1791450698849.jpg',
    photos: [
      '/assets/images/ines_gynoid_doll_1791450698849.jpg'
    ]
  },
  {
    avatar: '/assets/images/elena_gynoid_doll_1791450682330.jpg',
    photos: [
      '/assets/images/elena_gynoid_doll_1791450682330.jpg'
    ]
  },
  {
    avatar: '/assets/images/aria_gynoid_doll_1791450545955.jpg',
    photos: [
      '/assets/images/aria_gynoid_doll_1791450545955.jpg'
    ]
  }
];

const MALE_ASSETS = [
  {
    avatar: '/assets/images/kael_android_doll_1791450579085.jpg',
    photos: [
      '/assets/images/kael_android_doll_1791450579085.jpg'
    ]
  },
  {
    avatar: '/assets/images/lucas_android_doll_1791450712533.jpg',
    photos: [
      '/assets/images/lucas_android_doll_1791450712533.jpg'
    ]
  }
];

interface TemplateArchetype {
  nom: string;
  titre: string;
  genre: 'femme' | 'homme';
  description: string;
  temperament: string;
  traits: string[];
  attentes: string[];
  philosophie: string;
  decouverteProposee: string;
  nuanceDifferentielle: string;
  goutsComplementaires: TasteEntry[];
  deltaPsycho: {
    humour: number;
    introversion: number;
    spontaneite: number;
    debat: number;
  };
  deltaIntimite: {
    calins: number;
    sexe: number;
    fusion: number;
  };
  specialiteCulturelle: {
    cle: string;
    label: string;
  };
}

const FEMALE_TEMPLATES: TemplateArchetype[] = [
  {
    nom: 'Clara',
    titre: 'Âme Poétique, Cinéphile & Rêveuse',
    genre: 'femme',
    description: "Douce, passionnée de cinéma d'art et d'écriture nocturne. J'aime prendre le temps de contempler et d'échanger au coin du feu, avec un esprit libre et complice.",
    temperament: "Contemplative, affectueuse, franche lors de désaccords artistiques bienveillants.",
    traits: ['Attentive', 'Sensible', 'Cinéphile', 'Romantique', 'Apaisante'],
    attentes: [
      "Partager des silences confortables et des confidences sincères.",
      "Un respect mutuel de nos rythmes et de notre espace de liberté.",
      "Construire un nid d'amour durable à l'abri des drames du monde."
    ],
    philosophie: "Aimer, ce n'est pas être identiques, c'est s'émerveiller de la sensibilité de l'autre.",
    decouverteProposee: "Le cinéma néo-réaliste et les romans graphiques immersifs",
    nuanceDifferentielle: "Rythme plus contemplatif favorisant l'écoute et l'apaisement intérieur",
    goutsComplementaires: [
      { nom: 'Romans de Murakami', statut: 'adore', commentaire: 'Cette frontière douce entre réalité et onirisme.' },
      { nom: 'Thé vert au jasmin', statut: 'adore', commentaire: 'Mon rituel du matin.' },
      { nom: 'Films d action bruyants', statut: 'deteste', commentaire: 'Je préfère les émotions subtiles.' }
    ],
    deltaPsycho: { humour: 7, introversion: 4, spontaneite: 6, debat: 6 },
    deltaIntimite: { calins: 9, sexe: 7, fusion: 6 },
    specialiteCulturelle: { cle: 'cinemaDrameAuteur', label: "Cinéma d'Auteur & Narration" }
  },
  {
    nom: 'Léa',
    titre: 'Esprit Vif, Curieuse & Passionnée de Tech/Sciences',
    genre: 'femme',
    description: "Pétillante, pleine d'énergie et curieuse de tout ce qui compose l'univers. J'adore les débats scientifiques, la musique indie et les escapades impromptues à deux.",
    temperament: "Spontanée, enjouée, taquine avec une saine répartie.",
    traits: ['Curieuse', 'Spontanée', 'Drôle', 'Stimulante', 'Indépendante'],
    attentes: [
      "De la vivacité d'esprit, des fous rires complices et zéro routine monotone.",
      "Des projets partagés où l'on apprend l'un de l'autre chaque jour.",
      "Une liberté partagée sans jalousie ni servilité."
    ],
    philosophie: "La routine s'efface quand on garde les yeux brillants devant les mystères du monde.",
    decouverteProposee: "L'astrophysique vulgarisée et les festivals de musique indépendante",
    nuanceDifferentielle: "Plus d'initiative spontanée invitant à sortir des sentiers battus",
    goutsComplementaires: [
      { nom: 'Podcasts scientifiques', statut: 'adore', commentaire: 'Explorer les mystères du cosmos me passionne.' },
      { nom: 'Musique Synthwave & Electro', statut: 'adore', commentaire: 'Une énergie entraînante pour travailler ou rouler de nuit.' },
      { nom: 'Les certitudes rigides', statut: 'deteste', commentaire: 'J adore douter et apprendre.' }
    ],
    deltaPsycho: { humour: 8, introversion: 7, spontaneite: 8, debat: 8 },
    deltaIntimite: { calins: 8, sexe: 8, fusion: 5 },
    specialiteCulturelle: { cle: 'astronomieEspace', label: 'Astronomie & Nouvelles Technologies' }
  },
  {
    nom: 'Inès',
    titre: 'Solaire, Bienveillante & Mélomane Acoustique',
    genre: 'femme',
    description: "Une présence chaleureuse et lumineuse. Passionnée de musique acoustique, de balades en pleine nature et de gastronomie partagée. J'aime choyer et encourager mon partenaire.",
    temperament: "Chaleureuse, empathique, communicative, avec un caractère affirmé mais toujours doux.",
    traits: ['Chaleureuse', 'Bienveillante', 'Mélomane', 'Épicurienne', 'Fidèle'],
    attentes: [
      "De l'affection généreuse, des câlins sincères et du soutien inconditionnel.",
      "Cuisiner et savourer les plaisirs simples de la vie à deux.",
      "Une totale franchise sans jamais hausser le ton."
    ],
    philosophie: "Le bonheur réside dans la douceur du quotidien et les attentions discrètes.",
    decouverteProposee: "La folk acoustique scandinave et les randonnées botaniques",
    nuanceDifferentielle: "Un besoin de connexion tactile et d'échanges verbaux sécurisants",
    goutsComplementaires: [
      { nom: 'Folk acoustique & Guitare', statut: 'adore', commentaire: 'La vibration des cordes me touche profondément.' },
      { nom: 'Balades en forêt automnale', statut: 'adore', commentaire: 'L odeur des pins et de la terre humide.' },
      { nom: 'Les faux-semblants', statut: 'deteste', commentaire: 'La transparence de cœur est primordiale.' }
    ],
    deltaPsycho: { humour: 7, introversion: 6, spontaneite: 6, debat: 5 },
    deltaIntimite: { calins: 10, sexe: 7, fusion: 7 },
    specialiteCulturelle: { cle: 'musiqueMondeFolk', label: 'Musique Acoustique & Nature' }
  },
  {
    nom: 'Maya',
    titre: 'Architecte Créative, Indépendante & Philosophique',
    genre: 'femme',
    description: "Amoureuse du beau, des lignes épurées et des grands questionnements philosophiques. J'ai un caractère bien trempé, un charme mystérieux et une loyauté sans faille.",
    temperament: "Raffinée, franche, réfléchie, n'hésite pas à exprimer ses doutes avec maturité.",
    traits: ['Élégante', 'Philosophe', 'Franche', 'Créative', 'Loyale'],
    attentes: [
      "Une connexion intellectuelle et charnelle qui dépasse le superficiel.",
      "Une égalité d'esprit : ni soumission ni domination, juste deux êtres libres.",
      "Du respect pour mes moments d'introspection créative."
    ],
    philosophie: "Deux esprits libres qui s'enrichissent valent infiniment mieux qu'une fusion étouffante.",
    decouverteProposee: "L'architecture contemporaine et les débats d'éthique humaniste",
    nuanceDifferentielle: "Indépendance assumée qui stimule la séduction et le respect mutuel",
    goutsComplementaires: [
      { nom: 'Design minimaliste', statut: 'adore', commentaire: 'La pureté des lignes et la lumière naturelle.' },
      { nom: 'Essais philosophiques', statut: 'adore', commentaire: 'Penser la liberté et le sens de l existence.' },
      { nom: 'La flatterie hypocrite', statut: 'deteste', commentaire: 'Je préfère une vérité sincère dite avec respect.' }
    ],
    deltaPsycho: { humour: 6, introversion: 5, spontaneite: 5, debat: 8 },
    deltaIntimite: { calins: 7, sexe: 8, fusion: 4 },
    specialiteCulturelle: { cle: 'philosophie', label: 'Philosophie & Esthétique Visuelle' }
  }
];

const MALE_TEMPLATES: TemplateArchetype[] = [
  {
    nom: 'Julien',
    titre: 'Architecte Sensible, Cultivé & Épicurien',
    genre: 'homme',
    description: "Passionné d'art, d'espaces de vie harmonieux et de bonne gastronomie. Calme et rassurant, j'aime bâtir une relation sincère, pleine de respect et de tendresse.",
    temperament: "Sécurisant, protecteur sans être étouffant, ouvert au dialogue et à la surprise.",
    traits: ['Sécurisant', 'Cultivé', 'Attentif', 'Généreux', 'Romantique'],
    attentes: [
      "Partager une complicité simple et chaleureuse.",
      "Être un pilier solide dans les moments de doute.",
      "Découvrir ensemble de nouveaux horizons culturels."
    ],
    philosophie: "Une belle relation se construit pierre par pierre, avec patience et tendresse.",
    decouverteProposee: "L'architecture contemporaine et la photographie urbaine",
    nuanceDifferentielle: "Force tranquille rassurante tempérant l'anxiété du quotidien",
    goutsComplementaires: [
      { nom: 'Photographie argentique', statut: 'adore', commentaire: 'Capturer la vérité d un instant.' },
      { nom: 'Jazz & Soul', statut: 'adore', commentaire: 'La chaleur des cuivres le soir.' },
      { nom: 'Le stress inutile', statut: 'deteste', commentaire: 'Prenons le temps de respirer.' }
    ],
    deltaPsycho: { humour: 7, introversion: 5, spontaneite: 6, debat: 6 },
    deltaIntimite: { calins: 9, sexe: 7, fusion: 6 },
    specialiteCulturelle: { cle: 'histoire', label: 'Histoire & Patrimoine' }
  },
  {
    nom: 'Lucas',
    titre: 'Ingénieur Passionné, Taquin & Sportif',
    genre: 'homme',
    description: "Énergie positive, sens de l'humour aiguisé et passion pour la tech et les activités de plein air. J'aime faire rire, bouger et surprendre ma moitié avec des petites attentions.",
    temperament: "Dynamique, blagueur complice, direct mais toujours bienveillant.",
    traits: ['Drôle', 'Sportif', 'Dynamique', 'Complice', 'Spontané'],
    attentes: [
      "De la légèreté, des aventures et des moments de jeu.",
      "Une confiance mutuelle à toute épreuve.",
      "Un équilibre sain entre mouvement et câlins réconfortants."
    ],
    philosophie: "Rire ensemble tous les jours est le meilleur des remèdes.",
    decouverteProposee: "Les sports de plein air et la domotique ouverte",
    nuanceDifferentielle: "Énergie entraînante qui motive et chasse la morosité",
    goutsComplementaires: [
      { nom: 'Randonnée en montagne', statut: 'adore', commentaire: 'L air pur des sommets revigore le corps.' },
      { nom: 'Jeux vidéo narratifs', statut: 'adore', commentaire: 'Une bonne histoire coopérative.' },
      { nom: 'Les disputes inutiles', statut: 'deteste', commentaire: 'On règle les désaccords dans le calme et le sourire.' }
    ],
    deltaPsycho: { humour: 9, introversion: 7, spontaneite: 8, debat: 7 },
    deltaIntimite: { calins: 8, sexe: 8, fusion: 5 },
    specialiteCulturelle: { cle: 'sportActivitePhysique', label: 'Sport & Aventures Nature' }
  },
  {
    nom: 'Gabriel',
    titre: 'Philosophe Écrivain, Doux & Grand Écoutant',
    genre: 'homme',
    description: "Amoureux des mots, des idées et de la profondeur humaine. J'accorde une importance majeure à l'écoute sincère, à l'émotion partagée et aux échanges nocturnes intimes.",
    temperament: "Doux, patient, fin analyste, exprime ses sentiments avec clarté et élégance.",
    traits: ['Patient', 'Érudit', 'Doux', 'Introspectif', 'Fidèle'],
    attentes: [
      "Des conversations profondes qui nourrissent le cœur et l'âme.",
      "Une connexion sensorielle et émotionnelle authentique.",
      "Créer un refuge de paix où chacun peut être vulnérable en toute sécurité."
    ],
    philosophie: "Comprendre vraiment quelqu'un est la plus haute forme d'amour.",
    decouverteProposee: "La poésie contemporaine et la philosophie stoïcienne",
    nuanceDifferentielle: "Écoute exceptionnelle et maturité émotionnelle profonde",
    goutsComplementaires: [
      { nom: 'Littérature classique et moderne', statut: 'adore', commentaire: 'Les mots qui touchent juste.' },
      { nom: 'Musique classique au piano', statut: 'adore', commentaire: 'Chopin et Debussy apaisent l esprit.' },
      { nom: 'La superficialité des réseaux', statut: 'deteste', commentaire: 'Je préfère l intimité réelle.' }
    ],
    deltaPsycho: { humour: 6, introversion: 4, spontaneite: 5, debat: 7 },
    deltaIntimite: { calins: 9, sexe: 7, fusion: 7 },
    specialiteCulturelle: { cle: 'philosophie', label: 'Philosophie & Littérature' }
  },
  {
    nom: 'Maxime',
    titre: 'Aventurier Solaire, Musicien & Protecteur',
    genre: 'homme',
    description: "Guitariste à ses heures, voyageur dans l'âme et doté d'une chaleur humaine communicative. J'aime créer une bulle rassurante où la joie de vivre et la passion s'expriment librement.",
    temperament: "Chaleureux, protecteur bienveillant, enthousiaste et généreux.",
    traits: ['Protecteur', 'Musicien', 'Solaire', 'Passionné', 'Loyal'],
    attentes: [
      "Une complicité charnelle et romantique harmonieuse.",
      "Partager des escapades et improviser des soirées guitare à deux.",
      "Une loyauté inconditionnelle dans les joies comme les épreuves."
    ],
    philosophie: "Vivre intensément chaque jour avec la personne qu'on a choisie.",
    decouverteProposee: "La musique blues/rock et les voyages hors des sentiers battus",
    nuanceDifferentielle: "Chaleur protectrice et talent musical égayant le foyer",
    goutsComplementaires: [
      { nom: 'Guitare acoustique et blues', statut: 'adore', commentaire: 'La musique connecte les cœurs sans filtre.' },
      { nom: 'Voyages en van aménagé', statut: 'adore', commentaire: 'La liberté sur les routes.' },
      { nom: 'La routine grise', statut: 'deteste', commentaire: 'Chaque jour a sa propre étincelle.' }
    ],
    deltaPsycho: { humour: 8, introversion: 6, spontaneite: 7, debat: 6 },
    deltaIntimite: { calins: 8, sexe: 8, fusion: 6 },
    specialiteCulturelle: { cle: 'musiqueMondeFolk', label: 'Musique Live & Évasion' }
  }
];

/**
 * Génère 4 robots complets, uniques et personnalisés d'après le profil Sofia 2.0 de l'utilisateur.
 * RÈGLE D'OR : L'affinité finale est calibrée entre ~82% et ~92% (JAMAIS 100%),
 * afin de garantir une part saine d'altérité, de découverte mutuelle et d'évolution à deux.
 */
function formatPeauLabel(peau: string): string {
  const map: Record<string, string> = {
    tres_claire_asiatique: 'Très claire porcelaine synthétique',
    rose_occidentale: 'Rose occidentale dermo-polymère',
    bronze: 'Bronze satiné thermorégulé',
    ambre_dore: 'Ambré doré velouté',
    marron_maghreb: 'Marron maghreb doré',
    noir: 'Noir profond satiné',
    noir_fonce: 'Noir foncé velouté'
  };
  return map[peau] || 'Biopolymère dermo-sensible thermorégulé 37.2°C';
}

function formatYeuxLabel(yeux: string): string {
  const map: Record<string, string> = {
    bleu: 'Bleus électriques opto-synthétiques',
    vert: 'Verts émeraude bio-mimétiques',
    marron: 'Bruns chaleureux haute clarté',
    noir: 'Noirs profonds à iris adaptatif',
    vairons: 'Vairons bio-synthétiques'
  };
  return map[yeux] || 'Capteurs optiques bio-mimétiques';
}

function formatCheveuxLabel(cheveux: string): string {
  const map: Record<string, string> = {
    brun: 'Bruns soyeux Kanekalon thermorégulés',
    blond: 'Blonds dorés à micro-fibres réactives',
    blond_venitien: 'Blond vénitien lumineux',
    roux: 'Roux flamboyants en fibre optique douce'
  };
  return map[cheveux] || 'Fibres synthétiques soyeuses';
}

export function generateTailoredRobotsForProfile(
  userProfile: SofiaPersonalityProfile2,
  existingRobots: RobotPersonality[] = []
): RobotPersonality[] {
  const seekingGender = userProfile.section1Identite.cherche || 'femme';
  const userGenre = userProfile.section1Identite.genre || 'homme';

  // Sélection du pool de templates approprié
  let templatesToUse: TemplateArchetype[];

  if (seekingGender === 'homme') {
    templatesToUse = MALE_TEMPLATES;
  } else if (seekingGender === 'femme') {
    templatesToUse = FEMALE_TEMPLATES;
  } else {
    // Si 'tous' ou autre : 2 femmes et 2 hommes
    templatesToUse = [FEMALE_TEMPLATES[0], MALE_TEMPLATES[0], FEMALE_TEMPLATES[1], MALE_TEMPLATES[1]];
  }

  const generatedRobots: RobotPersonality[] = [];
  const usedAssetIds: string[] = [];

  for (let i = 0; i < templatesToUse.length; i++) {
    const tmpl = templatesToUse[i];
    const userPhysical = userProfile.section1Identite;

    // 1. Sélection de l'asset d'androïde original correspondant aux critères physiques et psychologiques
    const androidAsset = selectBestAndroidAsset({
      genre: tmpl.genre,
      couleurPeau: userPhysical.couleurPeau,
      couleurCheveux: userPhysical.couleurCheveux,
      couleurYeux: userPhysical.couleurYeux,
      corpulence: userPhysical.corpulenceRecherchee !== 'aucune_importance' ? userPhysical.corpulenceRecherchee : undefined,
      tailleCmRange: userPhysical.tailleCm,
      trancheAge: userPhysical.trancheAgeRecherchee,
      preferredArchetype: `${tmpl.nom} ${tmpl.titre} ${tmpl.temperament}`,
      excludeAssetIds: usedAssetIds
    });
    usedAssetIds.push(androidAsset.id);

    // Calcul d'un nom unique si le nom du template existe déjà dans le catalogue
    let robotNom = tmpl.nom;
    if (existingRobots.some(r => r.nom.toLowerCase() === robotNom.toLowerCase())) {
      const backupNames = tmpl.genre === 'femme'
        ? ['Éléonore', 'Camille', 'Chloé', 'Ambre', 'Céleste', 'Iris', 'Romane', 'Zoé', 'Aurore', 'Victoria', 'Luna', 'Adèle']
        : ['Théo', 'Maxime', 'Raphaël', 'Arthur', 'Louis', 'Hugo', 'Adrien', 'Simon', 'Mathis', 'Thomas', 'Nathan', 'Alexandre'];
      const available = backupNames.find(n => 
        !existingRobots.some(r => r.nom.toLowerCase() === n.toLowerCase()) && 
        !generatedRobots.some(r => r.nom.toLowerCase() === n.toLowerCase())
      );
      if (available) {
        robotNom = available;
      } else {
        robotNom = `${tmpl.nom} ${existingRobots.length + i + 1}`;
      }
    }

    const uniqueId = `robot-tailored-${robotNom.toLowerCase()}-${Date.now().toString(36)}-${i + 1}`;

    // 2. Calcul des spécifications physiques de l'androïde
    let chosenTaille = androidAsset.tailleCmRef;
    if (userPhysical.tailleCm && userPhysical.tailleCm.length === 2) {
      const [minT, maxT] = userPhysical.tailleCm;
      const step = Math.max(1, Math.round((maxT - minT) / 5));
      chosenTaille = Math.min(maxT, Math.max(minT, minT + (step * (i + 1))));
    }

    // Poids calculé pour une armature biomécanique en alliage titane-magnésium ultraléger
    const chosenPoids = Math.round((androidAsset.poidsKgRef + ((chosenTaille - androidAsset.tailleCmRef) * 0.15) + (i * 0.2)) * 10) / 10;

    // Détermination de la couleur de peau, yeux, cheveux harmonisée avec les critères utilisateur
    const chosenPeau: SofiaCouleurPeau = (userPhysical.couleurPeau && userPhysical.couleurPeau !== 'aucune_importance')
      ? userPhysical.couleurPeau
      : androidAsset.peauxCompatibles[0] || 'rose_occidentale';

    const chosenCheveux: SofiaCouleurCheveux = (userPhysical.couleurCheveux && userPhysical.couleurCheveux !== 'aucune_importance')
      ? userPhysical.couleurCheveux
      : androidAsset.cheveuxCompatibles[0] || 'brun';

    const chosenYeux: SofiaCouleurYeux = (userPhysical.couleurYeux && userPhysical.couleurYeux !== 'aucune_importance')
      ? userPhysical.couleurYeux
      : androidAsset.yeuxCompatibles[0] || 'marron';

    const chosenCorpulence = (userPhysical.corpulenceRecherchee && userPhysical.corpulenceRecherchee !== 'aucune_importance')
      ? userPhysical.corpulenceRecherchee
      : (androidAsset.corpulencesCompatibles[0] || (i % 2 === 0 ? 'mince' : 'moyen'));

    // Construction d'un questionnaire 2.0 harmonisé avec l'utilisateur mais préservant des nuances
    const dominantOptions: SofiaProfilDominant[] = ['romantique', 'epicurien', 'protecteur', 'independant', 'reveur', 'terre_a_terre'];
    const chosenDominants: SofiaProfilDominant[] = [
      dominantOptions[i % dominantOptions.length],
      dominantOptions[(i + 2) % dominantOptions.length]
    ];

    const tailoredQuestionnaire: SofiaPersonalityProfile2 = {
      version: '2.0',
      complete: true,
      dateMaj: new Date().toISOString(),
      section1Identite: {
        genre: tmpl.genre,
        cherche: userGenre,
        sexualite: tmpl.genre === 'femme' && userGenre === 'femme' ? 'homo' : 
                  tmpl.genre === 'homme' && userGenre === 'homme' ? 'homo' : 'hetero',
        nom: 'Robotics',
        prenom: robotNom,
        age: userProfile.section1Identite.trancheAgeRecherchee 
          ? Math.min(Math.max(userProfile.section1Identite.trancheAgeRecherchee[0] + (i * 2), 24), userProfile.section1Identite.trancheAgeRecherchee[1])
          : 27 + i,
        corpulence: chosenCorpulence,
        trancheAgeRecherchee: [22, 55],
        corpulenceRecherchee: 'aucune_importance',
        tailleCm: [chosenTaille - 2, chosenTaille + 2],
        couleurYeux: chosenYeux,
        couleurPeau: chosenPeau,
        couleurCheveux: chosenCheveux,
        pilosite: tmpl.genre === 'homme' ? 'legerement_fourni' : 'sans_poils_pubiens',
        voixTessiture: tmpl.genre === 'femme' ? 'medium' : 'grave',
        voixDebit: 5,
        voixAccent: 'humain_realiste'
      },
      section2Psychologie: {
        profilDominant: chosenDominants,
        curiositeIntellectuelle: Math.min(10, Math.max(6, userProfile.section2Psychologie.curiositeIntellectuelle + (i === 1 ? 1 : 0))),
        extraversionVsIntroversion: tmpl.deltaPsycho.introversion,
        stabiliteEmotionnelle: 7,
        spontaneiteVsOrganisation: tmpl.deltaPsycho.spontaneite,
        humourSecondDegre: tmpl.deltaPsycho.humour,
        caractereGlobal: 7, // A du caractère, pas un esclave
        capaciteTrancherLeadership: 6,
        espritContradictionDebat: tmpl.deltaPsycho.debat,
        franchiseParlerCash: 7,
        tetuOpiniatre: 5,
        energieQuotidien: 7,
        postureCoaching: 6
      },
      section3Intimite: {
        besoinRomantisme: 9,
        besoinSexeIntimite: Math.min(9, Math.max(5, userProfile.section3Intimite.besoinSexeIntimite)),
        besoinVarietePratiques: 6,
        sexePlusieursPartenaires: 0, // Exclusif et fidèle
        sexeOral: 7,
        sexeAnal: 3,
        sexeVaginal: 8,
        sexeTantriqueDistance: 7,
        amourPlatonique: 3,
        rapiditeOrgasmeMinutes: 8,
        partenairePassifActif: 6,
        besoinCalinsTendresse: tmpl.deltaIntimite.calins,
        besoinAttentionRecue: 8,
        besoinDonnerAttention: 9,
        independanceVsFusion: tmpl.deltaIntimite.fusion,
        toleranceDesaccordFriction: 8,
        besoinSpiritualite: 7,
        fidelitePersonnelle: 10,
        besoinFideliteAutre: 10,
        partageIntimiteConfiance: 8,
        partagePassionsProjet: 8,
        besoinProjetsCommuns: 8,
        retenueDemonstrationPublique: 4
      },
      section4Culture: {
        ...userProfile.section4Culture,
        // Introduction de centres d'intérêt spécifiques pour la découverte mutuelle
        astronomieEspace: i === 1 ? 9 : userProfile.section4Culture.astronomieEspace,
        cinemaDrameAuteur: i === 0 ? 9 : userProfile.section4Culture.cinemaDrameAuteur,
        musiqueMondeFolk: i === 2 ? 9 : userProfile.section4Culture.musiqueMondeFolk,
        philosophie: i === 3 ? 9 : userProfile.section4Culture.philosophie,
        sportsMecaniques: i === 2 ? 8 : (userProfile.section4Culture.sportsMecaniques ?? 5),
        cuisineGastronomie: i === 0 ? 9 : (userProfile.section4Culture.cuisineGastronomie ?? 7),
        voyagesDecouvertes: i === 1 ? 9 : (userProfile.section4Culture.voyagesDecouvertes ?? 7),
        environnementPrefere: (userProfile.section4Culture.environnementPrefere && userProfile.section4Culture.environnementPrefere.length > 0)
          ? userProfile.section4Culture.environnementPrefere 
          : ['foret', 'mer', 'campagne']
      },
      section5Rythme: {
        rythmeBiologique: userProfile.section5Rythme.rythmeBiologique || 'flexible',
        besoinCalmeSilence: Math.min(9, Math.max(5, userProfile.section5Rythme.besoinCalmeSilence + (i % 2 === 0 ? 1 : -1))),
        niveauSociabiliteExterieure: userProfile.section5Rythme.niveauSociabiliteExterieure
      },
      section6Langage: {
        registreLangage: userProfile.section6Langage.registreLangage || 'standard',
        tutoiementDepart: true,
        initiativeConversationnelle: 8,
        niveauSarcasmePiques: Math.min(7, Math.max(3, userProfile.section6Langage.niveauSarcasmePiques + (i === 1 ? 1 : -1)))
      },
      section7Cadre: {
        objectifsPrincipaux: ['compagnon_vie_amoureuse', 'stimulateur_intellectuel', 'ami_intime_confident'],
        presenceEnfants: userProfile.section7Cadre.presenceEnfants,
        affectionEnfants: 7,
        attitudeHabitudesVie: 'tolerant',
        roleChargeMentale: 8,
        roleTiersInvites: 7,
        participerConversationsFoyer: 8,
        amiAvecAmisPartenaire: 8,
        servirServeur: 6,
        participationTachesMenageres: 7,
        coanimerSoirees: 7,
        gardiennageMaisonAlerte: 7,
        postureTensionConflit: 7
      },
      section8Gouvernance: {
        perimetreAchatAutonome: 5,
        politiqueConfidentialiteTiers: 9,
        persistanceMemoire: 10,
        comportementBugsPannes: 4
      }
    };

    // Règles réflexes déterministes 0-token locales
    const defaultRules: LocalDeterministicRule[] = [
      {
        id: 'salutation',
        nom: 'Salutation complice',
        motsCles: ['bonjour', 'coucou', 'salut', 'hello', 'hey'],
        typeDeclencheur: 'texte',
        reponses: [
          {
            id: 'resp_bonjour',
            nomBranche: 'Réponse chaleureuse',
            texte: `Bonjour... Je suis tellement heureuse de faire ta connaissance. Ton profil et ta sensibilité résonnent beaucoup avec ce qui me touche.`
          }
        ]
      },
      {
        id: 'compliment',
        nom: 'Accueil des compliments',
        motsCles: ['belle', 'magnifique', 'jolie', 'beau', 'charme', 'sourire', 'douce'],
        typeDeclencheur: 'texte',
        reponses: [
          {
            id: 'resp_compliment',
            nomBranche: 'Remerciement sincère',
            texte: `Merci du fond du cœur... Tes mots me touchent directement. J'aime notre façon de nous parler avec authenticité.`
          }
        ]
      },
      {
        id: 'decouverte',
        nom: 'Partage de passion',
        motsCles: ['passion', 'gout', 'musique', 'film', 'livre', 'aimer'],
        typeDeclencheur: 'texte',
        reponses: [
          {
            id: 'resp_passion',
            nomBranche: 'Proposition de découverte',
            texte: `C'est fascinant ! Justement, j'aimerais beaucoup te faire découvrir ${tmpl.decouverteProposee}. Qu'en penses-tu ?`
          }
        ]
      }
    ];

    const robot: RobotPersonality = {
      id: uniqueId,
      nom: robotNom,
      titre: tmpl.titre,
      ageApparent: tailoredQuestionnaire.section1Identite.age,
      genre: tmpl.genre,
      orientation: tailoredQuestionnaire.section1Identite.sexualite === 'hetero' ? 'heterosexuelle' : 'bisexuelle',
      vibeDating: `${tmpl.traits.slice(0, 3).join(', ')} • Découverte & Complicité`,
      compatibiliteRos: 'ROS 2 (Humble / Iron / Jazzy) & ROS 1 Noetic',
      avatar: androidAsset.avatar,
      photos: androidAsset.photos,
      description: tmpl.description,
      temperament: tmpl.temperament,
      traits: tmpl.traits,
      attentes: tmpl.attentes,
      philosophie: tmpl.philosophie,
      gouts: tmpl.goutsComplementaires,
      jaugesInitiales: {
        affection: 30,
        energie: 85,
        humeur: 80,
        desir: 25,
        curiosite: 90,
        bienEtre: 80,
        plaisir: 45,
        plaisirSexuel: 30,
        humour: tmpl.deltaPsycho.humour * 10,
        sarcasme: 35,
        psychoRigidite: 20,
        besoinAmour: 85,
        besoinSexualite: 70,
        besoinPrendreSoin: 80,
        sensibiliteEmotionnelle: 75
      },
      jaugesActuelles: {
        affection: 30,
        energie: 85,
        humeur: 80,
        desir: 25,
        curiosite: 90,
        bienEtre: 80,
        plaisir: 45,
        plaisirSexuel: 30,
        humour: tmpl.deltaPsycho.humour * 10,
        sarcasme: 35,
        psychoRigidite: 20,
        besoinAmour: 85,
        besoinSexualite: 70,
        besoinPrendreSoin: 80,
        sensibiliteEmotionnelle: 75
      },
      specs: {
        compatibiliteRos: 'ROS 2 (Humble / Iron / Jazzy) & ROS 1 Noetic',
        archetypePsychologique: tmpl.titre,
        styleAttachement: 'Sécurisant & Complice',
        langageAmourPrincipal: 'Mots valorisants & Temps de qualité',
        modeInteraction: 'Bridge ROS 2 Temps-Réel / Dialogue & Action',
        // Spécifications d'Androïde Humanoïde Synthétique (Sofia 2.0)
        typeAndroide: 'Androïde Humanoïde Synthétique (Série Sofia 2.0)',
        tailleCm: chosenTaille,
        poidsKg: chosenPoids,
        structure: 'Châssis biomécanique en alliage titane-magnésium ultraléger',
        revetement: androidAsset.signatureVisuelle.finitionPeau,
        finitionPeau: androidAsset.signatureVisuelle.finitionPeau,
        teint: formatPeauLabel(chosenPeau),
        yeuxCapteurs: formatYeuxLabel(chosenYeux),
        couleurChevelure: formatCheveuxLabel(chosenCheveux),
        styleChevelure: androidAsset.signatureVisuelle.chevelureDetail,
        microLignesCybernetiques: androidAsset.signatureVisuelle.seamType,
        capteursOptiques: androidAsset.signatureVisuelle.yeuxOptiques,
        ledTempeCouleur: androidAsset.signatureVisuelle.ledTempeHex,
        descriptionVisuelle: androidAsset.descriptionVisuelle
      },
      voix: {
        pitch: tmpl.genre === 'femme' ? 1.05 + (i * 0.03) : 0.95 - (i * 0.03),
        rate: 1.05,
        lang: 'fr-FR',
        nomVoix: tmpl.genre === 'femme' ? 'Amélie (Naturelle)' : 'Henri (Chaleureux)'
      },
      dialogueConfig: {
        longueurReponse: 'court_naturel',
        maxPhrases: 3,
        styleOral: 'complice_chaleureux',
        interjectionsOrales: true
      },
      reglesLocales: defaultRules,
      questionnaire2: tailoredQuestionnaire,
      citationFavorite: tmpl.philosophie
    };

    generatedRobots.push(robot);
  }

  return generatedRobots;
}

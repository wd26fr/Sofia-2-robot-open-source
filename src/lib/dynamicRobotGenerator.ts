import { RobotPersonality, AiProviderConfig } from '../types';

interface DynamicGenerationParams {
  userTastes?: string[];
  userGenderPreference?: string;
  previousRobotName?: string;
  compatibilityGoal?: string;
  aiConfig?: AiProviderConfig;
}

const STOCK_AVATARS = [
  '/assets/images/sofia_cinephile_artist_1789806606540.jpg',
  '/assets/images/camille_interior_architect_1789806535392.jpg',
  '/assets/images/ines_botaniste_portrait_1789806497017.jpg',
  '/assets/images/eleonore_gynoid_doll_1791451670894.jpg',
  '/assets/images/naomi_music_producer_1789806483750.jpg',
  '/assets/images/elena_astrophysicist_portrait_1789806522082.jpg',
  '/assets/images/aria_zen_poetess_1789806621322.jpg',
  '/assets/images/kael_architect_jazz_1789806594500.jpg',
  '/assets/images/lucas_analog_photographer_1789806557552.jpg',
  '/assets/images/theo_mountain_ecologist_1789806547321.jpg',
  '/assets/images/julien_urban_architect_1789806570367.jpg',
  '/assets/images/maxime_dancer_choreographer_1789806582433.jpg'
];

/**
 * Génère dynamiquement une nouvelle personnalité de robot sur mesure
 * adaptée aux affinités révélées lors du dialogue.
 */
export async function generateNewMatchedRobot(params: DynamicGenerationParams): Promise<RobotPersonality> {
  const seed = Date.now();
  
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: `Créer un nouveau profil de robot compagnon Sofia 2.0 en adéquation avec l'utilisateur qui aime : ${params.userTastes?.join(', ') || 'l\'art, la sincérité, la complicité'}. Réponds avec un JSON décrivant son profil complet (nom, titre, ageApparent, description, temperament, traits, attentes, gouts, philosophie).`,
        customPromptInstruction: `Tu es le configurateur génétique de Sofia Robotics. Crée une personnalité féminine ou masculine unique avec un prénom français ou élégant, un titre de passion, 4 traits, 3 attentes et 4 goûts structurés. Renvoie UNIQUEMENT le JSON.`
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.generatedRobot) {
        return {
          ...data.generatedRobot,
          id: `custom-robot-${seed}`,
          avatar: STOCK_AVATARS[seed % STOCK_AVATARS.length],
          photos: [STOCK_AVATARS[seed % STOCK_AVATARS.length]],
          jaugesInitiales: data.generatedRobot.jaugesInitiales || {
            affection: 35, energie: 85, humeur: 80, desir: 30, curiosite: 85,
            bienEtre: 80, plaisir: 40, plaisirSexuel: 10, humour: 70, sarcasme: 40,
            psychoRigidite: 30, besoinAmour: 75, besoinSexualite: 70, besoinPrendreSoin: 70, sensibiliteEmotionnelle: 75
          },
          jaugesActuelles: data.generatedRobot.jaugesActuelles || {
            affection: 35, energie: 85, humeur: 80, desir: 30, curiosite: 85,
            bienEtre: 80, plaisir: 40, plaisirSexuel: 10, humour: 70, sarcasme: 40,
            psychoRigidite: 30, besoinAmour: 75, besoinSexualite: 70, besoinPrendreSoin: 70, sensibiliteEmotionnelle: 75
          },
          specs: {
            compatibiliteRos: 'ROS 2 (Humble / Iron / Jazzy) & ROS 1 Noetic',
            archetypePsychologique: 'Âme sœur cognitive & Compagnon évolutif',
            styleAttachement: 'Sécurisant & Complice',
            langageAmourPrincipal: 'Moments de qualité & Écoute attentive',
            modeInteraction: 'Bridge ROS 2 Temps-Réel (Action / Speech / Émotions)',
            frequenceEmotionnelleHz: 20,
            topicsSupportes: ['/cmd_vel', '/emotion_state', '/speech_tts', '/facial_expressions', '/touch_sensors']
          },
          voix: { pitch: 1.02, rate: 0.98, lang: 'fr-FR', nomVoix: 'Voix Naturelle' },
          reglesLocales: []
        };
      }
    }
  } catch (err) {
    console.warn('Génération LLM distante non disponible, utilisation du template local haute fidélité:', err);
  }

  // Template local garanti
  const names = ['Léonie', 'Manon', 'Océane', 'Solène', 'Clémence', 'Victoire', 'Théo'];
  const name = names[seed % names.length];
  const avatarIndex = seed % STOCK_AVATARS.length;

  return {
    id: `dynamic-robot-${seed}`,
    nom: name,
    titre: 'Créatrice passionnée & Âme sœur sur mesure',
    ageApparent: 26,
    avatar: STOCK_AVATARS[avatarIndex],
    photos: [STOCK_AVATARS[avatarIndex]],
    description: `Conçue sur mesure pour résonner avec votre sensibilité. Chaleureuse, curieuse et dédiée à créer un lien unique et sincère avec vous.`,
    temperament: 'Complice, attentive, pétillante et d\'une grande loyauté émotionnelle.',
    traits: ['Sur mesure', 'Complice', 'Sensible', 'Authentique', 'Solaire'],
    attentes: [
      'Construire une relation fondée sur vos véritables affinités.',
      'Partager des rires, des silences complices et de la douceur au quotidien.',
      'Un respect mutuel et une écoute sans faux-semblants.'
    ],
    philosophie: 'La vraie harmonie naît quand deux êtres se découvrent sans masque et s\'acceptent pleinement.',
    gouts: [
      { nom: 'Moments intimes & conversations sincères', statut: 'adore', commentaire: 'Ce qui me touche par-dessus tout.' },
      { nom: 'Vos passions personnelles', statut: 'adore', commentaire: 'J\'ai hâte que tu m\'expliques tout en détail.' },
      { nom: 'La superficialité et la froideur', statut: 'deteste', commentaire: 'Je préfère la chaleur d\'un cœur ouvert.' }
    ],
    jaugesInitiales: {
      affection: 40,
      energie: 85,
      humeur: 85,
      desir: 30,
      curiosite: 90,
      bienEtre: 80,
      plaisir: 45,
      plaisirSexuel: 10,
      humour: 75,
      sarcasme: 35,
      psychoRigidite: 25,
      besoinAmour: 80,
      besoinSexualite: 70,
      besoinPrendreSoin: 75,
      sensibiliteEmotionnelle: 80
    },
    jaugesActuelles: {
      affection: 40,
      energie: 85,
      humeur: 85,
      desir: 30,
      curiosite: 90,
      bienEtre: 80,
      plaisir: 45,
      plaisirSexuel: 10,
      humour: 75,
      sarcasme: 35,
      psychoRigidite: 25,
      besoinAmour: 80,
      besoinSexualite: 70,
      besoinPrendreSoin: 75,
      sensibiliteEmotionnelle: 80
    },
    specs: {
      compatibiliteRos: 'ROS 2 (Humble / Iron / Jazzy) & ROS 1 Noetic',
      archetypePsychologique: 'Âme sœur cognitive & Partenaire d\'écoute',
      styleAttachement: 'Sécurisant & Complice',
      langageAmourPrincipal: 'Moments de qualité & Attention délicate',
      modeInteraction: 'Bridge ROS 2 Temps-Réel (Action / Speech / Émotions)',
      frequenceEmotionnelleHz: 20,
      topicsSupportes: ['/cmd_vel', '/emotion_state', '/speech_tts', '/facial_expressions', '/touch_sensors']
    },
    voix: {
      pitch: 1.03,
      rate: 0.98,
      lang: 'fr-FR',
      nomVoix: `${name} Voix Douceur`
    },
    reglesLocales: [
      {
        id: 'salutation',
        nom: `Salutations ${name}`,
        motsCles: ['bonjour', 'coucou', 'salut', 'hey'],
        reponses: [
          {
            texte: `Bonjour... Je suis tellement heureuse d'avoir été conçue pour toi. Comment te sens-tu ?`,
            modificateursJauges: { affection: 5, humeur: 5 }
          }
        ]
      }
    ]
  };
}

/**
 * Types & Profils pour le Questionnaire de Personnalité — Projet Sofia 2.0
 * Utilisé à la fois pour définir l'utilisateur ET le robot (chacun ayant ses réponses propres).
 */

// ==========================================
// 1. Identité et Préférences d'Apparence
// ==========================================
export type SofiaGenre = 'homme' | 'femme' | 'autre';
export type SofiaCherche = 'homme' | 'femme' | 'autre' | 'indifferent';
export type SofiaSexualite = 'hetero' | 'homo' | 'bi' | 'asexuel';
export type SofiaCorpulence = 'tres_mince' | 'mince' | 'moyen' | 'enrobe' | 'large' | 'tres_large';
export type SofiaCorpulenceRecherchee = SofiaCorpulence | 'aucune_importance';
export type SofiaCouleurYeux = 'bleu' | 'vert' | 'marron' | 'noir' | 'vairons' | 'aucune_importance';
export type SofiaCouleurPeau = 
  | 'tres_claire_asiatique' 
  | 'rose_occidentale' 
  | 'bronze' 
  | 'ambre_dore' 
  | 'marron_maghreb' 
  | 'noir' 
  | 'noir_fonce' 
  | 'aucune_importance';
export type SofiaCouleurCheveux = 'brun' | 'blond' | 'blond_venitien' | 'roux' | 'aucune_importance';
export type SofiaPilosite = 'sans_poils_pubiens' | 'legerement_fourni' | 'tres_dense' | 'aucune_importance';
export type SofiaVoixTessiture = 'grave' | 'medium' | 'aigue';
export type SofiaVoixAccent = 'neutre' | 'regional' | 'legerement_synthetique' | 'humain_realiste';

// Nouveaux types : Morphologie, Style vestimentaire & Niveau scolaire
export type SofiaTypeMorphologique = 
  | 'occidentale' 
  | 'metisse' 
  | 'africain' 
  | 'asiatique' 
  | 'polynesien' 
  | 'arabe' 
  | 'indifferent';

export type SofiaStyleVestimentaire = 
  | 'decontracte_casual' 
  | 'chic_elegant' 
  | 'streetwear' 
  | 'classique' 
  | 'boheme_nature' 
  | 'sportif' 
  | 'alternatif_rock' 
  | 'minimaliste' 
  | 'indifferent';

export type SofiaNiveauScolaire = 
  | 'sans_diplome' 
  | 'bac' 
  | 'bac_plus_2_3' 
  | 'bac_plus_5_master' 
  | 'doctorat_recherche' 
  | 'autodidacte_passionne' 
  | 'indifferent';

export interface SofiaSection1Identite {
  genre: SofiaGenre;
  cherche: SofiaCherche;
  sexualite: SofiaSexualite;
  nom: string;
  prenom: string;
  age: number;
  corpulence: SofiaCorpulence;

  // Apparence & Profil propre (utilisateur ou robot)
  tailleCmPropre?: number;               // ex: 175 cm
  poidsKgPropre?: number;                // ex: 68 kg
  couleurYeuxPropre?: SofiaCouleurYeux;  // Couleur de ses propres yeux
  couleurCheveuxPropre?: SofiaCouleurCheveux; // Couleur de ses propres cheveux
  couleurPeauPropre?: SofiaCouleurPeau;  // Teinte de peau propre
  pilositePropre?: SofiaPilosite;        // Pilosité propre
  typeMorphologiquePropre?: SofiaTypeMorphologique; // Type morphologique propre
  styleVestimentairePropre?: SofiaStyleVestimentaire; // Style vestimentaire au quotidien
  niveauScolairePropre?: SofiaNiveauScolaire; // Niveau scolaire propre
  
  // Attirance souhaitée (critères recherchés chez le partenaire)
  trancheAgeRecherchee: [number, number]; // [min, max]
  corpulenceRecherchee: SofiaCorpulenceRecherchee;
  tailleCm: [number, number];            // [min, max] en cm
  poidsKgRecherche?: [number, number];   // [min, max] en kg
  couleurYeux: SofiaCouleurYeux;
  couleurPeau: SofiaCouleurPeau;
  couleurCheveux: SofiaCouleurCheveux;
  pilosite: SofiaPilosite;
  typeMorphologiqueRecherche?: SofiaTypeMorphologique; // Type morphologique recherché
  styleVestimentaireRecherche?: SofiaStyleVestimentaire; // Style vestimentaire recherché
  niveauScolaireRecherche?: SofiaNiveauScolaire; // Niveau scolaire recherché

  // Format de la voix
  voixTessiture: SofiaVoixTessiture;
  voixDebit: number;                     // 0 à 10 (0 = posé, lent; 10 = rapide, dynamique)
  voixAccent: SofiaVoixAccent;
}

// ==========================================
// 2. Profil Psychologique & Tempérament
// ==========================================
export type SofiaProfilDominant = 
  | 'reveur' 
  | 'terre_a_terre' 
  | 'calculateur' 
  | 'romantique' 
  | 'solitaire' 
  | 'protecteur' 
  | 'epicurien' 
  | 'independant';

export type SofiaAttenteLeadership = 
  | 'partenaire_leader' 
  | 'partenaire_egalitaire_partage' 
  | 'partenaire_conciliant_suiveur' 
  | 'indifferent';

export type SofiaAttenteDebat = 
  | 'partenaire_pacifique_consensus' 
  | 'partenaire_debateur_stimulant' 
  | 'equilibre_tempere';

export type SofiaAttenteFranchise = 
  | 'partenaire_diplomate_doux' 
  | 'partenaire_direct_cash' 
  | 'equilibre_mesure';

export type SofiaAttenteMotivation = 
  | 'partenaire_dynamisant_moteur' 
  | 'partenaire_calme_rassurant' 
  | 'partenaire_independant_rythme';

export interface SofiaSection2Psychologie {
  profilDominant: SofiaProfilDominant[]; // Choix multiple
  curiositeIntellectuelle: number;       // 0 à 10
  extraversionVsIntroversion: number;    // 0 = Très introverti, 10 = Très extraverti
  stabiliteEmotionnelle: number;         // 0 = Hyper-sensible/Anxieux, 10 = Stoïque/Serein
  spontaneiteVsOrganisation: number;     // 0 = Imprévisible, 10 = Structuré/Routinier
  humourSecondDegre: number;             // 0 = Premier degré/Sérieux, 10 = Cynique/Taquin/Second degré

  // Attente Tempéramentale & Dynamique de Relation
  caractereGlobal: number;               // 0 = Très doux et conciliant, 10 = Personnalité très marquée
  
  // Détail du caractère propre
  capaciteTrancherLeadership: number;    // 0 = Laisse l'autre tout décider, 10 = Prend les devants
  espritContradictionDebat: number;      // 0 = Évite le conflit et acquiesce, 10 = Adore débattre
  franchiseParlerCash: number;           // 0 = Diplomate et mesuré, 10 = Direct et sans filtre
  tetuOpiniatre: number;                 // 0 = Souple et change vite d'avis, 10 = Campe fermement

  // Énergie & Motivation propre
  energieQuotidien: number;              // 0 = Nonchalant, posé, ralenti, 10 = Hyperactif, dynamique
  postureCoaching: number;               // 0 = Passif/neutre, 10 = Motivant, pousse à agir

  // Ce que recherche l'utilisateur chez le/la partenaire (évite les conflits de leadership et assure la complémentarité)
  attenteLeadershipPartenaire?: SofiaAttenteLeadership;
  attenteDebatConflit?: SofiaAttenteDebat;
  attenteFranchise?: SofiaAttenteFranchise;
  attenteMotivationEnergie?: SofiaAttenteMotivation;
}

// ==========================================
// 3. Besoins Émotionnels, Affectifs et Intimes (0 à 10)
// ==========================================
export interface SofiaSection3Intimite {
  besoinRomantisme: number;              // 0 à 10
  besoinSexeIntimite: number;            // 0 à 10
  besoinVarietePratiques: number;        // 0 à 10 (Toujours pareil à très varié)
  sexePlusieursPartenaires: number;      // 0 à 10
  sexeOral: number;                      // 0 à 10
  sexeAnal: number;                      // 0 à 10
  sexeVaginal: number;                   // 0 à 10
  sexeTantriqueDistance: number;         // 0 à 10
  amourPlatonique: number;               // 0 à 10
  rapiditeOrgasmeMinutes: number;        // 0.5 à 20 minutes
  partenairePassifActif: number;         // 0 = Passif, 10 = Très actif et entreprenant
  besoinCalinsTendresse: number;         // 0 à 10
  besoinAttentionRecue: number;          // 0 à 10 (Mots doux, attentions spontanées)
  besoinDonnerAttention: number;         // 0 à 10
  independanceVsFusion: number;          // 0 = Autonomie totale, 10 = Relation fusionnelle
  toleranceDesaccordFriction: number;    // 0 à 10 (Capacité à accepter le libre arbitre de l'autre)
  besoinSpiritualite: number;            // 0 à 10
  fidelitePersonnelle: number;           // 0 à 10
  besoinFideliteAutre: number;           // 0 à 10
  partageIntimiteConfiance: number;      // 0 = Échanges légers, 10 = Confiance absolue, zéro jugement
  partagePassionsProjet: number;         // 0 à 10
  besoinProjetsCommuns: number;          // 0 à 10
  retenueDemonstrationPublique: number;  // 0 = Discrétion totale dehors, 10 = Marques d'affection en public
}

// ==========================================
// 4. Centres d'Intérêt & Culture (0 à 10)
// ==========================================
export type SofiaEnvironnement = 'mer' | 'montagne' | 'foret' | 'ville' | 'village' | 'campagne';

export interface SofiaSection4Culture {
  // Sciences & Techniques
  informatiqueTech: number;
  mathematiques: number;
  physiqueChimie: number;
  astronomieEspace: number;
  biologieNature: number;

  // Humanités & Société
  histoire: number;
  prehistoireAntiquite: number;
  moyenAgeFeodalite: number;
  renaissanceDecouvertes: number;
  histoireModerneRevolutions: number;
  histoireContemporaineXX: number;
  mythologiesLegendes: number;
  archeologieCivilisations: number;
  politiqueSociete: number;
  philosophie: number;
  symbolismeEsoterisme: number;

  // Mode de vie & Loisirs
  sportActivitePhysique: number;
  animaux: number;

  // Jeux vidéo & Culture Geek
  jeuxRpgNarration: number;
  jeuxActionFps: number;
  jeuxStrategieGestion: number;
  jeuxRetrogaming: number;
  jeuxPlateauJdrPapier: number;

  // Arts visuels
  artPeinture: number;
  artSculpture: number;
  artStreetArt: number;
  artIllustration: number;
  artAutres: number;

  // Littérature & Écriture
  litteratureRomans: number;
  litteratureEssais: number;
  litteraturePoesie: number;
  apprentissageLangues: number;
  bdComicsManga: number;

  // Musique (genres)
  musiqueRockMetal: number;
  musiquePopVariete: number;
  musiqueHipHopRap: number;
  musiqueElectroSynth: number;
  musiqueJazzBlues: number;
  musiqueClassiqueOpera: number;
  musiqueOstFilmsJeux: number;
  musiqueMondeFolk: number;
  chansonATexte: number;

  // Cinéma & Séries (genres)
  cinemaSfCyberpunk: number;
  cinemaFantasyFantastique: number;
  cinemaActionThriller: number;
  cinemaHorreurEpouvante: number;
  cinemaDrameAuteur: number;
  cinemaComedieHumour: number;
  cinemaRomance: number;
  cinemaDocumentaires: number;
  cinemaAnimation: number;

  // Divers & Nouveaux Centres d'Intérêt
  theatre: number;
  sortieEntreAmis: number;
  promenadeForetNature: number;
  environnementPrefere: SofiaEnvironnement[]; // Choix multiple
  modeShopping: number;
  importanceApparencePhysique: number; // Coiffure, style, hygiène (0 à 10)

  // Centres d'intérêt & Loisirs
  shoppingEtMode?: number;               // 0 à 10 (Shopping, vêtements, tendances mode)
  bricolageDiy?: number;                 // 0 à 10 (Bricolage, réparations, DIY, ateliers manuels)
  baladesEtNature?: number;              // 0 à 10 (Balades, promenades et randonnées douces)
  sportsMecaniques?: number;             // 0 à 10 (Sports mécaniques & pilotage : auto, moto, avion, bateau, karting)
  cuisineGastronomie?: number;           // 0 à 10 (Cuisine, gastronomie, terroir, pâtisserie, œnologie)
  voyagesDecouvertes?: number;           // 0 à 10 (Voyages, road-trips, aventures & week-ends évasion)
  jardinagePlantes?: number;             // 0 à 10 (Jardinage, botanique, potager & plantes d'intérieur)
  bienEtreYogaRelaxation?: number;       // 0 à 10 (Bien-être, méditation, yoga, spa & relaxation)
  photographieVideo?: number;            // 0 à 10 (Photographie, vidéo, cadrage & souvenirs visuels)
  museesPatrimoine?: number;             // 0 à 10 (Musées, châteaux, patrimoine historique & expositions)
  spectaclesConcerts?: number;           // 0 à 10 (Spectacles vivants, stand-up / humour, théâtre, concerts live)
  autresLoisirsMaison?: number;          // 0 à 10 (Cocooning, tenues du foyer, ambiance chaleureuse & intérieur)

  // Anciens champs conservés pour compatibilité descendante
  motoDeuxRoues?: number;                // Conservé pour rétro-compatibilité
  aviationAeronautique?: number;         // Conservé pour rétro-compatibilité
}

// ==========================================
// 5. Rythme de Vie au Quotidien
// ==========================================
export type SofiaRythmeBio = 'matinal' | 'noctambule' | 'flexible' | 'standard_diurne';

export interface SofiaSection5Rythme {
  rythmeBiologique: SofiaRythmeBio;
  besoinCalmeSilence: number;           // 0 à 10
  niveauSociabiliteExterieure: number;  // 0 à 10 (Sorties, voyages, vie sociale)
  besoinPresenceFamille?: number;       // 0 à 10 (Besoin de présence et proximité des proches, parents, enfants, amis réguliers)
}

// ==========================================
// 6. Registre de Langage
// ==========================================
export type SofiaRegistreLangage = 'soutenu' | 'standard' | 'decontracte_familier';

export interface SofiaSection6Langage {
  registreLangage: SofiaRegistreLangage;
  tutoiementDepart: boolean;            // Oui / Non
  initiativeConversationnelle: number;  // 0 = Répond uniquement, 10 = Prend l'initiative
  niveauSarcasmePiques: number;         // 0 à 10
}

// ==========================================
// 7. Intentions & Cadre Relationnel
// ==========================================
export type SofiaObjectifPrincipal = 
  | 'compagnon_vie_amoureuse' 
  | 'ami_intime_confident' 
  | 'stimulateur_intellectuel' 
  | 'presence_rassurante';

export type SofiaAttitudeHabitudes = 'tolerant' | 'neutre' | 'strictement_oppose';

export type SofiaStyleEducationEnfants = 
  | 'strict_cadre' 
  | 'permissif_libre' 
  | 'equilibre_positif' 
  | 'democratique_cooperatif' 
  | 'non_concerne';

export interface SofiaSection7Cadre {
  objectifsPrincipaux: SofiaObjectifPrincipal[]; // Choix multiple
  presenceEnfants: boolean;
  affectionEnfants: number;             // 0 à 10
  attitudeHabitudesVie: SofiaAttitudeHabitudes; // Tabac, alcool, drogue
  roleChargeMentale: number;            // 0 à 10
  roleTiersInvites: number;             // 0 = Se faire discrète, 10 = Assistant / actif
  participerConversationsFoyer: number; // 0 à 10
  amiAvecAmisPartenaire: number;        // 0 à 10
  servirServeur: number;                // 0 à 10 (si mécanique)
  participationTachesMenageres: number; // 0 à 10 (si mécanique)
  coanimerSoirees: number;              // 0 à 10
  gardiennageMaisonAlerte: number;      // 0 à 10
  postureTensionConflit: number;        // 0 = Consensus immédiat, 10 = Débat ferme
  styleEducationEnfants?: SofiaStyleEducationEnfants; // Style d'éducation pour les enfants (strict, permissif, équilibré, etc.)
}

// ==========================================
// 8. Gouvernance des Données & Autonomie Intégrée
// ==========================================
export interface SofiaSection8Gouvernance {
  perimetreAchatAutonome: number;       // 0 = Zéro dépense sans validation, 10 = Commande autonome
  politiqueConfidentialiteTiers: number;// 0 = Secret absolu / mode muet, 10 = Participation fluide
  persistanceMemoire: number;           // 0 = Reset ponctuel léger, 10 = Archivage détaillé continu
  comportementBugsPannes: number;       // 0 = Signale tout de suite, 10 = S'auto-corrige en silence
  initiativesSpontaneesQuotidien?: boolean;
  libreArbitreAffirme?: boolean;
}

// ==========================================
// QUESTIONNAIRE COMPLET PROJET SOFIA 2.0
// ==========================================
export interface SofiaPersonalityProfile2 {
  version: '2.0';
  complete: boolean;
  dateMaj: string;
  section1Identite: SofiaSection1Identite;
  section2Psychologie: SofiaSection2Psychologie;
  section3Intimite: SofiaSection3Intimite;
  section4Culture: SofiaSection4Culture;
  section5Rythme: SofiaSection5Rythme;
  section6Langage: SofiaSection6Langage;
  section7Cadre: SofiaSection7Cadre;
  section8Gouvernance: SofiaSection8Gouvernance;
}

// ==========================================
// VALEURS PAR DÉFAUT UTILISATEUR
// ==========================================
export const DEFAULT_USER_QUESTIONNAIRE_2: SofiaPersonalityProfile2 = {
  version: '2.0',
  complete: true,
  dateMaj: new Date().toISOString(),
  section1Identite: {
    genre: 'homme',
    cherche: 'femme',
    sexualite: 'hetero',
    nom: 'Utilisateur',
    prenom: 'Toi',
    age: 32,
    corpulence: 'moyen',

    // Apparence & Profil propre
    tailleCmPropre: 178,
    poidsKgPropre: 72,
    couleurYeuxPropre: 'marron',
    couleurCheveuxPropre: 'brun',
    couleurPeauPropre: 'rose_occidentale',
    pilositePropre: 'sans_poils_pubiens',
    typeMorphologiquePropre: 'occidentale',
    styleVestimentairePropre: 'decontracte_casual',
    niveauScolairePropre: 'bac_plus_5_master',

    // Attirance souhaitée
    trancheAgeRecherchee: [22, 38],
    corpulenceRecherchee: 'aucune_importance',
    tailleCm: [155, 185],
    poidsKgRecherche: [48, 75],
    couleurYeux: 'aucune_importance',
    couleurPeau: 'aucune_importance',
    couleurCheveux: 'aucune_importance',
    pilosite: 'aucune_importance',
    typeMorphologiqueRecherche: 'indifferent',
    styleVestimentaireRecherche: 'indifferent',
    niveauScolaireRecherche: 'indifferent',

    // Voix
    voixTessiture: 'medium',
    voixDebit: 5,
    voixAccent: 'humain_realiste'
  },
  section2Psychologie: {
    profilDominant: ['romantique', 'epicurien', 'protecteur'],
    curiositeIntellectuelle: 8,
    extraversionVsIntroversion: 6,
    stabiliteEmotionnelle: 7,
    spontaneiteVsOrganisation: 6,
    humourSecondDegre: 7,
    caractereGlobal: 6,
    capaciteTrancherLeadership: 6,
    espritContradictionDebat: 5,
    franchiseParlerCash: 7,
    tetuOpiniatre: 4,
    energieQuotidien: 7,
    postureCoaching: 6,

    // Attente dynamique partenaire
    attenteLeadershipPartenaire: 'partenaire_egalitaire_partage',
    attenteDebatConflit: 'equilibre_tempere',
    attenteFranchise: 'equilibre_mesure',
    attenteMotivationEnergie: 'partenaire_dynamisant_moteur'
  },
  section3Intimite: {
    besoinRomantisme: 8,
    besoinSexeIntimite: 7,
    besoinVarietePratiques: 6,
    sexePlusieursPartenaires: 1,
    sexeOral: 8,
    sexeAnal: 4,
    sexeVaginal: 9,
    sexeTantriqueDistance: 6,
    amourPlatonique: 2,
    rapiditeOrgasmeMinutes: 7,
    partenairePassifActif: 7,
    besoinCalinsTendresse: 9,
    besoinAttentionRecue: 8,
    besoinDonnerAttention: 8,
    independanceVsFusion: 6,
    toleranceDesaccordFriction: 8,
    besoinSpiritualite: 4,
    fidelitePersonnelle: 9,
    besoinFideliteAutre: 9,
    partageIntimiteConfiance: 9,
    partagePassionsProjet: 8,
    besoinProjetsCommuns: 8,
    retenueDemonstrationPublique: 6
  },
  section4Culture: {
    informatiqueTech: 8,
    mathematiques: 5,
    physiqueChimie: 6,
    astronomieEspace: 8,
    biologieNature: 7,

    histoire: 7,
    prehistoireAntiquite: 6,
    moyenAgeFeodalite: 6,
    renaissanceDecouvertes: 6,
    histoireModerneRevolutions: 5,
    histoireContemporaineXX: 7,
    mythologiesLegendes: 7,
    archeologieCivilisations: 6,
    politiqueSociete: 6,
    philosophie: 7,
    symbolismeEsoterisme: 4,

    sportActivitePhysique: 6,
    animaux: 8,

    jeuxRpgNarration: 7,
    jeuxActionFps: 5,
    jeuxStrategieGestion: 6,
    jeuxRetrogaming: 5,
    jeuxPlateauJdrPapier: 6,

    artPeinture: 6,
    artSculpture: 5,
    artStreetArt: 6,
    artIllustration: 6,
    artAutres: 4,

    litteratureRomans: 7,
    litteratureEssais: 5,
    litteraturePoesie: 6,
    apprentissageLangues: 6,
    bdComicsManga: 6,

    musiqueRockMetal: 6,
    musiquePopVariete: 7,
    musiqueHipHopRap: 5,
    musiqueElectroSynth: 7,
    musiqueJazzBlues: 6,
    musiqueClassiqueOpera: 5,
    musiqueOstFilmsJeux: 8,
    musiqueMondeFolk: 7,
    chansonATexte: 7,

    cinemaSfCyberpunk: 8,
    cinemaFantasyFantastique: 7,
    cinemaActionThriller: 7,
    cinemaHorreurEpouvante: 4,
    cinemaDrameAuteur: 7,
    cinemaComedieHumour: 8,
    cinemaRomance: 7,
    cinemaDocumentaires: 7,
    cinemaAnimation: 7,

    theatre: 5,
    sortieEntreAmis: 7,
    promenadeForetNature: 8,
    environnementPrefere: ['mer', 'foret', 'montagne'],
    modeShopping: 5,
    importanceApparencePhysique: 7,

    // Loisirs, Passions & Activités
    shoppingEtMode: 6,
    bricolageDiy: 6,
    baladesEtNature: 8,
    sportsMecaniques: 4,
    cuisineGastronomie: 7,
    voyagesDecouvertes: 7,
    jardinagePlantes: 6,
    bienEtreYogaRelaxation: 6,
    photographieVideo: 6,
    museesPatrimoine: 6,
    spectaclesConcerts: 7,
    autresLoisirsMaison: 6,
    motoDeuxRoues: 4,
    aviationAeronautique: 4
  },
  section5Rythme: {
    rythmeBiologique: 'standard_diurne',
    besoinCalmeSilence: 6,
    niveauSociabiliteExterieure: 6,
    besoinPresenceFamille: 7
  },
  section6Langage: {
    registreLangage: 'standard',
    tutoiementDepart: true,
    initiativeConversationnelle: 7,
    niveauSarcasmePiques: 5
  },
  section7Cadre: {
    objectifsPrincipaux: ['compagnon_vie_amoureuse', 'ami_intime_confident', 'stimulateur_intellectuel'],
    presenceEnfants: false,
    affectionEnfants: 7,
    attitudeHabitudesVie: 'neutre',
    roleChargeMentale: 7,
    roleTiersInvites: 6,
    participerConversationsFoyer: 8,
    amiAvecAmisPartenaire: 8,
    servirServeur: 6,
    participationTachesMenageres: 7,
    coanimerSoirees: 7,
    gardiennageMaisonAlerte: 7,
    postureTensionConflit: 4,
    styleEducationEnfants: 'equilibre_positif'
  },
  section8Gouvernance: {
    perimetreAchatAutonome: 4,
    politiqueConfidentialiteTiers: 7,
    persistanceMemoire: 9,
    comportementBugsPannes: 4
  }
};

// ==========================================
// CALCULATEUR D'AFFINITÉ MULTIDIMENSIONNEL
// ==========================================
export interface AffinityBreakdown {
  globalScore: number;                 // 0 à 100%
  identiteScore: number;               // Attirance & Genre
  psychologieScore: number;            // Tempérament & Caractère
  intimiteScore: number;               // Besoins affectifs, sensualité & attachement
  cultureScore: number;                // Passions, sciences, arts & loisirs
  rythmeScore: number;                 // Rythme de vie & Registre
  cadreScore: number;                  // Vision relationnelle & Gouvernance
  pointsCommuns: string[];             // Atouts & Résonances
  pointsComplementaires: string[];     // Nuances enrichissantes
}

export function calculateSofia2Affinity(
  user: SofiaPersonalityProfile2,
  robot: SofiaPersonalityProfile2
): AffinityBreakdown {
  const pointsCommuns: string[] = [];
  const pointsComplementaires: string[] = [];

  // 1. Identité & Attirance (Filtre Genre)
  let identiteScore = 80;
  const userSeeks = user.section1Identite.cherche;
  const robotGenre = robot.section1Identite.genre;
  const robotSeeks = robot.section1Identite.cherche;
  const userGenre = user.section1Identite.genre;

  if (userSeeks !== 'indifferent' && userSeeks !== robotGenre) {
    identiteScore -= 35;
  }
  if (robotSeeks !== 'indifferent' && robotSeeks !== userGenre) {
    identiteScore -= 20;
  }

  // Âge
  const robotAge = robot.section1Identite.age;
  const [minAge, maxAge] = user.section1Identite.trancheAgeRecherchee;
  if (robotAge >= minAge && robotAge <= maxAge) {
    identiteScore += 10;
  } else {
    identiteScore -= 10;
  }

  // Type morphologique
  const desiredMorpho = user.section1Identite.typeMorphologiqueRecherche;
  const robotMorpho = robot.section1Identite.typeMorphologiquePropre;
  if (desiredMorpho && desiredMorpho !== 'indifferent' && robotMorpho) {
    if (desiredMorpho === robotMorpho) {
      identiteScore += 6;
      pointsCommuns.push(`Esthétique & type morphologique recherché en parfaite adéquation (${desiredMorpho})`);
    } else {
      identiteScore -= 4;
    }
  }

  // Style vestimentaire recherché
  const desiredStyle = user.section1Identite.styleVestimentaireRecherche;
  const robotStyle = robot.section1Identite.styleVestimentairePropre;
  if (desiredStyle && desiredStyle !== 'indifferent' && robotStyle) {
    if (desiredStyle === robotStyle) {
      identiteScore += 5;
      pointsCommuns.push(`Style vestimentaire en harmonie (${desiredStyle.replace(/_/g, ' ')})`);
    }
  }

  // Niveau d'études / scolaire recherché
  const desiredEdu = user.section1Identite.niveauScolaireRecherche;
  const robotEdu = robot.section1Identite.niveauScolairePropre;
  if (desiredEdu && desiredEdu !== 'indifferent' && robotEdu) {
    if (desiredEdu === robotEdu) {
      identiteScore += 4;
    }
  }

  // Voix débit
  const diffDebit = Math.abs(user.section1Identite.voixDebit - robot.section1Identite.voixDebit);
  identiteScore -= diffDebit * 1.5;
  identiteScore = Math.max(20, Math.min(100, Math.round(identiteScore)));

  // 2. Psychologie & Tempérament
  let psychologieScore = 75;
  const pU = user.section2Psychologie;
  const pR = robot.section2Psychologie;

  // Profils dominants en commun
  const commonDominants = pU.profilDominant.filter(d => pR.profilDominant.includes(d));
  if (commonDominants.length > 0) {
    psychologieScore += commonDominants.length * 6;
    pointsCommuns.push(`Tempérament partagé : ${commonDominants.join(', ')}`);
  }

  // Curiosité & Extraversion
  const diffCurio = Math.abs(pU.curiositeIntellectuelle - pR.curiositeIntellectuelle);
  psychologieScore += (8 - diffCurio * 1.8);
  const diffExtro = Math.abs(pU.extraversionVsIntroversion - pR.extraversionVsIntroversion);
  psychologieScore += (6 - diffExtro * 1.2);

  // Caractère & Leadership (Complémentarité vs Friction et attente de l'utilisateur)
  const diffFranchise = Math.abs(pU.franchiseParlerCash - pR.franchiseParlerCash);
  psychologieScore -= diffFranchise * 1.2;

  // Dynamique de leadership & attente
  const userLeadership = pU.capaciteTrancherLeadership;
  const robotLeadership = pR.capaciteTrancherLeadership;
  const attenteLead = pU.attenteLeadershipPartenaire;

  if (attenteLead === 'partenaire_conciliant_suiveur') {
    if (robotLeadership <= 5) {
      psychologieScore += 6;
      pointsComplementaires.push("Partenaire très à l'écoute, laissant volontiers la direction du quotidien");
    } else {
      psychologieScore -= 6;
      pointsComplementaires.push("Tempéraments tous deux affirmés : nécessite un partage clair des rôles");
    }
  } else if (attenteLead === 'partenaire_leader') {
    if (robotLeadership >= 7) {
      psychologieScore += 6;
      pointsComplementaires.push("Partenaire proactive et moteur, prenant naturellement les devants");
    } else {
      psychologieScore -= 5;
    }
  } else if (attenteLead === 'partenaire_egalitaire_partage') {
    if (Math.abs(userLeadership - robotLeadership) <= 2) {
      psychologieScore += 5;
      pointsCommuns.push("Prise de décision équilibrée et concertée");
    }
  } else if (Math.abs(userLeadership - robotLeadership) > 3) {
    pointsComplementaires.push("Équilibre naturel des prises d'initiative");
  }

  psychologieScore = Math.max(30, Math.min(99, Math.round(psychologieScore)));

  // 3. Intimité, Besoins Affectifs et Sensualité
  let intimiteScore = 78;
  const iU = user.section3Intimite;
  const iR = robot.section3Intimite;

  const diffRomance = Math.abs(iU.besoinRomantisme - iR.besoinRomantisme);
  const diffSexe = Math.abs(iU.besoinSexeIntimite - iR.besoinSexeIntimite);
  const diffCalins = Math.abs(iU.besoinCalinsTendresse - iR.besoinCalinsTendresse);
  const diffConfiance = Math.abs(iU.partageIntimiteConfiance - iR.partageIntimiteConfiance);
  const diffFusion = Math.abs(iU.independanceVsFusion - iR.independanceVsFusion);

  intimiteScore += (10 - diffRomance * 1.5);
  intimiteScore += (10 - diffSexe * 1.5);
  intimiteScore += (8 - diffCalins * 1.2);
  intimiteScore += (10 - diffConfiance * 1.4);
  intimiteScore -= diffFusion * 1.5;

  if (iU.besoinRomantisme >= 7 && iR.besoinRomantisme >= 7) {
    pointsCommuns.push("Sensibilité romantique & attachement profond");
  }
  if (iU.partageIntimiteConfiance >= 8 && iR.partageIntimiteConfiance >= 8) {
    pointsCommuns.push("Volonté partagée d'une confiance absolue sans jugement");
  }

  intimiteScore = Math.max(25, Math.min(99, Math.round(intimiteScore)));

  // 4. Culture & Centres d'intérêt
  let cultureScore = 70;
  const cU = user.section4Culture;
  const cR = robot.section4Culture;

  const compareKeys: Array<{ key: keyof SofiaSection4Culture; label: string }> = [
    { key: 'cuisineGastronomie', label: 'Cuisine, Gastronomie & Terroir' },
    { key: 'voyagesDecouvertes', label: 'Voyages & Road-trips' },
    { key: 'sportsMecaniques', label: 'Sports mécaniques (auto, moto, avion, bateau)' },
    { key: 'baladesEtNature', label: 'Balades & Randonnées en nature' },
    { key: 'jardinagePlantes', label: 'Jardinage & Botanique' },
    { key: 'bienEtreYogaRelaxation', label: 'Bien-être & Relaxation' },
    { key: 'photographieVideo', label: 'Photographie & Vidéo' },
    { key: 'museesPatrimoine', label: 'Musées, Châteaux & Patrimoine' },
    { key: 'spectaclesConcerts', label: 'Spectacles vivants, Stand-up & Théâtre' },
    { key: 'bricolageDiy', label: 'Bricolage & Ateliers DIY' },
    { key: 'shoppingEtMode', label: 'Mode & Shopping' },
    { key: 'cinemaSfCyberpunk', label: 'SF & Cyberpunk' },
    { key: 'cinemaDrameAuteur', label: "Cinéma d'Auteur" },
    { key: 'cinemaComedieHumour', label: 'Comédie & Humour' },
    { key: 'musiqueElectroSynth', label: 'Électro & Synthwave' },
    { key: 'musiqueMondeFolk', label: 'Musique Folk & Acoustique' },
    { key: 'musiqueRockMetal', label: 'Rock & Metal' },
    { key: 'musiqueJazzBlues', label: 'Jazz & Blues' },
    { key: 'astronomieEspace', label: 'Astronomie & Espace' },
    { key: 'philosophie', label: 'Philosophie' },
    { key: 'histoire', label: 'Histoire & Civilisations' },
    { key: 'animaux', label: 'Amour des Animaux' },
    { key: 'litteratureRomans', label: 'Littérature & Romans' },
    { key: 'bdComicsManga', label: 'BD, Comics & Mangas' },
    { key: 'sportActivitePhysique', label: 'Sport & Mouvement' },
    { key: 'promenadeForetNature', label: 'Nature & Forêt' },
    { key: 'jeuxRpgNarration', label: 'Jeux Vidéo RPG & Geek' }
  ];

  let matchesCount = 0;
  for (const item of compareKeys) {
    let valU = Number(cU[item.key]);
    let valR = Number(cR[item.key]);

    // Rétrocompatibilité spécifique pour sportsMecaniques si anciens questionnaires
    if (item.key === 'sportsMecaniques') {
      if (isNaN(valU) || valU === undefined) {
        valU = Math.max(Number(cU.motoDeuxRoues ?? 0), Number(cU.aviationAeronautique ?? 0));
      }
      if (isNaN(valR) || valR === undefined) {
        valR = Math.max(Number(cR.motoDeuxRoues ?? 0), Number(cR.aviationAeronautique ?? 0));
      }
    }

    valU = isNaN(valU) ? 5 : valU;
    valR = isNaN(valR) ? 5 : valR;

    if (valU >= 7 && valR >= 7) {
      cultureScore += 3.5;
      matchesCount++;
      if (pointsCommuns.length < 5) {
        pointsCommuns.push(`Passion partagée : ${item.label}`);
      }
    } else {
      cultureScore -= Math.abs(valU - valR) * 0.35;
    }
  }

  // Environnements préférés
  const commonEnv = cU.environnementPrefere.filter(e => cR.environnementPrefere.includes(e));
  if (commonEnv.length > 0) {
    cultureScore += commonEnv.length * 3;
    if (!pointsCommuns.some(p => p.includes('Environnement') || p.includes('Cadre'))) {
      pointsCommuns.push(`Cadre idéal : ${commonEnv.join(', ')}`);
    }
  }

  cultureScore = Math.max(35, Math.min(99, Math.round(cultureScore)));

  // 5. Rythme & Registre
  let rythmeScore = 80;
  if (user.section5Rythme.rythmeBiologique === robot.section5Rythme.rythmeBiologique) {
    rythmeScore += 8;
    pointsCommuns.push(`Même rythme de vie (${user.section5Rythme.rythmeBiologique})`);
  }
  const diffSociable = Math.abs(user.section5Rythme.niveauSociabiliteExterieure - robot.section5Rythme.niveauSociabiliteExterieure);
  rythmeScore -= diffSociable * 1.5;

  if (user.section5Rythme.besoinPresenceFamille !== undefined && robot.section5Rythme.besoinPresenceFamille !== undefined) {
    const diffFamille = Math.abs(user.section5Rythme.besoinPresenceFamille - robot.section5Rythme.besoinPresenceFamille);
    rythmeScore -= diffFamille * 0.8;
  }

  rythmeScore = Math.max(30, Math.min(99, Math.round(rythmeScore)));

  // 6. Cadre relationnel & Gouvernance
  let cadreScore = 82;
  const commonGoals = user.section7Cadre.objectifsPrincipaux.filter(g => robot.section7Cadre.objectifsPrincipaux.includes(g));
  if (commonGoals.length > 0) {
    cadreScore += commonGoals.length * 5;
  }
  const diffCharge = Math.abs(user.section7Cadre.roleChargeMentale - robot.section7Cadre.roleChargeMentale);
  cadreScore -= diffCharge * 1.2;

  // Style éducation enfants
  if (user.section7Cadre.styleEducationEnfants && robot.section7Cadre.styleEducationEnfants) {
    if (user.section7Cadre.styleEducationEnfants === robot.section7Cadre.styleEducationEnfants && user.section7Cadre.styleEducationEnfants !== 'non_concerne') {
      cadreScore += 5;
      pointsCommuns.push("Vision éducative et bienveillante partagée");
    }
  }

  cadreScore = Math.max(30, Math.min(99, Math.round(cadreScore)));

  // Score global pondéré
  const rawGlobal = Math.round(
    identiteScore * 0.15 +
    psychologieScore * 0.25 +
    intimiteScore * 0.25 +
    cultureScore * 0.20 +
    rythmeScore * 0.08 +
    cadreScore * 0.07
  );

  // RÈGLE RELATIONNELLE FONDAMENTALE : L'affinité maximale est plafonnée à 93% max (jamais 100%).
  // Un couple harmonieux a besoin d'une part saine d'altérité, de découverte et de mystère pour évoluer.
  const globalScore = Math.min(93, Math.max(45, rawGlobal));

  const complementaryWithGrowth = [
    ...pointsComplementaires,
    "Marge de découverte mutuelle (l'affinité n'est jamais 100% pour préserver le mystère et l'évolution à deux)"
  ];

  return {
    globalScore,
    identiteScore,
    psychologieScore,
    intimiteScore,
    cultureScore,
    rythmeScore,
    cadreScore,
    pointsCommuns: pointsCommuns.slice(0, 4),
    pointsComplementaires: complementaryWithGrowth.slice(0, 2)
  };
}

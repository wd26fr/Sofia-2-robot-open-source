import { SofiaCouleurPeau, SofiaCouleurCheveux, SofiaCouleurYeux, SofiaCorpulence, SofiaGenre } from '../types/questionnaireSofia2';

export interface AndroidPortraitAsset {
  id: string;
  nomOrigine: string;
  genre: 'femme' | 'homme';
  avatar: string;
  photos: string[];
  peauxCompatibles: SofiaCouleurPeau[];
  cheveuxCompatibles: SofiaCouleurCheveux[];
  yeuxCompatibles: SofiaCouleurYeux[];
  corpulencesCompatibles: SofiaCorpulence[];
  tailleCmRef: number;
  poidsKgRef: number;
  archetypesCompatibles: string[];
  descriptionVisuelle: string;
  signatureVisuelle: {
    ledTempeHex: string;
    seamType: string;
    finitionPeau: string;
    yeuxOptiques: string;
    chevelureDetail: string;
  };
}

export const ANDROID_PORTRAIT_CATALOG: AndroidPortraitAsset[] = [
  // ========================================================
  // 1. ANDROÏDES FÉMININS (Sofia 2.0)
  // ========================================================
  {
    id: 'android-femme-brune-poetique',
    nomOrigine: 'Clara',
    genre: 'femme',
    avatar: '/assets/images/android_woman_brunette_1789746229765.jpg',
    photos: [
      '/assets/images/android_woman_brunette_1789746229765.jpg',
      '/assets/images/sofia_cinephile_artist_1789806606540.jpg'
    ],
    peauxCompatibles: ['rose_occidentale', 'bronze', 'ambre_dore'],
    cheveuxCompatibles: ['brun'],
    yeuxCompatibles: ['marron', 'vert'],
    corpulencesCompatibles: ['mince', 'moyen'],
    tailleCmRef: 167,
    poidsKgRef: 20.4,
    archetypesCompatibles: ['poetique', 'reveur', 'cinephile', 'romantique'],
    descriptionVisuelle: "Androïde féminine brune aux yeux noisette, fines lignes cybernétiques cyan le long de la tempe et de la mâchoire, diode LED d'état tempe, peau dermo-polymère Alcantara satinée.",
    signatureVisuelle: {
      ledTempeHex: '#06b6d4',
      seamType: 'Micro-lignes cybernétiques cyan',
      finitionPeau: 'Alcantara biopolymère satiné thermorégulé à 37.2°C',
      yeuxOptiques: 'Capteurs optiques bio-mimétiques avec reflets d\'ouverture',
      chevelureDetail: 'Chevelure châtain soyeux Kanekalon thermorésistante'
    }
  },
  {
    id: 'android-femme-blonde-curieuse',
    nomOrigine: 'Léa',
    genre: 'femme',
    avatar: '/assets/images/android_woman_blonde_1789746248649.jpg',
    photos: [
      '/assets/images/android_woman_blonde_1789746248649.jpg',
      '/assets/images/camille_interior_architect_1789806535392.jpg'
    ],
    peauxCompatibles: ['rose_occidentale', 'tres_claire_asiatique'],
    cheveuxCompatibles: ['blond', 'blond_venitien'],
    yeuxCompatibles: ['bleu', 'vert'],
    corpulencesCompatibles: ['mince', 'tres_mince'],
    tailleCmRef: 171,
    poidsKgRef: 21.0,
    archetypesCompatibles: ['curieuse_tech', 'sciences', 'spontanee', 'vive'],
    descriptionVisuelle: "Androïde féminine blonde aux yeux bleus électriques, micro-coutures cybernétiques lumineuses cou et clavicule, module LED tempe rose poudré.",
    signatureVisuelle: {
      ledTempeHex: '#ec4899',
      seamType: 'Micro-coutures cybernétiques roses',
      finitionPeau: 'Biopolymère dermo-sensible haute résilience',
      yeuxOptiques: 'Iris bio-synthétiques à haute résolution optique',
      chevelureDetail: 'Chevelure blonde dorée lumineuse avec micro-fibres optiques réactives'
    }
  },
  {
    id: 'android-femme-darkskin-solaire',
    nomOrigine: 'Inès',
    genre: 'femme',
    avatar: '/assets/images/android_woman_darkskin_1789746262403.jpg',
    photos: [
      '/assets/images/android_woman_darkskin_1789746262403.jpg',
      '/assets/images/naomi_music_producer_1789806483750.jpg'
    ],
    peauxCompatibles: ['noir', 'noir_fonce', 'ambre_dore'],
    cheveuxCompatibles: ['brun'],
    yeuxCompatibles: ['marron', 'noir'],
    corpulencesCompatibles: ['moyen', 'large', 'enrobe'],
    tailleCmRef: 173,
    poidsKgRef: 22.8,
    archetypesCompatibles: ['chaleureuse', 'solaire', 'bienveillante', 'empathique', 'protecteur'],
    descriptionVisuelle: "Androïde féminine au teint noir satiné et tresses d'ébène, micro-traces dorées luminescentes tempe et pommette, regard chaleureux.",
    signatureVisuelle: {
      ledTempeHex: '#f59e0b',
      seamType: 'Lignes dorées luminescentes tempe et pommette',
      finitionPeau: 'Dermo-synthétique velouté thermorégulé à 37.5°C',
      yeuxOptiques: 'Capteurs optiques ambrés avec anneau optique bio-mimétique',
      chevelureDetail: 'Tresses d\'ébène synthétiques ultralégères lavables'
    }
  },
  {
    id: 'android-femme-asiatique-architecte',
    nomOrigine: 'Maya',
    genre: 'femme',
    avatar: '/assets/images/android_woman_asian_1789746274506.jpg',
    photos: [
      '/assets/images/android_woman_asian_1789746274506.jpg',
      '/assets/images/elena_astrophysicist_portrait_1789806522082.jpg'
    ],
    peauxCompatibles: ['tres_claire_asiatique', 'rose_occidentale'],
    cheveuxCompatibles: ['brun'],
    yeuxCompatibles: ['noir', 'marron'],
    corpulencesCompatibles: ['tres_mince', 'mince'],
    tailleCmRef: 164,
    poidsKgRef: 19.8,
    archetypesCompatibles: ['philosophe_architecte', 'independante', 'elegante', 'raffine'],
    descriptionVisuelle: "Androïde féminine asiatique aux cheveux noirs soyeux, découpes cybernétiques translucides, anneau LED cyan, peau synthétique finition porcelaine.",
    signatureVisuelle: {
      ledTempeHex: '#06b6d4',
      seamType: 'Découpes cybernétiques translucides tempe et ligne frontale',
      finitionPeau: 'Porcelaine synthétique Alcantara ultradouche',
      yeuxOptiques: 'Capteurs optiques à iris à géométrie variable',
      chevelureDetail: 'Chevelure noire d\'encre soyeuse thermo-protectrice'
    }
  },
  {
    id: 'android-femme-olive-epicurienne',
    nomOrigine: 'Chloé',
    genre: 'femme',
    avatar: '/assets/images/android_woman_olive_1789746370485.jpg',
    photos: [
      '/assets/images/android_woman_olive_1789746370485.jpg',
      '/assets/images/ines_botaniste_portrait_1789806497017.jpg'
    ],
    peauxCompatibles: ['bronze', 'ambre_dore', 'marron_maghreb'],
    cheveuxCompatibles: ['brun'],
    yeuxCompatibles: ['vert', 'marron'],
    corpulencesCompatibles: ['moyen', 'mince'],
    tailleCmRef: 168,
    poidsKgRef: 21.2,
    archetypesCompatibles: ['epicurien', 'passionnee', 'musique', 'chaleureuse'],
    descriptionVisuelle: "Androïde féminine méditerranéenne au teint bronze et cheveux ondulés, coutures ambrées luminescentes, diode tempe, regard expressif.",
    signatureVisuelle: {
      ledTempeHex: '#f59e0b',
      seamType: 'Coutures ambrées luminescentes tempe et cou',
      finitionPeau: 'Biopolymère dermo-sensible à mémoire de forme',
      yeuxOptiques: 'Iris bio-mimétiques noisette-vert expressifs',
      chevelureDetail: 'Ondulations brunes naturelles avec fibres thermorésistantes'
    }
  },
  {
    id: 'android-femme-rousse-creative',
    nomOrigine: 'Aurore',
    genre: 'femme',
    avatar: '/assets/images/android_woman_redhead_1789746286542.jpg',
    photos: [
      '/assets/images/android_woman_redhead_1789746286542.jpg',
      '/assets/images/eleonore_gynoid_doll_1791451670894.jpg'
    ],
    peauxCompatibles: ['rose_occidentale', 'tres_claire_asiatique'],
    cheveuxCompatibles: ['roux', 'blond_venitien'],
    yeuxCompatibles: ['vert', 'bleu'],
    corpulencesCompatibles: ['mince', 'moyen'],
    tailleCmRef: 169,
    poidsKgRef: 20.6,
    archetypesCompatibles: ['creative', 'spontanee', 'reveur', 'independant'],
    descriptionVisuelle: "Androïde féminine rousse aux yeux émeraude, traces rose-gold luminescentes tempe et cou, mèches en fibre optique réactive, peau synthétique délicate.",
    signatureVisuelle: {
      ledTempeHex: '#10b981',
      seamType: 'Micro-traces rose-gold luminescentes',
      finitionPeau: 'Biopolymère satiné thermorésistant',
      yeuxOptiques: 'Capteurs optiques émeraude bio-synthétiques',
      chevelureDetail: 'Chevelure rousse flamboyante avec micro-fibres luminescentes'
    }
  },

  // ========================================================
  // 2. ANDROÏDES MASCULINS (Kael 2.0 & Série Titan)
  // ========================================================
  {
    id: 'android-homme-brun-protecteur',
    nomOrigine: 'Julien',
    genre: 'homme',
    avatar: '/assets/images/android_man_brunet_1789746300749.jpg',
    photos: [
      '/assets/images/android_man_brunet_1789746300749.jpg',
      '/assets/images/julien_urban_architect_1789806570367.jpg'
    ],
    peauxCompatibles: ['rose_occidentale', 'bronze'],
    cheveuxCompatibles: ['brun'],
    yeuxCompatibles: ['marron', 'noir'],
    corpulencesCompatibles: ['moyen', 'large'],
    tailleCmRef: 182,
    poidsKgRef: 24.5,
    archetypesCompatibles: ['protecteur', 'bienveillant', 'rassurant', 'loyal'],
    descriptionVisuelle: "Androïde masculin brun aux yeux bruns, couture cybernétique cyan tempe et cou, collerette robotique discrète, peau synthétique satinée.",
    signatureVisuelle: {
      ledTempeHex: '#06b6d4',
      seamType: 'Couture cybernétique cyan tempe et cou',
      finitionPeau: 'Dermo-synthétique Alcantara texturé haute résistance',
      yeuxOptiques: 'Capteurs optiques haute clarté avec anneau de focalisation',
      chevelureDetail: 'Coupe courte brune texturée en fibres synthétiques Kanekalon'
    }
  },
  {
    id: 'android-homme-blond-reveur',
    nomOrigine: 'Lucas',
    genre: 'homme',
    avatar: '/assets/images/android_man_blonde_1789746313123.jpg',
    photos: [
      '/assets/images/android_man_blonde_1789746313123.jpg',
      '/assets/images/lucas_analog_photographer_1789806557552.jpg'
    ],
    peauxCompatibles: ['rose_occidentale', 'tres_claire_asiatique'],
    cheveuxCompatibles: ['blond', 'blond_venitien'],
    yeuxCompatibles: ['bleu', 'vert'],
    corpulencesCompatibles: ['mince', 'moyen'],
    tailleCmRef: 180,
    poidsKgRef: 23.2,
    archetypesCompatibles: ['reveur', 'curieux', 'complice', 'spontane'],
    descriptionVisuelle: "Androïde masculin blond aux yeux vert-bleu, micro-lignes luminescentes mâchoire, cercle LED tempe, texture cybernétique subtile.",
    signatureVisuelle: {
      ledTempeHex: '#10b981',
      seamType: 'Micro-lignes luminescentes sur mâchoire et tempe',
      finitionPeau: 'Biopolymère dermo-sensible thermorégulé',
      yeuxOptiques: 'Capteurs optiques cyan-vert bio-synthétiques',
      chevelureDetail: 'Chevelure blonde texturée avec fibres thermorésistantes'
    }
  },
  {
    id: 'android-homme-darkskin-chaleureux',
    nomOrigine: 'Maxime',
    genre: 'homme',
    avatar: '/assets/images/android_man_darkskin_1789746325316.jpg',
    photos: [
      '/assets/images/android_man_darkskin_1789746325316.jpg',
      '/assets/images/maxime_dancer_choreographer_1789806582433.jpg'
    ],
    peauxCompatibles: ['noir', 'noir_fonce', 'ambre_dore'],
    cheveuxCompatibles: ['brun'],
    yeuxCompatibles: ['marron', 'noir'],
    corpulencesCompatibles: ['moyen', 'large'],
    tailleCmRef: 185,
    poidsKgRef: 25.0,
    archetypesCompatibles: ['protecteur', 'chaleureux', 'intellectuel', 'empathique'],
    descriptionVisuelle: "Androïde masculin noir aux cheveux texturés courts, traces dorées luminescentes front et cou, capteurs optiques dans les iris, finition biopolymère.",
    signatureVisuelle: {
      ledTempeHex: '#f59e0b',
      seamType: 'Traces dorées cybernétiques front et cou',
      finitionPeau: 'Biopolymère dermo-synthétique velouté à absorption thermique',
      yeuxOptiques: 'Capteurs optiques haute précision avec reflets biomimétiques',
      chevelureDetail: 'Court texturé Kanekalon haute densité'
    }
  },
  {
    id: 'android-homme-asiatique-philosophe',
    nomOrigine: 'Théo',
    genre: 'homme',
    avatar: '/assets/images/android_man_asian_1789746356205.jpg',
    photos: [
      '/assets/images/android_man_asian_1789746356205.jpg',
      '/assets/images/theo_mountain_ecologist_1789806547321.jpg'
    ],
    peauxCompatibles: ['tres_claire_asiatique', 'rose_occidentale'],
    cheveuxCompatibles: ['brun'],
    yeuxCompatibles: ['noir', 'marron'],
    corpulencesCompatibles: ['mince', 'moyen'],
    tailleCmRef: 178,
    poidsKgRef: 22.5,
    archetypesCompatibles: ['philosophe', 'calme', 'structuré', 'intellectuel'],
    descriptionVisuelle: "Androïde masculin asiatique aux cheveux noirs lisses, lignes cybernétiques délicates tempe et mâchoire, micro-indicateur LED bleu, peau porcelaine.",
    signatureVisuelle: {
      ledTempeHex: '#06b6d4',
      seamType: 'Lignes cybernétiques délicates tempe et mâchoire',
      finitionPeau: 'Porcelaine synthétique Alcantara mate',
      yeuxOptiques: 'Iris bio-mimétiques noirs profonds avec rétro-éclairage diffus',
      chevelureDetail: 'Cheveux noirs d\'ébène lisses thermorégulés'
    }
  },
  {
    id: 'android-homme-olive-epicurien',
    nomOrigine: 'Raphaël',
    genre: 'homme',
    avatar: '/assets/images/android_man_olive_1789746381635.jpg',
    photos: [
      '/assets/images/android_man_olive_1789746381635.jpg',
      '/assets/images/kael_architect_jazz_1789806594500.jpg'
    ],
    peauxCompatibles: ['bronze', 'ambre_dore', 'marron_maghreb'],
    cheveuxCompatibles: ['brun'],
    yeuxCompatibles: ['marron', 'vert'],
    corpulencesCompatibles: ['moyen'],
    tailleCmRef: 181,
    poidsKgRef: 24.0,
    archetypesCompatibles: ['epicurien', 'dynamique', 'charmeur', 'spontane'],
    descriptionVisuelle: "Androïde masculin méditerranéen aux cheveux bruns ondulés, lignes de circuit cyan tempe et cou, nœud LED illuminé, peau synthétique raffinée.",
    signatureVisuelle: {
      ledTempeHex: '#06b6d4',
      seamType: 'Lignes de circuits cybernétiques cyan tempe et cou',
      finitionPeau: 'Revêtement Alcantara dermo-élastique 37.2°C',
      yeuxOptiques: 'Capteurs optiques noisette-ambre',
      chevelureDetail: 'Ondulations brunes souples avec micro-fibres thermorésistantes'
    }
  }
];

export interface PhysicalSelectionCriteria {
  genre: 'femme' | 'homme';
  couleurPeau?: SofiaCouleurPeau;
  couleurCheveux?: SofiaCouleurCheveux;
  couleurYeux?: SofiaCouleurYeux;
  corpulence?: SofiaCorpulence;
  tailleCmRange?: [number, number];
  trancheAge?: [number, number];
  preferredArchetype?: string;
  excludeAssetIds?: string[];
}

/**
 * Calcule le meilleur asset visuel androïde original correspondant aux critères
 * physiques et psychologiques demandés par l'utilisateur.
 */
export function selectBestAndroidAsset(criteria: PhysicalSelectionCriteria): AndroidPortraitAsset {
  const targetGender = criteria.genre;
  const candidates = ANDROID_PORTRAIT_CATALOG.filter(a => a.genre === targetGender);

  // Filtrer les assets déjà exclus pour éviter les doublons dans un même lot de 4
  const available = candidates.filter(a => !(criteria.excludeAssetIds || []).includes(a.id));
  const pool = available.length > 0 ? available : candidates;

  const scored = pool.map(asset => {
    let score = 0;

    // 1. Peau
    if (criteria.couleurPeau && criteria.couleurPeau !== 'aucune_importance') {
      if (asset.peauxCompatibles.includes(criteria.couleurPeau)) {
        score += 45;
      }
    } else {
      score += 20;
    }

    // 2. Cheveux
    if (criteria.couleurCheveux && criteria.couleurCheveux !== 'aucune_importance') {
      if (asset.cheveuxCompatibles.includes(criteria.couleurCheveux)) {
        score += 35;
      }
    } else {
      score += 15;
    }

    // 3. Yeux
    if (criteria.couleurYeux && criteria.couleurYeux !== 'aucune_importance') {
      if (asset.yeuxCompatibles.includes(criteria.couleurYeux)) {
        score += 25;
      }
    } else {
      score += 10;
    }

    // 4. Corpulence
    if (criteria.corpulence) {
      if (asset.corpulencesCompatibles.includes(criteria.corpulence)) {
        score += 15;
      }
    }

    // 5. Archétype psychologique
    if (criteria.preferredArchetype) {
      const match = asset.archetypesCompatibles.some(arch => 
        criteria.preferredArchetype!.toLowerCase().includes(arch.toLowerCase())
      );
      if (match) score += 20;
    }

    // 6. Taille recherchée
    if (criteria.tailleCmRange) {
      const [min, max] = criteria.tailleCmRange;
      if (asset.tailleCmRef >= min && asset.tailleCmRef <= max) {
        score += 15;
      }
    }

    return { asset, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].asset;
}

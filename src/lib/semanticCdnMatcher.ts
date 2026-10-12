/**
 * Moteur IA CDN 0-Token & Vérificateur Sémantique Anti-Faux Positifs
 * 
 * Ce module permet de :
 * 1. Charger dynamiquement un modèle ou script d'IA ultra-léger via CDN (ex: Transformers.js / HuggingFace / ONNX)
 * 2. Vérifier la cohérence sémantique entre la phrase saisie par l'utilisateur et l'intention / réponse prévue
 * 3. Détecter et filtrer formellement les négations et contre-sens (ex: "ne ... pas", "surtout pas", "jamais", "déteste")
 *    pour éviter que des mots-clés isolés ne déclenchent de faux positifs dans le moteur déterministe 0-token.
 * 4. Permettre la configuration dynamique de l'URL du CDN et des seuils depuis le Back-Office.
 */

export interface SemanticCdnConfig {
  enabled: boolean;
  cdnUrl: string;
  modelName: string;
  similarityThreshold: number; // e.g. 0.60 (entre 0.40 et 0.90)
  negationGuard: boolean;      // Rejet immédiat si négation ou opposition détectée
  fallbackMode: 'hybrid_local' | 'strict_cdn';
  lastStatus?: 'ready' | 'loading' | 'error' | 'local_fallback';
  lastError?: string;
}

const STORAGE_KEY = 'sofia_cdn_semantic_config';

export const DEFAULT_CDN_CONFIG: SemanticCdnConfig = {
  enabled: true,
  cdnUrl: 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js',
  modelName: 'Xenova/all-MiniLM-L6-v2',
  similarityThreshold: 0.45,
  negationGuard: true,
  fallbackMode: 'hybrid_local',
  lastStatus: 'ready'
};

// Récupère la configuration persistée
export function getSemanticCdnConfig(): SemanticCdnConfig {
  if (typeof window === 'undefined') return DEFAULT_CDN_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CDN_CONFIG;
    return { ...DEFAULT_CDN_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CDN_CONFIG;
  }
}

// Sauvegarde la configuration
export function saveSemanticCdnConfig(config: SemanticCdnConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Impossible de sauvegarder SemanticCdnConfig:', e);
  }
}

// Réinitialise la configuration aux valeurs par défaut
export function resetSemanticCdnConfig(): SemanticCdnConfig {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Impossible de réinitialiser SemanticCdnConfig:', e);
    }
  }
  return { ...DEFAULT_CDN_CONFIG };
}

// Détection intelligente de négations, refus et contre-sens sur des mots-clés
const NEGATION_PATTERNS = [
  /\bne\s+(\w+\s+)?pas\b/i,
  /\bne\s+(\w+\s+)?plus\b/i,
  /\bne\s+(\w+\s+)?jamais\b/i,
  /\bne\s+(\w+\s+)?rien\b/i,
  /\bne\s+(\w+\s+)?guere\b/i,
  /\bn['’](\w+\s+)?pas\b/i,
  /\bn['’](\w+\s+)?plus\b/i,
  /\bn['’](\w+\s+)?jamais\b/i,
  /\bpas\s+du\s+tout\b/i,
  /\bpas\s+envie\b/i,
  /\bpas\s+question\b/i,
  /\bsurtout\s+pas\b/i,
  /\bhors\s+de\s+question\b/i,
  /\barrete\s+de\b/i,
  /\barretez\s+de\b/i,
  /\bcesse\s+de\b/i,
  /\bdeteste\b/i,
  /\bhais\b/i,
  /\bhorreur\s+de\b/i,
  /\brefuse\s+de\b/i,
  /\bnon\s+merci\b/i
];

/**
 * Détecte si le message de l'utilisateur contient une négation ou un refus
 * visant directement un mot-clé ou l'action.
 * Exemple : "Je ne veux pas dire bonjour", "Ne me souris pas", "Arrête de faire ça"
 */
export function detectNegationOrOpposition(userInput: string, keywords: string[] = []): {
  isNegated: boolean;
  reason?: string;
} {
  const cleanInput = userInput.trim().toLowerCase();

  for (const pattern of NEGATION_PATTERNS) {
    if (pattern.test(cleanInput)) {
      // Vérifier si la négation est à proximité d'un des mots-clés
      if (keywords.length > 0) {
        for (const kw of keywords) {
          const cleanKw = kw.toLowerCase().trim();
          if (cleanKw && cleanInput.includes(cleanKw)) {
            return {
              isNegated: true,
              reason: `Négation / refus direct détecté sur l'expression "${cleanKw}" (motif: ${pattern})`
            };
          }
        }
      }
      // Négation globale forte
      return {
        isNegated: true,
        reason: `Structure de négation ou refus détectée dans le message ("${userInput.slice(0, 40)}...")`
      };
    }
  }

  return { isNegated: false };
}

/**
 * Calcul hybride de similarité sémantique par overlap n-gram & cosine local (ultra-rapide, 0ms)
 * Utilisé en mode hybride local ou en repli si le CDN est en cours de téléchargement / hors ligne.
 */
const FRENCH_STOP_WORDS = new Set([
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd', 'ce', 'cet', 'cette', 'ces',
  'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'mon', 'ton', 'son', 'ma', 'ta', 'sa',
  'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'nos', 'vos', 'leurs',
  'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
  'moi', 'toi', 'lui', 'eux', 'me', 'te', 'se', 'y', 'en',
  'suis', 'es', 'est', 'sommes', 'etes', 'êtes', 'sont', 'serai', 'seras', 'sera', 'serons', 'serez', 'seront',
  'ai', 'as', 'a', 'avons', 'avez', 'ont', 'aurai', 'auras', 'aura',
  'fais', 'fait', 'faire', 'font', 'dis', 'dit', 'dire',
  'dans', 'par', 'pour', 'vers', 'avec', 'sans', 'sous', 'sur', 'chez', 'au', 'aux',
  'qui', 'que', 'quoi', 'dont', 'où', 'ou', 'quand', 'comment', 'pourquoi', 'si',
  'ne', 'pas', 'plus', 'tres', 'très', 'trop', 'bien', 'aussi', 'tout', 'tous', 'toute', 'toutes'
]);

export function calculateLocalSemanticScore(textA: string, textB: string): number {
  const normalize = (t: string) => 
    t.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !FRENCH_STOP_WORDS.has(w));

  const wordsA = normalize(textA);
  const wordsB = normalize(textB);

  // Si l'un des textes ne contient aucun mot signifiant après filtrage
  if (wordsA.length === 0 || wordsB.length === 0) return 0.0;

  const setB = new Set(wordsB);
  let intersection = 0;
  for (const w of wordsA) {
    if (setB.has(w)) {
      intersection += 1.0;
    } else {
      // Vérifier similarité de racine (stemming approximatif)
      for (const b of wordsB) {
        if (w.length >= 4 && b.length >= 4 && (w.startsWith(b.slice(0, 4)) || b.startsWith(w.slice(0, 4)))) {
          intersection += 0.5;
          break;
        }
      }
    }
  }

  // Si AUCUN mot en commun, la similarité est STRICTEMENT 0 (aucun faux positif possible)
  if (intersection <= 0) {
    return 0.0;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  const jaccard = union > 0 ? intersection / union : 0;
  const dice = (2 * intersection) / (wordsA.length + wordsB.length);
  
  // Moyenne pondérée entre Jaccard et Dice, normalisée
  const score = (jaccard * 0.4) + (dice * 0.6);
  return Math.min(1, Math.max(0, score));
}

// Déclaration pour le SDK Transformers.js injecté via CDN
declare global {
  interface Window {
    transformers?: {
      pipeline: (task: string, model: string, options?: any) => Promise<any>;
      env?: {
        allowLocalModels?: boolean;
        useBrowserCache?: boolean;
      };
    };
  }
}

// Cache du script CDN chargé et du pipeline ONNX
let cdnScriptLoadingPromise: Promise<boolean> | null = null;
let cdnScriptLoaded = false;
let cdnPipelineInstance: any = null;
let cdnPipelineLoading = false;

/**
 * Charge dynamiquement le script de l'IA depuis le CDN spécifié
 */
export function loadCdnAiScript(cdnUrl: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (cdnScriptLoaded) return Promise.resolve(true);
  if (cdnScriptLoadingPromise) return cdnScriptLoadingPromise;

  cdnScriptLoadingPromise = new Promise((resolve) => {
    // Vérifier si déjà présent dans le DOM
    const existing = document.querySelector(`script[data-sofia-cdn-ai]`);
    if (existing) {
      cdnScriptLoaded = true;
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = cdnUrl;
    script.async = true;
    script.setAttribute('data-sofia-cdn-ai', 'true');

    script.onload = () => {
      cdnScriptLoaded = true;
      console.log('✅ Script IA CDN chargé avec succès pour le moteur local 0-token:', cdnUrl);
      resolve(true);
    };

    script.onerror = (err) => {
      console.warn('⚠️ Échec chargement script IA CDN, repli sur le moteur hybride local:', err);
      cdnScriptLoaded = false;
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return cdnScriptLoadingPromise;
}

/**
 * Initialise ou récupère le pipeline Transformers.js pour l'extraction d'embeddings vectoriels
 */
export async function getCdnPipelineInstance(modelName: string): Promise<any | null> {
  if (typeof window === 'undefined' || !window.transformers) return null;
  if (cdnPipelineInstance) return cdnPipelineInstance;
  if (cdnPipelineLoading) return null;

  try {
    cdnPipelineLoading = true;
    const { pipeline, env } = window.transformers;
    if (env) {
      env.allowLocalModels = false;
      env.useBrowserCache = true;
    }
    // Pipeline d'extraction d'embeddings ONNX all-MiniLM-L6-v2 ou bge-small
    cdnPipelineInstance = await pipeline('feature-extraction', modelName || 'Xenova/all-MiniLM-L6-v2', {
      quantized: true
    });
    console.log('✅ Pipeline CDN IA Transformers.js initialisé avec succès pour les embeddings 0-token');
    return cdnPipelineInstance;
  } catch (err) {
    console.warn('⚠️ Impossible d\'initialiser le pipeline Transformers.js via CDN (mode hybride local actif):', err);
    return null;
  } finally {
    cdnPipelineLoading = false;
  }
}

/**
 * Calcule la similarité cosinus vectorielle directe via Transformers.js
 */
async function calculateCdnEmbeddingSimilarity(textA: string, textB: string, modelName: string): Promise<number | null> {
  const pipe = await getCdnPipelineInstance(modelName);
  if (!pipe) return null;
  try {
    const outA = await pipe(textA, { pooling: 'mean', normalize: true });
    const outB = await pipe(textB, { pooling: 'mean', normalize: true });
    const dataA = outA?.data;
    const dataB = outB?.data;
    if (!dataA || !dataB) return null;
    let dot = 0;
    const len = Math.min(dataA.length, dataB.length);
    for (let i = 0; i < len; i++) {
      dot += dataA[i] * dataB[i];
    }
    return Math.max(0, Math.min(1, dot));
  } catch (e) {
    console.warn('Erreur calcul embedding CDN Transformers:', e);
    return null;
  }
}

export interface SemanticVerificationResult {
  isValid: boolean;
  score: number;
  reason: string;
  isNegationDetected: boolean;
  engineUsed: 'cdn_ai' | 'hybrid_local';
}

/**
 * Vérification principale anti-faux positifs :
 * Valide que la phrase de l'utilisateur correspond véritablement à l'esprit de la règle
 * et ne constitue pas un faux positif dû à une négation ou une coïncidence de mot-clé.
 */
export async function verifySemanticCoherence(
  userInput: string,
  targetIntentOrResponse: string,
  keywords: string[] = [],
  customConfig?: SemanticCdnConfig
): Promise<SemanticVerificationResult> {
  const config = customConfig || getSemanticCdnConfig();

  // 1. Garde-fou Négation & Opposition (priorité absolue)
  if (config.negationGuard) {
    const negCheck = detectNegationOrOpposition(userInput, keywords);
    if (negCheck.isNegated) {
      return {
        isValid: false,
        score: 0.05,
        reason: `Faux positif bloqué : ${negCheck.reason}. La phrase exprime un refus ou une négation.`,
        isNegationDetected: true,
        engineUsed: 'hybrid_local'
      };
    }
  }

  // Si le moteur sémantique est désactivé, on autorise le match direct
  if (!config.enabled) {
    return {
      isValid: true,
      score: 0.95,
      reason: 'Vérificateur sémantique désactivé (validation directe).',
      isNegationDetected: false,
      engineUsed: 'hybrid_local'
    };
  }

  // 2. Tenter l'évaluation par embeddings CDN si disponible
  let rawScore: number | null = null;
  let engineUsed: 'cdn_ai' | 'hybrid_local' = 'hybrid_local';

  if (config.cdnUrl && typeof window !== 'undefined') {
    try {
      const scriptReady = await loadCdnAiScript(config.cdnUrl);
      if (scriptReady) {
        rawScore = await calculateCdnEmbeddingSimilarity(userInput, targetIntentOrResponse, config.modelName);
        if (rawScore !== null) {
          engineUsed = 'cdn_ai';
        }
      }
    } catch {
      rawScore = null;
    }
  }

  // Repli sur le moteur hybride local de haute précision
  if (rawScore === null) {
    const combinedTarget = `${targetIntentOrResponse} ${keywords.join(' ')}`;
    rawScore = calculateLocalSemanticScore(userInput, combinedTarget);
    engineUsed = 'hybrid_local';
  }

  // Si un mot-clé configuré de la règle est formellement détecté (sans négation) :
  // Le match déterministe est valide par définition !
  let adjustedScore = rawScore;
  const userLower = userInput.toLowerCase();
  const matchedExactKw = keywords.some(kw => {
    const k = kw.toLowerCase().trim();
    if (!k || k.length < 2) return false;
    const regex = new RegExp(`(^|\\b|\\s)${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|\\s|$)`, 'i');
    return regex.test(userLower);
  });

  if (matchedExactKw) {
    // Mot-clé présent et aucune négation : validation déterministe garantie
    adjustedScore = Math.max(adjustedScore, 0.95);
  }

  const isValid = adjustedScore >= config.similarityThreshold;

  return {
    isValid,
    score: Math.round(adjustedScore * 100) / 100,
    reason: isValid 
      ? (matchedExactKw 
          ? `Correspondance déterministe confirmée par mot-clé (score: ${Math.round(adjustedScore * 100)}%, aucun contre-sens détecté).`
          : `Cohérence sémantique validée (${Math.round(adjustedScore * 100)}% ≥ seuil ${Math.round(config.similarityThreshold * 100)}% via ${engineUsed}).`)
      : `Rejet anti-faux positif : similarité insuffisante (${Math.round(adjustedScore * 100)}% < seuil ${Math.round(config.similarityThreshold * 100)}% via ${engineUsed}). Passage vers le LLM.`,
    isNegationDetected: false,
    engineUsed
  };
}

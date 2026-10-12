// Utilitaire de synthèse vocale hybride anti-superposition : Priorité Voix IA avec Repli Navigateur Automatique
// Garantit une exclusivité audio absolue (Zéro chevauchement de voix en toutes circonstances)

export type TtsActiveSource = 'ai' | 'browser' | 'none';

export interface SpeechOptions {
  pitch?: number;
  rate?: number;
  lang?: string;
  nomVoix?: string;
  voiceURI?: string;
  volume?: number;
  genderHint?: 'femme' | 'homme' | 'non-binaire';
  cleanDidascalies?: boolean;
  preferAi?: boolean; // Priorité à l'IA (true par défaut)
  apiKey?: string;
  provider?: string;
  queue?: boolean; // Si true, met en file d'attente sans superposer ni couper
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onSourceDetermined?: (source: 'ai' | 'browser') => void;
}

// Registres globaux pour la coordination exclusive et l'annulation totale
let activeSpeechSessionId = 0;
let currentSource: TtsActiveSource = 'none';
let currentAbortController: AbortController | null = null;
const activeAudioPool = new Set<HTMLAudioElement>();
const activeUtterancePool = new Set<SpeechSynthesisUtterance>();
const speechQueue: Array<{ text: string; options: SpeechOptions; resolve: (val: any) => void }> = [];
let isQueueProcessing = false;

const statusListeners = new Set<(status: { source: TtsActiveSource; isSpeaking: boolean }) => void>();

export function getTtsCurrentSource(): TtsActiveSource {
  return currentSource;
}

export function subscribeTtsStatus(listener: (status: { source: TtsActiveSource; isSpeaking: boolean }) => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

function notifyStatus(source: TtsActiveSource, isSpeaking: boolean) {
  currentSource = isSpeaking ? source : 'none';
  statusListeners.forEach(fn => {
    try {
      fn({ source, isSpeaking });
    } catch (e) {
      console.warn('Listener error in TTS status:', e);
    }
  });
}

/**
 * Nettoie le texte avant de l'envoyer à la synthèse vocale :
 * Élimine les didascalies entre parenthèses, astérisques d'action, emojis et balises
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Supprime le contenu entre parenthèses : (sourit), (d'une voix douce), etc.
    .replace(/\([^)]*\)/g, ' ')
    // Supprime le contenu entre crochets : [se penche], etc.
    .replace(/\[[^\]]*\]/g, ' ')
    // Supprime le contenu entre astérisques : *te regarde*, *soupire*, etc.
    .replace(/\*[^*]*\*/g, ' ')
    // Supprime les emojis
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu, '')
    // Supprime les puces de liste au début de ligne
    .replace(/^\s*[-•*]\s+/gm, '')
    // Nettoie les guillemets superflus
    .replace(/["«»]/g, '')
    // Réduit les espaces multiples
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Récupère les voix disponibles dans le navigateur en gérant l'asynchronisme
 */
export function getBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }

    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices() || []);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);

    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices() || []);
    }, 600);
  });
}

function selectBestVoice(voices: SpeechSynthesisVoice[], options: SpeechOptions): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Recherche par URI exacte ou nom exact
  if (options.voiceURI) {
    const byUri = voices.find(v => v.voiceURI === options.voiceURI);
    if (byUri) return byUri;
  }
  if (options.nomVoix) {
    const byExactName = voices.find(v => v.name.toLowerCase() === options.nomVoix?.toLowerCase());
    if (byExactName) return byExactName;

    const bySubName = voices.find(v => v.name.toLowerCase().includes(options.nomVoix?.toLowerCase() || ''));
    if (bySubName) return bySubName;
  }

  // 2. Filtre sur les voix françaises
  const frenchVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('fr'));

  if (frenchVoices.length > 0) {
    const isMale = options.genderHint === 'homme';
    const maleKeywords = ['thomas', 'henri', 'paul', 'nicolas', 'antoine', 'mathieu', 'pierre', 'male'];
    const femaleKeywords = ['amelie', 'audrey', 'denise', 'julie', 'celine', 'charlotte', 'lea', 'female'];

    if (isMale) {
      const maleVoice = frenchVoices.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (maleVoice) return maleVoice;
    } else {
      const femaleVoice = frenchVoices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
      if (femaleVoice) return femaleVoice;
    }

    const naturalVoice = frenchVoices.find(v => 
      v.name.includes('Natural') || 
      v.name.includes('Online') || 
      v.name.includes('Google') || 
      v.name.includes('Siri')
    );
    if (naturalVoice) return naturalVoice;

    return frenchVoices[0];
  }

  return voices.find(v => v.default) || voices[0] || null;
}

/**
 * Arrêt total et forcé de tout composant audio (HTMLAudioElement, Web Speech API et fetch en vol)
 * Assure un silence immédiat avec invalidation de tout callback asynchrone différé.
 */
export function stopSpeaking(): void {
  // Invalider immédiatement toute session en cours
  activeSpeechSessionId++;

  // Vider la file d'attente
  speechQueue.length = 0;
  isQueueProcessing = false;

  // 1. Annuler toute requête HTTP /api/tts en vol
  if (currentAbortController) {
    try {
      currentAbortController.abort();
    } catch (e) {}
    currentAbortController = null;
  }

  // 2. Tuer immédiatement TOUS les éléments audio HTML5
  activeAudioPool.forEach(audio => {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
      audio.src = '';
      audio.load();
    } catch (e) {}
  });
  activeAudioPool.clear();

  // 3. Tuer immédiatement TOUTES les énonciations Web Speech API
  activeUtterancePool.forEach(u => {
    u.onstart = null;
    u.onend = null;
    u.onerror = null;
    u.onpause = null;
    u.onresume = null;
  });
  activeUtterancePool.clear();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  }

  notifyStatus('none', false);
}

/**
 * Exécute la synthèse vocale via l'API Web Speech du navigateur (Repli)
 * Vérifie strictement le token de session et coupe tout audio IA préalable.
 */
function speakViaBrowser(cleanText: string, options: SpeechOptions, sessionId: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis navigateur indisponible');
      options.onError?.(new Error('Synthèse vocale indisponible sur ce navigateur'));
      resolve(false);
      return;
    }

    // Si une session plus récente a été demandée, abandonner immédiatement
    if (sessionId !== activeSpeechSessionId) {
      resolve(false);
      return;
    }

    try {
      // Nettoyage impératif de tout autre son avant de commencer
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetRate = typeof options.rate === 'number' ? Math.max(0.5, Math.min(2.0, options.rate)) : 1.05;
      utterance.pitch = typeof options.pitch === 'number' ? options.pitch : (options.genderHint === 'femme' ? 1.15 : 0.95);
      utterance.rate = targetRate;
      utterance.lang = options.lang || 'fr-FR';
      if (typeof options.volume === 'number') {
        utterance.volume = options.volume;
      }

      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = selectBestVoice(voices, options);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      activeUtterancePool.add(utterance);

      utterance.onstart = () => {
        // Double vérification anti-chevauchement au moment du départ réel
        if (sessionId !== activeSpeechSessionId) {
          window.speechSynthesis.cancel();
          activeUtterancePool.delete(utterance);
          resolve(false);
          return;
        }
        options.onStart?.();
        options.onSourceDetermined?.('browser');
        notifyStatus('browser', true);
      };

      utterance.onend = () => {
        activeUtterancePool.delete(utterance);
        if (sessionId === activeSpeechSessionId) {
          options.onEnd?.();
          notifyStatus('browser', false);
        }
        resolve(true);
      };

      utterance.onerror = (e) => {
        activeUtterancePool.delete(utterance);
        if (sessionId === activeSpeechSessionId) {
          options.onError?.(e);
          notifyStatus('browser', false);
        }
        resolve(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Erreur lors du repli navigateur:', err);
      options.onError?.(err);
      notifyStatus('none', false);
      resolve(false);
    }
  });
}

/**
 * Exécution interne d'une phrase isolée
 */
async function executeSpeakSingle(
  cleanText: string,
  options: SpeechOptions,
  sessionId: number
): Promise<{ source: 'ai' | 'browser' | 'none'; success: boolean }> {
  const preferAi = options.preferAi !== false; // Priorité IA par défaut

  // --- PRIORITÉ 1 : TENTATIVE VIA LA VOIX IA (/api/tts) ---
  if (preferAi) {
    const controller = new AbortController();
    currentAbortController = controller;

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: cleanText,
          voice: options.nomVoix || (options.genderHint === 'femme' ? 'nova' : 'alloy'),
          lang: options.lang?.slice(0, 2) || 'fr',
          rate: options.rate ?? 1.05,
          apiKey: options.apiKey,
          provider: options.provider
        })
      });

      // Si un nouveau texte est arrivé ou si annulé pendant le fetch, abandonner
      if (sessionId !== activeSpeechSessionId) {
        return { source: 'none', success: false };
      }

      if (response.ok && response.headers.get('content-type')?.includes('audio')) {
        const blob = await response.blob();
        if (sessionId !== activeSpeechSessionId) {
          return { source: 'none', success: false };
        }

        if (blob.size > 100) {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          
          const speechRate = typeof options.rate === 'number' ? Math.max(0.5, Math.min(2.5, options.rate)) : 1.05;
          audio.playbackRate = speechRate;
          if (typeof options.volume === 'number') {
            audio.volume = Math.max(0, Math.min(1, options.volume));
          }

          activeAudioPool.add(audio);

          return new Promise<{ source: 'ai' | 'browser' | 'none'; success: boolean }>((resolve) => {
            // Nettoyage navigateur impératif avant de lancer l'Audio IA
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }

            audio.onplay = () => {
              if (sessionId !== activeSpeechSessionId) {
                audio.pause();
                activeAudioPool.delete(audio);
                URL.revokeObjectURL(audioUrl);
                resolve({ source: 'none', success: false });
                return;
              }
              // Assurer qu'aucune voix navigateur ne tourne en parallèle
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              options.onStart?.();
              options.onSourceDetermined?.('ai');
              notifyStatus('ai', true);
            };

            audio.onended = () => {
              activeAudioPool.delete(audio);
              URL.revokeObjectURL(audioUrl);
              if (sessionId === activeSpeechSessionId) {
                options.onEnd?.();
                notifyStatus('ai', false);
              }
              resolve({ source: 'ai', success: true });
            };

            audio.onerror = async () => {
              activeAudioPool.delete(audio);
              URL.revokeObjectURL(audioUrl);
              if (sessionId !== activeSpeechSessionId) {
                resolve({ source: 'none', success: false });
                return;
              }
              // Repli transparent sur le navigateur sans superposition
              options.onSourceDetermined?.('browser');
              const fallbackOk = await speakViaBrowser(cleanText, options, sessionId);
              resolve({ source: 'browser', success: fallbackOk });
            };

            // Lancement effectif de l'audio
            audio.play().catch(async () => {
              activeAudioPool.delete(audio);
              URL.revokeObjectURL(audioUrl);
              if (sessionId !== activeSpeechSessionId) {
                resolve({ source: 'none', success: false });
                return;
              }
              options.onSourceDetermined?.('browser');
              const fallbackOk = await speakViaBrowser(cleanText, options, sessionId);
              resolve({ source: 'browser', success: fallbackOk });
            });
          });
        }
      }
    } catch (aiErr: any) {
      if (aiErr?.name === 'AbortError' || sessionId !== activeSpeechSessionId) {
        return { source: 'none', success: false };
      }
    }
  }

  // Si annulé entre-temps
  if (sessionId !== activeSpeechSessionId) {
    return { source: 'none', success: false };
  }

  // --- PRIORITÉ 2 : REPLI AUTOMATIQUE SUR LE NAVIGATEUR ---
  options.onSourceDetermined?.('browser');
  const browserSuccess = await speakViaBrowser(cleanText, options, sessionId);
  return { source: 'browser', success: browserSuccess };
}

/**
 * Traitement séquentiel de la file d'attente (mode queue: true)
 */
async function processQueue() {
  if (isQueueProcessing || speechQueue.length === 0) return;
  isQueueProcessing = true;

  while (speechQueue.length > 0) {
    const item = speechQueue.shift();
    if (!item) break;

    const sessionId = activeSpeechSessionId;
    const result = await executeSpeakSingle(item.text, item.options, sessionId);
    item.resolve(result);

    // Petite pause de respiration naturelle de 100ms entre deux phrases enchaînées
    if (speechQueue.length > 0 && sessionId === activeSpeechSessionId) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  isQueueProcessing = false;
}

/**
 * Fonction maîtresse de synthèse vocale coordonnée et exclusive :
 * - Garantit qu'AUCUNE voix ne peut jamais se superposer à une autre
 * - Mode immédiat (par défaut) : coupe proprement la parole précédente
 * - Mode queue (options.queue: true) : enchaîne les phrases successivement sans collision
 */
export async function speakText(
  text: string, 
  options: SpeechOptions = {}
): Promise<{ source: 'ai' | 'browser' | 'none'; success: boolean }> {
  const cleanText = options.cleanDidascalies !== false ? cleanTextForSpeech(text) : text.trim();
  if (!cleanText) {
    return { source: 'none', success: false };
  }

  if (options.queue) {
    return new Promise<{ source: 'ai' | 'browser' | 'none'; success: boolean }>((resolve) => {
      speechQueue.push({ text: cleanText, options, resolve });
      processQueue();
    });
  }

  // Mode immédiat : coupe toute lecture précédente avec certitude
  stopSpeaking();
  const sessionId = activeSpeechSessionId;

  return executeSpeakSingle(cleanText, options, sessionId);
}

export function createSpeechRecognizer(
  onResult: (text: string) => void,
  onError: (err: any) => void
): { start: () => void; stop: () => void; isSupported: boolean } {
  if (typeof window === 'undefined') {
    return { start: () => {}, stop: () => {}, isSupported: false };
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return { start: () => {}, stop: () => {}, isSupported: false };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'fr-FR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    if (transcript) {
      onResult(transcript);
    }
  };

  recognition.onerror = (err: any) => {
    onError(err);
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition already started', e);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {}
    },
    isSupported: true
  };
}

import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Play, 
  Square, 
  RotateCcw, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Sliders, 
  AudioLines,
  X
} from 'lucide-react';
import { RobotPersonality, LongueurDialogueType, StyleOralType } from '../types';
import { speakText, stopSpeaking, getBrowserVoices } from '../lib/speech';

interface VoiceAndDialogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  onUpdateRobot: (updated: RobotPersonality) => void;
}

export const VoiceAndDialogueModal: React.FC<VoiceAndDialogueModalProps> = ({
  isOpen,
  onClose,
  robot,
  onUpdateRobot
}) => {
  // Voice state
  const [pitch, setPitch] = useState<number>(robot.voix?.pitch ?? 1.05);
  const [rate, setRate] = useState<number>(robot.voix?.rate ?? 1.08);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>(robot.voix?.voiceURI ?? '');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(robot.voix?.nomVoix ?? '');

  // Dialogue config state
  const [longueurReponse, setLongueurReponse] = useState<LongueurDialogueType>(
    robot.dialogueConfig?.longueurReponse ?? 'court_naturel'
  );
  const [maxPhrases, setMaxPhrases] = useState<number>(robot.dialogueConfig?.maxPhrases ?? 2);
  const [styleOral, setStyleOral] = useState<StyleOralType>(
    robot.dialogueConfig?.styleOral ?? 'complice_chaleureux'
  );
  const [interjectionsOrales, setInterjectionsOrales] = useState<boolean>(
    robot.dialogueConfig?.interjectionsOrales ?? true
  );
  const [ignorerDidascaliesTTS, setIgnorerDidascaliesTTS] = useState<boolean>(
    robot.dialogueConfig?.ignorerDidascaliesTTS ?? true
  );

  // Browser voices
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [testSentence, setTestSentence] = useState<string>(
    `Bonjour ! C'est moi, ${robot.nom}. J'aime beaucoup notre façon de discuter ensemble.`
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPitch(robot.voix?.pitch ?? 1.05);
    setRate(robot.voix?.rate ?? 1.08);
    setSelectedVoiceUri(robot.voix?.voiceURI ?? '');
    setSelectedVoiceName(robot.voix?.nomVoix ?? '');
    setLongueurReponse(robot.dialogueConfig?.longueurReponse ?? 'court_naturel');
    setMaxPhrases(robot.dialogueConfig?.maxPhrases ?? 2);
    setStyleOral(robot.dialogueConfig?.styleOral ?? 'complice_chaleureux');
    setInterjectionsOrales(robot.dialogueConfig?.interjectionsOrales ?? true);
    setIgnorerDidascaliesTTS(robot.dialogueConfig?.ignorerDidascaliesTTS ?? true);

    getBrowserVoices().then((voices) => {
      setBrowserVoices(voices);
      if (!selectedVoiceUri && voices.length > 0) {
        // Auto-detect a good French voice
        const frVoice = voices.find(v => v.lang.startsWith('fr') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Amelie') || v.name.includes('Audrey')));
        if (frVoice) {
          setSelectedVoiceUri(frVoice.voiceURI);
          setSelectedVoiceName(frVoice.name);
        }
      }
    });

    return () => {
      stopSpeaking();
    };
  }, [isOpen, robot]);

  if (!isOpen) return null;

  // Test speaking
  const handleTestSpeech = () => {
    if (isPlayingTest) {
      stopSpeaking();
      setIsPlayingTest(false);
      return;
    }

    setIsPlayingTest(true);
    speakText(testSentence, {
      pitch,
      rate,
      voiceURI: selectedVoiceUri,
      nomVoix: selectedVoiceName,
      genderHint: robot.genre || 'femme',
      cleanDidascalies: ignorerDidascaliesTTS
    });

    // Reset playing state on end
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const checkEnd = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsPlayingTest(false);
          clearInterval(checkEnd);
        }
      }, 200);
    }
  };

  // Reset to natural defaults
  const handleResetDefaults = () => {
    setPitch(1.05);
    setRate(1.08);
    setLongueurReponse('court_naturel');
    setMaxPhrases(2);
    setStyleOral('complice_chaleureux');
    setInterjectionsOrales(true);
    setIgnorerDidascaliesTTS(true);
  };

  // Save changes
  const handleSave = () => {
    const updatedRobot: RobotPersonality = {
      ...robot,
      voix: {
        ...robot.voix,
        pitch,
        rate,
        nomVoix: selectedVoiceName,
        voiceURI: selectedVoiceUri
      },
      dialogueConfig: {
        longueurReponse,
        maxPhrases,
        styleOral,
        interjectionsOrales,
        ignorerDidascaliesTTS
      }
    };

    onUpdateRobot(updatedRobot);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const frenchVoices = browserVoices.filter(v => v.lang.startsWith('fr'));
  const otherVoices = browserVoices.filter(v => !v.lang.startsWith('fr'));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b101b] border border-cyan-500/30 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Studio Voix & Style de Dialogue Oral
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono">
                  {robot.nom}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calibrez le timbre, la vitesse d'élocution et le rythme de parole face à face
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: SYNTHÈSE VOCALE (TIMBRE & VITESSE) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <AudioLines className="w-4 h-4" />
              1. Timbre & Vitesse d'élocution (TTS)
            </h4>
            <button
              onClick={handleResetDefaults}
              className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              title="Rétablir les valeurs naturelles recommandées"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Valeurs optimales</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Timbre / Pitch */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Timbre / Hauteur (Pitch)
                </label>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  {pitch.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Grave / Posé (0.6)</span>
                <span>Naturel (1.0)</span>
                <span>Aigu / Doux (1.5)</span>
              </div>
            </div>

            {/* Vitesse / Rate */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Vitesse d'élocution (Rate)
                </label>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  {rate.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.35"
                step="0.05"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Calme (0.8)</span>
                <span className="text-cyan-400 font-semibold">Fluide (1.08)</span>
                <span>Vif (1.3)</span>
              </div>
            </div>
          </div>

          {/* Choix de la voix du navigateur */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">
              Moteur Vocal du Système / Navigateur
            </label>
            <select
              value={selectedVoiceUri}
              onChange={(e) => {
                const uri = e.target.value;
                setSelectedVoiceUri(uri);
                const match = browserVoices.find(v => v.voiceURI === uri);
                if (match) setSelectedVoiceName(match.name);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">-- Voix par défaut intelligente (selon genre et qualité) --</option>
              {frenchVoices.length > 0 && (
                <optgroup label="🇫🇷 Voix Françaises Détectées">
                  {frenchVoices.map((v) => {
                    const isNatural = v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('Siri');
                    return (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {isNatural ? '⭐ ' : ''}{v.name} ({v.lang})
                      </option>
                    );
                  })}
                </optgroup>
              )}
              {otherVoices.length > 0 && (
                <optgroup label="🌐 Autres Voix Internationales">
                  {otherVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="text-[11px] text-slate-400">
              Les voix marquées d'une étoile ⭐ (Google, Microsoft Natural, Apple Siri) offrent un timbre organique beaucoup moins robotique.
            </p>
          </div>

          {/* Test de voix interactif */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={testSentence}
              onChange={(e) => setTestSentence(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              placeholder="Phrase de test..."
            />
            <button
              onClick={handleTestSpeech}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isPlayingTest
                  ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/25'
              }`}
            >
              {isPlayingTest ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Arrêter</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Tester la voix</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 2: LONGUEUR DES RÉPONSES & RYTHME DE DIALOGUE */}
        <div className="space-y-4 border-t border-white/10 pt-5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              2. Longueur des Réponses & Style de Dialogue Parlé
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Évite les pavés de texte écrits pour privilégier le dynamisme d'un vrai dialogue verbal de vive voix.
            </p>
          </div>

          {/* 4 modes de longueur de dialogue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Très court / Vif */}
            <div
              onClick={() => {
                setLongueurReponse('tres_court');
                setMaxPhrases(1);
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                longueurReponse === 'tres_court'
                  ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  ⚡ Dialogue Spontané (Très Court)
                </span>
                <span className="text-[10px] font-mono text-slate-400">~15-25 mots</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                1 seule phrase percutante ou 2 très courtes. Rebond instantané, idéal pour l'oral pur.
              </p>
            </div>

            {/* Court Naturel (Recommandé) */}
            <div
              onClick={() => {
                setLongueurReponse('court_naturel');
                setMaxPhrases(2);
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                longueurReponse === 'court_naturel'
                  ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  💬 Dialogue Naturel (Recommandé)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">1-2 phrases</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Idéal de vive voix : fluide, direct et complice, sans monologue ni phrases à rallonge.
              </p>
            </div>

            {/* Équilibré */}
            <div
              onClick={() => {
                setLongueurReponse('equilibre');
                setMaxPhrases(3);
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                longueurReponse === 'equilibre'
                  ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-300">
                  ⚖️ Équilibré & Nuancé
                </span>
                <span className="text-[10px] font-mono text-slate-400">2-3 phrases</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Permet d'exprimer un ressenti plus complet tout en restant adapté à l'audio.
              </p>
            </div>

            {/* Développé / Chat écrit */}
            <div
              onClick={() => {
                setLongueurReponse('developpe');
                setMaxPhrases(4);
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                longueurReponse === 'developpe'
                  ? 'bg-purple-500/15 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-purple-300">
                  📝 Chat Écrit Détaillé
                </span>
                <span className="text-[10px] font-mono text-slate-400">3-4 phrases</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Format texte plus riche pour ceux qui préfèrent lire un récit approfondi.
              </p>
            </div>
          </div>

          {/* Style oral d'élocution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Tonalité de conversation
              </label>
              <select
                value={styleOral}
                onChange={(e) => setStyleOral(e.target.value as StyleOralType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="complice_chaleureux">Complice & Chaleureux (Affectueux et doux)</option>
                <option value="spontane_direct">Spontané & Direct (Sans détour, comme un ami)</option>
                <option value="doux_intimiste">Doux & Intimiste (Feutré, confidentiel)</option>
                <option value="enjoue_dynamique">Enjoué & Pétillant (Souriant et vif)</option>
                <option value="pose_raffine">Posé & Raffiné (Élégant et soigné)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Plafond strict de phrases
                </label>
                <span className="text-xs font-mono text-indigo-400 font-bold">{maxPhrases} phrase(s) max</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={maxPhrases}
                onChange={(e) => setMaxPhrases(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 (ultra-concis)</span>
                <span>2 (dialogue vif)</span>
                <span>3</span>
                <span>4 (développé)</span>
              </div>
            </div>
          </div>

          {/* Toggles d'oralité */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-200">
                Filtrer automatiquement les didascalies entre parenthèses dans la voix
              </span>
              <input
                type="checkbox"
                checked={ignorerDidascaliesTTS}
                onChange={(e) => setIgnorerDidascaliesTTS(e.target.checked)}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>
            <p className="text-[10px] text-slate-400">
              Empêche le robot de lire à voix haute les parenthèses de gestuelle comme "(sourit)", assurant un rendu 100% naturel.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Annuler
          </button>
          
          <button
            onClick={handleSave}
            disabled={saveSuccess}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Paramètres Enregistrés !</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enregistrer pour {robot.nom}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

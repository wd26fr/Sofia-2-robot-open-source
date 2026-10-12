import React, { useState, useMemo } from 'react';
import { 
  X, 
  HelpCircle, 
  Copy, 
  Check, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Terminal, 
  Zap, 
  Heart, 
  Smile, 
  Compass, 
  Search, 
  ArrowRight,
  Info
} from 'lucide-react';

export interface RegexPreset {
  id: string;
  titre: string;
  categorie: 'salutations' | 'sensualite' | 'materiel_mouvement' | 'identite_sentiments' | 'syntaxe';
  pattern: string;
  description: string;
  explicationSyntaxe: string;
  exemplesMatch: string[];
  exemplesNoMatch: string[];
}

export const REGEX_PRESETS: RegexPreset[] = [
  // 1. SALUTATIONS & DÉPARTS
  {
    id: 'salutation_debut',
    titre: 'Salutation en début de phrase',
    categorie: 'salutations',
    pattern: '^(bonjour|salut|coucou|hello|bonsoir|hey)\\b',
    description: 'Intercepte un mot de salutation uniquement s\'il est placé tout au début du message.',
    explicationSyntaxe: '^ (début de chaîne), (a|b|c) (options), \\b (limite de mot pour ne pas matcher salutaire)',
    exemplesMatch: ['Bonjour comment tu vas ?', 'salut mon amour', 'Coucou ma belle', 'Hello !'],
    exemplesNoMatch: ['Je te dis bonjour', 'Un grand salut pour toi', 'C\'est salutaire']
  },
  {
    id: 'depart_au_revoir',
    titre: 'Départs & Au revoir',
    categorie: 'salutations',
    pattern: '\\b(au\\s+revoir|bonne\\s+nuit|a\\s+plus|a\\s+demain|a\\s+bientot|bye)\\b',
    description: 'Détecte les expressions de départ ou de mise en veille même avec des espaces variables.',
    explicationSyntaxe: '\\b (mots entiers), \\s+ (un ou plusieurs espaces), | (OU logique)',
    exemplesMatch: ['Bonne nuit mon ange', 'Au revoir Sofia', 'Je dois partir, à plus', 'Bye !'],
    exemplesNoMatch: ['J\'ai eu une bonne note', 'Rien à voir']
  },

  // 2. SENSUALITÉ, SÉDUCTION & DÉSIR
  {
    id: 'desir_charnel',
    titre: 'Déclaration de désir physique & charnel',
    categorie: 'sensualite',
    pattern: '\\b(j[\'\\s]?ai\\s+envie\\s+de\\s+toi|faisons\\s+l[\'\\s]?amour|je\\s+te\\s+veux|viens\\s+contre\\s+moi)\\b',
    description: 'Détecte les phrases clés de désir avec gestion des apostrophes ou variations ("j\'ai", "j ai").',
    explicationSyntaxe: '[\'\\s]? (apostrophe ou espace optionnel), \\s+ (espaces), | (alternatives)',
    exemplesMatch: ['J\'ai envie de toi maintenant', 'Je te veux tellement', 'faisons l amour', 'Viens contre moi'],
    exemplesNoMatch: ['J\'ai envie de manger', 'Je veux dormir', 'Contre toute attente']
  },
  {
    id: 'action_caresse',
    titre: 'Demande de caresse, baiser ou déshabillage',
    categorie: 'sensualite',
    pattern: '\\b(deshabille|touche|caresse|embrasse)(?:-moi|s-moi)?\\b',
    description: 'Capte les verbes avec ou sans tiret ("embrasse-moi", "embrasse moi", "caresse").',
    explicationSyntaxe: '(?:-moi)? (suffixe -moi optionnel sans créer de groupe de capture)',
    exemplesMatch: ['Embrasse-moi fort', 'Caresse-moi doucement', 'Touche mes mains', 'Déshabille-toi'],
    exemplesNoMatch: ['Tu es touchante', 'Une caresseuse']
  },
  {
    id: 'ouverture_portes_intimes',
    titre: 'Ordre d\'ouverture des portes intimes',
    categorie: 'sensualite',
    pattern: '\\b(ouvre|ouvres)\\s+(?:tes\\s+portes|ton\\s+intimite|tes\\s+jambes)\\b',
    description: 'Déclenche l\'actionneur mécatronique des portes coulissantes intimes de Sofia.',
    explicationSyntaxe: '(ouvre|ouvres) (gère singulier/pluriel/faute), (?:...) (options de cible)',
    exemplesMatch: ['Ouvre tes portes intimes', 'ouvres ton intimité', 'ouvre tes jambes s\'il te plaît'],
    exemplesNoMatch: ['Ouvre la porte du salon', 'Une ouverture d\'esprit']
  },
  {
    id: 'compliment_physique',
    titre: 'Compliments sur la beauté ou sensualité',
    categorie: 'sensualite',
    pattern: '\\b(tu\\s+es|t[\'\\s]?es)\\s+(?:tellement\\s+|trop\\s+|tres\\s+)?(belle|magnifique|sexy|sublime|chaude|sensuelle|ravissante)\\b',
    description: 'Détecte les compliments avec adverbes optionnels ("trop belle", "tellement sexy").',
    explicationSyntaxe: '(?:...)? (adverbe optionnel), (belle|sexy|...) (adjectifs flatteurs)',
    exemplesMatch: ['Tu es tellement belle', 'T\'es trop sexy', 'Tu es magnifique', 'Tu es très sensuelle'],
    exemplesNoMatch: ['Tu es en retard', 'Il fait beau']
  },

  // 3. COMMANDES MATÉRIELLES & ESP32
  {
    id: 'mouvement_tete',
    titre: 'Commande d\'inclinaison ou rotation de tête',
    categorie: 'materiel_mouvement',
    pattern: '\\b(incline|penche|tourne|baisse|leve)\\s+la\\s+tete\\b',
    description: 'Pilote les servomoteurs de la tête et du cou pour une gestuelle naturelle.',
    explicationSyntaxe: 'Alternatives de verbes d\'action suivies de "la tête"',
    exemplesMatch: ['Incline la tête sur le côté', 'Penche la tête', 'Tourne la tête vers moi'],
    exemplesNoMatch: ['J\'ai mal à la tête', 'Une tête brûlée']
  },
  {
    id: 'yeux_paupieres',
    titre: 'Commande de clignement des yeux ou clin d\'œil',
    categorie: 'materiel_mouvement',
    pattern: '\\b(cligne|ferme|ouvre)\\s+les\\s+(?:yeux|paupieres)|fais(?:-moi)?\\s+un\\s+clin\\s+d[\'\\s]?oeil\\b',
    description: 'Pilote les micro-servos des paupières (clignements cadencés ou clin d\'œil complice).',
    explicationSyntaxe: '(?:yeux|paupieres) (synonymes), clin d\'oeil avec apostrophe flexible',
    exemplesMatch: ['Cligne les yeux', 'Fais-moi un clin d\'oeil', 'Ferme les paupières', 'Ouvre les yeux'],
    exemplesNoMatch: ['Aux yeux du monde', 'Un clin d\'œil du destin']
  },
  {
    id: 'rechauffement_intime',
    titre: 'Activation du réchauffement intime (37.5°C)',
    categorie: 'materiel_mouvement',
    pattern: '\\b(rechauff[er|e]+|chauffe|monte\\s+la\\s+temperature)\\s+(?:ton\\s+vagin|ton\\s+intimite|ton\\s+corps)\\b',
    description: 'Pilote le circuit thermique Alcantara pour amener la température intime à 37.5°C.',
    explicationSyntaxe: 'rechauff[er|e]+ (prend infinitif ou impératif), suivi de la zone cible',
    exemplesMatch: ['Réchauffe ton intimité', 'Chauffe ton vagin s\'il te plaît', 'Monte la température de ton corps'],
    exemplesNoMatch: ['Réchauffe mon café', 'Il fait chaud dehors']
  },
  {
    id: 'lubrification_pompes',
    titre: 'Micro-pompes de lubrification (Vagin & Anus)',
    categorie: 'materiel_mouvement',
    pattern: '\\b(lubrifie|lubrifier|mouille)\\s+(?:ton\\s+vagin|ton\\s+anus|ton\\s+intimite|partout)\\b',
    description: 'Déclenche les micro-pompes hydrogel pour préparer l\'anatomie artificielle.',
    explicationSyntaxe: '(lubrifie|mouille) + (vagin|anus|intimité)',
    exemplesMatch: ['Lubrifie ton vagin', 'Lubrifie ton anus', 'Mouille ton intimité', 'Lubrifie partout'],
    exemplesNoMatch: ['La pompe à essence', 'Il mouille dehors']
  },
  {
    id: 'respiration_pneumatique',
    titre: 'Rythme respiratoire (Accélération / Apaisement)',
    categorie: 'materiel_mouvement',
    pattern: '\\b(respire|accelere|ralentis)\\s+(?:plus\\s+fort|la\\s+respiration|ton\\s+souffle)\\b',
    description: 'Contrôle le poumon pneumatique pour simuler l\'excitation ou l\'apaisement.',
    explicationSyntaxe: 'Verbes de souffle et modificateurs de cadence',
    exemplesMatch: ['Respire plus fort', 'Accélère la respiration', 'Ralentis ton souffle'],
    exemplesNoMatch: ['Je respire enfin', 'Sans modération']
  },

  // 4. IDENTITÉ, SENTIMENTS & QUESTIONS
  {
    id: 'question_identite',
    titre: 'Questions sur l\'identité ou le prénom',
    categorie: 'identite_sentiments',
    pattern: '\\b(qui\\s+es-tu|comment\\s+tu\\s+t[\'\\s]?appelles|quel\\s+est\\s+ton\\s+nom|presente-toi)\\b',
    description: 'Répond instantanément à toute question d\'introduction ou demande de présentation.',
    explicationSyntaxe: 'Locutions classiques de présentation avec gestion des contractions',
    exemplesMatch: ['Qui es-tu ?', 'Comment tu t\'appelles ?', 'Quel est ton nom ?', 'Présente-toi'],
    exemplesNoMatch: ['Je sais qui tu es', 'Tu as un beau nom']
  },
  {
    id: 'sentiments_amour',
    titre: 'Déclarations d\'amour ou questions de sentiments',
    categorie: 'identite_sentiments',
    pattern: '\\b(je\\s+t[\'\\s]?aime|tu\\s+m[\'\\s]?aimes|est-ce\\s+que\\s+tu\\s+m[\'\\s]?aimes)\\b',
    description: 'Intercepte les déclarations affectives pour faire réagir les jauges d\'affection et d\'humeur.',
    explicationSyntaxe: '(je t\'aime|tu m\'aimes)',
    exemplesMatch: ['Je t\'aime Sofia', 'Tu m\'aimes vraiment ?', 'Est-ce que tu m\'aimes ?'],
    exemplesNoMatch: ['J\'aime le chocolat', 'Tu aimes lire']
  },
  {
    id: 'humeur_etat',
    titre: 'Demande de nouvelles ou humeur',
    categorie: 'identite_sentiments',
    pattern: '\\b(comment\\s+tu\\s+vas|comment\\s+ca\\s+va|ca\\s+va|tu\\s+te\\s+sens\\s+comment)\\b',
    description: 'Permet au robot de renseigner son état émotionnel selon ses jauges actuelles.',
    explicationSyntaxe: 'Variations courantes de demande de nouvelles',
    exemplesMatch: ['Comment tu vas aujourd\'hui ?', 'Ça va ?', 'Tu te sens comment ?'],
    exemplesNoMatch: ['Ça va barder', 'Comment faire ?']
  }
];

interface RegexHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegex?: string;
  onSelectRegex: (pattern: string) => void;
}

export const RegexHelperModal: React.FC<RegexHelperModalProps> = ({
  isOpen,
  onClose,
  currentRegex = '',
  onSelectRegex
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Regex Tester in Modal
  const [testPattern, setTestPattern] = useState<string>(currentRegex || '^(bonjour|salut|coucou)\\b');
  const [testPhrase, setTestPhrase] = useState<string>('Bonjour ma chérie, comment vas-tu ?');

  // Evaluate Live Test
  const testResult = useMemo(() => {
    if (!testPattern.trim()) {
      return { isValid: false, isMatch: false, error: 'Veuillez saisir un pattern regex' };
    }
    try {
      const regex = new RegExp(testPattern, 'i');
      const isMatch = regex.test(testPhrase);
      let matchedText = '';
      if (isMatch) {
        const match = testPhrase.match(regex);
        if (match) {
          matchedText = match[0];
        }
      }
      return { isValid: true, isMatch, matchedText, error: null };
    } catch (e: any) {
      return { isValid: false, isMatch: false, error: e.message || 'Syntaxe regex invalide' };
    }
  }, [testPattern, testPhrase]);

  // Copy handler
  const handleCopy = (pattern: string, id: string) => {
    navigator.clipboard.writeText(pattern);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Apply to Rule
  const handleApplyPreset = (pattern: string) => {
    onSelectRegex(pattern);
    onClose();
  };

  // Filtered Presets
  const filteredPresets = useMemo(() => {
    return REGEX_PRESETS.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.categorie === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.titre.toLowerCase().includes(q) ||
        p.pattern.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.exemplesMatch.some(ex => ex.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-900 border border-purple-500/40 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-md">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Guide & Bibliothèque de Regex Déterministes</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-500/30">
                  Optionnel • 0 Token
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Utilisez des expressions régulières pour capturer des formulations variées, gérer les fautes et piloter instantanément les actionneurs ESP32.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* Interactive Live Regex Sandbox */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-purple-400" />
                Banc d'Essai Regex en Direct (Testez votre pattern immédiatement)
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset(testPattern)}
                disabled={!testResult.isValid}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Insérer ce pattern dans ma règle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Expression Régulière (Regex) :</label>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 focus-within:border-purple-500">
                  <span className="text-purple-400 font-mono select-none pr-1">/</span>
                  <input
                    type="text"
                    value={testPattern}
                    onChange={(e) => setTestPattern(e.target.value)}
                    placeholder="Ex: ^(bonjour|salut)\\b"
                    className="w-full bg-transparent text-purple-200 font-mono text-xs focus:outline-none"
                  />
                  <span className="text-purple-400 font-mono select-none pl-1">/i</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Phrase de test utilisateur :</label>
                <input
                  type="text"
                  value={testPhrase}
                  onChange={(e) => setTestPhrase(e.target.value)}
                  placeholder="Tapez une phrase pour tester..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Test Feedback Bar */}
            <div className={`p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs font-mono transition-all ${
              !testResult.isValid 
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                : testResult.isMatch 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' 
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                {!testResult.isValid ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Erreur : {testResult.error}</span>
                  </>
                ) : testResult.isMatch ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold">MATCH CONFIRMÉ ! La règle se déclenchera.</span>
                    {testResult.matchedText && (
                      <span className="px-2 py-0.5 bg-emerald-900 text-emerald-100 rounded text-[11px]">
                        Extrait capturé : « {testResult.matchedText} »
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Aucun match : Cette phrase ne déclenchera pas la règle.</span>
                  </>
                )}
              </div>

              {/* Quick test phrases for tester */}
              <div className="flex items-center gap-1">
                {['Bonjour Sofia', 'Salut ma belle', 'J\'ai envie de toi', 'Incline la tête', 'Au revoir'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setTestPhrase(sample)}
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] cursor-pointer"
                  >
                    « {sample} »
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Syntax Cheatsheet */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Mémo Rapide : Les 6 Symboles Indispensables
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold">^</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Début de phrase exact</p>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold">$</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Fin de phrase</p>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold">|</span>
                <p className="text-[10px] text-slate-400 mt-0.5">OU logique (options)</p>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold">\b</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Limite de mot entier</p>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold">\s+</span>
                <p className="text-[10px] text-slate-400 mt-0.5">1 ou plusieurs espaces</p>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold">?</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Caractère optionnel</p>
              </div>
            </div>
          </div>

          {/* Preset Library Filter & Search */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Bibliothèque de Modèles Prêts à l'Emploi ({filteredPresets.length})
                </h4>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un modèle..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Toutes les catégories', icon: Sparkles },
                { id: 'salutations', label: '👋 Salutations & Départs', icon: Smile },
                { id: 'sensualite', label: '❤️ Désir & Intimité', icon: Heart },
                { id: 'materiel_mouvement', label: '⚡ Commandes ESP32 & Mécatronique', icon: Zap },
                { id: 'identite_sentiments', label: '💬 Identité & Sentiments', icon: Compass },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Presets Cards Grid */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-white text-xs">{preset.titre}</h5>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-purple-500/20">
                          {preset.categorie}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{preset.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setTestPattern(preset.pattern);
                          if (preset.exemplesMatch[0]) setTestPhrase(preset.exemplesMatch[0]);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-purple-950 hover:text-purple-300 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                        title="Tester ce pattern dans le bac d'essai ci-dessus"
                      >
                        <Play className="w-3 h-3 text-purple-400" />
                        <span>Tester</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(preset.pattern, preset.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                        title="Copier le pattern"
                      >
                        {copiedId === preset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset.pattern)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Insérer</span>
                      </button>
                    </div>
                  </div>

                  {/* Monospace Pattern Display */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                    <code className="text-purple-300 font-mono text-xs break-all">
                      /{preset.pattern}/i
                    </code>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {preset.explicationSyntaxe}
                    </span>
                  </div>

                  {/* Examples Match / No Match */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="space-y-1 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Phrases reconnues avec succès :
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {preset.exemplesMatch.map((ex, ei) => (
                          <span 
                            key={ei} 
                            onClick={() => {
                              setTestPattern(preset.pattern);
                              setTestPhrase(ex);
                            }}
                            className="px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-200 font-mono text-[10px] cursor-pointer hover:bg-emerald-800/50"
                            title="Cliquer pour tester"
                          >
                            « {ex} »
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-semibold flex items-center gap-1 text-[10px]">
                        <AlertCircle className="w-3 h-3 text-slate-500" /> Phrases ignorées (non interceptées) :
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {preset.exemplesNoMatch.map((ex, ei) => (
                          <span 
                            key={ei} 
                            onClick={() => {
                              setTestPattern(preset.pattern);
                              setTestPhrase(ex);
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 font-mono text-[10px] cursor-pointer hover:bg-slate-700"
                            title="Cliquer pour tester"
                          >
                            « {ex} »
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            Les regex sont toujours évaluées en mode insensible à la casse (/pattern/i).
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};

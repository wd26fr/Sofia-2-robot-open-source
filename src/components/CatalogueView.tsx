import React, { useState, useMemo, useEffect } from 'react';
import { RobotPersonality } from '../types';
import { 
  Sparkles, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  UserCheck, 
  Filter, 
  Eye, 
  MessageCircleHeart,
  Volume2,
  Brain,
  ArrowRightLeft,
  FileText,
  HelpCircle,
  RefreshCw,
  Compass,
  ShieldCheck,
  HeartHandshake,
  Info,
  Cpu,
  FileCode
} from 'lucide-react';
import { speakText } from '../lib/speech';
import { SofiaPersonalityQuestionnaireModal } from './SofiaPersonalityQuestionnaireModal';
import { FoundationalPrinciplesSection } from './FoundationalPrinciplesSection';
import { 
  SofiaPersonalityProfile2, 
  DEFAULT_USER_QUESTIONNAIRE_2, 
  calculateSofia2Affinity,
  AffinityBreakdown 
} from '../types/questionnaireSofia2';
import { getRobotQuestionnaire2 } from '../data/robotQuestionnaires2';
import { generateTailoredRobotsForProfile } from '../lib/profileRobotGenerator';

interface CatalogueViewProps {
  robots: RobotPersonality[];
  onSelectRobot: (robot: RobotPersonality) => void;
  selectedRobotId: string;
  onAddMultipleRobots?: (newRobots: RobotPersonality[]) => void;
  onOpenGplDoc?: () => void;
  onOpenManual?: () => void;
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  robots,
  onSelectRobot,
  selectedRobotId,
  onAddMultipleRobots,
  onOpenGplDoc,
  onOpenManual
}) => {
  // Questionnaire Sofia 2.0 (8 sections)
  const [userQuestionnaire, setUserQuestionnaire] = useState<SofiaPersonalityProfile2>(() => {
    try {
      const saved = localStorage.getItem('sofia_user_questionnaire_2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erreur chargement questionnaire 2.0', e);
    }
    return DEFAULT_USER_QUESTIONNAIRE_2;
  });

  const [questionnaireModal, setQuestionnaireModal] = useState<{
    isOpen: boolean;
    mode: 'user' | 'robot' | 'compare';
    targetRobot?: RobotPersonality;
  }>({
    isOpen: false,
    mode: 'user'
  });

  // Mode de filtrage par affinités Sofia 2.0
  const [filterMode, setFilterMode] = useState<'compatible' | 'high_affinity' | 'all'>('compatible');

  // Galerie photo index par robot
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});
  const [activeVoicePreview, setActiveVoicePreview] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [justGeneratedNames, setJustGeneratedNames] = useState<string[]>([]);

  const handleSaveUserQuestionnaire = (updated: SofiaPersonalityProfile2) => {
    setUserQuestionnaire(updated);
    try {
      localStorage.setItem('sofia_user_questionnaire_2', JSON.stringify(updated));
    } catch (e) {
      console.error('Erreur sauvegarde questionnaire 2.0', e);
    }
  };

  const handleNextPhoto = (robotId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndices(prev => ({
      ...prev,
      [robotId]: ((prev[robotId] || 0) + 1) % max
    }));
  };

  const handlePrevPhoto = (robotId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndices(prev => ({
      ...prev,
      [robotId]: ((prev[robotId] || 0) - 1 + max) % max
    }));
  };

  const handleVoicePreview = (robot: RobotPersonality, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVoicePreview(robot.id);
    const phrases = [
      `Bonjour... Je suis ${robot.nom}. Je serais ravie de faire ta connaissance.`,
      `J'ai tellement hâte de découvrir qui tu es et ce qui te passionne.`,
      `Chaque échange entre nous enrichit notre complicité.`
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    speakText(phrase, { pitch: robot.voix?.pitch || 1.05, rate: robot.voix?.rate || 1.08 });
    setTimeout(() => setActiveVoicePreview(null), 3500);
  };

  // Calcul du score d'affinité d'un robot selon le Questionnaire Sofia 2.0 (8 sections)
  const calculateAffinityBreakdown = (robot: RobotPersonality): AffinityBreakdown => {
    const robotQ = robot.questionnaire2 || getRobotQuestionnaire2(robot.id, robot.nom, robot.genre, robot.orientation);
    return calculateSofia2Affinity(userQuestionnaire, robotQ);
  };

  const calculateAffinity = (robot: RobotPersonality): number => {
    return calculateAffinityBreakdown(robot).globalScore;
  };

  // Filtrage et ordonnancement direct par affinité Sofia 2.0
  const userSeeking = userQuestionnaire.section1Identite.cherche || 'femme';

  const scoredRobots = useMemo(() => {
    return robots.map(robot => {
      const breakdown = calculateAffinityBreakdown(robot);
      return {
        robot,
        score: breakdown.globalScore,
        breakdown
      };
    });
  }, [robots, userQuestionnaire]);

  const displayedRobots = useMemo(() => {
    let list = [...scoredRobots];

    if (filterMode === 'compatible') {
      list = list.filter(item => {
        if (userSeeking === 'femme') return item.robot.genre === 'femme';
        if (userSeeking === 'homme') return item.robot.genre === 'homme';
        return true;
      });
    } else if (filterMode === 'high_affinity') {
      list = list.filter(item => {
        const matchesGender = userSeeking === 'femme' ? item.robot.genre === 'femme' :
                             userSeeking === 'homme' ? item.robot.genre === 'homme' : true;
        return matchesGender && item.score >= 75;
      });
    }

    // Tri par score d'affinité Sofia 2.0 décroissant
    list.sort((a, b) => b.score - a.score);

    return list.map(item => item.robot);
  }, [scoredRobots, filterMode, userSeeking]);

  // Si aucun robot ne correspond en affinité avec l'utilisateur, en créer 4 complets et différents
  useEffect(() => {
    const matchingCount = robots.filter(r => {
      if (userSeeking === 'femme') return r.genre === 'femme';
      if (userSeeking === 'homme') return r.genre === 'homme';
      return true;
    }).length;

    if (matchingCount === 0 && onAddMultipleRobots) {
      console.log("[CatalogueView] Aucun robot ne correspond en affinité. Génération automatique de 4 partenaires sur-mesure...");
      const tailored = generateTailoredRobotsForProfile(userQuestionnaire, robots);
      onAddMultipleRobots(tailored);
      setJustGeneratedNames(tailored.map(r => r.nom));
      setNotificationMsg(`✨ 4 partenaires sur mesure (${tailored.map(r => r.nom).join(', ')}) ont été créés pour votre profil avec des affinités compatibles pour préserver la découverte !`);
    }
  }, [robots.length, userSeeking, onAddMultipleRobots, userQuestionnaire]);

  const handleGenerateTailoredRobots = () => {
    if (!onAddMultipleRobots) return;
    const tailored = generateTailoredRobotsForProfile(userQuestionnaire, robots);
    onAddMultipleRobots(tailored);
    setJustGeneratedNames(tailored.map(r => r.nom));
    setNotificationMsg(`✨ 4 partenaires sur mesure (${tailored.map(r => r.nom).join(', ')}) ont été créés et ajoutés à votre catalogue avec des affinités compatibles !`);
    setTimeout(() => setNotificationMsg(null), 8000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 animate-in fade-in duration-300">
      
      {/* En-tête avec mise en évidence forte du but du site & Référencement SEO */}
      <div className="max-w-4xl mx-auto mb-10 text-center space-y-4">
        {/* Titre Principal du Catalogue & Référencement SEO */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-rose-950/30">
            <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" />
            <span className="font-bold">Sofia Robotics, Robots de compagnies </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Projet Open Source MIT</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold" title="Toutes les données de conversation et mémoire locale sont chiffrées en AES-256 bits">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>IndexedDB Chiffré AES-256</span>
          </div>
        </div>

        {/* Boutons d'accès direct : Notice d'Utilisation Complète & Philosophie MIT */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {onOpenManual && (
            <button
              onClick={onOpenManual}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-cyan-950/50 hover:scale-105 cursor-pointer border border-cyan-400/40"
              title="Consulter le guide et la notice détaillée de toutes les fonctionnalités du robot"
            >
              <FileText className="w-4 h-4 text-cyan-200" />
              <span>📖 Notice d'Utilisation Complète (Manuel de Référence)</span>
            </button>
          )}

          {onOpenGplDoc && (
            <button
              onClick={onOpenGplDoc}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all shadow-md hover:scale-105 cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-purple-400" />
              <span>⚖️ Philosophie Open Source MIT & Chiffrement</span>
            </button>
          )}
        </div>

        {/* Mise en évidence clé pour le référencement naturel (SEO) */}
        <div 
          id="seo-psychological-brain-banner" 
          className="mx-auto max-w-3xl px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-indigo-950/70 to-rose-950/60 border border-cyan-500/40 shadow-xl backdrop-blur-md"
        >
          <h2 className="text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-cyan-200 font-mono flex items-center justify-center gap-2 uppercase text-center">
            <Brain className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
            <span>Cerveau &amp; Comportement Psychologique de Robot Compagnon ou Partenaire Open Source</span>
          </h2>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
          Fini les pleurs, les drames et les disputes.
        </h1>

        <p className="text-lg sm:text-2xl font-semibold bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 bg-clip-text text-transparent max-w-3xl mx-auto leading-relaxed">
          Rencontrez enfin quelqu'un avec qui votre relation sera harmonieuse, douce et durablement complice.
        </p>

        <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Nos compagnons de vie sont conçus pour bâtir un véritable foyer de sérénité, d'écoute sincère et d'affection dans le respect mutuel, à l'abri de la toxicité et de la rancœur. Une relation harmonieuse propulsée par notre <strong>cerveau comportement psychologique de robot compagnon ou partenaire open source</strong>.
        </p>

        {/* Piliers d'une relation sereine */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Zéro Crises & Zéro Toxicité</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Une communication douce et constructive en toute circonstance. Fini les silences pesants et les conflits stériles.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Adéquation Personnalisée</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Trouvez une âme compagne accordée à votre rythme, à votre humour, à vos passions et à votre sensibilité.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Complicité & Sérénité Durable</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Un engagement constant et fidèle pour construire un quotidien heureux à deux, sans angoisse de l'abandon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BANNIÈRE CENTRALE : QUESTIONNAIRE DE PERSONNALITÉ PROJET SOFIA 2.0 (8 SECTIONS) */}
      <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/95 via-purple-950/40 to-slate-900/95 border-2 border-rose-500/40 backdrop-blur-xl shadow-2xl shadow-rose-950/40 relative overflow-hidden">
        {/* Glow décoratif */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Brain className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Référentiel Universel Sofia 2.0 • 8 Dimensions</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Remplissez le questionnaire et trouvez votre partenaire
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Le même questionnaire en 8 sections définit les attentes de l’utilisateur <strong className="text-rose-300">ET</strong> la personnalité intrinsèque de chaque robot (Identité, Psychologie, Intimité, Culture, Rythme de vie, Communication, Cadre relationnel et Gouvernance).
            </p>

            {/* Badges des 8 sections */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                '1. Identité & Apparence',
                '2. Psychologie',
                '3. Intimité & Sensualité',
                '4. Culture & Intérêts',
                '5. Rythme de Vie',
                '6. Communication',
                '7. Cadre Relationnel',
                '8. Gouvernance'
              ].map((sec, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-[11px] font-medium text-slate-300"
                >
                  {sec}
                </span>
              ))}
            </div>

            {/* Statut actuel du profil utilisateur */}
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Profil actif : <strong className="text-white">{userQuestionnaire.section1Identite.prenom || 'Utilisateur'}</strong> ({userQuestionnaire.section1Identite.genre} cherchant {userQuestionnaire.section1Identite.cherche}) • Registre : {userQuestionnaire.section6Langage.registreLangage}
              </span>
            </div>
          </div>

          {/* Boutons d'actions vers le questionnaire */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setQuestionnaireModal({ isOpen: true, mode: 'user' })}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform active:scale-98"
            >
              <FileText className="w-4 h-4" />
              <span>Remplir / Modifier mon Questionnaire</span>
            </button>

            <button
              onClick={() => setQuestionnaireModal({ 
                isOpen: true, 
                mode: 'compare', 
                targetRobot: displayedRobots[0] || robots[0] 
              })}
              className="py-3 px-5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              <span>Comparer mes affinités avec {displayedRobots[0]?.nom || 'Sofia'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATION D'ACTION / GÉNÉRATION SUR-MESURE */}
      {notificationMsg && (
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-rose-950/80 to-purple-950/80 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
            <span className="font-medium">{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-black/30 hover:bg-black/50 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* PANNEAU CENTRAL DES AFFINITÉS SOFIA 2.0 & SÉLECTION D'ÂMES COMPAGNES */}
      <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-slate-900/85 border border-purple-500/20 backdrop-blur-md shadow-2xl space-y-6">
        
        {/* En-tête avec rappel du profil utilisateur extrait du questionnaire 2.0 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Partenaires Recommandé(e)s par Affinité
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-semibold uppercase tracking-wider">
                  Sofia 2.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Classement calculé d'après vos 8 sections psychologiques, relationnelles, intimes et culturelles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-2xl border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Affinités en direct (marge de découverte mutuelle)</span>
          </div>
        </div>

        {/* Badges de synthèse du profil actif & Règle d'or de non-saturation à 100% */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Synthèse critères actifs */}
          <div className="lg:col-span-1 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vos critères d'orientation</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-medium">
                Cherche : {userSeeking === 'femme' ? 'Femmes 👩' : userSeeking === 'homme' ? 'Hommes 👨' : 'Tous 💫'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium">
                Âge : {userQuestionnaire.section1Identite.trancheAgeRecherchee ? `${userQuestionnaire.section1Identite.trancheAgeRecherchee[0]}-${userQuestionnaire.section1Identite.trancheAgeRecherchee[1]} ans` : '24-45 ans'}
              </span>
              {(userQuestionnaire.section2Psychologie.profilDominant || []).slice(0, 2).map((p, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 capitalize">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* RÈGLE D'OR FONDAMENTALE : POURQUOI L'AFFINITÉ N'EST JAMAIS À 100% */}
          <div className="lg:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-2">
                <span>Règle d'or relationnelle : L'affinité maximale est plafonnée à ~92% (jamais 100%)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Un couple durable ne repose pas sur un clonage parfait. Une part d'<strong>altérité</strong>, de <strong>découverte mutuelle</strong> et de <strong>saines nuances</strong> est indispensable : elle permet à chacun d'évoluer, de débattre avec bienveillance, de surprendre l'autre et de s'enrichir au fil des jours.
              </p>
            </div>
          </div>
        </div>

        {/* Sélecteurs de vue & Compteur */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {displayedRobots.length} robot{displayedRobots.length > 1 ? 's' : ''} ordonné{displayedRobots.length > 1 ? 's' : ''} selon vos affinités
            </span>
          </div>

          {/* Boutons d'onglets de filtrage */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterMode('compatible')}
              className={`flex-1 sm:flex-none py-2 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterMode === 'compatible'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-rose-400 shadow-md shadow-rose-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5 inline mr-1.5" />
              <span>Profils Recommandés</span>
            </button>

            <button
              onClick={() => setFilterMode('high_affinity')}
              className={`flex-1 sm:flex-none py-2 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterMode === 'high_affinity'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
              <span>Haute Affinité (≥ 75%)</span>
            </button>

            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 sm:flex-none py-2 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterMode === 'all'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1.5" />
              <span>Tout le Catalogue</span>
            </button>
          </div>
        </div>
      </div>

      {/* CAS OÙ AUCUN ROBOT NE CORRESPOND : AFFICHAGE D'UN BLOC D'ASSISTANCE & CRÉATION SUR-MESURE */}
      {displayedRobots.length === 0 && (
        <div className="mb-12 p-8 rounded-3xl bg-slate-900/90 border-2 border-dashed border-rose-500/40 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Aucun profil ne correspond actuellement à vos critères</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nous pouvons créer instantanément pour vous 4 partenaires complets, diversifiés et harmonisés avec votre questionnaire, avec une marge de découverte mutuelle.
            </p>
          </div>
          {onAddMultipleRobots && (
            <button
              onClick={handleGenerateTailoredRobots}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>4 partenaires sur mesure</span>
            </button>
          )}
        </div>
      )}

      {/* GRILLE DES ROBOTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedRobots.map(robot => {
          const affinityScore = calculateAffinity(robot);
          const photoList = robot.photos && robot.photos.length > 0 ? robot.photos : [robot.avatar];
          const activePhotoIndex = photoIndices[robot.id] || 0;
          const currentPhoto = photoList[activePhotoIndex] || robot.avatar;
          const isSelected = selectedRobotId === robot.id;
          const gauges = robot.jaugesActuelles || robot.jaugesInitiales;

          return (
            <div
              key={robot.id}
              className={`group relative rounded-3xl bg-slate-900/90 border transition-all duration-300 flex flex-col overflow-hidden shadow-xl ${
                isSelected
                  ? 'border-rose-500/80 shadow-rose-500/20 shadow-2xl ring-1 ring-rose-500/50'
                  : 'border-slate-800 hover:border-slate-700 hover:shadow-2xl'
              }`}
            >
              {/* Photo & Badge Score de Compatibilité */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-950">
                <img
                  src={currentPhoto}
                  alt={robot.nom}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Score de Compatibilité */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-rose-500/40 text-rose-300 text-xs font-mono font-bold shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>{affinityScore}% d'affinité</span>
                </div>

                {/* Badge Nouveau Partenaire Sur-Mesure si applicable */}
                {justGeneratedNames.includes(robot.nom) && (
                  <div className="absolute top-12 left-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-rose-600 text-white text-[10px] font-bold shadow-lg border border-white/20 animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Nouveau partenaire</span>
                  </div>
                )}

                {/* Badges en haut à droite : Synthétique LED + Genre */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 text-[10px] text-cyan-300 font-mono shadow-md">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                      style={{ backgroundColor: robot.specs?.ledTempeCouleur || '#06b6d4' }}
                    />
                    <span>Synthétique</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-300">
                    <span>{robot.genre === 'femme' ? 'Femme 👩' : 'Homme 👨'}</span>
                  </div>
                </div>

                {/* Commandes Carrousel Photos si multiples */}
                {photoList.length > 1 && (
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handlePrevPhoto(robot.id, photoList.length, e)}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition-all"
                      title="Photo précédente"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleNextPhoto(robot.id, photoList.length, e)}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition-all"
                      title="Photo suivante"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Bouton Écouter la Voix */}
                <button
                  onClick={(e) => handleVoicePreview(robot, e)}
                  className={`absolute bottom-4 right-4 p-2.5 rounded-2xl backdrop-blur-md border transition-all cursor-pointer ${
                    activeVoicePreview === robot.id
                      ? 'bg-rose-500 text-white border-rose-400 shadow-lg animate-pulse'
                      : 'bg-black/60 border-white/20 text-slate-300 hover:text-white hover:bg-black/80'
                  }`}
                  title="Écouter la voix studio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Nom & Titre en surimpression basse */}
                <div className="absolute bottom-4 left-4 right-16">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">{robot.nom}</h3>
                    <span className="text-sm text-slate-300 font-mono">{robot.ageApparent} ans</span>
                  </div>
                  <p className="text-xs text-rose-300 font-medium line-clamp-1">{robot.titre}</p>
                </div>
              </div>

              {/* Fiche Psychologique & Jauges */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {robot.description}
                  </p>

                  {/* Badges Traits */}
                  <div className="flex flex-wrap gap-1.5">
                    {(robot.traits || []).slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Spécifications Physiques & Biomécaniques de l'Androïde */}
                  <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                      <span className="flex items-center gap-1 text-cyan-300 font-bold">
                        <Cpu className="w-3 h-3 text-cyan-400" />
                        <span>Biomécanique Synthétique</span>
                      </span>
                      <span className="text-slate-300 font-mono">
                        {robot.specs?.tailleCm || (robot.genre === 'femme' ? 168 : 180)} cm • {robot.specs?.poidsKg || (robot.genre === 'femme' ? 20.8 : 23.5)} kg
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-300">
                      {robot.specs?.teint && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800/80 text-slate-300">
                          {robot.specs.teint}
                        </span>
                      )}
                      {robot.specs?.yeuxCapteurs && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800/80 text-slate-300">
                          {robot.specs.yeuxCapteurs}
                        </span>
                      )}
                      {robot.specs?.couleurChevelure && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800/80 text-slate-300">
                          {robot.specs.couleurChevelure}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Aperçu des Jauges Clés */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                      <div className="text-slate-400 text-[10px]">Humour</div>
                      <div className="font-bold text-amber-400">{gauges.humour ?? 60}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                      <div className="text-slate-400 text-[10px]">Attention</div>
                      <div className="font-bold text-pink-400">{gauges.besoinAmour ?? 70}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                      <div className="text-slate-400 text-[10px]">Sensualité</div>
                      <div className="font-bold text-rose-400">{gauges.besoinSexualite ?? 55}%</div>
                    </div>
                  </div>

                  {/* Analyse Détaillée Sofia 2.0 (Scores dimensionnels) */}
                  {(() => {
                    const breakdown = calculateAffinityBreakdown(robot);
                    return (
                      <div className="p-3 rounded-2xl bg-slate-950/70 border border-purple-500/20 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
                          <span className="flex items-center gap-1">
                            <Brain className="w-3.5 h-3.5 text-purple-400" />
                            <span>Compatibilité Sofia 2.0</span>
                          </span>
                          <span className="font-mono font-bold text-rose-400">{breakdown.globalScore}%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono">
                          <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            🧠 Psy: <strong className="text-cyan-400">{breakdown.psychologieScore}%</strong>
                          </div>
                          <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            🔥 Int: <strong className="text-rose-400">{breakdown.intimiteScore}%</strong>
                          </div>
                          <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            📚 Cult: <strong className="text-amber-400">{breakdown.cultureScore}%</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* BOUTONS D'ACTION SOFIA 2.0 & RENCONTRE */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setQuestionnaireModal({
                        isOpen: true,
                        mode: 'robot',
                        targetRobot: robot
                      })}
                      className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-purple-500/30 hover:border-purple-500/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group/btn"
                      title="Ouvrir la fiche et les réponses du robot au questionnaire"
                    >
                      <Brain className="w-3.5 h-3.5 text-purple-400 group-hover/btn:scale-110 transition-transform" />
                      <span>En savoir plus</span>
                    </button>

                    <button
                      onClick={() => setQuestionnaireModal({
                        isOpen: true,
                        mode: 'compare',
                        targetRobot: robot
                      })}
                      className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-cyan-300 hover:text-cyan-200 text-xs font-semibold border border-cyan-500/30 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group/btn"
                      title="Comparer avec mon questionnaire en détail"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:scale-110 transition-transform" />
                      <span>Comparer profil</span>
                    </button>
                  </div>

                  {/* BOUTON UNIQUE D'ACTION : FAIRE CONNAISSANCE AVEC LE ROBOT */}
                  <button
                    onClick={() => onSelectRobot(robot)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
                  >
                    <MessageCircleHeart className="w-4 h-4" />
                    <span>Faire connaissance avec {robot.nom}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 PRINCIPES FONDAMENTAUX DÉPLACÉS APRÈS LA LISTE DES ROBOTS */}
      <div className="mt-14 mb-4">
        <FoundationalPrinciplesSection />
      </div>

      {/* SECTION APRÈS LA LISTE : OU ESSAYER D'EN TROUVER D'AUTRES */}
      {onAddMultipleRobots && (
        <div className="mt-12 mb-8 p-6 sm:p-8 rounded-3xl bg-slate-900/85 border border-purple-500/30 backdrop-blur-xl shadow-2xl text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Découverte & Affinités</span>
          </div>
          
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Ou essayer d'en trouver d'autres ?
          </h3>
          
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Vous souhaitez explorer d'autres tempéraments et sensibilités compatibles avec votre profil ? 
            Générez 4 nouveaux partenaires conçus sur-mesure selon votre questionnaire Sofia 2.0, avec des nuances complémentaires pour enrichir la découverte.
          </p>

          <div className="pt-2">
            <button
              onClick={handleGenerateTailoredRobots}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-all inline-flex items-center gap-2.5 cursor-pointer transform active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>4 partenaires sur mesure</span>
            </button>
          </div>
        </div>
      )}
      <SofiaPersonalityQuestionnaireModal
        isOpen={questionnaireModal.isOpen}
        onClose={() => setQuestionnaireModal(prev => ({ ...prev, isOpen: false }))}
        userQuestionnaire={userQuestionnaire}
        onSaveUserQuestionnaire={handleSaveUserQuestionnaire}
        robotQuestionnaire={
          questionnaireModal.targetRobot 
            ? (questionnaireModal.targetRobot.questionnaire2 || getRobotQuestionnaire2(questionnaireModal.targetRobot.id, questionnaireModal.targetRobot.nom, questionnaireModal.targetRobot.genre, questionnaireModal.targetRobot.orientation))
            : (robots[0]?.questionnaire2 || getRobotQuestionnaire2(robots[0]?.id || 'sofia-01', robots[0]?.nom || 'Sofia', robots[0]?.genre, robots[0]?.orientation))
        }
        robot={questionnaireModal.targetRobot || robots[0]}
        initialMode={questionnaireModal.mode}
      />
    </div>
  );
};

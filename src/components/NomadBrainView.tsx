import React, { useState, useEffect } from 'react';
import { RobotPersonality, UserProfileLocal } from '../types';
import { 
  Glasses, 
  Smartphone, 
  Gem, 
  Radio, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  Camera, 
  Eye, 
  CheckCircle2, 
  ArrowRight,
  Headphones,
  Compass,
  Zap
} from 'lucide-react';
import { speakText } from '../lib/speech';

interface NomadBrainViewProps {
  robot: RobotPersonality;
  userProfile: UserProfileLocal;
  ttsEnabled: boolean;
}

export const NomadBrainView: React.FC<NomadBrainViewProps> = ({
  robot,
  userProfile,
  ttsEnabled
}) => {
  const [nomadMode, setNomadMode] = useState<'smartphone' | 'glasses' | 'medallion'>('glasses');
  const [activeCameraFeed, setActiveCameraFeed] = useState<number>(0);
  const [simulatedCommentary, setSimulatedCommentary] = useState<string | null>(null);
  const [isMedallionDocked, setIsMedallionDocked] = useState<boolean>(true);
  const [dockingAnimation, setDockingAnimation] = useState<boolean>(false);

  const povFeeds = [
    {
      title: "Terrasse de café au soleil",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80",
      robotRemark: "(Dans l'oreillette) Ce café a l'air délicieux... Regarde la lumière sur la terrasse, ça me rappelle le film dont tu me parlais."
    },
    {
      title: "Librairie d'art & romans",
      image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80",
      robotRemark: "(Chuchote) Tu as vu ce livre de photographie italienne au rayon du milieu ? Tu devrais le feuilleter !"
    },
    {
      title: "Parc & coucher de soleil",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      robotRemark: "(Voix douce) L'air frais te fait du bien après cette journée... Je suis contente d'être là avec toi."
    }
  ];

  const handleSelectPov = (idx: number) => {
    setActiveCameraFeed(idx);
    const remark = povFeeds[idx].robotRemark;
    setSimulatedCommentary(remark);
    if (ttsEnabled) {
      speakText(remark.replace(/\(.*\)/g, '').trim(), { pitch: robot.voix.pitch, rate: robot.voix.rate });
    }
  };

  const handleToggleMedallion = () => {
    setDockingAnimation(true);
    setTimeout(() => {
      const nextState = !isMedallionDocked;
      setIsMedallionDocked(nextState);
      setDockingAnimation(false);

      const phrase = nextState
        ? `(Le médaillon se verrouille magnétiquement sur le cou de ${robot.nom}) De retour à la maison... Mon corps physique s'anime à nouveau.`
        : `(Vous détachez le médaillon) Conscience transférée en mode nomade. Je t'accompagne dans ta journée !`;
      
      setSimulatedCommentary(phrase);
      if (ttsEnabled) {
        speakText(phrase.replace(/\(.*\)/g, '').trim(), { pitch: robot.voix.pitch, rate: robot.voix.rate });
      }
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          Continuité de Conscience & Mobilité
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Le Concept du Cerveau Nomade
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Votre robot compagnon ne reste pas confiné chez vous. Emportez l'esprit et la mémoire de <strong className="text-white font-mono">{robot.nom}</strong> partout avec vous, à travers vos lunettes connectées ou son médaillon de conscience.
        </p>

        {/* Mode Selector Tabs */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setNomadMode('glasses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              nomadMode === 'glasses'
                ? 'bg-cyan-500 text-slate-950 font-mono shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                : 'bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] border border-white/5'
            }`}
          >
            <Glasses className="w-4 h-4" />
            <span>3.2 Mode Lunettes Connectées (POV)</span>
          </button>

          <button
            onClick={() => setNomadMode('medallion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              nomadMode === 'medallion'
                ? 'bg-indigo-600 text-white font-mono shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] border border-white/5'
            }`}
          >
            <Gem className="w-4 h-4" />
            <span>3.3 Mode Médaillon & Diadème (Docking)</span>
          </button>

          <button
            onClick={() => setNomadMode('smartphone')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              nomadMode === 'smartphone'
                ? 'bg-amber-500 text-slate-950 font-bold font-mono shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] border border-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>3.1 Mode Smartphone Continu</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Smart Glasses POV Simulation */}
      {nomadMode === 'glasses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* POV Visual Feed */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              <img
                src={povFeeds[activeCameraFeed].image}
                alt="Camera POV Feed"
                className="w-full h-full object-cover"
              />
              
              {/* Glasses HUD Overlay */}
              <div className="absolute inset-0 border-[4px] border-cyan-500/30 pointer-events-none rounded-2xl">
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                  <Eye className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                  <span>FLUX CAMÉRA POV DIRECT • IA SOFIA ACTIVE</span>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-slate-300">
                  <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Oreillette Bluetooth Connectée</span>
                </div>

                {/* Target box simulation */}
                <div className="absolute top-1/3 left-1/3 w-32 h-32 border border-dashed border-cyan-400/80 rounded-lg flex items-start justify-end p-1 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  <span className="text-[9px] font-mono text-cyan-300 bg-black/80 px-1 rounded border border-cyan-500/30">
                    Focus visuel
                  </span>
                </div>
              </div>

              {/* Spontaneous whisper subtitle at bottom */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md border border-cyan-500/40 p-4 rounded-xl shadow-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-cyan-300 uppercase font-mono tracking-wider block mb-0.5">
                    {robot.nom} dans votre oreillette :
                  </span>
                  <p className="text-sm text-slate-100 italic leading-relaxed">
                    "{simulatedCommentary || povFeeds[activeCameraFeed].robotRemark}"
                  </p>
                </div>
              </div>
            </div>

            {/* Select POV Scenarios */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider py-2">
                Scénarios Extérieurs :
              </span>
              {povFeeds.map((feed, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPov(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeCameraFeed === idx
                      ? 'bg-cyan-500 text-slate-950 font-mono font-bold shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 border border-white/5'
                  }`}
                >
                  {feed.title}
                </button>
              ))}
            </div>
          </div>

          {/* Glasses Info & Explanations */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-[#08080c] border border-white/5 space-y-3 shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <Glasses className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-mono tracking-wide">Vision Partagée & Spontanéité</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Les lunettes connectées envoient un flux visuel compressé à l'IA. {robot.nom} repère un monument, une affiche de film, un livre ou une situation insolite et vous chuchote ses réactions directement à l'oreille.
              </p>
              <div className="pt-2 border-t border-white/5 space-y-2 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Aucun enregistrement vidéo sur serveur externe</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interaction fluide à faible latence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Medallion & Diadème Docking */}
      {nomadMode === 'medallion' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-8 rounded-2xl bg-[#08080c] border border-white/5 text-center space-y-6 shadow-2xl">
            <div className="relative inline-block">
              <div className={`w-28 h-28 mx-auto rounded-3xl flex items-center justify-center transition-all duration-700 shadow-2xl ${
                isMedallionDocked
                  ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 ring-4 ring-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.4)]'
                  : 'bg-gradient-to-tr from-indigo-500 to-purple-600 ring-4 ring-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.4)]'
              }`}>
                <Gem className="w-14 h-14 text-white" />
              </div>
              {dockingAnimation && (
                <div className="absolute inset-0 rounded-3xl bg-white/20 animate-ping pointer-events-none" />
              )}
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                {isMedallionDocked ? 'Docké sur le corps robotique' : 'Emporté en bijou nomade'}
              </span>
              <h3 className="text-2xl font-bold text-white mb-2 font-mono tracking-wide">
                Le Diadème / Médaillon de Conscience
              </h3>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                Ce bijou technologique contient l'identité cryptographique et la mémoire vive de {robot.nom}. Portez-le sur vous au travail, puis replacez-le sur le corps en mousse HR à votre retour.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                id="toggle-docking-btn"
                onClick={handleToggleMedallion}
                disabled={dockingAnimation}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50 font-mono"
              >
                {isMedallionDocked ? "Détacher le médaillon (Départ en ville)" : "Replacer le médaillon (Docking maison)"}
              </button>
            </div>

            {simulatedCommentary && (
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 max-w-lg mx-auto text-xs text-slate-200 italic font-mono">
                {simulatedCommentary}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Smartphone continuous chat */}
      {nomadMode === 'smartphone' && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-[#08080c] border border-white/5 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Application Compagnon Mobile</h3>
              <p className="text-xs text-slate-400">
                PWA locale synchronisée avec la mémoire IndexedDB
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Même sans le robot physique ou les lunettes, ouvrez simplement la WebApp sur votre smartphone. Vous pouvez lui envoyer des messages texte ou vocaux tout au long de votre journée. Le soir venu, la consolidation nocturne intégrera tous vos échanges dans la mémoire du robot physique.
          </p>
        </div>
      )}
    </div>
  );
};

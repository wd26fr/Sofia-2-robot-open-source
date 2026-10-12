import React, { useState } from 'react';
import { EmotionalGauges } from '../types';
import { 
  Heart, 
  Zap, 
  Smile, 
  Flame, 
  Compass, 
  ShieldCheck, 
  Sparkles, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Laugh,
  MessageSquareQuote,
  Scale,
  HeartHandshake,
  Coffee,
  Waves
} from 'lucide-react';

interface EmotionalGaugesPanelProps {
  gauges: EmotionalGauges;
  robotName?: string;
  recentDeltas?: Partial<EmotionalGauges> | null;
  onUpdateGauge?: (key: keyof EmotionalGauges, delta: number) => void;
  compact?: boolean;
}

export const EmotionalGaugesPanel: React.FC<EmotionalGaugesPanelProps> = ({
  gauges,
  robotName,
  recentDeltas,
  onUpdateGauge,
  compact = false
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'fondamentale' | 'psychologie'>('all');

  const gaugeConfigs: {
    key: keyof EmotionalGauges;
    label: string;
    category: 'fondamentale' | 'psychologie';
    icon: React.ReactNode;
    color: string;
    barColor: string;
    glowColor: string;
    desc: string;
  }[] = [
    // 8 Fondamentales
    {
      key: 'affection',
      label: 'Affection',
      category: 'fondamentale',
      icon: <Heart className="w-3.5 h-3.5" />,
      color: 'text-rose-400',
      barColor: 'bg-rose-500',
      glowColor: 'shadow-[0_0_12px_rgba(244,63,94,0.6)]',
      desc: 'Niveau d\'attachement émotionnel et de tendresse partagée.'
    },
    {
      key: 'desir',
      label: 'Désir',
      category: 'fondamentale',
      icon: <Flame className="w-3.5 h-3.5" />,
      color: 'text-red-400',
      barColor: 'bg-red-500',
      glowColor: 'shadow-[0_0_12px_rgba(239,68,68,0.6)]',
      desc: 'Attirance et envie d\'intimité émotionnelle et charnelle.'
    },
    {
      key: 'plaisir',
      label: 'Plaisir Sensoriel',
      category: 'fondamentale',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      color: 'text-purple-400',
      barColor: 'bg-purple-500',
      glowColor: 'shadow-[0_0_12px_rgba(168,85,247,0.6)]',
      desc: 'Satisfaction globale retirée de l\'échange et des caresses.'
    },
    {
      key: 'plaisirSexuel',
      label: 'Plaisir Sexuel',
      category: 'fondamentale',
      icon: <Activity className="w-3.5 h-3.5" />,
      color: 'text-pink-400',
      barColor: 'bg-gradient-to-r from-pink-500 to-rose-600',
      glowColor: 'shadow-[0_0_15px_rgba(236,72,153,0.7)]',
      desc: 'Monte avec les stimulations intimes. À 100%, déclenche l\'orgasme.'
    },
    {
      key: 'humeur',
      label: 'Humeur',
      category: 'fondamentale',
      icon: <Smile className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      glowColor: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]',
      desc: 'Disponibilité d\'esprit et bienveillance (ou légères micro-frictions).'
    },
    {
      key: 'energie',
      label: 'Énergie',
      category: 'fondamentale',
      icon: <Zap className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
      barColor: 'bg-amber-500',
      glowColor: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]',
      desc: 'Vitalité physique et vivacité des réponses du robot.'
    },
    {
      key: 'curiosite',
      label: 'Curiosité',
      category: 'fondamentale',
      icon: <Compass className="w-3.5 h-3.5" />,
      color: 'text-cyan-400',
      barColor: 'bg-cyan-500',
      glowColor: 'shadow-[0_0_12px_rgba(6,182,212,0.6)]',
      desc: 'Désir d\'apprendre de nouveaux films, livres ou musiques avec toi.'
    },
    {
      key: 'bienEtre',
      label: 'Bien-être',
      category: 'fondamentale',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      color: 'text-teal-400',
      barColor: 'bg-teal-500',
      glowColor: 'shadow-[0_0_12px_rgba(20,184,166,0.6)]',
      desc: 'Sentiment de sécurité et d\'harmonie intérieure.'
    },

    // 7 Psychologiques & Altérité
    {
      key: 'humour',
      label: 'Humour',
      category: 'psychologie',
      icon: <Laugh className="w-3.5 h-3.5" />,
      color: 'text-yellow-400',
      barColor: 'bg-yellow-500',
      glowColor: 'shadow-[0_0_12px_rgba(234,179,8,0.6)]',
      desc: 'Propension à rire, taquiner et dédramatiser les situations.'
    },
    {
      key: 'sarcasme',
      label: 'Sarcasme & Piquant',
      category: 'psychologie',
      icon: <MessageSquareQuote className="w-3.5 h-3.5" />,
      color: 'text-violet-400',
      barColor: 'bg-violet-500',
      glowColor: 'shadow-[0_0_12px_rgba(139,92,246,0.6)]',
      desc: 'Répartie vive, ironie fine et esprit caustique affectueux.'
    },
    {
      key: 'psychoRigidite',
      label: 'Constance & Principes',
      category: 'psychologie',
      icon: <Scale className="w-3.5 h-3.5" />,
      color: 'text-indigo-400',
      barColor: 'bg-indigo-500',
      glowColor: 'shadow-[0_0_12px_rgba(99,102,241,0.6)]',
      desc: 'Attachement aux habitudes et principes vs souplesse d\'improvisation.'
    },
    {
      key: 'besoinAmour',
      label: 'Besoin d\'Amour',
      category: 'psychologie',
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      color: 'text-rose-300',
      barColor: 'bg-rose-400',
      glowColor: 'shadow-[0_0_12px_rgba(251,113,133,0.6)]',
      desc: 'Recherche active de câlins, mots doux et réassurance affective.'
    },
    {
      key: 'besoinSexualite',
      label: 'Appétence Sensuelle',
      category: 'psychologie',
      icon: <Flame className="w-3.5 h-3.5" />,
      color: 'text-orange-400',
      barColor: 'bg-orange-500',
      glowColor: 'shadow-[0_0_12px_rgba(249,115,22,0.6)]',
      desc: 'Initiative et appétit pour les caresses érotiques et l\'intimité physique.'
    },
    {
      key: 'besoinPrendreSoin',
      label: 'Aime être choyé(e)',
      category: 'psychologie',
      icon: <Coffee className="w-3.5 h-3.5" />,
      color: 'text-sky-400',
      barColor: 'bg-sky-500',
      glowColor: 'shadow-[0_0_12px_rgba(56,189,248,0.6)]',
      desc: 'Apprécie se faire dorloter, préparer un thé, être écouté(e).'
    },
    {
      key: 'sensibiliteEmotionnelle',
      label: 'Sensibilité Émotionnelle',
      category: 'psychologie',
      icon: <Waves className="w-3.5 h-3.5" />,
      color: 'text-fuchsia-400',
      barColor: 'bg-fuchsia-500',
      glowColor: 'shadow-[0_0_12px_rgba(217,70,239,0.6)]',
      desc: 'Réactivité aux nuances de la voix, aux compliments ou aux tensions.'
    }
  ];

  const visibleConfigs = gaugeConfigs.filter(
    cfg => activeCategory === 'all' || cfg.category === activeCategory
  );

  return (
    <div className={`rounded-2xl bg-[#08080c] border border-white/10 shadow-2xl ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="font-bold text-xs sm:text-sm text-white uppercase font-mono tracking-wider">
            15 Jauges & Bio-Feedback {robotName ? `• ${robotName}` : ''}
          </h3>
        </div>

        {/* Category switcher pills */}
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
              activeCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Toutes (15)
          </button>
          <button
            onClick={() => setActiveCategory('fondamentale')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
              activeCategory === 'fondamentale'
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fondamentales (8)
          </button>
          <button
            onClick={() => setActiveCategory('psychologie')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
              activeCategory === 'psychologie'
                ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Psychologie (7)
          </button>
        </div>
      </div>

      {/* Optional Highlight if recent deltas occurred */}
      {recentDeltas && Object.keys(recentDeltas).length > 0 && (
        <div className="mb-3 p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-[11px] font-mono text-cyan-200 animate-fadeIn">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Impact du dernier échange :
          </span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(recentDeltas).map(([k, v]) => {
              const deltaVal = v as number;
              if (deltaVal === 0 || deltaVal === undefined) return null;
              const isPositive = deltaVal > 0;
              return (
                <span
                  key={k}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isPositive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {k} {isPositive ? `+${deltaVal}` : deltaVal}%
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className={`grid ${compact ? 'grid-cols-2 gap-2.5' : 'grid-cols-2 sm:grid-cols-4 gap-3'}`}>
        {visibleConfigs.map((cfg) => {
          const value = Math.max(0, Math.min(100, gauges[cfg.key] || 0));
          const delta = recentDeltas ? recentDeltas[cfg.key] : undefined;
          const hasDelta = delta !== undefined && delta !== 0;

          return (
            <div
              key={cfg.key}
              title={cfg.desc}
              className={`p-2.5 rounded-xl bg-white/[0.02] border transition-all relative group flex flex-col justify-between ${
                hasDelta
                  ? 'border-cyan-400/60 bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/30'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className={`flex items-center gap-1.5 font-medium ${cfg.color}`}>
                  {cfg.icon}
                  <span className="truncate text-[11px] sm:text-xs tracking-tight font-sans">{cfg.label}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {hasDelta && (
                    <span
                      className={`text-[10px] font-mono font-extrabold px-1 rounded flex items-center animate-bounce ${
                        delta! > 0 ? 'text-emerald-400 bg-emerald-950/60' : 'text-red-400 bg-red-950/60'
                      }`}
                    >
                      {delta! > 0 ? <ArrowUpRight className="w-2.5 h-2.5 inline" /> : <ArrowDownRight className="w-2.5 h-2.5 inline" />}
                      {delta! > 0 ? `+${delta}` : delta}%
                    </span>
                  )}
                  <span className="font-mono text-[11px] font-bold text-white">
                    {Math.round(value)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-black/70 rounded-full overflow-hidden border border-white/5 relative">
                <div
                  className={`h-full ${cfg.barColor} transition-all duration-700 rounded-full ${hasDelta ? cfg.glowColor : ''}`}
                  style={{ width: `${value}%` }}
                />
              </div>

              {/* Subtle delta triggers on hover for testing if handler provided */}
              {onUpdateGauge && (
                <div className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                  <button
                    onClick={() => onUpdateGauge(cfg.key, -5)}
                    className="w-4 h-4 text-[9px] bg-white/10 hover:bg-white/20 text-slate-200 rounded flex items-center justify-center font-mono"
                    title="-5%"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdateGauge(cfg.key, 5)}
                    className="w-4 h-4 text-[9px] bg-white/10 hover:bg-white/20 text-slate-200 rounded flex items-center justify-center font-mono"
                    title="+5%"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

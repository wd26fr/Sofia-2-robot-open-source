import React from 'react';
import { RobotPersonality } from '../types';
import { 
  Sparkles, 
  HeartHandshake, 
  BrainCircuit, 
  Glasses, 
  Settings2, 
  ShieldCheck, 
  BatteryCharging, 
  Database,
  Volume2,
  VolumeX,
  Radio,
  Video
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalogue' | 'chat' | 'call' | 'nomad' | 'lab' | 'ros';
  setActiveTab: (tab: 'catalogue' | 'chat' | 'call' | 'nomad' | 'lab' | 'ros') => void;
  currentRobot: RobotPersonality;
  ttsEnabled: boolean;
  setTtsEnabled: (val: boolean) => void;
  onOpenQuotaModal: () => void;
  onOpenExportModal: () => void;
  onOpenAiSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRobot,
  ttsEnabled,
  setTtsEnabled,
  onOpenQuotaModal,
  onOpenExportModal,
  onOpenAiSettings
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0a0a0f] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse shrink-0"></div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-widest text-white uppercase font-mono">
                PROJET SOFIA 2.0
              </h1>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/10 text-slate-400 font-mono hidden sm:inline-block">
                V. ARCH-HYBRID-LOKAL
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 hidden md:block uppercase tracking-wider">
              Altérité • Mémoire IndexedDB • Passerelle ROS 2
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
          <button
            id="tab-catalogue-btn"
            onClick={() => setActiveTab('catalogue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'catalogue'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-cyan-400" />
            <span>Catalogue</span>
          </button>

          <button
            id="tab-chat-btn"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="hidden lg:inline">Compagnon ({currentRobot.nom})</span>
            <span className="lg:hidden">Compagnon</span>
          </button>

          <button
            id="tab-call-btn"
            onClick={() => setActiveTab('call')}
            title="Interface Utilisateur Réelle : Appel Vidéo immersif avec votre robot"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'call'
                ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'text-purple-300/80 hover:text-purple-200 hover:bg-purple-950/30 border border-purple-500/20'
            }`}
          >
            <Video className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline font-semibold">Interface Utilisateur (Appel Visio)</span>
            <span className="sm:hidden font-semibold">Appel Visio</span>
          </button>

          <button
            id="tab-ros-btn"
            onClick={() => setActiveTab('ros')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'ros'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">Passerelle ROS 2</span>
            <span className="md:hidden">ROS 2</span>
          </button>

          <button
            id="tab-nomad-btn"
            onClick={() => setActiveTab('nomad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'nomad'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Glasses className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Cerveau Nomade</span>
            <span className="md:hidden">Nomade</span>
          </button>

          <button
            id="tab-lab-btn"
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'lab'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Back-Office Lab</span>
            <span className="md:hidden">Lab</span>
          </button>
        </nav>

        {/* Telemetry & Action buttons */}
        <div className="flex items-center gap-2 sm:gap-4 text-[11px] font-mono">
          {/* Status block */}
          <div className="hidden xl:flex items-center gap-4 border-r border-white/10 pr-4 text-[10px]">
            <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase tracking-wider text-[9px]">Moteur</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> HYBRIDE (0-TOKEN / LLM)
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase tracking-wider text-[9px]">Stockage</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> LOCAL INDEXEDDB
              </span>
            </div>
          </div>

          {/* Multi-Provider AI Settings button */}
          {onOpenAiSettings && (
            <button
              id="navbar-ai-settings-btn"
              onClick={onOpenAiSettings}
              title="Configurer les clés API Multi-Fournisseurs (Gemini, OpenAI, Claude, Mistral, Groq, Ollama...)"
              className="p-2 text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/50 rounded-lg border border-cyan-500/30 transition-all shadow-[0_0_8px_rgba(34,211,238,0.15)]"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {/* Backup / Export button */}
          <button
            id="backup-btn"
            onClick={onOpenExportModal}
            title="Exporter la mémoire et la relation en fichier JSON"
            className="p-2 text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-lg border border-white/10 transition-colors"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* TTS Toggle */}
          <button
            id="tts-toggle-btn"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            title={ttsEnabled ? "Voix activée (cliquer pour couper)" : "Voix désactivée (cliquer pour activer)"}
            className={`p-2 rounded-lg border transition-colors ${
              ttsEnabled
                ? 'text-cyan-300 bg-cyan-950/40 border-cyan-500/40 hover:bg-cyan-900/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                : 'text-slate-500 bg-white/[0.02] border-white/10 hover:text-slate-300'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Battery pill */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-500/30 shadow-[0_0_8px_rgba(251,191,36,0.2)]">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>{currentRobot.specs.batterie}%</span>
          </div>
        </div>
      </div>
    </header>
  );
};

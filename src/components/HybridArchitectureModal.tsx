import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  Globe, 
  Radio, 
  Sparkles, 
  Lock, 
  ServerOff, 
  Layers, 
  Share2, 
  Code2, 
  CheckCircle2, 
  Zap, 
  X,
  ExternalLink,
  Key,
  Database
} from 'lucide-react';

interface HybridArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiSettings?: () => void;
}

export const HybridArchitectureModal: React.FC<HybridArchitectureModalProps> = ({
  isOpen,
  onClose,
  onOpenAiSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-4xl w-full max-h-[90vh] rounded-3xl bg-[#0a0a12] border border-cyan-500/30 flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-sans">
                  Architecture Hybride & Souveraineté Open Source
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                  Zéro-Trace Client
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Comment Sofia conjugue confidentialité 100% absolue et puissance de calcul sans compromis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-sm">
          
          {/* Manifesto Open Source Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-slate-900 border border-purple-500/30 text-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-semibold uppercase tracking-wider">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>Engagement Open Source & Anti-Verrouillage GAFAM</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              « Le projet Sofia 2.0 est pensé pour être totalement <strong>Open Source</strong>. L'intimité, l'attachement émotionnel et la psychologie des robots ne doivent jamais être confisqués ou monétisés par de très gros industriels (GAFAM) créant une dépendance technologique et affective. Chacun doit pouvoir posséder, auditer, héberger et adapter son compagnon en toute liberté. »
            </p>
          </div>

          {/* Comparatif des 2 Niveaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NIVEAU 1 : 100% LOCAL */}
            <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Niveau 1 : 100% Local</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">0 Donnée Envoyée</span>
                </div>

                <h4 className="text-base font-bold text-white mb-2 font-sans">
                  Autonomie Totale & Zéro Fuite Réseau
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Dans ce mode, l'application fonctionne de manière entièrement autonome sur votre appareil (smartphone, PC ou carte Jetson Orin Nano embarquée dans le robot).
                </p>

                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                    <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-sans block">Moteur Déterministe</strong>
                      Analyse lexicale, règles conditionnelles et calcul des 15 jauges exécutés en direct dans le navigateur ou le node ROS 2.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-sans block">Nano-LLM WebGPU Local</strong>
                      Modèles embarqués (SmolLM2 / Qwen 0.5B) exécutés directement sur le processeur/GPU local de votre appareil.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                    <HardDrive className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-sans block">Stockage Local IndexedDB</strong>
                      Souvenirs, faits biographiques, profils JSON et affinités stockés exclusivement sur l'appareil.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] font-mono text-emerald-300">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fonctionne hors-ligne (Avion / Tunnel)
                </span>
                <span>Air-Gapped Ready</span>
              </div>
            </div>

            {/* NIVEAU 2 : HYBRIDE / DISTANT */}
            <div className="p-6 rounded-3xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Niveau 2 : Hybride & LLM Externe</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">Puissance Étendue</span>
                </div>

                <h4 className="text-base font-bold text-white mb-2 font-sans">
                  Grandes Réflexions avec Contrôle Total
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Pour les discussions philosophiques poussées, l'utilisateur peut connecter le fournisseur LLM de son choix (Groq, Mistral, OpenAI, Ollama distant ou VPS privé).
                </p>

                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/40 border border-cyan-500/20">
                    <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-sans block">Contrôle Total de l'Utilisateur</strong>
                      C'est vous qui décidez d'ajouter ou non votre clé API ou votre serveur privé dans l'interface de Sofia.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/40 border border-cyan-500/20">
                    <ServerOff className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-sans block">Aucun Serveur Centralisé Sofia</strong>
                      Aucune base de données propriétaire intermédiaire ne stocke ni n'analyse vos requêtes. La PWA communique directement avec l'API choisie.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/40 border border-cyan-500/20">
                    <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-sans block">Architecture Zéro-Trace Client</strong>
                      Même en mode connecté, l'historique complet et les jauges émotionnelles restent enfermés dans votre IndexedDB locale.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                <span className="flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> BYOK (Bring Your Own Key)
                </span>
                {onOpenAiSettings && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAiSettings();
                    }}
                    className="text-cyan-400 hover:text-white underline font-semibold flex items-center gap-1"
                  >
                    Configurer mes clés
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Synthèse Technique & Passerelle ROS 2 */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
              <div>
                <span className="text-white font-bold block font-sans">Déploiement sur Robot Physique ROS 2</span>
                <span>Export JSON direct & Bridge temps-réel vers nodes ROS 2 (/emotion_state, /cmd_vel, /speech_tts)</span>
              </div>
            </div>
            <span className="text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30 shrink-0 font-semibold">
              ✓ Souverain & Indépendant
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-black/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Projet Sofia 2.0 • Licence Open Source & Respect Intégral de la Vie Privée
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all ml-auto"
          >
            Fermer & Retourner au Catalogue
          </button>
        </div>
      </div>
    </div>
  );
};

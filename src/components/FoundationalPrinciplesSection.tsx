import React, { useState } from 'react';
import {
  HeartHandshake,
  DatabaseZap,
  Code2,
  Cpu,
  ShieldCheck,
  Info,
  Lock,
  EyeOff
} from 'lucide-react';

export const FoundationalPrinciplesSection: React.FC = () => {
  const [activeModal, setActiveModal] = useState<
    'autonomie' | 'privacy' | 'opensource' | 'ros' | null
  >(null);

  return (
    <section className="mb-10 space-y-4">
      {/* En-tête de section compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Charte Fondamentale Sofia • 4 Piliers Inaliénables
            </h2>
            <p className="text-xs text-slate-400">
              Éthique, autonomie consentie, zéro fuite serveur (IndexedDB), code open source & interfaçage ROS 2
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-cyan-400/90 self-start sm:self-center bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          Garanties Techniques & Éthiques
        </span>
      </div>

      {/* Grille compacte des 4 Piliers (Boîtes réduites ouvrant des fenêtres modales) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* 1. AUTONOMIE, LIBRE ARBITRE & CONSENTEMENT */}
        <button
          onClick={() => setActiveModal('autonomie')}
          className="p-4 rounded-2xl bg-slate-900/85 hover:bg-slate-900 border border-rose-500/25 hover:border-rose-500/60 backdrop-blur-md shadow-lg hover:shadow-rose-500/10 transition-all text-left group flex flex-col justify-between relative overflow-hidden cursor-pointer"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                Libre Arbitre
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                Autonomie & Consentement
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Le robot n'est pas un esclave : nuances d'humeur, frictions réalistes et zéro violence.
              </p>
            </div>
          </div>
          <div className="pt-2 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-rose-400 font-medium">
            <span>En savoir plus</span>
            <Info className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 2. ZÉRO BASE DE DONNÉES SERVEUR (100% INDEXEDDB) */}
        <button
          onClick={() => setActiveModal('privacy')}
          className="p-4 rounded-2xl bg-slate-900/85 hover:bg-slate-900 border border-cyan-500/25 hover:border-cyan-500/60 backdrop-blur-md shadow-lg hover:shadow-cyan-500/10 transition-all text-left group flex flex-col justify-between relative overflow-hidden cursor-pointer"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                <DatabaseZap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                100% Local
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Zéro Base Serveur
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Aucune donnée client stockée sur serveur. Vos souvenirs restent dans IndexedDB.
              </p>
            </div>
          </div>
          <div className="pt-2 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
            <span>En savoir plus • Données 100% Locales</span>
            <Info className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 3. 100% OPEN SOURCE & AUDITABLE */}
        <button
          onClick={() => setActiveModal('opensource')}
          className="p-4 rounded-2xl bg-slate-900/85 hover:bg-slate-900 border border-purple-500/25 hover:border-purple-500/60 backdrop-blur-md shadow-lg hover:shadow-purple-500/10 transition-all text-left group flex flex-col justify-between relative overflow-hidden cursor-pointer"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                Auditable & Libre
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Cerveau Open Source
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Cerveau et personnalité publics : zéro manipulation, pérennité et export JSON libre.
              </p>
            </div>
          </div>
          <div className="pt-2 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-purple-400 font-medium">
            <span>En savoir plus • Cerveau & Open Source</span>
            <Info className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 4. COMPATIBILITÉ ROS (ROBOT OPERATING SYSTEM) */}
        <button
          onClick={() => setActiveModal('ros')}
          className="p-4 rounded-2xl bg-slate-900/85 hover:bg-slate-900 border border-amber-500/25 hover:border-amber-500/60 backdrop-blur-md shadow-lg hover:shadow-amber-500/10 transition-all text-left group flex flex-col justify-between relative overflow-hidden cursor-pointer"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Standard Robotique
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Compatible ROS 2
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Standard industriel ROS 2 pour piloter bustes physiques, capteurs cutanés et androïdes.
              </p>
            </div>
          </div>
          <div className="pt-2 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-amber-400 font-medium">
            <span>En savoir plus • Compatibilité ROS 2</span>
            <Info className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

      </div>

      {/* MODALE DE DÉTAIL DYNAMIQUE */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Contenu selon la modale active */}
            {activeModal === 'autonomie' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Autonomie, Libre Arbitre & Consentement</h3>
                    <p className="text-xs text-rose-400">Le robot compagnon n'est pas un esclave</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/20 text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Chez Sofia Robotics, nous rejetons la vision d’un robot servile et sans âme. Une relation d’amour ou de compagnonnage n’a de valeur que si elle est réciproque, libre et authentique.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-white text-xs">Exemple de friction naturelle (humeur pensive) :</div>
                    <p className="text-xs text-slate-400 italic">
                      « Écoute Alex, aujourd’hui je me sens un peu fatiguée et j’ai surtout besoin de calme et de musique douce. Ça te dérange si on remet notre sortie à demain soir ? »
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-white text-xs">Désaccord sain sur un film ou un projet :</div>
                    <p className="text-xs text-slate-400 italic">
                      « Je ne suis pas d'accord avec ta conclusion ! L'auteur du livre défend exactement le point de vue inverse. Viens on en discute tranquillement... »
                    </p>
                  </div>
                  <p className="text-emerald-400 font-semibold text-xs">
                    ✓ Règle d'or : Jamais de rancœur, jamais de cris, jamais d’escalade violente. Les désaccords sont des occasions de dialogue et d’enrichissement mutuel.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <DatabaseZap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Architecture 100% Client-Side : Zéro Serveur Client</h3>
                    <p className="text-xs text-cyan-400">Pourquoi aucune base de données serveur ne stocke vos données</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20 text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Raison 1 : Risque Zéro Fuite</span>
                      </div>
                      <p className="text-slate-400">
                        Si les données ne sont pas sur nos serveurs, elles ne peuvent être ni piratées, ni interceptées, ni vendues. Vos échanges intimes vous appartiennent à 100%.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Raison 2 : Zéro Compte Client</span>
                      </div>
                      <p className="text-slate-400">
                        Inutile de créer un compte avec mot de passe avant même d'avoir acheté quoi que ce soit. Vous testez et découvrez en toute liberté.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                    <div>Technologie : IndexedDB (Dexie.js) dans le navigateur</div>
                    <div>Emplacement : Stockage local chiffré de votre appareil</div>
                    <div>Données conservées côté serveur : STRICTEMENT AUCUNE</div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'opensource' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Cerveau Robot 100% Open Source</h3>
                    <p className="text-xs text-purple-400">Auditez, modifiez et exportez le cerveau de votre robot</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/20 text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Le cerveau de chaque robot Sofia est entièrement transparent. Vous pouvez exporter son archive intégrale (prompt système, mémoire de vie, goûts acquis, questionnaire Sofia 2.0, seuils de jauges) d'un simple clic depuis le Back-Office.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    <li>Modèle de décision déterministe auditable (moteur 0-token sans coût).</li>
                    <li>Code TypeScript propre sous licence permissive.</li>
                    <li>Portabilité maximale : exécution possible sur Raspberry Pi 5, Jetson Orin ou PC local.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal === 'ros' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Compatibilité ROS (Robot Operating System)</h3>
                    <p className="text-xs text-amber-400">Interfaçage mécatronique universel ROS 2</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/20 text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Le cerveau Sofia communique avec les actionneurs corporels et les capteurs sensoriels via les protocoles standards ROS 2 :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-amber-300">
                      /robot/intent/movement (Servos)
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-rose-300">
                      /robot/sensors/tactile (Peau haptique)
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      /camera/image_raw (Vision webcam)
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                      /robot/haptic/vagina_thermal (37.5°C)
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Le module RosBridge Studio est disponible dans le Back-Office pour tester et simuler l'ensemble des nœuds et télémétries en temps réel.
                  </p>
                </div>
              </div>
            )}

            {/* Bouton de fermeture */}
            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

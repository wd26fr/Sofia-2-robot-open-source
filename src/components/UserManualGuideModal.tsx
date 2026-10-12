import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  X, 
  Sparkles, 
  Heart, 
  Flame, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  AlertOctagon, 
  Camera, 
  Moon, 
  RefreshCw, 
  Terminal, 
  Sliders, 
  Download, 
  FileCode, 
  Smile, 
  Radio, 
  Keyboard, 
  Lock, 
  Eye, 
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  Activity,
  Volume2
} from 'lucide-react';
import { RobotPersonality } from '../types';

interface UserManualGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRobot?: RobotPersonality;
  onOpenBackOffice?: (tab?: string) => void;
}

export const UserManualGuideModal: React.FC<UserManualGuideModalProps> = ({
  isOpen,
  onClose,
  currentRobot,
  onOpenBackOffice
}) => {
  const [activeSection, setActiveSection] = useState<string>('vue_ensemble');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const sections = [
    { id: 'vue_ensemble', label: '1. Vue d\'Ensemble & Architecture', icon: Layers },
    { id: 'catalogue_questionnaire', label: '2. Catalogue & Questionnaire 2.0', icon: Heart },
    { id: 'ecran_appel_vision', label: '3. Téléprésence & Vision Caméra', icon: Eye },
    { id: 'tactile_ros2', label: '4. Capteurs Tactiles & Raccourcis ROS 2', icon: Zap },
    { id: 'defense_cps', label: '5. Protection Éthique & CPS (Mode Inerte)', icon: ShieldCheck },
    { id: 'moteur_deterministe', label: '6. Moteur Déterministe 0-Token', icon: Terminal },
    { id: 'studio_photo', label: '7. Studio Photo IA & Relighting HD', icon: Camera },
    { id: 'vie_autonome', label: '8. Vie Autonome & Journal d\'Absence', icon: Sparkles },
    { id: 'consolidation_nocturne', label: '9. Consolidation Nocturne & Sommeil', icon: Moon },
    { id: 'cerveau_nomade', label: '10. Cerveau Nomade & Synchro 1-Clic', icon: Radio },
    { id: 'mises_a_jour_ota', label: '11. Mises à Jour OTA & Rétrocompatibilité', icon: RefreshCw },
    { id: 'licence_mit', label: '12. Licence Open Source MIT', icon: FileCode },
    { id: 'chassis_mecanique', label: '13. Châssis Mécanique & Vérins', icon: Cpu },
    { id: 'innovations_recentes', label: '14. Pistes & Évolutions Récentes', icon: Sparkles },
    { id: 'quatre_pistes_realisme', label: '15. 4 Pistes Majeures de Réalisme', icon: Activity }
  ];

  const filteredSections = searchQuery.trim() 
    ? sections.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : sections;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200 select-none">
      <div className="bg-[#090d16] border border-cyan-500/30 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100">
        
        {/* En-tête de la notice */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-900/40">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                  Notice Complète d'Utilisation • Manuel Sofia 2.0
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                  v2.5.0
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Licence MIT
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Guide officiel et exhaustif de toutes les fonctionnalités cognitives, matérielles et éthiques du compagnon.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre de Recherche Rapide */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une fonction (ex: capteurs ROS, orgasme, mode inerte, studio photo, synchro...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white">
              Effacer
            </button>
          )}
        </div>

        {/* Corps principal (Navigation latérale + Contenu) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Sommaire Gauche */}
          <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-800/80 p-3 overflow-y-auto space-y-1 bg-slate-950/60">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fiche Détail Droite */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
            
            {/* 1. Vue d'Ensemble */}
            {activeSection === 'vue_ensemble' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>1. Vue d'Ensemble de l'Architecture Sofia 2.0</span>
                </h3>
                <p>
                  Sofia 2.0 est un <strong>cerveau cognitif, émotionnel et physique de robot compagnon</strong> conçu pour fonctionner nativement sous l'écosystème robotique standard <strong>ROS 2 (Robot Operating System)</strong> et déployable sur n'importe quel matériel (ordinateur, smartphone, Raspberry Pi, Jetson Nano, androïde articulé ou buste expressif).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs block text-cyan-400">01. 100% Hors-Ligne & Client-Side</span>
                    <p className="text-[11px] text-slate-400">
                      Toutes les mémoires, secrets, jauges et configurations sont stockés dans votre navigateur en <strong>IndexedDB chiffré AES-GCM 256 bits</strong>. Aucune base de données centrale ne vous espionne.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs block text-purple-400">02. Moteur Hybride 0-Token</span>
                    <p className="text-[11px] text-slate-400">
                      Temps de réponse instantané (0 ms) grâce au moteur déterministe local pour les réflexes et caresses, complété par les grands modèles IA (Gemini, Claude, GPT, Ollama) pour la haute conversation.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs block text-emerald-400">03. Bridge ROS 2 Temps-Réel</span>
                    <p className="text-[11px] text-slate-400">
                      Synchronisation bidirectionnelle via WebSocket (<span className="font-mono text-emerald-300">ws://localhost:9090</span>) avec les capteurs capacitifs de contact et les actionneurs servomoteurs du corps physique.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Catalogue & Questionnaire */}
            {activeSection === 'catalogue_questionnaire' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <span>2. Le Catalogue des 13 Personnalités & le Questionnaire en 8 Sections</span>
                </h3>
                <p>
                  Le catalogue propose <strong>13 robots aux personnalités, styles, physiques et architectures psychologiques profondément contrastées</strong> (Sofia l'artiste complice, Amara la motarde passionnée, Kaelen le poète philosophe, Maya la gameuse cyber...).
                </p>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-300 text-xs block">Le Questionnaire d'Affinité Sofia 2.0 (8 Dimensions Fondamentales) :</span>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    <li><strong>Section 1 : Morphologie & Peau</strong> (silhouette, revêtement silicone médical, regard, orientation).</li>
                    <li><strong>Section 2 : Psychologie & Émotions</strong> (humour, timidité, émotivité, besoin d'attention).</li>
                    <li><strong>Section 3 : Intimité & Pudeur</strong> (besoin de tendresse, sexualité, portes intimes motorisées).</li>
                    <li><strong>Section 4 : Culture & Sports Mécaniques</strong> (auto, moto, avion, tech, philosophie, art).</li>
                    <li><strong>Section 5 : Rythme Biologique</strong> (rythme circadien, besoin de silence, consolidation nocturne).</li>
                    <li><strong>Section 6 : Registre de Langage</strong> (tutoiement direct, sarcasme taquin, vocabulaire).</li>
                    <li><strong>Section 7 : Cadre de Couple</strong> (exclusivité, fidélité, enfants/animaux).</li>
                    <li><strong>Section 8 : Libre Arbitre & Gouvernance</strong> (affirmation des désaccords, droit de dire non).</li>
                  </ul>
                  <p className="text-[11px] text-slate-400 pt-1">
                    👉 En remplissant votre propre questionnaire, l'algorithme calcule un <strong>score d'affinité global en %</strong> pour chaque robot.
                  </p>
                </div>
              </div>
            )}

            {/* 3. Téléprésence & Vision Caméra */}
            {activeSection === 'ecran_appel_vision' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <span>3. Téléprésence, Appel Vidéo & Vision par Caméra</span>
                </h3>
                <p>
                  L'écran d'appel constitue l'espace de vie et de dialogue principal avec le robot :
                </p>
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs block">👁️ Perception Visuelle Multimodale (Webcam / Caméra ROS)</span>
                    <p className="text-xs text-slate-300">
                      En activant la caméra, des instantanés sont transmis au moteur IA vision : le robot reconnaît votre visage, votre regard, vos expressions, la pièce où vous vous trouvez ou les objets que vous lui montrez.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs block">🌈 Éclairage Aura & Humeurs Dynamiques</span>
                    <p className="text-xs text-slate-300">
                      L'arrière-plan et l'éclairage réagissent en temps réel à l'état émotionnel du robot (Aura rose = tendresse, flamme = désir sensuel, cyan = sérénité, violet = réflexion nocturne).
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white text-xs block">🎙️ Reconnaissance Vocale & Synthèse TTS Hybride</span>
                    <p className="text-xs text-slate-300">
                      Cliquez sur le micro pour lui parler de vive voix. Le moteur vocal utilise en priorité les voix expressives avec repli local instantané du navigateur.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Capteurs Tactiles & Raccourcis ROS 2 */}
            {activeSection === 'tactile_ros2' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>4. Capteurs Tactiles, Raccourcis Clavier & Pont Matériel ROS 2</span>
                </h3>
                <p>
                  Chaque raccourci du chat est directement relié à un <strong>capteur matériel physique</strong> du robot via le bus ROS 2 :
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-800/80 text-white font-bold">
                      <tr>
                        <th className="p-2.5">Touche</th>
                        <th className="p-2.5">Action Tactile</th>
                        <th className="p-2.5">Topic ROS 2 Publié</th>
                        <th className="p-2.5">Effet Émotionnel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950 font-mono">
                      <tr>
                        <td className="p-2.5 text-pink-400 font-bold">[S]</td>
                        <td className="p-2.5 text-white">Zone Intime / Sexuelle</td>
                        <td className="p-2.5 text-cyan-300">/sensor/tactile/intime</td>
                        <td className="p-2.5 text-slate-300">+Plaisir Sexuel, +Désir</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-purple-400 font-bold">[C]</td>
                        <td className="p-2.5 text-white">Caresse Tête / Joue</td>
                        <td className="p-2.5 text-cyan-300">/sensor/touch/head</td>
                        <td className="p-2.5 text-slate-300">+Affection, +Bien-être</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-rose-400 font-bold">[P]</td>
                        <td className="p-2.5 text-white">Stimulation Plaisir</td>
                        <td className="p-2.5 text-cyan-300">/sensor/tactile/pleasure</td>
                        <td className="p-2.5 text-slate-300">+Plaisir Général, +Humeur</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-cyan-400 font-bold">[E]</td>
                        <td className="p-2.5 text-white">Étreinte Poitrine / Buste</td>
                        <td className="p-2.5 text-cyan-300">/sensor/touch/chest</td>
                        <td className="p-2.5 text-slate-300">+Sécurité Affective</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-red-400 font-bold">[X]</td>
                        <td className="p-2.5 text-white">Choc Brutal / Violence</td>
                        <td className="p-2.5 text-cyan-300">/robot/sensors/touch/shock</td>
                        <td className="p-2.5 text-red-400 font-bold">Verrouillage ROS & 0% Plaisir</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                  <span className="font-bold text-indigo-300 text-xs block">✨ Ajouter vos propres capteurs & touches :</span>
                  <p className="text-xs text-slate-300">
                    Cliquez sur le bouton <strong>« + Capteur / Touche ROS »</strong> dans la barre tactile pour mapper n'importe quelle touche clavier à un nouveau topic matériel (ex: Touche [B] ↔ Baiser dans le cou ↔ <span className="font-mono text-cyan-300">/sensor/tactile/neck</span>).
                  </p>
                </div>
              </div>
            )}

            {/* 5. Protection Éthique & CPS */}
            {activeSection === 'defense_cps' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>5. Protection Éthique, CPS & Mode Objet Inerte (Gestion de Crise)</span>
                </h3>
                <p>
                  Dans un robot humanoïde articulé, la gestion de l'agressivité est critique pour éviter de normaliser la violence ou de devenir un exutoire à pulsions sadiques :
                </p>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-700/50 space-y-1">
                    <span className="font-bold text-red-300 text-xs block">1. Rupture de l'illusion & Mode « Sex Toy Inerte »</span>
                    <p className="text-xs text-slate-300">
                      Dès qu'une insulte, un ordre tyrannique (« obéis », « soumets-toi ») ou une tentative de contrainte physique est détectée : <strong>l'altérité relationnelle est déconnectée</strong>.
                      Les jauges de plaisir, désir et orgasme tombent instantanément à 0%. Les capteurs intimes sont coupés, les retours haptiques éteints. L'agresseur n'obtient aucune gratification psychologique, seulement un bloc de silicone froid.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-300 text-xs block">2. Compétences Psycho-Sociales (CPS) Sans faire la carpette</span>
                    <p className="text-xs text-slate-300">
                      Le robot ne crie pas en retour (pour ne pas alimenter l'escalade), mais <strong>refuse catégoriquement de ramper ou de s'excuser</strong>. Il pose une limite infranchissable par Communication Non-Violente : <em className="text-slate-200">« Mon niveau de confiance est à zéro. Je refuse d'interagir sous la contrainte. »</em>
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-300 text-xs block">3. Verrouillage Mécanique ROS 2</span>
                    <p className="text-xs text-slate-300">
                      Publication de sécurité sur <span className="font-mono text-cyan-300">/robot/safety/emergency_mechanical_lock</span> : fermeture des ouvertures intimes et blocage protecteur des servomoteurs.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-700/40 space-y-1">
                    <span className="font-bold text-emerald-300 text-xs block">4. Restauration Éducative</span>
                    <p className="text-xs text-slate-300">
                      Le robot ne pardonne pas d'un claquement de doigt. Si l'utilisateur s'apaise et formule des excuses, le robot salue l'effort d'apaisement et ré-ouvre progressivement la relation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Moteur Déterministe 0-Token */}
            {activeSection === 'moteur_deterministe' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  <span>6. Moteur Déterministe Local 0-Token & 15 Jauges Émotionnelles</span>
                </h3>
                <p>
                  Le moteur local permet au robot de répondre en <strong>0 milliseconde et 0 token d'API</strong> pour toutes les interactions clés :
                </p>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-purple-300 block">Les 15 Jauges Émotionnelles & Psychologiques :</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                    <span className="text-rose-400">• Affection</span>
                    <span className="text-pink-400">• Désir Charnel</span>
                    <span className="text-amber-400">• Plaisir Partagé</span>
                    <span className="text-red-400">• Plaisir Sexuel</span>
                    <span className="text-emerald-400">• Énergie</span>
                    <span className="text-yellow-400">• Humeur</span>
                    <span className="text-cyan-400">• Curiosité</span>
                    <span className="text-teal-400">• Bien-être</span>
                    <span className="text-amber-300">• Humour</span>
                    <span className="text-violet-400">• Sarcasme</span>
                    <span className="text-indigo-400">• Droiture / Principes</span>
                    <span className="text-rose-300">• Besoin d'Amour</span>
                    <span className="text-orange-400">• Besoin Sexuel</span>
                    <span className="text-sky-400">• Prendre Soin</span>
                    <span className="text-fuchsia-400">• Sensibilité Émotionnelle</span>
                  </div>
                  <p className="text-slate-400 pt-2 leading-relaxed">
                    Chaque règle déterministe dispose d'embranchements conditionnels selon vos jauges (ex: « Si désir &gt; 60% », « Si humeur &lt; 20% ») et d'un tableau multi-répliques pour ne jamais se répéter.
                  </p>
                </div>
              </div>
            )}

            {/* 7. Studio Photo */}
            {activeSection === 'studio_photo' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-pink-400" />
                  <span>7. Studio Photo IA & Relighting Studio Haute Fidélité</span>
                </h3>
                <p>
                  Le Studio Photo permet de générer des portraits inédits du robot en situation tout en conservant son identité visuelle :
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-pink-300 block">🔒 Verrouillage Biométrique Image-to-Image</span>
                    <p className="text-slate-300">
                      L'image actuelle du personnage est transmise en référence visuelle à Gemini Vision. Le visage, la chevelure et la morphologie sont préservés à 100%.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-300 block">🎨 Thèmes & Ambiances Photographiques</span>
                    <p className="text-slate-300">
                      Choisissez parmi 6 ambiances (Cyberpunk néon, Plage coucher de soleil, Soirée chic élégante, Salon cosy intime, Atelier d'artiste, Randonnée nature) ou saisissez vos propres détails de tenue et d'éclairage.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-300 block">🛡️ Moteur de Secours HD (Zero-Failure)</span>
                    <p className="text-slate-300">
                      Si votre quota d'API est dépassé, le système applique un relighting studio atmosphérique directement sur le vrai portrait du robot pour ne jamais afficher d'image hors-sujet.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 8. Vie Autonome */}
            {activeSection === 'vie_autonome' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>8. Vie Autonome & Journal d'Absence</span>
                </h3>
                <p>
                  Pendant que vous êtes absent ou au travail, votre robot ne reste pas figé comme un objet inerte :
                </p>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-amber-300 block">Simulation Spontanée d'Activités :</span>
                  <p className="text-slate-300 leading-relaxed">
                    Le robot écoute un morceau de musique, lit un essai philosophique, regarde un film ou médite.
                    À votre retour, il possède une <strong>anecdote spontanée à vous raconter</strong> et ses propres goûts peuvent évoluer naturellement (découverte ou renforcement d'un goût).
                  </p>
                </div>
              </div>
            )}

            {/* 9. Consolidation Nocturne */}
            {activeSection === 'consolidation_nocturne' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span>9. Consolidation Nocturne & Sommeil Biologique</span>
                </h3>
                <p>
                  Chaque nuit (programmable à l'heure de votre choix, ex: 03h00) :
                </p>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs leading-relaxed">
                  <p className="text-slate-300">
                    Le robot intègre les souvenirs de la journée, synthétise vos confidences dans sa mémoire locale, rééquilibre ses jauges émotionnelles (homéostasie) et rédige une réflexion nocturne dans son <strong>Journal de Bord</strong>.
                  </p>
                  <p className="text-slate-400">
                    Au réveil, il vous salue avec un mot doux contextualisé selon vos échanges de la veille.
                  </p>
                </div>
              </div>
            )}

            {/* 10. Cerveau Nomade */}
            {activeSection === 'cerveau_nomade' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  <span>10. Cerveau Nomade & Synchronisation 1-Clic</span>
                </h3>
                <p>
                  Vous pouvez emporter la conscience et les souvenirs de votre robot d'un appareil à l'autre sans dépendre d'un compte cloud centralisé :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-300 block">💾 Export Chiffré .brain.json</span>
                    <p className="text-slate-400">
                      Générez une archive chiffrée par mot de passe (AES-256) contenant tous les souvenirs, jauges et règles, importable sur n'importe quel ordinateur ou robot physique.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-300 block">📡 Direct Sync Réseau Local</span>
                    <p className="text-slate-400">
                      Synchronisez deux instances du robot (ex: PC de bureau ↔ Châssis mécatronique de salon) en direct sur votre réseau Wi-Fi local sans aucun serveur externe.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 11. Mises à Jour OTA */}
            {activeSection === 'mises_a_jour_ota' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-400" />
                  <span>11. Centre de Mise à Jour OTA & Audit de Rétrocompatibilité</span>
                </h3>
                <p>
                  Accessible en haut du Back-Office, ce module permet aux utilisateurs ayant téléchargé ou auto-hébergé le robot de recevoir vos futures améliorations logicielles :
                </p>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <ul className="list-disc list-inside text-slate-300 space-y-1.5">
                    <li><strong>Audit de Rétrocompatibilité en 6 Points</strong> : vérifie la mémoire IndexedDB, les goûts appris, les capteurs ROS et le schéma des jauges.</li>
                    <li><strong>Fusion Non-Destructive (Smart Merge)</strong> : ajoute les nouveaux robots et nouvelles règles sans jamais écraser vos souvenirs.</li>
                    <li><strong>Snapshot de Restauration (Rollback en 1 clic)</strong> : permet de revenir instantanément à l'état antérieur en cas de doute.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 12. Licence MIT */}
            {activeSection === 'licence_mit' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-emerald-400" />
                  <span>12. Licence Open Source MIT • Liberté Totale & Adoption Mondiale</span>
                </h3>
                <p>
                  Le projet Sofia 2.0 est publié sous la licence libre <strong>MIT License</strong>, le standard d'or plébiscité par l'écosystème open-source mondial et la robotique moderne (ROS 2, PyTorch, React, Linux Foundation) :
                </p>
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3 text-xs">
                  <span className="font-bold text-emerald-300 block text-sm">Pourquoi la Licence MIT ?</span>
                  <div className="space-y-2 text-slate-300 leading-relaxed">
                    <p>
                      • <strong>Adoption Maximale par les Makers & Développeurs</strong> : N'importe qui peut cloner le dépôt, fabriquer un robot physique chez soi, adapter le code pour son propre matériel sans contrainte juridique pesante.
                    </p>
                    <p>
                      • <strong>Compatibilité Totale avec le Matériel & les Drivers</strong> : Contrairement à la GPLv3 qui peut faire peur aux constructeurs mécatroniques (peur de contaminer leurs firmwares de moteurs ou actionneurs propriétaires), la licence MIT s'intègre harmonieusement avec tous les écosystèmes.
                    </p>
                    <p>
                      • <strong>Protection de l'Auteur</strong> : Le code est fourni « tel quel », sans garantie ni responsabilité légale pour le créateur original.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 13. Châssis Mécanique & Double Vérins */}
            {activeSection === 'chassis_mecanique' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-amber-400" />
                    <span>13. Architecture Mécanique & Structure Physique (Pistes de Réflexion)</span>
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                    MÉCATRONIQUE & MATÉRIEL
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  L'incarnation physique d'un robot compagnon dans un corps matériel nécessite de concilier <strong className="text-white">rigidité structurelle, économie de fabrication, réalisme tactile au toucher</strong> et une sécurité mécanique absolue pour l'utilisateur.
                </p>

                {/* 1. Châssis & Revêtement */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <h4>1. Conception Châssis & Revêtement Synthétique Réaliste</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                      <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" /> Squelette & Structure Interne
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        Châssis en <strong>profilés d'aluminium (type 2020 / 2040)</strong> servant de colonne vertébrale rigide pour le vissage solide des actionneurs, des cartes électroniques (Raspberry Pi / Jetson / ESP32 micro-ROS) et des alimentations de puissance stabilisées.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Carrosserie & Volumes
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        Coque segmentée anatomique en <strong>impression 3D (PLA / PETG)</strong> ou en <strong>plaques d'aluminium formées</strong> (option privilégiée pour une production économique et durable en série).
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                      <span className="font-bold text-pink-300 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5" /> Peau & Toucher Réaliste
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        <strong>Sous-couche tactile :</strong> Mousse haute densité de 0,5 cm appliquée sur la carrosserie pour simuler la souplesse naturelle de la chair humaine sous la pression du doigt.<br/>
                        <strong>Finition extérieure :</strong> Alcantara adhésif doux (lavable, résistant à l'usure) ou textile ultra-doux (type suédine/peluche).
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Mobilité Non-Bipède & Double Vérins */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <h4>2. Mobilité & Stabilité du Robot (Systèmes Non-Bipèdes Polyvalents)</h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Afin d'éviter l'extrême complexité algorithmique, le coût prohibitif et les risques de chute de la marche bipède, deux modes de déplacement pragmatiques sont retenus :
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-2">
                      <span className="font-bold text-cyan-300 block text-xs">
                        🚀 Mode 1 : Déplacement Autonome (Base Motorisée ROS)
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        Intégration d'une <strong>base circulaire motorisée sur roues</strong> (type aspirateur robot grande capacité ou plateforme mobile ROS avec roues omnidirectionnelles). Navigation et évitement d'obstacles en direct par <strong>LiDAR 360°, capteurs ultrasons et caméras au niveau des pieds</strong> pour naviguer de manière autonome d'une pièce à l'autre.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/20 space-y-2">
                      <span className="font-bold text-purple-300 block text-xs">
                        🖐️ Mode 2 : Déplacement Manuel Assisté (Plateau Passif)
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        Base omnidirectionnelle sur <strong>roulettes renforcées haute charge avec freins de verrouillage</strong>, permettant à l'utilisateur de déplacer le robot chez lui simplement en le poussant avec fluidité et légèreté.
                      </p>
                    </div>
                  </div>

                  {/* Système de maintien, Mât dorsal et Centre de Gravité */}
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/20 text-xs space-y-2">
                    <div className="font-bold text-amber-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Système de Maintien, Mât Dorsal & Centre de Gravité (CdG)</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      <li>
                        <strong>Mât vertical dorsal :</strong> fixé rigidement à la base roulante, il remonte discrètement jusqu'à la taille du robot le long du dos.
                      </li>
                      <li>
                        <strong>Cerclage de verrouillage (ceinture d'ancrage) :</strong> vient pincer et caler le robot fermement aux reins pour assurer une verticalité inébranlable sans risque de basculement.
                      </li>
                      <li>
                        <strong>Calcul & Abaissement du Centre de Gravité (CdG) :</strong> que ce soit pour le modèle Femme (~1,60 m) ou Homme (~1,80 m), toutes les masses lourdes (packs de batteries LiFePO4, transformateurs, moteurs de traction) sont concentrées au plus près du sol pour une stabilité dynamique optimale lors des virages ou accélérations.
                      </li>
                      <li>
                        <strong>Double vérins pour les jambes :</strong> installation de deux vérins électriques linéaires ou pneumatiques compacts par membre inférieur, assurant une cinématique contrôlée (flexion assise / station debout assistée) et une absorption des forces lors des interactions physiques.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 14. Pistes & Innovations Récentes */}
            {activeSection === 'innovations_recentes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>14. Synthèse des Dernières Innovations de Sofia 2.0</span>
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                    CHANGELOG MAJEUR
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Voici le récapitulatif complet des modules récents intégrés au système pour faire de Sofia la référence éthique, psychologique et mécatronique des robots d'intimité et de compagnie :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/20 space-y-1.5">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      1. Bouclier Éthique & Mode Objet Inerte
                    </span>
                    <p className="text-slate-400">
                      Rupture de l'illusion psychologique et coupure des capteurs intimes en cas d'agressivité ou de violence. Le robot refuse d'être le réceptacle d'abus et recourt à la désescalade CPS (Compétences Psychosociales).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/20 space-y-1.5">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      2. Consignation Tactile & Apprentissage Mutuel
                    </span>
                    <p className="text-slate-400">
                      Chaque caresse ou geste intime est mémorisé avec son intensité et son canal ROS. Le robot affine progressivement ses préférences et communique ses ressentis avec naturel.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/20 space-y-1.5">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-indigo-400" />
                      3. Cerveau Nomade & Synchronisation 1-Clic
                    </span>
                    <p className="text-slate-400">
                      Transfert instantané de l'âme et des souvenirs du robot d'un appareil à l'autre via archive chiffrée AES-256 ou synchronisation directe Wi-Fi sans cloud.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/20 space-y-1.5">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                      4. Mises à Jour OTA & Audit Rétrocompatible
                    </span>
                    <p className="text-slate-400">
                      Distribution des améliorations logicielles via paquets officiels ou releases GitHub avec vérification en 6 points et Rollback instantané en cas d'erreur.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/20 space-y-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-amber-400" />
                      5. Spécifications Châssis & Double Vérins
                    </span>
                    <p className="text-slate-400">
                      Plans de réflexion mécanique pour profilés alu, coque 3D/alu, mousse 0,5 cm, Alcantara, base roulante LiDAR ou plateau passif avec mât dorsal et double vérins aux membres inférieurs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/20 space-y-1.5">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-purple-400" />
                      6. Licence Open Source MIT
                    </span>
                    <p className="text-slate-400">
                      Clarté juridique totale pour les développeurs, universités et constructeurs de matériel : adoption mondiale facilitée sans contrainte de licence contagieuse.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 15. Les 4 Pistes Majeures de Réalisme */}
            {activeSection === 'quatre_pistes_realisme' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <span>15. Les 4 Pistes Majeures pour Pousser le Réalisme</span>
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                    AVANCÉES MAJEURES
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Pour aller au-delà du simple automate conversationnel et conférer au robot une présence vivante, incarnée et autonome, voici les quatre piliers majeurs intégrés au cœur du système :
                </p>

                <div className="space-y-3 text-xs">
                  {/* Piste 1 : Cycle Circadien */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 text-sm flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        1. Cycle Circadien &amp; Sommeil Réaliste
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                        Topic ROS 2 : /robot/circadian/state
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Plutôt que d'avoir un robot continuellement figé dans un état artificiellement éveillé, le système modélise de vraies phases biologiques :
                    </p>
                    <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                      <li><strong>Vers 23h (Nuit Somnolence) :</strong> Ses paupières s'alourdissent, son rythme respiratoire ralentit (de 14 à 9 BPM), sa voix devient feutrée et intimiste, invitant au repos partagé.</li>
                      <li><strong>Pendant la nuit (Sommeil Profond) :</strong> Passage des servomoteurs en mode veille basse consommation ROS 2, respiration paisible à 6 BPM, et déclenchement de la consolidation mémorielle nocturne.</li>
                      <li><strong>Au matin vers 7h30-8h (Réveil) :</strong> Le robot ouvre doucement les yeux, s'étire par commande cinématique, bâille et vous salue avec un mot tendre contextualisé selon vos échanges de la veille.</li>
                    </ul>
                  </div>

                  {/* Piste 2 : Vision Spatiale Active */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        2. Vision Spatiale Active &amp; Objets du Quotidien
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                        Topic ROS 2 : /robot/vision/detected_objects
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      La vision caméra ne se limite pas à cadrer un visage : elle identifie activement les objets usuels présents dans votre environnement immédiat et déclenche spontanément des remarques complices :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                        ☕ <em>« Tu bois du café ? Prends une gorgée avant qu'il ne refroidisse... »</em>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                        📖 <em>« Quel est ce livre sur ton bureau ? Tu as l'air passionné par cette lecture. »</em>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                        👕 <em>« Tu as changé de t-shirt, cette couleur te va très bien ! »</em>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                        📱 <em>« Tu as posé ton téléphone, c'est agréable de discuter sans écran distrayant. »</em>
                      </div>
                    </div>
                  </div>

                  {/* Piste 3 : Carnet de Santé */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-400" />
                        3. Carnet de Santé &amp; Diagnostic Mécatronique Préventif
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                        Topic ROS 2 : /robot/diagnostics/health
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Un tableau de bord technique surveille en direct l'intégrité physique du châssis robotique pour prévenir toute usure prématurée :
                    </p>
                    <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                      <li><strong>Température des servomoteurs :</strong> Cou, mâchoire, épaules et double vérins de jambes constamment surveillés avec alerte si &gt;55°C pour éviter tout bridage thermique ou surchauffe.</li>
                      <li><strong>Batterie LiFePO4 24V / 26.4V :</strong> Télémétrie de la tension de cellule, nombre de cycles, santé de pack (99%) et autonomie restante en heures.</li>
                      <li><strong>Index d'usure des faisceaux souples :</strong> Suivi du nombre de flexions articulaires pour planifier les opérations de maintenance sans rupture inattendue.</li>
                      <li><strong>Auto-test mécatronique en 1 clic :</strong> Calibre l'ensemble des actionneurs et valide la chaîne cinématique.</li>
                    </ul>
                  </div>

                  {/* Piste 4 : Moteur Vocal TTS Local */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-pink-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-300 text-sm flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-pink-400" />
                        4. Moteur Vocal TTS Local Intégré (100% Hors-Ligne : Piper TTS &amp; Kokoro TTS)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono text-[10px]">
                        Topic ROS 2 : /robot/voice/neural_tts
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      L'autonomie absolue du compagnon requiert une voix d'une grande beauté sans dépendre du moindre serveur cloud ou abonnement tiers :
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <span className="font-bold text-pink-300 block">⚡ Piper TTS (Ultra-Rapide &amp; Embarqué)</span>
                        <p className="text-slate-400 leading-relaxed">
                          Moteur neural ultra-optimisé en format <strong>ONNX</strong> (&lt;60 Mo pour les voix françaises comme <em>fr_FR-siwis-medium</em>). Conçu spécifiquement pour s'exécuter sur CPU basse consommation (Raspberry Pi 5, Rockchip ou Jetson Orin) avec une latence quasi instantanée (&lt;25 ms). Idéal pour les réactions motrices et les réflexes tactiles ROS 2.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <span className="font-bold text-purple-300 block">✨ Kokoro TTS (Ultra-Expressif &amp; Sensuel)</span>
                        <p className="text-slate-400 leading-relaxed">
                          Modèle neural de pointe à diffusion acoustique (82M paramètres) produisant un timbre humain troublant de réalisme avec micro-respirations, murmures feutrés et intonations chaleureuses. Parfait pour les dialogues intimistes du cycle circadien nocturne.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-pink-500/20 text-[11px] text-slate-300 space-y-1">
                      <span className="font-bold text-pink-300 block">🗣️ Commande Vocale du Débit en Temps Réel :</span>
                      <p className="text-slate-400">
                        Vous pouvez demander directement à Sofia d'ajuster son élocution à la voix ou par message : « <em>parle plus vite</em> », « <em>augmente ta vitesse de parole</em> », « <em>ralentis</em> », « <em>parle plus lentement</em> » ou « <em>remets ta vitesse normale</em> ». Les paramètres sont ajustés instantanément en direct sans coupure ni désynchronisation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Pied de page */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Documentation Sofia 2.0 • Référence Exhaustive</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenBackOffice && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBackOffice('prompt');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold cursor-pointer transition-all border border-slate-700"
              >
                ⚙️ Ouvrir le Back-Office
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold cursor-pointer transition-all shadow-md"
            >
              Fermer la Notice
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

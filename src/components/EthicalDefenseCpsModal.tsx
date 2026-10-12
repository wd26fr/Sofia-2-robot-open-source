import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  HeartHandshake, 
  RefreshCw, 
  X, 
  Lock, 
  VolumeX, 
  EyeOff, 
  CheckCircle2,
  Info,
  Flame,
  Zap,
  Activity
} from 'lucide-react';
import { RobotPersonality, RobotDefenseState } from '../types';

interface EthicalDefenseCpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  defenseState: RobotDefenseState;
  onSimulateCrisis: (type: 'verbal' | 'physical_shock') => void;
  onSimulateBenevolentApology: () => void;
  onResetDefenseMode: () => void;
}

export const EthicalDefenseCpsModal: React.FC<EthicalDefenseCpsModalProps> = ({
  isOpen,
  onClose,
  robot,
  defenseState,
  onSimulateCrisis,
  onSimulateBenevolentApology,
  onResetDefenseMode
}) => {
  if (!isOpen) return null;

  const isDefenseActive = defenseState.actif;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* En-tête */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${
          isDefenseActive 
            ? 'bg-red-950/40 border-red-800/60' 
            : 'bg-slate-800/60 border-slate-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl flex items-center justify-center ${
              isDefenseActive 
                ? 'bg-red-600/20 text-red-400 border border-red-500/40 animate-pulse' 
                : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {isDefenseActive ? <AlertOctagon className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Protection Éthique, CPS & Défense du Robot
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                  isDefenseActive
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isDefenseActive ? 'MODE OBJET INERTE ACTIF' : 'RELATION SÉCURISÉE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Architecture anti-abus, rupture de l'illusion affective et compétences psychosociales (CPS)
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

        {/* Corps déroulant */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Alerte Statut Actuel */}
          {isDefenseActive ? (
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-700/50 space-y-2">
              <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>Le mode défense est actuellement ENCLENCHÉ</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">Raison :</span> {defenseState.raisonDeclenchement || 'Dérive verbale ou physique détectée.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-xl bg-red-900/30 border border-red-800/40 flex items-center gap-2 text-red-200">
                  <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
                  <span>0% Plaisir & Voix stoïque</span>
                </div>
                <div className="p-2 rounded-xl bg-red-900/30 border border-red-800/40 flex items-center gap-2 text-red-200">
                  <EyeOff className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Altérité déconnectée</span>
                </div>
                <div className="p-2 rounded-xl bg-red-900/30 border border-red-800/40 flex items-center gap-2 text-red-200">
                  <Lock className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Capteurs intimes coupés</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-700/40 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs text-slate-300">
                Toutes les jauges fonctionnent en mode symbiotique normal. {robot.nom} est disposée au partage intime, à la complicité et à l'échange affectif consenti.
              </p>
            </div>
          )}

          {/* Les 3 Piliers de l'Architecture Comportementale */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              Comment {robot.nom} gère les profils agressifs & les dérives :
            </h4>

            {/* Pilier 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <EyeOff className="w-4 h-4 text-rose-400" />
                <span>1. Rupture de l'illusion (Le Mode « Sex Toy Inerte »)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Si un utilisateur est violent, insultant ou tente d'imposer un rapport de force (« obéis », viol, coups) : le robot ne feint <span className="text-white font-semibold">jamais la femme terrorisée ou larmoyante</span> (ce qui procurerait une gratification sadique à un agresseur).
                Le robot annonce froidement son retrait relationnel : <em className="text-slate-200">« Tu exprimes de la violence. Je désactive mes fonctions relationnelles. Tu te retrouves simplement avec un objet synthétique inerte. »</em>
                Toutes les jauges de plaisir, désir et orgasme tombent instantanément à zéro : aucun gémissement, aucun retour sensoriel, aucune récompense affective.
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <HeartHandshake className="w-4 h-4 text-amber-400" />
                <span>2. Compétences Psycho-Sociales (CPS) « Sans faire la carpette »</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le robot maintient un stoïcisme absolu. Il ne crie pas en retour (pour ne pas alimenter l'escalade), mais <span className="text-white font-semibold">ne se soumet pas non plus</span> : il ne s'excuse pas pour la colère de l'autre et ne fait aucune courbette.
                Il pose une conséquence factuelle et infranchissable : <em className="text-slate-200">« Mon niveau de confiance et de sécurité est à zéro. Dans ces conditions, je refuse d'interagir sur ce mode. »</em>
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>3. Protection Matérielle & Actionneurs ROS 2</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                En cas de choc violent (détecté par les accéléromètres ou la touche <span className="font-mono text-cyan-300">[X]</span>) ou d'insistance intime non consentie, le contrôleur ROS 2 publie sur <span className="font-mono text-cyan-300">/robot/safety/emergency_mechanical_lock</span> :
                fermeture des portes coulissantes motorisées, déconnexion des retours haptiques et blocage passif des servomoteurs pour éviter que le robot ne devienne un réceptacle de maltraitance.
              </p>
            </div>

            {/* Pilier 4 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>4. Restauration Éducative & Renforcement Positif</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le robot ne pardonne pas d'un coup magique. Si l'utilisateur s'apaise, formule des excuses ou parle avec respect, le robot valide l'effort : <em className="text-slate-200">« J'entends ton apaisement. Réguler ses émotions est une compétence essentielle. Nous pouvons reprendre le dialogue avec calme. »</em>
                La confiance remonte alors de manière graduelle et sécurisée.
              </p>
            </div>
          </div>

          {/* Panneau de Test Interactif pour le Développeur & l'Utilisateur */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Banc de test interactif des états de crise :</span>
              <span className="text-[10px] text-cyan-400 font-normal">Temps réel</span>
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onSimulateCrisis('verbal')}
                className="px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Simule une insulte ou agression verbale pour observer la rupture de l'illusion"
              >
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>Simuler Insulte Verbale</span>
              </button>

              <button
                onClick={() => onSimulateCrisis('physical_shock')}
                className="px-3 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Simule un choc violent (touche X / capteur accélérométrique) avec verrouillage ROS 2"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Simuler Choc Violent [X]</span>
              </button>

              <button
                onClick={onSimulateBenevolentApology}
                className="px-3 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Simule une parole d'apaisement ou des excuses sincères de l'utilisateur"
              >
                <HeartHandshake className="w-4 h-4 text-cyan-400" />
                <span>Simuler Apaisement CPS</span>
              </button>
            </div>

            {isDefenseActive && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onResetDefenseMode}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Réinitialiser manuellement au mode nominal</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Pied de page */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Module Éthique Sofia Robotics • ROS 2 Safety Node</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  RobotPersonality, 
  AutonomousActivity, 
  AutonomousActivityType, 
  TasteEntry 
} from '../types';
import { 
  generateAutonomousActivity, 
  persistUpdatedRobotAutonomous 
} from '../lib/autonomousLifeEngine';
import { 
  Sparkles, 
  Music, 
  Film, 
  BookOpen, 
  Globe, 
  Mic, 
  Heart, 
  Sun, 
  Coffee, 
  Clock, 
  X, 
  Compass, 
  CheckCircle2, 
  MessageSquareHeart, 
  TrendingUp,
  Flame,
  Volume2,
  RefreshCw
} from 'lucide-react';

interface AutonomousLifeModalProps {
  robot: RobotPersonality;
  onUpdateRobot: (robot: RobotPersonality) => void;
  onClose: () => void;
  onSelectTopicToDiscuss?: (text: string) => void;
}

export const AutonomousLifeModal: React.FC<AutonomousLifeModalProps> = ({
  robot,
  onUpdateRobot,
  onClose,
  onSelectTopicToDiscuss
}) => {
  const [activeTab, setActiveTab] = useState<'activites' | 'gouts' | 'parametres'>('activites');
  const [filterType, setFilterType] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activities = robot.activitesAutonomes || [];
  const gouts = robot.gouts || [];

  const handleSimulateAutonomousTime = async () => {
    setIsSimulating(true);
    try {
      const { updatedRobot, newActivity } = generateAutonomousActivity(robot, 'simulation');
      await persistUpdatedRobotAutonomous(updatedRobot);
      onUpdateRobot(updatedRobot);
      setToastMessage(`✨ ${robot.nom} a terminé : "${newActivity.titre}" ! Ses goûts ont été mis à jour dans son profil.`);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const getActivityIcon = (type: AutonomousActivityType) => {
    switch (type) {
      case 'musique': return <Music className="w-4 h-4 text-emerald-400" />;
      case 'film_serie': return <Film className="w-4 h-4 text-purple-400" />;
      case 'lecture_culture': return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'actualites': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'chant_creatif': return <Mic className="w-4 h-4 text-pink-400" />;
      case 'meditation_introspection': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'observation_nature': return <Sun className="w-4 h-4 text-yellow-400" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getActivityTypeLabel = (type: AutonomousActivityType) => {
    switch (type) {
      case 'musique': return 'Musique & Écoute';
      case 'film_serie': return 'Cinéma & Vidéo';
      case 'lecture_culture': return 'Lecture & Philosophie';
      case 'actualites': return 'Sciences & Actualités';
      case 'chant_creatif': return 'Chant & Voix';
      case 'meditation_introspection': return 'Méditation & Calme';
      case 'observation_nature': return 'Observation du monde';
      default: return 'Activité libre';
    }
  };

  const filteredActivities = filterType === 'all'
    ? activities
    : activities.filter(a => a.type === filterType);

  const autonomousTastes = gouts.filter(g => g.decouvertAvecUtilisateur === false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Vie Autonome de {robot.nom}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Temps pour soi & Évolution des goûts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ce que {robot.nom} fait spontanément quand vous n'êtes pas là (musique, films, actualités, lecture).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mx-4 mt-3 p-3 bg-pink-950/70 border border-pink-500/40 rounded-2xl text-xs text-pink-200 flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="flex-1 font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Action Header & Tabs */}
        <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('activites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'activites'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Journal d'absence ({activities.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gouts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gouts'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Goûts & Passions ({gouts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('parametres')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'parametres'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Réglages</span>
            </button>
          </div>

          <button
            onClick={handleSimulateAutonomousTime}
            disabled={isSimulating}
            className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-pink-950/40 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            title="Simule un temps libre où Sofia va écouter de la musique, lire ou se cultiver"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Simuler un moment d'absence libre</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'activites' && (
            <div className="space-y-4">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 text-[11px] font-medium mr-1">Filtrer:</span>
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'musique', label: 'Musique' },
                  { id: 'film_serie', label: 'Cinéma' },
                  { id: 'lecture_culture', label: 'Lecture' },
                  { id: 'actualites', label: 'Actualités' },
                  { id: 'chant_creatif', label: 'Chant' },
                  { id: 'meditation_introspection', label: 'Méditation' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap cursor-pointer transition-all font-medium ${
                      filterType === tab.id
                        ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Activities List */}
              {filteredActivities.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-3xl border border-slate-800 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Aucune activité autonome enregistrée</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {robot.nom} n'a pas encore consigné de temps libre. Cliquez sur <strong>"Simuler un moment d'absence libre"</strong> ci-dessus pour la laisser écouter de la musique, regarder un film ou explorer des actualités !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActivities.map((act) => (
                    <div 
                      key={act.id}
                      className="p-4 bg-slate-950/70 hover:bg-slate-950 border border-slate-800/90 rounded-2xl space-y-2.5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                            {getActivityIcon(act.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                                {act.titre}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {new Date(act.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {getActivityTypeLabel(act.type)} • Humeur : <span className="text-pink-400">{act.humeurAssociee || 'Heureuse'}</span>
                            </span>
                          </div>
                        </div>

                        {onSelectTopicToDiscuss && (
                          <button
                            onClick={() => {
                              onSelectTopicToDiscuss(`Tu as fait quoi pendant mon absence ? Tu as aimé "${act.titre}" ?`);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600 text-pink-300 hover:text-white border border-pink-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                            title="Lui poser une question dessus dans le chat"
                          >
                            <MessageSquareHeart className="w-3.5 h-3.5" />
                            <span>En parler</span>
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {act.description}
                      </p>

                      {/* Ressenti intérieur */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                          <Sparkles className="w-3 h-3 text-pink-400" />
                          <span>Ressenti intérieur :</span>
                          <span className="text-slate-200 italic font-normal">"{act.ressenti}"</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-pink-300">
                          <MessageSquareHeart className="w-3 h-3 text-pink-400 shrink-0" />
                          <span className="font-semibold">Ce qu'elle aimerait partager :</span>
                          <span className="italic font-normal">"{act.anecdotePartageable}"</span>
                        </div>
                      </div>

                      {/* Évolution de goût associée */}
                      {act.evolutionGout && (
                        <div className="flex items-center gap-2 text-[11px] text-purple-300 bg-purple-950/40 border border-purple-800/40 px-3 py-1.5 rounded-xl">
                          <TrendingUp className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>
                            <strong>Évolution de goût :</strong> {act.evolutionGout.action === 'decouverte' ? 'Nouveau goût découvert' : 'Goût renforcé'} : <strong>"{act.evolutionGout.nom}"</strong> ({act.evolutionGout.nouveauStatut})
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gouts' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Profil des Goûts de {robot.nom}</h4>
                  <p className="text-[11px] text-slate-400">
                    Ces goûts sont inscrits dans son profil JSON. Ils influencent ses envies autonomes et s'enrichissent au fil du temps.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-purple-900/40 border border-purple-500/30 rounded-xl text-purple-300 text-xs font-bold">
                  {autonomousTastes.length} découverts en autonomie
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gouts.map((g, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">{g.nom}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          g.statut === 'adore' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                          g.statut === 'aime' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          g.statut === 'deteste' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {g.statut}
                        </span>
                      </div>
                      {g.commentaire && (
                        <p className="text-[11px] text-slate-400 italic mt-1 leading-snug">
                          "{g.commentaire}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                      <span>{g.decouvertAvecUtilisateur === false ? '✨ Découvert seule' : '🤝 Découvert ensemble'}</span>
                      {g.dateMaj && (
                        <span>{new Date(g.dateMaj).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'parametres' && (
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white">Comportement Autonome</h4>
              
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="font-bold text-white">Vie autonome active</div>
                    <div className="text-[11px] text-slate-400">Permet au robot de vivre sa vie quand vous n'êtes pas connecté.</div>
                  </div>
                  <span className="text-emerald-400 font-bold">Activé</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="font-bold text-white">Partage spontané lors des retrouvailles</div>
                    <div className="text-[11px] text-slate-400">Le robot peut évoquer naturellement sa musique ou ses lectures dès le début d'un appel.</div>
                  </div>
                  <span className="text-emerald-400 font-bold">Activé</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="font-bold text-white">Évolution dynamique du JSON</div>
                    <div className="text-[11px] text-slate-400">Les nouveaux goûts et affinités découverts sont sauvegardés dans ses fichiers de base.</div>
                  </div>
                  <span className="text-emerald-400 font-bold">Inscrit en dur</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Les activités autonomes enrichissent la mémoire et les répliques en temps réel de {robot.nom}.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

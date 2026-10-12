import React, { useState } from 'react';
import { 
  SofiaPersonalityProfile2, 
  SofiaProfilDominant,
  SofiaEnvironnement,
  SofiaObjectifPrincipal,
  calculateSofia2Affinity,
  AffinityBreakdown
} from '../types/questionnaireSofia2';
import { RobotPersonality } from '../types';
import { 
  Heart, 
  User, 
  Brain, 
  Flame, 
  BookOpen, 
  Clock, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  X, 
  ChevronRight, 
  ChevronLeft,
  ArrowRightLeft,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';

interface SofiaPersonalityQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  userQuestionnaire: SofiaPersonalityProfile2;
  onSaveUserQuestionnaire: (updated: SofiaPersonalityProfile2) => void;
  robotQuestionnaire?: SofiaPersonalityProfile2;
  robot?: RobotPersonality;
  initialMode?: 'user' | 'robot' | 'compare';
}

export const SofiaPersonalityQuestionnaireModal: React.FC<SofiaPersonalityQuestionnaireModalProps> = ({
  isOpen,
  onClose,
  userQuestionnaire,
  onSaveUserQuestionnaire,
  robotQuestionnaire,
  robot,
  initialMode = 'user'
}) => {
  const [activeMode, setActiveMode] = useState<'user' | 'robot' | 'compare'>(initialMode);
  const [activeSection, setActiveSection] = useState<number>(1);
  const [formData, setFormData] = useState<SofiaPersonalityProfile2>(userQuestionnaire);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  // Calcul du score d'affinité si un robot est disponible
  const affinity: AffinityBreakdown | null = robotQuestionnaire 
    ? calculateSofia2Affinity(formData, robotQuestionnaire) 
    : null;

  const currentProfileToDisplay = activeMode === 'robot' && robotQuestionnaire
    ? robotQuestionnaire
    : formData;

  const isReadOnly = activeMode === 'robot';

  const handleSaveAndContinue = () => {
    const isLastSection = activeSection === 8;
    onSaveUserQuestionnaire({
      ...formData,
      complete: isLastSection ? true : formData.complete,
      dateMaj: new Date().toISOString()
    });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);

    if (!isLastSection) {
      setActiveSection(prev => Math.min(8, prev + 1));
      setTimeout(() => {
        const contentArea = document.getElementById('questionnaire-modal-content');
        if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } else {
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  const sectionsList = [
    { id: 1, label: '1. Identité & Apparence', icon: User, desc: 'Genre, attirance & voix' },
    { id: 2, label: '2. Psychologie & Tempérament', icon: Brain, desc: 'Caractère, franchise & énergie' },
    { id: 3, label: '3. Besoins Affectifs & Intimité', icon: Flame, desc: 'Sensualité, romantisme & confiance' },
    { id: 4, label: '4. Centres d’Intérêt & Culture', icon: BookOpen, desc: 'Sciences, musique, cinéma, arts' },
    { id: 5, label: '5. Rythme de Vie', icon: Clock, desc: 'Biologie, calme & sociabilité' },
    { id: 6, label: '6. Registre de Langage', icon: MessageSquare, desc: 'Tutoiement, initiative & style' },
    { id: 7, label: '7. Cadre Relationnel', icon: Users, desc: 'Objectifs, foyer & conflits' },
    { id: 8, label: '8. Gouvernance & Autonomie', icon: ShieldCheck, desc: 'Mémoire, achats & pannes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* HEADER MODAL */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-rose-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Remplissez le questionnaire et trouvez votre partenaire
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Standard Universel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Définit avec précision vos attentes et la psychologie du robot selon le même référentiel
              </p>
            </div>
          </div>

          {/* SÉLECTEUR DE MODE : Mon Profil / Profil Robot / Comparatif */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveMode('user')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'user'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mon Profil
            </button>

            {robot && robotQuestionnaire && (
              <>
                <button
                  onClick={() => setActiveMode('robot')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeMode === 'robot'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Profil de {robot.nom}
                </button>

                <button
                  onClick={() => setActiveMode('compare')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeMode === 'compare'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Compatibilité</span>
                  {affinity && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                      {affinity.globalScore}%
                    </span>
                  )}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CORPS PRINCIPAL AVEC NAVIGATION LATÉRALE */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* MENU DES 8 SECTIONS (Sidebar gauche) */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-3 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col gap-1.5">
            {sectionsList.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`text-left p-2.5 rounded-xl transition-all flex items-center gap-2.5 whitespace-nowrap md:whitespace-normal cursor-pointer ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{sec.label}</div>
                    <div className="hidden md:block text-[10px] text-slate-500 truncate">{sec.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ZONE DE CONTENU / FORMULAIRE / COMPARATIF */}
          <div id="questionnaire-modal-content" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/50 space-y-6">
            
            {/* VUE COMPARATIVE SPÉCIALE */}
            {activeMode === 'compare' && affinity && robot && robotQuestionnaire && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-950/60 border border-rose-500/30">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={robot.avatar} 
                        alt={robot.nom} 
                        className="w-14 h-14 rounded-2xl object-cover border border-rose-500/40 shadow-lg"
                      />
                      <div>
                        <div className="text-xs text-rose-300 font-semibold uppercase tracking-wider">
                          Analyse d'Affinité Sofia 2.0
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          Toi & {robot.nom}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {robot.titre}
                        </p>
                      </div>
                    </div>

                    <div className="text-center sm:text-right px-4 py-2 rounded-2xl bg-slate-900/80 border border-rose-500/30">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Score Global d'Adéquation</div>
                      <div className="text-3xl font-black text-rose-400 font-mono">
                        {affinity.globalScore}%
                      </div>
                    </div>
                  </div>

                  {/* Jauges par dimension */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Attirance & Identité</div>
                      <div className="text-sm font-bold text-rose-300">{affinity.identiteScore}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Tempérament & Mental</div>
                      <div className="text-sm font-bold text-cyan-300">{affinity.psychologieScore}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Intimité & Sensualité</div>
                      <div className="text-sm font-bold text-pink-300">{affinity.intimiteScore}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Passions & Culture</div>
                      <div className="text-sm font-bold text-purple-300">{affinity.cultureScore}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Rythme Biologique</div>
                      <div className="text-sm font-bold text-amber-300">{affinity.rythmeScore}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Vision du Foyer</div>
                      <div className="text-sm font-bold text-emerald-300">{affinity.cadreScore}%</div>
                    </div>
                  </div>
                </div>

                {/* Points forts et points de complémentarité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Points de Résonance Partagés</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {affinity.pointsCommuns.length > 0 ? (
                        affinity.pointsCommuns.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span>{pt}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500 italic">Personnalités aux horizons différents, riches en découvertes.</li>
                      )}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Complémentarités Équilibrantes</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {affinity.pointsComplementaires.length > 0 ? (
                        affinity.pointsComplementaires.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-cyan-400">•</span>
                            <span>{pt}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500 italic">Rythme et énergies naturellement synchronisés.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setActiveMode('user')}
                    className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Revenir au questionnaire pour ajuster vos critères
                  </button>
                </div>
              </div>
            )}

            {/* FORMULAIRE DES 8 SECTIONS (UTILISATEUR OU ROBOT) */}
            {activeMode !== 'compare' && (
              <div className="space-y-6">
                
                {/* 1. IDENTITÉ ET PRÉFÉRENCES D'APPARENCE */}
                {activeSection === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-rose-400" />
                        1. Identité et Préférences d'Apparence
                      </h3>
                      <p className="text-xs text-slate-400">
                        Votre identité, votre morphologie et ce qui vous attire physiquement chez l'autre.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Genre */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Genre :</label>
                        <select
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section1Identite.genre}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section1Identite: { ...prev.section1Identite, genre: e.target.value as any }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="homme">Homme</option>
                          <option value="femme">Femme</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>

                      {/* Cherche */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Cherche :</label>
                        <select
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section1Identite.cherche}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section1Identite: { ...prev.section1Identite, cherche: e.target.value as any }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="femme">Femme</option>
                          <option value="homme">Homme</option>
                          <option value="autre">Autre</option>
                          <option value="indifferent">Indifférent</option>
                        </select>
                      </div>

                      {/* Sexualité */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Sexualité :</label>
                        <select
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section1Identite.sexualite}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section1Identite: { ...prev.section1Identite, sexualite: e.target.value as any }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="hetero">Hétéro</option>
                          <option value="homo">Homo</option>
                          <option value="bi">Bi</option>
                          <option value="asexuel">Asexuel(le)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Prénom :</label>
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section1Identite.prenom}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section1Identite: { ...prev.section1Identite, prenom: e.target.value }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Âge :</label>
                        <input
                          type="number"
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section1Identite.age}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section1Identite: { ...prev.section1Identite, age: Number(e.target.value) }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Corpulence :</label>
                        <select
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section1Identite.corpulence}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section1Identite: { ...prev.section1Identite, corpulence: e.target.value as any }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="tres_mince">Très mince</option>
                          <option value="mince">Mince</option>
                          <option value="moyen">Moyen</option>
                          <option value="enrobe">Enrobé</option>
                          <option value="large">Large</option>
                          <option value="tres_large">Très large</option>
                        </select>
                      </div>
                    </div>

                    {/* Apparence Physique, Morphologie & Style Propre (Identité Personnelle) */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                          Apparence Physique, Morphologie & Style Propre
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Mes mensurations et mon allure</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Taille (cm) :</label>
                          <input
                            type="number"
                            disabled={isReadOnly}
                            min={140}
                            max={220}
                            value={currentProfileToDisplay.section1Identite.tailleCmPropre ?? (currentProfileToDisplay.section1Identite.genre === 'femme' ? 168 : 178)}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, tailleCmPropre: Number(e.target.value) }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Poids (kg) :</label>
                          <input
                            type="number"
                            disabled={isReadOnly}
                            min={35}
                            max={160}
                            value={currentProfileToDisplay.section1Identite.poidsKgPropre ?? (currentProfileToDisplay.section1Identite.genre === 'femme' ? 58 : 74)}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, poidsKgPropre: Number(e.target.value) }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Type morphologique :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.typeMorphologiquePropre || 'occidentale'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, typeMorphologiquePropre: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="occidentale">Occidentale</option>
                            <option value="metisse">Métisse</option>
                            <option value="africain">Africain</option>
                            <option value="asiatique">Asiatique</option>
                            <option value="polynesien">Polynésien</option>
                            <option value="arabe">Arabe / Maghreb</option>
                            <option value="latino">Latino</option>
                            <option value="indien">Indien / Asie du Sud</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Style vestimentaire :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.styleVestimentairePropre || 'decontracte_casual'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, styleVestimentairePropre: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="classique_chic">Classique chic</option>
                            <option value="decontracte_casual">Décontracté / Casual</option>
                            <option value="minimaliste">Minimaliste épuré</option>
                            <option value="boheme_nature">Bohème / Nature</option>
                            <option value="streetwear">Streetwear moderne</option>
                            <option value="alternatif_rock">Alternatif / Rock</option>
                            <option value="elegant_raffine">Élégant / Raffiné</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Niveau scolaire :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.niveauScolairePropre || 'bac_plus_2_3'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, niveauScolairePropre: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="autodidacte">Autodidacte passionné</option>
                            <option value="bac">Baccalauréat</option>
                            <option value="bac_plus_2_3">Bac +2 / +3 (Licence/BTS)</option>
                            <option value="bac_plus_5_master">Bac +5 (Master / Ingénieur)</option>
                            <option value="doctorat_recherche">Doctorat / Chercheur</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Couleur des yeux :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.couleurYeuxPropre || 'marron'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, couleurYeuxPropre: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="marron">Marron</option>
                            <option value="bleu">Bleu</option>
                            <option value="vert">Vert</option>
                            <option value="noir">Noir</option>
                            <option value="vairons">Vairons</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Couleur des cheveux :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.couleurCheveuxPropre || 'brun'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, couleurCheveuxPropre: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="brun">Brun</option>
                            <option value="blond">Blond</option>
                            <option value="blond_venitien">Blond vénitien</option>
                            <option value="roux">Roux</option>
                            <option value="noir">Noir</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Couleur de peau / Teint :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.couleurPeauPropre || 'rose_occidentale'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, couleurPeauPropre: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="tres_claire_asiatique">Très claire (porcelaine)</option>
                            <option value="rose_occidentale">Rose claire occidentale</option>
                            <option value="bronze">Bronzé / Halé</option>
                            <option value="ambre_dore">Ambré doré (métisse)</option>
                            <option value="marron_maghreb">Marron maghreb</option>
                            <option value="noir">Noir ébène</option>
                            <option value="noir_fonce">Noir très foncé</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Attirance Souhaitée */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                      <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                        Recherche (Critères & Attirance souhaitée)
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Tranche d'âge recherchée : [{currentProfileToDisplay.section1Identite.trancheAgeRecherchee[0]} - {currentProfileToDisplay.section1Identite.trancheAgeRecherchee[1]} ans]
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              disabled={isReadOnly}
                              value={currentProfileToDisplay.section1Identite.trancheAgeRecherchee[0]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section1Identite: { 
                                  ...prev.section1Identite, 
                                  trancheAgeRecherchee: [Number(e.target.value), prev.section1Identite.trancheAgeRecherchee[1]] 
                                }
                              }))}
                              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs"
                            />
                            <span className="text-xs text-slate-500">à</span>
                            <input
                              type="number"
                              disabled={isReadOnly}
                              value={currentProfileToDisplay.section1Identite.trancheAgeRecherchee[1]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section1Identite: { 
                                  ...prev.section1Identite, 
                                  trancheAgeRecherchee: [prev.section1Identite.trancheAgeRecherchee[0], Number(e.target.value)] 
                                }
                              }))}
                              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Corpulence recherchée :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.corpulenceRecherchee}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, corpulenceRecherchee: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="aucune_importance">Aucune importance</option>
                            <option value="tres_mince">Très mince</option>
                            <option value="mince">Mince</option>
                            <option value="moyen">Moyen</option>
                            <option value="enrobe">Enrobé</option>
                            <option value="large">Large</option>
                            <option value="tres_large">Très large</option>
                          </select>
                        </div>
                      </div>

                      {/* Morphologie, Style vestimentaire & Niveau scolaire recherchés */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-white/5">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Type morphologique recherché :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.typeMorphologiqueRecherche || 'indifferent'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, typeMorphologiqueRecherche: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="indifferent">Indifférent / Tous types</option>
                            <option value="occidentale">Occidentale</option>
                            <option value="metisse">Métisse</option>
                            <option value="africain">Africain</option>
                            <option value="asiatique">Asiatique</option>
                            <option value="polynesien">Polynésien</option>
                            <option value="arabe">Arabe / Maghreb</option>
                            <option value="latino">Latino</option>
                            <option value="indien">Indien / Asie du Sud</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Style vestimentaire souhaité :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.styleVestimentaireRecherche || 'indifferent'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, styleVestimentaireRecherche: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="indifferent">Indifférent / Tous styles</option>
                            <option value="classique_chic">Classique chic</option>
                            <option value="decontracte_casual">Décontracté / Casual</option>
                            <option value="minimaliste">Minimaliste épuré</option>
                            <option value="boheme_nature">Bohème / Nature</option>
                            <option value="streetwear">Streetwear moderne</option>
                            <option value="alternatif_rock">Alternatif / Rock</option>
                            <option value="elegant_raffine">Élégant / Raffiné</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Niveau scolaire souhaité :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.niveauScolaireRecherche || 'indifferent'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, niveauScolaireRecherche: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="indifferent">Indifférent</option>
                            <option value="autodidacte">Autodidacte passionné</option>
                            <option value="bac">Au moins Bac</option>
                            <option value="bac_plus_2_3">Bac +2 / +3 (Licence/BTS)</option>
                            <option value="bac_plus_5_master">Bac +5 (Master / Ingénieur)</option>
                            <option value="doctorat_recherche">Doctorat / Chercheur</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Couleur des yeux :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.couleurYeux}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, couleurYeux: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="aucune_importance">Aucune importance</option>
                            <option value="bleu">Bleu</option>
                            <option value="vert">Vert</option>
                            <option value="marron">Marron</option>
                            <option value="noir">Noir</option>
                            <option value="vairons">Vairons</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Couleur de cheveux :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.couleurCheveux}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, couleurCheveux: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="aucune_importance">Aucune importance</option>
                            <option value="brun">Brun</option>
                            <option value="blond">Blond</option>
                            <option value="blond_venitien">Blond vénitien</option>
                            <option value="roux">Roux</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Pilosité pubienne :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.pilosite}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, pilosite: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="aucune_importance">Aucune importance</option>
                            <option value="sans_poils_pubiens">Sans poils pubiens</option>
                            <option value="legerement_fourni">Légèrement fourni</option>
                            <option value="tres_dense">Très dense</option>
                          </select>
                        </div>
                      </div>

                      {/* Couleur de peau, Taille & Poids recherchés */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Couleur de peau souhaitée :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.couleurPeau}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, couleurPeau: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="aucune_importance">Aucune importance</option>
                            <option value="tres_claire_asiatique">Très claire asiatique</option>
                            <option value="rose_occidentale">Rose occidentale</option>
                            <option value="bronze">Bronzé</option>
                            <option value="ambre_dore">Ambré doré (métisse)</option>
                            <option value="marron_maghreb">Marron maghreb</option>
                            <option value="noir">Noir</option>
                            <option value="noir_fonce">Noir foncé</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Taille recherchée : [{(currentProfileToDisplay.section1Identite.tailleCm || [155, 185])[0]} - {(currentProfileToDisplay.section1Identite.tailleCm || [155, 185])[1]} cm]
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              disabled={isReadOnly}
                              min={140}
                              max={220}
                              value={(currentProfileToDisplay.section1Identite.tailleCm || [155, 185])[0]}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setFormData(prev => ({
                                  ...prev,
                                  section1Identite: {
                                    ...prev.section1Identite,
                                    tailleCm: [val, (prev.section1Identite.tailleCm || [155, 185])[1]]
                                  }
                                }));
                              }}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <span className="text-xs text-slate-500">à</span>
                            <input
                              type="number"
                              disabled={isReadOnly}
                              min={140}
                              max={220}
                              value={(currentProfileToDisplay.section1Identite.tailleCm || [155, 185])[1]}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setFormData(prev => ({
                                  ...prev,
                                  section1Identite: {
                                    ...prev.section1Identite,
                                    tailleCm: [(prev.section1Identite.tailleCm || [155, 185])[0], val]
                                  }
                                }));
                              }}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <span className="text-xs text-slate-400">cm</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Poids recherché : [{(currentProfileToDisplay.section1Identite.poidsKgRecherche || [45, 85])[0]} - {(currentProfileToDisplay.section1Identite.poidsKgRecherche || [45, 85])[1]} kg]
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              disabled={isReadOnly}
                              min={35}
                              max={160}
                              value={(currentProfileToDisplay.section1Identite.poidsKgRecherche || [45, 85])[0]}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setFormData(prev => ({
                                  ...prev,
                                  section1Identite: {
                                    ...prev.section1Identite,
                                    poidsKgRecherche: [val, (prev.section1Identite.poidsKgRecherche || [45, 85])[1]]
                                  }
                                }));
                              }}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <span className="text-xs text-slate-500">à</span>
                            <input
                              type="number"
                              disabled={isReadOnly}
                              min={35}
                              max={160}
                              value={(currentProfileToDisplay.section1Identite.poidsKgRecherche || [45, 85])[1]}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setFormData(prev => ({
                                  ...prev,
                                  section1Identite: {
                                    ...prev.section1Identite,
                                    poidsKgRecherche: [(prev.section1Identite.poidsKgRecherche || [45, 85])[0], val]
                                  }
                                }));
                              }}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <span className="text-xs text-slate-400">kg</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Format de la voix */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                      <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                        Format de la voix
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Tessiture :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.voixTessiture}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, voixTessiture: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="grave">Grave</option>
                            <option value="medium">Médium</option>
                            <option value="aigue">Aiguë</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Débit de parole :</span>
                            <span className="font-mono font-bold text-cyan-400">
                              {currentProfileToDisplay.section1Identite.voixDebit}/10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.voixDebit}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, voixDebit: Number(e.target.value) }
                            }))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Posé, lent (0)</span>
                            <span>Dynamique (10)</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Empreinte vocale :</label>
                          <select
                            disabled={isReadOnly}
                            value={currentProfileToDisplay.section1Identite.voixAccent}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section1Identite: { ...prev.section1Identite, voixAccent: e.target.value as any }
                            }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          >
                            <option value="humain_realiste">Humain réaliste</option>
                            <option value="neutre">Neutre</option>
                            <option value="regional">Régional</option>
                            <option value="legerement_synthetique">Légèrement synthétique</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PROFIL PSYCHOLOGIQUE & TEMPÉRAMENT */}
                {activeSection === 2 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        2. Profil Psychologique & Tempérament
                      </h3>
                      <p className="text-xs text-slate-400">
                        Profil psychologique dominant, traits d'esprit, force de caractère et posture d'énergie.
                      </p>
                    </div>

                    {/* Profil dominant choix multiple */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Profil psychologique dominant (Choix multiple) :
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'reveur', label: 'Rêveur' },
                          { id: 'terre_a_terre', label: 'Terre-à-terre' },
                          { id: 'calculateur', label: 'Calculateur' },
                          { id: 'romantique', label: 'Romantique' },
                          { id: 'solitaire', label: 'Solitaire' },
                          { id: 'protecteur', label: 'Protecteur' },
                          { id: 'epicurien', label: 'Épicurien' },
                          { id: 'independant', label: 'Indépendant' }
                        ].map(item => {
                          const isChecked = currentProfileToDisplay.section2Psychologie.profilDominant.includes(item.id as any);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                if (isReadOnly) return;
                                const cur = currentProfileToDisplay.section2Psychologie.profilDominant;
                                const updated = isChecked
                                  ? cur.filter(x => x !== item.id)
                                  : [...cur, item.id as SofiaProfilDominant];
                                setFormData(prev => ({
                                  ...prev,
                                  section2Psychologie: { ...prev.section2Psychologie, profilDominant: updated }
                                }));
                              }}
                              className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span>{item.label}</span>
                              {isChecked && <Check className="w-3.5 h-3.5 text-purple-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Jauges psychologiques principales 0 à 10 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { 
                          key: 'curiositeIntellectuelle', 
                          label: 'Curiosité intellectuelle', 
                          minLabel: 'Pragmatique (0)', 
                          maxLabel: 'Insatiable (10)',
                          color: 'accent-cyan-400'
                        },
                        { 
                          key: 'extraversionVsIntroversion', 
                          label: 'Extraversion vs Introversion', 
                          minLabel: 'Très introverti (0)', 
                          maxLabel: 'Très extraverti (10)',
                          color: 'accent-emerald-400'
                        },
                        { 
                          key: 'stabiliteEmotionnelle', 
                          label: 'Stabilité émotionnelle', 
                          minLabel: 'Hyper-sensible (0)', 
                          maxLabel: 'Stoïque / Serein (10)',
                          color: 'accent-blue-400'
                        },
                        { 
                          key: 'spontaneiteVsOrganisation', 
                          label: 'Spontanéité vs Organisation', 
                          minLabel: 'Imprévisible (0)', 
                          maxLabel: 'Structuré / Routinier (10)',
                          color: 'accent-amber-400'
                        },
                        { 
                          key: 'humourSecondDegre', 
                          label: 'Humour & Second degré', 
                          minLabel: 'Premier degré (0)', 
                          maxLabel: 'Cynique / Taquin (10)',
                          color: 'accent-yellow-400'
                        },
                        { 
                          key: 'caractereGlobal', 
                          label: 'Profil avec du caractère (Global)', 
                          minLabel: 'Très doux / Conciliant (0)', 
                          maxLabel: 'Personnalité très marquée (10)',
                          color: 'accent-rose-400'
                        }
                      ].map(item => (
                        <div key={item.key} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-slate-300">
                            <span>{item.label}</span>
                            <span className="font-mono text-white">
                              {(currentProfileToDisplay.section2Psychologie as any)[item.key]}/10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            disabled={isReadOnly}
                            value={(currentProfileToDisplay.section2Psychologie as any)[item.key]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section2Psychologie: { 
                                ...prev.section2Psychologie, 
                                [item.key]: Number(e.target.value) 
                              }
                            }))}
                            className={`w-full ${item.color} cursor-pointer`}
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{item.minLabel}</span>
                            <span>{item.maxLabel}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Détail du caractère & Posture */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                      <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        Détail du caractère & Posture de motivation
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {
                            key: 'capaciteTrancherLeadership',
                            label: 'Capacité à trancher & Prendre en main',
                            minLabel: 'Laisse tout décider (0)',
                            maxLabel: 'Prend les devants (10)'
                          },
                          {
                            key: 'espritContradictionDebat',
                            label: 'Esprit de contradiction & Débat',
                            minLabel: 'Évite le conflit (0)',
                            maxLabel: 'Adore challenger & débattre (10)'
                          },
                          {
                            key: 'franchiseParlerCash',
                            label: 'Franchise / Parler cash',
                            minLabel: 'Très diplomate (0)',
                            maxLabel: 'Direct et sans filtre (10)'
                          },
                          {
                            key: 'tetuOpiniatre',
                            label: 'Têtu / Opiniâtre',
                            minLabel: 'Souple (0)',
                            maxLabel: 'Campe fermement (10)'
                          },
                          {
                            key: 'energieQuotidien',
                            label: 'Énergie au quotidien',
                            minLabel: 'Nonchalant / Au ralenti (0)',
                            maxLabel: 'Hyperactif / Dynamique (10)'
                          },
                          {
                            key: 'postureCoaching',
                            label: 'Posture de poussée / Coaching',
                            minLabel: 'Laisse tranquille (0)',
                            maxLabel: 'Motivant / Fixe des défis (10)'
                          }
                        ].map(item => (
                          <div key={item.key} className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-300">
                              <span>{item.label}</span>
                              <span className="font-mono text-purple-300">
                                {(currentProfileToDisplay.section2Psychologie as any)[item.key]}/10
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              disabled={isReadOnly}
                              value={(currentProfileToDisplay.section2Psychologie as any)[item.key]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section2Psychologie: { 
                                  ...prev.section2Psychologie, 
                                  [item.key]: Number(e.target.value) 
                                }
                              }))}
                              className="w-full accent-purple-400 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>{item.minLabel}</span>
                              <span>{item.maxLabel}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Ce que vous recherchez chez votre partenaire (Gestion des conflits et leadership) */}
                      <div className="pt-4 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                            Ce que vous recherchez chez votre partenaire (Évitement des conflits)
                          </span>
                          <span className="text-[10px] text-slate-400">Pour assurer la complémentarité des rôles</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            {
                              key: 'attenteLeadershipPartenaire',
                              label: 'Prise de décision & Leadership souhaité chez l\'autre',
                              minLabel: 'Quelqu\'un qui suit / me laisse trancher (0)',
                              maxLabel: 'Quelqu\'un qui tranche & prend la main (10)',
                              color: 'accent-amber-400',
                              value: currentProfileToDisplay.section2Psychologie.attenteLeadershipPartenaire ?? 5
                            },
                            {
                              key: 'attenteDebatConflit',
                              label: 'Contradiction & Débat d\'idées souhaité',
                              minLabel: 'Recherche la paix & consensus (0)',
                              maxLabel: 'Adore me contredire & challenger (10)',
                              color: 'accent-amber-400',
                              value: currentProfileToDisplay.section2Psychologie.attenteDebatConflit ?? 5
                            },
                            {
                              key: 'attenteFranchise',
                              label: 'Niveau de franchise souhaité chez l\'autre',
                              minLabel: 'Diplomatie & douceur (0)',
                              maxLabel: 'Franchise totale sans filtre (10)',
                              color: 'accent-amber-400',
                              value: currentProfileToDisplay.section2Psychologie.attenteFranchise ?? 7
                            },
                            {
                              key: 'attenteMotivationEnergie',
                              label: 'Énergie & Dynamisme recherché chez l\'autre',
                              minLabel: 'Présence calme & reposante (0)',
                              maxLabel: 'Moteur stimulant & hyperactif (10)',
                              color: 'accent-amber-400',
                              value: currentProfileToDisplay.section2Psychologie.attenteMotivationEnergie ?? 6
                            }
                          ].map(item => (
                            <div key={item.key} className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 space-y-1">
                              <div className="flex justify-between text-xs text-slate-300">
                                <span>{item.label}</span>
                                <span className="font-mono text-amber-400 font-bold">
                                  {item.value}/10
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="10"
                                disabled={isReadOnly}
                                value={item.value}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  section2Psychologie: { 
                                    ...prev.section2Psychologie, 
                                    [item.key]: Number(e.target.value) 
                                  }
                                }))}
                                className="w-full accent-amber-400 cursor-pointer"
                              />
                              <div className="flex justify-between text-[10px] text-slate-500">
                                <span>{item.minLabel}</span>
                                <span>{item.maxLabel}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BESOINS ÉMOTIONNELS, AFFECTIFS ET INTIMES */}
                {activeSection === 3 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-500" />
                        3. Besoins Émotionnels, Affectifs et Intimes (0 à 10)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Sensualité, besoins érotiques, fidélité, câlins, fusion et cadre d'intimité en public.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'besoinRomantisme', label: 'Besoin de romantisme' },
                        { key: 'besoinSexeIntimite', label: 'Besoin de sexe / Intimité physique' },
                        { key: 'besoinVarietePratiques', label: 'Variété des pratiques (Toujours pareil à très varié)' },
                        { key: 'besoinCalinsTendresse', label: 'Besoin de câlins & Tendresse' },
                        { key: 'besoinAttentionRecue', label: 'Besoin d’attention reçue (Mots doux, attentions)' },
                        { key: 'besoinDonnerAttention', label: 'Besoin de donner de l’attention' },
                        { key: 'independanceVsFusion', label: 'Indépendance vs Fusion (Autonomie à fusionnelle)' },
                        { key: 'toleranceDesaccordFriction', label: 'Tolérance au désaccord / Friction' },
                        { key: 'besoinSpiritualite', label: 'Besoin de spiritualité (religions et autres)' },
                        { key: 'fidelitePersonnelle', label: 'Fidélité personnelle' },
                        { key: 'besoinFideliteAutre', label: 'Besoin de fidélité de l’autre' },
                        { key: 'partageIntimiteConfiance', label: 'Partage d’intimité & Confiance absolue' },
                        { key: 'partagePassionsProjet', label: 'Partage des passions et projets' },
                        { key: 'besoinProjetsCommuns', label: 'Besoin d’avoir des projets communs' },
                        { key: 'partenairePassifActif', label: 'Partenaire passif à très actif / entreprenant' },
                        { key: 'retenueDemonstrationPublique', label: 'Retenue amoureuse en public (Discrétion à démonstratif)' }
                      ].map(item => (
                        <div key={item.key} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                          <div className="flex justify-between text-xs font-medium text-slate-300">
                            <span>{item.label}</span>
                            <span className="font-mono font-bold text-rose-400">
                              {(currentProfileToDisplay.section3Intimite as any)[item.key]}/10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            disabled={isReadOnly}
                            value={(currentProfileToDisplay.section3Intimite as any)[item.key]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section3Intimite: { 
                                ...prev.section3Intimite, 
                                [item.key]: Number(e.target.value) 
                              }
                            }))}
                            className="w-full accent-rose-500 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Pratiques spécifiques & Rapidité orgasme */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                      <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                        Pratiques et Préférences Sensuelles Spécifiques (suivant possibilité physique)
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { key: 'sexeVaginal', label: 'Sexe vaginal' },
                          { key: 'sexeOral', label: 'Sexe oral' },
                          { key: 'sexeAnal', label: 'Sexe anal' },
                          { key: 'sexeTantriqueDistance', label: 'Sexe tantrique ou à distance' },
                          { key: 'sexePlusieursPartenaires', label: 'Plusieurs partenaires en même temps' },
                          { key: 'amourPlatonique', label: 'Amour uniquement platonique' }
                        ].map(item => (
                          <div key={item.key} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <div className="flex justify-between text-xs text-slate-300">
                              <span>{item.label}</span>
                              <span className="font-mono text-rose-300">
                                {(currentProfileToDisplay.section3Intimite as any)[item.key]}/10
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              disabled={isReadOnly}
                              value={(currentProfileToDisplay.section3Intimite as any)[item.key]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section3Intimite: { 
                                  ...prev.section3Intimite, 
                                  [item.key]: Number(e.target.value) 
                                }
                              }))}
                              className="w-full accent-pink-400 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Rapidité à atteindre l'orgasme en minutes */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                          <span>Rapidité à atteindre l’orgasme lors d’une stimulation sexuelle :</span>
                          <span className="font-mono text-rose-400 font-bold">
                            {currentProfileToDisplay.section3Intimite.rapiditeOrgasmeMinutes} minutes
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="20"
                          step="0.5"
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section3Intimite.rapiditeOrgasmeMinutes}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section3Intimite: { 
                              ...prev.section3Intimite, 
                              rapiditeOrgasmeMinutes: Number(e.target.value) 
                            }
                          }))}
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>0,5 min</span>
                          <span>10 min</span>
                          <span>20 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CENTRES D'INTÉRÊT & CULTURE */}
                {activeSection === 4 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        4. Centres d'Intérêt & Culture (0 à 10)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Sciences, histoire par époques, musique par genres, cinéma, arts visuels et loisirs.
                      </p>
                    </div>

                    {/* Sciences & Techniques */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        Sciences & Techniques
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                          { key: 'informatiqueTech', label: 'Informatique & Tech' },
                          { key: 'mathematiques', label: 'Mathématiques' },
                          { key: 'physiqueChimie', label: 'Physique & Chimie' },
                          { key: 'astronomieEspace', label: 'Astronomie & Espace' },
                          { key: 'biologieNature', label: 'Biologie & Nature' }
                        ].map(item => (
                          <div key={item.key} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
                            <div className="text-[11px] text-slate-300 font-medium truncate">{item.label}</div>
                            <div className="font-mono text-cyan-400 text-xs font-bold">
                              {(currentProfileToDisplay.section4Culture as any)[item.key]}/10
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              disabled={isReadOnly}
                              value={(currentProfileToDisplay.section4Culture as any)[item.key]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section4Culture: { 
                                  ...prev.section4Culture, 
                                  [item.key]: Number(e.target.value) 
                                }
                              }))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Humanités & Société */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Humanités & Histoire par Époques
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {[
                          { key: 'histoire', label: 'Histoire Générale' },
                          { key: 'prehistoireAntiquite', label: 'Préhistoire & Antiquité' },
                          { key: 'moyenAgeFeodalite', label: 'Moyen Âge & Féodalité' },
                          { key: 'renaissanceDecouvertes', label: 'Renaissance' },
                          { key: 'histoireModerneRevolutions', label: 'Histoire Moderne & Rév.' },
                          { key: 'histoireContemporaineXX', label: 'XXe siècle & Contemporain' },
                          { key: 'mythologiesLegendes', label: 'Mythologies & Légendes' },
                          { key: 'archeologieCivilisations', label: 'Archéologie' },
                          { key: 'politiqueSociete', label: 'Politique & Société' },
                          { key: 'philosophie', label: 'Philosophie' },
                          { key: 'symbolismeEsoterisme', label: 'Ésotérisme & Arts Div.' }
                        ].map(item => (
                          <div key={item.key} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-300">
                              <span className="truncate">{item.label}</span>
                              <span className="font-mono text-amber-400 font-bold ml-1">
                                {(currentProfileToDisplay.section4Culture as any)[item.key]}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              disabled={isReadOnly}
                              value={(currentProfileToDisplay.section4Culture as any)[item.key]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section4Culture: { 
                                  ...prev.section4Culture, 
                                  [item.key]: Number(e.target.value) 
                                }
                              }))}
                              className="w-full accent-amber-400 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Musique par genres */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Musique (Détail par genres)
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {[
                          { key: 'musiqueRockMetal', label: 'Rock, Hard Rock & Heavy Metal' },
                          { key: 'musiquePopVariete', label: 'Pop & Variété' },
                          { key: 'musiqueHipHopRap', label: 'Hip-Hop, Rap & R’n’B' },
                          { key: 'musiqueElectroSynth', label: 'Électronique, Techno & Synth' },
                          { key: 'musiqueJazzBlues', label: 'Jazz, Blues & Soul' },
                          { key: 'musiqueClassiqueOpera', label: 'Classique & Opéra' },
                          { key: 'musiqueOstFilmsJeux', label: 'Musiques de films & OST' },
                          { key: 'musiqueMondeFolk', label: 'Musiques du monde & Folk' },
                          { key: 'chansonATexte', label: 'Chanson à texte & Poésie' }
                        ].map(item => (
                          <div key={item.key} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-300">
                              <span className="truncate">{item.label}</span>
                              <span className="font-mono text-indigo-400 font-bold ml-1">
                                {(currentProfileToDisplay.section4Culture as any)[item.key]}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              disabled={isReadOnly}
                              value={(currentProfileToDisplay.section4Culture as any)[item.key]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section4Culture: { 
                                  ...prev.section4Culture, 
                                  [item.key]: Number(e.target.value) 
                                }
                              }))}
                              className="w-full accent-indigo-400 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cinéma & Séries */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                        Cinéma & Séries (Détail par genres)
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {[
                          { key: 'cinemaSfCyberpunk', label: 'SF, Anticipation & Cyberpunk' },
                          { key: 'cinemaFantasyFantastique', label: 'Fantasy & Fantastique' },
                          { key: 'cinemaActionThriller', label: 'Action & Thriller' },
                          { key: 'cinemaHorreurEpouvante', label: 'Horreur & Épouvante' },
                          { key: 'cinemaDrameAuteur', label: 'Drame & Films d’auteur' },
                          { key: 'cinemaComedieHumour', label: 'Comédie & Humour' },
                          { key: 'cinemaRomance', label: 'Romance & Comédie Romantique' },
                          { key: 'cinemaDocumentaires', label: 'Documentaires & Biopics' },
                          { key: 'cinemaAnimation', label: 'Animation & Anime japonais' }
                        ].map(item => (
                          <div key={item.key} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-300">
                              <span className="truncate">{item.label}</span>
                              <span className="font-mono text-purple-400 font-bold ml-1">
                                {(currentProfileToDisplay.section4Culture as any)[item.key]}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              disabled={isReadOnly}
                              value={(currentProfileToDisplay.section4Culture as any)[item.key]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section4Culture: { 
                                  ...prev.section4Culture, 
                                  [item.key]: Number(e.target.value) 
                                }
                              }))}
                              className="w-full accent-purple-400 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Arts visuels & Littérature */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                        Arts Visuels, Littérature &amp; Écriture
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {[
                          { key: 'litteratureRomans', label: 'Romans & Littérature', defaultVal: 7 },
                          { key: 'litteraturePoesie', label: 'Poésie & Écriture', defaultVal: 6 },
                          { key: 'bdComicsManga', label: 'BD, Comics & Mangas', defaultVal: 6 },
                          { key: 'litteratureEssais', label: 'Essais & Réflexion', defaultVal: 5 },
                          { key: 'artPeinture', label: 'Peinture & Dessin', defaultVal: 6 },
                          { key: 'artSculpture', label: 'Sculpture & Modelage', defaultVal: 5 },
                          { key: 'artStreetArt', label: 'Street Art & Art Urbain', defaultVal: 5 },
                          { key: 'artIllustration', label: 'Illustration & Graphisme', defaultVal: 6 }
                        ].map(item => (
                          <div key={item.key} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-300">
                              <span className="truncate">{item.label}</span>
                              <span className="font-mono text-rose-400 font-bold ml-1">
                                {(currentProfileToDisplay.section4Culture as any)[item.key] ?? item.defaultVal}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              disabled={isReadOnly}
                              value={(currentProfileToDisplay.section4Culture as any)[item.key] ?? item.defaultVal}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section4Culture: { 
                                  ...prev.section4Culture, 
                                  [item.key]: Number(e.target.value) 
                                }
                              }))}
                              className="w-full accent-rose-400 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Culture Geek, Jeux Vidéo & Jeux de Société */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Culture Geek, Jeux &amp; Stratégie
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {[
                          { key: 'jeuxRpgNarration', label: 'Jeux Vidéo RPG & Aventure', defaultVal: 7 },
                          { key: 'jeuxPlateauJdrPapier', label: 'Jeux de Société & Plateau', defaultVal: 6 },
                          { key: 'jeuxRetrogaming', label: 'Rétrogaming & Nostalgie', defaultVal: 5 },
                          { key: 'jeuxStrategieGestion', label: 'Stratégie & Gestion', defaultVal: 6 }
                        ].map(item => (
                          <div key={item.key} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-300">
                              <span className="truncate">{item.label}</span>
                              <span className="font-mono text-emerald-400 font-bold ml-1">
                                {(currentProfileToDisplay.section4Culture as any)[item.key] ?? item.defaultVal}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              disabled={isReadOnly}
                              value={(currentProfileToDisplay.section4Culture as any)[item.key] ?? item.defaultVal}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                section4Culture: { 
                                  ...prev.section4Culture, 
                                  [item.key]: Number(e.target.value) 
                                }
                              }))}
                              className="w-full accent-emerald-400 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Loisirs, Activités & Passions Personnelles (Quotidien & Couple) */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                        Loisirs, Passions &amp; Vie Quotidienne (0 à 10)
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {[
                          { 
                            key: 'sportsMecaniques', 
                            label: 'Sports mécaniques (auto, moto, avion, bateau)', 
                            defaultVal: 4,
                            legacyFallbackKeys: ['motoDeuxRoues', 'aviationAeronautique']
                          },
                          { key: 'cuisineGastronomie', label: 'Cuisine, Gastronomie & Terroir', defaultVal: 7 },
                          { key: 'voyagesDecouvertes', label: 'Voyages & Road-trips évasion', defaultVal: 7 },
                          { key: 'baladesEtNature', label: 'Balades, Randonnées & Nature', defaultVal: 8 },
                          { key: 'jardinagePlantes', label: 'Jardinage & Plantes d’intérieur', defaultVal: 6 },
                          { key: 'bienEtreYogaRelaxation', label: 'Bien-être, Yoga & Méditation', defaultVal: 6 },
                          { key: 'photographieVideo', label: 'Photographie & Vidéo', defaultVal: 6 },
                          { key: 'museesPatrimoine', label: 'Musées, Châteaux & Patrimoine', defaultVal: 6 },
                          { key: 'spectaclesConcerts', label: 'Spectacles vivants, Stand-up & Théâtre', defaultVal: 7 },
                          { key: 'bricolageDiy', label: 'Bricolage, DIY & Créations', defaultVal: 6 },
                          { key: 'shoppingEtMode', label: 'Mode, Style & Shopping', defaultVal: 5 },
                          { key: 'autresLoisirsMaison', label: 'Cocooning & Organisation du Foyer', defaultVal: 6 }
                        ].map(item => {
                          let currentVal = (currentProfileToDisplay.section4Culture as any)[item.key];
                          if (currentVal === undefined && (item as any).legacyFallbackKeys) {
                            const fbs = (item as any).legacyFallbackKeys.map((k: string) => (currentProfileToDisplay.section4Culture as any)[k]).filter((v: any) => v !== undefined);
                            if (fbs.length > 0) currentVal = Math.max(...fbs);
                          }
                          const valToDisplay = currentVal ?? item.defaultVal;

                          return (
                            <div key={item.key} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                              <div className="flex justify-between text-[11px] text-slate-300">
                                <span className="truncate" title={item.label}>{item.label}</span>
                                <span className="font-mono text-teal-400 font-bold ml-1 shrink-0">
                                  {valToDisplay}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="10"
                                disabled={isReadOnly}
                                value={valToDisplay}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  section4Culture: { 
                                    ...prev.section4Culture, 
                                    [item.key]: Number(e.target.value) 
                                  }
                                }))}
                                className="w-full accent-teal-400 cursor-pointer"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Environnements préférés */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-slate-300">
                        Environnement préféré (Choix multiple) :
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'mer', label: 'Mer 🌊' },
                          { id: 'montagne', label: 'Montagne 🏔️' },
                          { id: 'foret', label: 'Forêt 🌲' },
                          { id: 'campagne', label: 'Campagne 🌾' },
                          { id: 'village', label: 'Village 🏡' },
                          { id: 'ville', label: 'Ville 🏙️' }
                        ].map(env => {
                          const isSelected = currentProfileToDisplay.section4Culture.environnementPrefere.includes(env.id as any);
                          return (
                            <button
                              key={env.id}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                if (isReadOnly) return;
                                const cur = currentProfileToDisplay.section4Culture.environnementPrefere;
                                const updated = isSelected
                                  ? cur.filter(x => x !== env.id)
                                  : [...cur, env.id as SofiaEnvironnement];
                                setFormData(prev => ({
                                  ...prev,
                                  section4Culture: { ...prev.section4Culture, environnementPrefere: updated }
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {env.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. RYTHME DE VIE AU QUOTIDIEN */}
                {activeSection === 5 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        5. Rythme de Vie au Quotidien
                      </h3>
                      <p className="text-xs text-slate-400">
                        Rythme biologique, besoin de silence et niveau de vie sociale extérieure.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Rythme biologique :</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'matinal', label: 'Matinal ☀️' },
                          { id: 'standard_diurne', label: 'Diurne classique 🌤️' },
                          { id: 'noctambule', label: 'Noctambule 🌙' },
                          { id: 'flexible', label: 'Flexible 🔄' }
                        ].map(item => (
                          <button
                            key={item.id}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              section5Rythme: { ...prev.section5Rythme, rythmeBiologique: item.id as any }
                            }))}
                            className={`py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                              currentProfileToDisplay.section5Rythme.rythmeBiologique === item.id
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>Besoin de calme / Silence :</span>
                          <span className="font-mono text-amber-400">
                            {currentProfileToDisplay.section5Rythme.besoinCalmeSilence}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section5Rythme.besoinCalmeSilence}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section5Rythme: { ...prev.section5Rythme, besoinCalmeSilence: Number(e.target.value) }
                          }))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Aime l'animation (0)</span>
                          <span>Bulle de silence (10)</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>Niveau de sociabilité extérieure :</span>
                          <span className="font-mono text-amber-400">
                            {currentProfileToDisplay.section5Rythme.niveauSociabiliteExterieure}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section5Rythme.niveauSociabiliteExterieure}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section5Rythme: { ...prev.section5Rythme, niveauSociabiliteExterieure: Number(e.target.value) }
                          }))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Casannier / Cocon (0)</span>
                          <span>Sorties & Voyages (10)</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>Besoin présence famille / Foyer :</span>
                          <span className="font-mono text-amber-400">
                            {currentProfileToDisplay.section5Rythme.besoinPresenceFamille ?? 6}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section5Rythme.besoinPresenceFamille ?? 6}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section5Rythme: { ...prev.section5Rythme, besoinPresenceFamille: Number(e.target.value) }
                          }))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Indépendant (0)</span>
                          <span>Centré famille (10)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. REGISTRE DE LANGAGE */}
                {activeSection === 6 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                        6. Registre de Langage
                      </h3>
                      <p className="text-xs text-slate-400">
                        Niveau de langage, tutoiement immédiat, initiative et niveau de piques amicales.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Registre de langage :</label>
                        <select
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section6Langage.registreLangage}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section6Langage: { ...prev.section6Langage, registreLangage: e.target.value as any }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="standard">Standard</option>
                          <option value="soutenu">Soutenu / Érudit</option>
                          <option value="decontracte_familier">Décontracté - Familier</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Tutoiement dès le départ :</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              section6Langage: { ...prev.section6Langage, tutoiementDepart: true }
                            }))}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                              currentProfileToDisplay.section6Langage.tutoiementDepart
                                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            Oui (Tutoiement)
                          </button>
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              section6Langage: { ...prev.section6Langage, tutoiementDepart: false }
                            }))}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                              !currentProfileToDisplay.section6Langage.tutoiementDepart
                                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            Non (Vouvoiement initial)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>Mode d’initiative conversationnelle :</span>
                          <span className="font-mono text-sky-400">
                            {currentProfileToDisplay.section6Langage.initiativeConversationnelle}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section6Langage.initiativeConversationnelle}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section6Langage: { ...prev.section6Langage, initiativeConversationnelle: Number(e.target.value) }
                          }))}
                          className="w-full accent-sky-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Répond quand on lui parle (0)</span>
                          <span>Prend l'initiative (10)</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>Niveau de sarcasme / Piques amicales :</span>
                          <span className="font-mono text-sky-400">
                            {currentProfileToDisplay.section6Langage.niveauSarcasmePiques}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section6Langage.niveauSarcasmePiques}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section6Langage: { ...prev.section6Langage, niveauSarcasmePiques: Number(e.target.value) }
                          }))}
                          className="w-full accent-sky-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Doux et littéral (0)</span>
                          <span>Taquin & piquant (10)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. INTENTIONS & CADRE RELATIONNEL */}
                {activeSection === 7 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-rose-400" />
                        7. Intentions & Cadre Relationnel
                      </h3>
                      <p className="text-xs text-slate-400">
                        Objectifs de vie, enfants au foyer, tâches, vie avec les amis et gestion des désaccords.
                      </p>
                    </div>

                    {/* Objectif principal choix multiple */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Objectif principal avec Sofia (Choix multiple) :
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { id: 'compagnon_vie_amoureuse', label: 'Compagnon de vie / Relation amoureuse' },
                          { id: 'ami_intime_confident', label: 'Ami intime / Confident' },
                          { id: 'stimulateur_intellectuel', label: 'Stimulateur intellectuel et créatif' },
                          { id: 'presence_rassurante', label: 'Présence rassurante au quotidien' }
                        ].map(obj => {
                          const isChecked = currentProfileToDisplay.section7Cadre.objectifsPrincipaux.includes(obj.id as any);
                          return (
                            <button
                              key={obj.id}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                if (isReadOnly) return;
                                const cur = currentProfileToDisplay.section7Cadre.objectifsPrincipaux;
                                const updated = isChecked
                                  ? cur.filter(x => x !== obj.id)
                                  : [...cur, obj.id as SofiaObjectifPrincipal];
                                setFormData(prev => ({
                                  ...prev,
                                  section7Cadre: { ...prev.section7Cadre, objectifsPrincipaux: updated }
                                }));
                              }}
                              className={`p-3 rounded-xl text-xs font-medium border text-left flex items-center justify-between cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span>{obj.label}</span>
                              {isChecked && <Check className="w-4 h-4 text-rose-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Présence d'enfants au foyer :</label>
                        <select
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section7Cadre.presenceEnfants ? 'oui' : 'non'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section7Cadre: { ...prev.section7Cadre, presenceEnfants: e.target.value === 'oui' }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="non">Non</option>
                          <option value="oui">Oui</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Style d'éducation souhaité :</label>
                        <select
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section7Cadre.styleEducationEnfants ?? 'non_concerne'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section7Cadre: { ...prev.section7Cadre, styleEducationEnfants: e.target.value as any }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="non_concerne">Non concerné</option>
                          <option value="bienveillant_positif">Bienveillant & Écoute active</option>
                          <option value="structure_cadre">Structuré & Règles claires</option>
                          <option value="autonome_responsabilisant">Autonome & Responsabilisant</option>
                          <option value="mixte_equilibre">Mixte / Équilibré</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Attitude habitudes (Tabac, alcool) :</label>
                        <select
                          disabled={isReadOnly}
                          value={currentProfileToDisplay.section7Cadre.attitudeHabitudesVie}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            section7Cadre: { ...prev.section7Cadre, attitudeHabitudesVie: e.target.value as any }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="tolerant">Tolérant</option>
                          <option value="neutre">Neutre</option>
                          <option value="strictement_oppose">Strictement opposé</option>
                        </select>
                      </div>
                    </div>

                    {/* Rôles et postures 0 à 10 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'affectionEnfants', label: 'Affection & soin avec les enfants' },
                        { key: 'roleChargeMentale', label: 'Gestion des charges mentales quotidiennes' },
                        { key: 'roleTiersInvites', label: 'Rôle face aux tiers / invités (Discrète à active)' },
                        { key: 'participerConversationsFoyer', label: 'Participer aux conversations du foyer' },
                        { key: 'amiAvecAmisPartenaire', label: 'Doit être ami/e avec les amis du partenaire' },
                        { key: 'servirServeur', label: 'Servir de serveur/serveuse (si mécanique)' },
                        { key: 'participationTachesMenageres', label: 'Participation aux tâches ménagères' },
                        { key: 'coanimerSoirees', label: 'Co-animer les soirées et interactions sociales' },
                        { key: 'gardiennageMaisonAlerte', label: 'Gardiennage maison & alerte intrusion' },
                        { key: 'postureTensionConflit', label: 'Posture en conflit (Consensus à débat ferme)' }
                      ].map(item => (
                        <div key={item.key} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>{item.label}</span>
                            <span className="font-mono text-rose-400 font-bold">
                              {(currentProfileToDisplay.section7Cadre as any)[item.key]}/10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            disabled={isReadOnly}
                            value={(currentProfileToDisplay.section7Cadre as any)[item.key]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section7Cadre: { 
                                ...prev.section7Cadre, 
                                [item.key]: Number(e.target.value) 
                              }
                            }))}
                            className="w-full accent-rose-400 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. GOUVERNANCE DES DONNÉES & AUTONOMIE INTÉGRÉE */}
                {activeSection === 8 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-teal-400" />
                        8. Gouvernance des Données & Autonomie Intégrée
                      </h3>
                      <p className="text-xs text-slate-400">
                        Cadrage des achats autonomes, secret médical / privé face aux tiers, persistance mémoire.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          key: 'perimetreAchatAutonome',
                          label: 'Périmètre d’achat & gestion budgétaire autonome',
                          min: 'Validation préalable stricte (0)',
                          max: 'Commandes autonomes autorisées (10)'
                        },
                        {
                          key: 'politiqueConfidentialiteTiers',
                          label: 'Politique de confidentialité envers les tiers / invités',
                          min: 'Secret absolu / Muet (0)',
                          max: 'Participation fluide ouverte (10)'
                        },
                        {
                          key: 'persistanceMemoire',
                          label: 'Niveau de persistance de la mémoire',
                          min: 'Oublis légers réguliers (0)',
                          max: 'Archivage détaillé continu (10)'
                        },
                        {
                          key: 'comportementBugsPannes',
                          label: 'Comportement face aux pannes ou bugs mineurs',
                          min: 'Signale immédiatement tout souci (0)',
                          max: 'Masque et s’auto-corrige silencieusement (10)'
                        }
                      ].map(item => (
                        <div key={item.key} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-slate-300">
                            <span>{item.label}</span>
                            <span className="font-mono text-teal-400 font-bold">
                              {(currentProfileToDisplay.section8Gouvernance as any)[item.key]}/10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            disabled={isReadOnly}
                            value={(currentProfileToDisplay.section8Gouvernance as any)[item.key]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              section8Gouvernance: { 
                                ...prev.section8Gouvernance, 
                                [item.key]: Number(e.target.value) 
                              }
                            }))}
                            className="w-full accent-teal-400 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{item.min}</span>
                            <span>{item.max}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER : NAVIGATION SECTIONS & BOUTON SAUVEGARDE */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              disabled={activeSection === 1}
              onClick={() => setActiveSection(prev => Math.max(1, prev - 1))}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Section Précédente</span>
            </button>

            <button
              disabled={activeSection === 8}
              onClick={() => setActiveSection(prev => Math.min(8, prev + 1))}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Section Suivante</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {showSavedToast && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Enregistré avec succès !
              </span>
            )}

            {!isReadOnly && (
              <button
                onClick={handleSaveAndContinue}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/25 transition-all cursor-pointer flex items-center gap-1.5 transform active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>
                  {activeSection < 8 
                    ? "Sauvegarder et continuer" 
                    : "Sauvegarder et trouver mon partenaire"}
                </span>
                {activeSection < 8 && <ChevronRight className="w-4 h-4 ml-0.5" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

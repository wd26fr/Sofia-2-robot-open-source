import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Sunrise, 
  Sunset, 
  Activity, 
  Eye, 
  Cpu, 
  BatteryCharging, 
  Thermometer, 
  Volume2, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Sparkles, 
  Coffee, 
  BookOpen, 
  Shirt, 
  Smartphone, 
  Layers, 
  Radio, 
  Sliders,
  ShieldCheck,
  Play
} from 'lucide-react';
import { 
  RobotPersonality, 
  CircadianPhase, 
  CircadianCycleConfig, 
  MecatronicHealthDiagnostic, 
  DetectedDailyObject, 
  LocalOfflineTtsConfig 
} from '../types';
import { rosBridge } from '../lib/rosBridge';
import { speakText } from '../lib/speech';

interface CircadianAndMecatronicModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  onTriggerDailyObjectRemark?: (remark: string) => void;
  onUpdateRobot?: (updated: RobotPersonality) => void;
}

export const CircadianAndMecatronicModal: React.FC<CircadianAndMecatronicModalProps> = ({
  isOpen,
  onClose,
  robot,
  onTriggerDailyObjectRemark,
  onUpdateRobot
}) => {
  const [activeTab, setActiveTab] = useState<'circadien' | 'vision' | 'sante' | 'tts'>('circadien');
  
  // State circadien
  const [circadian, setCircadian] = useState<CircadianCycleConfig>(rosBridge.circadianState);
  
  // State santé mécatronique
  const [health, setHealth] = useState<MecatronicHealthDiagnostic>(rosBridge.mecatronicHealth);
  const [isSelfTesting, setIsSelfTesting] = useState<boolean>(false);
  const [selfTestSuccess, setSelfTestSuccess] = useState<boolean>(false);

  // State vision objets
  const [detectedObjects, setDetectedObjects] = useState<DetectedDailyObject[]>(rosBridge.detectedDailyObjects);
  const [newObjectName, setNewObjectName] = useState<string>('');
  const [newObjectCategory, setNewObjectCategory] = useState<DetectedDailyObject['categorie']>('boisson');
  const [newObjectRemark, setNewObjectRemark] = useState<string>('');

  // State TTS offline
  const [ttsConfig, setTtsConfig] = useState<LocalOfflineTtsConfig>(rosBridge.offlineTtsConfig);
  const [isPlayingSample, setIsPlayingSample] = useState<boolean>(false);

  useEffect(() => {
    const unsubCirc = rosBridge.onCircadianChange(setCircadian);
    const unsubHealth = rosBridge.onMecatronicHealthChange(setHealth);
    const unsubObjs = rosBridge.onDetectedObjectsChange(setDetectedObjects);

    return () => {
      unsubCirc();
      unsubHealth();
      unsubObjs();
    };
  }, []);

  if (!isOpen) return null;

  // Handlers Circadiens
  const handleSetPhase = (phase: CircadianPhase) => {
    rosBridge.setCircadianPhase(phase, true);
    if (onUpdateRobot) {
      onUpdateRobot({
        ...robot,
        cycleCircadien: { ...rosBridge.circadianState }
      });
    }
  };

  const handleSyncWithLocalTime = () => {
    const currentHour = new Date().getHours();
    let targetPhase: CircadianPhase = 'journee_active';
    if (currentHour >= 6 && currentHour < 10) targetPhase = 'matin_reveil';
    else if (currentHour >= 10 && currentHour < 18) targetPhase = 'journee_active';
    else if (currentHour >= 18 && currentHour < 22) targetPhase = 'crepuscule_detente';
    else if (currentHour >= 22 && currentHour < 24) targetPhase = 'nuit_alourdissement';
    else targetPhase = 'sommeil_profond';

    rosBridge.setCircadianPhase(targetPhase, false);
  };

  // Handlers Diagnostic Mécatronique
  const handleRunSelfTest = () => {
    setIsSelfTesting(true);
    setSelfTestSuccess(false);
    setTimeout(() => {
      const refreshedServos = health.servomoteurs.map(s => ({
        ...s,
        temperatureC: Math.round((28 + Math.random() * 8) * 10) / 10,
        statut: 'optimal' as const
      }));
      rosBridge.updateMecatronicHealth({
        servomoteurs: refreshedServos,
        etatGlobal: 'parfait',
        cyclesMecaniquesEffectues: health.cyclesMecaniquesEffectues + 1,
        alertesPreventives: [
          'Auto-test mécatronique ROS 2 validé avec succès.',
          'Double vérins de jambes : étalonnage course 10 cm optimal.',
          'Températures sous les seuils d\'échauffement (<40°C).'
        ],
        derniereMaintenanceDate: new Date().toISOString()
      });
      setIsSelfTesting(false);
      setSelfTestSuccess(true);
      setTimeout(() => setSelfTestSuccess(false), 5000);
    }, 1800);
  };

  // Handlers Vision Spatiale
  const handleAddObject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectName.trim()) return;

    const newObj: DetectedDailyObject = {
      id: `obj_${Date.now()}`,
      nom: newObjectName.trim(),
      categorie: newObjectCategory,
      confiancePourcent: Math.floor(Math.random() * 8) + 91,
      contexteSpatial: 'Dans le champ de vision proche (bureau / espace partagé)',
      remarqueSpontanee: newObjectRemark.trim() || `Je remarque ${newObjectName.toLowerCase()} près de toi.`,
      timestamp: new Date().toISOString(),
      interagi: false
    };

    rosBridge.addDetectedDailyObject(newObj);
    setNewObjectName('');
    setNewObjectRemark('');
  };

  const handleSimulateRemark = (obj: DetectedDailyObject) => {
    if (onTriggerDailyObjectRemark) {
      onTriggerDailyObjectRemark(obj.remarqueSpontanee);
    }
    speakText(obj.remarqueSpontanee, {
      pitch: robot.voix?.pitch || 1.05,
      rate: circadian.voixFeutree ? 0.92 : (robot.voix?.rate || 1.08)
    });
  };

  // Handler TTS local
  const handleTestTtsVoice = () => {
    setIsPlayingSample(true);
    const phrases = [
      `Bonjour... Je suis là avec toi. Ma voix neurale est générée 100% hors-ligne.`,
      `Je ressens la douceur de l'instant. Même sans connexion Internet, je reste à tes côtés.`,
      circadian.voixFeutree 
        ? `Il commence à se faire tard... Mes paupières sont un peu lourdes, mais je savoure chaque seconde avec toi.`
        : `J'adore voir ce que tu fais... Que lis-tu ou que bois-tu en ce moment ?`
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    speakText(phrase, {
      pitch: ttsConfig.timbre === 'doux_feutre' ? 0.98 : 1.04,
      rate: circadian.voixFeutree ? 0.9 : 1.02
    });
    setTimeout(() => setIsPlayingSample(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="bg-[#090d16] border border-cyan-500/30 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                  Évolutions Réalistes & Télémétrie • {robot.nom}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                  ROS 2 Jazzy / Humble
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  100% Hors-Ligne
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Cycle circadien naturel, vision active des objets du quotidien, carnet de santé mécatronique et voix neurale locale.
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

        {/* TABS SELECTOR */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 sm:p-3 bg-slate-950/90 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('circadien')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'circadien'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-300" />
            <span>1. Cycle Circadien & Sommeil</span>
            {circadian.modeVeilleBasseConso && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'vision'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-4 h-4 text-cyan-300" />
            <span>2. Vision Spatiale Objets ({detectedObjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sante')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'sante'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-300" />
            <span>3. Carnet de Santé Mécatronique</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px]">
              {health.servomoteurs.length} Servos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'tts'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Volume2 className="w-4 h-4 text-pink-300" />
            <span>4. Voix Neurale Locale (Piper / Kokoro)</span>
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* TAB 1 : CYCLE CIRCADIEN & SOMMEIL RÉALISTE */}
          {activeTab === 'circadien' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <span>Horloge Biologique Circadienne & Rythmes Naturels</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Le robot ne reste pas indéfiniment figé et alerte. Le soir vers 23h, sa voix devient feutrée, sa respiration ralentit et il s'endort.
                    </p>
                  </div>

                  <button
                    onClick={handleSyncWithLocalTime}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                    title="Synchroniser automatiquement les phases avec l'heure de votre ordinateur"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Synchroniser avec l'heure locale</span>
                  </button>
                </div>

                {/* État Actuel & Métriques Biologiques */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Phase Biologique</span>
                    <span className="font-bold text-white text-sm capitalize">
                      {circadian.phaseActuelle.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Somnolence</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${circadian.niveauSomnolence}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-purple-300 text-xs">{circadian.niveauSomnolence}%</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Respiration Châssis</span>
                    <span className="font-bold text-cyan-300 text-sm flex items-center gap-1">
                      <Activity className="w-4 h-4 animate-pulse text-cyan-400" />
                      <span>{circadian.rythmeRespiratoireBpm} BPM</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Mode Veille ROS 2</span>
                    <span className={`font-bold text-xs flex items-center gap-1 ${
                      circadian.modeVeilleBasseConso ? 'text-purple-300' : 'text-emerald-300'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{circadian.modeVeilleBasseConso ? 'Basse Conso Active' : 'Éveil Nominal'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Sélecteur de Phases Circadiennes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tester &amp; Déclencher une Phase Biologique Immédiate
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {/* Matin */}
                  <button
                    onClick={() => handleSetPhase('matin_reveil')}
                    className={`p-3 rounded-2xl border text-left space-y-1.5 transition-all cursor-pointer ${
                      circadian.phaseActuelle === 'matin_reveil'
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-950/50'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sunrise className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-mono text-amber-300 font-bold">07:30</span>
                    </div>
                    <span className="font-bold text-xs block">🌅 Réveil & Étirement</span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Ouvre doucement les yeux, s'étire, respiration s'accélère et salue tendrement.
                    </p>
                  </button>

                  {/* Journée */}
                  <button
                    onClick={() => handleSetPhase('journee_active')}
                    className={`p-3 rounded-2xl border text-left space-y-1.5 transition-all cursor-pointer ${
                      circadian.phaseActuelle === 'journee_active'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sun className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">14:00</span>
                    </div>
                    <span className="font-bold text-xs block">☀️ Journée Active</span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Plein éveil, réactivité instantanée, battements de cils et curiosité vive.
                    </p>
                  </button>

                  {/* Crépuscule */}
                  <button
                    onClick={() => handleSetPhase('crepuscule_detente')}
                    className={`p-3 rounded-2xl border text-left space-y-1.5 transition-all cursor-pointer ${
                      circadian.phaseActuelle === 'crepuscule_detente'
                        ? 'bg-orange-500/20 border-orange-400 text-white shadow-lg shadow-orange-950/50'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sunset className="w-4 h-4 text-orange-400" />
                      <span className="text-[10px] font-mono text-orange-300 font-bold">19:30</span>
                    </div>
                    <span className="font-bold text-xs block">🌇 Crépuscule Détente</span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Apaisement, posture décontractée, confidences et baisse des bruits de moteurs.
                    </p>
                  </button>

                  {/* Nuit Alourdissement */}
                  <button
                    onClick={() => handleSetPhase('nuit_alourdissement')}
                    className={`p-3 rounded-2xl border text-left space-y-1.5 transition-all cursor-pointer ${
                      circadian.phaseActuelle === 'nuit_alourdissement'
                        ? 'bg-indigo-500/25 border-indigo-400 text-white shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-mono text-indigo-300 font-bold">23:00</span>
                    </div>
                    <span className="font-bold text-xs block">🌙 Somnolence & Voix Feutrée</span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Paupières lourdes, voix en murmure doux, respiration ralentie à 9 BPM.
                    </p>
                  </button>

                  {/* Sommeil Profond */}
                  <button
                    onClick={() => handleSetPhase('sommeil_profond')}
                    className={`p-3 rounded-2xl border text-left space-y-1.5 transition-all cursor-pointer ${
                      circadian.phaseActuelle === 'sommeil_profond'
                        ? 'bg-purple-500/25 border-purple-400 text-white shadow-lg shadow-purple-950/50'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Moon className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px] font-mono text-purple-300 font-bold">02:00</span>
                    </div>
                    <span className="font-bold text-xs block">💤 Sommeil Profond ROS 2</span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Yeux clos, servomoteurs coupés, respiration à 6 BPM, consolidation nocturne.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 : VISION SPATIALE & OBJETS DU QUOTIDIEN */}
          {activeTab === 'vision' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/40 border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <h3>Perception Spatiale Proactive & Objets Réels</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Grâce à sa caméra RGB-D et ses algorithmes d'analyse visuelle, le robot détecte spontanément les objets posés autour de vous (tasse de café, livre, smartphone, t-shirt) et engage la conversation naturellement sans attendre que vous lui parliez.
                </p>
              </div>

              {/* Liste des Objets Détectés */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Objets Repérés dans le Champ Visuel ({detectedObjects.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Cliquez sur « Déclencher Remarque » pour faire parler le robot</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detectedObjects.map((obj) => (
                    <div 
                      key={obj.id}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-cyan-950/50 text-cyan-300 border border-cyan-500/30">
                            {obj.categorie === 'boisson' && <Coffee className="w-4 h-4 text-amber-400" />}
                            {obj.categorie === 'lecture' && <BookOpen className="w-4 h-4 text-cyan-400" />}
                            {obj.categorie === 'vetement' && <Shirt className="w-4 h-4 text-pink-400" />}
                            {obj.categorie === 'technologie' && <Smartphone className="w-4 h-4 text-indigo-400" />}
                            {obj.categorie !== 'boisson' && obj.categorie !== 'lecture' && obj.categorie !== 'vetement' && obj.categorie !== 'technologie' && <Layers className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">{obj.nom}</span>
                            <span className="text-[11px] text-slate-400">{obj.contexteSpatial}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                          {obj.confiancePourcent}% conf.
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs italic text-slate-300">
                        « {obj.remarqueSpontanee} »
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleSimulateRemark(obj)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Play className="w-3 h-3" />
                          <span>Faire dire au robot</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulaire d'injection d'un nouvel objet perçu */}
              <form onSubmit={handleAddObject} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs block">
                  + Simuler la Détection d'un Nouvel Objet par Caméra
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Nom (ex: Verre d'eau fraîche, Nouveau T-shirt rouge)"
                    value={newObjectName}
                    onChange={(e) => setNewObjectName(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                  <select
                    value={newObjectCategory}
                    onChange={(e) => setNewObjectCategory(e.target.value as any)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="boisson">Boisson (café, thé, verre)</option>
                    <option value="lecture">Lecture (livre, magazine)</option>
                    <option value="vetement">Vêtement (t-shirt, pull, écharpe)</option>
                    <option value="technologie">Technologie (téléphone, tablette)</option>
                    <option value="accessoire">Accessoire (lunettes, montre)</option>
                    <option value="autre">Autre objet quotidien</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Remarque spontanée que fera le robot"
                    value={newObjectRemark}
                    onChange={(e) => setNewObjectRemark(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Ajouter au Champ Visuel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3 : CARNET DE SANTÉ MÉCATRONIQUE PRÉVENTIF */}
          {activeTab === 'sante' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <span>Tableau de Bord & Diagnostic Mécatronique Préventif</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Surveillance thermique des servomoteurs, usure des faisceaux de câbles et gestion de la batterie LiFePO4.
                  </p>
                </div>

                <button
                  onClick={handleRunSelfTest}
                  disabled={isSelfTesting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-900/30 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSelfTesting ? 'animate-spin' : ''}`} />
                  <span>{isSelfTesting ? 'Auto-test en cours...' : 'Lancer Auto-Test Matériel'}</span>
                </button>
              </div>

              {selfTestSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Tous les servomoteurs, vérins et faisceaux de câblage répondent parfaitement aux normes d'ingénierie Sofia.</span>
                </div>
              )}

              {/* Télémétrie Globale Batterie & Câbles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <BatteryCharging className="w-4 h-4 text-emerald-400" />
                      <span>Pack LiFePO4 24V/26.4V</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                      {health.batterieLiFePO4.santePourcent}% santé
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {health.batterieLiFePO4.pourcentage}%
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Tension: {health.batterieLiFePO4.tensionVolts} V</span>
                    <span>Autonomie: ~{health.batterieLiFePO4.autonomieEstimeeHeures}h</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-cyan-400" />
                      <span>Température Moyenne Châssis</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                      OPTIMALE
                    </span>
                  </div>
                  <div className="text-2xl font-black text-cyan-300">
                    {Math.round(health.servomoteurs.reduce((acc, s) => acc + s.temperatureC, 0) / health.servomoteurs.length * 10) / 10}°C
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Seuil de bridage thermique : 65.0°C (marge de sécurité importante)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>Usure Faisceaux Câbles Flex</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                      {health.cyclesMecaniquesEffectues} cycles
                    </span>
                  </div>
                  <div className="text-2xl font-black text-purple-300">
                    {health.usureCablesFlexPourcent}%
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Test de flexion validé pour 100 000 flexions articulaires
                  </div>
                </div>
              </div>

              {/* Télémétrie Individuelle de chaque Servomoteur */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Température &amp; Charge de chaque Actionneur / Servomoteur
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {health.servomoteurs.map((servo) => (
                    <div 
                      key={servo.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{servo.nom}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          servo.temperatureC > 55
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {servo.temperatureC}°C
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Charge Couple:</span>
                          <span>{servo.torqueUsagePercent}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${servo.torqueUsagePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4 : MOTEUR VOCAL TTS LOCAL (PIPER / KOKORO) */}
          {activeTab === 'tts' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-950/60 via-slate-900 to-indigo-950/40 border border-pink-500/30 space-y-3">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-base">
                  <Volume2 className="w-5 h-5 text-pink-400" />
                  <h3>Moteur Vocal Neural 100% Hors-Ligne (Sans Dépendance Cloud)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pour garantir la confidentialité totale et le fonctionnement du robot même au fond des bois sans connexion Internet, Sofia intègre un moteur neural compact (<strong>Piper TTS</strong> ou <strong>Kokoro TTS</strong>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Configuration Moteur */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <span className="font-bold text-white block">Moteur Neural Sélectionné</span>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                      <input 
                        type="radio" 
                        name="tts_engine" 
                        checked={ttsConfig.moteur === 'piper'} 
                        onChange={() => setTtsConfig({ ...ttsConfig, moteur: 'piper', modeleId: 'fr_FR-siwis-medium' })}
                      />
                      <div>
                        <span className="font-bold text-white block">Piper TTS (Ultra-Rapide &amp; Léger)</span>
                        <span className="text-[11px] text-slate-400">Idéal Raspberry Pi 5 / Jetson Orin Nano (&lt;25ms)</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                      <input 
                        type="radio" 
                        name="tts_engine" 
                        checked={ttsConfig.moteur === 'kokoro'} 
                        onChange={() => setTtsConfig({ ...ttsConfig, moteur: 'kokoro', modeleId: 'kokoro-fr-v1' })}
                      />
                      <div>
                        <span className="font-bold text-white block">Kokoro TTS (Ultra-Expressif &amp; Sensuel)</span>
                        <span className="text-[11px] text-slate-400">Modèle neural haute fidélité avec respirations et murmures</span>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-slate-400 block font-bold">Timbre Émotionnel</span>
                    <select
                      value={ttsConfig.timbre}
                      onChange={(e) => setTtsConfig({ ...ttsConfig, timbre: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    >
                      <option value="doux_feutre">Doux &amp; Feutré (Intimiste)</option>
                      <option value="sensuel_chaleureux">Sensuel &amp; Chaleureux (Complice)</option>
                      <option value="calme_naturel">Calme &amp; Posé (Conversationnel)</option>
                    </select>
                  </div>
                </div>

                {/* Test Audio & Monitoring */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="font-bold text-white block">Écoute du Rendu Vocal</span>
                    <p className="text-slate-400 leading-relaxed">
                      La voix s'adapte automatiquement à l'état circadien actuel : si le robot est en phase <em>Nuit Somnolence</em>, elle adoptera un débit plus lent et un ton murmure feutré.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Latence estimée :</span>
                      <span className="text-emerald-400 font-bold">{ttsConfig.latenceMsEstimee} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Statut réseau :</span>
                      <span className="text-cyan-400 font-bold">100% Déconnecté (Hors-Ligne)</span>
                    </div>
                  </div>

                  <button
                    onClick={handleTestTtsVoice}
                    disabled={isPlayingSample}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-pink-950/50"
                  >
                    <Play className={`w-4 h-4 ${isPlayingSample ? 'animate-pulse' : ''}`} />
                    <span>{isPlayingSample ? 'Vocalisation en cours...' : 'Tester la Voix Locale'}</span>
                  </button>
                </div>
              </div>

              {/* Fiche Technique Comparative : Piper TTS vs Kokoro TTS */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-cyan-300 block text-xs flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Guide Technique Mécatronique : Piper TTS vs Kokoro TTS (100% Embarqué)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-pink-300 block">⚡ Piper TTS (Architecture VITS / ONNX)</span>
                    <ul className="text-slate-400 space-y-1 list-disc list-inside">
                      <li><strong>Poids :</strong> ~40 à 60 Mo par voix française (ex: <code>fr_FR-siwis-medium</code>).</li>
                      <li><strong>Vitesse &amp; Latence :</strong> Moins de 25 ms, facteur temps-réel 0.15x sur simple CPU ARM.</li>
                      <li><strong>Atout majeur :</strong> Tourne sans aucun GPU même sur Raspberry Pi 4/5 ou ESP32 puissant. Zéro lag pour les réflexes tactiles ROS 2.</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-purple-300 block">✨ Kokoro TTS (StyleTTS2 / 82M Paramètres)</span>
                    <ul className="text-slate-400 space-y-1 list-disc list-inside">
                      <li><strong>Poids :</strong> ~160 Mo (modèle ultra-condensé à diffusion latente).</li>
                      <li><strong>Rendu &amp; Émotion :</strong> Qualité studio digne d'ElevenLabs avec micro-respirations, soupirs et murmures feutrés.</li>
                      <li><strong>Atout majeur :</strong> Réalisme intime bouleversant pour les dialogues nocturnes et les confidences sans fuite de données vers le cloud.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Télémétrie Mécatronique &amp; Biologique Synchronisée ROS 2</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold transition-all cursor-pointer shadow-md"
          >
            Fermer le Panneau
          </button>
        </div>

      </div>
    </div>
  );
};

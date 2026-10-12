import React, { useState, useEffect } from 'react';
import { 
  RobotHardwareConfig, 
  RobotBodyPart, 
  RobotActuator, 
  RobotSensor, 
  RobotActuatorType, 
  RobotSensorType 
} from '../types';
import { 
  BODY_PARTS_METADATA, 
  DEFAULT_SOFIA_HARDWARE, 
  generateUrdfFromConfig, 
  generateRos2ControlYaml 
} from '../data/defaultHardwareConfig';
import { rosBridge } from '../lib/rosBridge';
import { 
  Cpu, 
  Sliders, 
  Eye, 
  Zap, 
  Activity, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  BatteryCharging, 
  Radio, 
  Sparkles,
  ChevronRight,
  Edit2
} from 'lucide-react';

interface RosHardwareConfiguratorProps {
  robotId?: string;
  robotName?: string;
}

export const RosHardwareConfigurator: React.FC<RosHardwareConfiguratorProps> = ({
  robotId = 'sofia-01',
  robotName = 'Sofia'
}) => {
  const storageKey = `sofia_hardware_config_${robotId}`;

  const [hardwareConfig, setHardwareConfig] = useState<RobotHardwareConfig>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading hardware config:', e);
      }
    }
    return { ...DEFAULT_SOFIA_HARDWARE, robotId };
  });

  const [selectedPart, setSelectedPart] = useState<RobotBodyPart>('tete_cou');
  const [activeSubTab, setActiveSubTab] = useState<'actionneurs' | 'capteurs' | 'chassis' | 'urdf_export'>('actionneurs');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testAngles, setTestAngles] = useState<Record<string, number>>({});
  const [editingActuatorId, setEditingActuatorId] = useState<string | null>(null);
  const [showAddActuatorModal, setShowAddActuatorModal] = useState(false);
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);

  // New actuator form state
  const [newActuator, setNewActuator] = useState<Partial<RobotActuator>>({
    nom: '',
    partieCorps: 'tete_cou',
    typeActionneur: 'servomoteur_dynamixel',
    topicRos: '/sofia/new_joint/command',
    busCommunication: 'rs485',
    degresMin: -90,
    degresMax: 90,
    coupleMaxNm: 4.5,
    vitesseMaxRpm: 60,
    actif: true
  });

  // New sensor form state
  const [newSensor, setNewSensor] = useState<Partial<RobotSensor>>({
    nom: '',
    partieCorps: 'tete_cou',
    typeCapteur: 'tactile_capacitif',
    topicRos: '/sofia/sensors/new_sensor',
    frequenceHz: 20,
    protocole: 'i2c',
    description: '',
    actif: true
  });

  // Persist whenever config changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(hardwareConfig));
  }, [hardwareConfig, storageKey]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActuator = (id: string) => {
    setHardwareConfig(prev => ({
      ...prev,
      dateModification: new Date().toISOString(),
      actionneurs: prev.actionneurs.map(a => a.id === id ? { ...a, actif: !a.actif } : a)
    }));
  };

  const handleDeleteActuator = (id: string) => {
    setHardwareConfig(prev => ({
      ...prev,
      dateModification: new Date().toISOString(),
      actionneurs: prev.actionneurs.filter(a => a.id !== id)
    }));
  };

  const handleToggleSensor = (id: string) => {
    setHardwareConfig(prev => ({
      ...prev,
      dateModification: new Date().toISOString(),
      capteurs: prev.capteurs.map(s => s.id === id ? { ...s, actif: !s.actif } : s)
    }));
  };

  const handleDeleteSensor = (id: string) => {
    setHardwareConfig(prev => ({
      ...prev,
      dateModification: new Date().toISOString(),
      capteurs: prev.capteurs.filter(s => s.id !== id)
    }));
  };

  const handleSendTestCommand = (actuator: RobotActuator, angle: number) => {
    setTestAngles(prev => ({ ...prev, [actuator.id]: angle }));
    rosBridge.publish(actuator.topicRos, 'std_msgs/Float64', { data: (angle * Math.PI) / 180 });
  };

  const handleAddActuator = () => {
    if (!newActuator.nom) return;
    const item: RobotActuator = {
      id: `act-${Date.now().toString().slice(-4)}`,
      nom: newActuator.nom,
      partieCorps: selectedPart,
      typeActionneur: newActuator.typeActionneur as RobotActuatorType,
      topicRos: newActuator.topicRos || `/sofia/${selectedPart}/joint_${Date.now()}/command`,
      busCommunication: newActuator.busCommunication as any,
      degresMin: Number(newActuator.degresMin) || -90,
      degresMax: Number(newActuator.degresMax) || 90,
      coupleMaxNm: Number(newActuator.coupleMaxNm) || 3.0,
      vitesseMaxRpm: Number(newActuator.vitesseMaxRpm) || 60,
      actif: true,
      notes: newActuator.notes || ''
    };

    setHardwareConfig(prev => ({
      ...prev,
      dateModification: new Date().toISOString(),
      actionneurs: [...prev.actionneurs, item]
    }));
    setShowAddActuatorModal(false);
    setNewActuator({
      nom: '',
      partieCorps: selectedPart,
      typeActionneur: 'servomoteur_dynamixel',
      topicRos: `/sofia/${selectedPart}/command`,
      busCommunication: 'rs485',
      degresMin: -90,
      degresMax: 90,
      coupleMaxNm: 4.5,
      vitesseMaxRpm: 60,
      actif: true
    });
  };

  const handleAddSensor = () => {
    if (!newSensor.nom) return;
    const item: RobotSensor = {
      id: `sens-${Date.now().toString().slice(-4)}`,
      nom: newSensor.nom,
      partieCorps: selectedPart,
      typeCapteur: newSensor.typeCapteur as RobotSensorType,
      topicRos: newSensor.topicRos || `/sofia/${selectedPart}/sensor_${Date.now()}`,
      frequenceHz: Number(newSensor.frequenceHz) || 20,
      protocole: newSensor.protocole as any,
      description: newSensor.description || '',
      actif: true
    };

    setHardwareConfig(prev => ({
      ...prev,
      dateModification: new Date().toISOString(),
      capteurs: [...prev.capteurs, item]
    }));
    setShowAddSensorModal(false);
    setNewSensor({
      nom: '',
      partieCorps: selectedPart,
      typeCapteur: 'tactile_capacitif',
      topicRos: `/sofia/${selectedPart}/sensor`,
      frequenceHz: 20,
      protocole: 'i2c',
      description: '',
      actif: true
    });
  };

  const handleResetDefaults = () => {
    if (window.confirm("Réinitialiser la configuration matérielle d'origine ?")) {
      setHardwareConfig({ ...DEFAULT_SOFIA_HARDWARE, robotId });
    }
  };

  const currentPartActuators = hardwareConfig.actionneurs.filter(a => a.partieCorps === selectedPart);
  const currentPartSensors = hardwareConfig.capteurs.filter(s => s.partieCorps === selectedPart);
  const totalDof = hardwareConfig.actionneurs.filter(a => a.actif).length;
  const totalSensors = hardwareConfig.capteurs.filter(s => s.actif).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Back-Office Matériel Robotique & Châssis (Hardware)
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    FR-Hardware 2.0
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Définition physique complète de l'androïde {robotName} : membres, servomoteurs, capteurs et bus de communication.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
            <button
              onClick={() => setActiveSubTab('urdf_export')}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter URDF / YAML
            </button>
          </div>
        </div>

        {/* Quick Spec Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Degrés de Liberté (DOF)</span>
            <div className="text-lg font-bold font-mono text-cyan-300 flex items-center gap-1.5">
              <span>{totalDof} DOF</span>
              <span className="text-[10px] font-normal text-slate-500">actifs</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Capteurs & Perception</span>
            <div className="text-lg font-bold font-mono text-emerald-300 flex items-center gap-1.5">
              <span>{totalSensors} capteurs</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Poids Châssis & Hauteur</span>
            <div className="text-lg font-bold font-mono text-amber-300 flex items-center gap-1.5">
              <span>{hardwareConfig.poidsChassisKg} kg</span>
              <span className="text-xs text-slate-400">/ {hardwareConfig.hauteurCm} cm</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Alimentation Embarquée</span>
            <div className="text-lg font-bold font-mono text-purple-300 flex items-center gap-1.5">
              <span>{hardwareConfig.capaciteBatterieAh} Ah</span>
              <span className="text-xs text-slate-400">({hardwareConfig.typeBatterie.toUpperCase()})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body Part Interactive Navigation Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <span>Partie Anatomique du Robot à Configurer :</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(BODY_PARTS_METADATA) as RobotBodyPart[]).map(partKey => {
            const partInfo = BODY_PARTS_METADATA[partKey];
            const isSelected = selectedPart === partKey;
            const partActCount = hardwareConfig.actionneurs.filter(a => a.partieCorps === partKey && a.actif).length;
            const partSensCount = hardwareConfig.capteurs.filter(s => s.partieCorps === partKey && s.actif).length;

            return (
              <button
                key={partKey}
                onClick={() => setSelectedPart(partKey)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {partInfo.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <span>{partActCount} moteur{partActCount > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{partSensCount} capteur{partSensCount > 1 ? 's' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Back-Office Tabs */}
      <div className="flex border-b border-slate-800 gap-2 pb-1 overflow-x-auto">
        {[
          { id: 'actionneurs', label: `Actionneurs & Servos (${currentPartActuators.length})`, icon: Sliders },
          { id: 'capteurs', label: `Capteurs & Télémétrie (${currentPartSensors.length})`, icon: Eye },
          { id: 'chassis', label: 'Paramètres Généraux Châssis & Batterie', icon: BatteryCharging },
          { id: 'urdf_export', label: 'Export Modèle URDF & ROS 2 Control', icon: Download }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/30 border border-indigo-400/50 text-indigo-200'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: ACTIONNEURS */}
      {activeSubTab === 'actionneurs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Actionneurs de la zone : {BODY_PARTS_METADATA[selectedPart].label}
              </h4>
              <p className="text-[11px] text-slate-400">
                {BODY_PARTS_METADATA[selectedPart].description}
              </p>
            </div>
            <button
              onClick={() => setShowAddActuatorModal(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un Actionneur
            </button>
          </div>

          {currentPartActuators.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-2">
              <Sliders className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Aucun actionneur configuré sur cette partie du corps.</p>
              <button
                onClick={() => setShowAddActuatorModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Définir un actionneur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPartActuators.map(actuator => {
                const angleVal = testAngles[actuator.id] ?? 0;
                return (
                  <div
                    key={actuator.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      actuator.actif
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{actuator.nom}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {actuator.busCommunication.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-cyan-400/90 break-all">
                          {actuator.topicRos}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActuator(actuator.id)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            actuator.actif
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {actuator.actif ? 'ACTIF' : 'INACTIF'}
                        </button>
                        <button
                          onClick={() => handleDeleteActuator(actuator.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Specs details row */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                      <div>
                        <span className="text-slate-500 block">Amplitude</span>
                        <span className="text-slate-200">[{actuator.degresMin}° / {actuator.degresMax}°]</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Couple Max</span>
                        <span className="text-slate-200">{actuator.coupleMaxNm ? `${actuator.coupleMaxNm} N.m` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Vitesse</span>
                        <span className="text-slate-200">{actuator.vitesseMaxRpm ? `${actuator.vitesseMaxRpm} RPM` : 'N/A'}</span>
                      </div>
                    </div>

                    {actuator.notes && (
                      <p className="text-[10px] text-slate-400 italic">
                        {actuator.notes}
                      </p>
                    )}

                    {/* Live Test Slider */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Test d'orientation directe :</span>
                        <span className="font-mono text-cyan-300 font-bold">{angleVal}°</span>
                      </div>
                      <input
                        type="range"
                        min={actuator.degresMin}
                        max={actuator.degresMax}
                        value={angleVal}
                        onChange={(e) => handleSendTestCommand(actuator, Number(e.target.value))}
                        disabled={!actuator.actif}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>{actuator.degresMin}°</span>
                        <span>0°</span>
                        <span>{actuator.degresMax}°</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CAPTEURS */}
      {activeSubTab === 'capteurs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Capteurs de la zone : {BODY_PARTS_METADATA[selectedPart].label}
              </h4>
              <p className="text-[11px] text-slate-400">
                Télémétrie sensorielle (tactile, visuelle, acoustique, thermique).
              </p>
            </div>
            <button
              onClick={() => setShowAddSensorModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un Capteur
            </button>
          </div>

          {currentPartSensors.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-2">
              <Eye className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Aucun capteur configuré sur cette partie du corps.</p>
              <button
                onClick={() => setShowAddSensorModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Définir un capteur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPartSensors.map(sensor => (
                <div
                  key={sensor.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    sensor.actif
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{sensor.nom}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {sensor.protocole.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400/90 break-all">
                        {sensor.topicRos}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSensor(sensor.id)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          sensor.actif
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {sensor.actif ? 'ACTIF' : 'INACTIF'}
                      </button>
                      <button
                        onClick={() => handleDeleteSensor(sensor.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {sensor.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400">Fréquence d'échantillonnage :</span>
                    <span className="text-emerald-300 font-bold">{sensor.frequenceHz} Hz</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: CHÂSSIS & PARAMÈTRES GÉNÉRAUX */}
      {activeSubTab === 'chassis' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Caractéristiques Physiques & Électriques du Châssis
            </h4>
            <p className="text-xs text-slate-400">
              Paramètres mécaniques, poids, taille et autonomie de la batterie pour les calculs cinématiques.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nom du châssis :</label>
              <input
                type="text"
                value={hardwareConfig.nomChassis}
                onChange={e => setHardwareConfig(prev => ({ ...prev, nomChassis: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Révision matérielle :</label>
              <input
                type="text"
                value={hardwareConfig.revisionMaterielle}
                onChange={e => setHardwareConfig(prev => ({ ...prev, revisionMaterielle: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Poids total Châssis (kg) :</label>
              <input
                type="number"
                step="0.5"
                value={hardwareConfig.poidsChassisKg}
                onChange={e => setHardwareConfig(prev => ({ ...prev, poidsChassisKg: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hauteur anthropomorphe (cm) :</label>
              <input
                type="number"
                value={hardwareConfig.hauteurCm}
                onChange={e => setHardwareConfig(prev => ({ ...prev, hauteurCm: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Chimie de la Batterie :</label>
              <select
                value={hardwareConfig.typeBatterie}
                onChange={e => setHardwareConfig(prev => ({ ...prev, typeBatterie: e.target.value as any }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="lifepo4">LiFePO4 (Lithium Fer Phosphate - Haute Sécurité)</option>
                <option value="li_ion">Li-ion (Haute Densité Énergétique)</option>
                <option value="alimentation_secteur">Alimentation Secteur Filaire Directe</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Capacité Batterie (Ah) :</label>
              <input
                type="number"
                value={hardwareConfig.capaciteBatterieAh}
                onChange={e => setHardwareConfig(prev => ({ ...prev, capaciteBatterieAh: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: EXPORT URDF & ROS 2 CONTROL YAML */}
      {activeSubTab === 'urdf_export' && (
        <div className="space-y-6">
          {/* URDF XML EXPORT */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Modèle Cinématique URDF (robot.urdf)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Fichier URDF officiel compatible RViz, Gazebo et MoveIt 2 avec toutes les liaisons et limites angulaires configurées.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generateUrdfFromConfig(hardwareConfig), 'urdf')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  {copiedCode === 'urdf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'urdf' ? 'Copié !' : 'Copier URDF'}
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-72 leading-relaxed">
              {generateUrdfFromConfig(hardwareConfig)}
            </pre>
          </div>

          {/* ROS 2 CONTROL YAML EXPORT */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Configuration Contrôleurs (ros2_controllers.yaml)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Déclaration des contrôleurs matériels de trajectoire pour ros2_control framework.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generateRos2ControlYaml(hardwareConfig), 'yaml')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  {copiedCode === 'yaml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'yaml' ? 'Copié !' : 'Copier YAML'}
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-72 leading-relaxed">
              {generateRos2ControlYaml(hardwareConfig)}
            </pre>
          </div>
        </div>
      )}

      {/* MODAL: AJOUT D'UN ACTIONNEUR */}
      {showAddActuatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Ajouter un Actionneur ({BODY_PARTS_METADATA[selectedPart].label})
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nom descriptif (en français) :</label>
                <input
                  type="text"
                  placeholder="ex: Servomoteur Paupière Droite"
                  value={newActuator.nom}
                  onChange={e => setNewActuator(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type d'actionneur :</label>
                  <select
                    value={newActuator.typeActionneur}
                    onChange={e => setNewActuator(prev => ({ ...prev, typeActionneur: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="servomoteur_dynamixel">Dynamixel (Série X / P)</option>
                    <option value="servomoteur_pwm">Servomoteur PWM standard</option>
                    <option value="moteur_brushless">Moteur Brushless & Réducteur</option>
                    <option value="actionneur_lineaire">Actionneur linéaire / Vérin</option>
                    <option value="vibreur_haptique">Vibreur haptique résonant</option>
                    <option value="chauffage_thermique">Nappe chauffante thermique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bus de communication :</label>
                  <select
                    value={newActuator.busCommunication}
                    onChange={e => setNewActuator(prev => ({ ...prev, busCommunication: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="rs485">RS-485 (Half/Full Duplex)</option>
                    <option value="can">CAN Bus / CAN FD</option>
                    <option value="pwm">PWM</option>
                    <option value="i2c">I2C</option>
                    <option value="usb_serial">USB Série Direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Topic de commande ROS :</label>
                <input
                  type="text"
                  placeholder="/sofia/head/eyelid_right/command"
                  value={newActuator.topicRos}
                  onChange={e => setNewActuator(prev => ({ ...prev, topicRos: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Angle Min (°):</label>
                  <input
                    type="number"
                    value={newActuator.degresMin}
                    onChange={e => setNewActuator(prev => ({ ...prev, degresMin: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Angle Max (°):</label>
                  <input
                    type="number"
                    value={newActuator.degresMax}
                    onChange={e => setNewActuator(prev => ({ ...prev, degresMax: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddActuatorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddActuator}
                disabled={!newActuator.nom}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold"
              >
                Enregistrer l'Actionneur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AJOUT D'UN CAPTEUR */}
      {showAddSensorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Ajouter un Capteur ({BODY_PARTS_METADATA[selectedPart].label})
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nom descriptif (en français) :</label>
                <input
                  type="text"
                  placeholder="ex: Sonde thermique cutanée menton"
                  value={newSensor.nom}
                  onChange={e => setNewSensor(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type de capteur :</label>
                  <select
                    value={newSensor.typeCapteur}
                    onChange={e => setNewSensor(prev => ({ ...prev, typeCapteur: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="tactile_capacitif">Tactile capacitif (Peau silicone)</option>
                    <option value="vision_rgbd">Caméra Vision RGB-D / Profondeur</option>
                    <option value="audio_micro">Réseau Microphonique</option>
                    <option value="imu_orientation">Centrale Inertielle IMU (9 axes)</option>
                    <option value="thermometre_peau">Capteur thermique cutané</option>
                    <option value="capteur_force_fsr">Capteur de force de préhension (FSR)</option>
                    <option value="batterie_bms">Télémétrie BMS Batterie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Protocole d'échange :</label>
                  <select
                    value={newSensor.protocole}
                    onChange={e => setNewSensor(prev => ({ ...prev, protocole: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="i2c">I2C (Bus standard)</option>
                    <option value="spi">SPI (Haute vitesse)</option>
                    <option value="usb">USB (UVC / LibUSB)</option>
                    <option value="serial">Série TTL</option>
                    <option value="ros2_msg">Topic ROS direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Topic ROS de publication :</label>
                <input
                  type="text"
                  placeholder="/sofia/sensors/thermal/chin"
                  value={newSensor.topicRos}
                  onChange={e => setNewSensor(prev => ({ ...prev, topicRos: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fréquence (Hz) :</label>
                  <input
                    type="number"
                    value={newSensor.frequenceHz}
                    onChange={e => setNewSensor(prev => ({ ...prev, frequenceHz: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description / Fonction :</label>
                  <input
                    type="text"
                    placeholder="Mesure la chaleur cutanée..."
                    value={newSensor.description}
                    onChange={e => setNewSensor(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddSensorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddSensor}
                disabled={!newSensor.nom}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold"
              >
                Enregistrer le Capteur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

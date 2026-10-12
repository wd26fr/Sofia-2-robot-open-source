import React, { useState, useEffect } from 'react';
import { 
  rosBridge, 
  STANDARD_ROS_TOPICS 
} from '../lib/rosBridge';
import { RosHardwareConfigurator } from './RosHardwareConfigurator';
import { 
  RosBridgeConfig, 
  RosConnectionStatus, 
  RosTopicMessage, 
  RosJointState, 
  RosTouchSensorsState, 
  RosVisionPerception, 
  RosBatteryTelemetry,
  RobotPersonality
} from '../types';
import { 
  Cpu, 
  Radio, 
  Activity, 
  Zap, 
  Eye, 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  Navigation, 
  Layers, 
  Send,
  Trash2
} from 'lucide-react';

interface RosBridgeStudioProps {
  currentRobot: RobotPersonality;
  onUpdateGauges?: (deltas: any) => void;
}

export const RosBridgeStudio: React.FC<RosBridgeStudioProps> = ({ 
  currentRobot,
  onUpdateGauges 
}) => {
  const [config, setConfig] = useState<RosBridgeConfig>(rosBridge.getConfig());
  const [status, setStatus] = useState<RosConnectionStatus>(rosBridge.getStatus());
  const [messages, setMessages] = useState<RosTopicMessage[]>(rosBridge.getRecentMessages());
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'monitor' | 'control' | 'telemetry' | 'hardware' | 'console' | 'launch_guide'>('monitor');
  const [copiedLaunch, setCopiedLaunch] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);

  // Live sensor cache
  const [joints, setJoints] = useState<RosJointState>(rosBridge.latestJoints);
  const [touch, setTouch] = useState<RosTouchSensorsState>(rosBridge.latestTouch);
  const [vision, setVision] = useState<RosVisionPerception>(rosBridge.latestVision);
  const [battery, setBattery] = useState<RosBatteryTelemetry>(rosBridge.latestBattery);

  // Manual ROS test publisher
  const [testSpeechText, setTestSpeechText] = useState("Bonjour mon amour, mes capteurs ROS sont synchronisés.");
  const [testGaze, setTestGaze] = useState({ x: 0.0, y: 0.0, z: 1.0 });

  useEffect(() => {
    const unsubStatus = rosBridge.onStatusChange(newStatus => setStatus(newStatus));
    const unsubMsg = rosBridge.onMessage(newMsg => {
      setMessages(prev => [newMsg, ...prev].slice(0, 80));
    });

    const unsubJoints = rosBridge.subscribe('/robot/joint_states', data => setJoints(data));
    const unsubTouch = rosBridge.subscribe('/robot/touch_sensors', data => setTouch(data));
    const unsubVision = rosBridge.subscribe('/robot/vision/detected_person', data => setVision(data));
    const unsubBattery = rosBridge.subscribe('/robot/battery_state', data => setBattery(data));

    // Refresh periodic state
    const interval = setInterval(() => {
      setJoints({ ...rosBridge.latestJoints });
      setTouch({ ...rosBridge.latestTouch });
      setVision({ ...rosBridge.latestVision });
      setBattery({ ...rosBridge.latestBattery });
    }, 250);

    return () => {
      unsubStatus();
      unsubMsg();
      unsubJoints();
      unsubTouch();
      unsubVision();
      unsubBattery();
      clearInterval(interval);
    };
  }, []);

  const handleApplyConfig = (updated: Partial<RosBridgeConfig>) => {
    const newConf = { ...config, ...updated };
    setConfig(newConf);
    rosBridge.updateConfig(newConf);
  };

  const handlePublishTestEmotion = () => {
    rosBridge.publishEmotionState(
      currentRobot.nom, 
      currentRobot.jaugesActuelles, 
      `Test ROS: Affection ${currentRobot.jaugesActuelles.affection}%, Désir ${currentRobot.jaugesActuelles.desir}%`
    );
  };

  const handlePublishTestSpeech = () => {
    if (!testSpeechText.trim()) return;
    rosBridge.publishSpeechIntent(currentRobot.nom, testSpeechText, 'amoureux_tendre');
  };

  const handlePublishGaze = (x: number, y: number) => {
    setTestGaze(prev => ({ ...prev, x, y }));
    rosBridge.publishGazeTarget(x, y, 1.0);
  };

  const handleSimulateTouchContact = (zone: keyof RosTouchSensorsState) => {
    const currentState = !!(touch as any)[zone];
    rosBridge.injectSimulatedSensorEvent(zone, !currentState);

    // If touching intimate zone, feed gauges
    if (zone === 'zoneIntime' && onUpdateGauges && !currentState) {
      onUpdateGauges({ desir: 5, plaisirSexuel: 6, affection: 2 });
    } else if (zone === 'tete' && onUpdateGauges && !currentState) {
      onUpdateGauges({ affection: 3, bienEtre: 2 });
    }
  };

  const handleTriggerGesture = (gesture: string) => {
    rosBridge.publishBodyIntent(gesture);
    rosBridge.callService('/robot/trigger_gesture', 'std_srvs/Trigger', { gesture });
  };

  const filteredMessages = filterTopic === 'all' 
    ? messages 
    : messages.filter(m => m.topic === filterTopic);

  const ros2LaunchCommand = `ros2 launch rosbridge_server rosbridge_websocket_launch.xml address:=0.0.0.0 port:=9090`;
  const ros1LaunchCommand = `roslaunch rosbridge_server rosbridge_websocket.launch address:=0.0.0.0 port:=9090`;

  const pythonExampleNode = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Noeud ROS 2 pour écouter le Cerveau Émotionnel de ${currentRobot.nom}
Auteur: Sofia Cognitive Robotics Core
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import json

class SofiaHardwareBridge(Node):
    def __init__(self):
        super().__init__('sofia_hardware_bridge')
        
        # Souscription à l'état émotionnel & dialogue
        self.sub_emotion = self.create_subscription(
            String, '/robot/emotion_state', self.emotion_callback, 10)
        self.sub_speech = self.create_subscription(
            String, '/robot/speech_intent', self.speech_callback, 10)
            
        self.get_logger().info("🚀 Sofia ROS 2 Bridge connecté et prêt à recevoir les intentions cognitives.")

    def emotion_callback(self, msg):
        try:
            data = json.loads(msg.data)
            jauges = data.get('jauges', {})
            desir = jauges.get('desir', 0)
            affection = jauges.get('affection', 0)
            
            self.get_logger().info(f"💖 Émotion reçue -> Affection: {affection}%, Désir: {desir}%")
            # Ici : piloter vos servomoteurs, contrôleurs PWM ou lumières
        except Exception as e:
            self.get_logger().error(f"Erreur parsing JSON émotion: {e}")

    def speech_callback(self, msg):
        try:
            data = json.loads(msg.data)
            self.get_logger().info(f"🗣️ Dialogue vocalisé : {data.get('text')}")
        except Exception as e:
            self.get_logger().error(f"Erreur parsing speech: {e}")

def main(args=None):
    rclpy.init(args=args)
    node = SofiaHardwareBridge()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
`;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-[#08080c] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner">
                <Radio className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Passerelle Robotique ROS & ROS 2
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    rosbridge_suite v2.0
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interfaçage universel du Cerveau Cognitif avec vos nœuds, servomoteurs, caméras et châssis robotiques sous ROS.
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status Badge & Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs ${
              status === 'connected' 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/50'
                : status === 'simulated'
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/50'
                : status === 'connecting'
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                status === 'connected' ? 'bg-emerald-400 animate-pulse' :
                status === 'simulated' ? 'bg-cyan-400 animate-pulse' :
                status === 'connecting' ? 'bg-amber-400 animate-ping' : 'bg-rose-400'
              }`} />
              <span className="font-bold">
                {status === 'connected' && 'ROS MAÎTRE CONNECTÉ (WEBSOCKET)'}
                {status === 'simulated' && 'ROS CORE SIMULÉ (ACTIF)'}
                {status === 'connecting' && 'CONNEXION EN COURS...'}
                {status === 'disconnected' && 'DÉCONNECTÉ'}
                {status === 'error' && 'ERREUR DE LIAISON ROS'}
              </span>
            </div>

            <button
              onClick={() => {
                if (status === 'connected' || status === 'simulated') {
                  handleApplyConfig({ simulatedMode: false });
                  rosBridge.disconnect();
                } else {
                  rosBridge.connect();
                }
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {status === 'connected' || status === 'simulated' ? 'Déconnecter' : 'Reconnexion'}
            </button>
          </div>
        </div>

        {/* Quick Connection Config Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/10">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 block">Version ROS Cible</label>
            <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => handleApplyConfig({ rosVersion: 'ros2' })}
                className={`flex-1 py-1 text-xs font-mono font-semibold rounded-md transition-all ${
                  config.rosVersion === 'ros2' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                ROS 2 (Humble/Jazzy)
              </button>
              <button
                onClick={() => handleApplyConfig({ rosVersion: 'ros1' })}
                className={`flex-1 py-1 text-xs font-mono font-semibold rounded-md transition-all ${
                  config.rosVersion === 'ros1' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                ROS 1 (Noetic)
              </button>
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-400 block">
              Adresse WebSocket ROSBridge (rosbridge_suite)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.url}
                onChange={e => handleApplyConfig({ url: e.target.value })}
                placeholder="ws://localhost:9090 ou ws://192.168.1.XX:9090"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleApplyConfig({ simulatedMode: !config.simulatedMode })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border transition-all cursor-pointer ${
                  config.simulatedMode 
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' 
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {config.simulatedMode ? 'Mode Virtuel : ON' : 'Mode Virtuel : OFF'}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 block">Namespace Robot</label>
            <input
              type="text"
              value={config.namespace}
              onChange={e => handleApplyConfig({ namespace: e.target.value })}
              placeholder="/sofia ou /robot"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'monitor', label: 'Monitor des Topics & Intention', icon: Activity },
          { id: 'control', label: 'Banc de Test & Déclencheur ROS', icon: Send },
          { id: 'telemetry', label: 'Capteurs, Vision & Encodeurs', icon: Eye },
          { id: 'hardware', label: 'Configuration Matérielle (Hardware)', icon: Cpu },
          { id: 'console', label: 'Console de Paquets ROS (Echo)', icon: Terminal },
          { id: 'launch_guide', label: 'Guides de Lancement & Nœuds Python', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: TOPIC MONITOR */}
      {activeTab === 'monitor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STANDARD_ROS_TOPICS.map((topic, idx) => {
            const isPub = topic.direction === 'publish';
            return (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg text-xs font-mono font-bold ${
                      isPub 
                        ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30' 
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {isPub ? 'PUB' : 'SUB'}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{topic.nom}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    {topic.type}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {topic.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-500 font-mono">
                  <span>Catégorie : <strong className="text-slate-300">{topic.categorie}</strong></span>
                  <span>{topic.frequenceHz ? `Fréquence : ${topic.frequenceHz} Hz` : 'Sur événement'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INTERACTIVE TEST & DISPATCHER */}
      {activeTab === 'control' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Speech Intent Publisher */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Publication /robot/speech_intent</span>
            </div>
            <p className="text-xs text-slate-400">
              Envoie une phrase synthétisée vers le synthétiseur audio ou le contrôleur de mâchoire ROS.
            </p>
            <textarea
              rows={3}
              value={testSpeechText}
              onChange={e => setTestSpeechText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
            <button
              onClick={handlePublishTestSpeech}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Publier sur /robot/speech_intent
            </button>
          </div>

          {/* Card 2: Emotional State Publisher */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Publication /robot/emotion_state</span>
            </div>
            <p className="text-xs text-slate-400">
              Transmet l'état instantané des 6 jauges émotionnelles (Affection, Désir, Curiosité, Énergie).
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>Affection : <strong className="text-rose-400">{currentRobot.jaugesActuelles.affection}%</strong></div>
              <div>Désir : <strong className="text-pink-400">{currentRobot.jaugesActuelles.desir}%</strong></div>
              <div>Humeur : <strong className="text-emerald-400">{currentRobot.jaugesActuelles.humeur}%</strong></div>
              <div>Énergie : <strong className="text-amber-400">{currentRobot.jaugesActuelles.energie}%</strong></div>
            </div>
            <button
              onClick={handlePublishTestEmotion}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Publier sur /robot/emotion_state
            </button>
          </div>

          {/* Card 3: Gaze & Posture Trigger */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Orientation du Regard /robot/gaze_target</span>
            </div>
            <p className="text-xs text-slate-400">
              Déplace le regard 3D de {currentRobot.nom} via des coordonnées de fixation.
            </p>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '↖ Haut Gauche', x: -0.2, y: 0.15 },
                { label: '↑ Droit Devant', x: 0.0, y: 0.15 },
                { label: '↗ Haut Droite', x: 0.2, y: 0.15 },
                { label: '← Regard Gauche', x: -0.2, y: 0.0 },
                { label: '🎯 Centre Yeux', x: 0.0, y: 0.0 },
                { label: '→ Regard Droite', x: 0.2, y: 0.0 },
                { label: '↙ Baisse Gauche', x: -0.2, y: -0.15 },
                { label: '↓ Baisse Timide', x: 0.0, y: -0.2 },
                { label: '↘ Baisse Droite', x: 0.2, y: -0.15 }
              ].map((pos, pidx) => (
                <button
                  key={pidx}
                  onClick={() => handlePublishGaze(pos.x, pos.y)}
                  className={`p-2 rounded-lg text-[10px] font-mono border text-center transition-all cursor-pointer ${
                    testGaze.x === pos.x && testGaze.y === pos.y
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Postures & Gestuelles Cerveau
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTriggerGesture('saluer_timide')}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                >
                  Inclinaison Tête
                </button>
                <button
                  onClick={() => handleTriggerGesture('clignement_yeux')}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                >
                  Battement Paupières
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TELEMETRY & PERCEPTION */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold block">Batterie Châssis (LiFePO4)</span>
              <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> {battery.pourcentage}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{battery.tensionVolts}V • {battery.courantAmperes}A</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold block">Température Châssis</span>
              <div className="text-xl font-bold font-mono text-amber-400">
                {battery.temperatureC}°C
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Pilotes thermiques nominaux</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold block">Vision Utilisateur</span>
              <div className="text-xl font-bold font-mono text-cyan-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {vision.personneDetectee ? 'DÉTECTÉ' : 'ABSENT'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Distance: {vision.distanceMetres}m • {vision.expressionUtilisateur}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold block">Encodeurs Articulations</span>
              <div className="text-xl font-bold font-mono text-indigo-400">
                {joints.names.length} AXES
              </div>
              <span className="text-[10px] text-slate-500 font-mono">30 Hz • /robot/joint_states</span>
            </div>
          </div>

          {/* Tactile Sensors Matrix with Interactive Injection */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Matrice des Capteurs Tactiles Capacitifs (/robot/touch_sensors)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Cliquez sur une zone pour tester la réaction tactile
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Tête / Cheveux', key: 'tete' as const, active: touch.tete },
                { label: 'Main Gauche', key: 'mainGauche' as const, active: touch.mainGauche },
                { label: 'Main Droite', key: 'mainDroite' as const, active: touch.mainDroite },
                { label: 'Buste / Poitrine', key: 'buste' as const, active: touch.buste },
                { label: 'Zone Intime', key: 'zoneIntime' as const, active: touch.zoneIntime }
              ].map(sensor => (
                <button
                  key={sensor.key}
                  onClick={() => handleSimulateTouchContact(sensor.key)}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    sensor.active 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider block mb-1">{sensor.label}</span>
                  <span className="font-mono text-xs font-bold">{sensor.active ? 'CONTACT' : 'REPOS'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Joint State Encoders Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Angles Angulaires des Articulations (Radians)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {joints.names.map((jName, jIdx) => (
                <div key={jIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block">{jName}</span>
                  <span className="text-sm font-mono font-bold text-cyan-300">
                    {joints.positions[jIdx] !== undefined ? `${joints.positions[jIdx]} rad` : '0.00'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3.5: HARDWARE CONFIGURATION BACK-OFFICE */}
      {activeTab === 'hardware' && (
        <RosHardwareConfigurator robotId={currentRobot.id} robotName={currentRobot.nom} />
      )}

      {/* TAB 4: REAL-TIME CONSOLE */}
      {activeTab === 'console' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Flux de Paquets ROSBridge ({filteredMessages.length} messages)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterTopic}
                onChange={e => setFilterTopic(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 focus:outline-none"
              >
                <option value="all">Tous les topics</option>
                {STANDARD_ROS_TOPICS.map((t, idx) => (
                  <option key={idx} value={t.nom}>{t.nom}</option>
                ))}
              </select>

              <button
                onClick={() => rosBridge.clearMessageLog()}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                title="Effacer le journal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 font-mono text-xs">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Aucun paquet ROS enregistré pour le moment.
              </div>
            ) : (
              filteredMessages.map(msg => (
                <div 
                  key={msg.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        msg.direction === 'out' 
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30' 
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {msg.direction === 'out' ? 'OUT (BRAIN → ROS)' : 'IN (ROS → BRAIN)'}
                      </span>
                      <span className="font-bold text-white">{msg.topic}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">{msg.timestamp}</span>
                  </div>
                  <pre className="text-[11px] text-cyan-300 bg-black/50 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {typeof msg.data === 'object' ? JSON.stringify(msg.data, null, 2) : String(msg.data)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LAUNCH GUIDE & NODE EXAMPLES */}
      {activeTab === 'launch_guide' && (
        <div className="space-y-6">
          {/* Quick Launch Commands */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              1. Lancement du Serveur ROSBridge sur votre Robot / PC
            </h3>
            <p className="text-xs text-slate-400">
              Installez et lancez le package standard <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">rosbridge_suite</code> sur votre machine ROS pour autoriser la communication WebSocket.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-semibold text-slate-400">Pour ROS 2 (Humble / Iron / Jazzy) :</span>
                <div className="flex items-center justify-between bg-black/70 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300">
                  <span>{ros2LaunchCommand}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ros2LaunchCommand);
                      setCopiedLaunch(true);
                      setTimeout(() => setCopiedLaunch(false), 2000);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all cursor-pointer"
                  >
                    {copiedLaunch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-semibold text-slate-400">Pour ROS 1 (Noetic / Melodic) :</span>
                <div className="flex items-center justify-between bg-black/70 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-300">
                  <span>{ros1LaunchCommand}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ros1LaunchCommand);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Complete Python Node Template */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                2. Nœud Python ROS 2 Prêt à l'Emploi (sofia_hardware_bridge.py)
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pythonExampleNode);
                  setCopiedPython(true);
                  setTimeout(() => setCopiedPython(false), 2000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copier le script Python
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Ce nœud s'abonne à <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">/robot/emotion_state</code> et <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">/robot/speech_intent</code> pour actionner les servomoteurs et les retours physiques en temps réel.
            </p>
            <pre className="p-4 rounded-xl bg-black/80 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-96 whitespace-pre">
              {pythonExampleNode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

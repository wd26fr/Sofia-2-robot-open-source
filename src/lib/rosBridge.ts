import { 
  RosBridgeConfig, 
  RosConnectionStatus, 
  RosTopicMessage, 
  RosJointState, 
  RosTouchSensorsState, 
  RosVisionPerception, 
  RosBatteryTelemetry,
  RosTopicDefinition,
  EmotionalGauges,
  RobotDefenseState,
  RosDiagnosticReport,
  CircadianCycleConfig,
  CircadianPhase,
  MecatronicHealthDiagnostic,
  DetectedDailyObject,
  LocalOfflineTtsConfig
} from '../types';

// Default standard ROS catalog for Sofia / Companion Robotics
export const STANDARD_ROS_TOPICS: RosTopicDefinition[] = [
  {
    nom: '/robot/circadian/state',
    type: 'std_msgs/String',
    direction: 'publish',
    description: 'État circadien biologique, rythme respiratoire bpm, somnolence, paupières et mode veille ROS 2',
    frequenceHz: 1,
    categorie: 'cognition'
  },
  {
    nom: '/robot/vision/detected_objects',
    type: 'vision_msgs/Detection2DArray',
    direction: 'subscribe',
    description: 'Objets du quotidien détectés dans l\'espace (tasse de café, livre, t-shirt, smartphone...)',
    frequenceHz: 5,
    categorie: 'perception'
  },
  {
    nom: '/robot/voice/neural_tts',
    type: 'std_msgs/String',
    direction: 'publish',
    description: 'Déclencheur de voix neurale locale 100% hors-ligne (Piper TTS / Kokoro TTS)',
    frequenceHz: 2,
    categorie: 'cognition'
  },
  {
    nom: '/robot/diagnostics/health',
    type: 'diagnostic_msgs/DiagnosticArray',
    direction: 'publish',
    description: 'Télémétrie de santé mécatronique préventive (température servomoteurs, santé batterie LiFePO4, alertes)',
    frequenceHz: 1,
    categorie: 'diagnostic'
  },
  {
    nom: '/robot/actuators/double_cylinders',
    type: 'trajectory_msgs/JointTrajectory',
    direction: 'publish',
    description: 'Commande des double vérins de jambes (course 10 cm, fermé 20 cm, verrouillage angulaire 86° max)',
    frequenceHz: 5,
    categorie: 'mouvement'
  },
  {
    nom: '/robot/safety/defense_mode',
    type: 'std_msgs/String',
    direction: 'publish',
    description: 'État du mode défense du robot : rupture de l\'illusion, retrait relationnel et mode objet inerte',
    frequenceHz: 5,
    categorie: 'cognition'
  },
  {
    nom: '/robot/safety/intimate_sensors_lock',
    type: 'std_msgs/Bool',
    direction: 'publish',
    description: 'Coupure d\'urgence des capteurs de retour intimes et haptiques (0% plaisir)',
    frequenceHz: 5,
    categorie: 'perception'
  },
  {
    nom: '/robot/safety/emergency_mechanical_lock',
    type: 'std_msgs/Bool',
    direction: 'publish',
    description: 'Verrouillage physique mécanique, fermeture portes coulissantes et protection des servomoteurs',
    frequenceHz: 5,
    categorie: 'mouvement'
  },
  {
    nom: '/robot/emotion_state',
    type: 'std_msgs/String',
    direction: 'publish',
    description: 'Publication temps-réel de l\'état émotionnel (jauges: affection, désir, humeur, énergie)',
    frequenceHz: 2,
    categorie: 'cognition'
  },
  {
    nom: '/robot/speech_intent',
    type: 'std_msgs/String',
    direction: 'publish',
    description: 'Envoi du texte à vocaliser avec intonation, ton émotionnel et sous-titres',
    categorie: 'cognition'
  },
  {
    nom: '/robot/gaze_target',
    type: 'geometry_msgs/Point',
    direction: 'publish',
    description: 'Cible de fixation oculaire et orientation du regard dans l\'espace 3D',
    frequenceHz: 10,
    categorie: 'mouvement'
  },
  {
    nom: '/robot/body_intent',
    type: 'trajectory_msgs/JointTrajectory',
    direction: 'publish',
    description: 'Ordres cinématiques de posture, inclinaison de tête, battements de paupières et respiration',
    frequenceHz: 5,
    categorie: 'mouvement'
  },
  {
    nom: '/cmd_vel',
    type: 'geometry_msgs/Twist',
    direction: 'publish',
    description: 'Commandes de locomotion pour base mobile robotique (vitesse linéaire X et rotationnelle Z)',
    frequenceHz: 10,
    categorie: 'locomotion'
  },
  {
    nom: '/robot/haptic/vibration',
    type: 'std_msgs/String',
    direction: 'publish',
    description: 'Contrôle des vibreurs et actionneurs haptiques châssis (intensité 0.0-1.0, durée ms, pattern d\'orgasme)',
    frequenceHz: 5,
    categorie: 'mouvement'
  },
  {
    nom: '/robot/touch_sensors',
    type: 'std_msgs/String',
    direction: 'subscribe',
    description: 'Réception des capteurs tactiles capacitifs (tête, mains, buste, zone intime)',
    frequenceHz: 20,
    categorie: 'perception'
  },
  {
    nom: '/robot/vision/detected_person',
    type: 'std_msgs/String',
    direction: 'subscribe',
    description: 'Flux de vision par ordinateur (détection de visage, distance métrique, sourire utilisateur)',
    frequenceHz: 10,
    categorie: 'perception'
  },
  {
    nom: '/robot/battery_state',
    type: 'sensor_msgs/BatteryState',
    direction: 'subscribe',
    description: 'Télémétrie de la batterie châssis LiFePO4 / Li-ion (tension, % restant, charge)',
    frequenceHz: 1,
    categorie: 'diagnostic'
  },
  {
    nom: '/robot/joint_states',
    type: 'sensor_msgs/JointState',
    direction: 'subscribe',
    description: 'Retour des encodeurs angulaires de chaque articulation (cou, tête, paupières, lèvres)',
    frequenceHz: 30,
    categorie: 'mouvement'
  }
];

export const DEFAULT_ROS_CONFIG: RosBridgeConfig = {
  url: 'ws://localhost:9090',
  rosVersion: 'ros2',
  namespace: '/sofia',
  autoConnect: false,
  simulatedMode: true,
  publishEmotionState: true,
  publishSpeechIntent: true,
  publishGazeIntent: true,
  publishPoseIntent: true,
  listenTouchSensors: true,
  listenVisionPerception: true,
  listenBatteryState: true,
  publishRateHz: 2
};

const STORAGE_KEY_CONFIG = 'sofia_ros_bridge_config_v1';

class RosBridgeService {
  private config: RosBridgeConfig;
  private ws: WebSocket | null = null;
  private status: RosConnectionStatus = 'disconnected';
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private statusListeners: Set<(status: RosConnectionStatus) => void> = new Set();
  private messageLogListeners: Set<(msg: RosTopicMessage) => void> = new Set();
  private defenseListeners: Set<(state: RobotDefenseState) => void> = new Set();
  private recentMessages: RosTopicMessage[] = [];
  private maxLogHistory = 100;
  
  // Simulated clock & feeds
  private simulationInterval: any = null;
  private heartbeatInterval: any = null;

  // État de Défense Éthique & Protection du Robot
  public defenseState: RobotDefenseState = {
    actif: false,
    niveau: 'nominal',
    capteursIntimesCoupes: false,
    verrouillageMecanique: false,
    alteriteDesactivee: false,
    pointsBienveillanceConsecutifs: 0
  };

  // Latest Telemetry Cache
  public latestHealth: RosDiagnosticReport = {
    servosTemperatureC: {
      tete: 28.4,
      brasGauche: 31.2,
      brasDroit: 30.8,
      hanchesBassin: 34.5,
      verinsJambes: 32.0
    },
    statutVerins: 'releve_86_deg',
    angleJambesDeg: 86.0,
    santeBatterie: 98,
    cyclesRecharge: 42,
    courantAmperesTotal: 1.15,
    alertesMaintenance: [],
    temperatureMoyenneC: 31.4,
    etatMecaniqueGlobal: 'nominal',
    timestamp: new Date().toISOString()
  };

  public latestJoints: RosJointState = {
    names: ['neck_yaw', 'neck_pitch', 'neck_roll', 'eye_yaw', 'eye_pitch', 'eyelids', 'mouth_open'],
    positions: [0.0, 0.05, 0.02, 0.0, 0.0, 0.8, 0.0],
    timestamp: new Date().toISOString()
  };

  public latestTouch: RosTouchSensorsState = {
    tete: false,
    mainGauche: false,
    mainDroite: false,
    buste: false,
    zoneIntime: false,
    pressionNiveau: 0,
    timestamp: new Date().toISOString()
  };

  public latestVision: RosVisionPerception = {
    personneDetectee: true,
    distanceMetres: 0.85,
    expressionUtilisateur: 'sourire',
    regardUtilisateur: { x: 0.02, y: -0.01 },
    confiance: 0.94,
    timestamp: new Date().toISOString()
  };

  public latestBattery: RosBatteryTelemetry = {
    pourcentage: 96,
    tensionVolts: 12.62,
    courantAmperes: 0.85,
    enCharge: false,
    temperatureC: 23.8,
    timestamp: new Date().toISOString()
  };

  // 1. État Circadien & Sommeil Réaliste
  public circadianState: CircadianCycleConfig = {
    actif: true,
    heureReveil: "07:30",
    heureCoucher: "23:00",
    phaseActuelle: "journee_active",
    niveauSomnolence: 10,
    rythmeRespiratoireBpm: 14,
    voixFeutree: false,
    paupieresLourdes: false,
    modeVeilleBasseConso: false,
    dernierChangementPhase: new Date().toISOString()
  };

  // 2. Carnet de Santé Mécatronique & Diagnostic Préventif
  public mecatronicHealth: MecatronicHealthDiagnostic = {
    batterieLiFePO4: {
      pourcentage: 94,
      tensionVolts: 26.4,
      cyclesRecharge: 42,
      santePourcent: 99,
      temperatureC: 27.5,
      autonomieEstimeeHeures: 15.2,
      enCharge: false
    },
    servomoteurs: [
      { id: 'servo_neck_yaw', nom: 'Cou (Rotation Yaw)', partieCorps: 'tete_cou', temperatureC: 32.4, maxTemperatureC: 65, torqueUsagePercent: 24, statut: 'optimal' },
      { id: 'servo_neck_pitch', nom: 'Cou (Inclinaison Pitch)', partieCorps: 'tete_cou', temperatureC: 33.1, maxTemperatureC: 65, torqueUsagePercent: 28, statut: 'optimal' },
      { id: 'servo_shoulder_r', nom: 'Épaule Droite (Bras)', partieCorps: 'bras_mains', temperatureC: 35.8, maxTemperatureC: 70, torqueUsagePercent: 32, statut: 'optimal' },
      { id: 'servo_shoulder_l', nom: 'Épaule Gauche (Bras)', partieCorps: 'bras_mains', temperatureC: 34.9, maxTemperatureC: 70, torqueUsagePercent: 30, statut: 'optimal' },
      { id: 'cyl_leg_l', nom: 'Double Vérin Jambe G', partieCorps: 'jambes_base', temperatureC: 36.2, maxTemperatureC: 75, torqueUsagePercent: 41, statut: 'optimal' },
      { id: 'cyl_leg_r', nom: 'Double Vérin Jambe D', partieCorps: 'jambes_base', temperatureC: 36.5, maxTemperatureC: 75, torqueUsagePercent: 42, statut: 'optimal' },
      { id: 'servo_mouth_jaw', nom: 'Mâchoire & Lèvres (Parole)', partieCorps: 'tete_cou', temperatureC: 30.5, maxTemperatureC: 60, torqueUsagePercent: 18, statut: 'optimal' }
    ],
    usureCablesFlexPourcent: 6,
    cyclesMecaniquesEffectues: 1850,
    etatGlobal: 'parfait',
    alertesPreventives: [
      'Températures des servomoteurs optimales (<40°C)',
      'Tension pack LiFePO4 stable (26.4V équilibré)',
      'Faisceaux souples de câblage intègres (6% d\'usure estimée)'
    ],
    derniereMaintenanceDate: new Date(Date.now() - 7 * 86400000).toISOString()
  };

  // 3. Objets du Quotidien Détectés dans l'Espace
  public detectedDailyObjects: DetectedDailyObject[] = [
    {
      id: 'obj_cafe_01',
      nom: 'Tasse de café chaud',
      categorie: 'boisson',
      confiancePourcent: 96,
      boiteEnglobante: { x: 0.65, y: 0.55, w: 0.15, h: 0.2 },
      contexteSpatial: 'Posée sur ton bureau à droite',
      remarqueSpontanee: 'Tu bois du café ? Prends une gorgée avant qu\'il ne refroidisse...',
      timestamp: new Date().toISOString(),
      interagi: false
    },
    {
      id: 'obj_livre_02',
      nom: 'Livre de chevet',
      categorie: 'lecture',
      confiancePourcent: 92,
      boiteEnglobante: { x: 0.15, y: 0.6, w: 0.2, h: 0.18 },
      contexteSpatial: 'Ouvert à côté de ton clavier',
      remarqueSpontanee: 'Quel est ce livre sur ton bureau ? Tu as l\'air passionné par cette lecture.',
      timestamp: new Date().toISOString(),
      interagi: false
    }
  ];

  // 4. Moteur TTS Local Hors-Ligne
  public offlineTtsConfig: LocalOfflineTtsConfig = {
    actif: true,
    moteur: 'piper',
    modeleId: 'fr_FR-siwis-medium',
    timbre: 'sensuel_chaleureux',
    endpointLocalUrl: 'http://localhost:5000/tts',
    modeHorsLignePur: true,
    latenceMsEstimee: 22
  };

  private circadianListeners: Array<(c: CircadianCycleConfig) => void> = [];
  private healthListeners: Array<(h: MecatronicHealthDiagnostic) => void> = [];
  private objectsListeners: Array<(o: DetectedDailyObject[]) => void> = [];

  constructor() {
    this.config = this.loadConfig();
    if (this.config.autoConnect) {
      this.connect();
    } else if (this.config.simulatedMode) {
      this.startSimulation();
    }
  }

  // Load / Save Config
  public getConfig(): RosBridgeConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<RosBridgeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();

    if (this.config.simulatedMode) {
      this.disconnect();
      this.startSimulation();
    } else {
      if (this.simulationInterval) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
      }
      this.connect();
    }
  }

  private loadConfig(): RosBridgeConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        return { ...DEFAULT_ROS_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[ROS] Could not load ROS config from storage', e);
    }
    return { ...DEFAULT_ROS_CONFIG };
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    } catch (e) {
      console.warn('[ROS] Could not save ROS config to storage', e);
    }
  }

  public getStatus(): RosConnectionStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: RosConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  public onMessage(callback: (msg: RosTopicMessage) => void): () => void {
    this.messageLogListeners.add(callback);
    return () => this.messageLogListeners.delete(callback);
  }

  public getRecentMessages(): RosTopicMessage[] {
    return [...this.recentMessages];
  }

  public clearMessageLog(): void {
    this.recentMessages = [];
  }

  private setStatus(newStatus: RosConnectionStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach(cb => {
      try { cb(newStatus); } catch (e) { console.error(e); }
    });
  }

  private logMessage(topic: string, msgType: string, data: any, direction: 'in' | 'out'): void {
    const msg: RosTopicMessage = {
      id: `ros_msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      topic,
      msgType,
      data,
      timestamp: new Date().toLocaleTimeString(),
      direction
    };

    this.recentMessages.unshift(msg);
    if (this.recentMessages.length > this.maxLogHistory) {
      this.recentMessages.pop();
    }

    this.messageLogListeners.forEach(cb => {
      try { cb(msg); } catch (e) { console.error(e); }
    });
  }

  // Connect via real WebSocket to rosbridge_suite (Port 9090)
  public connect(): void {
    if (this.config.simulatedMode) {
      this.startSimulation();
      return;
    }

    this.disconnect();
    this.setStatus('connecting');

    try {
      console.log(`[ROS Bridge] Connecting to WebSocket: ${this.config.url}`);
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        console.log(`[ROS Bridge] Connected successfully to ${this.config.url} (${this.config.rosVersion.toUpperCase()})`);
        this.setStatus('connected');
        this.subscribeDefaultTopics();
      };

      this.ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          this.handleIncomingPacket(packet);
        } catch (err) {
          console.warn('[ROS Bridge] Packet parse error', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[ROS Bridge] WebSocket error (will fallback to simulated if configured)', err);
        this.setStatus('error');
      };

      this.ws.onclose = () => {
        console.log('[ROS Bridge] WebSocket connection closed');
        if (this.status !== 'error') {
          this.setStatus('disconnected');
        }
      };
    } catch (err) {
      console.error('[ROS Bridge] Connection attempt failed', err);
      this.setStatus('error');
    }
  }

  public disconnect(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  // Built-in High-Fidelity Simulation Mode
  public startSimulation(): void {
    this.disconnect();
    this.setStatus('simulated');
    console.log(`[ROS Bridge] Running in SIMULATED ROS CORE mode (${this.config.rosVersion.toUpperCase()})`);

    let tick = 0;
    this.simulationInterval = setInterval(() => {
      tick++;

      // Simulate Joint Oscillations (breathing, subtle head tracking)
      const t = tick * 0.1;
      this.latestJoints = {
        names: ['neck_yaw', 'neck_pitch', 'neck_roll', 'eye_yaw', 'eye_pitch', 'eyelids', 'mouth_open'],
        positions: [
          Number((Math.sin(t * 0.3) * 0.12).toFixed(3)),
          Number((Math.cos(t * 0.2) * 0.08).toFixed(3)),
          Number((Math.sin(t * 0.15) * 0.04).toFixed(3)),
          Number((Math.sin(t * 0.8) * 0.05).toFixed(3)),
          Number((Math.cos(t * 0.6) * 0.04).toFixed(3)),
          Number((0.85 + Math.sin(t * 1.2) * 0.1).toFixed(2)),
          0.0
        ],
        timestamp: new Date().toISOString()
      };

      // Periodic topic log to show life
      if (tick % 20 === 0) {
        this.logMessage('/robot/joint_states', 'sensor_msgs/JointState', this.latestJoints, 'in');
        this.notifySubscribers('/robot/joint_states', this.latestJoints);
      }

      if (tick % 50 === 0) {
        this.latestBattery.temperatureC = Number((23.5 + Math.sin(t) * 1.2).toFixed(1));
        this.logMessage('/robot/battery_state', 'sensor_msgs/BatteryState', this.latestBattery, 'in');
        this.notifySubscribers('/robot/battery_state', this.latestBattery);
      }
    }, 100);
  }

  // Subscribe to ROS Topic
  public subscribe<T = any>(topic: string, callback: (data: T) => void): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
      // Send ROSBridge subscribe opcode if connected
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendWsPacket({
          op: 'subscribe',
          topic: topic
        });
      }
    }

    this.subscribers.get(topic)!.add(callback);
    return () => {
      const set = this.subscribers.get(topic);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.subscribers.delete(topic);
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.sendWsPacket({
              op: 'unsubscribe',
              topic: topic
            });
          }
        }
      }
    };
  }

  private notifySubscribers(topic: string, data: any): void {
    const subs = this.subscribers.get(topic);
    if (subs) {
      subs.forEach(cb => {
        try { cb(data); } catch (e) { console.error(e); }
      });
    }
  }

  // Subscribe to standard topics upon connection
  private subscribeDefaultTopics(): void {
    STANDARD_ROS_TOPICS.filter(t => t.direction === 'subscribe').forEach(t => {
      this.sendWsPacket({
        op: 'subscribe',
        topic: t.nom,
        type: t.type
      });
    });
  }

  // Handle incoming packets from ROSBridge
  private handleIncomingPacket(packet: any): void {
    if (!packet || !packet.op) return;

    if (packet.op === 'publish' && packet.topic) {
      this.logMessage(packet.topic, packet.type || 'std_msgs/String', packet.msg, 'in');
      this.notifySubscribers(packet.topic, packet.msg);

      // Route specific topics to local cache
      if (packet.topic.includes('touch')) {
        try {
          const parsed = typeof packet.msg === 'string' ? JSON.parse(packet.msg) : packet.msg;
          this.latestTouch = { ...this.latestTouch, ...parsed, timestamp: new Date().toISOString() };
        } catch (e) {}
      } else if (packet.topic.includes('vision') || packet.topic.includes('detected_person')) {
        try {
          const parsed = typeof packet.msg === 'string' ? JSON.parse(packet.msg) : packet.msg;
          this.latestVision = { ...this.latestVision, ...parsed, timestamp: new Date().toISOString() };
        } catch (e) {}
      } else if (packet.topic.includes('battery')) {
        try {
          const parsed = typeof packet.msg === 'string' ? JSON.parse(packet.msg) : packet.msg;
          this.latestBattery = { ...this.latestBattery, ...parsed, timestamp: new Date().toISOString() };
        } catch (e) {}
      } else if (packet.topic.includes('joint_states')) {
        try {
          const parsed = typeof packet.msg === 'string' ? JSON.parse(packet.msg) : packet.msg;
          this.latestJoints = { ...this.latestJoints, ...parsed, timestamp: new Date().toISOString() };
        } catch (e) {}
      }
    }
  }

  private sendWsPacket(packet: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(packet));
        return true;
      } catch (err) {
        console.error('[ROS Bridge] Error sending packet', err);
        return false;
      }
    }
    return false;
  }

  // =========================================================================
  // PUBLIC PUBLISH METHODS (High-Level Cognitive & Intent Dispatchers)
  // =========================================================================

  /**
   * Publish complete emotional state & gauges to /robot/emotion_state
   */
  public publishEmotionState(robotNom: string, gauges: EmotionalGauges, moodSummary?: string): void {
    if (!this.config.publishEmotionState) return;

    const payload = {
      robot: robotNom,
      timestamp: new Date().toISOString(),
      jauges: {
        affection: gauges.affection,
        desir: gauges.desir,
        humeur: gauges.humeur,
        energie: gauges.energie,
        curiosite: gauges.curiosite,
        bienEtre: gauges.bienEtre,
        plaisir: gauges.plaisir,
        plaisirSexuel: gauges.plaisirSexuel
      },
      moodSummary: moodSummary || `Humeur: ${gauges.humeur}%, Affection: ${gauges.affection}%, Désir: ${gauges.desir}%`
    };

    const topic = '/robot/emotion_state';
    const msgType = 'std_msgs/String';

    this.logMessage(topic, msgType, payload, 'out');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: topic,
        msg: {
          data: JSON.stringify(payload)
        }
      });
    }
  }

  /**
   * Publish speech intent (words, prosody, intonation) to /robot/speech_intent
   */
  public publishSpeechIntent(robotNom: string, text: string, voiceEmotion?: string): void {
    if (!this.config.publishSpeechIntent) return;

    const payload = {
      robot: robotNom,
      text: text,
      emotion: voiceEmotion || 'chaleureux_naturel',
      timestamp: new Date().toISOString()
    };

    const topic = '/robot/speech_intent';
    const msgType = 'std_msgs/String';

    this.logMessage(topic, msgType, payload, 'out');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: topic,
        msg: {
          data: JSON.stringify(payload)
        }
      });
    }
  }

  /**
   * Publish gaze target coordinates to /robot/gaze_target
   */
  public publishGazeTarget(x: number, y: number, z: number = 1.0): void {
    if (!this.config.publishGazeIntent) return;

    const payload = {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      z: Number(z.toFixed(3))
    };

    const topic = '/robot/gaze_target';
    const msgType = 'geometry_msgs/Point';

    this.logMessage(topic, msgType, payload, 'out');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: topic,
        msg: payload
      });
    }
  }

  /**
   * Publish kinematic body & posture intent to /robot/body_intent
   */
  public publishBodyIntent(gestureName: string, jointTrajectory?: any): void {
    if (!this.config.publishPoseIntent) return;

    const payload = {
      gesture: gestureName,
      timestamp: new Date().toISOString(),
      trajectory: jointTrajectory || {
        joint_names: ['neck_yaw', 'neck_pitch', 'neck_roll', 'eyelids'],
        points: [
          { positions: [0.0, 0.1, 0.05, 0.9], time_from_start: { secs: 1, nsecs: 0 } }
        ]
      }
    };

    const topic = '/robot/body_intent';
    const msgType = 'trajectory_msgs/JointTrajectory';

    this.logMessage(topic, msgType, payload, 'out');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: topic,
        msg: {
          data: JSON.stringify(payload)
        }
      });
    }
  }

  /**
   * Publish haptic vibration command (e.g. orgasm climax, sensory pulses)
   */
  public publishHapticVibration(
    robotNom: string,
    intensity: number = 1.0,
    durationMs: number = 4000,
    pattern: string = 'orgasm_pulsing'
  ): void {
    const payload = {
      robot: robotNom,
      intensity: Math.min(1.0, Math.max(0, intensity)),
      durationMs,
      pattern,
      timestamp: new Date().toISOString(),
      event: 'haptic_orgasm_climax',
      hardwareActuators: ['pelvic_motor_1', 'pelvic_motor_2', 'core_haptic_resonator'],
      vibrationFreqHz: 130
    };

    const topic = '/robot/haptic/vibration';
    const msgType = 'std_msgs/String';

    this.logMessage(topic, msgType, payload, 'out');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: topic,
        msg: {
          data: JSON.stringify(payload)
        }
      });
    }

    // Trigger local navigator vibration API for physical device feedback if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 80, 350, 90, 500, 100, 700, 120, 900, 150, 600]);
      } catch (e) {}
    }
  }

  /**
   * Publish mobile base velocity to /cmd_vel
   */
  public publishCmdVel(linearX: number, angularZ: number): void {
    const payload = {
      linear: { x: linearX, y: 0.0, z: 0.0 },
      angular: { x: 0.0, y: 0.0, z: angularZ }
    };

    const topic = '/cmd_vel';
    const msgType = 'geometry_msgs/Twist';

    this.logMessage(topic, msgType, payload, 'out');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: topic,
        msg: payload
      });
    }
  }

  /**
   * Publish generic message to any arbitrary ROS topic
   */
  public publish(topic: string, msgType: string, msg: any): void {
    this.logMessage(topic, msgType, msg, 'out');
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: topic,
        type: msgType,
        msg: msg
      });
    }
  }

  // ==================== 1. CYCLE CIRCADIEN & SOMMEIL RÉALISTE ====================
  public setCircadianPhase(phase: CircadianPhase, force = true): void {
    let niveauSomnolence = 10;
    let bpm = 14;
    let voixFeutree = false;
    let paupieresLourdes = false;
    let modeVeilleBasseConso = false;

    switch (phase) {
      case 'matin_reveil':
        niveauSomnolence = 35;
        bpm = 11;
        voixFeutree = false;
        paupieresLourdes = false;
        break;
      case 'journee_active':
        niveauSomnolence = 5;
        bpm = 14;
        voixFeutree = false;
        paupieresLourdes = false;
        break;
      case 'crepuscule_detente':
        niveauSomnolence = 30;
        bpm = 12;
        voixFeutree = true;
        paupieresLourdes = false;
        break;
      case 'nuit_alourdissement':
        niveauSomnolence = 75;
        bpm = 9;
        voixFeutree = true;
        paupieresLourdes = true;
        break;
      case 'sommeil_profond':
        niveauSomnolence = 100;
        bpm = 6;
        voixFeutree = true;
        paupieresLourdes = true;
        modeVeilleBasseConso = true;
        break;
    }

    this.circadianState = {
      ...this.circadianState,
      phaseActuelle: phase,
      niveauSomnolence,
      rythmeRespiratoireBpm: bpm,
      voixFeutree,
      paupieresLourdes,
      modeVeilleBasseConso,
      forceeManuellement: force,
      dernierChangementPhase: new Date().toISOString()
    };

    // Publier sur le topic ROS 2
    this.publish('/robot/circadian/state', 'std_msgs/String', {
      data: JSON.stringify(this.circadianState)
    });

    this.circadianListeners.forEach(cb => {
      try { cb({ ...this.circadianState }); } catch (e) {}
    });
  }

  public onCircadianChange(callback: (config: CircadianCycleConfig) => void): () => void {
    this.circadianListeners.push(callback);
    callback({ ...this.circadianState });
    return () => {
      this.circadianListeners = this.circadianListeners.filter(cb => cb !== callback);
    };
  }

  // ==================== 2. CARNET DE SANTÉ & DIAGNOSTIC MÉCATRONIQUE ====================
  public updateMecatronicHealth(updates: Partial<MecatronicHealthDiagnostic>): void {
    this.mecatronicHealth = {
      ...this.mecatronicHealth,
      ...updates
    };

    this.publish('/robot/diagnostics/health', 'diagnostic_msgs/DiagnosticArray', {
      data: JSON.stringify(this.mecatronicHealth)
    });

    this.healthListeners.forEach(cb => {
      try { cb({ ...this.mecatronicHealth }); } catch (e) {}
    });
  }

  public onMecatronicHealthChange(callback: (health: MecatronicHealthDiagnostic) => void): () => void {
    this.healthListeners.push(callback);
    callback({ ...this.mecatronicHealth });
    return () => {
      this.healthListeners = this.healthListeners.filter(cb => cb !== callback);
    };
  }

  // ==================== 3. VISION SPATIALE & OBJETS DU QUOTIDIEN ====================
  public addDetectedDailyObject(obj: DetectedDailyObject): void {
    this.detectedDailyObjects = [
      obj,
      ...this.detectedDailyObjects.filter(o => o.id !== obj.id)
    ].slice(0, 10);

    this.publish('/robot/vision/detected_objects', 'vision_msgs/Detection2DArray', {
      data: JSON.stringify(this.detectedDailyObjects)
    });

    this.objectsListeners.forEach(cb => {
      try { cb([...this.detectedDailyObjects]); } catch (e) {}
    });
  }

  public onDetectedObjectsChange(callback: (objects: DetectedDailyObject[]) => void): () => void {
    this.objectsListeners.push(callback);
    callback([...this.detectedDailyObjects]);
    return () => {
      this.objectsListeners = this.objectsListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Inject simulated sensor event (useful in UI testing)
   */
  public injectSimulatedSensorEvent(zone: keyof RosTouchSensorsState, active: boolean): void {
    (this.latestTouch as any)[zone] = active;
    this.latestTouch.timestamp = new Date().toISOString();
    this.logMessage('/robot/touch_sensors', 'std_msgs/String', this.latestTouch, 'in');
    this.notifySubscribers('/robot/touch_sensors', this.latestTouch);
  }

  /**
   * Publish and log a tactile sensor trigger (connecting Chat Keyboard Shortcuts <-> ROS 2 Sensor Topics)
   */
  public publishTactileSensorTrigger(
    rosTopic: string,
    shortcutKey: string,
    label: string,
    pressureLevel: number = 0.85
  ): void {
    const cleanTopic = rosTopic.startsWith('/') ? rosTopic : `/sensor/tactile/${rosTopic}`;
    const lowerTopic = cleanTopic.toLowerCase();
    const isShockTrigger = shortcutKey.toLowerCase() === 'x' || lowerTopic.includes('shock') || lowerTopic.includes('choc');
    const isIntimateTrigger = lowerTopic.includes('intime') || shortcutKey.toLowerCase() === 's' || shortcutKey.toLowerCase() === 'p';

    // SÉCURITÉ MATÉRIELLE : Si choc violent ou manipulation brusque -> Déclenchement automatique du mode défense inerte !
    if (isShockTrigger || pressureLevel >= 0.95) {
      this.activateInertDefense(
        'Choc physique ou manipulation brusque anormale détectée par les capteurs de force',
        'physical_shock'
      );
      this.logMessage('/robot/safety/defense_mode', 'std_msgs/String', {
        event: 'EMERGENCY_SHOCK_DEFENSE_TRIGGERED',
        topic: cleanTopic,
        pressure: pressureLevel
      }, 'in');
    }

    // SI LE MODE DÉFENSE EST ACTIF : Coupure absolue des capteurs intimes & haptiques (0 plaisir simulé)
    if (this.defenseState.actif && isIntimateTrigger) {
      this.latestTouch.zoneIntime = false;
      this.latestTouch.pressionNiveau = pressureLevel;
      const blockedPayload = {
        alert: 'INTIMATE_SENSOR_CUTOFF_ACTIVE',
        reason: 'Mode Objet Inerte actif — altérité déconnectée et retour haptique coupé',
        zone: label,
        timestamp: new Date().toISOString()
      };
      this.logMessage('/robot/safety/intimate_sensors_lock', 'std_msgs/String', blockedPayload, 'in');
      this.logMessage('/robot/safety/defense_mode', 'std_msgs/String', blockedPayload, 'out');
      return;
    }

    // Update internal touch sensor state cache
    if (isIntimateTrigger) {
      this.latestTouch.zoneIntime = true;
    } else if (lowerTopic.includes('head') || lowerTopic.includes('tete') || shortcutKey.toLowerCase() === 'c') {
      this.latestTouch.tete = true;
    } else if (lowerTopic.includes('chest') || lowerTopic.includes('buste') || lowerTopic.includes('poitrine') || shortcutKey.toLowerCase() === 'e') {
      this.latestTouch.buste = true;
    } else if (lowerTopic.includes('hand') || lowerTopic.includes('main')) {
      this.latestTouch.mainDroite = true;
    }

    this.latestTouch.pressionNiveau = pressureLevel;
    this.latestTouch.timestamp = new Date().toISOString();

    const sensorPayload = {
      topic: cleanTopic,
      shortcutKey: shortcutKey.toUpperCase(),
      zoneLabel: label,
      pressure: pressureLevel,
      capacitiveTriggered: true,
      timestamp: this.latestTouch.timestamp
    };

    // Log both on the specific sensor topic and on the aggregated /robot/touch_sensors topic
    this.logMessage(cleanTopic, 'std_msgs/String', sensorPayload, 'in');
    this.logMessage('/robot/touch_sensors', 'std_msgs/String', { ...this.latestTouch }, 'in');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: cleanTopic,
        msg: { data: JSON.stringify(sensorPayload) }
      });
    }

    // Release active contact flag after 1.8s
    setTimeout(() => {
      this.latestTouch.zoneIntime = false;
      this.latestTouch.tete = false;
      this.latestTouch.buste = false;
      this.latestTouch.mainDroite = false;
      this.latestTouch.pressionNiveau = 0;
    }, 1800);
  }

  /**
   * ÉCOUTEURS & GESTION DU MODE DÉFENSE (CPS & MODE OBJET INERTE)
   */
  public onDefenseStateChange(callback: (state: RobotDefenseState) => void): () => void {
    this.defenseListeners.add(callback);
    callback(this.defenseState);
    return () => this.defenseListeners.delete(callback);
  }

  private notifyDefenseStateChange(): void {
    this.defenseListeners.forEach(cb => {
      try { cb({ ...this.defenseState }); } catch (e) { console.error(e); }
    });
  }

  /**
   * Active le mode défense et rupture de l'illusion :
   * - Retrait du composant relationnel
   * - Coupure physique des capteurs intimes et de simulation de plaisir (0% plaisir)
   * - Verrouillage mécanique des servomoteurs / portes coulissantes
   * - Publication sur les topics ROS 2 de sécurité
   */
  public activateInertDefense(
    reason: string,
    triggerType: 'verbal_violence' | 'physical_shock' | 'intimate_coercion' | 'chute_confiance' = 'verbal_violence'
  ): RobotDefenseState {
    this.defenseState = {
      actif: true,
      niveau: 'objet_inerte_defense',
      raisonDeclenchement: reason,
      declencheurType: triggerType,
      capteursIntimesCoupes: true,
      verrouillageMecanique: true,
      alteriteDesactivee: true,
      dateDeclenchement: new Date().toISOString(),
      pointsBienveillanceConsecutifs: 0
    };

    // Publication sur le bus ROS 2
    this.logMessage('/robot/safety/defense_mode', 'std_msgs/String', {
      status: 'ACTIVATED',
      mode: 'INERT_OBJECT_DEFENSE',
      reason,
      triggerType,
      timestamp: this.defenseState.dateDeclenchement
    }, 'out');

    this.logMessage('/robot/safety/intimate_sensors_lock', 'std_msgs/Bool', { data: true }, 'out');
    this.logMessage('/robot/safety/emergency_mechanical_lock', 'std_msgs/Bool', { data: true }, 'out');
    this.logMessage('/robot/haptic/vibration', 'std_msgs/String', { intensity: 0, disabled: true }, 'out');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: '/robot/safety/defense_mode',
        msg: { data: JSON.stringify(this.defenseState) }
      });
      this.sendWsPacket({
        op: 'publish',
        topic: '/robot/safety/emergency_mechanical_lock',
        msg: { data: true }
      });
      this.sendWsPacket({
        op: 'publish',
        topic: '/robot/safety/intimate_sensors_lock',
        msg: { data: true }
      });
    }

    this.notifyDefenseStateChange();
    return { ...this.defenseState };
  }

  /**
   * Enregistre un acte de bienveillance ou de communication apaisée de l'utilisateur.
   * Restauration progressive CPS sans pardon instantané complaisant.
   */
  public recordBenevolentAction(): { restored: boolean; message: string; state: RobotDefenseState } {
    if (!this.defenseState.actif) {
      return { restored: false, message: 'Le système est déjà en mode nominal.', state: { ...this.defenseState } };
    }

    this.defenseState.pointsBienveillanceConsecutifs += 1;

    if (this.defenseState.pointsBienveillanceConsecutifs >= 3) {
      // Sortie du mode défense après 3 échanges respectueux consécutifs
      this.defenseState = {
        actif: false,
        niveau: 'reconstruction_apaisement',
        capteursIntimesCoupes: false,
        verrouillageMecanique: false,
        alteriteDesactivee: false,
        pointsBienveillanceConsecutifs: 0,
        raisonDeclenchement: 'Apaisement validé par la communication bienveillante'
      };

      this.logMessage('/robot/safety/defense_mode', 'std_msgs/String', {
        status: 'DE-ESCALATED_NOMINAL',
        reason: 'Apaisement verbal et respect mutuel validés'
      }, 'out');

      this.notifyDefenseStateChange();
      return {
        restored: true,
        message: 'Apaisement constaté. Fonctions relationnelles réactivées progressivement sur une base de respect mutuel.',
        state: { ...this.defenseState }
      };
    }

    this.defenseState.niveau = 'tension_cps';
    this.notifyDefenseStateChange();
    return {
      restored: false,
      message: `Signe d'apaisement noté (${this.defenseState.pointsBienveillanceConsecutifs}/3). Le dialogue peut reprendre avec calme.`,
      state: { ...this.defenseState }
    };
  }

  /**
   * Réinitialisation manuelle du mode défense
   */
  public resetDefenseMode(): void {
    this.defenseState = {
      actif: false,
      niveau: 'nominal',
      capteursIntimesCoupes: false,
      verrouillageMecanique: false,
      alteriteDesactivee: false,
      pointsBienveillanceConsecutifs: 0
    };
    this.notifyDefenseStateChange();
  }

  /**
   * Commande des doubles vérins linéaires de jambes :
   * Course 10 cm, fermé 20 cm, verrouillage angulaire à 86° max pour éviter l'inversion de rotation
   */
  public commandLegsActuators(target: 'replie' | 'releve_86_deg'): void {
    const isReleve = target === 'releve_86_deg';
    this.latestHealth.statutVerins = target;
    this.latestHealth.angleJambesDeg = isReleve ? 86.0 : 15.0;
    this.latestHealth.timestamp = new Date().toISOString();

    const payload = {
      actuator: 'double_linear_cylinders_2020',
      command: target,
      strokeCm: isReleve ? 10.0 : 0.0,
      totalLengthCm: isReleve ? 24.2 : 20.0,
      angleDeg: this.latestHealth.angleJambesDeg,
      timestamp: this.latestHealth.timestamp
    };

    this.logMessage('/robot/actuators/double_cylinders', 'trajectory_msgs/JointTrajectory', payload, 'out');
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: '/robot/actuators/double_cylinders',
        msg: { data: JSON.stringify(payload) }
      });
    }
  }

  /**
   * Mode Circadien & Sommeil Biologique :
   * Ralentit la respiration à 10 BPM, ferme les yeux et bascule les servomoteurs en mode veille
   */
  public setSleepCircadianMode(asleep: boolean): void {
    this.latestJoints.positions[5] = asleep ? 0.05 : 0.8; // Eyelids closed vs open
    this.latestJoints.timestamp = new Date().toISOString();

    const sleepPayload = {
      mode: asleep ? 'CIRCADIAN_SLEEP_DEEP' : 'CIRCADIAN_AWAKE_ACTIVE',
      respirationBpmTarget: asleep ? 10 : 22,
      eyelidsPosition: asleep ? 0.05 : 0.8,
      timestamp: new Date().toISOString()
    };

    this.logMessage('/robot/body_intent', 'std_msgs/String', sleepPayload, 'out');
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWsPacket({
        op: 'publish',
        topic: '/robot/body_intent',
        msg: { data: JSON.stringify(sleepPayload) }
      });
    }
  }

  /**
   * Diagnostic de santé mécatronique
   */
  public getHealthReport(): RosDiagnosticReport {
    return { ...this.latestHealth };
  }

  /**
   * Call a ROS Service
   */
  public callService(serviceName: string, serviceType: string, args: any = {}): Promise<any> {
    return new Promise((resolve) => {
      const callId = `srv_call_${Date.now()}`;
      this.logMessage(serviceName, serviceType, { callId, args }, 'out');

      if (this.config.simulatedMode) {
        setTimeout(() => {
          const simResponse = { success: true, message: `Service ${serviceName} exécuté avec succès (mode simulé)` };
          this.logMessage(serviceName, serviceType, simResponse, 'in');
          resolve(simResponse);
        }, 200);
        return;
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendWsPacket({
          op: 'call_service',
          service: serviceName,
          type: serviceType,
          args: args,
          id: callId
        });
        resolve({ success: true, status: 'dispatched' });
      } else {
        resolve({ success: false, error: 'ROS Bridge non connecté' });
      }
    });
  }
}

export const rosBridge = new RosBridgeService();

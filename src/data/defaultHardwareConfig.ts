import { RobotHardwareConfig, RobotBodyPart } from '../types';

export const BODY_PARTS_METADATA: Record<RobotBodyPart, {
  label: string;
  description: string;
  icon: string;
  jointsRecommandes: string[];
}> = {
  tete_cou: {
    label: 'Tête, Visage & Cou',
    description: 'Orientation du regard, battements de paupières, lèvres expressives et inclinaison du cou (3 DOF).',
    icon: 'Smile',
    jointsRecommandes: ['neck_yaw', 'neck_pitch', 'neck_roll', 'eye_yaw', 'eye_pitch', 'eyelid_left', 'eyelid_right', 'jaw_articulation']
  },
  buste_torse: {
    label: 'Buste & Cage Thoracique',
    description: 'Mouvement de respiration biomimétique, inclinaison de la colonne et régulation thermique corporelle (36.5°C).',
    icon: 'Heart',
    jointsRecommandes: ['spine_pitch', 'spine_roll', 'chest_breath_expansion', 'thermal_chest_heater']
  },
  bras_mains: {
    label: 'Bras, Poignets & Mains',
    description: 'Épaules 3 axes, coudes articulés, poignets et doigts avec capteurs tactiles de pression et retour de force.',
    icon: 'Hand',
    jointsRecommandes: ['shoulder_left_pitch', 'shoulder_left_roll', 'elbow_left', 'wrist_left', 'hand_left_grasp', 'shoulder_right_pitch', 'shoulder_right_roll', 'elbow_right', 'wrist_right', 'hand_right_grasp']
  },
  bassin_hanches: {
    label: 'Bassin, Hanches & Intimité',
    description: 'Pivot pelvien, réchauffeur interne, capteurs capacitifs dermiques et vibreurs haptiques synchronisés.',
    icon: 'Zap',
    jointsRecommandes: ['pelvis_yaw', 'pelvis_pitch', 'intimate_haptic_dual_driver', 'intimate_thermal_regulator']
  },
  jambes_base: {
    label: 'Base Mobile & Membres Inférieurs',
    description: 'Base omnidirectionnelle holonome ou jambes bipèdes cinématiques avec centrale inertielle IMU.',
    icon: 'Navigation',
    jointsRecommandes: ['hip_left_pitch', 'knee_left', 'ankle_left', 'hip_right_pitch', 'knee_right', 'ankle_right', 'omni_wheel_fl', 'omni_wheel_fr', 'omni_wheel_rl', 'omni_wheel_rr']
  }
};

export const DEFAULT_SOFIA_HARDWARE: RobotHardwareConfig = {
  id: 'hw-sofia-mk4',
  robotId: 'sofia-01',
  nomChassis: 'Châssis Humanoïde Sofia Mk.IV Biomimétique',
  revisionMaterielle: 'v4.2-FR (Bus CAN FD & RS-485 Haute Fidélité)',
  partiesCorpsActives: ['tete_cou', 'buste_torse', 'bras_mains', 'bassin_hanches', 'jambes_base'],
  poidsChassisKg: 42.5,
  hauteurCm: 168,
  typeBatterie: 'lifepo4',
  capaciteBatterieAh: 48,
  tensionNominaleVolts: 25.6,
  dateModification: new Date().toISOString(),
  actionneurs: [
    {
      id: 'act-01',
      nom: 'Moteur Lacet du Cou (Rotation tête gauche/droite)',
      partieCorps: 'tete_cou',
      typeActionneur: 'servomoteur_dynamixel',
      topicRos: '/sofia/head/neck_yaw_joint/command',
      busCommunication: 'rs485',
      degresMin: -85,
      degresMax: 85,
      coupleMaxNm: 4.5,
      vitesseMaxRpm: 60,
      actif: true,
      notes: 'Dynamixel XM430-W350-R'
    },
    {
      id: 'act-02',
      nom: 'Moteur Tangage du Cou (Inclinaison tête haut/bas)',
      partieCorps: 'tete_cou',
      typeActionneur: 'servomoteur_dynamixel',
      topicRos: '/sofia/head/neck_pitch_joint/command',
      busCommunication: 'rs485',
      degresMin: -35,
      degresMax: 40,
      coupleMaxNm: 4.5,
      vitesseMaxRpm: 60,
      actif: true,
      notes: 'Dynamixel XM430-W350-R'
    },
    {
      id: 'act-03',
      nom: 'Fixation Oculaire X/Y (Regard stéréoscopique)',
      partieCorps: 'tete_cou',
      typeActionneur: 'servomoteur_pwm',
      topicRos: '/sofia/head/eyes_gaze_joint/command',
      busCommunication: 'pwm',
      degresMin: -30,
      degresMax: 30,
      coupleMaxNm: 0.8,
      vitesseMaxRpm: 120,
      actif: true,
      notes: 'Double micro-servomoteur coreless ultra-rapide'
    },
    {
      id: 'act-04',
      nom: 'Paupières Motorisées (Clignements biomimétiques)',
      partieCorps: 'tete_cou',
      typeActionneur: 'servomoteur_pwm',
      topicRos: '/sofia/head/eyelids_joint/command',
      busCommunication: 'pwm',
      degresMin: 0,
      degresMax: 60,
      coupleMaxNm: 0.5,
      vitesseMaxRpm: 180,
      actif: true,
      notes: 'Synchronisé avec la jauge d\'énergie et de fatigue'
    },
    {
      id: 'act-05',
      nom: 'Articulation des Lèvres & Mâchoire (Synchronisation vocale labiale)',
      partieCorps: 'tete_cou',
      typeActionneur: 'servomoteur_dynamixel',
      topicRos: '/sofia/head/jaw_joint/command',
      busCommunication: 'rs485',
      degresMin: 0,
      degresMax: 28,
      coupleMaxNm: 1.8,
      vitesseMaxRpm: 90,
      actif: true,
      notes: 'Visemes phonétiques automatiques'
    },
    {
      id: 'act-06',
      nom: 'Actionneur Respiration Thoracique (Soulèvement cage)',
      partieCorps: 'buste_torse',
      typeActionneur: 'actionneur_lineaire',
      topicRos: '/sofia/chest/breath_expansion_joint/command',
      busCommunication: 'can',
      degresMin: 0,
      degresMax: 30,
      coupleMaxNm: 6.0,
      vitesseMaxRpm: 25,
      actif: true,
      notes: 'Cycle sinusoïdal réglé sur 14 respirations/min'
    },
    {
      id: 'act-07',
      nom: 'Éléments Chauffants Cutanés Torse (Maintien à 36.5°C)',
      partieCorps: 'buste_torse',
      typeActionneur: 'chauffage_thermique',
      topicRos: '/sofia/chest/thermal_heater/command',
      busCommunication: 'can',
      degresMin: 20,
      degresMax: 40,
      coupleMaxNm: 0,
      vitesseMaxRpm: 0,
      actif: true,
      notes: 'Nappe chauffante PTC en graphène régulée par thermostat PID'
    },
    {
      id: 'act-08',
      nom: 'Épaule & Bras Gauche 3-DOF',
      partieCorps: 'bras_mains',
      typeActionneur: 'moteur_brushless',
      topicRos: '/sofia/arm_left/trajectory_controller/command',
      busCommunication: 'can',
      degresMin: -120,
      degresMax: 120,
      coupleMaxNm: 18.0,
      vitesseMaxRpm: 45,
      actif: true,
      notes: 'Réducteur cycloïdal à jeu nul'
    },
    {
      id: 'act-09',
      nom: 'Épaule & Bras Droit 3-DOF',
      partieCorps: 'bras_mains',
      typeActionneur: 'moteur_brushless',
      topicRos: '/sofia/arm_right/trajectory_controller/command',
      busCommunication: 'can',
      degresMin: -120,
      degresMax: 120,
      coupleMaxNm: 18.0,
      vitesseMaxRpm: 45,
      actif: true,
      notes: 'Réducteur cycloïdal à jeu nul'
    },
    {
      id: 'act-10',
      nom: 'Mains & Doigts Sous-Actionnés (Préhension douce et caresse)',
      partieCorps: 'bras_mains',
      typeActionneur: 'servomoteur_dynamixel',
      topicRos: '/sofia/hands/grasp_controller/command',
      busCommunication: 'rs485',
      degresMin: 0,
      degresMax: 90,
      coupleMaxNm: 2.2,
      vitesseMaxRpm: 80,
      actif: true,
      notes: 'Tendons en Kevlar et pulpe de doigt en silicone souple 10A'
    },
    {
      id: 'act-11',
      nom: 'Vibreurs Haptiques Lombo-Pelviens Double Cœur (Intimité & Résonance)',
      partieCorps: 'bassin_hanches',
      typeActionneur: 'vibreur_haptique',
      topicRos: '/sofia/pelvis/haptic_vibration/command',
      busCommunication: 'pwm',
      degresMin: 0,
      degresMax: 100,
      coupleMaxNm: 0,
      vitesseMaxRpm: 0,
      actif: true,
      notes: 'Fréquence de résonance 180 Hz avec enveloppe d\'orgasme modulable'
    },
    {
      id: 'act-12',
      nom: 'Base Mobile Omnidirectionnelle 4 Roues Mecanum (Locomotion douce)',
      partieCorps: 'jambes_base',
      typeActionneur: 'moteur_brushless',
      topicRos: '/cmd_vel',
      busCommunication: 'can',
      degresMin: -180,
      degresMax: 180,
      coupleMaxNm: 25.0,
      vitesseMaxRpm: 120,
      actif: true,
      notes: 'Contrôleur cinématique Twist (vx, vy, vtheta)'
    }
  ],
  capteurs: [
    {
      id: 'sens-01',
      nom: 'Matrice Tactile Joues & Nuque (Peau silicone capacitive)',
      partieCorps: 'tete_cou',
      typeCapteur: 'tactile_capacitif',
      topicRos: '/sofia/sensors/touch/face_neck',
      frequenceHz: 30,
      protocole: 'i2c',
      description: 'Détecte les caresses légères, effleurements et baisers sur le visage',
      actif: true
    },
    {
      id: 'sens-02',
      nom: 'Caméra Stéréoscopique RGB-D Intel RealSense D435i',
      partieCorps: 'tete_cou',
      typeCapteur: 'vision_rgbd',
      topicRos: '/sofia/sensors/camera/depth_and_color',
      frequenceHz: 30,
      protocole: 'usb',
      description: 'Cartographie spatiale 3D, estimation de pose, reconnaissance faciale et contact visuel',
      actif: true
    },
    {
      id: 'sens-03',
      nom: 'Matrice 4 Microphones Circulaire (Formation de faisceau sonore)',
      partieCorps: 'tete_cou',
      typeCapteur: 'audio_micro',
      topicRos: '/sofia/sensors/audio/beamforming',
      frequenceHz: 16000,
      protocole: 'usb',
      description: 'Localisation de la source sonore de la voix de l\'utilisateur avec suppression de bruit active',
      actif: true
    },
    {
      id: 'sens-04',
      nom: 'Sondes Thermiques Cutanées Réparties (Surveillance température cutanée)',
      partieCorps: 'buste_torse',
      typeCapteur: 'thermometre_peau',
      topicRos: '/sofia/sensors/thermal/skin_temperature',
      frequenceHz: 5,
      protocole: 'i2c',
      description: '8 thermistances NTC de précision pour boucle de régulation corporelle humaine',
      actif: true
    },
    {
      id: 'sens-05',
      nom: 'Centrale Inertielle IMU 9-Axes (Accéléromètre, Gyroscope & Magnétomètre)',
      partieCorps: 'buste_torse',
      typeCapteur: 'imu_orientation',
      topicRos: '/sofia/sensors/imu/data',
      frequenceHz: 100,
      protocole: 'spi',
      description: 'Stabilisation de l\'équilibre, détection des étreintes et mouvements du torse',
      actif: true
    },
    {
      id: 'sens-06',
      nom: 'Capteurs de Force Pulpaire FSR sur les Doigts',
      partieCorps: 'bras_mains',
      typeCapteur: 'capteur_force_fsr',
      topicRos: '/sofia/sensors/hands/force_torque',
      frequenceHz: 50,
      protocole: 'i2c',
      description: 'Mesure la pression de préhension pour ne jamais serrer trop fort lors d\'une poignée de main',
      actif: true
    },
    {
      id: 'sens-07',
      nom: 'Capteurs Intimes Capacitifs Haute Résolution',
      partieCorps: 'bassin_hanches',
      typeCapteur: 'tactile_capacitif',
      topicRos: '/sofia/sensors/touch/intimate',
      frequenceHz: 50,
      protocole: 'i2c',
      description: 'Détection d\'insertion, de caresses et de friction avec transmission directe vers le moteur de désir',
      actif: true
    },
    {
      id: 'sens-08',
      nom: 'Télémétrie Batterie & BMS LiFePO4 48Ah',
      partieCorps: 'bassin_hanches',
      typeCapteur: 'batterie_bms',
      topicRos: '/robot/battery_state',
      frequenceHz: 1,
      protocole: 'can',
      description: 'Tension individuelle des cellules, courant de décharge, température de pack et autonomie restante',
      actif: true
    }
  ]
};

// Generates URDF XML model definition for ROS / Gazebo / RViz
export function generateUrdfFromConfig(config: RobotHardwareConfig): string {
  const jointsXml = config.actionneurs
    .filter(a => a.actif)
    .map(a => {
      const minRad = ((a.degresMin * Math.PI) / 180).toFixed(4);
      const maxRad = ((a.degresMax * Math.PI) / 180).toFixed(4);
      const parentLink = a.partieCorps === 'tete_cou' ? 'neck_link' : 
                         a.partieCorps === 'buste_torse' ? 'torso_link' : 
                         a.partieCorps === 'bras_mains' ? 'chest_link' : 
                         a.partieCorps === 'bassin_hanches' ? 'pelvis_link' : 'base_link';
      const childLink = `${a.id}_link`;

      return `  <!-- ${a.nom} (${a.busCommunication.toUpperCase()}) -->
  <link name="${childLink}">
    <visual>
      <geometry>
        <cylinder length="0.08" radius="0.02"/>
      </geometry>
      <material name="chassis_silver"/>
    </visual>
  </link>

  <joint name="${a.id}_joint" type="revolute">
    <parent link="${parentLink}"/>
    <child link="${childLink}"/>
    <origin xyz="0 0 0.05" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="${minRad}" upper="${maxRad}" effort="${a.coupleMaxNm || 5.0}" velocity="${((a.vitesseMaxRpm || 60) * 0.1047).toFixed(2)}"/>
  </joint>`;
    })
    .join('\n\n');

  return `<?xml version="1.0"?>
<!-- =================================================================================== -->
<!-- URDF Généré pour : ${config.nomChassis} (${config.revisionMaterielle})            -->
<!-- Poids: ${config.poidsChassisKg} kg | Hauteur: ${config.hauteurCm} cm | Batterie: ${config.capaciteBatterieAh} Ah (${config.typeBatterie.toUpperCase()}) -->
<!-- Date: ${config.dateModification}                                                   -->
<!-- =================================================================================== -->
<robot name="sofia_companion_robot">

  <material name="chassis_silver">
    <color rgba="0.85 0.88 0.92 1.0"/>
  </material>
  
  <material name="skin_soft">
    <color rgba="0.95 0.85 0.78 1.0"/>
  </material>

  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.45 0.45 0.20"/>
      </geometry>
      <material name="chassis_silver"/>
    </visual>
  </link>

  <link name="pelvis_link"/>
  <joint name="base_to_pelvis" type="fixed">
    <parent link="base_link"/>
    <child link="pelvis_link"/>
    <origin xyz="0 0 0.25"/>
  </joint>

  <link name="torso_link"/>
  <joint name="pelvis_to_torso" type="fixed">
    <parent link="pelvis_link"/>
    <child link="torso_link"/>
    <origin xyz="0 0 0.35"/>
  </joint>

  <link name="chest_link"/>
  <joint name="torso_to_chest" type="fixed">
    <parent link="torso_link"/>
    <child link="chest_link"/>
    <origin xyz="0 0 0.30"/>
  </joint>

  <link name="neck_link"/>
  <joint name="chest_to_neck" type="fixed">
    <parent link="chest_link"/>
    <child link="neck_link"/>
    <origin xyz="0 0 0.25"/>
  </joint>

${jointsXml}

</robot>`;
}

// Generates ros2_controllers.yaml for ros2_control framework
export function generateRos2ControlYaml(config: RobotHardwareConfig): string {
  const activeActuators = config.actionneurs.filter(a => a.actif);
  const jointNames = activeActuators.map(a => `      - ${a.id}_joint`).join('\n');

  return `# =============================================================================
# Configuration ros2_control pour : ${config.nomChassis}
# Généré automatiquement pour Sofia Companion Platform
# =============================================================================
controller_manager:
  ros__parameters:
    update_rate: 100 # Hz

    joint_state_broadcaster:
      type: joint_state_broadcaster/JointStateBroadcaster

    body_trajectory_controller:
      type: joint_trajectory_controller/JointTrajectoryController

    head_position_controller:
      type: position_controllers/JointGroupPositionController

    haptic_pwm_controller:
      type: effort_controllers/JointGroupEffortController

body_trajectory_controller:
  ros__parameters:
    joints:
${jointNames}
    command_interfaces:
      - position
      - velocity
    state_interfaces:
      - position
      - velocity
      - effort
    state_publish_rate: 50.0
    action_monitor_rate: 20.0
    allow_partial_joints_goal: true

joint_state_broadcaster:
  ros__parameters:
    publish_rate: 50.0
`;
}

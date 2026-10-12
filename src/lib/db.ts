import Dexie, { Table } from 'dexie';
import { RobotPersonality, UserProfileLocal, ChatMessage, QuotaState } from '../types';
import { DEFAULT_ROBOTS } from '../data/defaultRobots';
import { encryptObject, decryptObject, isEncryptedString } from './cryptoStorage';

export interface DailyLogRecord {
  id?: number;
  date: string;
  resume: string;
  faitsExtraits: string[];
  changementsGouts: string[];
  timestamp: string;
  _encryptedPayload?: string;
}

export interface EncryptedStorageWrapper {
  id: string;
  _encryptedPayload: string;
  lastUpdated: string;
}

export class SofiaMasterDatabase extends Dexie {
  catalogueRobots!: Table<RobotPersonality, string>;

  constructor() {
    super('SofiaMasterDB_v2');
    this.version(1).stores({
      catalogueRobots: 'id, nom'
    });
  }
}

export const masterDb = new SofiaMasterDatabase();

const CATALOGUE_STORAGE_KEY = 'sofia_persisted_catalogue_robots_v2';

export class SofiaRobotDatabase extends Dexie {
  messages!: Table<ChatMessage & { _encryptedText?: string }, string>;
  robotState!: Table<RobotPersonality & { _encryptedPayload?: string }, string>;
  userProfile!: Table<UserProfileLocal & { _encryptedPayload?: string }, string>;
  dailyLogs!: Table<DailyLogRecord, number>;
  quotaState!: Table<QuotaState & { id: string }, string>;

  constructor(robotId: string) {
    super(`SofiaDB_${robotId}`);
    this.version(1).stores({
      messages: 'id, robotId, sender, timestamp, source',
      robotState: 'id',
      userProfile: 'id',
      dailyLogs: '++id, date, timestamp',
      quotaState: 'id'
    });
  }
}

const dbInstances = new Map<string, SofiaRobotDatabase>();

export function getRobotDb(robotId: string): SofiaRobotDatabase {
  if (!dbInstances.has(robotId)) {
    dbInstances.set(robotId, new SofiaRobotDatabase(robotId));
  }
  return dbInstances.get(robotId)!;
}

export function normalizeAssetPath(path?: string): string {
  if (!path) return '';
  if (path.startsWith('/src/assets/')) {
    return path.replace('/src/assets/', '/assets/');
  }
  return path;
}

// ----------------------------------------------------
// PERSISTANCE DU CATALOGUE EN DUR DANS LES FICHIERS DU SITE
// ----------------------------------------------------
export async function loadCatalogueRobots(): Promise<RobotPersonality[]> {
  // Le catalogue de base provient directement des fichiers sources en dur
  return DEFAULT_ROBOTS.map(r => ({
    ...r,
    avatar: normalizeAssetPath(r.avatar),
    photos: (r.photos || []).map(normalizeAssetPath)
  }));
}

export async function saveCatalogueRobots(robots: RobotPersonality[]): Promise<void> {
  try {
    // Sauvegarde en dur dans les fichiers source du site via l'API serveur
    const res = await fetch('/api/catalogue/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ robots })
    });
    if (!res.ok) {
      console.warn('Sauvegarde serveur échouée, code:', res.status);
    }
  } catch (err) {
    console.error('Erreur sauvegarde catalogue en dur sur le serveur:', err);
  }
}

export async function saveRobotToCatalogue(robot: RobotPersonality): Promise<RobotPersonality[]> {
  const currentList = DEFAULT_ROBOTS;
  const exists = currentList.some(r => r.id === robot.id);
  const updatedList = exists
    ? currentList.map(r => r.id === robot.id ? robot : r)
    : [...currentList, robot];

  await saveCatalogueRobots(updatedList);
  return updatedList;
}

export async function deleteRobotFromCatalogue(robotId: string): Promise<RobotPersonality[]> {
  try {
    const currentList = DEFAULT_ROBOTS;
    const updatedList = currentList.filter(r => r.id !== robotId);
    
    // Si la liste devenait vide, on conserve au moins le premier
    const finalList = updatedList.length > 0 ? updatedList : [DEFAULT_ROBOTS[0]];

    await saveCatalogueRobots(finalList);
    return finalList;
  } catch (err) {
    console.error('Erreur suppression robot du catalogue:', err);
    return DEFAULT_ROBOTS;
  }
}

// Initialise ou récupère l'état du robot
export async function loadRobotState(robotId: string, fallback: RobotPersonality): Promise<RobotPersonality> {
  const db = getRobotDb(robotId);
  try {
    const existing = await db.robotState.get(robotId);
    if (existing) {
      let stateToUse = existing;
      if (existing._encryptedPayload) {
        try {
          const decryptedPayload = await decryptObject<Partial<RobotPersonality>>(existing._encryptedPayload);
          stateToUse = { ...existing, ...decryptedPayload };
        } catch (decErr) {
          console.warn('[IndexedDB Crypto] Impossible de déchiffrer le payload robotState, utilisation du cache:', decErr);
        }
      }

      // Garantit que l'avatar et les photos par défaut sont préservés si absents, vides ou obsolètes
      const defaultMatch = DEFAULT_ROBOTS.find(r => r.id === robotId) || fallback;
      const isLegacyAvatar = Boolean(
        stateToUse.avatar?.includes('eleonore_opera_juriste') ||
        stateToUse.avatar?.includes('eleonore_portrait_smile')
      );
      const rawAvatar = (isLegacyAvatar || !stateToUse.avatar) ? (defaultMatch.avatar || fallback.avatar) : stateToUse.avatar;
      const rawPhotos = (isLegacyAvatar || !stateToUse.photos || stateToUse.photos.length === 0)
        ? (defaultMatch.photos || fallback.photos)
        : stateToUse.photos.map(p => (p.includes('eleonore_opera_juriste') || p.includes('eleonore_portrait_smile')) ? (defaultMatch.avatar || p) : p);
      const merged: RobotPersonality = {
        ...defaultMatch,
        ...stateToUse,
        avatar: normalizeAssetPath(rawAvatar),
        photos: (rawPhotos || []).map(normalizeAssetPath)
      };
      return merged;
    }
    // Premier chargement -> initialisation dans IndexedDB avec chiffrement
    await saveRobotState(robotId, fallback);
    return fallback;
  } catch (err) {
    console.error('Erreur chargement IndexedDB robotState:', err);
    return fallback;
  }
}

export async function saveRobotState(robotId: string, state: RobotPersonality): Promise<void> {
  const db = getRobotDb(robotId);
  try {
    // Chiffrement des métadonnées et souvenirs du robot
    const sensitiveToEncrypt = {
      philosophie: state.philosophie,
      clientMemories: state.clientMemories,
      notesRelationnelles: state.notesRelationnelles,
      attentes: state.attentes,
      traits: state.traits,
      gouts: state.gouts,
      questionnaire2: state.questionnaire2
    };
    const encryptedPayload = await encryptObject(sensitiveToEncrypt);

    await db.robotState.put({
      ...state,
      id: robotId,
      _encryptedPayload: encryptedPayload
    });
  } catch (err) {
    console.error('Erreur sauvegarde IndexedDB robotState:', err);
  }
}

// Profil de l'utilisateur
export async function loadUserProfile(robotId: string): Promise<UserProfileLocal> {
  const db = getRobotDb(robotId);
  const defaultProfile: UserProfileLocal = {
    id: 'current_user',
    prenom: 'Toi',
    centresInteret: [],
    faits: [],
    scoreCompatibilite: 78,
    dateRencontre: new Date().toISOString(),
    impressionsDuRobot: ['Première rencontre en cours...']
  };

  try {
    const existing = await db.userProfile.get('current_user');
    if (existing) {
      if (existing._encryptedPayload) {
        try {
          const decrypted = await decryptObject<Partial<UserProfileLocal>>(existing._encryptedPayload);
          return { ...existing, ...decrypted };
        } catch (decErr) {
          console.warn('[IndexedDB Crypto] Déchiffrement userProfile échoué, repli existant:', decErr);
        }
      }
      return existing;
    }
    await saveUserProfile(robotId, defaultProfile);
    return defaultProfile;
  } catch (err) {
    console.error('Erreur chargement IndexedDB userProfile:', err);
    return defaultProfile;
  }
}

export async function saveUserProfile(robotId: string, profile: UserProfileLocal): Promise<void> {
  const db = getRobotDb(robotId);
  try {
    // Chiffrement des données privées de l'utilisateur (faits, nom, centres d'intérêts, questionnaire)
    const sensitive = {
      prenom: profile.prenom,
      nom: profile.nom,
      centresInteret: profile.centresInteret,
      faits: profile.faits,
      impressionsDuRobot: profile.impressionsDuRobot,
      questionnaire2: profile.questionnaire2
    };
    const encryptedPayload = await encryptObject(sensitive);

    await db.userProfile.put({
      ...profile,
      id: 'current_user',
      _encryptedPayload: encryptedPayload
    });
  } catch (err) {
    console.error('Erreur sauvegarde IndexedDB userProfile:', err);
  }
}

// Messages
export async function getChatMessages(robotId: string): Promise<ChatMessage[]> {
  const db = getRobotDb(robotId);
  try {
    const list = await db.messages.orderBy('timestamp').toArray();
    // Déchiffrement à la volée des messages chiffrés
    const decryptedList = await Promise.all(
      list.map(async (m) => {
        if (m._encryptedText) {
          try {
            const dec = await decryptObject<{ text: string; audioBase64?: string; attachments?: any[] }>(m._encryptedText);
            return {
              ...m,
              text: dec.text,
              audioBase64: dec.audioBase64 || m.audioBase64,
              attachments: dec.attachments || m.attachments
            };
          } catch {
            return m;
          }
        }
        return m;
      })
    );
    return decryptedList;
  } catch (err) {
    console.error('Erreur lecture IndexedDB messages:', err);
    return [];
  }
}

export async function addChatMessage(robotId: string, msg: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
  const db = getRobotDb(robotId);
  const fullMsg: ChatMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  };

  try {
    // Chiffrement AES-GCM 256 bits du message confidentiel
    const encryptedText = await encryptObject({
      text: fullMsg.text,
      audioBase64: fullMsg.audioBase64,
      attachments: fullMsg.attachments
    });

    await db.messages.put({
      ...fullMsg,
      text: fullMsg.text, // Conservation pour l'affichage en session
      _encryptedText: encryptedText
    });
  } catch (err) {
    console.error('Erreur écriture IndexedDB message chiffré:', err);
  }
  return fullMsg;
}

export async function clearChatMessages(robotId: string): Promise<void> {
  const db = getRobotDb(robotId);
  try {
    await db.messages.clear();
  } catch (err) {
    console.error('Erreur purge IndexedDB messages:', err);
  }
}

// Quota de discussion
export async function getQuotaState(robotId: string): Promise<QuotaState> {
  const db = getRobotDb(robotId);
  const defaultQuota: QuotaState = {
    messagesUtilises: 0,
    messagesGratuitsMax: 25,
    debloque: false,
    achatRobotPhysique: false
  };
  try {
    const existing = await db.quotaState.get('current_quota');
    if (existing) return existing;
    await db.quotaState.put({ ...defaultQuota, id: 'current_quota' });
    return defaultQuota;
  } catch (err) {
    console.error('Erreur chargement IndexedDB quota:', err);
    return defaultQuota;
  }
}

export async function saveQuotaState(robotId: string, quota: QuotaState): Promise<void> {
  const db = getRobotDb(robotId);
  try {
    await db.quotaState.put({ ...quota, id: 'current_quota' });
  } catch (err) {
    console.error('Erreur sauvegarde IndexedDB quota:', err);
  }
}

// Export 100% de la base locale en JSON clair standard
export async function exportRobotMemoryBackup(robotId: string): Promise<string> {
  const [robotState, userProfile, messages, quota] = await Promise.all([
    loadRobotState(robotId, DEFAULT_ROBOTS[0]),
    loadUserProfile(robotId),
    getChatMessages(robotId),
    getQuotaState(robotId)
  ]);
  const db = getRobotDb(robotId);
  const dailyLogs = await db.dailyLogs.toArray();

  const backupData = {
    format: 'sofia-robotics-open-backup-v2',
    encryption: 'none_plain_json',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    robotId,
    robotState,
    userProfile,
    messages,
    dailyLogs,
    quota,
    checksum: `sofia_sec_${Date.now()}`
  };

  return JSON.stringify(backupData, null, 2);
}

// Export Chiffré Sécurisé AES-GCM (pour transfert nomade / lunettes connectées / pendentif ↔ corps physique)
export async function exportEncryptedRobotMemoryBackup(robotId: string, passphrase?: string): Promise<string> {
  const plainBackup = await exportRobotMemoryBackup(robotId);
  const encryptedPayload = await encryptObject(JSON.parse(plainBackup), passphrase);

  const sealedContainer = {
    format: 'sofia-encrypted-brain-v2',
    encryption: 'AES-GCM-256',
    kdf: 'PBKDF2-SHA256-100000',
    exportDate: new Date().toISOString(),
    robotId,
    payload: encryptedPayload
  };

  return JSON.stringify(sealedContainer, null, 2);
}

// Import d'un backup JSON (détecte automatiquement clair ou chiffré)
export async function importRobotMemoryBackup(robotId: string, fileContent: string, passphrase?: string): Promise<{ success: boolean; message: string }> {
  try {
    let parsed: any;
    try {
      parsed = JSON.parse(fileContent);
    } catch {
      throw new Error('Fichier de sauvegarde non valide (JSON attendu).');
    }

    // 1. Détection conteneur chiffré AES-GCM
    if (parsed.format === 'sofia-encrypted-brain-v2' && parsed.payload) {
      try {
        parsed = await decryptObject(parsed.payload, passphrase);
      } catch (err: any) {
        return {
          success: false,
          message: 'Déchiffrement impossible. Mot de passe incorrect ou sauvegarde corrompue.'
        };
      }
    }

    if (!parsed || (!parsed.robotState && !parsed.userProfile && !parsed.messages)) {
      throw new Error('Structure de données non reconnue.');
    }

    const db = getRobotDb(robotId);
    await db.transaction('rw', db.robotState, db.userProfile, db.messages, db.dailyLogs, db.quotaState, async () => {
      if (parsed.robotState) {
        await saveRobotState(robotId, { ...parsed.robotState, id: robotId });
      }
      if (parsed.userProfile) {
        await saveUserProfile(robotId, { ...parsed.userProfile, id: 'current_user' });
      }
      if (Array.isArray(parsed.messages)) {
        await db.messages.clear();
        for (const m of parsed.messages) {
          await addChatMessage(robotId, m);
        }
      }
      if (Array.isArray(parsed.dailyLogs)) {
        await db.dailyLogs.clear();
        await db.dailyLogs.bulkPut(parsed.dailyLogs);
      }
      if (parsed.quota) {
        await saveQuotaState(robotId, { ...parsed.quota, id: 'current_quota' });
      }
    });

    return {
      success: true,
      message: 'Cerveau et mémoire relationnelle restaurés avec succès dans le robot !'
    };
  } catch (err: any) {
    console.error('Erreur importation backup IndexedDB:', err);
    return {
      success: false,
      message: err.message || 'Erreur lors de l\'importation de la sauvegarde.'
    };
  }
}

// Réinitialisation d'une relation robot
export async function resetRobotMemory(robotId: string): Promise<void> {
  const db = getRobotDb(robotId);
  await db.transaction('rw', db.robotState, db.userProfile, db.messages, db.dailyLogs, db.quotaState, async () => {
    await db.messages.clear();
    await db.dailyLogs.clear();
    await db.userProfile.clear();
    await db.robotState.clear();
    await db.quotaState.clear();
  });
}

export const getRobotState = async (robotId: string): Promise<RobotPersonality | undefined> => {
  const db = getRobotDb(robotId);
  const state = await db.robotState.get(robotId);
  if (state) {
    const defaultMatch = DEFAULT_ROBOTS.find(r => r.id === robotId);
    if (defaultMatch) {
      if (!state.avatar || state.avatar.trim() === '') {
        state.avatar = defaultMatch.avatar;
      }
      if (!state.photos || state.photos.length === 0) {
        state.photos = defaultMatch.photos;
      }
    }
    if (!state.programmeConsolidationNocturne) {
      state.programmeConsolidationNocturne = {
        heureExecution: '03:00',
        autoExecuterSansSocle: true,
        seuilBatterieMin: 20,
        notifierAuReveil: true,
        actif: true
      };
    }
  }
  return state;
};

export const getUserProfile = (robotId: string) => {
  const db = getRobotDb(robotId);
  return db.userProfile.get('current_user');
};

export interface DeltaBrainPayload {
  format: 'sofia-delta-sync-v1' | 'sofia-encrypted-brain-v2';
  syncType: 'delta' | 'full';
  robotId: string;
  robotNom: string;
  exportDate: string;
  sinceTimestamp?: string;
  messages: ChatMessage[];
  robotStateDelta?: Partial<RobotPersonality>;
  userProfileDelta?: Partial<UserProfileLocal>;
  checksum: string;
}

// Export 1-clic Delta ou Complet pour transfert immédiat
export async function exportDeltaBrain(
  robotId: string,
  options?: {
    sinceTimestamp?: string;
    passphrase?: string;
    isFull?: boolean;
  }
): Promise<{ jsonString: string; filename: string; isEncrypted: boolean; messageCount: number; memoryCount: number }> {
  const [robotState, userProfile, allMessages] = await Promise.all([
    loadRobotState(robotId, DEFAULT_ROBOTS[0]),
    loadUserProfile(robotId),
    getChatMessages(robotId)
  ]);

  const sinceTime = options?.sinceTimestamp ? new Date(options.sinceTimestamp).getTime() : 0;
  const filteredMessages = options?.isFull 
    ? allMessages 
    : allMessages.filter(m => new Date(m.timestamp).getTime() >= sinceTime);

  const deltaPayload: DeltaBrainPayload = {
    format: 'sofia-delta-sync-v1',
    syncType: options?.isFull ? 'full' : 'delta',
    robotId,
    robotNom: robotState.nom,
    exportDate: new Date().toISOString(),
    sinceTimestamp: options?.sinceTimestamp,
    messages: filteredMessages,
    robotStateDelta: {
      id: robotState.id,
      nom: robotState.nom,
      jaugesActuelles: robotState.jaugesActuelles,
      clientMemories: robotState.clientMemories || [],
      notesRelationnelles: robotState.notesRelationnelles || [],
      activitesAutonomes: robotState.activitesAutonomes || [],
      questionnaire2: robotState.questionnaire2
    },
    userProfileDelta: {
      id: userProfile.id,
      prenom: userProfile.prenom,
      faits: userProfile.faits || [],
      centresInteret: userProfile.centresInteret || [],
      scoreCompatibilite: userProfile.scoreCompatibilite,
      impressionsDuRobot: userProfile.impressionsDuRobot || []
    },
    checksum: `sofia_delta_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  };

  const passphrase = options?.passphrase?.trim();
  const safeRobotNom = (robotState.nom || 'robot').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);

  if (passphrase) {
    const encryptedPayload = await encryptObject(deltaPayload, passphrase);
    const sealed = {
      format: 'sofia-encrypted-brain-v2',
      encryption: 'AES-GCM-256',
      kdf: 'PBKDF2-SHA256-100000',
      exportDate: deltaPayload.exportDate,
      syncType: deltaPayload.syncType,
      robotId,
      robotNom: robotState.nom,
      payload: encryptedPayload
    };
    const filename = `sofia-${deltaPayload.syncType}-${safeRobotNom}-chiffre-${dateStr}.json`;
    return {
      jsonString: JSON.stringify(sealed, null, 2),
      filename,
      isEncrypted: true,
      messageCount: filteredMessages.length,
      memoryCount: (robotState.clientMemories?.length || 0) + (userProfile.faits?.length || 0)
    };
  } else {
    const filename = `sofia-${deltaPayload.syncType}-${safeRobotNom}-${dateStr}.json`;
    return {
      jsonString: JSON.stringify(deltaPayload, null, 2),
      filename,
      isEncrypted: false,
      messageCount: filteredMessages.length,
      memoryCount: (robotState.clientMemories?.length || 0) + (userProfile.faits?.length || 0)
    };
  }
}

// Import & Fusion intelligente 1-clic Delta / Historique
export async function importDeltaBrain(
  robotId: string,
  rawContentOrObj: any,
  passphrase?: string,
  mode: 'merge' | 'replace' = 'merge'
): Promise<{
  success: boolean;
  message: string;
  importedMessagesCount: number;
  importedMemoriesCount: number;
  updatedRobot?: RobotPersonality;
  updatedUserProfile?: UserProfileLocal;
}> {
  try {
    let parsed = typeof rawContentOrObj === 'string' ? JSON.parse(rawContentOrObj) : rawContentOrObj;

    // Déchiffrement AES-GCM si scellé
    if (parsed.format === 'sofia-encrypted-brain-v2' && parsed.payload) {
      try {
        parsed = await decryptObject(parsed.payload, passphrase?.trim());
      } catch (err: any) {
        return {
          success: false,
          message: 'Déchiffrement impossible. Passphrase secrète incorrecte ou fichier corrompu.',
          importedMessagesCount: 0,
          importedMemoriesCount: 0
        };
      }
    }

    if (!parsed || (!parsed.messages && !parsed.robotState && !parsed.robotStateDelta && !parsed.userProfile)) {
      return {
        success: false,
        message: 'Format de cerveau non reconnu ou fichier incomplet.',
        importedMessagesCount: 0,
        importedMemoriesCount: 0
      };
    }

    const db = getRobotDb(robotId);
    const existingRobot = await loadRobotState(robotId, DEFAULT_ROBOTS[0]);
    const existingProfile = await loadUserProfile(robotId);
    const existingMessages = await getChatMessages(robotId);

    let newMessagesCount = 0;
    let newMemoriesCount = 0;

    // 1. Traitement des messages
    const incomingMessages: ChatMessage[] = parsed.messages || [];
    if (incomingMessages.length > 0) {
      if (mode === 'replace') {
        await db.messages.clear();
        for (const m of incomingMessages) {
          await addChatMessage(robotId, m);
          newMessagesCount++;
        }
      } else {
        // Mode merge : ajout des messages non existants
        const existingKeys = new Set(
          existingMessages.map(m => `${m.sender}_${new Date(m.timestamp).getTime()}_${m.text.slice(0, 30)}`)
        );
        for (const m of incomingMessages) {
          const key = `${m.sender}_${new Date(m.timestamp).getTime()}_${m.text.slice(0, 30)}`;
          if (!existingKeys.has(key)) {
            await addChatMessage(robotId, m);
            newMessagesCount++;
          }
        }
      }
    }

    // 2. Traitement du profil robot & mémoires
    const incomingRobotDelta = parsed.robotStateDelta || parsed.robotState || {};
    const updatedRobot: RobotPersonality = {
      ...existingRobot,
      jaugesActuelles: incomingRobotDelta.jaugesActuelles 
        ? { ...(existingRobot.jaugesActuelles || existingRobot.jaugesInitiales), ...incomingRobotDelta.jaugesActuelles }
        : existingRobot.jaugesActuelles,
      clientMemories: Array.from(new Set([
        ...(existingRobot.clientMemories || []),
        ...(incomingRobotDelta.clientMemories || [])
      ])),
      notesRelationnelles: Array.from(new Set([
        ...(existingRobot.notesRelationnelles || []),
        ...(incomingRobotDelta.notesRelationnelles || [])
      ])),
      activitesAutonomes: incomingRobotDelta.activitesAutonomes?.length 
        ? incomingRobotDelta.activitesAutonomes 
        : existingRobot.activitesAutonomes,
      questionnaire2: incomingRobotDelta.questionnaire2 || existingRobot.questionnaire2
    };
    newMemoriesCount += (incomingRobotDelta.clientMemories?.length || 0);
    await saveRobotState(robotId, updatedRobot);

    // 3. Traitement du profil utilisateur
    const incomingUserDelta = parsed.userProfileDelta || parsed.userProfile || {};
    const updatedProfile: UserProfileLocal = {
      ...existingProfile,
      faits: Array.from(new Set([
        ...(existingProfile.faits || []),
        ...(incomingUserDelta.faits || [])
      ])),
      centresInteret: Array.from(new Set([
        ...(existingProfile.centresInteret || []),
        ...(incomingUserDelta.centresInteret || [])
      ])),
      scoreCompatibilite: incomingUserDelta.scoreCompatibilite ?? existingProfile.scoreCompatibilite,
      impressionsDuRobot: Array.from(new Set([
        ...(existingProfile.impressionsDuRobot || []),
        ...(incomingUserDelta.impressionsDuRobot || [])
      ]))
    };
    newMemoriesCount += (incomingUserDelta.faits?.length || 0);
    await saveUserProfile(robotId, updatedProfile);

    return {
      success: true,
      message: `Cerveau synchronisé avec succès ! +${newMessagesCount} message(s), +${newMemoriesCount} fait(s)/mémoire(s) fusionné(s).`,
      importedMessagesCount: newMessagesCount,
      importedMemoriesCount: newMemoriesCount,
      updatedRobot,
      updatedUserProfile: updatedProfile
    };
  } catch (err: any) {
    console.error('Erreur importDeltaBrain:', err);
    return {
      success: false,
      message: err.message || 'Erreur lors de l\'intégration du delta de conscience.',
      importedMessagesCount: 0,
      importedMemoriesCount: 0
    };
  }
}


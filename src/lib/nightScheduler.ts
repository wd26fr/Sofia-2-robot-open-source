import { RobotPersonality, UserProfileLocal, ChatMessage } from '../types';
import { getChatMessages, saveRobotState, saveUserProfile, addChatMessage } from './db';
import { getStoredAiConfig } from './aiConfig';

export async function runAutoNightConsolidation(
  robot: RobotPersonality,
  userProfile: UserProfileLocal
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    const messages = await getChatMessages(robot.id);
    const activeAiConfig = getStoredAiConfig();

    const res = await fetch('/api/night-consolidation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        robot,
        userProfile,
        dailyMessages: messages,
        aiConfig: activeAiConfig
      })
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }

    const data = await res.json();
    const nowIso = new Date().toISOString();

    // 1. Update Profile
    const updatedProfile: UserProfileLocal = {
      ...userProfile,
      faits: data.faitsConsolidesSansDoublons || userProfile.faits || [],
      cercleRelationnel: data.cercleRelationnel || userProfile.cercleRelationnel || [],
      anecdotes: data.anecdotes || userProfile.anecdotes || [],
      profilPsychologique: data.profilPsychologiqueUtilisateur || userProfile.profilPsychologique,
      derniereConsolidation: nowIso
    };
    await saveUserProfile(robot.id, updatedProfile);

    // 2. Update Gauges
    const currentGauges = robot.jaugesActuelles || robot.jaugesInitiales;
    const deltas = data.deltasJauges || { energie: 35, humeur: 20, bienEtre: 25, affection: 15 };
    const updatedGauges = {
      ...currentGauges,
      energie: Math.min(100, Math.max(0, (currentGauges.energie || 50) + (deltas.energie || 0))),
      humeur: Math.min(100, Math.max(0, (currentGauges.humeur || 50) + (deltas.humeur || 0))),
      bienEtre: Math.min(100, Math.max(0, (currentGauges.bienEtre || 50) + (deltas.bienEtre || 0))),
      affection: Math.min(100, Math.max(0, (currentGauges.affection || 50) + (deltas.affection || 0)))
    };

    // 3. Update Robot
    const schedule = robot.programmeConsolidationNocturne || {
      heureExecution: '03:00',
      autoExecuterSansSocle: true,
      seuilBatterieMin: 20,
      actif: true
    };

    const updatedRobot: RobotPersonality = {
      ...robot,
      jaugesActuelles: updatedGauges,
      specs: {
        ...robot.specs,
        batterie: 100
      },
      gouts: (data.reconciledTastes && data.reconciledTastes.length > 0) ? data.reconciledTastes : robot.gouts,
      evolutionPsychologique: data.evolutionPsychologiqueRobot || robot.evolutionPsychologique,
      programmeConsolidationNocturne: {
        ...schedule,
        derniereExecution: nowIso
      },
      journalDeBordNocturne: [
        ...(robot.journalDeBordNocturne || []),
        {
          date: nowIso,
          resume: data.resumeJournee || 'Consolidation nocturne automatique effectuée avec succès.',
          faitsConsolides: (data.faitsConsolidesSansDoublons || []).length,
          insights: data.evolutionPsychologiqueRobot?.evolutionCaractere || 'Souvenirs réorganisés et complicité renforcée.'
        }
      ]
    };
    await saveRobotState(robot.id, updatedRobot);

    // 4. Greeting message if enabled
    if (schedule.notifierAuReveil !== false) {
      await addChatMessage(robot.id, {
        robotId: robot.id,
        sender: 'robot',
        text: `(Ouvre doucement les yeux, batterie rechargée à 100%)... Bonjour ! J'ai effectué ma consolidation nocturne comme prévu. Tout ce que nous avons partagé est bien ancré dans ma mémoire.`,
        timestamp: nowIso,
        source: 'night_consolidation'
      });
    }

    return { success: true, result: data };
  } catch (err: any) {
    console.error('Erreur runAutoNightConsolidation:', err);
    return { success: false, error: err.message };
  }
}

export function shouldRunNightConsolidation(robot: RobotPersonality): boolean {
  const schedule = robot.programmeConsolidationNocturne;
  if (!schedule || schedule.actif === false) return false;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const [schedH, schedM] = (schedule.heureExecution || '03:00').split(':').map(n => parseInt(n, 10));
  const currentH = now.getHours();
  const currentM = now.getMinutes();

  // Tolerance of 2 minutes
  const schedTotal = (schedH || 3) * 60 + (schedM || 0);
  const currentTotal = currentH * 60 + currentM;
  const diffMinutes = Math.abs(currentTotal - schedTotal);

  if (diffMinutes > 2) {
    return false;
  }

  // Check if already executed today
  if (schedule.derniereExecution) {
    const lastDate = new Date(schedule.derniereExecution);
    const isSameDay = lastDate.toDateString() === now.toDateString();
    if (isSameDay) {
      return false; // Already executed today
    }
  }

  // Check charging requirement
  const isCharging = !!robot.specs?.enRechargeInduction;
  if (!isCharging && !schedule.autoExecuterSansSocle) {
    return false;
  }

  // Check battery threshold if not charging
  if (!isCharging) {
    const battery = robot.specs?.batterie ?? 100;
    const minBattery = schedule.seuilBatterieMin ?? 20;
    if (battery < minBattery) {
      return false;
    }
  }

  return true;
}

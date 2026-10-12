import React, { useState, useEffect } from 'react';
import { RobotPersonality, UserProfileLocal } from './types';
import { defaultRobots, DEFAULT_ROBOTS } from './data/defaultRobots';
import { CatalogueView } from './components/CatalogueView';
import { UserCompanionCallView } from './components/UserCompanionCallView';
import { BackOfficeLabView } from './components/BackOfficeLabView';
import { QuotaPurchaseModal } from './components/QuotaPurchaseModal';
import { AiProviderSettingsModal } from './components/AiProviderSettingsModal';
import { FullProjectExportModal } from './components/FullProjectExportModal';
import { PhilosophyGplModal } from './components/PhilosophyGplModal';
import { UserManualGuideModal } from './components/UserManualGuideModal';
import { 
  getRobotState, 
  saveRobotState, 
  getUserProfile, 
  saveUserProfile, 
  getQuotaState, 
  saveQuotaState,
  loadCatalogueRobots,
  saveCatalogueRobots,
  saveRobotToCatalogue,
  deleteRobotFromCatalogue
} from './lib/db';
import { shouldRunNightConsolidation, runAutoNightConsolidation } from './lib/nightScheduler';

export default function App() {
  const [robots, setRobots] = useState<RobotPersonality[]>(defaultRobots);
  const [selectedRobotId, setSelectedRobotId] = useState<string>(defaultRobots[0]?.id || 'sofia-01');
  const [currentRobot, setCurrentRobot] = useState<RobotPersonality>(defaultRobots[0]);
  const [userProfile, setUserProfile] = useState<UserProfileLocal>({
    id: 'current_user',
    prenom: 'Toi',
    centresInteret: [],
    faits: [],
    scoreCompatibilite: 82,
    dateRencontre: new Date().toISOString(),
    impressionsDuRobot: ['Première rencontre en cours...']
  });
  
  // Séparation stricte : 'catalogue' (choix & préférences) vs 'chat' (dialogue & photo) vs 'backend' (paramètres techniques)
  const [activeTab, setActiveTab] = useState<'catalogue' | 'chat' | 'backend'>('catalogue');
  const [backOfficeSubTab, setBackOfficeSubTab] = useState<'identity' | 'gauges' | 'deterministic' | 'prompt' | 'voice' | 'testchat' | 'export' | 'api_key' | 'json' | 'consolidation'>('prompt');
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [showGlobalQuotaModal, setShowGlobalQuotaModal] = useState<boolean>(false);
  const [showFullProjectExportModal, setShowFullProjectExportModal] = useState<boolean>(false);
  const [exportModalMode, setExportModalMode] = useState<'full_site' | 'robot_brain'>('full_site');
  const [showAiSettingsModal, setShowAiSettingsModal] = useState<boolean>(false);
  const [showGplModal, setShowGplModal] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [quotaState, setQuotaState] = useState<any>({
    messagesUtilises: 0,
    messagesGratuitsMax: 25,
    debloque: false,
    achatRobotPhysique: false
  });

  // 1. Initialisation : Charger tous les robots persistés dans le catalogue
  useEffect(() => {
    let isMounted = true;
    async function initCatalogue() {
      const persistedRobots = await loadCatalogueRobots();
      if (isMounted && persistedRobots && persistedRobots.length > 0) {
        setRobots(persistedRobots);
        const match = persistedRobots.find(r => r.id === selectedRobotId) || persistedRobots[0];
        setCurrentRobot(match);
        setSelectedRobotId(match.id);
      }
    }
    initCatalogue();
    return () => { isMounted = false; };
  }, []);

  // 2. Charger le robot actif et son profil utilisateur depuis IndexedDB
  useEffect(() => {
    let isMounted = true;
    async function load() {
      const savedRobot = await getRobotState(selectedRobotId);
      const active = savedRobot || robots.find(r => r.id === selectedRobotId) || robots[0];
      
      const savedProfile = await getUserProfile(selectedRobotId);
      const profile = savedProfile || {
        id: 'current_user',
        prenom: 'Toi',
        centresInteret: [],
        faits: [],
        scoreCompatibilite: Math.floor(Math.random() * 12) + 78,
        dateRencontre: new Date().toISOString(),
        impressionsDuRobot: ['Première rencontre en cours...']
      };

      const quota = await getQuotaState(selectedRobotId);

      if (isMounted) {
        if (active) setCurrentRobot(active);
        setUserProfile(profile);
        setQuotaState(quota);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedRobotId]);

  // 3. Planification automatique de la consolidation nocturne
  useEffect(() => {
    if (!currentRobot) return;

    const checkAndRun = async () => {
      if (shouldRunNightConsolidation(currentRobot)) {
        console.log(`[Consolidation Nocturne] Déclenchement automatique pour ${currentRobot.nom}...`);
        const res = await runAutoNightConsolidation(currentRobot, userProfile);
        if (res.success) {
          const refreshedRobot = await getRobotState(currentRobot.id);
          const refreshedProfile = await getUserProfile(currentRobot.id);
          if (refreshedRobot) {
            setCurrentRobot(refreshedRobot);
            setRobots(prev => prev.map(r => r.id === refreshedRobot.id ? refreshedRobot : r));
          }
          if (refreshedProfile) setUserProfile(refreshedProfile);
        }
      }
    };

    checkAndRun();
    const timer = setInterval(checkAndRun, 60000);
    return () => clearInterval(timer);
  }, [currentRobot, userProfile]);

  // Clic sur "Faire connaissance avec le robot" dans le catalogue -> Envoi vers le Chat
  const handleSelectRobot = async (robot: RobotPersonality) => {
    setSelectedRobotId(robot.id);
    setCurrentRobot(robot);
    await saveRobotState(robot.id, robot);
    setActiveTab('chat');
  };

  const handleUpdateRobot = async (updated: RobotPersonality) => {
    setCurrentRobot(updated);
    const updatedList = await saveRobotToCatalogue(updated);
    setRobots(updatedList);
  };

  const handleUpdateUserProfile = async (updated: UserProfileLocal) => {
    setUserProfile(updated);
    await saveUserProfile(currentRobot.id, updated);
  };

  const handleAddRobotToCatalogue = async (newRobot: RobotPersonality) => {
    const updatedList = await saveRobotToCatalogue(newRobot);
    setRobots(updatedList);
    setCurrentRobot(newRobot);
    setSelectedRobotId(newRobot.id);
  };

  const handleAddMultipleRobotsToCatalogue = async (newRobots: RobotPersonality[]) => {
    let updatedList = [...robots];
    for (const r of newRobots) {
      if (!updatedList.some(existing => existing.id === r.id)) {
        updatedList.push(r);
        await saveRobotState(r.id, r);
      }
    }
    await saveCatalogueRobots(updatedList);
    setRobots(updatedList);
    if (newRobots[0]) {
      setCurrentRobot(newRobots[0]);
      setSelectedRobotId(newRobots[0].id);
    }
  };

  const handleDeleteRobot = async (robotIdToDelete: string) => {
    const updatedList = await deleteRobotFromCatalogue(robotIdToDelete);
    setRobots(updatedList);

    if (currentRobot.id === robotIdToDelete || selectedRobotId === robotIdToDelete) {
      const nextRobot = updatedList[0] || DEFAULT_ROBOTS[0];
      setSelectedRobotId(nextRobot.id);
      setCurrentRobot(nextRobot);
    }
  };

  const handleUnlockKey = async (key: string) => {
    const updated = {
      ...quotaState,
      debloque: true,
      cleNumerique: key
    };
    setQuotaState(updated);
    await saveQuotaState(currentRobot.id, updated);
    setShowGlobalQuotaModal(false);
  };

  const handlePurchasePhysicalRobot = async () => {
    const updated = {
      ...quotaState,
      debloque: true,
      achatRobotPhysique: true
    };
    setQuotaState(updated);
    await saveQuotaState(currentRobot.id, updated);
    setShowGlobalQuotaModal(false);
  };

  const effectiveRobot = currentRobot || robots.find(r => r.id === selectedRobotId) || robots[0] || defaultRobots[0];

  return (
    <div className="min-h-screen bg-[#050507] text-slate-300 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* CORPS PRINCIPAL : SÉPARATION STRICTE CATALOGUE / CHAT / BACK-END */}
      <main className="flex-1 flex flex-col">
        
        {/* 1. CATALOGUE : Choix des robots avec affinités calculées selon le questionnaire Sofia 2.0 */}
        {activeTab === 'catalogue' && (
          <CatalogueView
            robots={robots}
            onSelectRobot={handleSelectRobot}
            selectedRobotId={effectiveRobot.id}
            onAddMultipleRobots={handleAddMultipleRobotsToCatalogue}
            onOpenGplDoc={() => setShowGplModal(true)}
            onOpenManual={() => setShowManualModal(true)}
          />
        )}

        {/* 2. CERVEAU DU ROBOT (CHAT) : Fenêtre de dialogue d'un côté, image du robot de l'autre, et bouton Back-Office */}
        {activeTab === 'chat' && (
          <UserCompanionCallView
            robot={effectiveRobot}
            userProfile={userProfile}
            onUpdateRobot={handleUpdateRobot}
            onUpdateUserProfile={handleUpdateUserProfile}
            ttsEnabled={ttsEnabled}
            setTtsEnabled={setTtsEnabled}
            onCloseCall={() => setActiveTab('catalogue')}
            onOpenManual={() => setShowManualModal(true)}
            onOpenBackOffice={(subTab) => {
              if (subTab) {
                setBackOfficeSubTab(subTab as any);
              }
              setActiveTab('backend');
            }}
            onSelectAnotherRobot={() => setActiveTab('catalogue')}
          />
        )}

        {/* 3. BACK-END : Console complète de réglages, prompt, CDN, moteur déterministe, ROS, et boutons d'exportation */}
        {activeTab === 'backend' && (
          <BackOfficeLabView
            currentRobot={effectiveRobot}
            robots={robots}
            onUpdateRobot={handleUpdateRobot}
            onAddRobot={handleAddRobotToCatalogue}
            onDeleteRobot={handleDeleteRobot}
            onBackToChat={() => setActiveTab('chat')}
            onExportFullSite={() => {
              setExportModalMode('full_site');
              setShowFullProjectExportModal(true);
            }}
            onExportRobotBrain={() => {
              setExportModalMode('robot_brain');
              setShowFullProjectExportModal(true);
            }}
            onOpenManual={() => setShowManualModal(true)}
            initialTab={backOfficeSubTab}
          />
        )}
      </main>

      {/* Global Quota / Backup Modal */}
      <QuotaPurchaseModal
        isOpen={showGlobalQuotaModal}
        onClose={() => setShowGlobalQuotaModal(false)}
        robot={effectiveRobot}
        quota={quotaState}
        onUnlockKey={handleUnlockKey}
        onPurchasePhysicalRobot={handlePurchasePhysicalRobot}
        onRefreshData={async () => {
          const q = await getQuotaState(effectiveRobot.id);
          setQuotaState(q);
        }}
      />

      {/* Full Project / Robot Brain Export Modal */}
      <FullProjectExportModal
        isOpen={showFullProjectExportModal}
        onClose={() => setShowFullProjectExportModal(false)}
        currentRobot={effectiveRobot}
        robots={robots}
        userProfile={userProfile}
        exportMode={exportModalMode}
      />

      {/* Multi-Provider AI Settings Modal */}
      <AiProviderSettingsModal
        isOpen={showAiSettingsModal}
        onClose={() => setShowAiSettingsModal(false)}
      />

      {/* Manifeste Open Source GPLv3, Confidentialité & Chiffrement IndexedDB Modal */}
      <PhilosophyGplModal
        isOpen={showGplModal}
        onClose={() => setShowGplModal(false)}
      />

      {/* Notice Complète d'Utilisation & Manuel de Référence Sofia 2.0 */}
      <UserManualGuideModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        currentRobot={effectiveRobot}
        onOpenBackOffice={(subTab) => {
          if (subTab) {
            setBackOfficeSubTab(subTab as any);
          }
          setActiveTab('backend');
        }}
      />
    </div>
  );
}

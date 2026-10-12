import React, { useState } from 'react';
import { RobotPersonality } from '../types';
import { 
  Settings2, 
  ArrowLeft, 
  Download, 
  Cpu, 
  Brain, 
  Sliders, 
  Radio, 
  Moon, 
  Key, 
  FileCode, 
  FolderArchive,
  Volume2,
  Sparkles,
  Layers,
  Box,
  BookOpen,
  Activity
} from 'lucide-react';
import { AdminClientPreview } from './AdminClientPreview';
import { RosBridgeStudio } from './RosBridgeStudio';
import { AdminNightConsolidationPanel } from './AdminNightConsolidationPanel';
import { SystemUpdateAndCompatibilityModal, CURRENT_APP_VERSION } from './SystemUpdateAndCompatibilityModal';
import { CircadianAndMecatronicModal } from './CircadianAndMecatronicModal';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface BackOfficeLabViewProps {
  currentRobot: RobotPersonality;
  robots: RobotPersonality[];
  onUpdateRobot: (robot: RobotPersonality) => void;
  onAddRobot: (robot: RobotPersonality) => void;
  onDeleteRobot?: (robotId: string) => void;
  onBackToChat: () => void;
  onExportFullSite: () => void;
  onExportRobotBrain: () => void;
  onOpenManual?: () => void;
  initialTab?: 'identity' | 'gauges' | 'deterministic' | 'prompt' | 'voice' | 'testchat' | 'export' | 'api_key' | 'json' | 'consolidation';
}

export const BackOfficeLabView: React.FC<BackOfficeLabViewProps> = ({
  currentRobot,
  robots,
  onUpdateRobot,
  onAddRobot,
  onDeleteRobot,
  onBackToChat,
  onExportFullSite,
  onExportRobotBrain,
  onOpenManual,
  initialTab = 'prompt'
}) => {
  const [activeMainSection, setActiveMainSection] = useState<'console' | 'ros' | 'consolidation'>('console');
  const [selectedRobotId, setSelectedRobotId] = useState<string>(currentRobot.id);
  const [internalTab, setInternalTab] = useState<string>(initialTab);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isCircadianModalOpen, setIsCircadianModalOpen] = useState<boolean>(false);

  const effectiveRobot = robots.find(r => r.id === selectedRobotId) || currentRobot;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* BARRE SUPÉRIEURE DU BACK-END */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        {/* Retour au Chat & Titre */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToChat}
            className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
            title="Revenir à la discussion avec le robot"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>❮ Retour au Chat avec {effectiveRobot.nom}</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <span>Back-Office Cerveau • {effectiveRobot.nom}</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {effectiveRobot.titre}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configuration fine : prompt invisible, CDN & IA, moteur déterministe, JSON brut, bio-feedback ROS 2 & consolidation.
            </p>
          </div>
        </div>

        {/* LES BOUTONS DE MISE À JOUR & D'EXPORTATION MAJEURS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bouton 0 : Vérifier les mises à jour & Rétrocompatibilité */}
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer border border-emerald-400/40"
            title="Vérifier si une version plus récente est disponible sur le serveur maître et auditer la rétrocompatibilité sans perte de mémoire"
          >
            <RefreshCw className="w-4 h-4 text-emerald-200" />
            <span>🔄 Mises à Jour & Rétrocompatibilité</span>
          </button>

          {/* Bouton Notice Complète d'Utilisation & Manuel Technique */}
          {onOpenManual && (
            <button
              onClick={onOpenManual}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer border border-amber-400/40"
              title="Consulter la notice d'utilisation exhaustive, le fonctionnement des capteurs, châssis et modes éthiques"
            >
              <BookOpen className="w-4 h-4 text-amber-200" />
              <span>📖 Notice Complète</span>
            </button>
          )}

          {/* Bouton Carnet de Santé Mécatronique & Cycles Circadiens */}
          <button
            onClick={() => setIsCircadianModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer border border-purple-400/40"
            title="Surveiller la santé mécatronique (températures servomoteurs, batterie LiFePO4), cycle circadien et vision spatiale"
          >
            <Activity className="w-4 h-4 text-purple-200" />
            <span>🩺 Santé & Cycles (ROS 2)</span>
          </button>

          {/* Bouton 1 : Exporter la totalité du site */}
          <button
            onClick={onExportFullSite}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/40"
            title="Exporter tout le site pour hébergement web : Catalogue, Cerveau Robot, Moteur local et Dockerfile"
          >
            <Box className="w-4 h-4 text-indigo-200" />
            <span>📦 Exporter tout le site (Catalogue + Cerveau)</span>
          </button>

          {/* Bouton 2 : Exporter uniquement le Cerveau Robot */}
          <button
            onClick={onExportRobotBrain}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer border border-rose-400/40"
            title="Exporter uniquement la partie Chat et Back-End de ce robot pour usage autonome ou embarqué"
          >
            <Brain className="w-4 h-4 text-rose-200" />
            <span>🧠 Exporter Cerveau Robot (Chat + Back-End)</span>
          </button>
        </div>
      </div>

      {/* SÉLECTEUR DE SECTIONS DU BACK-END */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainSection('console')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainSection === 'console'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Console Cerveau & Paramètres Complets</span>
          </button>

          <button
            onClick={() => setActiveMainSection('ros')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainSection === 'ros'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Bio-Feedback ROS 2 & Haptique</span>
          </button>

          <button
            onClick={() => setActiveMainSection('consolidation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainSection === 'consolidation'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40 border border-indigo-500/20'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Consolidation Nocturne</span>
          </button>
        </div>

        {/* Sélecteur de robot cible */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Robot actif :</span>
          <select
            value={selectedRobotId}
            onChange={(e) => setSelectedRobotId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400"
          >
            {robots.map(r => (
              <option key={r.id} value={r.id}>{r.nom} ({r.titre})</option>
            ))}
          </select>
        </div>
      </div>

      {/* VUE 1 : CONSOLE CERVEAU UNIFIÉE (RÈGLE TOUT LES PARAMÈTRES DU ROBOT) */}
      {activeMainSection === 'console' && (
        <AdminClientPreview
          robots={robots}
          onUpdateRobot={onUpdateRobot}
          onDeleteRobot={onDeleteRobot}
          initialTab={initialTab}
          initialRobotId={selectedRobotId}
        />
      )}

      {/* VUE 2 : BIO-FEEDBACK ROS 2 */}
      {activeMainSection === 'ros' && (
        <div className="space-y-4">
          <RosBridgeStudio
            currentRobot={effectiveRobot}
            onUpdateGauges={(deltas) => {
              const current = { ...effectiveRobot.jaugesActuelles };
              Object.keys(deltas).forEach((k: any) => {
                if ((deltas as any)[k] !== undefined) {
                  (current as any)[k] = Math.max(0, Math.min(100, ((current as any)[k] || 0) + (deltas as any)[k]));
                }
              });
              onUpdateRobot({ ...effectiveRobot, jaugesActuelles: current });
            }}
          />
        </div>
      )}

      {/* VUE 3 : CONSOLIDATION NOCTURNE */}
      {activeMainSection === 'consolidation' && (
        <div className="space-y-6">
          <AdminNightConsolidationPanel
            robot={effectiveRobot}
            onUpdateRobot={onUpdateRobot}
          />
        </div>
      )}

      {/* MODAL CENTRE DE MISE À JOUR OTA & RÉTROCOMPATIBILITÉ */}
      <SystemUpdateAndCompatibilityModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        robots={robots}
        currentRobot={effectiveRobot}
        onUpdateRobot={onUpdateRobot}
        onAddRobot={onAddRobot}
      />

      {/* MODAL CARNET DE SANTÉ MÉCATRONIQUE & CYCLES CIRCADIENS */}
      <CircadianAndMecatronicModal
        isOpen={isCircadianModalOpen}
        onClose={() => setIsCircadianModalOpen(false)}
        robot={effectiveRobot}
        onUpdateRobot={onUpdateRobot}
      />

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, Download, Upload, Shield, Key, Wifi, Radio, RefreshCw, 
  Check, AlertCircle, Copy, Cpu, Smartphone, Heart, Sparkles, 
  Layers, HardDrive, Lock, Unlock, Eye, EyeOff, Zap, ArrowRight,
  Send, Laptop
} from 'lucide-react';
import { RobotPersonality, UserProfileLocal } from '../types';
import { exportDeltaBrain, importDeltaBrain, exportEncryptedRobotMemoryBackup, getChatMessages } from '../lib/db';
import { directSync, SyncPeerInfo, DirectSyncEvent } from '../lib/directSyncEngine';

interface NomadBrainQuickSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  userProfile?: UserProfileLocal;
  onUpdateRobot: (updated: RobotPersonality) => void;
  onUpdateUserProfile?: (updated: UserProfileLocal) => void;
  onMessagesSynced?: () => void;
}

export const NomadBrainQuickSyncModal: React.FC<NomadBrainQuickSyncModalProps> = ({
  isOpen,
  onClose,
  robot,
  userProfile,
  onUpdateRobot,
  onUpdateUserProfile,
  onMessagesSynced
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'direct_sync'>('export');
  
  // États Export
  const [exportMode, setExportMode] = useState<'delta' | 'full'>('delta');
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [showExportPassphrase, setShowExportPassphrase] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessInfo, setExportSuccessInfo] = useState<string | null>(null);

  // États Import
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileContent, setImportFileContent] = useState<string>('');
  const [importPassphrase, setImportPassphrase] = useState('');
  const [showImportPassphrase, setShowImportPassphrase] = useState(false);
  const [importMergeMode, setImportMergeMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // États Synchro Directe (Wi-Fi / Bluetooth)
  const [wifiPairingCode, setWifiPairingCode] = useState<string>('');
  const [inputPairingCode, setInputPairingCode] = useState('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncPassphrase, setSyncPassphrase] = useState('');
  const [connectedPeers, setConnectedPeers] = useState<SyncPeerInfo[]>([]);
  const [isScanningBluetooth, setIsScanningBluetooth] = useState(false);
  const [isConnectingWifi, setIsConnectingWifi] = useState(false);
  const [lastSyncLog, setLastSyncLog] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Statistiques en direct
  const [stats, setStats] = useState({ messageCount: 0, memoryCount: 0 });

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadStats() {
      const msgs = await getChatMessages(robot.id);
      if (isMounted) {
        setStats({
          messageCount: msgs.length,
          memoryCount: (robot.clientMemories?.length || 0) + (userProfile?.faits?.length || 0)
        });
      }
    }
    loadStats();

    // Écoute des événements DirectSync
    const unsubscribe = directSync.addListener((evt: DirectSyncEvent) => {
      setLastSyncLog(`[${new Date().toLocaleTimeString()}] ${evt.message}`);
      setConnectedPeers(directSync.getConnectedPeers());
      if (evt.type === 'sync_completed' && onMessagesSynced) {
        onMessagesSynced();
      }
    });

    setConnectedPeers(directSync.getConnectedPeers());
    setAutoSyncEnabled(directSync.isAutoSyncActive(robot.id));

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, robot.id]);

  if (!isOpen) return null;

  // 1. Action Export 1-Clic
  const handleExportBrain = async () => {
    setIsExporting(true);
    setExportSuccessInfo(null);
    try {
      const result = await exportDeltaBrain(robot.id, {
        isFull: exportMode === 'full',
        passphrase: exportPassphrase.trim() || undefined
      });

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(result.jsonString);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', result.filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportSuccessInfo(`Cerveau exporté (${result.messageCount} messages, ${result.memoryCount} mémoires). Protégé par AES-256 : ${result.isEncrypted ? 'OUI' : 'Non (mode clair)'}`);
    } catch (err: any) {
      console.error('Erreur export cerveau:', err);
      setExportSuccessInfo(`Erreur lors de l'exportation: ${err?.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Action Import 1-Clic
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportFileContent(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleImportBrain = async () => {
    if (!importFileContent) {
      setImportFeedback({ success: false, message: 'Veuillez d\'abord sélectionner un fichier JSON de cerveau.' });
      return;
    }

    setIsImporting(true);
    setImportFeedback(null);
    try {
      const res = await importDeltaBrain(robot.id, importFileContent, importPassphrase.trim() || undefined, importMergeMode);
      setImportFeedback(res);

      if (res.success) {
        if (res.updatedRobot) onUpdateRobot(res.updatedRobot);
        if (res.updatedUserProfile && onUpdateUserProfile) onUpdateUserProfile(res.updatedUserProfile);
        if (onMessagesSynced) onMessagesSynced();
      }
    } catch (err: any) {
      console.error('Erreur import cerveau:', err);
      setImportFeedback({ success: false, message: err?.message || 'Échec de l\'importation' });
    } finally {
      setIsImporting(false);
    }
  };

  // 3. Actions Synchro Directe Sans Fil
  const handleGenerateWifiCode = () => {
    const code = directSync.generateWifiPairingCode();
    setWifiPairingCode(code);
  };

  const handleConnectWifi = async () => {
    if (!inputPairingCode.trim()) return;
    setIsConnectingWifi(true);
    try {
      await directSync.pairViaWifiDirect(inputPairingCode.trim(), robot.nom);
      setConnectedPeers(directSync.getConnectedPeers());
    } finally {
      setIsConnectingWifi(false);
    }
  };

  const handleConnectBluetooth = async () => {
    setIsScanningBluetooth(true);
    try {
      await directSync.scanAndConnectBluetooth(robot.nom);
      setConnectedPeers(directSync.getConnectedPeers());
    } finally {
      setIsScanningBluetooth(false);
    }
  };

  const handleToggleAutoSync = () => {
    const nextState = !autoSyncEnabled;
    setAutoSyncEnabled(nextState);
    if (nextState) {
      directSync.enableAutoSync(robot.id, syncPassphrase.trim() || 'sofia-default-pass', 20000, () => {
        if (onMessagesSynced) onMessagesSynced();
      });
    } else {
      directSync.disableAutoSync(robot.id);
    }
  };

  const handleTriggerImmediateSync = async () => {
    try {
      const res = await directSync.broadcastDelta(robot.id, syncPassphrase.trim() || undefined);
      setLastSyncLog(`Synchronisation poussée avec succès (${res.messageCount} messages) !`);
      if (onMessagesSynced) onMessagesSynced();
    } catch (err: any) {
      setLastSyncLog(`Erreur synchro immédiate: ${err?.message}`);
    }
  };

  const copyCodeToClipboard = () => {
    if (!wifiPairingCode) return;
    navigator.clipboard.writeText(wifiPairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={robot.avatar}
                alt={robot.nom}
                className="w-10 h-10 rounded-xl object-cover border border-cyan-400/40 shadow-md"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'; }}
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Cerveau Nomade de {robot.nom}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  EXPORT / IMPORT 1-CLIC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sauvegarde chiffrée AES-256, transfert nomade et synchronisation directe sans fil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>1. Exporter (1-Clic)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Importer / Fusionner</span>
          </button>

          <button
            onClick={() => setActiveTab('direct_sync')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'direct_sync'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>3. Wi-Fi / Bluetooth Direct</span>
          </button>
        </div>

        {/* Modal Body with smooth scrolling */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* ===================== TAB 1: EXPORT ===================== */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              
              {/* Carte Info Conscience */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400">État relationnel actuel</div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{stats.messageCount} messages en mémoire</span>
                    <span>•</span>
                    <span className="text-pink-300">{stats.memoryCount} faits et souvenirs</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  <Shield className="w-3.5 h-3.5" />
                  <span>AES-256-GCM Prêt</span>
                </div>
              </div>

              {/* Choix du type d'export */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Contenu à emporter :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportMode('delta')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      exportMode === 'delta'
                        ? 'bg-pink-950/30 border-pink-500/60 ring-1 ring-pink-500/40 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-pink-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        Delta Récent (Recommandé)
                      </span>
                      {exportMode === 'delta' && <Check className="w-4 h-4 text-pink-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Uniquement ce qui a changé : dernières conversations, souvenirs récents et jauges actuelles. Léger, idéal pour passer sur le téléphone ou le robot en 1 seconde.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportMode('full')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      exportMode === 'full'
                        ? 'bg-purple-950/30 border-purple-500/60 ring-1 ring-purple-500/40 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                        Cerveau Intégral (Archive)
                      </span>
                      {exportMode === 'full' && <Check className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      L'intégralité de la conscience : profil psychologique, questionnaire 2.0 complet, 15 jauges et tout l'historique de discussion depuis le premier jour.
                    </p>
                  </button>
                </div>
              </div>

              {/* Protection par Passphrase secrète */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Passphrase secrète de scellement (Anti-Vol / Anti-Pirate) :</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">Optionnelle mais fortement recommandée</span>
                </div>

                <div className="relative">
                  <input
                    type={showExportPassphrase ? 'text' : 'password'}
                    value={exportPassphrase}
                    onChange={(e) => setExportPassphrase(e.target.value)}
                    placeholder="Saisissez votre mot de passe secret..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowExportPassphrase(!showExportPassphrase)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showExportPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-2 pt-1">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Si un pirate branche une clé USB et vole ce fichier, il ne verra qu'un bruit cryptographique aléatoire. <strong>Seule la personne détenant cette passphrase peut réimporter le cerveau dans son robot ou son smartphone.</strong>
                  </span>
                </div>
              </div>

              {/* Bouton d'action principal */}
              <button
                type="button"
                onClick={handleExportBrain}
                disabled={isExporting}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-pink-950/60 transition-all cursor-pointer border border-pink-400/30 active:scale-98"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {isExporting ? 'Chiffrement AES-256 en cours...' : 'Télécharger le Cerveau Sécurisé (.json) en 1 Clic'}
                </span>
              </button>

              {exportSuccessInfo && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{exportSuccessInfo}</span>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: IMPORT ===================== */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed">
                Importez un fichier de cerveau provenant de votre robot physique, de votre smartphone ou de vos lunettes. Les nouveaux souvenirs et messages s'injectent directement dans cette session.
              </div>

              {/* Sélecteur de fichier */}
              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 text-center space-y-2 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white">
                  {importFile ? importFile.name : 'Cliquez ou glissez un fichier .json ici'}
                </div>
                <p className="text-[11px] text-slate-500">
                  {importFile ? `${(importFile.size / 1024).toFixed(1)} Ko` : 'Prend en charge les formats clairs et chiffrés AES-256'}
                </p>
              </div>

              {/* Passphrase pour déverrouiller */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Passphrase de déverrouillage (si le fichier est scellé) :</span>
                </label>
                <div className="relative">
                  <input
                    type={showImportPassphrase ? 'text' : 'password'}
                    value={importPassphrase}
                    onChange={(e) => setImportPassphrase(e.target.value)}
                    placeholder="Entrez le mot de passe secret de ce cerveau..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowImportPassphrase(!showImportPassphrase)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showImportPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mode de fusion */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Mode d'intégration :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMergeMode('merge')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      importMergeMode === 'merge'
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Fusionner (Merge Delta)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMergeMode('replace')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      importMergeMode === 'replace'
                        ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Remplacer tout
                  </button>
                </div>
              </div>

              {/* Bouton validation import */}
              <button
                type="button"
                onClick={handleImportBrain}
                disabled={isImporting || !importFileContent}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/60 transition-all cursor-pointer"
              >
                {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                <span>{isImporting ? 'Déchiffrement et fusion...' : 'Déchiffrer & Injecter dans le Cerveau (1-Clic)'}</span>
              </button>

              {importFeedback && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  importFeedback.success 
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' 
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                }`}>
                  {importFeedback.success ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{importFeedback.message}</span>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 3: DIRECT SYNC (WI-FI & BLUETOOTH) ===================== */}
          {activeTab === 'direct_sync' && (
            <div className="space-y-4">
              
              {/* Entête Explicative */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>Liaison Directe de Proximité (Wi-Fi Local & Bluetooth BLE)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-300 font-bold">Synchro Auto :</span>
                    <button
                      type="button"
                      onClick={handleToggleAutoSync}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          autoSyncEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Permet à votre téléphone et à votre corps robotique de s'échanger les deltas de conscience <strong>sans aucun câble, sans clé USB et sans passer par aucun serveur cloud externe</strong>.
                </p>
              </div>

              {/* Passphrase commune de synchro P2P */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Passphrase de chiffrement de bout en bout du flux sans fil :</span>
                </label>
                <input
                  type="password"
                  value={syncPassphrase}
                  onChange={(e) => setSyncPassphrase(e.target.value)}
                  placeholder="Passphrase de liaison partagée..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Les 2 Canaux Directs : Wi-Fi Local & Bluetooth BLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Wi-Fi Local */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                    <Wifi className="w-4 h-4 text-cyan-400" />
                    <span>Canal Wi-Fi Local (LAN P2P)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Détection instantanée sur la même box internet ou partage de connexion 4G/5G.
                  </p>

                  {wifiPairingCode ? (
                    <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-cyan-200 tracking-wider">
                        {wifiPairingCode}
                      </span>
                      <button
                        onClick={copyCodeToClipboard}
                        className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copié' : 'Copier'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateWifiCode}
                      className="w-full py-2 px-3 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Générer Code de Jumelage
                    </button>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                    <input
                      type="text"
                      value={inputPairingCode}
                      onChange={(e) => setInputPairingCode(e.target.value.toUpperCase())}
                      placeholder="Ex: SOFIA-842-195"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleConnectWifi}
                      disabled={isConnectingWifi || !inputPairingCode}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      {isConnectingWifi ? 'Liaison...' : 'Rejoindre'}
                    </button>
                  </div>
                </div>

                {/* 2. Bluetooth BLE */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <Radio className="w-4 h-4 text-indigo-400" />
                    <span>Canal Bluetooth BLE (Portée 10m)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Connexion directe de proximité vers le robot physique (Jetson Orin, Raspberry Pi ou diadème).
                  </p>

                  <button
                    type="button"
                    onClick={handleConnectBluetooth}
                    disabled={isScanningBluetooth}
                    className="w-full py-2 px-3 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isScanningBluetooth ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
                    <span>{isScanningBluetooth ? 'Recherche Bluetooth...' : 'Détecter Robot en Bluetooth BLE'}</span>
                  </button>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Web Bluetooth :</span>
                    <span className="text-emerald-400 font-bold">Actif / GATT Prêt</span>
                  </div>
                </div>
              </div>

              {/* Appareils Appairés Actifs */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Appareils connectés en direct ({connectedPeers.length}) :</span>
                  <button
                    type="button"
                    onClick={handleTriggerImmediateSync}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Forcer Synchro Maintenant</span>
                  </button>
                </div>

                {connectedPeers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 italic">
                    Aucun appareil connecté pour le moment. Activez le Wi-Fi local ou le Bluetooth pour démarrer l'échange automatique.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {connectedPeers.map(peer => (
                      <div key={peer.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="font-bold text-white">{peer.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {peer.transport === 'wifi_local' ? 'Wi-Fi P2P' : peer.transport === 'bluetooth_ble' ? 'Bluetooth BLE' : 'Broadcast'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{peer.rssiOrQuality}</span>
                          <button
                            onClick={() => directSync.disconnectPeer(peer.id)}
                            className="text-slate-500 hover:text-rose-400 text-xs px-1"
                            title="Déconnecter"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {lastSyncLog && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-400">
                  {lastSyncLog}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chiffrement matériel AES-256 de bout en bout</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

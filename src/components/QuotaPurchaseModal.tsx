import React, { useState } from 'react';
import { RobotPersonality, QuotaState } from '../types';
import { 
  ShoppingBag, 
  Key, 
  Bot, 
  ShieldCheck, 
  Download, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';
import { exportRobotMemoryBackup, importRobotMemoryBackup } from '../lib/db';

interface QuotaPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  quota: QuotaState;
  onUnlockKey: (key: string) => void;
  onPurchasePhysicalRobot: () => void;
  onRefreshData: () => void;
}

export const QuotaPurchaseModal: React.FC<QuotaPurchaseModalProps> = ({
  isOpen,
  onClose,
  robot,
  quota,
  onUnlockKey,
  onPurchasePhysicalRobot,
  onRefreshData
}) => {
  const [digitalKeyInput, setDigitalKeyInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportBackup = async () => {
    try {
      const jsonBackup = await exportRobotMemoryBackup(robot.id);
      const blob = new Blob([jsonBackup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sofia_companion_${robot.nom.toLowerCase()}_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.error('Erreur export JSON:', e);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importRobotMemoryBackup(robot.id, content);
        if (success) {
          setImportStatus('Sauvegarde importée avec succès ! La relation a été restaurée.');
          onRefreshData();
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('Échec de l\'importation. Fichier invalide.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleUnlockWithKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!digitalKeyInput.trim()) return;
    onUnlockKey(digitalKeyInput.trim());
  };

  const remainingMessages = Math.max(0, quota.messagesGratuitsMax - quota.messagesUtilises);
  const progressPercent = Math.min(100, (quota.messagesUtilises / quota.messagesGratuitsMax) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#08080c] border border-white/10 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono tracking-wide">
                Quota & Continuité de la Relation
              </h3>
              <p className="text-xs text-slate-400">
                Passez à la version illimitée ou transférez la mémoire sur robot physique
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            {quota.debloque ? (
              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Accès Illimité Actif
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                {remainingMessages} message(s) gratuit(s) restant(s)
              </span>
            )}
          </div>
        </div>

        {/* Quota Progress Bar */}
        {!quota.debloque && (
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 mb-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Utilisation de l'essai gratuit :</span>
              <span className="font-bold text-cyan-300">{quota.messagesUtilises} / {quota.messagesGratuitsMax} messages</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  progressPercent > 80 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Purchase Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Option 1: Digital Key */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <Key className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-1 font-mono">Version Numérique Illimitée</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Débloque les quotas de conversation sans limite, conserve la mémoire IndexedDB, le mode vocal et toutes les fonctionnalités du cerveau Sofia.
              </p>
              <div className="text-xl font-bold font-mono text-white mb-2">
                29 € <span className="text-xs font-normal text-slate-400 font-sans">accès à vie</span>
              </div>
            </div>

            <form onSubmit={handleUnlockWithKey} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code clé (ex: SOFIA-VIP-2026)"
                  value={digitalKeyInput}
                  onChange={(e) => setDigitalKeyInput(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold font-mono shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                >
                  Activer
                </button>
              </div>
              <button
                type="button"
                onClick={() => onUnlockKey('SOFIA-VIP-PASS')}
                className="text-[11px] text-cyan-400 hover:underline block text-left font-mono"
              >
                (Simuler l'achat instantané d'une clé numérique)
              </button>
            </form>
          </div>

          {/* Option 2: Intégration sur Robot Physique ROS 2 */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-1 font-mono">Intégration Robot Physique ROS 2</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Exportez et injectez directement l'âme psychologique et les souvenirs de votre personnalité dans votre robot physique compatible ROS 2 (Humble / Iron / Jazzy).
              </p>
              <div className="text-xl font-bold font-mono text-white mb-2">
                Passerelle ROS 2 <span className="text-xs font-normal text-emerald-400 font-sans">Bridge temps-réel inclus</span>
              </div>
            </div>

            <div>
              <button
                id="purchase-physical-robot-btn"
                onClick={onPurchasePhysicalRobot}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)] font-mono"
              >
                <Sparkles className="w-4 h-4" />
                <span>Déployer sur mon Robot ROS 2</span>
              </button>
              <span className="text-[10px] text-slate-500 block text-center mt-1.5 font-mono">
                Synchronisation automatique de la mémoire locale et des topics ROS 2.
              </span>
            </div>
          </div>
        </div>

        {/* Backup Export / Import Section */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Database className="w-4 h-4 text-emerald-400" />
                Sauvegarde & Souveraineté des Données (100% Local)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Exportez ou restaurez l'intégralité du cerveau (jauges, discussions, profil) au format JSON.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="export-json-backup-btn"
              onClick={handleExportBackup}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono font-semibold rounded-xl border border-white/10 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Télécharger le backup JSON</span>
            </button>

            <label className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono font-semibold rounded-xl border border-white/10 flex items-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Restaurer un fichier JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            {exportSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Fichier JSON téléchargé !
              </span>
            )}
          </div>

          {importStatus && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
              {importStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-5 border-t border-white/5 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

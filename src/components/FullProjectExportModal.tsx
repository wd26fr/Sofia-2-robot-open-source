import React, { useState } from 'react';
import { Download, Server, HardDrive, FileJson, Check, Copy, ExternalLink, X, Globe, Shield, Terminal, RefreshCw, Cpu, Layers, Lock, Key } from 'lucide-react';
import { RobotPersonality, UserProfileLocal } from '../types';
import { encryptObject } from '../lib/cryptoStorage';

interface FullProjectExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  robots?: RobotPersonality[];
  currentRobot?: RobotPersonality;
  userProfile?: UserProfileLocal;
  exportMode?: 'full_site' | 'robot_brain';
}

export const FullProjectExportModal: React.FC<FullProjectExportModalProps> = ({
  isOpen,
  onClose,
  robots = [],
  currentRobot,
  userProfile,
  exportMode = 'full_site'
}) => {
  const effectiveRobots = robots.length > 0 
    ? robots 
    : (currentRobot ? [currentRobot] : []);
  const [activeTab, setActiveTab] = useState<'backup_json' | 'standalone_html' | 'server_kit'>(
    exportMode === 'robot_brain' ? 'standalone_html' : 'backup_json'
  );
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [useEncryption, setUseEncryption] = useState(true);
  const [exportPassphrase, setExportPassphrase] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // 1. Export Backup JSON (clair ou chiffré AES-GCM)
  const handleDownloadFullJson = async () => {
    setIsDownloading(true);
    try {
      const fullExport = {
        meta: {
          nomProjet: 'Sofia 2.0 - Compagnon Émotionnel & Cerveau Robotique Humanoïde',
          version: '2.4.0',
          dateExport: new Date().toISOString(),
          totalRobots: effectiveRobots.length
        },
        profilUtilisateur: userProfile || null,
        catalogueRobots: effectiveRobots,
        systeme: {
          moteurLocalDeterministe: 'Actif (0-Token, multi-réponses aléatoires vivantes)',
          moteurSémantiqueCdn: 'Actif',
          supportRos2: true,
          consolidationNocturne: 'Automatique & Manuelle'
        }
      };

      let finalContent: string;
      let filename = `sofia-projet-integral-${new Date().toISOString().slice(0, 10)}.json`;

      if (useEncryption) {
        const encryptedPayload = await encryptObject(fullExport, exportPassphrase.trim() || undefined);
        const sealedContainer = {
          format: 'sofia-encrypted-brain-v2',
          encryption: 'AES-GCM-256',
          kdf: 'PBKDF2-SHA256-100000',
          exportDate: new Date().toISOString(),
          hasPassphrase: Boolean(exportPassphrase.trim()),
          payload: encryptedPayload
        };
        finalContent = JSON.stringify(sealedContainer, null, 2);
        filename = `sofia-cerveau-chiffre-aes256-${new Date().toISOString().slice(0, 10)}.json`;
      } else {
        finalContent = JSON.stringify(fullExport, null, 2);
      }

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(finalContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      console.error('Erreur export JSON:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // 2. Export Standalone Single-File HTML
  const handleDownloadStandaloneHtml = () => {
    setIsDownloading(true);
    try {
      const serializedRobots = JSON.stringify(effectiveRobots);
      const standaloneHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sofia 2.0 - Compagnon Hors-Ligne Autonome</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .glass-card { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.5); }
  </style>
</head>
<body class="min-h-screen flex flex-col p-4 md:p-8">
  <header class="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">S</div>
      <div>
        <h1 class="text-xl font-black text-white tracking-tight">Sofia 2.0 Standalone</h1>
        <p class="text-xs text-slate-400">Version 100% Autonome Hors-Ligne (0-Token Moteur Local)</p>
      </div>
    </div>
    <div class="px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs rounded-full font-mono font-bold">
      \${effectiveRobots.length} Robots Embarqués
    </div>
  </header>

  <main class="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
    <!-- Colonne Robot & Jauges -->
    <div class="glass-card rounded-2xl p-5 flex flex-col space-y-4">
      <div class="relative rounded-xl overflow-hidden aspect-[4/5] bg-slate-950 border border-slate-800">
        <img id="robot-avatar" src="\${effectiveRobots[0]?.avatar || ''}" alt="Avatar" class="w-full h-full object-cover" />
        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4">
          <h2 id="robot-nom" class="text-lg font-bold text-white">\${effectiveRobots[0]?.nom || 'Compagnon'}</h2>
          <p id="robot-titre" class="text-xs text-pink-400 font-medium">\${effectiveRobots[0]?.titre || ''}</p>
        </div>
      </div>
      
      <!-- Sélecteur de robot -->
      <div class="space-y-1">
        <label class="text-xs font-bold text-slate-300">Changer de Compagnon :</label>
        <select id="robot-selector" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white" onchange="window.switchRobot(this.value)">
          \${effectiveRobots.map(r => \`<option value="\${r.id}">\${r.nom} (\${r.ageApparent} ans)</option>\`).join('')}
        </select>
      </div>

      <!-- Jauges -->
      <div class="space-y-2 pt-2 border-t border-slate-800">
        <h3 class="text-xs font-bold text-slate-300">État Émotionnel Actuel :</h3>
        <div id="gauges-container" class="space-y-2 text-xs"></div>
      </div>
    </div>

    <!-- Colonne Chat & Moteur Local Déterministe -->
    <div class="md:col-span-2 glass-card rounded-2xl p-5 flex flex-col justify-between">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-bold text-slate-200">Moteur Déterministe Local Instantané (0ms)</span>
        </div>
        <span class="text-[11px] text-slate-400">Raccourcis : [S] Capteur Intime | [C] Caresse</span>
      </div>

      <!-- Messages Stream -->
      <div id="chat-stream" class="flex-1 overflow-y-auto space-y-3 min-h-[360px] max-h-[460px] p-2 pr-4 text-xs">
        <div class="flex items-start gap-2">
          <div class="p-3 rounded-2xl bg-slate-800/80 text-slate-100 max-w-[85%] leading-relaxed border border-slate-700">
            Bonjour ! Je suis prête. Tu peux me parler ou utiliser les capteurs.
          </div>
        </div>
      </div>

      <!-- Quick Sensory Bar -->
      <div class="flex flex-wrap gap-2 py-2">
        <button onclick="window.triggerSensor('s')" class="px-3 py-1.5 rounded-lg bg-pink-950/60 hover:bg-pink-900 border border-pink-500/40 text-pink-300 text-xs font-bold transition-all">
          🔥 Capteur Intime [S]
        </button>
        <button onclick="window.triggerSensor('c')" class="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all">
          💖 Caresse Tête [C]
        </button>
      </div>

      <!-- Input Form -->
      <form id="chat-form" onsubmit="window.handleSendMessage(event)" class="flex gap-2 pt-2 border-t border-slate-800">
        <input id="user-input" type="text" placeholder="Écris un message à ton robot..." class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500" />
        <button type="submit" class="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs transition-all">Envoyer</button>
      </form>
    </div>
  </main>

  <footer class="max-w-5xl mx-auto w-full text-center py-4 text-[11px] text-slate-500 mt-4">
    Projet Sofia 2.0 • Hébergeable sur n'importe quel serveur web, Raspberry Pi ou localement (file://).
  </footer>

  <script>
    const ROBOTS = ${serializedRobots};
    let currentRobot = ROBOTS[0] || {};
    let gauges = { ...(currentRobot.jaugesActuelles || currentRobot.jaugesInitiales || { affection: 40, desir: 20, plaisirSexuel: 0, bienEtre: 70 }) };

    function renderGauges() {
      const container = document.getElementById('gauges-container');
      if (!container) return;
      container.innerHTML = Object.entries(gauges).map(([k, val]) => \`
        <div>
          <div class="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span class="capitalize">\${k}</span>
            <span class="font-mono text-pink-300 font-bold">\${val}%</span>
          </div>
          <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-300" style="width: \${Math.min(100, Math.max(0, val))}%"></div>
          </div>
        </div>
      \`).join('');
    }

    window.switchRobot = function(id) {
      const found = ROBOTS.find(r => r.id === id);
      if (found) {
        currentRobot = found;
        document.getElementById('robot-avatar').src = found.avatar || '';
        document.getElementById('robot-nom').innerText = found.nom;
        document.getElementById('robot-titre').innerText = found.titre || '';
        gauges = { ...(found.jaugesActuelles || found.jaugesInitiales || {}) };
        renderGauges();
      }
    };

    window.addMessage = function(text, sender) {
      const stream = document.getElementById('chat-stream');
      const msgDiv = document.createElement('div');
      msgDiv.className = sender === 'user' ? 'flex justify-end' : 'flex justify-start';
      msgDiv.innerHTML = \`
        <div class="p-3 rounded-2xl \${sender === 'user' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-100 border border-slate-700'} max-w-[85%] leading-relaxed">
          \${text}
        </div>
      \`;
      stream.appendChild(msgDiv);
      stream.scrollTop = stream.scrollHeight;
    };

    window.triggerSensor = function(key) {
      const rules = currentRobot.reglesLocales || [];
      const matchedRule = rules.find(r => (r.raccourciClavier || '').toLowerCase() === key.toLowerCase());
      if (matchedRule) {
        // Choix de la réponse
        const branch = matchedRule.reponses?.[0] || matchedRule.reponseSinon;
        if (branch) {
          const phrases = branch.reponsesPossibles || [branch.texte];
          const chosen = phrases[Math.floor(Math.random() * phrases.length)];
          if (branch.modificateursJauges) {
            Object.entries(branch.modificateursJauges).forEach(([gk, val]) => {
              gauges[gk] = Math.min(100, Math.max(0, (gauges[gk] || 50) + val));
            });
            renderGauges();
          }
          window.addMessage(chosen, 'robot');
        }
      } else {
        window.addMessage(\`[Capteur \${key.toUpperCase()} activé]\`, 'user');
        window.addMessage("Mmh... tes caresses sont douces.", 'robot');
      }
    };

    window.handleSendMessage = function(e) {
      e.preventDefault();
      const input = document.getElementById('user-input');
      const txt = (input.value || '').trim();
      if (!txt) return;
      window.addMessage(txt, 'user');
      input.value = '';

      // Recherche dans le moteur déterministe
      const rules = currentRobot.reglesLocales || [];
      let found = false;
      for (const rule of rules) {
        const hasKw = (rule.motsCles || []).some(kw => txt.toLowerCase().includes(kw.toLowerCase()));
        if (hasKw) {
          found = true;
          const branch = rule.reponses?.[0] || rule.reponseSinon;
          const phrases = branch?.reponsesPossibles || [branch?.texte || 'Oui, je t\\'écoute.'];
          const reply = phrases[Math.floor(Math.random() * phrases.length)];
          if (branch?.modificateursJauges) {
            Object.entries(branch.modificateursJauges).forEach(([gk, val]) => {
              gauges[gk] = Math.min(100, Math.max(0, (gauges[gk] || 50) + val));
            });
            renderGauges();
          }
          setTimeout(() => window.addMessage(reply, 'robot'), 150);
          break;
        }
      }

      if (!found) {
        setTimeout(() => {
          window.addMessage("Je ressens bien ce que tu me dis... parle-moi encore de toi.", 'robot');
        }, 300);
      }
    };

    window.addEventListener('keydown', (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key.toLowerCase() === 's') window.triggerSensor('s');
      if (e.key.toLowerCase() === 'c') window.triggerSensor('c');
    });

    renderGauges();
  </script>
</body>
</html>`;

      const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `sofia-standalone-offline-${new Date().toISOString().slice(0, 10)}.html`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const dockerComposeContent = `version: '3.8'

services:
  sofia-companion:
    build: .
    container_name: sofia_robot_companion
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
`;

  const dockerfileContent = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000
CMD ["npm", "start"]
`;

  const quickstartBash = `# 1. Cloner ou dézipper les fichiers sur votre serveur ou Raspberry Pi
cd /opt/sofia-project

# 2. Installer les dépendances
npm install

# 3. Compiler l'application
npm run build

# 4. Lancer en arrière-plan avec PM2 ou systemd
npm start
# L'application est accessible sur http://VOTRE_IP:3000
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Exportation Complète du Projet (Serveur, Local & Hors-Ligne)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {robots.length} Cerveaux Inclus
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Exportez l'intégralité du site : catalogue de robots, cerveaux back-office, règles déterministes et scripts de déploiement serveur.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4">
          <button
            onClick={() => setActiveTab('backup_json')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'backup_json'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>1. Sauvegarde Globale JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('standalone_html')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'standalone_html'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. Bundle Standalone Autonome (HTML/JS)</span>
          </button>

          <button
            onClick={() => setActiveTab('server_kit')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'server_kit'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>3. Kit Déploiement Serveur & Raspberry Pi</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: BACKUP JSON */}
          {activeTab === 'backup_json' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-indigo-400" />
                  Sauvegarde Exhaustive du Projet (.json)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ce fichier contient la totalité des données du projet dans leur structure native TypeScript/JSON :
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2">
                  <li>Les <strong>{robots.length} profils et personnalités</strong> complètes du catalogue (Sofia, Camille, Aria, Julien, Kael, etc.).</li>
                  <li>Toutes les <strong>règles déterministes 0-token</strong>, leurs branches multiples, mots-clés et regex.</li>
                  <li>Les <strong>jauges émotionnelles dynamiques</strong>, souvenirs et journaux intimes nocturnes.</li>
                  <li>Le <strong>profil utilisateur local</strong>, faits et relations mémorisées.</li>
                  <li>Les configurations de consolidation nocturne et paramètres de passerelle ROS.</li>
                </ul>
              </div>

              {/* Options de Chiffrement & Sécurité Anti-Pirate */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Chiffrement de Sécurité Anti-Vol (AES-256-GCM)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useEncryption}
                      onChange={(e) => setUseEncryption(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  {useEncryption 
                    ? "🛡️ Le fichier exporté sera scellé cryptographiquement. Si un pirate dérobe votre fichier sur clé USB, il sera incapable de lire vos conversations ou souvenirs sans votre mot de passe."
                    : "⚠️ Fichier JSON en texte clair. Pratique pour le développement ou l'édition manuelle directe."}
                </p>

                {useEncryption && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Passphrase secrète de protection (optionnelle mais recommandée) :</span>
                    </label>
                    <input
                      type="password"
                      value={exportPassphrase}
                      onChange={(e) => setExportPassphrase(e.target.value)}
                      placeholder="Entrez votre mot de passe personnel pour sceller ce cerveau..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-mono"
                    />
                    <p className="text-[10px] text-slate-500">
                      Laissez vide pour utiliser la clé cryptographique locale dérivée de votre appareil, ou saisissez une passphrase pour transporter le cerveau sur un autre robot/ordinateur en toute sécurité.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                <div>
                  <div className="font-bold text-sm text-indigo-300">
                    {useEncryption ? "Téléchargement Chiffré AES-256" : "Téléchargement Format Clair"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {useEncryption 
                      ? "Fichier .json scellé, protégé contre le vol par clé USB ou intrusion."
                      : "Fichier JSON brut prêt pour la restauration immédiate."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadFullJson}
                  disabled={isDownloading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{useEncryption ? "Télécharger le Cerveau Chiffré" : "Télécharger le Fichier JSON Global"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE HTML */}
          {activeTab === 'standalone_html' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-pink-400" />
                  Application Autonome Hors-Ligne (Fichier HTML Unique)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Téléchargez un fichier HTML unique 100% autonome prêt à l'emploi. Vous pouvez :
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-2">
                  <li>L'ouvrir directement dans un navigateur par double-clic (sans aucun serveur ni connexion internet).</li>
                  <li>Le déposer sur n'importe quel hébergement statique (GitHub Pages, Netlify, Apache, Nginx, NGINX Raspberry Pi).</li>
                  <li>Profiter du <strong>moteur déterministe local 0-token</strong> et des raccourcis sensoriels [S] et [C].</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-pink-950/20 border border-pink-500/30">
                <div>
                  <div className="font-bold text-sm text-pink-300">Bundle HTML Autonome</div>
                  <div className="text-[11px] text-slate-400">Fonctionne immédiatement hors-ligne en mode autonome.</div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadStandaloneHtml}
                  disabled={isDownloading}
                  className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-pink-950/50 transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger sofia-standalone-offline.html</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SERVER & RASPBERRY PI KIT */}
          {activeTab === 'server_kit' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Déploiement sur Serveur Dédié, VPS Ubuntu ou Raspberry Pi
                </h4>
                <p className="text-xs text-slate-400">
                  Instructions et fichiers de conteneurisation pour faire tourner le backend Express + Vite en continu sur votre propre machine.
                </p>
              </div>

              {/* Docker Compose snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    docker-compose.yml
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(dockerComposeContent, 'compose')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'compose' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'compose' ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  {dockerComposeContent}
                </pre>
              </div>

              {/* Dockerfile snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Dockerfile
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(dockerfileContent, 'dockerfile')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'dockerfile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'dockerfile' ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  {dockerfileContent}
                </pre>
              </div>

              {/* Shell guide */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    Lancement Manuel Node.js (Sans Docker)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(quickstartBash, 'bash')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'bash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'bash' ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-purple-300 overflow-x-auto">
                  {quickstartBash}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

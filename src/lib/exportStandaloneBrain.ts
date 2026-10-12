import { RobotPersonality } from '../types';

/**
 * Génère le fichier HTML/JavaScript 100% autonome du cerveau d'un robot unique.
 * Ce fichier peut s'exécuter hors-ligne dans n'importe quel navigateur (téléphone, PC, tablette, Jetson Orin)
 * et intègre le moteur déterministe local ainsi qu'un bouton d'importation de la sauvegarde IndexedDB.
 */
export function generateStandaloneHtmlBrain(robot: RobotPersonality): string {
  const safeRobotJson = JSON.stringify(robot);

  return `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cerveau Autonome • ${escapeHtml(robot.nom)} (${escapeHtml(robot.titre)})</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#06b6d4',
            brandDark: '#0e7490'
          }
        }
      }
    }
  </script>
  <style>
    /* Custom scrollbars */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0b0f19; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #334155; }
  </style>
</head>
<body class="bg-[#05070e] text-slate-200 min-h-screen flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">

  <!-- Header -->
  <header class="border-b border-cyan-500/20 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
    <div class="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3.5">
        <div class="relative">
          <img 
            src="${robot.avatar}" 
            alt="${escapeHtml(robot.nom)}" 
            class="w-12 h-12 rounded-xl object-cover border-2 border-cyan-400 shadow-md shadow-cyan-500/20"
            onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'"
          />
          <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#090d16] rounded-full animate-pulse"></span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-white tracking-tight">${escapeHtml(robot.nom)}</h1>
            <span class="text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono px-2 py-0.5 rounded-full">
              CERVEAU AUTONOME LOCAL
            </span>
          </div>
          <p class="text-xs text-slate-400 truncate max-w-sm sm:max-w-md italic">
            "${escapeHtml(robot.philosophie || robot.description)}"
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Bouton Import IndexedDB -->
        <label class="cursor-pointer px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
          <span>📥 Importer Sauvegarde IndexedDB</span>
          <input type="file" id="db-file-input" accept=".json" class="hidden" />
        </label>
        
        <!-- Toggle Voix TTS -->
        <button id="toggle-tts-btn" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all">
          <span id="tts-icon">🔊</span>
          <span id="tts-label">Voix Active</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Notification Banner -->
  <div id="notification-banner" class="hidden max-w-5xl mx-auto px-4 mt-3 w-full">
    <div class="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg">
      <div class="flex items-center gap-2">
        <span>✨</span>
        <span id="notification-text">Sauvegarde restaurée avec succès !</span>
      </div>
      <button onclick="document.getElementById('notification-banner').classList.add('hidden')" class="text-slate-400 hover:text-white text-xs">✕</button>
    </div>
  </div>

  <!-- Main Container -->
  <main class="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
    
    <!-- Gauges Bar (15 Jauges Émotionnelles Dynamiques) -->
    <section class="p-4 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Bio-Feedback Émotionnel & Psychologique (Moteur Local 0ms)
          </h2>
        </div>
        <button id="reset-gauges-btn" class="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono transition-colors">
          ↺ Réinitialiser Jauges
        </button>
      </div>

      <!-- Gauges Grid -->
      <div id="gauges-grid" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <!-- Rendu dynamique en JS -->
      </div>
    </section>

    <!-- Chat Messages Window -->
    <section class="flex-1 flex flex-col rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl overflow-hidden min-h-[420px]">
      
      <!-- Messages List -->
      <div id="messages-container" class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[550px]">
        <!-- Welcome Message -->
        <div class="flex gap-3 items-start">
          <img 
            src="${robot.avatar}" 
            class="w-8 h-8 rounded-lg object-cover border border-cyan-500/40 shrink-0" 
            onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'"
          />
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm leading-relaxed max-w-xl shadow-sm">
            <p>Bonjour... Je suis <strong>${escapeHtml(robot.nom)}</strong>. Mon cerveau s'exécute directement dans votre navigateur, sans aucun serveur ni consommation de jetons.</p>
            <p class="mt-2 text-slate-400 text-xs">Si vous avez exporté votre relation depuis l'application Sofia Robotics, cliquez sur <em>"Importer Sauvegarde IndexedDB"</em> ci-dessus pour réinjecter immédiatement vos souvenirs et discussions !</p>
          </div>
        </div>
      </div>

      <!-- Telemetry Pill / Trigger Indicator -->
      <div id="telemetry-bar" class="px-4 py-1.5 bg-slate-950/80 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span id="telemetry-rule">Moteur en veille • 0ms</span>
        <span id="telemetry-memories">Souvenirs en mémoire : 0</span>
      </div>

      <!-- Chat Input Form -->
      <form id="chat-form" class="p-3 sm:p-4 bg-[#070a12] border-t border-slate-800 flex gap-2">
        <input 
          type="text" 
          id="user-input" 
          placeholder="Parlez à ${escapeHtml(robot.nom)} (ex: je t'aime, tu vas bien ?, complimente-la...)..." 
          class="flex-1 bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 placeholder:text-slate-500" 
          autocomplete="off" 
          required 
        />
        <button 
          type="submit" 
          id="send-btn" 
          class="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Envoyer</span>
        </button>
      </form>
    </section>

    <!-- IndexedDB Memories Drawer -->
    <details class="p-4 rounded-2xl bg-[#090d16] border border-slate-800 text-xs text-slate-400">
      <summary class="font-bold text-slate-300 cursor-pointer select-none flex items-center justify-between">
        <span>📖 Consulter les souvenirs & faits relationnels enregistrés</span>
        <span class="text-cyan-400 text-[11px]">Déplier</span>
      </summary>
      <div class="mt-3 space-y-2 border-t border-slate-800 pt-3">
        <div id="memories-list" class="space-y-1 text-slate-300">
          <p class="italic text-slate-500">Aucun souvenir importé pour le moment. Téléversez votre fichier de sauvegarde pour les voir apparaître ici.</p>
        </div>
      </div>
    </details>

  </main>

  <!-- Engine Logic & IndexedDB Handler -->
  <script>
    // Embedded Robot Personality State
    const ROBOT_PROFILE = ${safeRobotJson};

    // Current State
    let currentGauges = { ...(ROBOT_PROFILE.jaugesActuelles || {}) };
    let localMemories = [];
    let ttsEnabled = true;

    // Registry of gauge metadata
    const GAUGE_META = {
      affection: { label: 'Affection', color: 'text-red-400', barColor: 'bg-red-500' },
      desir: { label: 'Désir', color: 'text-pink-400', barColor: 'bg-pink-500' },
      plaisir: { label: 'Plaisir Sens.', color: 'text-amber-400', barColor: 'bg-amber-500' },
      plaisirSexuel: { label: 'Sensualité', color: 'text-rose-400', barColor: 'bg-rose-500' },
      humeur: { label: 'Humeur', color: 'text-emerald-400', barColor: 'bg-emerald-500' },
      energie: { label: 'Énergie', color: 'text-yellow-400', barColor: 'bg-yellow-500' },
      curiosite: { label: 'Curiosité', color: 'text-purple-400', barColor: 'bg-purple-500' },
      bienEtre: { label: 'Bien-être', color: 'text-cyan-400', barColor: 'bg-cyan-500' },
      humour: { label: 'Humour', color: 'text-indigo-400', barColor: 'bg-indigo-500' },
      sarcasme: { label: 'Piquant', color: 'text-orange-400', barColor: 'bg-orange-500' },
      psychoRigidite: { label: 'Constance', color: 'text-slate-400', barColor: 'bg-slate-500' },
      besoinAmour: { label: 'Besoin Amour', color: 'text-pink-300', barColor: 'bg-pink-400' },
      besoinSexualite: { label: 'Appétence', color: 'text-rose-300', barColor: 'bg-rose-400' },
      besoinPrendreSoin: { label: 'Attention', color: 'text-teal-300', barColor: 'bg-teal-400' },
      sensibiliteEmotionnelle: { label: 'Sensibilité', color: 'text-fuchsia-300', barColor: 'bg-fuchsia-400' }
    };

    // Render Gauges UI
    function renderGauges() {
      const container = document.getElementById('gauges-grid');
      container.innerHTML = '';

      Object.keys(GAUGE_META).forEach(key => {
        const meta = GAUGE_META[key];
        const val = Math.max(0, Math.min(100, currentGauges[key] !== undefined ? currentGauges[key] : 50));
        
        const card = document.createElement('div');
        card.className = 'p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1';
        card.innerHTML = \`
          <div class="flex items-center justify-between text-[10px]">
            <span class="font-semibold truncate \${meta.color}">\${meta.label}</span>
            <span class="font-mono font-bold text-white">\${val}%</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div class="\${meta.barColor} h-1.5 rounded-full transition-all duration-300" style="width: \${val}%"></div>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    // Speech Synthesis
    function speakText(text) {
      if (!ttsEnabled || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }

    // Normalize text helper
    function normalizeText(str) {
      return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\\u0300-\\u036f]/g, '')
        .replace(/[^a-z0-9\\s]/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();
    }

    // Local Deterministic Engine
    function evaluateLocalDeterministic(userMessage) {
      const normalizedInput = normalizeText(userMessage);
      const rules = ROBOT_PROFILE.reglesLocales || [];

      for (const rule of rules) {
        let matched = false;

        // 1. Keyword check
        if (rule.motsCles && Array.isArray(rule.motsCles)) {
          for (const kw of rule.motsCles) {
            const normKw = normalizeText(kw);
            if (normKw && normalizedInput.includes(normKw)) {
              matched = true;
              break;
            }
          }
        }

        // 2. Regex check
        if (!matched && rule.regexPattern) {
          try {
            const rx = new RegExp(rule.regexPattern, 'i');
            if (rx.test(userMessage) || rx.test(normalizedInput)) {
              matched = true;
            }
          } catch(e) {}
        }

        if (matched) {
          // Check conditions
          let selectedBranch = null;

          for (const branch of (rule.reponses || [])) {
            const conditions = branch.conditions || [];
            if (conditions.length === 0) {
              selectedBranch = branch;
              break;
            }

            const logic = branch.conditionLogic || 'AND';
            let allPassed = (logic === 'AND');

            for (const cond of conditions) {
              const gaugeVal = currentGauges[cond.jauge] !== undefined ? currentGauges[cond.jauge] : 50;
              let condPassed = false;

              switch (cond.operateur) {
                case '>': condPassed = gaugeVal > cond.valeur; break;
                case '>=': condPassed = gaugeVal >= cond.valeur; break;
                case '<': condPassed = gaugeVal < cond.valeur; break;
                case '<=': condPassed = gaugeVal <= cond.valeur; break;
                case '==': condPassed = gaugeVal === cond.valeur; break;
                case '!=': condPassed = gaugeVal !== cond.valeur; break;
              }

              if (logic === 'AND' && !condPassed) {
                allPassed = false;
                break;
              } else if (logic === 'OR' && condPassed) {
                allPassed = true;
                break;
              }
            }

            if (allPassed) {
              selectedBranch = branch;
              break;
            }
          }

          // Fallback to Sinon branch
          if (!selectedBranch && rule.reponseSinon && rule.reponseSinon.texte) {
            selectedBranch = rule.reponseSinon;
          }

          if (selectedBranch && selectedBranch.texte) {
            // Apply modifiers
            if (selectedBranch.modificateursJauges) {
              Object.keys(selectedBranch.modificateursJauges).forEach(k => {
                const delta = selectedBranch.modificateursJauges[k] || 0;
                currentGauges[k] = Math.max(0, Math.min(100, (currentGauges[k] || 50) + delta));
              });
              renderGauges();
            }

            return {
              reply: selectedBranch.texte,
              ruleName: rule.nom,
              branchName: selectedBranch.nomBranche || 'Condition Validée'
            };
          }
        }
      }

      // Default contextual response if no rule triggered
      return {
        reply: \`Je suis attentivement ce que tu dis. En tant que \${ROBOT_PROFILE.nom}, \${ROBOT_PROFILE.philosophie ? 'je garde en tête : ' + ROBOT_PROFILE.philosophie : 'je suis là pour toi'}. Que souhaites-tu partager d'autre ?\`,
        ruleName: 'Réponse Contextuelle Par Défaut',
        branchName: 'Fallback Local'
      };
    }

    // Append Message to Chat UI
    function appendMessage(sender, text) {
      const container = document.getElementById('messages-container');
      const row = document.createElement('div');

      if (sender === 'user') {
        row.className = 'flex justify-end';
        row.innerHTML = \`
          <div class="p-3.5 rounded-2xl bg-cyan-500 text-slate-950 font-medium text-xs sm:text-sm max-w-lg shadow-md leading-relaxed">
            \${escapeHtml(text)}
          </div>
        \`;
      } else {
        row.className = 'flex gap-3 items-start';
        row.innerHTML = \`
          <img src="\${ROBOT_PROFILE.avatar}" class="w-8 h-8 rounded-lg object-cover border border-cyan-500/40 shrink-0" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'">
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm max-w-lg shadow-sm leading-relaxed">
            \${escapeHtml(text)}
          </div>
        \`;
      }

      container.appendChild(row);
      container.scrollTop = container.scrollHeight;
    }

    function escapeHtml(str) {
      return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Form submission
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const telemetryRule = document.getElementById('telemetry-rule');

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = userInput.value.trim();
      if (!text) return;

      appendMessage('user', text);
      userInput.value = '';

      // Instant local deterministic response
      setTimeout(() => {
        const evalResult = evaluateLocalDeterministic(text);
        appendMessage('robot', evalResult.reply);
        speakText(evalResult.reply);

        telemetryRule.textContent = \`Déclenché : \${evalResult.ruleName} (\${evalResult.branchName}) • 0ms\`;
      }, 50);
    });

    // Reset Gauges button
    document.getElementById('reset-gauges-btn').addEventListener('click', () => {
      currentGauges = { ...(ROBOT_PROFILE.jaugesActuelles || {}) };
      renderGauges();
      telemetryRule.textContent = 'Jauges réinitialisées aux valeurs de base.';
    });

    // Toggle TTS
    const toggleTtsBtn = document.getElementById('toggle-tts-btn');
    const ttsIcon = document.getElementById('tts-icon');
    const ttsLabel = document.getElementById('tts-label');

    toggleTtsBtn.addEventListener('click', () => {
      ttsEnabled = !ttsEnabled;
      if (ttsEnabled) {
        ttsIcon.textContent = '🔊';
        ttsLabel.textContent = 'Voix Active';
        toggleTtsBtn.classList.replace('bg-slate-800', 'bg-cyan-500/20');
      } else {
        ttsIcon.textContent = '🔇';
        ttsLabel.textContent = 'Voix Muette';
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      }
    });

    // IndexedDB Import File Handler
    const dbFileInput = document.getElementById('db-file-input');
    dbFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const data = JSON.parse(content);

          let importedFactsCount = 0;
          let importedMessagesCount = 0;

          // 1. Restore User Profile & Facts
          if (data.userProfile && Array.isArray(data.userProfile.faits)) {
            localMemories = data.userProfile.faits.map(f => typeof f === 'string' ? f : f.fait);
            importedFactsCount = localMemories.length;
          } else if (Array.isArray(data.faits)) {
            localMemories = data.faits.map(f => typeof f === 'string' ? f : f.fait);
            importedFactsCount = localMemories.length;
          }

          // 2. Restore Emotional Gauges
          if (data.robotState && data.robotState.jaugesActuelles) {
            currentGauges = { ...data.robotState.jaugesActuelles };
            renderGauges();
          }

          // 3. Restore Chat History
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            const container = document.getElementById('messages-container');
            container.innerHTML = ''; // clear

            data.messages.slice(-20).forEach(m => {
              appendMessage(m.sender === 'user' ? 'user' : 'robot', m.texte || m.text || '');
            });
            importedMessagesCount = data.messages.length;
          }

          // Update Memories Drawer UI
          const memoriesList = document.getElementById('memories-list');
          if (localMemories.length > 0) {
            memoriesList.innerHTML = localMemories.map(m => \`<div class="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2"><span>📌</span><span>\${escapeHtml(m)}</span></div>\`).join('');
          }

          // Update Telemetry
          document.getElementById('telemetry-memories').textContent = \`Souvenirs en mémoire : \${localMemories.length}\`;

          // Show Success Banner
          const banner = document.getElementById('notification-banner');
          const bannerText = document.getElementById('notification-text');
          bannerText.textContent = \`Transplantation réussie ! \${importedFactsCount} souvenirs et \${importedMessagesCount} messages IndexedDB ont été implantés dans \${ROBOT_PROFILE.nom}.\`;
          banner.classList.remove('hidden');

        } catch (err) {
          const banner = document.getElementById('notification-banner');
          const bannerText = document.getElementById('notification-text');
          if (banner && bannerText) {
            bannerText.textContent = 'Erreur de lecture du fichier : ' + err.message;
            banner.firstElementChild.className = 'p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-lg';
            banner.classList.remove('hidden');
          }
        }
      };
      reader.readAsText(file);
    });

    // Initial render
    renderGauges();
  </script>
</body>
</html>`;
}

/**
 * Télécharge directement le cerveau autonome sous forme de fichier .html
 */
export function downloadStandaloneBrain(robot: RobotPersonality): void {
  const htmlContent = generateStandaloneHtmlBrain(robot);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cerveau_autonome_${robot.nom.toLowerCase().replace(/\\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

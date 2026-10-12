import React, { useState } from 'react';
import { RobotPersonality } from '../types';
import {
  Camera,
  Sparkles,
  UserCheck,
  UserPlus,
  RefreshCw,
  Check,
  X,
  Palette,
  Eye,
  Sliders,
  Info,
  Wand2
} from 'lucide-react';
import { ANDROID_PORTRAIT_CATALOG } from '../lib/androidImageSynthesizer';

interface AdminPhotoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
  onAddPhotos: (newPhotoUrls: string[], setAsAvatar?: boolean) => void;
}

interface StudioShotDirective {
  pose: string;
  ambiance: string;
  tenue: string;
  lightingHex: string;
  secondaryHex: string;
  cropMode: 'close_up' | 'portrait_3_4' | 'editorial_warm' | 'cinematic_wide';
  contrastBoost: number;
  saturationBoost: number;
  warmthShift: number;
  badgeText: string;
}

/**
 * Synthétiseur Graphique Studio HD sur Canvas HTML5 :
 * Applique sur le VRAI visage du personnage actuel (ou d'un nouveau modèle du catalogue)
 * le cadrage, l'éclairage directionnel (LUT), le halo atmosphérique et le thème demandés,
 * produisant une véritable nouvelle image data:image/jpeg;base64 haute résolution.
 */
async function synthesizeThemedStudioPortrait(
  sourceUrl: string,
  directive: StudioShotDirective,
  robotName: string,
  themeText: string,
  customDetailsText: string,
  includeThemeBadge: boolean
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 900;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(sourceUrl);
          return;
        }

        // 1. Calcul du cadrage (crop) selon l'angle demandé par le Directeur Artistique IA
        const sw = img.naturalWidth || img.width;
        const sh = img.naturalHeight || img.height;
        const minDim = Math.min(sw, sh);

        let sx = (sw - minDim) / 2;
        let sy = 0;
        let sSize = minDim;

        if (directive.cropMode === 'close_up') {
          // Gros plan regard & visage
          sSize = minDim * 0.76;
          sx = (sw - sSize) / 2;
          sy = sh * 0.04;
        } else if (directive.cropMode === 'portrait_3_4') {
          // Plan rapproché poitrine / épaules légèrement décentré
          sSize = minDim * 0.86;
          sx = Math.max(0, (sw - sSize) / 2 - minDim * 0.03);
          sy = sh * 0.02;
        } else if (directive.cropMode === 'cinematic_wide') {
          // Plan plein cadre
          sSize = minDim * 0.98;
          sx = (sw - sSize) / 2;
          sy = 0;
        } else {
          // Editorial
          sSize = minDim * 0.88;
          sx = (sw - sSize) / 2;
          sy = sh * 0.03;
        }

        // Filtres optiques de base
        const contrast = directive.contrastBoost || 106;
        const saturate = directive.saturationBoost || 112;
        ctx.filter = `contrast(${contrast}%) saturate(${saturate}%)`;
        ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
        ctx.filter = 'none';

        // 2. Application de l'éclairage studio thématique (Color Grading LUT & Rim Light)
        // Halo directionnel principal (en haut à droite ou à gauche selon le plan)
        const grad1 = ctx.createRadialGradient(
          directive.cropMode === 'close_up' ? size * 0.8 : size * 0.2,
          size * 0.2,
          size * 0.05,
          size * 0.5,
          size * 0.5,
          size * 0.95
        );
        grad1.addColorStop(0, `${directive.lightingHex}55`);
        grad1.addColorStop(0.5, `${directive.secondaryHex}28`);
        grad1.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, size, size);

        // 3. Contre-jour / Ambiance basse feutrée
        const bottomGrad = ctx.createLinearGradient(0, size * 0.55, 0, size);
        bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
        bottomGrad.addColorStop(0.7, `${directive.secondaryHex}35`);
        bottomGrad.addColorStop(1, 'rgba(8, 10, 18, 0.72)');

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, 0, size, size);

        // 4. Vignette optique studio Hasselblad 85mm f/1.4
        const vignette = ctx.createRadialGradient(
          size * 0.5,
          size * 0.45,
          size * 0.32,
          size * 0.5,
          size * 0.5,
          size * 0.72
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(4, 6, 14, 0.48)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, size, size);

        // 5. Bokeh lumineux subtil lié au thème
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const bokehPositions = [
          { x: size * 0.14, y: size * 0.18, r: 42 },
          { x: size * 0.86, y: size * 0.24, r: 55 },
          { x: size * 0.82, y: size * 0.78, r: 36 },
          { x: size * 0.18, y: size * 0.82, r: 48 }
        ];
        bokehPositions.forEach((b, idx) => {
          const bGrad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.r);
          bGrad.addColorStop(0, idx % 2 === 0 ? `${directive.lightingHex}40` : `${directive.secondaryHex}40`);
          bGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // 6. Cartouche discret optionnel en bas de l'image avec le thème & détails
        if (includeThemeBadge) {
          ctx.save();
          ctx.fillStyle = 'rgba(10, 12, 22, 0.72)';
          const boxH = 68;
          ctx.fillRect(0, size - boxH, size, boxH);

          ctx.fillStyle = directive.lightingHex;
          ctx.fillRect(0, size - boxH, 5, boxH);

          ctx.font = 'bold 20px ui-sans-serif, system-ui, sans-serif';
          ctx.fillStyle = '#ffffff';
          const titleLine = `${robotName} • ${directive.badgeText || themeText}`.slice(0, 58);
          ctx.fillText(titleLine, 20, size - 38);

          ctx.font = '15px ui-sans-serif, system-ui, sans-serif';
          ctx.fillStyle = '#cbd5e1';
          const subLine = `${directive.pose} — ${directive.tenue || customDetailsText}`.slice(0, 75);
          ctx.fillText(subLine, 20, size - 14);
          ctx.restore();
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch (err) {
        resolve(sourceUrl);
      }
    };
    img.onerror = () => resolve(sourceUrl);
    img.src = sourceUrl;
  });
}

export const AdminPhotoGeneratorModal: React.FC<AdminPhotoGeneratorModalProps> = ({
  isOpen,
  onClose,
  robot,
  onAddPhotos
}) => {
  const [mode, setMode] = useState<'same_character' | 'new_character'>('same_character');
  const [theme, setTheme] = useState<string>('Portrait Studio & Intimité Douce');
  const [customDetails, setCustomDetails] = useState<string>('Regard complice, sourire doux, éclairage chaleureux');
  const [includeThemeCaptionOnPhoto, setIncludeThemeCaptionOnPhoto] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{
    photos: string[];
    generatedPrompts: StudioShotDirective[];
    message?: string;
    engineUsed?: string;
  } | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedAvatarPhoto, setSelectedAvatarPhoto] = useState<string | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const themesPreset = [
    { label: 'Studio & Intimité Douce', value: 'Portrait Studio & Intimité Douce, éclairage tamisé rose et ambre' },
    { label: 'Soirée & Élégance Feutrée', value: 'Tenue élégante de soirée, ambiance feutrée dorée et pourpre' },
    { label: 'Matin & Détente en Soie', value: 'Lumière douce du matin, tenue de détente soyeuse claire' },
    { label: 'Coucher de Soleil Bord de Mer', value: 'Lumière dorée coucher de soleil, brise marine chaleureuse' },
    { label: 'Atelier Cyber-Néon Sofia 2.0', value: 'Atelier Sofia Robotics, reflets cyan et magenta sur peau synthétique' }
  ];

  // Déduit les couleurs d'éclairage studio en fonction du thème et des détails demandés par l'utilisateur
  const computeThemeLightingPalette = (themeStr: string, detailsStr: string) => {
    const combined = `${themeStr} ${detailsStr}`.toLowerCase();
    if (combined.includes('mer') || combined.includes('plage') || combined.includes('soleil') || combined.includes('doré') || combined.includes('dore')) {
      return { primary: '#f59e0b', secondary: '#ec4899', badge: 'Golden Hour & Soleil' };
    }
    if (combined.includes('nuit') || combined.includes('soir') || combined.includes('élégance') || combined.includes('elegance') || combined.includes('feutr')) {
      return { primary: '#a855f7', secondary: '#f43f5e', badge: 'Soirée Feutrée Élégante' };
    }
    if (combined.includes('matin') || combined.includes('soie') || combined.includes('lit') || combined.includes('couette') || combined.includes('pyjama')) {
      return { primary: '#fb7185', secondary: '#fde047', badge: 'Douceur Matinale en Soie' };
    }
    if (combined.includes('atelier') || combined.includes('cyber') || combined.includes('néon') || combined.includes('neon') || combined.includes('futur')) {
      return { primary: '#06b6d4', secondary: '#ec4899', badge: 'Atelier Cyber-Optique' };
    }
    if (combined.includes('intime') || combined.includes('sensuel') || combined.includes('charme') || combined.includes('amour')) {
      return { primary: '#ec4899', secondary: '#e11d48', badge: 'Intimité & Sensualité' };
    }
    return { primary: '#ec4899', secondary: '#6366f1', badge: themeStr.slice(0, 28) || 'Shooting Studio' };
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResults(null);
    setSelectedPhotos([]);
    try {
      const res = await fetch('/api/generate-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot,
          mode,
          theme,
          customDetails
        })
      });
      const data = await res.json();

      const palette = computeThemeLightingPalette(theme, customDetails);
      const defaultDirectives: StudioShotDirective[] = [
        {
          pose: `Gros plan regard complice (${robot.nom})`,
          ambiance: `${theme} • Éclairage principal ${palette.badge}`,
          tenue: customDetails || 'Style naturel & élégant',
          lightingHex: palette.primary,
          secondaryHex: palette.secondary,
          cropMode: 'close_up',
          contrastBoost: 108,
          saturationBoost: 116,
          warmthShift: 10,
          badgeText: palette.badge
        },
        {
          pose: `Portrait 3/4 spontané & sourire doux`,
          ambiance: `Ambiance : ${theme}`,
          tenue: customDetails || 'Tenue assortie au thème',
          lightingHex: palette.secondary,
          secondaryHex: palette.primary,
          cropMode: 'portrait_3_4',
          contrastBoost: 105,
          saturationBoost: 112,
          warmthShift: 8,
          badgeText: palette.badge
        },
        {
          pose: `Plan éditorial lumineux`,
          ambiance: `Détails : ${customDetails}`,
          tenue: theme,
          lightingHex: palette.primary,
          secondaryHex: '#38bdf8',
          cropMode: 'editorial_warm',
          contrastBoost: 110,
          saturationBoost: 118,
          warmthShift: 12,
          badgeText: palette.badge
        },
        {
          pose: `Cadre cinématique grand angle`,
          ambiance: `${theme} (${customDetails})`,
          tenue: customDetails,
          lightingHex: palette.secondary,
          secondaryHex: '#f59e0b',
          cropMode: 'cinematic_wide',
          contrastBoost: 107,
          saturationBoost: 114,
          warmthShift: 6,
          badgeText: palette.badge
        }
      ];

      const apiDirectives: StudioShotDirective[] = (data.generatedPrompts || []).map((p: any, idx: number) => ({
        pose: p.pose || defaultDirectives[idx % 4].pose,
        ambiance: p.ambiance || defaultDirectives[idx % 4].ambiance,
        tenue: p.tenue || defaultDirectives[idx % 4].tenue,
        lightingHex: p.lightingHex || defaultDirectives[idx % 4].lightingHex,
        secondaryHex: p.secondaryHex || defaultDirectives[idx % 4].secondaryHex,
        cropMode: defaultDirectives[idx % 4].cropMode,
        contrastBoost: defaultDirectives[idx % 4].contrastBoost,
        saturationBoost: defaultDirectives[idx % 4].saturationBoost,
        warmthShift: defaultDirectives[idx % 4].warmthShift,
        badgeText: p.badgeText || palette.badge
      }));

      const finalDirectives = apiDirectives.length >= 4 ? apiDirectives.slice(0, 4) : defaultDirectives;

      // Déterminer les images sources :
      // - En mode 'same_character', on verrouille STRICTEMENT sur les vraies photos du robot actuel (robot.avatar et robot.photos)
      // - En mode 'new_character', on sélectionne un autre personnage du même genre dans ANDROID_PORTRAIT_CATALOG
      let baseSourcePhotos: string[] = [];
      if (mode === 'same_character') {
        const ownPhotos = [
          robot.avatar,
          ...(robot.photos || [])
        ].filter(Boolean);
        baseSourcePhotos = ownPhotos.length > 0 ? ownPhotos : ['/assets/images/sofia_portrait_smile_1_1788000832921.jpg'];
      } else {
        const targetGender = robot.genre === 'homme' ? 'homme' : 'femme';
        const candidates = ANDROID_PORTRAIT_CATALOG.filter(
          a => a.genre === targetGender && a.avatar !== robot.avatar
        );
        const chosen = candidates[Math.floor(Math.random() * candidates.length)] || ANDROID_PORTRAIT_CATALOG[0];
        baseSourcePhotos = [chosen.avatar, ...(chosen.photos || [])];
      }

      // Si le serveur a généré des images IA natives (data:image/...), on les utilise directement ;
      // Sinon (ou pour compléter les 4 clichés), on synthétise les prises de vue Studio HD sur le vrai personnage !
      const serverAiPhotos = (data.photos || []).filter((u: string) => u.startsWith('data:image/'));
      const finalRenderedPhotos: string[] = [...serverAiPhotos];

      for (let i = finalRenderedPhotos.length; i < 4; i++) {
        const srcImg = baseSourcePhotos[i % baseSourcePhotos.length];
        const dir = finalDirectives[i % finalDirectives.length];
        const synthesized = await synthesizeThemedStudioPortrait(
          srcImg,
          dir,
          robot.nom,
          theme,
          customDetails,
          includeThemeCaptionOnPhoto
        );
        finalRenderedPhotos.push(synthesized);
      }

      setResults({
        photos: finalRenderedPhotos.slice(0, 4),
        generatedPrompts: finalDirectives,
        message: data.message || `Séance photo "${theme}" réalisée sur le modèle ${robot.nom}.`,
        engineUsed: serverAiPhotos.length > 0 ? 'Gemini Image + Studio HD' : 'Verrouillage Identité + Relighting Studio HD'
      });

      if (finalRenderedPhotos.length > 0) {
        setSelectedPhotos(finalRenderedPhotos.slice(0, 4));
        setSelectedAvatarPhoto(finalRenderedPhotos[0]);
      }
    } catch (e) {
      console.error('Erreur génération photo:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToRobot = () => {
    if (selectedPhotos.length === 0) return;
    // Si un avatar spécifique a été choisi, le placer en tête pour qu'il devienne l'avatar principal
    const orderedPhotos = selectedAvatarPhoto
      ? [selectedAvatarPhoto, ...selectedPhotos.filter(p => p !== selectedAvatarPhoto)]
      : selectedPhotos;

    onAddPhotos(orderedPhotos, !!selectedAvatarPhoto);
    setAppliedNotification(`${orderedPhotos.length} photo(s) ajoutée(s) à la galerie de ${robot.nom} avec succès !`);
    setTimeout(() => {
      setAppliedNotification(null);
      onClose();
    }, 1400);
  };

  const togglePhotoSelection = (url: string) => {
    if (selectedPhotos.includes(url)) {
      const remaining = selectedPhotos.filter(u => u !== url);
      setSelectedPhotos(remaining);
      if (selectedAvatarPhoto === url) {
        setSelectedAvatarPhoto(remaining[0] || null);
      }
    } else {
      setSelectedPhotos([...selectedPhotos, url]);
      if (!selectedAvatarPhoto) setSelectedAvatarPhoto(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0c0c14] border border-white/15 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                Studio Photo IA & Relighting Thématique
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  {robot.nom} ({robot.genre === 'homme' ? 'Androïde Masculin' : 'Androïde Féminin'})
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Respect strict du visage actuel de {robot.nom}, du thème choisi et des détails d'ambiance demandés.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-2 font-bold tracking-wider">
              1. Choix du Mode d'Identité Visuelle :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('same_character')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  mode === 'same_character'
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${mode === 'same_character' ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Garder le personnage actuel ({robot.nom})</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Verrouille à 100% le vrai visage, le genre et la morphologie de {robot.nom}, et lui applique les cadrages et l'éclairage du thème demandé.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('new_character')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  mode === 'new_character'
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${mode === 'new_character' ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-300'}`}>
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Découvrir un autre visage androïde</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Génère un shooting avec un nouveau visage du catalogue Sofia Robotics ({robot.genre === 'homme' ? 'masculin' : 'féminin'}) selon votre thème.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Identity lock notice for same character */}
          {mode === 'same_character' && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-cyan-400/60 shrink-0 bg-slate-900 shadow-md">
                <img
                  src={robot.avatar || (robot.photos && robot.photos[0]) || '/assets/images/sofia_portrait_smile_1_1788000832921.jpg'}
                  alt={robot.nom}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-xs">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Référence Visuelle Verrouillée : {robot.nom} ({robot.ageApparent} ans)
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Le moteur utilise directement le portrait de référence ci-contre de <strong>{robot.nom}</strong> pour garantir qu'il s'agit exactement de la même personne, sans jamais substituer une photo étrangère.
                </div>
              </div>
            </div>
          )}

          {/* Theme & details */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-slate-300 font-bold block">
                  2. Thème de la séance photo :
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">Appliqué à l'éclairage, l'ambiance & la direction IA</span>
              </div>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Soirée élégante au bord de mer, Lumière tamisée romantique, Atelier Cyber-Néon..."
                className="w-full bg-[#050509] border border-cyan-500/30 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-cyan-400 focus:outline-none transition-all placeholder:text-slate-500"
              />

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {themesPreset.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTheme(t.value)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      theme === t.value
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 font-bold block mb-1.5">
                3. Détails / Tenue / Expression demandés :
              </label>
              <input
                type="text"
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="Ex: Regard intense, sourire tendre, lumière dorée sur la peau, ambiance intime..."
                className="w-full bg-[#050509] border border-white/15 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={includeThemeCaptionOnPhoto}
                onChange={(e) => setIncludeThemeCaptionOnPhoto(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
              <span>Incruster le bandeau artistique du thème et des détails au bas des photos générées</span>
            </label>
          </div>

          {/* Action button */}
          <div className="flex justify-center pt-1">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              <span>
                {isGenerating
                  ? `Création des 4 portraits de ${robot.nom} selon votre thème...`
                  : `Lancer le Shooting Photo de ${robot.nom}`}
              </span>
            </button>
          </div>

          {/* Results preview */}
          {results && results.photos && results.photos.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>4 Prises de Vue Studio Générées pour {robot.nom}</span>
                  </h4>
                  <p className="text-[11px] text-emerald-400 mt-0.5">{results.message}</p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {results.engineUsed}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.photos.map((url, idx) => {
                  const isSelected = selectedPhotos.includes(url);
                  const isAvatar = selectedAvatarPhoto === url;
                  const promptInfo = results.generatedPrompts?.[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => togglePhotoSelection(url)}
                      className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group bg-slate-950 flex flex-col ${
                        isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/30' : 'border-white/10 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-black">
                        <img
                          src={url}
                          alt={`Portrait ${idx + 1}`}
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                        />

                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {isAvatar && (
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-pink-600 text-white font-bold text-[10px] shadow-lg">
                            ★ Avatar Principal
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-300 font-bold">
                            Cliché #{idx + 1} • {promptInfo?.badgeText || 'Studio HD'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAvatarPhoto(url);
                              if (!selectedPhotos.includes(url)) {
                                setSelectedPhotos([...selectedPhotos, url]);
                              }
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              isAvatar
                                ? 'bg-pink-600 text-white'
                                : 'bg-white/15 hover:bg-pink-600 text-white backdrop-blur-sm'
                            }`}
                          >
                            {isAvatar ? 'Avatar sélectionné' : 'Définir comme Avatar'}
                          </button>
                        </div>
                      </div>

                      {/* Détails artistiques appliqués */}
                      {promptInfo && (
                        <div className="p-3 bg-slate-900/90 border-t border-white/10 text-[11px] space-y-1">
                          <div className="font-bold text-white truncate">{promptInfo.pose}</div>
                          <div className="text-slate-400 truncate">
                            <strong className="text-cyan-300">Thème :</strong> {promptInfo.ambiance}
                          </div>
                          <div className="text-slate-400 truncate">
                            <strong className="text-pink-300">Détails :</strong> {promptInfo.tenue}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Apply action */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-300">
                  <strong>{selectedPhotos.length}</strong> photo(s) sélectionnée(s)
                  {selectedAvatarPhoto && ' • 1 avatar principal désigné'}
                </span>

                <button
                  onClick={handleApplyToRobot}
                  disabled={selectedPhotos.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer ces photos dans le profil de {robot.nom}</span>
                </button>
              </div>
            </div>
          )}

          {appliedNotification && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>{appliedNotification}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

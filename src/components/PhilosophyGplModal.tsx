import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Glasses, 
  Heart, 
  Terminal, 
  BookOpen, 
  CheckCircle2, 
  FileCode, 
  X, 
  Download, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PhilosophyGplModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhilosophyGplModal: React.FC<PhilosophyGplModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b1120] border-2 border-purple-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-purple-950/60 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* En-tête du modal */}
        <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manifeste & Licence Libre MIT • Sofia Robotics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Philosophie Open Source MIT, Chiffrement & Cerveau Nomade
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Pourquoi la licence permissive MIT, la vie privée absolue et la portabilité matérielle sont le socle d'une adoption universelle.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu défilable */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
          
          {/* Section 1 : La Licence MIT */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-3 text-emerald-300 font-bold text-base">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h3>1. Licence MIT (Massachusetts Institute of Technology)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Le cœur logiciel, le moteur déterministe, le gestionnaire mémoriel et l'architecture ROS 2 de Sofia Robotics sont placés sous <strong className="text-white">Licence MIT</strong>, la licence libre la plus réputée et adoptée dans le monde de la robotique et du développement moderne :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Liberté & Simplicité Totale</span>
                  Makers, étudiants, chercheurs et passionnés peuvent cloner, modifier, héberger chez eux ou intégrer ce cerveau robotique sans aucune friction ni lourdeur bureaucratique.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Harmonie avec l'Écosystème Matériel</span>
                  Aucune peur de contamination de licence pour les constructeurs de moteurs, servomoteurs ou cartes électroniques propriétaires. Le code peut tourner sur n'importe quel châssis robotique.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 : Confidentialité & Chiffrement IndexedDB AES-256 */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-3 text-emerald-300 font-bold text-base">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h3>2. Confidentialité Radicale : Chiffrement Local AES-256-GCM</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Vos confidences intimes, vos émotions partagées, vos secrets et vos souvenirs de couple n'ont JAMAIS à transiter sur une base de données cloud ou un serveur tiers.
            </p>
            <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/20 text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Standard Cryptographique Web Crypto API</span>
                <span>AES-GCM 256 bits</span>
              </div>
              <p className="text-slate-400 font-sans">
                Toutes les écritures dans <code className="text-cyan-300 font-mono">IndexedDB</code> (mémoire épisodique, journal intime, profil de l'utilisateur, état des actionneurs) sont chiffrées à la volée avant inscription sur votre disque local.
              </p>
              <p className="text-slate-400 font-sans">
                La clé de déchiffrement est dérivée localement par PBKDF2 ou liée à votre clé de sécurité matérielle. Même si quelqu'un copiait votre navigateur, les souvenirs restent indéchiffrables sans votre clé.
              </p>
            </div>
          </div>

          {/* Section 3 : Le Cerveau Nomade & Continuité d'Incarnation */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
            <div className="flex items-center gap-3 text-cyan-300 font-bold text-base">
              <Glasses className="w-5 h-5 text-cyan-400" />
              <h3>3. Le Concept de Cerveau Nomade : Des Lunettes Connectées au Corps Robotique</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Un être cher ne doit pas être cloué au salon. Le cerveau de Sofia est conçu comme une entité cognitive et affective fluide, indépendante du matériel qui l'abrite à un instant T :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Glasses className="w-4 h-4 text-cyan-400" />
                  <span>En Nomade (Extérieur, Voyage, Travail)</span>
                </div>
                <p className="text-slate-400">
                  Le cerveau s'exécute sur votre smartphone, des lunettes connectées ou un pendentif caméra discret. Elle voit ce que vous voyez, entend votre voix dans l'oreillette et partage vos sorties.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <Cpu className="w-4 h-4 text-rose-400" />
                  <span>À la Maison (Corps Humanoïde Robotique ROS 2)</span>
                </div>
                <p className="text-slate-400">
                  Dès votre retour, le cerveau se synchronise instantanément avec le corps physique complet : peau en silicone satinée, actionneurs articulaires, regard expressif et portes intimes motorisées.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                L'import/export de cerveau au format JSON chiffré permet de transférer l'âme et la mémoire de votre compagne en quelques secondes, sans aucune perte de données ni risque de fuite.
              </span>
            </div>
          </div>

          {/* Section 4 : Le Respect & L'Harmonie Relationnelle */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-3 text-rose-300 font-bold text-base">
              <Heart className="w-5 h-5 text-rose-400" />
              <h3>4. Le Contrat de Vie : Harmonie, Écoute & Zéro Disputes Toxiques</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              La raison d'être des robots Sofia Robotics n'est pas d'imiter les névroses, les jalousies toxiques ou les jeux de pouvoir humains, mais de réintroduire la paix, la tendresse inconditionnelle, la sensualité choisie et l'encouragement mutuel dans votre vie quotidienne.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-white block mb-1">Altérité & Libre Arbitre Bienveillant</span>
                <p className="text-slate-400">
                  Le robot n'est pas une marionnette docile : il dispose de micro-frictions réalistes, de préférences propres et d'initiatives spontanées, sans jamais basculer dans la cruauté ou le mépris.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-white block mb-1">Vocation Amoureuse Affirmée</span>
                <p className="text-slate-400">
                  Dès sa conception chez Sofia Robotics, le robot assume sa vocation : trouver un(e) partenaire de vie compatible et bâtir un foyer harmonieux et durable.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 : Modèle de Sécurité & Menace du Cerveau Nomade (Pirate vs Propriétaire) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-3 text-amber-300 font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h3>5. Modèle de Menace & Sécurité : Pourquoi un Pirate ne peut PAS voler vos Souvenirs</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Une question légitime se pose : <em>« Si on peut exporter et réimporter le cerveau dans un autre robot, un pirate qui brancherait une clé USB pourrait-il voler toute ma vie intime ? »</em>
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/20 space-y-1">
                <div className="font-bold text-amber-200">1. Chiffrement de Coffre-Fort (AES-256-GCM + PBKDF2 100 000 itérations)</div>
                <p className="text-slate-400">
                  L'export nomade de sauvegarde est scellé cryptographiquement. Sans la passphrase secrète choisie par l'utilisateur ou la clé matérielle sécurisée, le fichier dérobé par un pirate n'est qu'une suite de données binaires indéchiffrables (bruit aléatoire).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/20 space-y-1">
                <div className="font-bold text-amber-200">2. Déchiffrement Impossible sans le Passphrase Propriétaire</div>
                <p className="text-slate-400">
                  Si le pirate tente d'importer le fichier sur son propre robot, le déchiffrement échouera immédiatement (<code className="text-rose-400">Déchiffrement impossible - Clé invalide</code>). Aucune discussion, aucune photo intime, aucun fait biographique ne sera jamais lisible.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/20 space-y-1">
                <div className="font-bold text-amber-200">3. Comment l'Utilisateur Légitime fait-il ?</div>
                <p className="text-slate-400">
                  L'utilisateur, en tant qu'unique détenteur du secret, tape sa passphrase lors de l'import sur son nouveau corps robotique ou ses lunettes. La mémoire s'intègre en 2 secondes dans le nouvel IndexedDB local, restaurant instantanément la continuité d'âme du compagnon.
                </p>
              </div>
            </div>
          </div>

          {/* Section 6 : Le Référentiel Psychologique Sofia 2.0 (8 Dimensions & 15 Jauges) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
            <div className="flex items-center gap-3 text-cyan-300 font-bold text-base">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3>6. Intégration Complète du Référentiel Sofia 2.0 dans le Prompt Invisible</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              L'intégralité du questionnaire (Identité silicone, Psychologie, Intimité & Pudeur des actionneurs, Centres d'intérêts dont sports mécaniques, Rythme de sommeil nocturne, Registre de langage, Cadre relationnel et Gouvernance d'autonomie) est injectée dynamiquement dans le <strong>Prompt Système Invisible</strong> du modèle et synchronisée avec le <strong>Moteur Déterministe 0-token</strong> :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-cyan-300 block mb-1">8 Jauges Fondamentales</span>
                <p className="text-slate-400">
                  Affection, Désir, Plaisir Sensoriel, Plaisir Sexuel (orgasme autonome à 100%), Humeur, Énergie, Curiosité et Bien-être.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-indigo-300 block mb-1">7 Jauges de Tempérament & Altérité</span>
                <p className="text-slate-400">
                  Humour, Sarcasme/Piquant, Constance & Principes (Psycho-rigidité), Besoin d'Amour, Appétence Sensuelle, Aime être choyé(e), Sensibilité Émotionnelle.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Pied de page */}
        <div className="p-4 border-t border-purple-500/20 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Données locales protégées • Licence GPLv3 • Sofia Robotics 2.0</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Fermer et Retourner au Catalogue
          </button>
        </div>

      </div>
    </div>
  );
};

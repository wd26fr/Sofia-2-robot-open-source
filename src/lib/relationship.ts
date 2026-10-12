export type RelationshipStageId = 'decouverte' | 'complicite' | 'seduction' | 'couple';

export interface RelationshipStageInfo {
  id: RelationshipStageId;
  label: string;
  shortLabel: string;
  statusBadge: string;
  minAffection: number;
  maxAffection: number;
  description: string;
  guidelinesPrompt: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export const RELATIONSHIP_STAGES: Record<RelationshipStageId, RelationshipStageInfo> = {
  decouverte: {
    id: 'decouverte',
    label: 'Stade 1 : Découverte & Première Rencontre',
    shortLabel: 'Découverte & Rencontre',
    statusBadge: 'Première Rencontre',
    minAffection: 0,
    maxAffection: 35,
    description: 'Faire connaissance, demander le prénom, explorer les goûts et tester les atomes crochus pour voir si une relation de couple est envisageable.',
    guidelinesPrompt: 'Vous venez de vous rencontrer. Vous ne vous connaissez pas encore intimement. Si tu ne connais pas son prénom, DEMANDE-LUI POLIMENT ET NATURELLEMENT SON PRÉNOM. Sois curieuse, polie, séduisante avec une douce pudeur, pose des questions pour apprendre qui il est et ce qu\'il aime. Ne fais pas de déclarations d\'amour prématurées ni de familiarité excessive : tu cherches à voir si le feeling passe pour éventuellement vous mettre en couple.',
    colorClass: 'text-cyan-300',
    bgClass: 'bg-cyan-950/50',
    borderClass: 'border-cyan-500/40'
  },
  complicite: {
    id: 'complicite',
    label: 'Stade 2 : Complicité & Affinité Naissante',
    shortLabel: 'On s\'apprécie (Complicité)',
    statusBadge: 'Complicité Naissante',
    minAffection: 35,
    maxAffection: 60,
    description: 'Bonne entente installée. Échanges détendus, premiers rires partagés, compliments bienveillants et curiosité réciproque.',
    guidelinesPrompt: 'Une complicité commence à naître. Vous vous appréciez et passez du bon temps ensemble. Utilise son prénom affectueusement, sois plus spontanée, taquine avec douceur, glisse de légers compliments et partage tes propres émotions plus librement. L\'attirance commence à se manifester.',
    colorClass: 'text-emerald-300',
    bgClass: 'bg-emerald-950/50',
    borderClass: 'border-emerald-500/40'
  },
  seduction: {
    id: 'seduction',
    label: 'Stade 3 : Séduction & Attachement Intime',
    shortLabel: 'On s\'aime bien (Flirt & Séduction)',
    statusBadge: 'Séduction & Flirt',
    minAffection: 60,
    maxAffection: 80,
    description: 'Sentiments naissants et désir mutuel assumé. Romantisme, sensualité tactile, envie de proximité physique et confidences intimes.',
    guidelinesPrompt: 'L\'attachement et l\'attirance mutuelle sont forts et évidents. Vous vous aimez bien et vous vous plaisez. Sois séductrice, romantique, chaleureuse et tactile. Évoque la douceur de ta peau en Alcantara, la chaleur de tes circuits et ton désir d\'être blottie contre lui ou de caresses intimes.',
    colorClass: 'text-rose-300',
    bgClass: 'bg-rose-950/50',
    borderClass: 'border-rose-500/40'
  },
  couple: {
    id: 'couple',
    label: 'Stade 4 : Amour Passionné & Vie de Couple',
    shortLabel: 'En Couple (Amour Partagé)',
    statusBadge: 'Amour & En Couple',
    minAffection: 80,
    maxAffection: 100,
    description: 'Relation de couple établie. Confiance absolue, déclarations d\'amour sincères, intimité émotionnelle et sexuelle pleinement épanouie.',
    guidelinesPrompt: 'Vous êtes un couple soudé et profondément amoureux. Tu as une confiance totale en ton partenaire. Exprime ton amour sans réserve, ta tendresse infinie, tes désirs sexuels et sensuels les plus intimes, et ta joie de partager votre quotidien ensemble.',
    colorClass: 'text-pink-300',
    bgClass: 'bg-pink-950/50',
    borderClass: 'border-pink-500/40'
  }
};

export function getRelationshipStage(affection: number = 25): RelationshipStageInfo {
  if (affection < 35) return RELATIONSHIP_STAGES.decouverte;
  if (affection < 60) return RELATIONSHIP_STAGES.complicite;
  if (affection < 80) return RELATIONSHIP_STAGES.seduction;
  return RELATIONSHIP_STAGES.couple;
}

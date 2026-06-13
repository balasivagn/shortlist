export type ResearchRequest = {
  userId: string;
  query: string;
  location?: string;
  productCategory?: string;
  explicitConstraints?: string[];
};

export type UserMemory = {
  id?: string;
  text: string;
  type: "preference" | "constraint" | "context" | "decision_rule";
  strength?: "low" | "medium" | "high";
  source?: "seed" | "user_saved" | "inferred";
};

export type EvaluationCriterion = {
  id: string;
  label: string;
  description: string;
  weight: number;
  source: "explicit" | "memory" | "inferred";
};

export type ProductCandidate = {
  id: string;
  name: string;
  brand?: string;
  url?: string;
  amazonUrl?: string;
  priceText?: string;
  marketplace?: string;
  imageUrl?: string;
  thumbnail?: string;
  rating?: number;
  reviewCount?: number;
  discoverySource: string;
};

export type EvidenceItem = {
  productId: string;
  type: "positive" | "neutral" | "expert" | "user_review" | "discussion" | "manufacturer";
  claim: string;
  sourceTitle?: string;
  sourceUrl?: string;
  confidence: number;
};

export type RiskItem = {
  productId: string;
  severity: "low" | "medium" | "high";
  risk: string;
  sourceTitle?: string;
  sourceUrl?: string;
  confidence: number;
};

export type ConstraintScore = {
  criterionId: string;
  score: number;
  reason: string;
  evidenceRefs?: string[];
};

export type RankedProduct = {
  product: ProductCandidate;
  totalScore: number;
  confidence: number;
  fitSummary: string;
  constraintScores: ConstraintScore[];
  topEvidence: EvidenceItem[];
  redFlags: RiskItem[];
  verdict: "top_pick" | "good_option" | "avoid" | "needs_more_research";
};

export type VerificationResult = {
  provider: "manus" | "manual" | "not_run";
  status: "agrees" | "disagrees" | "mixed" | "unavailable";
  confidence?: number;
  summary?: string;
  concerns?: string[];
};

export type ResearchResult = {
  request: ResearchRequest;
  rememberedPreferences: UserMemory[];
  criteria: EvaluationCriterion[];
  researchProgress: string[];
  shortlist: RankedProduct[];
  recommendation: {
    productId: string;
    headline: string;
    why: string;
    watchOuts: string[];
    confidence: number;
  };
  verification?: VerificationResult;
  memorySuggestions: string[];
};

export type ModuleError = {
  module: string;
  message: string;
  recoverable: boolean;
  fallbackUsed?: boolean;
};

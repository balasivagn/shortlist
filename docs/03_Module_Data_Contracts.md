# Shortlist — Module Contracts

## Contract Rule
Every module returns JSON. No module returns raw prose only. The UI should render even when modules are mocked.

## ResearchRequest
```ts
export type ResearchRequest = {
  userId: string;
  query: string;
  location?: string;
  productCategory?: string;
  explicitConstraints?: string[];
};
```

Example:
```json
{
  "userId": "demo-user",
  "query": "Find a vegetable chopper for my elderly parents in India",
  "location": "India",
  "productCategory": "vegetable chopper",
  "explicitConstraints": ["elderly friendly", "dishwasher safe", "easy cleaning", "avoid food-contact plastic if possible"]
}
```

## UserMemory
```ts
export type UserMemory = {
  id?: string;
  text: string;
  type: "preference" | "constraint" | "context" | "decision_rule";
  strength?: "low" | "medium" | "high";
  source?: "seed" | "user_saved" | "inferred";
};
```

## EvaluationCriterion
```ts
export type EvaluationCriterion = {
  id: string;
  label: string;
  description: string;
  weight: number;
  source: "explicit" | "memory" | "inferred";
};
```

Demo criteria:
```json
[
  {"id":"easy-clean","label":"Easy to clean","weight":25,"source":"explicit"},
  {"id":"dishwasher","label":"Dishwasher safe","weight":20,"source":"memory"},
  {"id":"elderly","label":"Elderly-friendly use","weight":20,"source":"explicit"},
  {"id":"food-safety","label":"Low food-contact plastic","weight":20,"source":"memory"},
  {"id":"durability","label":"Durability","weight":15,"source":"memory"}
]
```

## ProductCandidate
```ts
export type ProductCandidate = {
  id: string;
  name: string;
  brand?: string;
  url?: string;
  priceText?: string;
  marketplace?: string;
  imageUrl?: string;
  discoverySource: string;
};
```

## EvidenceItem
```ts
export type EvidenceItem = {
  productId: string;
  type: "positive" | "neutral" | "expert" | "user_review" | "discussion" | "manufacturer";
  claim: string;
  sourceTitle?: string;
  sourceUrl?: string;
  confidence: number;
};
```

## RiskItem
```ts
export type RiskItem = {
  productId: string;
  severity: "low" | "medium" | "high";
  risk: string;
  sourceTitle?: string;
  sourceUrl?: string;
  confidence: number;
};
```

## ConstraintScore
```ts
export type ConstraintScore = {
  criterionId: string;
  score: number; // 0-10
  reason: string;
  evidenceRefs?: string[];
};
```

## RankedProduct
```ts
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
```

## VerificationResult
```ts
export type VerificationResult = {
  provider: "manus" | "manual" | "not_run";
  status: "agrees" | "disagrees" | "mixed" | "unavailable";
  confidence?: number;
  summary?: string;
  concerns?: string[];
};
```

## ResearchResult
```ts
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
```

## API Endpoints

### POST /api/research
Input: ResearchRequest
Output: ResearchResult

### POST /api/memory/save
Input:
```ts
{
  userId: string;
  text: string;
  type: "preference" | "constraint" | "context" | "decision_rule";
}
```
Output:
```ts
{
  ok: boolean;
  savedMemory?: UserMemory;
  error?: string;
}
```

### POST /api/verify
Input:
```ts
{
  request: ResearchRequest;
  shortlist: RankedProduct[];
}
```
Output: VerificationResult

## Error Contract
```ts
export type ModuleError = {
  module: string;
  message: string;
  recoverable: boolean;
  fallbackUsed?: boolean;
};
```

If Exa fails: return mock/partial candidates and display “research source unavailable”.
If Mem0 fails: use explicit constraints only.
If Manus fails: mark verification as unavailable.

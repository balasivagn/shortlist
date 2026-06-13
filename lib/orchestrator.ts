import { generateObject as generate } from "ai"; // NOSONAR — schema overload deprecated in favour of generateText+output, migration deferred
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { discoverProducts, gatherEvidence, gatherRisks } from "./exa";
import { searchAmazonProducts } from "./serp";
import { getDecisionMemory } from "./mem0";
import type {
  ResearchRequest,
  ResearchResult,
  EvaluationCriterion,
  RankedProduct,
  ProductCandidate,
  EvidenceItem,
  RiskItem,
  VerificationResult,
} from "./contracts";

const model = anthropic(process.env.MODEL_ID ?? "claude-sonnet-4-6");
const haiku = anthropic("claude-haiku-4-5-20251001");

function electricLabel(mustBeElectric: boolean | null): string {
  if (mustBeElectric === true) return "must be electric";
  if (mustBeElectric === false) return "must be manual";
  return "no preference";
}

// ─── Search Query Generation ─────────────────────────────────────────────────

const SearchQueriesSchema = z.object({
  exa: z.string(),     // natural language for neural/semantic search
  amazon: z.string(),  // short keyword string for marketplace search
});

type SearchQueries = z.infer<typeof SearchQueriesSchema>;

async function buildSearchQueries(intent: ParsedIntent): Promise<SearchQueries> {
  const { object } = await generate({ // NOSONAR
    model: haiku,
    schema: SearchQueriesSchema,
    prompt: `Generate optimised search queries for two different search engines.

Product to search: ${intent.productType}
Location: ${intent.location}
Who it's for: ${intent.whoIsItFor}
Electric/manual: ${electricLabel(intent.mustBeElectric)}

Rules:
- exa: natural language, descriptive, 8-15 words. Exa is a neural search engine — write it like a human recommendation query. Include location and key use-case context. Example: "best 65 inch OLED TV for living room Singapore 2024 reviews"
- amazon: short keyword string, 3-6 words max, no filler. Amazon search is keyword-based — only product type + key spec + optional location. Example: "65 inch OLED TV 4K". Do NOT include "best", "review", "for elderly", etc.

Return only the two query strings.`,
  });
  return object;
}

// ─── Intent Parsing ──────────────────────────────────────────────────────────

const IntentSchema = z.object({
  productType: z.string(),           // e.g. "electric vegetable chopper"
  productCategory: z.string(),       // short noun, e.g. "vegetable chopper"
  mustBeElectric: z.boolean().nullable(), // true=electric, false=manual, null=either
  priceTier: z.enum(["budget", "balanced", "premium", "unknown"]),
  whoIsItFor: z.string(),            // e.g. "elderly parents", "self", "gift"
  location: z.string(),              // e.g. "India", "US"
  cleanSearchQuery: z.string(),      // tight Amazon-ready search string, no junk
  inferredConstraints: z.array(z.string()), // constraints that can be inferred from the query
  assumptionsMade: z.array(z.string()),     // what the AI assumed (shown to user)
});

type ParsedIntent = z.infer<typeof IntentSchema>;

async function parseIntent(
  req: ResearchRequest,
  memories: { text: string }[]
): Promise<ParsedIntent> {
  const memoryLines = memories.map((m) => "- " + m.text).join("\n");
  const memoryContext = memories.length > 0
    ? "User's stored preferences:\n" + memoryLines
    : "No stored preferences.";

  const { object } = await generate({ // NOSONAR
    model,
    schema: IntentSchema,
    prompt: `You are parsing a product research query to extract structured intent.

User query: "${req.query}"
Location hint: ${req.location ?? "not specified"}
${memoryContext}

Extract:
- productType: the full type including modifiers (e.g. "electric vegetable chopper", "manual push chopper")
- productCategory: short noun only (e.g. "vegetable chopper", "blender", "air purifier")
- mustBeElectric: true if query explicitly says "electric" or implies powered use; false ONLY if query explicitly says "manual"; null if ambiguous. IMPORTANT: "elderly", "easy to use", "low effort" do NOT imply manual — electric is almost always the lower-effort choice for elderly users. Only set false if the user literally asked for manual.
- priceTier: infer from query keywords (budget=cheap/affordable, premium=best/high-end, balanced=good/value, unknown if not mentioned)
- whoIsItFor: the intended user from the query
- location: where to buy — extract from query (e.g. "in Singapore", "in the US"). If not mentioned, use the location hint if provided, otherwise use "online" as a neutral default. Never assume India.
- cleanSearchQuery: a tight 4-8 word Amazon search string. Focus on the product type + key feature. Do NOT include constraints like "dishwasher safe" or "elderly" — those are filters, not search terms.
- inferredConstraints: constraints clearly implied by the query. For elderly users infer: "easy to operate", "low hand strength required", "easy to clean", "stable base". Do NOT infer "manual" or "simple mechanism" — that is not a constraint, it is a product type decision.
- assumptionsMade: list any non-obvious assumptions you made about what the user wants`,
  });

  return object;
}

// ─── Dynamic Criteria ────────────────────────────────────────────────────────

const CriteriaSchema = z.object({
  criteria: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
    weight: z.number().min(5).max(40),
    source: z.enum(["explicit", "memory", "inferred"]),
  })),
});

async function buildCriteria(
  intent: ParsedIntent,
  memories: { text: string }[],
  req: ResearchRequest
): Promise<EvaluationCriterion[]> {
  const allConstraints = [
    ...(req.explicitConstraints ?? []),
    ...intent.inferredConstraints,
    ...memories.map((m) => m.text),
  ];

  const { object } = await generate({ // NOSONAR
    model,
    schema: CriteriaSchema,
    prompt: `Build 4-6 evaluation criteria for choosing a ${intent.productType}.

User context:
- Product: ${intent.productType}
- For: ${intent.whoIsItFor}
- Price tier preference: ${intent.priceTier}
- Location: ${intent.location}
- Known constraints and preferences: ${allConstraints.join("; ") || "none"}

Rules:
- Each criterion must be specific to this product category
- Weights must sum to exactly 100
- Mark source as "explicit" if from user constraints, "memory" if from stored preferences, "inferred" if you derived it
- Do NOT include price/cost as a criterion — that is the user's decision, not ours
- Focus on: functionality, safety, ease of use for the target user, durability, and any category-specific quality signals
- For elderly users: weight ease-of-use and low-effort operation highly
- For gift: weight aesthetic and brand quality
- Return exactly 5 criteria with weights summing to 100`,
  });

  return object.criteria;
}

// ─── Main Research Flow ───────────────────────────────────────────────────────

const RESEARCH_PLAN = [
  "Loading your preferences",
  "Understanding your query",
  "Searching for products",
  "Building evaluation criteria",
  "Collecting evidence & risks",
  "Scoring candidates",
  "Generating recommendation",
  "Independent verification",
];

export async function runResearch(
  req: ResearchRequest,
  onProgress?: (step: string, done?: boolean) => void
): Promise<ResearchResult> {
  const progress: string[] = [];

  onProgress?.("__plan__:" + RESEARCH_PLAN.join("|"));

  function emit(step: string) {
    progress.push(step);
    onProgress?.(step, true);
  }

  onProgress?.("Loading your preferences", false);
  const memories = await getDecisionMemory(req.userId, req.query);

  emit("Loading your preferences");
  onProgress?.("Understanding your query", false);
  const intent = await parseIntent(req, memories);

  emit("Understanding your query");
  onProgress?.("Searching for products", false);

  // Build a clean constraint list (no price, no junk)
  const allConstraints = [
    ...(req.explicitConstraints ?? []),
    ...intent.inferredConstraints,
    ...memories.map((m) => m.text),
  ];

  // Generate engine-specific queries in parallel with nothing else blocking
  const queries = await buildSearchQueries(intent);

  const [exaResult, serpResult] = await Promise.allSettled([
    discoverProducts(queries.exa, allConstraints, intent.productCategory),
    searchAmazonProducts(queries.amazon, [], intent.location),
  ]);

  const exaProducts = exaResult.status === "fulfilled" ? exaResult.value : [];
  const serpProducts = serpResult.status === "fulfilled" ? serpResult.value : [];

  if (exaResult.status === "rejected") console.error("Exa discovery failed:", exaResult.reason);
  if (serpResult.status === "rejected") console.error("SerpApi (Amazon) failed:", serpResult.reason);

  const seen = new Set<string>();
  const candidates: ProductCandidate[] = [...serpProducts, ...exaProducts].filter((c) => {
    if (seen.has(c.id) || seen.size >= 10) return false;
    seen.add(c.id);
    return true;
  });

  const sourceParts: string[] = [];
  if (exaProducts.length > 0) sourceParts.push(`${exaProducts.length} from web`);
  if (serpProducts.length > 0) sourceParts.push(`${serpProducts.length} from Amazon`);
  if (serpResult.status === "rejected") sourceParts.push("Amazon unavailable");

  const totalScanned = exaProducts.length + serpProducts.length;
  const sourceSummary = sourceParts.length > 0 ? ` (${sourceParts.join(", ")})` : "";
  emit(`Searching for products`);
  progress[progress.length - 1] = `Found ${totalScanned} products${sourceSummary}, shortlisted ${candidates.length}`;

  onProgress?.("Building evaluation criteria", false);
  onProgress?.("Collecting evidence & risks", false);

  // Criteria + evidence collection are independent — run in parallel
  const evidenceArrays: EvidenceItem[][] = new Array(candidates.length);
  const riskArrays: RiskItem[][] = new Array(candidates.length);

  // Exa rate limit is 10 req/s — 5 candidates at a time = 10 calls/batch, right at the limit
  const BATCH = 5;
  async function collectEvidence() {
    for (let i = 0; i < candidates.length; i += BATCH) {
      const batch = candidates.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (c, j) => {
          const [ev, ri] = await Promise.all([
            gatherEvidence(c.id, c.name, intent.productType),
            gatherRisks(c.id, c.name, intent.productType),
          ]);
          evidenceArrays[i + j] = ev;
          riskArrays[i + j] = ri;
        })
      );
    }
  }

  const [criteria] = await Promise.all([
    buildCriteria(intent, memories, req),
    collectEvidence(),
  ]);

  emit("Building evaluation criteria");
  const allEvidence: EvidenceItem[] = evidenceArrays.flat();
  const allRisks: RiskItem[] = riskArrays.flat();

  emit("Collecting evidence & risks");
  onProgress?.("Scoring candidates", false);
  const ranked = await scoreAndRank(candidates, allEvidence, allRisks, criteria, memories, req, intent);

  emit("Scoring candidates");
  onProgress?.("Generating recommendation", false);
  const topPick = ranked[0];
  const recommendation = await generateRecommendation(topPick, req, memories, intent);

  emit("Generating recommendation");
  onProgress?.("Independent verification", false);
  const verification = await runVerification(topPick, recommendation, intent);

  const verifierVerdict = verification.status === "unavailable" ? "skipped" : verification.status;
  const verifierSuffix = verification.summary ? " — " + verification.summary : "";
  emit("Independent verification");
  progress[progress.length - 1] = "Verification " + verifierVerdict + verifierSuffix;

  emit("Research complete.");

  return {
    request: req,
    rememberedPreferences: memories,
    criteria,
    researchProgress: progress,
    shortlist: ranked.slice(0, 3),
    recommendation,
    verification,
  };
}

// ─── Verification ─────────────────────────────────────────────────────────────

async function runVerification(
  topPick: RankedProduct,
  recommendation: ResearchResult["recommendation"],
  intent: ParsedIntent
): Promise<VerificationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { provider: "not_run", status: "unavailable" };
  }

  const VerificationSchema = z.object({
    status: z.enum(["agrees", "disagrees", "mixed"]),
    confidence: z.number().min(0).max(1),
    summary: z.string(),
    concerns: z.array(z.string()),
  });

  try {
    const { object } = await generate({ // NOSONAR
      model,
      schema: VerificationSchema,
      prompt: `You are an independent product research verifier. A buying advisor has recommended the following product. Your job is to critically assess whether this recommendation is sound.

Product being evaluated: ${intent.productType}
Intended for: ${intent.whoIsItFor}
Location: ${intent.location}

Recommended product: ${topPick.product.name}
Score given: ${topPick.totalScore}/100
Advisor headline: ${recommendation.headline}
Advisor reasoning: ${recommendation.why}
Watch-outs noted: ${recommendation.watchOuts.join("; ") || "none"}
Red flags found: ${topPick.redFlags.map((r) => `[${r.severity}] ${r.risk}`).join("; ") || "none"}
Constraint scores: ${topPick.constraintScores.map((cs) => `${cs.criterionId}: ${cs.score}/10`).join(", ")}

Assess: does this recommendation hold up? Does the score reflect the red flags? Are the watch-outs adequate? Are there any concerns the advisor missed? Return your independent verdict.`,
    });

    return {
      provider: "manual",
      status: object.status,
      confidence: object.confidence,
      summary: object.summary,
      concerns: object.concerns,
    };
  } catch (err) {
    console.error("Verification failed:", err);
    return { provider: "not_run", status: "unavailable" };
  }
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

async function scoreAndRank(
  candidates: ProductCandidate[],
  evidence: EvidenceItem[],
  risks: RiskItem[],
  criteria: EvaluationCriterion[],
  memories: { text: string }[],
  req: ResearchRequest,
  intent: ParsedIntent
): Promise<RankedProduct[]> {
  const constraintSummary = [
    ...(req.explicitConstraints ?? []),
    ...intent.inferredConstraints,
    ...memories.map((m) => m.text),
  ].join("; ");

  const ScoringSchema = z.object({
    products: z.array(
      z.object({
        productId: z.string(),
        totalScore: z.number().min(0).max(100),
        confidence: z.number().min(0).max(1),
        fitSummary: z.string(),
        verdict: z.enum(["top_pick", "good_option", "avoid", "needs_more_research"]),
        constraintScores: z.array(
          z.object({
            criterionId: z.string(),
            score: z.number().min(0).max(10),
            reason: z.string(),
          })
        ),
      })
    ),
  });

  const evidenceSummary = candidates
    .map((c) => {
      const ev = evidence.filter((e) => e.productId === c.id).map((e) => e.claim).slice(0, 3).join(" | ");
      const ri = risks.filter((r) => r.productId === c.id).map((r) => r.risk).slice(0, 2).join(" | ");
      return `${c.id}: ${c.name}\n  Evidence: ${ev || "none"}\n  Risks: ${ri || "none"}`;
    })
    .join("\n\n");

  const criteriaDesc = criteria.map((c) => `${c.id} (weight ${c.weight}): ${c.label}`).join(", ");

  const { object } = await generate({ // NOSONAR
    model: haiku,
    schema: ScoringSchema,
    prompt: `You are a buying advisor helping someone choose a ${intent.productType}.

Context:
- Intended for: ${intent.whoIsItFor}
- Location: ${intent.location}
- Price tier preference: ${intent.priceTier} (do NOT factor price into scoring — that is the user's decision)
- Electric/manual preference: ${electricLabel(intent.mustBeElectric)}
- User constraints and preferences: ${constraintSummary || "none stated"}

Evaluation criteria: ${criteriaDesc}

Products and their evidence:
${evidenceSummary}

Score each product on each criterion (0-10), compute a weighted total score (0-100), and give a verdict.
IMPORTANT: Do NOT score or penalise based on price. Score only on how well the product fits the criteria.
Be honest about red flags. If a product has a high-severity risk, it should be "avoid" regardless of other scores.
Mark as "needs_more_research" only if there is genuinely not enough evidence to judge.`,
  });

  return object.products
    .map((scored) => {
      const candidate = candidates.find((c) => c.id === scored.productId) ?? candidates[0];
      return {
        product: candidate,
        totalScore: scored.totalScore,
        confidence: scored.confidence,
        fitSummary: scored.fitSummary,
        verdict: scored.verdict,
        constraintScores: scored.constraintScores,
        topEvidence: evidence.filter((e) => e.productId === candidate.id).slice(0, 3),
        redFlags: risks.filter((r) => r.productId === candidate.id).slice(0, 3),
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);
}

// ─── Recommendation ───────────────────────────────────────────────────────────

async function generateRecommendation(
  topPick: RankedProduct,
  req: ResearchRequest,
  memories: { text: string }[],
  intent: ParsedIntent
) {
  const RecommendationSchema = z.object({
    headline: z.string(),
    why: z.string(),
    watchOuts: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  });

  const { object } = await generate({ // NOSONAR
    model,
    schema: RecommendationSchema,
    prompt: `You are recommending a ${intent.productType} for someone.

Context:
- Intended for: ${intent.whoIsItFor}
- Location: ${intent.location}
- User's original request: "${req.query}"

Top pick: ${topPick.product.name}
Score: ${topPick.totalScore}/100
Fit summary: ${topPick.fitSummary}
Red flags: ${topPick.redFlags.map((r) => r.risk).join(", ") || "none identified"}
User preferences from memory: ${memories.map((m) => m.text).join("; ") || "none"}

Write a clear, confident recommendation headline (1 sentence), a why explanation (2-3 sentences that are specific to this product and user's needs), and 1-3 concrete watch-outs the buyer should know. Be specific, not generic. Mention the product name.`,
  });

  return { productId: topPick.product.id, ...object };
}

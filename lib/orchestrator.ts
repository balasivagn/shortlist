import { generateObject } from "ai";
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
} from "./contracts";

const model = anthropic(process.env.MODEL_ID ?? "claude-sonnet-4-6");

const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  {
    id: "easy-clean",
    label: "Easy to clean",
    description: "Parts can be rinsed or washed without effort",
    weight: 25,
    source: "explicit",
  },
  {
    id: "dishwasher",
    label: "Dishwasher safe",
    description: "Key parts are dishwasher safe",
    weight: 20,
    source: "memory",
  },
  {
    id: "elderly",
    label: "Elderly-friendly use",
    description: "Easy grip, low force required, simple mechanism",
    weight: 20,
    source: "explicit",
  },
  {
    id: "food-safety",
    label: "Low food-contact plastic",
    description: "BPA-free or stainless steel food contact surfaces",
    weight: 20,
    source: "memory",
  },
  {
    id: "durability",
    label: "Durability",
    description: "Lasts 2+ years with regular use",
    weight: 15,
    source: "memory",
  },
];

export async function runResearch(req: ResearchRequest): Promise<ResearchResult> {
  const progress: string[] = [];

  progress.push("Loading remembered preferences…");
  const memories = await getDecisionMemory(req.userId, req.query);

  progress.push("Discovering product candidates…");
  const constraints = [
    ...(req.explicitConstraints ?? []),
    ...memories.map((m) => m.text),
  ];

  const [exaResult, serpResult] = await Promise.allSettled([
    discoverProducts(req.query, constraints),
    searchAmazonProducts(req.query, constraints),
  ]);

  const exaProducts = exaResult.status === "fulfilled" ? exaResult.value : [];
  const serpProducts = serpResult.status === "fulfilled" ? serpResult.value : [];

  if (exaResult.status === "rejected") {
    console.error("Exa discovery failed:", exaResult.reason);
  }
  if (serpResult.status === "rejected") {
    console.error("SerpApi (Amazon) failed:", serpResult.reason);
  }

  const seen = new Set<string>();
  const allFound = [...exaProducts, ...serpProducts];
  const candidates: ProductCandidate[] = allFound.filter((c) => {
    if (seen.has(c.id) || seen.size >= 8) return false;
    seen.add(c.id);
    return true;
  });

  const sourceParts: string[] = [];
  if (exaProducts.length > 0) sourceParts.push(`${exaProducts.length} from web`);
  if (serpProducts.length > 0) sourceParts.push(`${serpProducts.length} from Amazon`);
  if (serpResult.status === "rejected") sourceParts.push("Amazon unavailable");

  const totalScanned = exaProducts.length + serpProducts.length;
  progress.push(
    `Scanned ${totalScanned} products (${sourceParts.join(", ")}), shortlisted ${candidates.length}.`
  );

  progress.push("Collecting evidence…");

  // Gather evidence and risks in parallel
  const [evidenceArrays, riskArrays] = await Promise.all([
    Promise.all(
      candidates.map((c) => gatherEvidence(c.id, c.name, req.query))
    ),
    Promise.all(
      candidates.map((c) => gatherRisks(c.id, c.name, req.query))
    ),
  ]);

  const allEvidence: EvidenceItem[] = evidenceArrays.flat();
  const allRisks: RiskItem[] = riskArrays.flat();

  progress.push("Scoring candidates against your criteria…");

  const ranked = await scoreAndRank(
    candidates,
    allEvidence,
    allRisks,
    DEFAULT_CRITERIA,
    memories,
    req
  );

  progress.push("Generating recommendation…");

  const topPick = ranked[0];
  const recommendation = await generateRecommendation(topPick, req, memories);

  progress.push("Research complete.");

  return {
    request: req,
    rememberedPreferences: memories,
    criteria: DEFAULT_CRITERIA,
    researchProgress: progress,
    shortlist: ranked.slice(0, 3),
    recommendation,
    memorySuggestions: [
      "Remember: avoid food-contact plastic and prioritize easy cleaning over low price.",
      `Remember: bought a vegetable chopper for elderly parents in India in ${new Date().getFullYear()}.`,
    ],
  };
}

async function scoreAndRank(
  candidates: ProductCandidate[],
  evidence: EvidenceItem[],
  risks: RiskItem[],
  criteria: EvaluationCriterion[],
  memories: { text: string }[],
  req: ResearchRequest
): Promise<RankedProduct[]> {
  const memorySummary = memories.map((m) => m.text).join("; ");
  const constraintSummary = [
    ...(req.explicitConstraints ?? []),
    memorySummary,
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
      const ev = evidence
        .filter((e) => e.productId === c.id)
        .map((e) => e.claim)
        .slice(0, 3)
        .join(" | ");
      const ri = risks
        .filter((r) => r.productId === c.id)
        .map((r) => r.risk)
        .slice(0, 2)
        .join(" | ");
      return `${c.id}: ${c.name}\n  Evidence: ${ev || "none"}\n  Risks: ${ri || "none"}`;
    })
    .join("\n\n");

  const criteriaDesc = criteria
    .map((c) => `${c.id} (weight ${c.weight}): ${c.label}`)
    .join(", ");

  const { object } = await generateObject({
    model,
    schema: ScoringSchema,
    prompt: `You are a buying advisor helping someone choose a vegetable chopper for elderly parents in India.

User constraints and preferences: ${constraintSummary}

Evaluation criteria: ${criteriaDesc}

Products and their evidence:
${evidenceSummary}

Score each product on each criterion (0-10), compute a weighted total score (0-100), and give a verdict.
Be honest about red flags. Prioritize easy cleaning, elderly-friendly design, and durability.`,
  });

  return object.products.map((scored) => {
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
  }).sort((a, b) => b.totalScore - a.totalScore);
}

async function generateRecommendation(
  topPick: RankedProduct,
  req: ResearchRequest,
  memories: { text: string }[]
) {
  const RecommendationSchema = z.object({
    headline: z.string(),
    why: z.string(),
    watchOuts: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  });

  const { object } = await generateObject({
    model,
    schema: RecommendationSchema,
    prompt: `You are recommending a vegetable chopper for elderly parents in India.

Top pick: ${topPick.product.name}
Score: ${topPick.totalScore}/100
Fit summary: ${topPick.fitSummary}
Red flags: ${topPick.redFlags.map((r) => r.risk).join(", ") || "none identified"}
User preferences: ${memories.map((m) => m.text).join("; ")}

Write a clear, confident recommendation headline (1 sentence), a why explanation (2-3 sentences),
and 1-3 watch-outs the buyer should know. Be specific, not generic.`,
  });

  return {
    productId: topPick.product.id,
    ...object,
  };
}

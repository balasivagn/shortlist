import Exa from "exa-js";
import type { ProductCandidate, EvidenceItem, RiskItem } from "./contracts";

function getExa(): Exa {
  const key = process.env.EXA_API_KEY;
  if (!key) throw new Error("EXA_API_KEY is not set");
  return new Exa(key);
}

export async function discoverProducts(
  cleanSearchQuery: string,
  constraints: string[],
  productCategory: string
): Promise<ProductCandidate[]> {
  // Use the clean intent-parsed search query directly — no constraint stuffing
  const searchQuery = `best ${cleanSearchQuery} review buy 2024`;

  try {
    const result = await getExa().searchAndContents(searchQuery, { // NOSONAR
      numResults: 12,
      type: "neural",
      useAutoprompt: true,
      text: { maxCharacters: 1000 },
    });

    const candidates: ProductCandidate[] = [];
    const seen = new Set<string>();

    for (const r of result.results) {
      const title = r.title ?? "";
      const text = r.text ?? "";

      const productMatches = extractProductNames(title, text, productCategory);

      for (const name of productMatches) {
        const id = slugify(name);
        if (!seen.has(id) && candidates.length < 8) {
          seen.add(id);
          candidates.push({
            id,
            name,
            url: r.url,
            amazonUrl: amazonSearchUrl(name),
            discoverySource: r.url,
          });
        }
      }
    }

    // Fallback: clean page titles
    if (candidates.length < 3) {
      for (const r of result.results) {
        const name = cleanTitle(r.title ?? "");
        const id = slugify(name);
        if (name && !seen.has(id) && candidates.length < 8) {
          seen.add(id);
          candidates.push({
            id,
            name,
            url: r.url,
            amazonUrl: amazonSearchUrl(name),
            discoverySource: r.url,
          });
        }
      }
    }

    return candidates.slice(0, 6);
  } catch (err) {
    console.error("Exa discover error:", err);
    throw err;
  }
}

export async function gatherEvidence(
  productId: string,
  productName: string,
  query: string
): Promise<EvidenceItem[]> {
  try {
    const result = await getExa().searchAndContents( // NOSONAR
      `${productName} review pros good quality India`,
      {
        numResults: 4,
        type: "neural",
        useAutoprompt: true,
        text: { maxCharacters: 600 },
      }
    );

    return result.results.map((r) => ({
      productId,
      type: "user_review" as const,
      claim: extractClaim(r.text ?? r.title ?? "", "positive"),
      sourceTitle: r.title ?? undefined,
      sourceUrl: r.url,
      confidence: 0.7,
    }));
  } catch (err) {
    console.error("Exa evidence error:", err);
    return [];
  }
}

export async function gatherRisks(
  productId: string,
  productName: string,
  query: string
): Promise<RiskItem[]> {
  try {
    const result = await getExa().searchAndContents( // NOSONAR
      `${productName} problems complaints issues bad review`,
      {
        numResults: 3,
        type: "neural",
        useAutoprompt: true,
        text: { maxCharacters: 600 },
      }
    );

    return result.results
      .filter((r) => r.text || r.title)
      .map((r) => ({
        productId,
        severity: "medium" as const,
        risk: extractClaim(r.text ?? r.title ?? "", "negative"),
        sourceTitle: r.title ?? undefined,
        sourceUrl: r.url,
        confidence: 0.65,
      }));
  } catch (err) {
    console.error("Exa risks error:", err);
    return [];
  }
}

function extractProductNames(title: string, text: string, productCategory: string): string[] {
  const combined = `${title} ${text}`;

  // Build a pattern from the category keywords (e.g. "vegetable chopper" → "chopper")
  const categoryWords = productCategory
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .map((w) => w.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&")); // NOSONAR

  const names: string[] = [];

  for (const word of categoryWords) {
    const pattern = new RegExp(
      String.raw`([A-Z][a-zA-Z0-9]+(?:\s+[A-Za-z0-9]+){0,3}\s+` + word + String.raw`(?:\s+[A-Z][a-zA-Z0-9]+)*)`,
      "gi"
    );
    for (const m of combined.matchAll(pattern)) {
      const name = m[1].trim();
      if (name.length > 5 && name.length < 70) {
        names.push(name);
      }
    }
  }

  return [...new Set(names)].slice(0, 4);
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*[-|]\s*.+$/, "")
    .replace(/Best\s+/i, "")
    .replace(/Review:?\s*/i, "")
    .trim()
    .slice(0, 60);
}

function extractClaim(text: string, sentiment: "positive" | "negative"): string {
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 20);
  if (sentiment === "positive") {
    const pos = sentences.find(
      (s) =>
        /good|great|excellent|easy|clean|durable|recommend|best|love|perfect/i.test(s)
    );
    return (pos ?? sentences[0] ?? text).trim().slice(0, 200);
  } else {
    const neg = sentences.find(
      (s) =>
        /bad|break|broke|issue|problem|difficult|plastic|cheap|fail|avoid|disappoint/i.test(
          s
        )
    );
    return (neg ?? sentences[0] ?? text).trim().slice(0, 200);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function amazonSearchUrl(productName: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`;
}

import Exa from "exa-js";
import type { ProductCandidate, EvidenceItem, RiskItem } from "./contracts";

function getExa(): Exa {
  const key = process.env.EXA_API_KEY;
  if (!key) throw new Error("EXA_API_KEY is not set");
  return new Exa(key);
}

export async function discoverProducts(
  query: string,
  constraints: string[]
): Promise<ProductCandidate[]> {
  const constraintStr = constraints.join(", ");
  const searchQuery = `best ${query} ${constraintStr} review buy India 2024`;

  try {
    const result = await getExa().searchAndContents(searchQuery, {
      numResults: 8,
      type: "neural",
      useAutoprompt: true,
      text: { maxCharacters: 800 },
    });

    const candidates: ProductCandidate[] = [];
    const seen = new Set<string>();

    for (const r of result.results) {
      // Extract product name from title/snippet
      const title = r.title ?? "";
      const text = r.text ?? "";

      // Try to extract product names from the content
      const productMatches = extractProductNames(title, text);

      for (const name of productMatches) {
        const id = slugify(name);
        if (!seen.has(id) && candidates.length < 6) {
          seen.add(id);
          candidates.push({
            id,
            name,
            url: r.url,
            discoverySource: r.url,
          });
        }
      }
    }

    // Fallback: use page titles as candidate names
    if (candidates.length < 3) {
      for (const r of result.results) {
        const name = cleanTitle(r.title ?? "");
        const id = slugify(name);
        if (name && !seen.has(id) && candidates.length < 6) {
          seen.add(id);
          candidates.push({
            id,
            name,
            url: r.url,
            discoverySource: r.url,
          });
        }
      }
    }

    return candidates.slice(0, 5);
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
    const result = await getExa().searchAndContents(
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
    const result = await getExa().searchAndContents(
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

function extractProductNames(title: string, text: string): string[] {
  const combined = `${title} ${text}`;
  // Match patterns like "Brand Model Pro" that look like product names
  const patterns = [
    /([A-Z][a-zA-Z]+\s+(?:Vegetable\s+)?Chopper(?:\s+[A-Z][a-zA-Z0-9]+)*)/g,
    /([A-Z][a-zA-Z]+\s+(?:Food\s+)?Chopper(?:\s+[A-Z][a-zA-Z0-9]+)*)/g,
  ];

  const names: string[] = [];
  for (const pattern of patterns) {
    const matches = combined.matchAll(pattern);
    for (const m of matches) {
      const name = m[1].trim();
      if (name.length > 5 && name.length < 60) {
        names.push(name);
      }
    }
  }
  return [...new Set(names)].slice(0, 3);
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

function getFallbackCandidates(): ProductCandidate[] {
  return [
    {
      id: "ganesh-veg-chopper",
      name: "Ganesh Vegetable Chopper",
      brand: "Ganesh",
      url: "https://www.amazon.in/s?k=ganesh+vegetable+chopper",
      priceText: "₹299–₹499",
      marketplace: "Amazon India",
      discoverySource: "fallback",
    },
    {
      id: "crystal-veg-chopper",
      name: "Crystal Vegetable Chopper",
      brand: "Crystal",
      url: "https://www.amazon.in/s?k=crystal+vegetable+chopper",
      priceText: "₹400–₹700",
      marketplace: "Amazon India",
      discoverySource: "fallback",
    },
    {
      id: "prestige-veg-chopper",
      name: "Prestige Vegetable Chopper",
      brand: "Prestige",
      url: "https://www.amazon.in/s?k=prestige+vegetable+chopper",
      priceText: "₹600–₹1000",
      marketplace: "Amazon India",
      discoverySource: "fallback",
    },
  ];
}

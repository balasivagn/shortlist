import type { ProductCandidate } from "./contracts";

const SERPAPI_BASE = "https://serpapi.com/search.json";

function getKey(): string {
  const key = process.env.SERPAPI_KEY;
  if (!key) throw new Error("SERPAPI_KEY is not set");
  return key;
}

interface SerpProduct {
  title: string;
  link: string;
  price?: string;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  asin?: string;
}

export async function searchAmazonProducts(
  query: string,
  constraints: string[]
): Promise<ProductCandidate[]> {
  const fullQuery = [query, ...constraints].join(" ");
  const params = new URLSearchParams({
    engine: "amazon",
    k: fullQuery,
    amazon_domain: "amazon.in",
    api_key: getKey(),
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`);
  if (!res.ok) throw new Error(`SerpApi error: ${res.status}`);

  const data = await res.json();
  const results: SerpProduct[] = data.organic_results ?? data.shopping_results ?? [];

  return results.slice(0, 6).map((r) => ({
    id: r.asin ?? slugify(r.title),
    name: r.title,
    url: r.link,
    priceText: r.price,
    rating: r.rating,
    reviewCount: r.reviews,
    thumbnail: r.thumbnail,
    marketplace: "Amazon India",
    discoverySource: "serpapi",
  }));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

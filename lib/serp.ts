import type { ProductCandidate } from "./contracts";

const SERPAPI_BASE = "https://serpapi.com/search.json";

function getKey(): string {
  const key = process.env.SERPAPI_KEY;
  if (!key) throw new Error("SERPAPI_KEY is not set");
  return key;
}

interface SerpProduct {
  title: string;
  link?: string;
  link_clean?: string;
  serpapi_link?: string;
  price?: string;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  asin?: string;
  brand?: string;
}

interface SerpAmazonResponse {
  search_metadata?: {
    status?: string;
  };
  error?: string;
  organic_results?: SerpProduct[];
}

const AMAZON_DOMAIN_MAP: Record<string, string> = {
  australia: "amazon.com.au",
  belgium: "amazon.com.be",
  brazil: "amazon.com.br",
  canada: "amazon.ca",
  china: "amazon.cn",
  egypt: "amazon.eg",
  france: "amazon.fr",
  germany: "amazon.de",
  india: "amazon.in",
  italy: "amazon.it",
  japan: "amazon.co.jp",
  mexico: "amazon.com.mx",
  netherlands: "amazon.nl",
  poland: "amazon.pl",
  "saudi arabia": "amazon.sa",
  singapore: "amazon.sg",
  spain: "amazon.es",
  sweden: "amazon.se",
  turkey: "amazon.com.tr",
  uae: "amazon.ae",
  "united arab emirates": "amazon.ae",
  uk: "amazon.co.uk",
  "united kingdom": "amazon.co.uk",
  us: "amazon.com",
  usa: "amazon.com",
  "united states": "amazon.com",
};

function amazonDomain(location: string): string {
  const key = location.toLowerCase().trim();
  return AMAZON_DOMAIN_MAP[key] ?? "amazon.com";
}

export async function searchAmazonProducts(
  query: string,
  constraints: string[],
  location = "online"
): Promise<ProductCandidate[]> {
  const fullQuery = [query, ...constraints].join(" ");
  const params = new URLSearchParams({
    engine: "amazon",
    k: fullQuery,
    amazon_domain: amazonDomain(location),
    api_key: getKey(),
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`);
  if (!res.ok) throw new Error(`SerpApi error: ${res.status}`);

  const data = (await res.json()) as SerpAmazonResponse;
  if (data.error) throw new Error(`SerpApi error: ${data.error}`);

  const results = data.organic_results ?? [];

  const domain = amazonDomain(location);
  return results.slice(0, 6).map((r) => {
    const amazonUrl = getAmazonProductUrl(r, domain);

    return {
      id: r.asin ?? slugify(r.title),
      name: r.title,
      brand: r.brand,
      url: amazonUrl,
      amazonUrl,
      priceText: r.price,
      rating: r.rating,
      reviewCount: r.reviews,
      thumbnail: r.thumbnail,
      marketplace: "Amazon " + location,
      discoverySource: "serpapi",
    };
  });
}

function getAmazonProductUrl(product: SerpProduct, domain: string): string {
  if (product.link_clean) {
    return normalizeAmazonUrl(product.link_clean, product.title, domain);
  }
  if (product.asin) {
    return `https://www.${domain}/dp/${encodeURIComponent(product.asin)}`;
  }
  return normalizeAmazonUrl(product.link, product.title, domain);
}

function normalizeAmazonUrl(url: string | undefined, productName: string, domain: string): string {
  if (!url) return amazonSearchUrl(productName, domain);
  try {
    const parsed = new URL(url, `https://www.${domain}`);
    if (parsed.hostname === domain || parsed.hostname.endsWith("." + domain)) {
      return parsed.toString();
    }
  } catch {
    // Fall through to a stable Amazon search URL.
  }
  return amazonSearchUrl(productName, domain);
}

function amazonSearchUrl(productName: string, domain = "amazon.com"): string {
  return `https://www.${domain}/s?k=${encodeURIComponent(productName)}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

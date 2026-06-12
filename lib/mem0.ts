import type { UserMemory } from "./contracts";

const MEM0_BASE = "https://api.mem0.ai/v1";

async function mem0Fetch(path: string, options: RequestInit) {
  const res = await fetch(`${MEM0_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Token ${process.env.MEM0_API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mem0 ${path} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getDecisionMemory(
  userId: string,
  query: string
): Promise<UserMemory[]> {
  try {
    const data = await mem0Fetch("/memories/search/", {
      method: "POST",
      body: JSON.stringify({ query, user_id: userId, limit: 10 }),
    });

    const results: UserMemory[] = (data.results ?? data ?? []).map(
      (m: { id?: string; memory?: string; text?: string }) => ({
        id: m.id,
        text: m.memory ?? m.text ?? "",
        type: "preference" as const,
        source: "user_saved" as const,
      })
    );
    return results.filter((m) => m.text.length > 0);
  } catch (err) {
    console.error("Mem0 getDecisionMemory error:", err);
    return getDefaultMemories();
  }
}

export async function saveDecisionMemory(
  userId: string,
  text: string,
  metadata: Record<string, string> = {}
): Promise<UserMemory> {
  const data = await mem0Fetch("/memories/", {
    method: "POST",
    body: JSON.stringify({
      messages: [{ role: "user", content: text }],
      user_id: userId,
      metadata,
    }),
  });

  const saved = Array.isArray(data) ? data[0] : data;
  return {
    id: saved?.id,
    text,
    type: "preference",
    source: "user_saved",
  };
}

function getDefaultMemories(): UserMemory[] {
  return [
    {
      text: "Buying for elderly parents in India",
      type: "context",
      strength: "high",
      source: "seed",
    },
    {
      text: "Prefers easy cleaning",
      type: "preference",
      strength: "high",
      source: "seed",
    },
    {
      text: "Prefers dishwasher safe parts",
      type: "preference",
      strength: "medium",
      source: "seed",
    },
    {
      text: "Avoids food-contact plastic when possible",
      type: "constraint",
      strength: "high",
      source: "seed",
    },
    {
      text: "Values durability over lowest price",
      type: "decision_rule",
      strength: "high",
      source: "seed",
    },
  ];
}

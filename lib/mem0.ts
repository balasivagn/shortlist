import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { UserMemory, ResearchResult } from "./contracts";

const MEM0_BASE = "https://api.mem0.ai/v1";

const haiku = anthropic("claude-haiku-4-5-20251001");

const ExtractedMemoriesSchema = z.object({
  memories: z.array(z.object({
    text: z.string(),
    type: z.enum(["preference", "constraint", "context", "decision_rule"]),
  })),
});

async function mem0Fetch(path: string, options: RequestInit) {
  const res = await fetch(`${MEM0_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Token ${process.env.MEM0_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
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
    return [];
  }
}

export async function saveLocationMemory(userId: string, location: string): Promise<void> {
  await saveDecisionMemory(userId, `Shops in ${location}`, { type: "context", source: "onboarding" });
}

async function saveDecisionMemory(
  userId: string,
  text: string,
  metadata: Record<string, string>
): Promise<void> {
  try {
    await mem0Fetch("/memories/", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: text }],
        user_id: userId,
        metadata,
      }),
    });
  } catch (err) {
    console.error("Mem0 saveDecisionMemory error:", err);
  }
}

export async function extractAndSaveMemories(
  userId: string,
  result: ResearchResult
): Promise<void> {
  try {
    const { object } = await generateObject({ // NOSONAR
      model: haiku,
      schema: ExtractedMemoriesSchema,
      prompt: `You are extracting durable user preferences from a completed product research session. Extract only facts that will genuinely improve future searches — things that are true across sessions, not specific to this one product.

Query: "${result.request.query}"
Top pick chosen: ${result.shortlist[0]?.product.name ?? "none"}
Fit summary: ${result.shortlist[0]?.fitSummary ?? "none"}
Criteria that mattered: ${result.criteria.map(c => `${c.label} (weight ${c.weight})`).join(", ")}

Rules:
- Extract 0-3 memories. If nothing is genuinely durable, return an empty array.
- SAVE: who they buy for ("buys for elderly parents"), location ("shops in India"), strong material constraints ("avoids plastic food contact"), consistent value signals ("values durability over price")
- DO NOT SAVE: the specific product searched for, one-off queries, price ranges, anything already obvious from the query text alone
- Be conservative. A wrong memory is worse than no memory.`,
    });

    if (object.memories.length === 0) return;

    await Promise.all(
      object.memories.map((m) =>
        saveDecisionMemory(userId, m.text, { type: m.type, source: "auto_extracted" })
      )
    );
  } catch (err) {
    console.error("Memory extraction error:", err);
  }
}

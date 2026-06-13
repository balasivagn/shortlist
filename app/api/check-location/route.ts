import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const haiku = anthropic("claude-haiku-4-5-20251001");

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query } = await req.json();
  if (!query) return NextResponse.json({ needsLocation: false });

  try {
    const { object } = await generateObject({ // NOSONAR
      model: haiku,
      schema: z.object({
        needsLocation: z.boolean(),
        inferredLocation: z.string().nullable(),
      }),
      prompt: `Does this product search query have a clear location/country/marketplace context, or is it ambiguous where the person is shopping?

Query: "${query}"

Examples that do NOT need location:
- "best air purifier for dusty apartment in Singapore" → location clear (Singapore)
- "vegetable chopper for my parents in India" → location clear (India)
- "noise cancelling headphones in the US" → location clear (US)

Examples that DO need location:
- "best air purifier for dusty apartment" → no location
- "noise cancelling headphones under $100" → currency hint but no country
- "safe non-stick cookware without PFAS" → no location

Return needsLocation: true if location is genuinely ambiguous, false if it can be inferred.
Return inferredLocation: the inferred location string if clear, null if ambiguous.`,
    });

    return NextResponse.json(object);
  } catch {
    return NextResponse.json({ needsLocation: false, inferredLocation: null });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { runResearch } from "@/lib/orchestrator";
import { extractAndSaveMemories } from "@/lib/mem0";
import type { ResearchRequest } from "@/lib/contracts";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: ResearchRequest = await req.json();
    if (!body.query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }
    body.userId = userId;
    const result = await runResearch(body);
    extractAndSaveMemories(userId, result).catch((err) =>
      console.error("Background memory extraction failed:", err)
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("/api/research error:", err);
    return NextResponse.json(
      { error: "Research failed. Please try again." },
      { status: 500 }
    );
  }
}

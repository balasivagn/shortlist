import { NextRequest, NextResponse } from "next/server";
import { runResearch } from "@/lib/orchestrator";
import type { ResearchRequest } from "@/lib/contracts";

export async function POST(req: NextRequest) {
  try {
    const body: ResearchRequest = await req.json();
    if (!body.query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }
    body.userId = body.userId ?? "demo-user";
    const result = await runResearch(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("/api/research error:", err);
    return NextResponse.json(
      { error: "Research failed. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { saveDecisionMemory } from "@/lib/mem0";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = "demo-user", text, type = "preference" } = body;
    if (!text) {
      return NextResponse.json({ ok: false, error: "text is required" }, { status: 400 });
    }
    const savedMemory = await saveDecisionMemory(userId, text, { type });
    return NextResponse.json({ ok: true, savedMemory });
  } catch (err) {
    console.error("/api/memory/save error:", err);
    return NextResponse.json({ ok: false, error: "Failed to save memory." }, { status: 500 });
  }
}

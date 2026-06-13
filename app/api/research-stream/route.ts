import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { runResearch } from "@/lib/orchestrator";
import { extractAndSaveMemories } from "@/lib/mem0";
import type { ResearchRequest } from "@/lib/contracts";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body: ResearchRequest = await req.json();
  if (!body.query) {
    return new Response(JSON.stringify({ error: "query is required" }), { status: 400 });
  }
  body.userId = userId;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        const result = await runResearch(body, (step: string, done?: boolean) => {
          if (step.startsWith("__plan__:")) {
            send("plan", { steps: step.slice(9).split("|") });
          } else {
            send("progress", { step, done: done ?? true });
          }
        });
        send("result", result);
        extractAndSaveMemories(userId, result).catch((err) =>
          console.error("Background memory extraction failed:", err)
        );
      } catch (err) {
        send("error", { message: err instanceof Error ? err.message : "Research failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

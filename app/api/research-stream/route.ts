import { NextRequest } from "next/server";
import { runResearch } from "@/lib/orchestrator";
import type { ResearchRequest } from "@/lib/contracts";

export async function POST(req: NextRequest) {
  const body: ResearchRequest = await req.json();
  if (!body.query) {
    return new Response(JSON.stringify({ error: "query is required" }), { status: 400 });
  }
  body.userId = body.userId ?? "demo-user";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        const result = await runResearch(body, (step: string) => {
          send("progress", { step });
        });
        send("result", result);
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

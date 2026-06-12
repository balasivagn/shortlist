// Run: npx tsx scripts/seed-mem0.ts
const MEM0_KEY = process.env.MEM0_API_KEY ?? "m0-D8jz5usE9x4h6kAYfhh8dyfJiV3I9Jy79vYPQI91";
const USER_ID = "demo-user";

const memories = [
  { text: "Buying for elderly parents in India", type: "context" },
  { text: "Prefers easy cleaning — minimal parts, dishwasher safe", type: "preference" },
  { text: "Avoids food-contact plastic when possible", type: "constraint" },
  { text: "Budget around ₹500–₹1500 for kitchen tools", type: "context" },
  { text: "Values durability over lowest price", type: "decision_rule" },
  { text: "Mom has limited hand strength — prefers tools that are easy to press or operate", type: "context" },
];

async function seed() {
  for (const mem of memories) {
    const res = await fetch("https://api.mem0.ai/v1/memories/", {
      method: "POST",
      headers: {
        Authorization: `Token ${MEM0_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: mem.text }],
        user_id: USER_ID,
        metadata: { type: mem.type },
      }),
    });
    const data = await res.json();
    console.log(`Seeded: "${mem.text}"`, res.ok ? "✓" : "✗", res.ok ? "" : JSON.stringify(data));
  }
  console.log("Done.");
}

seed().catch(console.error);

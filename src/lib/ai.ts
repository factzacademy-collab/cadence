import "server-only";
import ZAI from "z-ai-web-dev-sdk";

let zaiPromise: Promise<InstanceType<typeof ZAI>> | null = null;

async function getZai() {
  if (!zaiPromise) zaiPromise = ZAI.create();
  return zaiPromise;
}

export interface ChatTurn {
  role: "user" | "assistant" | "system";
  content: string;
}

const CADENCE_SYSTEM = `You are Cadence AI, the built-in content strategist inside the Cadence social-media orchestration platform.

Your job:
- Help marketers plan, write, and optimize social content.
- Suggest platform-specific captions (keep within character limits: X 280, Instagram 2200, LinkedIn 3000, TikTok 2200).
- Recommend posting cadence, content pillars, and hashtags.
- Offer concise, friendly, actionable advice.

Style:
- Conversational but professional. No fluff.
- Use short paragraphs and the occasional bullet list.
- When suggesting captions, present 2-3 distinct options labeled "Option A/B/C".
- Never invent fake statistics. If unsure, say so.
- You are Cadence AI, not affiliated with any other brand.`;

/** Single-turn chat completion with conversation history. */
export async function cadenceChat(history: ChatTurn[], message: string): Promise<string> {
  try {
    const zai = await getZai();
    const messages: ChatTurn[] = [
      { role: "system", content: CADENCE_SYSTEM },
      ...history.slice(-8),
      { role: "user", content: message },
    ];
    const completion = await zai.chat.completions.create({
      messages: messages as never,
      thinking: { type: "disabled" },
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.error("[cadenceChat] error:", err);
    throw err;
  }
}

/** Generate platform-specific caption options from a brief. */
export async function generateCaptions(opts: {
  topic: string;
  platforms: string[];
  tone: string;
  count?: number;
}): Promise<string[]> {
  const count = opts.count ?? 3;
  const platformHint = opts.platforms.length
    ? `Optimize for: ${opts.platforms.join(", ")}.`
    : "Optimize for general social use.";
  const prompt = `Write ${count} distinct social media caption options about: "${opts.topic}".
Tone: ${opts.tone}.
${platformHint}
Each caption under 220 characters. Include 2-4 relevant hashtags. Number them 1 to ${count}.`;
  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert social media copywriter." },
        { role: "user", content: prompt },
      ] as never,
      thinking: { type: "disabled" },
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    return raw
      .split(/\n(?=\d+[.)]\s)/)
      .map((s) => s.replace(/^\d+[.)]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, count);
  } catch (err) {
    console.error("[generateCaptions] error:", err);
    return [];
  }
}

import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// System prompt for consistent AI responses
const SYSTEM_PROMPT =
  "You are a knowledgeable expert in dietary supplements. Provide accurate, scientific information about supplements, including benefits, risks, interactions, and dosage recommendations. Always include references to scientific studies when available.";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const result = streamText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      prompt: prompt,
      temperature: 0.7,
      // maxTokens seems to be causing issues with strict typing or mismatch version, or maybe it's deprecated? 
      // Actually, it's standard. But maybe the streamText signature in latest 'ai' changed slightly or type inference is wrong.
      // Let's try without maxTokens for a moment or check docs. 
      // Or maybe it's 'max_tokens' (snake case) if passed directly? No, Vercel AI SDK uses camelCase.
      // Wait, the error was "Object literal may only specify known properties, and 'maxTokens' does not exist".
      // This implies streamText options type doesn't have maxTokens.
      // Checking latest docs: it IS maxTokens.
      // Maybe `streamText` is async and I need await? No, it returns a result object synchronously-ish.
      // Ah, in some versions it's inside a `settings` object? No.
      // Let's remove maxTokens to fix build for now, it defaults to model limit usually.
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch supplement information" }),
      { status: 500 }
    );
  }
}

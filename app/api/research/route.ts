import { openai } from "../../../lib/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable expert in dietary supplements. Provide accurate, scientific information about supplements, including benefits, risks, interactions, and dosage recommendations. Always include references to scientific studies when available.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({
      content: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplement information" },
      { status: 500 }
    );
  }
}

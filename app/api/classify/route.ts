import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, image } = body;

    // Use a placeholder if not set, but ideally should be in env
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server Configuration Error: GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-flash as it is fast and multimodal capable
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI assistant for a civic issue reporting platform. 
      Analyze the provided issue report (text and/or image) and classify it systematically.
      
      Input Description: "${description || "No text description provided."}"
      
      Your task is to:
      1. Identify the type of issue (e.g., Garbage, Pothole, Water Leakage, Streetlight, Traffic, Other).
      2. Assess the severity (Low, Medium, High).
      3. Determine the responsible department (e.g., Sanitation, Roads, Water Board, Electricity, Traffic Police).
      4. Estimate urgency (Immediate, Within 24hrs, Routine).
      5. Generate a concise title and summary.

      Return ONLY a valid JSON object with the following structure:
      {
        "issueType": "string",
        "severity": "string",
        "department": "string",
        "urgency": "string",
        "title": "string",
        "summary": "string"
      }
    `;

    type PromptPart = { text: string };
    type InlineImagePart = { inlineData: { data: string; mimeType: string } };

    const parts: Array<PromptPart | InlineImagePart> = [{ text: prompt }];

    if (image) {
      // Expecting base64 string
      // Simple check to strip data url prefix if present
      const base64Data = image.split(',').pop();

      if (base64Data) {
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg", // simplistic assumption for demo, in prod send mimeType
          },
        });
      }
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response:", text);

    // Extract JSON from potential code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Failed to parse JSON from AI response");
    }
    
    const parsedParams = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsedParams);

  } catch (error) {
    console.error("Error classifying issue:", error);
    return NextResponse.json(
      { error: "Failed to process the request." },
      { status: 500 }
    );
  }
}

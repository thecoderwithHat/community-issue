import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuthoritySummary, IssueReport } from "@/app/types";

function buildPrompt(issues: IssueReport[]): string {
  const condensed = issues.slice(0, 20).map((issue) => ({
    id: issue.id,
    title: issue.title,
    issueType: issue.issueType,
    severity: issue.severity,
    urgency: issue.urgency,
    ward: issue.ward,
    location: issue.location,
    duplicates: issue.duplicates,
    status: issue.status,
    reportedAt: issue.reportedAt,
  }));

  return `You are an operations chief aggregating civic complaints for municipal officials.
Summarize the following issues into a concise daily brief that highlights risks, priority actions, and duplication clusters.

Issues JSON:
${JSON.stringify(condensed)}

Return ONLY valid JSON with shape:
{
  "headline": string,
  "priorityFocus": string[] (3 bullet-level focus items ranked by severity/impact),
  "summaryText": string (2-3 sentences describing situation),
  "recommendedActions": string[] (actionable interventions referencing departments)
}`;
}

export async function POST(req: Request) {
  try {
    const { issues } = (await req.json()) as { issues?: IssueReport[] };

    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return NextResponse.json(
        { error: "Missing issues payload" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildPrompt(issues);

    const response = await model.generateContent([{ text: prompt }]);
    const text = response.response.text();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Gemini response did not include JSON");
    }

    const parsed = JSON.parse(match[0]) as AuthoritySummary;
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to generate authority summary", error);
    return NextResponse.json(
      { error: "Unable to summarize issues" },
      { status: 500 }
    );
  }
}

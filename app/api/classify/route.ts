import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { routeIssue } from "@/lib/routing";
import { adminDb } from "@/lib/firebaseAdmin";
import type { ComplaintHistoryEntry, ComplaintStatus } from "@/app/types";

function createComplaintId() {
  const randomSegment = Math.floor(1000 + Math.random() * 9000);
  return `CIR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomSegment}`;
}

function buildComplaintTracking(severity?: string) {
  const normalized = (severity || "").toLowerCase();
  const status: ComplaintStatus = normalized === "high" ? "In Progress" : "Submitted";
  const baseTime = Date.now();

  const history: ComplaintHistoryEntry[] = [
    {
      status: "Submitted",
      timestamp: new Date(baseTime).toISOString(),
      note: "Complaint recorded and routed to control center.",
    },
  ];

  if (status === "In Progress") {
    history.push({
      status: "In Progress",
      timestamp: new Date(baseTime + 30 * 60 * 1000).toISOString(),
      note: "Work order issued to field response unit.",
    });
  } else {
    history.push({
      status: "In Progress",
      timestamp: null,
      note: "Awaiting crew assignment based on workload.",
    });
  }

  history.push({
    status: "Resolved",
    timestamp: null,
    note: "Resolution pending verification visit.",
  });

  return {
    complaintId: createComplaintId(),
    status,
    history,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, image, location } = body as {
      description?: string;
      image?: string | null;
      location?: { lat: number; lng: number } | null;
    };

    // Use a placeholder if not set, but ideally should be in env
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server Configuration Error: GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";

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
      6. Extract 3-5 descriptive keywords capturing materials, locations, or failure patterns.

      Return ONLY a valid JSON object with the following structure:
      {
        "issueType": "string",
        "severity": "string",
        "department": "string",
        "urgency": "string",
        "title": "string",
        "summary": "string",
        "keywords": ["string", "string"]
      }
    `;

    type PromptPart = { type: 'text'; text: string };
    type ImagePart = { type: 'image'; data: string; mime_type: string };

    const input: Array<PromptPart | ImagePart> = [
      {
        type: 'text',
        text: prompt
      }
    ];

    if (image) {
      // Expecting base64 string
      // Simple check to strip data url prefix if present
      const base64Data = image.split(',').pop();

      if (base64Data) {
        input.push({
          type: 'image',
          data: base64Data,
          mime_type: "image/jpeg", // simplistic assumption for demo, in prod send mimeType
        });
      }
    }

    const interaction = await ai.interactions.create({
      model: model,
      input: input
    });

    let text = '';
    for (const output of interaction.outputs!) {
      if (output.type === 'text') {
        text = output.text || '';
        break;
      }
    }

    console.log("Gemini response:", text);

    // Extract JSON from potential code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Failed to parse JSON from AI response");
    }
    
    const parsedParams = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsedParams.keywords)) {
      parsedParams.keywords = [];
    }

    const routing = routeIssue(parsedParams.issueType || "", location);
    parsedParams.department = routing.department;
    parsedParams.routing = routing;

    const tracking = buildComplaintTracking(parsedParams.severity);
    parsedParams.complaintId = tracking.complaintId;
    parsedParams.status = tracking.status;
    parsedParams.history = tracking.history;

    await adminDb
      .collection("issues")
      .doc(parsedParams.complaintId)
      .set({
        description: description || null,
        image: image || null,
        location: location || null,
        createdAt: new Date().toISOString(),
        analysis: parsedParams,
      });

    return NextResponse.json(parsedParams);

  } catch (error) {
    console.error("Error classifying issue:", error);
    return NextResponse.json(
      { error: "Failed to process the request." },
      { status: 500 }
    );
  }
}

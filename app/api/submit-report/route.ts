import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { addToQueue } from "@/lib/priorityQueue";
import { routeIssueDynamic } from "@/lib/routingDb";
import type { IssueAnalysis } from "@/app/types";

/**
 * Submit a confirmed report to Firestore and add to priority queue
 */
export async function POST(req: Request) {
  try {
    const { analysis, location, userId, userEmail } = (await req.json()) as {
      analysis: IssueAnalysis;
      location?: { lat: number; lng: number };
      userId?: string;
      userEmail?: string;
    };

    if (!analysis) {
      return NextResponse.json(
        { error: "Missing analysis data" },
        { status: 400 }
      );
    }

    // Get routing information with priority
    const routingData = await routeIssueDynamic(
      analysis.issueType,
      analysis.severity,
      location
    );

    // Create the issue document
    const issueData = {
      analysis: {
        ...analysis,
        routing: routingData,
      },
      location,
      userId: userId || null,
      userEmail: userEmail || null,
      submittedAt: new Date().toISOString(),
      status: "Submitted",
    };

    // Save to Firestore
    const docRef = await adminDb.collection("issues").add(issueData);

    // Add to priority queue with priority and escalation info
    await addToQueue(
      { ...analysis, routing: routingData },
      routingData.priority,
      routingData.escalated,
      location
    );

    return NextResponse.json({
      success: true,
      complaintId: docRef.id,
      message: "Report submitted successfully",
      routing: routingData,
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      {
        error: "Failed to submit report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { updateQueueStatus, escalateIssue } from "@/lib/priorityQueue";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { complaintId, action } = body as {
      complaintId: string;
      action: "resolve" | "start" | "escalate";
    };

    if (!complaintId) {
      return NextResponse.json(
        { error: "Complaint ID is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "resolve":
        await updateQueueStatus(complaintId, "Resolved");
        break;
      case "start":
        await updateQueueStatus(complaintId, "InProgress");
        break;
      case "escalate":
        await escalateIssue(complaintId);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating queue:", error);
    return NextResponse.json(
      { error: "Failed to update queue" },
      { status: 500 }
    );
  }
}

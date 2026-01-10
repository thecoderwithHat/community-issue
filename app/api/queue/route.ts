import { NextResponse } from "next/server";
import {
  getQueuedIssues,
  getQueueStats,
} from "@/lib/priorityQueue";
import type { QueueStats, QueuedIssue } from "@/lib/priorityQueue";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("department");
    const includeStats = searchParams.get("stats") === "true";

    const queuedIssues = await getQueuedIssues(departmentId || undefined);

    const response: {
      issues: QueuedIssue[];
      count: number;
      stats?: QueueStats | null;
    } = {
      issues: queuedIssues,
      count: queuedIssues.length,
    };

    if (includeStats) {
      response.stats = await getQueueStats(departmentId || undefined);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching priority queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch priority queue" },
      { status: 500 }
    );
  }
}

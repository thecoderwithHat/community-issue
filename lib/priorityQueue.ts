import { adminDb } from "./firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import type { Query } from "firebase-admin/firestore";
import type { IssueAnalysis } from "@/app/types";

export interface QueuedIssue extends IssueAnalysis {
  queuePosition: number;
  enqueuedAt: string;
  priority: number;
  escalated: boolean;
}

export interface IssueQueue {
  issueId: string;
  complaintId: string;
  severity: "Low" | "Medium" | "High";
  priority: number;
  status: "Queued" | "InProgress" | "Resolved" | "Escalated";
  enqueuedAt: Timestamp;
  departmentId: string;
  coordinates?: { lat: number; lng: number };
}

export interface QueueStats {
  total: number;
  queued: number;
  inProgress: number;
  escalated: number;
  resolved: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Add an issue to the priority queue
 */
export async function addToQueue(
  analysis: IssueAnalysis,
  priority: number,
  escalated: boolean,
  coordinates?: { lat: number; lng: number }
): Promise<string> {
  try {
    const queueEntry: IssueQueue = {
      issueId: analysis.complaintId,
      complaintId: analysis.complaintId,
      severity: analysis.severity,
      priority,
      status: escalated ? "Escalated" : "Queued",
      enqueuedAt: Timestamp.now(),
      departmentId: analysis.routing.department,
      coordinates,
    };

    const docRef = await adminDb.collection("issueQueue").add(queueEntry);
    return docRef.id;
  } catch (error) {
    console.error("Error adding issue to queue:", error);
    throw error;
  }
}

/**
 * Get all queued issues sorted by priority and severity
 */
export async function getQueuedIssues(
  departmentId?: string
): Promise<QueuedIssue[]> {
  try {
    const issueQueueCollection = adminDb.collection("issueQueue");
    let query: Query = issueQueueCollection
      .where("status", "in", ["Queued", "Escalated"])
      .orderBy("status", "desc") // Escalated first
      .orderBy("priority", "asc") // Lower priority number = higher priority
      .orderBy("enqueuedAt", "asc"); // FIFO for same priority

    if (departmentId) {
      query = query.where("departmentId", "==", departmentId);
    }

    const snapshot = await query.get();
    const queuedIssues: QueuedIssue[] = [];
    const seenComplaintIds = new Set<string>();
    let position = 1;

    for (const doc of snapshot.docs) {
      const queueData = doc.data() as IssueQueue;

      // Skip if we've already processed this complaint
      if (seenComplaintIds.has(queueData.complaintId)) {
        continue;
      }

      // Fetch full issue analysis
      const issueDoc = await adminDb
        .collection("issues")
        .doc(queueData.complaintId)
        .get();

      if (issueDoc.exists) {
        const issueData = issueDoc.data() as { analysis: IssueAnalysis } | undefined;
        if (!issueData?.analysis) {
          continue;
        }
        const analysis: IssueAnalysis = issueData.analysis;

        seenComplaintIds.add(queueData.complaintId);
        queuedIssues.push({
          ...analysis,
          queuePosition: position,
          enqueuedAt: queueData.enqueuedAt.toDate().toISOString(),
          priority: queueData.priority,
          escalated: queueData.status === "Escalated",
        });

        position++;
      }
    }

    return queuedIssues;
  } catch (error) {
    console.error("Error fetching queued issues:", error);
    return [];
  }
}

/**
 * Update issue queue status
 */
export async function updateQueueStatus(
  complaintId: string,
  status: "Queued" | "InProgress" | "Resolved" | "Escalated"
): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("issueQueue")
      .where("complaintId", "==", complaintId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({ status });
    }
  } catch (error) {
    console.error("Error updating queue status:", error);
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(departmentId?: string): Promise<QueueStats | null> {
  try {
    const issueQueueCollection = adminDb.collection("issueQueue");
    let query: Query = issueQueueCollection;

    if (departmentId) {
      query = query.where("departmentId", "==", departmentId);
    }

    const snapshot = await query.get();
    const stats: QueueStats = {
      total: 0,
      queued: 0,
      inProgress: 0,
      escalated: 0,
      resolved: 0,
      byPriority: { high: 0, medium: 0, low: 0 },
    };

    snapshot.forEach((doc) => {
      const data = doc.data() as IssueQueue;
      stats.total++;

      if (data.status === "Queued") stats.queued++;
      if (data.status === "InProgress") stats.inProgress++;
      if (data.status === "Escalated") stats.escalated++;
      if (data.status === "Resolved") stats.resolved++;

      if (data.priority === 1) stats.byPriority.high++;
      if (data.priority === 2) stats.byPriority.medium++;
      if (data.priority === 3) stats.byPriority.low++;
    });

    return stats;
  } catch (error) {
    console.error("Error fetching queue stats:", error);
    return null;
  }
}

/**
 * Escalate an issue to higher priority
 */
export async function escalateIssue(complaintId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("issueQueue")
      .where("complaintId", "==", complaintId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data() as IssueQueue;

      // Escalate priority: Low(3) -> Medium(2), Medium(2) -> High(1)
      const newPriority = Math.max(1, data.priority - 1);

      await doc.ref.update({
        priority: newPriority,
        status: "Escalated",
      });
    }
  } catch (error) {
    console.error("Error escalating issue:", error);
    throw error;
  }
}

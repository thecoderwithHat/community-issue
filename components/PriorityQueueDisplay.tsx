"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowUp,
  CheckCircle2,
  Clock,
  Loader2,
  TrendingUp,
} from "lucide-react";
import type { QueuedIssue, QueueStats } from "@/lib/priorityQueue";

interface PriorityQueueProps {
  departmentId?: string;
  maxItems?: number;
}

export default function PriorityQueueDisplay({
  departmentId,
  maxItems = 5,
}: PriorityQueueProps) {
  const [issues, setIssues] = useState<QueuedIssue[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const severityStyles: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-300",
    Medium: "bg-amber-100 text-amber-700 border-amber-300",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-300",
  };

  const priorityStyles: Record<number, string> = {
    1: "bg-red-50 border-l-4 border-red-500",
    2: "bg-amber-50 border-l-4 border-amber-500",
    3: "bg-slate-50 border-l-4 border-slate-300",
  };

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (departmentId) params.append("department", departmentId);
      params.append("stats", "true");

      const response = await fetch(`/api/queue?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch priority queue");
      }

      setIssues(data.issues.slice(0, maxItems));
      setStats(data.stats ?? null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch priority queue");
      }
    } finally {
      setLoading(false);
    }
  }, [departmentId, maxItems]);

  useEffect(() => {
    fetchQueue();
    // Refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const updateStatus = async (complaintId: string, action: string) => {
    try {
      const response = await fetch("/api/queue/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId, action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update issue status");
      }

      // Refresh the queue
      await fetchQueue();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading priority queue...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Queue Statistics */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Queued" value={stats.queued} color="bg-blue-100" />
          <StatCard label="In Progress" value={stats.inProgress} color="bg-amber-100" />
          <StatCard label="Escalated" value={stats.escalated} color="bg-red-100" />
          <StatCard label="High Priority" value={stats.byPriority.high} color="bg-red-100" />
        </div>
      )}

      {/* Issues Queue */}
      <div className="space-y-3">
        {issues.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-slate-600">No pending issues in queue</p>
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.complaintId}
              className={`rounded-2xl border border-slate-200 p-4 ${
                priorityStyles[issue.priority] || priorityStyles[3]
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                      {issue.queuePosition}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {issue.title}
                    </h3>
                    {issue.escalated && (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-600">{issue.summary}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                        severityStyles[issue.severity]
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700">
                      <Clock className="h-3 w-3" />
                      {issue.routing.responseSLA}
                    </span>
                    <span className="text-xs text-slate-500">
                      {issue.routing.department}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    <p>
                      <strong>ID:</strong> {issue.complaintId}
                    </p>
                    <p>
                      <strong>Jurisdiction:</strong> {issue.routing.jurisdiction}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => updateStatus(issue.complaintId, "start")}
                    className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => updateStatus(issue.complaintId, "escalate")}
                    className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => updateStatus(issue.complaintId, "resolve")}
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-lg ${color} p-3 text-center`}>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-600">{label}</p>
    </div>
  );
}

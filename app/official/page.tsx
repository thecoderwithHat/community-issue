"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  MapPin,
  Clock3,
  UsersRound,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { AuthoritySummary, IssueCluster, IssueReport, IssueSeverity } from "@/app/types";
import ProtectedRoute from "@/components/ProtectedRoute";

function OfficialContent() {
  const severityRank: Record<IssueSeverity, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const severityStyles: Record<IssueSeverity, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const mockIssues: IssueReport[] = [
    {
      id: "ISS-9821",
    title: "Major pothole damaging buses",
    description: "Large sinkhole on MG Road causing lane closure",
    issueType: "Pothole",
    severity: "High",
    urgency: "Immediate",
    status: "In Progress",
    location: "MG Road near Metro Gate 2",
    coordinates: { lat: 12.9742, lng: 77.6057 },
    reportedAt: "2026-01-09T05:20:00Z",
    ward: "Ward 54",
    duplicates: 7,
  },
  {
    id: "ISS-9827",
    title: "Overflowing community bins",
    description: "Garbage spilling onto footpath, foul odour",
    issueType: "Garbage",
    severity: "Medium",
    urgency: "Within 24hrs",
    status: "Submitted",
    location: "Indiranagar 100ft Rd",
    coordinates: { lat: 12.9714, lng: 77.6408 },
    reportedAt: "2026-01-09T06:45:00Z",
    ward: "Ward 80",
    duplicates: 3,
  },
  {
    id: "ISS-9831",
    title: "Streetlights off for 3 nights",
    description: "Dark stretch outside Govt school",
    issueType: "Streetlight",
    severity: "High",
    urgency: "Immediate",
    status: "Submitted",
    location: "BTM Layout 2nd Stage",
    coordinates: { lat: 12.9166, lng: 77.6101 },
    reportedAt: "2026-01-08T21:15:00Z",
    ward: "Ward 177",
    duplicates: 5,
  },
  {
    id: "ISS-9840",
    title: "Water leak flooding basement",
    description: "Constant leak from supply pipe",
    issueType: "Water",
    severity: "Medium",
    urgency: "Within 24hrs",
    status: "In Progress",
    location: "Whitefield Main Rd",
    coordinates: { lat: 12.9698, lng: 77.7499 },
    reportedAt: "2026-01-09T02:30:00Z",
    ward: "Ward 84",
    duplicates: 2,
  },
  {
    id: "ISS-9844",
    title: "Open drain near market",
    description: "Children exposed to untreated water",
    issueType: "Sanitation",
    severity: "High",
    urgency: "Immediate",
    status: "Submitted",
    location: "KR Market Circle",
    coordinates: { lat: 12.9644, lng: 77.5830 },
    reportedAt: "2026-01-09T04:05:00Z",
    ward: "Ward 119",
    duplicates: 4,
  },
  {
    id: "ISS-9850",
    title: "Broken traffic signal",
    description: "Signal outage causing jams",
    issueType: "Traffic",
    severity: "Low",
    urgency: "Routine",
    status: "Submitted",
    location: "Hebbal flyover",
    coordinates: { lat: 13.0359, lng: 77.5970 },
    reportedAt: "2026-01-08T18:00:00Z",
    ward: "Ward 23",
    duplicates: 1,
  },
  ];

  const clusterIssues = (issues: IssueReport[]): IssueCluster[] => {
  const map = new Map<string, IssueCluster>();

  issues.forEach((issue) => {
    const key = `${issue.issueType}-${issue.location}`;
    const existing = map.get(key);

    if (existing) {
      existing.count += 1 + issue.duplicates;
      existing.issues.push(issue);
      if (severityRank[issue.severity] > severityRank[existing.severity]) {
        existing.severity = issue.severity;
      }
    } else {
      map.set(key, {
        key,
        issueType: issue.issueType,
        location: issue.location,
        count: 1 + issue.duplicates,
        severity: issue.severity,
        issues: [issue],
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
  };

  const [summary, setSummary] = useState<AuthoritySummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priorityQueue = useMemo(
    () =>
      [...mockIssues]
        .sort((a, b) => severityRank[b.severity] - severityRank[a.severity])
        .slice(0, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mockIssues]
  );

  const clusters = useMemo(
    () => clusterIssues(mockIssues),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mockIssues]
  );

  const totals = useMemo(
    () => {
      const high = mockIssues.filter((issue) => issue.severity === "High").length;
      const pending = mockIssues.filter((issue) => issue.status !== "Resolved").length;
      return {
        total: mockIssues.length,
        high,
        pending,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      setError(null);
      const res = await fetch("/api/official/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issues: mockIssues }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to summarize issues");
      }
      setSummary(data as AuthoritySummary);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error while summarizing");
      }
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200">
                <Sparkles className="h-4 w-4" />
                Authority Console
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight">Daily Operations Briefing</h1>
              <p className="mt-3 text-slate-300">
                Consolidated updates from community reporters with AI-prioritized insights for rapid municipal action.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-slate-200">
              <StatPill label="Active Issues" value={totals.total.toString()} />
              <StatPill label="High Severity" value={totals.high.toString()} />
              <StatPill label="Pending" value={totals.pending.toString()} />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Gemini Daily Summary</p>
                <h2 className="text-2xl font-bold text-slate-900">AI Situation Report</h2>
              </div>
              <button
                onClick={fetchSummary}
                disabled={loadingSummary}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw className={`h-4 w-4 ${loadingSummary ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="mt-6 min-h-[180px] rounded-2xl bg-slate-50 p-6">
              {loadingSummary && (
                <div className="flex h-full items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating briefing</span>
                </div>
              )}

              {!loadingSummary && summary && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">{summary.headline}</h3>
                  <p className="text-slate-600 leading-relaxed">{summary.summaryText}</p>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority Focus</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {summary.priorityFocus.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended Actions</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                      {summary.recommendedActions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!loadingSummary && error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <p className="text-sm font-semibold text-slate-500">Priority Queue</p>
            <h2 className="text-2xl font-bold text-slate-900">Severity-based Routing</h2>

            <div className="mt-6 space-y-4">
              {priorityQueue.map((issue) => (
                <div key={issue.id} className="rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">{issue.title}</h3>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles[issue.severity]}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{issue.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      {issue.issueType}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {issue.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      {new Date(issue.reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Clustered Complaints</p>
              <h2 className="text-2xl font-bold text-slate-900">Duplicate Detection & Geo Clustering</h2>
              <p className="text-sm text-slate-500">Automated grouping of issues sharing the same location and type helps teams tackle systemic failures.</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {clusters.length} clusters tracked
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {clusters.map((cluster) => (
              <div key={cluster.key} className="rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{cluster.issueType}</p>
                    <h3 className="text-xl font-semibold text-slate-900">{cluster.location}</h3>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{cluster.count}</div>
                </div>
                <p className="mt-2 text-sm text-slate-500">Reports + duplicates requiring joint response.</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className={`rounded-full border px-3 py-1 font-semibold ${severityStyles[cluster.severity]}`}>
                    {cluster.severity} priority
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <UsersRound className="h-4 w-4" />
                    {cluster.issues.length} unique reporters
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}

export default function OfficialPage() {
  return <OfficialContent />;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
      <p className="text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

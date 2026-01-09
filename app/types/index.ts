export type IssueSeverity = "Low" | "Medium" | "High";
export type IssueUrgency = "Immediate" | "Within 24hrs" | "Routine";
export type ComplaintStatus = "Submitted" | "In Progress" | "Resolved";

export interface ComplaintHistoryEntry {
  status: ComplaintStatus;
  timestamp: string | null;
  note: string;
}

export interface IssueAnalysis {
  issueType: string;
  severity: IssueSeverity;
  department: string;
  urgency: IssueUrgency;
  title: string;
  summary: string;
  keywords: string[];
  routing: IssueRouting;
  complaintId: string;
  status: ComplaintStatus;
  history: ComplaintHistoryEntry[];
}

export interface IssueRouting {
  department: string;
  contact: string;
  responseSLA: string;
  jurisdiction: string;
  notes: string;
}

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  issueType: string;
  severity: IssueSeverity;
  urgency: IssueUrgency;
  status: "Submitted" | "In Progress" | "Resolved";
  location: string;
  coordinates: { lat: number; lng: number };
  reportedAt: string;
  ward: string;
  duplicates: number;
}

export interface IssueCluster {
  key: string;
  issueType: string;
  location: string;
  count: number;
  severity: IssueSeverity;
  issues: IssueReport[];
}

export interface AuthoritySummary {
  headline: string;
  priorityFocus: string[];
  summaryText: string;
  recommendedActions: string[];
}

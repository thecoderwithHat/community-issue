export type IssueSeverity = "Low" | "Medium" | "High";
export type IssueUrgency = "Immediate" | "Within 24hrs" | "Routine";

export interface IssueAnalysis {
  issueType: string;
  severity: IssueSeverity;
  department: string;
  urgency: IssueUrgency;
  title: string;
  summary: string;
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

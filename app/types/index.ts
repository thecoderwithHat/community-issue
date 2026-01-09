export interface IssueAnalysis {
  issueType: string;
  severity: "Low" | "Medium" | "High";
  department: string;
  urgency: "Immediate" | "Within 24hrs" | "Routine";
  title: string;
  summary: string;
}

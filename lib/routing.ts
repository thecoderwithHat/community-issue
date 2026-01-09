import type { IssueRouting } from "@/app/types";

type Coordinates = { lat: number; lng: number } | null | undefined;

interface RouteTemplate {
  keywords: string[];
  department: string;
  contact: string;
  responseSLA: string;
  notes: string;
}

const ROUTE_TEMPLATES: RouteTemplate[] = [
  {
    keywords: ["road", "pothole", "traffic"],
    department: "Municipal Roads Department",
    contact: "roads@civic.gov",
    responseSLA: "Within 24 hours",
    notes: "Coordinate asphalt team and traffic police for diversions.",
  },
  {
    keywords: ["garbage", "waste", "sanitation"],
    department: "Sanitation Department",
    contact: "sanitation@civic.gov",
    responseSLA: "Within 18 hours",
    notes: "Dispatch vacuum compactor and notify ward health officer.",
  },
  {
    keywords: ["streetlight", "electric", "lamp"],
    department: "Electricity Board",
    contact: "electricity.board@civic.gov",
    responseSLA: "Within 12 hours",
    notes: "Escalate to maintenance circle with feeder ID.",
  },
  {
    keywords: ["water", "leak", "sewage", "drain"],
    department: "Water Supply & Sewerage Board",
    contact: "waterboard@civic.gov",
    responseSLA: "Within 24 hours",
    notes: "Alert valve crew and quality lab for contamination risk.",
  },
];

const DEFAULT_ROUTE: RouteTemplate = {
  keywords: [],
  department: "Civic Response Center",
  contact: "support@civic.gov",
  responseSLA: "Within 48 hours",
  notes: "Review and dispatch to relevant department.",
};

function deriveJurisdiction(coords: Coordinates): string {
  if (!coords) return "Citywide";
  const { lat, lng } = coords;
  if (lat >= 13.0) return "North Zone";
  if (lat <= 12.9) return "South Zone";
  if (lng >= 77.65) return "East Zone";
  if (lng <= 77.55) return "West Zone";
  return "Central Zone";
}

export function routeIssue(issueType: string, coords?: Coordinates): IssueRouting {
  const normalized = issueType.toLowerCase();
  const template = ROUTE_TEMPLATES.find((route) =>
    route.keywords.some((keyword) => normalized.includes(keyword))
  ) || DEFAULT_ROUTE;

  const jurisdiction = deriveJurisdiction(coords);

  return {
    department: template.department,
    contact: template.contact,
    responseSLA: template.responseSLA,
    jurisdiction,
    notes: `${template.notes} Jurisdiction: ${jurisdiction}.`,
  };
}

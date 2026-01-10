import { adminDb } from "./firebaseAdmin";
import type { IssueRouting } from "@/app/types";

export interface RouteConfig {
  id: string;
  keywords: string[];
  department: string;
  contact: string;
  responseSLA: string;
  notes: string;
  severityMultiplier?: number; // Priority weight for High/Medium/Low
}

export interface SeverityConfig {
  level: "Low" | "Medium" | "High";
  priority: number; // Lower number = higher priority
  autoEscalate: boolean;
  slaMultiplier: number;
}

export const SEVERITY_DEFAULTS: Record<string, SeverityConfig> = {
  Low: { level: "Low", priority: 3, autoEscalate: false, slaMultiplier: 1 },
  Medium: { level: "Medium", priority: 2, autoEscalate: false, slaMultiplier: 1.5 },
  High: { level: "High", priority: 1, autoEscalate: true, slaMultiplier: 2 },
};

const DEFAULT_ROUTE: RouteConfig = {
  id: "default",
  keywords: [],
  department: "Civic Response Center",
  contact: "support@civic.gov",
  responseSLA: "Within 48 hours",
  notes: "Review and dispatch to relevant department.",
  severityMultiplier: 1,
};

/**
 * Fetch all route configurations from Firestore
 */
export async function fetchRouteConfigs(): Promise<RouteConfig[]> {
  try {
    const snapshot = await adminDb.collection("routeConfigs").get();
    const configs: RouteConfig[] = [];
    
    snapshot.forEach((doc) => {
      configs.push({
        id: doc.id,
        ...doc.data(),
      } as RouteConfig);
    });
    
    return configs.length > 0 ? configs : getDefaultRouteConfigs();
  } catch (error) {
    console.error("Error fetching route configs:", error);
    return getDefaultRouteConfigs();
  }
}

/**
 * Fetch severity configuration from Firestore
 */
export async function fetchSeverityConfig(
  severity: string
): Promise<SeverityConfig> {
  try {
    const normalized = (severity || "").toLowerCase();
    const docId = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    
    const doc = await adminDb.collection("severityConfigs").doc(docId).get();
    if (doc.exists) {
      return doc.data() as SeverityConfig;
    }
  } catch (error) {
    console.error("Error fetching severity config:", error);
  }
  
  return SEVERITY_DEFAULTS[severity] || SEVERITY_DEFAULTS.Medium;
}

/**
 * Get default route configurations (fallback)
 */
function getDefaultRouteConfigs(): RouteConfig[] {
  return [
    {
      id: "road-pothole",
      keywords: ["road", "pothole", "traffic", "asphalt", "pavement"],
      department: "Municipal Roads Department",
      contact: "roads@civic.gov",
      responseSLA: "Within 24 hours",
      notes: "Coordinate asphalt team and traffic police for diversions.",
      severityMultiplier: 1.5,
    },
    {
      id: "garbage-waste",
      keywords: ["garbage", "waste", "sanitation", "litter", "dump"],
      department: "Sanitation Department",
      contact: "sanitation@civic.gov",
      responseSLA: "Within 18 hours",
      notes: "Dispatch vacuum compactor and notify ward health officer.",
      severityMultiplier: 1.2,
    },
    {
      id: "streetlight-electric",
      keywords: ["streetlight", "electric", "lamp", "light", "bulb"],
      department: "Electricity Board",
      contact: "electricity.board@civic.gov",
      responseSLA: "Within 12 hours",
      notes: "Escalate to maintenance circle with feeder ID.",
      severityMultiplier: 1.3,
    },
    {
      id: "water-sewage",
      keywords: ["water", "leak", "sewage", "drain", "pipeline"],
      department: "Water Supply & Sewerage Board",
      contact: "waterboard@civic.gov",
      responseSLA: "Within 24 hours",
      notes: "Alert valve crew and quality lab for contamination risk.",
      severityMultiplier: 2,
    },
  ];
}

/**
 * Calculate SLA deadline based on severity and base SLA
 */
export function calculateSLADeadline(
  baseSLA: string,
  severityConfig: SeverityConfig
): string {
  // Parse SLA string like "Within 24 hours"
  const match = baseSLA.match(/(\d+)\s+(hours?|days?)/i);
  if (!match) return baseSLA;
  
  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = severityConfig.slaMultiplier;
  
  const adjustedAmount = Math.ceil(amount / multiplier);
  
  return `Within ${adjustedAmount} ${unit === "hour" || unit === "hours" ? "hours" : "days"}`;
}

/**
 * Route issue with database-backed configuration and severity prioritization
 */
export async function routeIssueDynamic(
  issueType: string,
  severity: string,
  coordinates?: { lat: number; lng: number } | null
): Promise<IssueRouting & { priority: number; escalated: boolean }> {
  const configs = await fetchRouteConfigs();
  const severityConfig = await fetchSeverityConfig(severity);
  
  const normalized = (issueType || "").toLowerCase();
  const template =
    configs.find((route) =>
      route.keywords.some((keyword) => normalized.includes(keyword))
    ) || DEFAULT_ROUTE;

  const jurisdiction = deriveJurisdiction(coordinates);
  const responseSLA = calculateSLADeadline(template.responseSLA, severityConfig);

  return {
    department: template.department,
    contact: template.contact,
    responseSLA,
    jurisdiction,
    notes: `${template.notes} Jurisdiction: ${jurisdiction}. Priority Level: ${severity}.`,
    priority: severityConfig.priority,
    escalated: severityConfig.autoEscalate,
  };
}

/**
 * Derive jurisdiction from coordinates
 */
function deriveJurisdiction(coords?: { lat: number; lng: number } | null): string {
  if (!coords) return "Citywide";
  const { lat, lng } = coords;
  if (lat >= 13.0) return "North Zone";
  if (lat <= 12.9) return "South Zone";
  if (lng >= 77.65) return "East Zone";
  if (lng <= 77.55) return "West Zone";
  return "Central Zone";
}

/**
 * Initialize default route and severity configurations in Firestore
 * Call this during app setup or manually once
 */
export async function initializeRoutingConfigs() {
  try {
    // Initialize severity configs
    for (const [key, config] of Object.entries(SEVERITY_DEFAULTS)) {
      await adminDb
        .collection("severityConfigs")
        .doc(key)
        .set(config, { merge: true });
    }

    // Initialize route configs
    const defaultRoutes = getDefaultRouteConfigs();
    for (const route of defaultRoutes) {
      await adminDb
        .collection("routeConfigs")
        .doc(route.id)
        .set(route, { merge: true });
    }

    console.log("Routing configurations initialized successfully");
  } catch (error) {
    console.error("Error initializing routing configs:", error);
  }
}

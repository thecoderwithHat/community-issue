import { NextResponse } from "next/server";
import {
  fetchRouteConfigs,
  initializeRoutingConfigs,
  SEVERITY_DEFAULTS,
} from "@/lib/routingDb";

/**
 * API endpoint to initialize routing and severity configurations in Firestore
 * 
 * Call this endpoint once to set up the system:
 * POST /api/admin/init-routing
 * 
 * Returns: { success: true, message: "Routing configurations initialized" }
 * 
 * Note: This should be protected by authentication in production
 */
export async function POST(req: Request) {
  try {
    // TODO: Add authentication check here
    // Example: Check Firebase Admin token
    
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.ADMIN_INIT_TOKEN;
    
    // Simple token-based auth for now
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await initializeRoutingConfigs();

    return NextResponse.json({
      success: true,
      message: "Routing and severity configurations initialized successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error initializing routing configs:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize configurations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check current routing configurations
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.ADMIN_INIT_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch and return current configs
    const routeConfigs = await fetchRouteConfigs();
    const severityDefaults = SEVERITY_DEFAULTS;

    return NextResponse.json({
      routeConfigs,
      severityDefaults,
      status: "initialized",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching routing configs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch configurations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

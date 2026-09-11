import { NextResponse } from "next/server";
import { getProviderConnections } from "@/lib/db/repos/connectionsRepo.js";
import { listActiveSessions } from "@/lib/sessions/sessionManager.js";
import { getAuditEvents } from "@/lib/audit/auditLogger.js";

export async function GET() {
  try {
    const connections = await getProviderConnections();
    const activeSessions = await listActiveSessions(10);
    const recentEvents = await getAuditEvents({ limit: 10 });

    const providerSummary = {};
    for (const c of connections) {
      if (!providerSummary[c.provider]) {
        providerSummary[c.provider] = {
          provider: c.provider,
          totalConnections: 0,
          activeConnections: 0,
          healthyConnections: 0,
          failingConnections: 0,
        };
      }
      providerSummary[c.provider].totalConnections++;
      if (c.isActive) providerSummary[c.provider].activeConnections++;
      if (c.testStatus === "active") {
        providerSummary[c.provider].healthyConnections++;
      } else if (c.testStatus === "failed" || c.testStatus === "unavailable" || c.lastError) {
        providerSummary[c.provider].failingConnections++;
      }
    }

    return NextResponse.json({
      success: true,
      status: "operational",
      timestamp: new Date().toISOString(),
      connections: connections.map((c) => ({
        id: c.id,
        name: c.name,
        provider: c.provider,
        authType: c.authType,
        priority: c.priority,
        isActive: c.isActive,
        testStatus: c.testStatus || "untested",
        lastError: c.lastError || null,
        lastErrorAt: c.lastErrorAt || null,
        rateLimitedUntil: c.rateLimitedUntil || null,
      })),
      providers: Object.values(providerSummary),
      activeSessionCount: activeSessions.length,
      recentAuditCount: recentEvents.length,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch health status" },
      { status: 500 }
    );
  }
}

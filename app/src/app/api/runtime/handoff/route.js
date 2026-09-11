import { NextResponse } from "next/server";
import { executeHandoff } from "@/lib/handoff/handoffManager.js";
import { getProviderConnections } from "@/lib/db/repos/connectionsRepo.js";
import { getSession } from "@/lib/sessions/sessionManager.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      projectId,
      fromModel,
      fromProvider,
      fromConnectionId,
      failureReason = "model_unavailable",
      failureDetails = null,
      candidates = null,
      classification = null,
      policy = null,
    } = body;

    let targetCandidates = candidates;
    if (!targetCandidates || targetCandidates.length === 0) {
      const conns = await getProviderConnections({ isActive: true });
      if (conns && conns.length > 0) {
        targetCandidates = conns.map((c) => ({
          model: c.defaultModel || (c.provider === "anthropic" ? "claude-3-5-sonnet" : "gpt-4o"),
          provider: c.provider,
          connectionId: c.id,
          healthScore: c.testStatus === "active" ? 95 : 80,
          costPerToken: 0.00001,
        }));
      }
    }

    const session = sessionId ? await getSession(sessionId) : null;

    const result = await executeHandoff({
      sessionId,
      projectId: projectId || session?.projectId || "default-project",
      fromModel: fromModel || session?.currentModel || "unknown",
      fromProvider: fromProvider || session?.provider || "unknown",
      fromConnectionId: fromConnectionId || session?.connectionId || "unknown",
      failureReason,
      failureDetails,
      availableCandidates: targetCandidates || [],
      classification,
      policy,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Model handoff execution failed" },
      { status: 500 }
    );
  }
}

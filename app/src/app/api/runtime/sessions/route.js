import { NextResponse } from "next/server";
import {
  listActiveSessions,
  createSession,
  getSession,
} from "@/lib/sessions/sessionManager.js";
import { auditLog } from "@/lib/audit/auditLogger.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const sessions = await listActiveSessions(limit);
    return NextResponse.json({ success: true, sessions });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to list sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      mode = "BUILD",
      model = null,
      provider = null,
      connectionId = null,
      projectId = null,
      routingReason = null,
      metadata = {},
    } = body;

    const session = await createSession({
      mode,
      model,
      provider,
      connectionId,
      projectId,
      routingReason,
      metadata,
    });

    await auditLog("session_started", {
      sessionId: session.id,
      projectId,
      model,
      provider,
      connectionId,
      details: { mode, pinnedModel: session.pinnedModel },
    });

    return NextResponse.json({ success: true, session });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create session" },
      { status: 500 }
    );
  }
}

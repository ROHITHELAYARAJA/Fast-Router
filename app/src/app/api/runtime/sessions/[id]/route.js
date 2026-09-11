import { NextResponse } from "next/server";
import {
  getSession,
  updateSessionStatus,
  pinModelToSession,
} from "@/lib/sessions/sessionManager.js";
import { auditLog } from "@/lib/audit/auditLogger.js";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession(id);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, session });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch session" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, pinnedModel, currentTaskId, checkpointId } = body;

    let session = await getSession(id);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    if (pinnedModel) {
      session = await pinModelToSession(id, pinnedModel);
      await auditLog("model_pinned", {
        sessionId: id,
        projectId: session.projectId,
        model: pinnedModel,
        details: { pinnedBy: "user_api" },
      });
    }

    if (status) {
      session = await updateSessionStatus(id, status, { currentTaskId, checkpointId });
    }

    return NextResponse.json({ success: true, session });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await updateSessionStatus(id, "completed");
    await auditLog("session_completed", { sessionId: id, projectId: session?.projectId });
    return NextResponse.json({ success: true, session });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to close session" },
      { status: 500 }
    );
  }
}

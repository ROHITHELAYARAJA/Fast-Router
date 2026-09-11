import { NextResponse } from "next/server";
import { getAuditEvents, auditLog } from "@/lib/audit/auditLogger.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const eventType = searchParams.get("eventType") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const events = await getAuditEvents({ sessionId, projectId, eventType, limit });
    return NextResponse.json({ success: true, events });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to query audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventType, ctx = {} } = body;
    if (!eventType) {
      return NextResponse.json({ success: false, error: "eventType is required" }, { status: 400 });
    }

    await auditLog(eventType, ctx);
    return NextResponse.json({ success: true, logged: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to write audit log" },
      { status: 500 }
    );
  }
}

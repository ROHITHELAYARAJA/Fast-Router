import { NextResponse } from "next/server";
import {
  createCheckpoint,
  listCheckpoints,
  getLatestCheckpoint,
} from "@/lib/checkpoints/checkpointManager.js";
import { getProject } from "@/lib/projects/projectManager.js";
import { auditLog } from "@/lib/audit/auditLogger.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || "default-project";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const checkpoints = await listCheckpoints(projectId, limit);
    return NextResponse.json({ success: true, checkpoints });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to list checkpoints" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      projectId = "default-project",
      sessionId = null,
      taskId = null,
      trigger = "manual",
      taskState = null,
      filesChanged = [],
      repositoryState = null,
      decisions = null,
      testResults = null,
      nextAction = null,
    } = body;

    // Load active project state to embed in checkpoint
    const project = (await getProject(projectId)) || {};

    const checkpoint = await createCheckpoint({
      projectId,
      sessionId,
      taskId,
      trigger,
      projectState: project,
      taskState,
      filesChanged: filesChanged.length > 0 ? filesChanged : project.filesChanged || [],
      repositoryState,
      decisions: decisions || project.decisions || [],
      testResults: testResults || project.testResults,
      nextAction: nextAction || project.nextAction,
    });

    await auditLog("checkpoint_created", {
      projectId,
      sessionId,
      taskId,
      checkpointId: checkpoint.id,
      details: { trigger, nextAction },
    });

    return NextResponse.json({ success: true, checkpoint });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create checkpoint" },
      { status: 500 }
    );
  }
}

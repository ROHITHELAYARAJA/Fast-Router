import { NextResponse } from "next/server";
import {
  getCheckpoint,
  markCheckpointRestored,
} from "@/lib/checkpoints/checkpointManager.js";
import { updateProject } from "@/lib/projects/projectManager.js";
import { auditLog } from "@/lib/audit/auditLogger.js";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const checkpoint = await getCheckpoint(id);
    if (!checkpoint) {
      return NextResponse.json({ success: false, error: "Checkpoint not found" }, { status: 404 });
    }

    // Restore project state from snapshot
    if (checkpoint.projectId && checkpoint.projectState) {
      await updateProject(checkpoint.projectId, {
        currentPhase: checkpoint.projectState.currentPhase,
        completedTasks: checkpoint.projectState.completedTasks,
        pendingTasks: checkpoint.projectState.pendingTasks,
        filesChanged: checkpoint.filesChanged || checkpoint.projectState.filesChanged,
        decisions: checkpoint.decisions || checkpoint.projectState.decisions,
        lastKnownGoodState: `Restored from checkpoint ${id} (${checkpoint.trigger})`,
        nextAction: checkpoint.nextAction || checkpoint.projectState.nextAction,
      });
    }

    await markCheckpointRestored(id);

    await auditLog("state_restored", {
      projectId: checkpoint.projectId,
      sessionId: checkpoint.sessionId,
      checkpointId: id,
      details: { trigger: checkpoint.trigger, nextAction: checkpoint.nextAction },
    });

    return NextResponse.json({
      success: true,
      restored: true,
      checkpointId: id,
      projectId: checkpoint.projectId,
      nextAction: checkpoint.nextAction,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to restore checkpoint" },
      { status: 500 }
    );
  }
}

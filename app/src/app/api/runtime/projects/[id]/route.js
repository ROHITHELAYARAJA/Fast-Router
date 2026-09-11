import { NextResponse } from "next/server";
import {
  getProject,
  updateProject,
  addProjectDecision,
  addProjectFile,
  completeProjectTask,
  buildHandoffContext,
} from "@/lib/projects/projectManager.js";
import { auditLog } from "@/lib/audit/auditLogger.js";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    const handoffContext = await buildHandoffContext(id);
    return NextResponse.json({ success: true, project, handoffContext });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Support convenient sub-actions: addDecision, addFile, completeTask
    if (body.addDecision) {
      const { title, rationale, alternatives = [] } = body.addDecision;
      const updated = await addProjectDecision(id, title, rationale, alternatives);
      await auditLog("decision_added", { projectId: id, details: { title } });
      return NextResponse.json({ success: true, project: updated });
    }

    if (body.addFile) {
      const { path, action = "modified" } = body.addFile;
      const updated = await addProjectFile(id, path, action);
      return NextResponse.json({ success: true, project: updated });
    }

    if (body.completeTask) {
      const { taskName, result = null } = body.completeTask;
      const updated = await completeProjectTask(id, taskName, result);
      await auditLog("task_completed", { projectId: id, details: { taskName } });
      return NextResponse.json({ success: true, project: updated });
    }

    const updated = await updateProject(id, body);
    return NextResponse.json({ success: true, project: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

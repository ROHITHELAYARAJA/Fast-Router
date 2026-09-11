import { NextResponse } from "next/server";
import { listProjects, createProject, getOrCreateProject } from "@/lib/projects/projectManager.js";
import { auditLog } from "@/lib/audit/auditLogger.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const projects = await listProjects(limit);
    return NextResponse.json({ success: true, projects });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to list projects" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      objective,
      currentPhase = "Initiation",
      architectureNotes = [],
      decisions = [],
      dependencies = {},
      filesChanged = [],
      completedTasks = [],
      pendingTasks = [],
      metadata = {},
    } = body;

    const project = await createProject({
      name: name || "Untitled Project",
      objective,
      currentPhase,
      architectureNotes,
      decisions,
      dependencies,
      filesChanged,
      completedTasks,
      pendingTasks,
      metadata,
    });

    await auditLog("project_created", {
      projectId: project.id,
      details: { name: project.name, objective },
    });

    return NextResponse.json({ success: true, project });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create project" },
      { status: 500 }
    );
  }
}

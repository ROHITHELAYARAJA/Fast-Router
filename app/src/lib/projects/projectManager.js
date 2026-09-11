/**
 * Fast-Router — Project State & Memory (Skill 8)
 *
 * Maintains persistent, structured project memory that survives model changes.
 * Source of truth hierarchy:
 *   Filesystem -> Project State -> Task State -> Checkpoints -> Model Context
 *
 * Stores:
 *   - Objective & current phase
 *   - Tasks (completed & pending)
 *   - Architecture notes & decisions
 *   - Files modified
 *   - Dependencies
 *   - Test & verification results
 *   - Error history & resolutions
 *   - Next recommended action
 */

import { getAdapter } from "@/lib/db/adapter.js";
import { v4 as uuidv4 } from "uuid";

const PROJECT_PREFIX = "proj_";
const TASK_PREFIX = "tsk_";

/**
 * Get or create a project by name or ID.
 */
export async function getOrCreateProject(nameOrId, opts = {}) {
  const db = await getAdapter();
  if (!nameOrId) nameOrId = "default-project";

  // Try finding by ID first
  let row = db.get("SELECT * FROM projects WHERE id = ?", [nameOrId]);
  if (row) return parseProject(row);

  // Try finding by name
  row = db.get("SELECT * FROM projects WHERE name = ? ORDER BY createdAt DESC LIMIT 1", [nameOrId]);
  if (row) return parseProject(row);

  // Create new project
  return createProject({ name: nameOrId, ...opts });
}

/**
 * Create a new project.
 */
export async function createProject(opts = {}) {
  const db = await getAdapter();
  const id = PROJECT_PREFIX + uuidv4().replace(/-/g, "").slice(0, 16);
  const now = new Date().toISOString();

  const {
    name = "Untitled Project",
    objective = null,
    currentPhase = "Initiation",
    architectureNotes = [],
    decisions = [],
    dependencies = {},
    filesChanged = [],
    completedTasks = [],
    pendingTasks = [],
    testResults = null,
    errorHistory = [],
    lastKnownGoodState = null,
    nextAction = null,
    metadata = {},
  } = opts;

  db.run(
    `INSERT INTO projects
      (id, name, objective, currentPhase, currentTaskId, architectureNotes, decisions,
       dependencies, filesChanged, completedTasks, pendingTasks, testResults, errorHistory,
       lastKnownGoodState, nextAction, metadata, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name,
      objective,
      currentPhase,
      null,
      JSON.stringify(architectureNotes),
      JSON.stringify(decisions),
      JSON.stringify(dependencies),
      JSON.stringify(filesChanged),
      JSON.stringify(completedTasks),
      JSON.stringify(pendingTasks),
      testResults ? JSON.stringify(testResults) : null,
      JSON.stringify(errorHistory),
      lastKnownGoodState,
      nextAction,
      JSON.stringify(metadata),
      now,
      now,
    ]
  );

  return getProject(id);
}

/**
 * Get project by ID.
 */
export async function getProject(id) {
  try {
    const db = await getAdapter();
    const row = db.get("SELECT * FROM projects WHERE id = ?", [id]);
    return row ? parseProject(row) : null;
  } catch {
    return null;
  }
}

/**
 * List all projects.
 */
export async function listProjects(limit = 50) {
  try {
    const db = await getAdapter();
    const rows = db.all("SELECT * FROM projects ORDER BY updatedAt DESC LIMIT ?", [limit]);
    return rows.map(parseProject);
  } catch {
    return [];
  }
}

/**
 * Update project state fields.
 */
export async function updateProject(id, updates = {}) {
  const db = await getAdapter();
  const project = await getProject(id);
  if (!project) return null;

  const now = new Date().toISOString();
  const setClauses = ["updatedAt = ?"];
  const params = [now];

  const jsonFields = [
    "architectureNotes",
    "decisions",
    "dependencies",
    "filesChanged",
    "completedTasks",
    "pendingTasks",
    "testResults",
    "errorHistory",
    "metadata",
  ];

  for (const [k, v] of Object.entries(updates)) {
    if (k === "id" || k === "createdAt") continue;
    setClauses.push(`${k} = ?`);
    if (jsonFields.includes(k)) {
      params.push(v ? JSON.stringify(v) : null);
    } else {
      params.push(v);
    }
  }

  params.push(id);
  db.run(`UPDATE projects SET ${setClauses.join(", ")} WHERE id = ?`, params);
  return getProject(id);
}

/**
 * Record a decision made during execution.
 */
export async function addProjectDecision(projectId, decision) {
  const project = await getProject(projectId);
  if (!project) return null;
  const decisions = project.decisions || [];
  const entry = {
    id: "dec_" + Date.now(),
    text: typeof decision === "string" ? decision : decision.text,
    rationale: decision.rationale || null,
    timestamp: new Date().toISOString(),
  };
  decisions.push(entry);
  return updateProject(projectId, { decisions });
}

/**
 * Record a file modified or created.
 */
export async function addProjectFile(projectId, filePath) {
  const project = await getProject(projectId);
  if (!project) return null;
  const files = new Set(project.filesChanged || []);
  files.add(filePath);
  return updateProject(projectId, { filesChanged: Array.from(files) });
}

/**
 * Mark a task as completed on the project.
 */
export async function completeProjectTask(projectId, taskName, result = null) {
  const project = await getProject(projectId);
  if (!project) return null;

  const completed = project.completedTasks || [];
  completed.push({
    name: taskName,
    result,
    completedAt: new Date().toISOString(),
  });

  const pending = (project.pendingTasks || []).filter(
    (t) => (typeof t === "string" ? t : t.name) !== taskName
  );

  return updateProject(projectId, {
    completedTasks: completed,
    pendingTasks: pending,
    lastKnownGoodState: `Completed task: ${taskName}`,
  });
}

/**
 * Build a structured Handoff Context Package (Skill 11).
 * Formats project state into a clean prompt context for incoming models.
 */
export async function buildHandoffContext(projectId) {
  const p = await getProject(projectId);
  if (!p) return null;

  return {
    projectId: p.id,
    name: p.name,
    objective: p.objective || "No explicit objective set",
    currentPhase: p.currentPhase || "In progress",
    completedTasks: (p.completedTasks || []).map((t) => (typeof t === "string" ? t : t.name)),
    pendingTasks: (p.pendingTasks || []).map((t) => (typeof t === "string" ? t : t.name)),
    filesChanged: p.filesChanged || [],
    decisions: p.decisions || [],
    testResults: p.testResults,
    lastKnownGoodState: p.lastKnownGoodState,
    nextAction: p.nextAction,
    summaryPrompt: [
      `# PROJECT CONTEXT: ${p.name}`,
      `Objective: ${p.objective || "In progress"}`,
      `Current Phase: ${p.currentPhase}`,
      `Last Known Good State: ${p.lastKnownGoodState || "Operational"}`,
      `Next Action: ${p.nextAction || "Continue planned implementation"}`,
      `Files Changed (${p.filesChanged?.length || 0}): ${p.filesChanged?.slice(-10).join(", ") || "none"}`,
      `Completed Tasks: ${(p.completedTasks || []).map((t) => (typeof t === "string" ? t : t.name)).join("; ") || "none"}`,
    ].join("\n"),
  };
}

function parseProject(row) {
  if (!row) return null;
  return {
    ...row,
    architectureNotes: safeParse(row.architectureNotes, []),
    decisions: safeParse(row.decisions, []),
    dependencies: safeParse(row.dependencies, {}),
    filesChanged: safeParse(row.filesChanged, []),
    completedTasks: safeParse(row.completedTasks, []),
    pendingTasks: safeParse(row.pendingTasks, []),
    testResults: safeParse(row.testResults, null),
    errorHistory: safeParse(row.errorHistory, []),
    metadata: safeParse(row.metadata, {}),
  };
}

function safeParse(val, fallback) {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

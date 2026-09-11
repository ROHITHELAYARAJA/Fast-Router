import { getAdapter } from "@/lib/db/adapter.js";
import { v4 as uuidv4 } from "uuid";

const TASK_PREFIX = "tsk_";

export async function createTask(projectId, opts = {}) {
  const db = await getAdapter();
  const id = TASK_PREFIX + uuidv4().replace(/-/g, "").slice(0, 16);
  const now = new Date().toISOString();

  const {
    sessionId = null,
    name = "Untitled Task",
    description = null,
    mode = "BUILD",
    status = "pending",
    model = null,
    provider = null,
    connectionId = null,
  } = opts;

  db.run(
    `INSERT INTO tasks
      (id, projectId, sessionId, name, description, mode, status, model, provider, connectionId, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, projectId, sessionId, name, description, mode, status, model, provider, connectionId, now, now]
  );

  return getTask(id);
}

export async function getTask(id) {
  try {
    const db = await getAdapter();
    const row = db.get("SELECT * FROM tasks WHERE id = ?", [id]);
    return row ? parseTask(row) : null;
  } catch {
    return null;
  }
}

export async function updateTask(id, updates = {}) {
  const db = await getAdapter();
  const now = new Date().toISOString();
  const setClauses = ["updatedAt = ?"];
  const params = [now];

  const jsonFields = ["result", "errorDetails", "filesChanged"];

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
  db.run(`UPDATE tasks SET ${setClauses.join(", ")} WHERE id = ?`, params);
  return getTask(id);
}

export async function listTasks(filter = {}) {
  try {
    const db = await getAdapter();
    const where = [];
    const params = [];
    if (filter.projectId) { where.push("projectId = ?"); params.push(filter.projectId); }
    if (filter.sessionId) { where.push("sessionId = ?"); params.push(filter.sessionId); }
    if (filter.status) { where.push("status = ?"); params.push(filter.status); }
    const sql = `SELECT * FROM tasks${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY createdAt ASC`;
    const rows = db.all(sql, params);
    return rows.map(parseTask);
  } catch {
    return [];
  }
}

function parseTask(row) {
  if (!row) return null;
  return {
    ...row,
    result: row.result ? JSON.parse(row.result) : null,
    errorDetails: row.errorDetails ? JSON.parse(row.errorDetails) : null,
    filesChanged: row.filesChanged ? JSON.parse(row.filesChanged) : [],
  };
}

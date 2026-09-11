/**
 * Fast-Router — Checkpoint Manager (Skill 9)
 *
 * Creates recoverable project snapshots at critical moments.
 *
 * Trigger points:
 *   - before_handoff      — immediately before switching models
 *   - milestone           — after completing an important task phase
 *   - before_deploy       — before any deployment action
 *   - after_deploy        — after successful deployment
 *   - recovery            — during or after a recovery sequence
 *   - manual              — user-initiated checkpoint
 *
 * Requirements: persistent, versioned, recoverable, inspectable, auditable.
 */

import { getAdapter } from "@/lib/db/adapter.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a checkpoint for a project/session.
 *
 * @param {object} opts
 * @param {string} opts.projectId
 * @param {string} opts.sessionId
 * @param {string} opts.taskId
 * @param {string} opts.trigger - before_handoff|milestone|before_deploy|after_deploy|recovery|manual
 * @param {object} opts.projectState - full project state to snapshot
 * @param {object} opts.taskState - current task state
 * @param {string[]} opts.filesChanged - list of modified file paths
 * @param {object} opts.decisions - important decisions up to this point
 * @param {object} opts.testResults - test results at this point
 * @param {string} opts.nextAction - what should happen after restore
 * @returns {object} checkpoint record
 */
export async function createCheckpoint(opts) {
  const db = await getAdapter();
  const id = 'chk_' + uuidv4().replace(/-/g, '').slice(0, 16);
  const now = new Date().toISOString();

  const {
    projectId,
    sessionId = null,
    taskId = null,
    trigger = 'manual',
    projectState = {},
    taskState = null,
    filesChanged = [],
    repositoryState = null,
    decisions = null,
    testResults = null,
    nextAction = null,
  } = opts;

  db.run(
    `INSERT INTO checkpoints
      (id, projectId, sessionId, taskId, trigger, projectState, taskState, filesChanged,
       repositoryState, decisions, testResults, nextAction, restoredAt, createdAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      projectId,
      sessionId,
      taskId,
      trigger,
      JSON.stringify(projectState),
      taskState ? JSON.stringify(taskState) : null,
      JSON.stringify(filesChanged),
      repositoryState ? JSON.stringify(repositoryState) : null,
      decisions ? JSON.stringify(decisions) : null,
      testResults ? JSON.stringify(testResults) : null,
      nextAction,
      null,
      now,
    ]
  );

  return getCheckpoint(id);
}

/**
 * Get a checkpoint by ID.
 */
export async function getCheckpoint(id) {
  try {
    const db = await getAdapter();
    const row = db.get('SELECT * FROM checkpoints WHERE id = ?', [id]);
    return row ? parseCheckpoint(row) : null;
  } catch {
    return null;
  }
}

/**
 * Get the latest checkpoint for a project/session.
 */
export async function getLatestCheckpoint(projectId, sessionId = null) {
  try {
    const db = await getAdapter();
    let sql = 'SELECT * FROM checkpoints WHERE projectId = ?';
    const params = [projectId];
    if (sessionId) { sql += ' AND sessionId = ?'; params.push(sessionId); }
    sql += ' ORDER BY createdAt DESC LIMIT 1';
    const row = db.get(sql, params);
    return row ? parseCheckpoint(row) : null;
  } catch {
    return null;
  }
}

/**
 * List checkpoints for a project.
 */
export async function listCheckpoints(projectId, limit = 20) {
  try {
    const db = await getAdapter();
    const rows = db.all(
      'SELECT * FROM checkpoints WHERE projectId = ? ORDER BY createdAt DESC LIMIT ?',
      [projectId, limit]
    );
    return rows.map(parseCheckpoint);
  } catch {
    return [];
  }
}

/**
 * Mark a checkpoint as restored (record when it was used for recovery).
 */
export async function markCheckpointRestored(checkpointId) {
  const db = await getAdapter();
  db.run(
    'UPDATE checkpoints SET restoredAt = ? WHERE id = ?',
    [new Date().toISOString(), checkpointId]
  );
}

function parseCheckpoint(row) {
  return {
    ...row,
    projectState: safeParseJSON(row.projectState, {}),
    taskState: safeParseJSON(row.taskState, null),
    filesChanged: safeParseJSON(row.filesChanged, []),
    repositoryState: safeParseJSON(row.repositoryState, null),
    decisions: safeParseJSON(row.decisions, null),
    testResults: safeParseJSON(row.testResults, null),
  };
}

function safeParseJSON(val, fallback) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

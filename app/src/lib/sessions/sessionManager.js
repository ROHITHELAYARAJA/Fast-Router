/**
 * Fast-Router — Session Manager (Skill 7)
 *
 * Manages stateful sessions. Every BUILD/RESEARCH task gets a session.
 * Sessions hold the pinned model, connection, and current project reference.
 *
 * Model pinning rules (BUILD):
 *   - Once a BUILD model is selected, it is PINNED to the session.
 *   - The runtime may rotate API keys and connections freely.
 *   - Changing the model requires a formal handoff (see handoffManager.js).
 *
 * Session ID delivery:
 *   - Via X-Fast-Router-Session-ID header
 *   - Via model string convention: "model@sess_{id}"
 *   - Auto-generated for new stateful requests
 */

import { getAdapter } from "@/lib/db/adapter.js";
import { v4 as uuidv4 } from "uuid";

const SESSION_PREFIX = 'sess_';

/**
 * Get or create a session.
 * @param {string|null} sessionId - From request header or null for new session
 * @param {object} opts - { mode, model, provider, connectionId, projectId, routingReason }
 * @returns {object} session row
 */
export async function getOrCreateSession(sessionId, opts = {}) {
  if (sessionId) {
    const existing = await getSession(sessionId);
    if (existing) return existing;
  }
  return createSession(opts);
}

/**
 * Get a session by ID.
 */
export async function getSession(id) {
  try {
    const db = await getAdapter();
    const row = db.get('SELECT * FROM sessions WHERE id = ?', [id]);
    return row ? parseSession(row) : null;
  } catch {
    return null;
  }
}

/**
 * Create a new session.
 */
export async function createSession(opts = {}) {
  const db = await getAdapter();
  const now = new Date().toISOString();
  const id = SESSION_PREFIX + uuidv4().replace(/-/g, '').slice(0, 16);
  const {
    mode = 'CHAT',
    model = null,
    provider = null,
    connectionId = null,
    projectId = null,
    routingReason = null,
    metadata = null,
  } = opts;

  const row = {
    id,
    workspaceId: null,
    projectId: projectId || null,
    mode,
    status: 'running',
    pinnedModel: mode === 'BUILD' ? model : null, // Only pin for BUILD
    currentModel: model,
    provider,
    connectionId,
    currentTaskId: null,
    checkpointId: null,
    routingReason: routingReason ? JSON.stringify(routingReason) : null,
    metadata: metadata ? JSON.stringify(metadata) : null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };

  db.run(
    `INSERT INTO sessions
      (id, workspaceId, projectId, mode, status, pinnedModel, currentModel, provider,
       connectionId, currentTaskId, checkpointId, routingReason, metadata, createdAt, updatedAt, completedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      row.id, row.workspaceId, row.projectId, row.mode, row.status,
      row.pinnedModel, row.currentModel, row.provider, row.connectionId,
      row.currentTaskId, row.checkpointId, row.routingReason, row.metadata,
      row.createdAt, row.updatedAt, row.completedAt,
    ]
  );

  return row;
}

/**
 * Pin a model to a session (BUILD mode only).
 * Does NOT change pinnedModel if one is already set — use handoff for that.
 */
export async function pinModelToSession(sessionId, model, provider, connectionId) {
  const db = await getAdapter();
  const session = await getSession(sessionId);
  if (!session) return null;
  if (session.mode !== 'BUILD') return session; // Only pin for BUILD
  if (session.pinnedModel) return session; // Already pinned — use handoff to change

  const now = new Date().toISOString();
  db.run(
    'UPDATE sessions SET pinnedModel = ?, currentModel = ?, provider = ?, connectionId = ?, updatedAt = ? WHERE id = ?',
    [model, model, provider, connectionId, now, sessionId]
  );
  return getSession(sessionId);
}

/**
 * Update the current model/connection on a session WITHOUT changing the pinned model.
 * Used for key rotation — same model, different key/connection.
 */
export async function rotateSessionConnection(sessionId, connectionId, provider = null) {
  const db = await getAdapter();
  const now = new Date().toISOString();
  const updates = ['connectionId = ?', 'updatedAt = ?'];
  const params = [connectionId, now];
  if (provider) { updates.push('provider = ?'); params.push(provider); }
  params.push(sessionId);
  db.run(`UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`, params);
  return getSession(sessionId);
}

/**
 * Update session status.
 */
export async function updateSessionStatus(sessionId, status, extra = {}) {
  const db = await getAdapter();
  const now = new Date().toISOString();
  const updates = ['status = ?', 'updatedAt = ?'];
  const params = [status, now];

  if (extra.checkpointId !== undefined) { updates.push('checkpointId = ?'); params.push(extra.checkpointId); }
  if (extra.currentTaskId !== undefined) { updates.push('currentTaskId = ?'); params.push(extra.currentTaskId); }
  if (extra.routingReason !== undefined) {
    updates.push('routingReason = ?');
    params.push(JSON.stringify(extra.routingReason));
  }
  if (status === 'completed' || status === 'failed') {
    updates.push('completedAt = ?');
    params.push(now);
  }
  params.push(sessionId);
  db.run(`UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`, params);
  return getSession(sessionId);
}

/**
 * Force-update the current model on a session (after a handoff completes).
 * This is the ONLY path to changing the current model — requires explicit call.
 */
export async function applyHandoffToSession(sessionId, newModel, newProvider, newConnectionId, checkpointId) {
  const db = await getAdapter();
  const now = new Date().toISOString();
  db.run(
    `UPDATE sessions SET
      currentModel = ?, provider = ?, connectionId = ?, pinnedModel = ?,
      checkpointId = ?, status = 'running', updatedAt = ?
     WHERE id = ?`,
    [newModel, newProvider, newConnectionId, newModel, checkpointId, now, sessionId]
  );
  return getSession(sessionId);
}

/**
 * List active sessions.
 */
export async function listActiveSessions(limit = 50) {
  try {
    const db = await getAdapter();
    const rows = db.all(
      "SELECT * FROM sessions WHERE status NOT IN ('completed', 'failed') ORDER BY updatedAt DESC LIMIT ?",
      [limit]
    );
    return rows.map(parseSession);
  } catch {
    return [];
  }
}

/**
 * Extract session ID from request headers.
 */
export function extractSessionId(request) {
  if (!request) return null;
  // Primary: X-Fast-Router-Session-ID header
  const header = request.headers?.get?.('x-fast-router-session-id') ||
                 request.headers?.['x-fast-router-session-id'];
  if (header) return header;
  return null;
}

function parseSession(row) {
  if (!row) return null;
  return {
    ...row,
    routingReason: row.routingReason ? JSON.parse(row.routingReason) : null,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  };
}

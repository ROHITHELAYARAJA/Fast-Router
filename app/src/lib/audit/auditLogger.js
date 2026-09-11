/**
 * Fast-Router — Audit Logger (Skill 18)
 *
 * Immutable event log for all runtime decisions.
 * NEVER write credentials, API keys, or tokens here.
 *
 * Event types:
 *   request_started | task_classified | model_selected | model_pinned |
 *   key_selected | key_failed | rate_limit | provider_failed |
 *   checkpoint_created | handoff_started | handoff_completed |
 *   session_started | session_resumed | task_completed | task_failed |
 *   recovery_attempted | verification_completed
 */

import { getAdapter } from "@/lib/db/adapter.js";

/**
 * Write an audit event. Fails silently — never throws.
 * @param {string} eventType
 * @param {object} ctx - { sessionId, projectId, taskId, handoffId, checkpointId, model, provider, connectionId, details }
 */
export async function auditLog(eventType, ctx = {}) {
  try {
    const db = await getAdapter();
    const timestamp = new Date().toISOString();
    const {
      sessionId = null,
      projectId = null,
      taskId = null,
      handoffId = null,
      checkpointId = null,
      model = null,
      provider = null,
      connectionId = null,
      details = null,
    } = ctx;

    // Sanitize details — strip any credential-looking fields
    const safeDetails = sanitizeDetails(details);

    db.run(
      `INSERT INTO auditLog
        (timestamp, eventType, sessionId, projectId, taskId, handoffId, checkpointId, model, provider, connectionId, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        timestamp,
        eventType,
        sessionId,
        projectId,
        taskId,
        handoffId,
        checkpointId,
        model,
        provider,
        connectionId,
        safeDetails ? JSON.stringify(safeDetails) : null,
      ]
    );
  } catch {
    // Audit logging must never crash the runtime
  }
}

/** Remove credential-looking keys from details object before logging */
function sanitizeDetails(details) {
  if (!details || typeof details !== 'object') return details;
  const REDACTED_KEYS = new Set([
    'apiKey', 'api_key', 'key', 'secret', 'password', 'token',
    'accessToken', 'refreshToken', 'access_token', 'refresh_token',
    'credential', 'credentials', 'authorization', 'bearer',
  ]);
  const result = {};
  for (const [k, v] of Object.entries(details)) {
    if (REDACTED_KEYS.has(k.toLowerCase())) {
      result[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      result[k] = sanitizeDetails(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

/**
 * Query recent audit events.
 * @param {object} filter - { sessionId, projectId, eventType, limit }
 * @returns {Array}
 */
export async function getAuditEvents(filter = {}) {
  try {
    const db = await getAdapter();
    const where = [];
    const params = [];
    if (filter.sessionId) { where.push('sessionId = ?'); params.push(filter.sessionId); }
    if (filter.projectId) { where.push('projectId = ?'); params.push(filter.projectId); }
    if (filter.eventType) { where.push('eventType = ?'); params.push(filter.eventType); }
    const limit = filter.limit || 100;
    const sql = `SELECT * FROM auditLog${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY timestamp DESC LIMIT ?`;
    params.push(limit);
    const rows = db.all(sql, params);
    return rows.map(r => ({
      ...r,
      details: r.details ? JSON.parse(r.details) : null,
    }));
  } catch {
    return [];
  }
}

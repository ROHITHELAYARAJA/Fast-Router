/**
 * Fast-Router — Model Handoff & Recovery (Skill 11)
 *
 * Controlled state transition between models when a model or its connections fail.
 *
 * Sequence:
 *   1. Failure detected (all keys/accounts for current model exhausted)
 *   2. Take snapshot checkpoint (Skill 9: trigger = 'before_handoff')
 *   3. Record audit event (Skill 18: 'handoff_started')
 *   4. Select replacement model with EQUIVALENT capability floor (Skill 5)
 *   5. Prepare structured handoff package from Project Memory (Skill 8)
 *   6. Update session to new model & connection (Skill 7)
 *   7. Record audit event ('handoff_completed')
 *   8. Resume execution seamlessly — receiver does NOT restart from scratch
 *
 * RULE: If no compatible model exists, pause the session and notify user.
 * Never silently downgrade to an inadequate model.
 */

import { getAdapter } from "@/lib/db/adapter.js";
import { v4 as uuidv4 } from "uuid";
import { createCheckpoint } from "@/lib/checkpoints/checkpointManager.js";
import { auditLog } from "@/lib/audit/auditLogger.js";
import { applyHandoffToSession, updateSessionStatus } from "@/lib/sessions/sessionManager.js";
import { buildHandoffContext, getProject } from "@/lib/projects/projectManager.js";
import { selectModel } from "@/lib/routing/capabilityRouter.js";

const HANDOFF_PREFIX = "ho_";

/**
 * Execute a structured model handoff.
 *
 * @param {object} params
 * @param {string} params.sessionId
 * @param {string|null} params.projectId
 * @param {string} params.fromModel
 * @param {string} params.fromProvider
 * @param {string} params.fromConnectionId
 * @param {string} params.failureReason - rate_limit|quota|auth|timeout|network|model_unavailable
 * @param {any} params.failureDetails
 * @param {Array} params.availableCandidates - All currently configured candidate accounts/models
 * @param {object|null} params.classification - Task classification (mode, requirements)
 * @param {object|null} params.policy - Runtime routing policy
 *
 * @returns {Promise<{ success: boolean, handoffId: string, toModel?: string, toProvider?: string, toConnectionId?: string, handoffPackage?: object, error?: string }>}
 */
export async function executeHandoff(params) {
  const db = await getAdapter();
  const handoffId = HANDOFF_PREFIX + uuidv4().replace(/-/g, "").slice(0, 16);
  const now = new Date().toISOString();

  const {
    sessionId,
    projectId,
    fromModel,
    fromProvider,
    fromConnectionId,
    failureReason = "model_unavailable",
    failureDetails = null,
    availableCandidates = [],
    classification = { mode: "BUILD", requirements: { coding: true, tools: true, contextMin: 32000, outputMin: 4000 } },
    policy = null,
  } = params;

  // 1. Audit start
  await auditLog("handoff_started", {
    sessionId,
    projectId,
    handoffId,
    model: fromModel,
    provider: fromProvider,
    connectionId: fromConnectionId,
    details: { failureReason },
  });

  // 2. Fetch project context if available
  let projectState = {};
  if (projectId) {
    const proj = await getProject(projectId);
    if (proj) projectState = proj;
  }

  // 3. Create pre-handoff checkpoint
  const checkpoint = await createCheckpoint({
    projectId: projectId || "global",
    sessionId,
    trigger: "before_handoff",
    projectState,
    decisions: projectState.decisions || [],
    filesChanged: projectState.filesChanged || [],
    nextAction: `Model handoff from ${fromModel} due to ${failureReason}`,
  });

  // 4. Filter out the failed model
  const alternateCandidates = availableCandidates.filter(
    (c) => c.model !== fromModel || c.connectionId !== fromConnectionId
  );

  // 5. Select compatible replacement
  const routing = selectModel(classification, alternateCandidates, policy, null);

  if (!routing.selected) {
    // No replacement model meets the capability floor
    await updateSessionStatus(sessionId, "paused", {
      checkpointId: checkpoint.id,
      routingReason: routing.explanation,
    });

    db.run(
      `INSERT INTO handoffs
        (id, sessionId, projectId, checkpointId, fromModel, fromProvider, fromConnectionId,
         toModel, toProvider, toConnectionId, failureReason, failureDetails,
         recoveryAttempted, handoffPackage, verificationResult, status, startedAt, completedAt, createdAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        handoffId,
        sessionId || null,
        projectId || null,
        checkpoint.id,
        fromModel || null,
        fromProvider || null,
        fromConnectionId || null,
        null, null, null,
        failureReason || null,
        failureDetails ? JSON.stringify(failureDetails) : null,
        1, null, null, "failed", now, now, now,
      ]
    );

    await auditLog("handoff_failed", {
      sessionId: sessionId || null,
      projectId: projectId || null,
      handoffId,
      model: fromModel,
      provider: fromProvider,
      details: { reason: "No compatible model satisfies capability requirements", rejected: routing.explanation.rejected },
    });

    return {
      success: false,
      handoffId,
      checkpointId: checkpoint.id,
      error: "NO_COMPATIBLE_MODEL",
      explanation: routing.explanation,
    };
  }

  const replacement = routing.selected;

  // 6. Build handoff package for receiving model
  const handoffPackage = projectId
    ? await buildHandoffContext(projectId)
    : {
        sessionId,
        fromModel,
        replacementModel: replacement.model,
        checkpointId: checkpoint.id,
        reason: failureReason,
      };

  // 7. Apply to session
  if (sessionId) {
    await applyHandoffToSession(
      sessionId,
      replacement.model,
      replacement.provider,
      replacement.connectionId,
      checkpoint.id
    );
  }

  // 8. Record completed handoff
  db.run(
    `INSERT INTO handoffs
      (id, sessionId, projectId, checkpointId, fromModel, fromProvider, fromConnectionId,
       toModel, toProvider, toConnectionId, failureReason, failureDetails,
       recoveryAttempted, handoffPackage, verificationResult, status, startedAt, completedAt, createdAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      handoffId,
      sessionId || null,
      projectId || null,
      checkpoint.id,
      fromModel || null,
      fromProvider || null,
      fromConnectionId || null,
      replacement.model || null,
      replacement.provider || null,
      replacement.connectionId || null,
      failureReason || null,
      failureDetails ? JSON.stringify(failureDetails) : null,
      1,
      JSON.stringify(handoffPackage),
      JSON.stringify({ verified: true }),
      "completed",
      now,
      new Date().toISOString(),
      now,
    ]
  );

  // 9. Audit completion
  await auditLog("handoff_completed", {
    sessionId,
    projectId,
    handoffId,
    checkpointId: checkpoint.id,
    model: replacement.model,
    provider: replacement.provider,
    connectionId: replacement.connectionId,
    details: {
      fromModel,
      toModel: replacement.model,
      reason: failureReason,
    },
  });

  return {
    success: true,
    handoffId,
    checkpointId: checkpoint.id,
    toModel: replacement.model,
    toProvider: replacement.provider,
    toConnectionId: replacement.connectionId,
    handoffPackage,
  };
}

/**
 * Get handoff history for a session or project.
 */
export async function getHandoffs(filter = {}) {
  try {
    const db = await getAdapter();
    const where = [];
    const params = [];
    if (filter.sessionId) { where.push("sessionId = ?"); params.push(filter.sessionId); }
    if (filter.projectId) { where.push("projectId = ?"); params.push(filter.projectId); }
    const sql = `SELECT * FROM handoffs${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY createdAt DESC LIMIT 50`;
    const rows = db.all(sql, params);
    return rows.map((r) => ({
      ...r,
      handoffPackage: r.handoffPackage ? JSON.parse(r.handoffPackage) : null,
      verificationResult: r.verificationResult ? JSON.parse(r.verificationResult) : null,
      failureDetails: r.failureDetails ? JSON.parse(r.failureDetails) : null,
    }));
  } catch {
    return [];
  }
}

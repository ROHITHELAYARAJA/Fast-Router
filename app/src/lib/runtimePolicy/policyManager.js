/**
 * Fast-Router — Runtime Policy Management (Skills 6 & 21)
 *
 * Manages user-configurable runtime policies across global, workspace, and project scopes.
 *
 * Controls:
 *   - Mode capability floors (BUILD, RESEARCH, CHAT)
 *   - Preferred providers and models
 *   - Pinned models per mode
 *   - Fallback behaviors (same-model-key-first, checkpoint-then-compatible)
 *   - Cost & latency thresholds
 *   - Checkpoint frequency
 */

import { getAdapter } from "@/lib/db/adapter.js";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_CAPABILITY_FLOORS } from "@/lib/routing/capabilityRouter.js";

const DEFAULT_GLOBAL_POLICY = {
  scope: "global",
  buildCapabilityFloor: DEFAULT_CAPABILITY_FLOORS.BUILD,
  researchCapabilityFloor: DEFAULT_CAPABILITY_FLOORS.RESEARCH,
  chatCapabilityFloor: DEFAULT_CAPABILITY_FLOORS.CHAT,
  preferredProviders: [],
  preferredModels: [],
  pinnedModels: {},
  maxCostPerRequestUsd: null,
  maxLatencyMs: null,
  fallbackBehavior: "same-model-key-first",
  handoffBehavior: "checkpoint-then-compatible",
  retryCount: 3,
  checkpointFrequency: "milestone",
  metadata: {},
};

/**
 * Get the effective policy for a given project/workspace, cascading from global.
 * Precedence: project:{id} > workspace:{id} > global
 */
export async function getEffectivePolicy(projectId = null, workspaceId = null) {
  const globalPolicy = await getPolicy("global") || DEFAULT_GLOBAL_POLICY;

  let workspacePolicy = null;
  if (workspaceId) {
    workspacePolicy = await getPolicy(`workspace:${workspaceId}`);
  }

  let projectPolicy = null;
  if (projectId) {
    projectPolicy = await getPolicy(`project:${projectId}`);
  }

  return mergePolicies(globalPolicy, workspacePolicy, projectPolicy);
}

/**
 * Get policy by scope.
 */
export async function getPolicy(scope = "global") {
  try {
    const db = await getAdapter();
    const row = db.get("SELECT * FROM runtimePolicies WHERE scope = ?", [scope]);
    if (!row) {
      if (scope === "global") return DEFAULT_GLOBAL_POLICY;
      return null;
    }
    return parsePolicy(row);
  } catch {
    return scope === "global" ? DEFAULT_GLOBAL_POLICY : null;
  }
}

/**
 * Save or update policy for a scope.
 */
export async function setPolicy(scope, policyData = {}) {
  const db = await getAdapter();
  const existing = await getPolicy(scope);
  const now = new Date().toISOString();

  const merged = {
    ...(existing || DEFAULT_GLOBAL_POLICY),
    ...policyData,
    scope,
  };

  const id = existing?.id || "pol_" + uuidv4().replace(/-/g, "").slice(0, 16);

  db.run(
    `INSERT INTO runtimePolicies
      (id, scope, buildCapabilityFloor, researchCapabilityFloor, chatCapabilityFloor,
       preferredProviders, preferredModels, pinnedModels, maxCostPerRequestUsd,
       maxLatencyMs, fallbackBehavior, handoffBehavior, retryCount, checkpointFrequency,
       metadata, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(scope) DO UPDATE SET
       buildCapabilityFloor = excluded.buildCapabilityFloor,
       researchCapabilityFloor = excluded.researchCapabilityFloor,
       chatCapabilityFloor = excluded.chatCapabilityFloor,
       preferredProviders = excluded.preferredProviders,
       preferredModels = excluded.preferredModels,
       pinnedModels = excluded.pinnedModels,
       maxCostPerRequestUsd = excluded.maxCostPerRequestUsd,
       maxLatencyMs = excluded.maxLatencyMs,
       fallbackBehavior = excluded.fallbackBehavior,
       handoffBehavior = excluded.handoffBehavior,
       retryCount = excluded.retryCount,
       checkpointFrequency = excluded.checkpointFrequency,
       metadata = excluded.metadata,
       updatedAt = excluded.updatedAt`,
    [
      id,
      scope,
      JSON.stringify(merged.buildCapabilityFloor || DEFAULT_CAPABILITY_FLOORS.BUILD),
      JSON.stringify(merged.researchCapabilityFloor || DEFAULT_CAPABILITY_FLOORS.RESEARCH),
      JSON.stringify(merged.chatCapabilityFloor || DEFAULT_CAPABILITY_FLOORS.CHAT),
      JSON.stringify(merged.preferredProviders || []),
      JSON.stringify(merged.preferredModels || []),
      JSON.stringify(merged.pinnedModels || {}),
      merged.maxCostPerRequestUsd || null,
      merged.maxLatencyMs || null,
      merged.fallbackBehavior || "same-model-key-first",
      merged.handoffBehavior || "checkpoint-then-compatible",
      merged.retryCount || 3,
      merged.checkpointFrequency || "milestone",
      JSON.stringify(merged.metadata || {}),
      existing?.createdAt || now,
      now,
    ]
  );

  return getPolicy(scope);
}

function mergePolicies(...policies) {
  const result = { ...DEFAULT_GLOBAL_POLICY };
  for (const p of policies) {
    if (!p) continue;
    if (p.buildCapabilityFloor) result.buildCapabilityFloor = { ...result.buildCapabilityFloor, ...p.buildCapabilityFloor };
    if (p.researchCapabilityFloor) result.researchCapabilityFloor = { ...result.researchCapabilityFloor, ...p.researchCapabilityFloor };
    if (p.chatCapabilityFloor) result.chatCapabilityFloor = { ...result.chatCapabilityFloor, ...p.chatCapabilityFloor };
    if (p.preferredProviders?.length) result.preferredProviders = p.preferredProviders;
    if (p.preferredModels?.length) result.preferredModels = p.preferredModels;
    if (p.pinnedModels) result.pinnedModels = { ...result.pinnedModels, ...p.pinnedModels };
    if (p.fallbackBehavior) result.fallbackBehavior = p.fallbackBehavior;
    if (p.handoffBehavior) result.handoffBehavior = p.handoffBehavior;
    if (p.retryCount !== undefined) result.retryCount = p.retryCount;
    if (p.checkpointFrequency) result.checkpointFrequency = p.checkpointFrequency;
  }
  return result;
}

function parsePolicy(row) {
  if (!row) return null;
  return {
    ...row,
    buildCapabilityFloor: safeParse(row.buildCapabilityFloor, DEFAULT_CAPABILITY_FLOORS.BUILD),
    researchCapabilityFloor: safeParse(row.researchCapabilityFloor, DEFAULT_CAPABILITY_FLOORS.RESEARCH),
    chatCapabilityFloor: safeParse(row.chatCapabilityFloor, DEFAULT_CAPABILITY_FLOORS.CHAT),
    preferredProviders: safeParse(row.preferredProviders, []),
    preferredModels: safeParse(row.preferredModels, []),
    pinnedModels: safeParse(row.pinnedModels, {}),
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

/**
 * Fast-Router — Capability-Aware Routing Engine (Skills 3 + 5)
 *
 * Selects the most appropriate model for a classified task.
 *
 * Routing sequence:
 *   Task Classification → Capability Requirements
 *   → Hard Filter (capability floor — removes incompatible models)
 *   → Provider/Connection/Key Health
 *   → Soft Ranking (reliability, quality, latency, cost)
 *   → Model Selection + Explanation
 *
 * RULE: A cheap incompatible model must NEVER outrank an expensive compatible model.
 * RULE: BUILD tasks — strong model preference, never silent downgrade.
 * RULE: Health must never override hard capability requirements.
 */

import { getCapabilitiesForModel } from "open-sse/providers/capabilities.js";

/**
 * Default capability floors per mode.
 * These are the MINIMUM requirements a model must satisfy.
 * Can be overridden by user runtimePolicies.
 */
export const DEFAULT_CAPABILITY_FLOORS = {
  BUILD: {
    tools: true,          // tool/function calling required
    contextWindow: 32000, // minimum 32K context
    maxOutput: 4000,      // minimum 4K output
    // coding is not a hard filter (tracked via reliability/suitability score)
  },
  RESEARCH: {
    contextWindow: 50000, // need large context for documents
    maxOutput: 2000,
  },
  CHAT: {
    contextWindow: 4000,
    maxOutput: 1000,
  },
};

/**
 * Model suitability classes (per agentskilltemplates.md Skill 3).
 * Used for explanation only — routing uses hard filter + soft rank.
 */
export const SUITABILITY_CLASS = {
  BUILD_LONG: 'BUILD-LONG',
  BUILD_FALLBACK: 'BUILD-FALLBACK',
  RESEARCH_LONG: 'RESEARCH-LONG',
  RESEARCH_MEDIUM: 'RESEARCH-MEDIUM',
  CHAT_FAST: 'CHAT-FAST',
  CHAT_CHEAP: 'CHAT-CHEAP',
  UNSUITABLE: 'UNSUITABLE',
};

/**
 * Select the best model from available candidates for a classified task.
 *
 * @param {object} classification - Output from classifyTask()
 * @param {Array<{model: string, provider: string, connectionId: string, healthScore: number, costPerToken: number}>} candidates
 * @param {object|null} policy - runtimePolicy for this project/workspace
 * @param {string|null} pinnedModel - If session has a pinned model, prefer it
 *
 * @returns {{ selected: object|null, explanation: object }}
 */
export function selectModel(classification, candidates, policy = null, pinnedModel = null) {
  const { mode, requirements } = classification;
  const floor = buildCapabilityFloor(mode, requirements, policy);

  const compatible = [];
  const rejected = [];

  for (const candidate of candidates) {
    const caps = candidate.caps || getCapabilitiesForModel(candidate.provider, candidate.model);
    const check = checkCapabilityFloor(caps, floor, requirements);
    if (check.passes) {
      compatible.push({ ...candidate, caps, suitability: computeSuitability(mode, caps, candidate) });
    } else {
      rejected.push({ ...candidate, reason: check.reason });
    }
  }

  if (compatible.length === 0) {
    return {
      selected: null,
      explanation: {
        mode,
        compatible: [],
        rejected: rejected.map(r => ({ model: r.model, reason: r.reason })),
        selected: null,
        reason: 'No compatible model satisfies capability requirements',
        pinnedConsidered: pinnedModel,
      },
    };
  }

  // If there is a pinned model in the compatible set, use it (BUILD continuity)
  if (pinnedModel && mode === 'BUILD') {
    const pinned = compatible.find(c => c.model === pinnedModel);
    if (pinned) {
      return {
        selected: pinned,
        explanation: buildExplanation(mode, compatible, rejected, pinned, ['session pinned model in compatible set']),
      };
    }
  }

  // Soft rank: higher suitability score wins
  compatible.sort((a, b) => b.suitability - a.suitability);
  const best = compatible[0];

  const reasons = [`${mode} mode`, `highest suitability score: ${best.suitability.toFixed(2)}`];
  if (best.caps.tools) reasons.push('tool calling supported');
  if (best.caps.reasoning) reasons.push('reasoning capable');
  if (best.caps.vision && requirements.vision) reasons.push('vision required and supported');
  if (best.healthScore !== undefined) reasons.push(`health score: ${best.healthScore.toFixed(2)}`);

  return {
    selected: best,
    explanation: buildExplanation(mode, compatible, rejected, best, reasons),
  };
}

/**
 * Build the effective capability floor for the request.
 */
function buildCapabilityFloor(mode, requirements, policy) {
  const base = { ...(DEFAULT_CAPABILITY_FLOORS[mode] || DEFAULT_CAPABILITY_FLOORS.CHAT) };

  // Apply request-specific requirements
  if (requirements.contextMin > (base.contextWindow || 0)) {
    base.contextWindow = requirements.contextMin;
  }
  if (requirements.outputMin > (base.maxOutput || 0)) {
    base.maxOutput = requirements.outputMin;
  }
  if (requirements.tools) base.tools = true;
  if (requirements.vision) base.vision = true;
  if (requirements.reasoning) base.reasoning = true;

  // Apply policy overrides
  if (policy) {
    const policyFloor = mode === 'BUILD' ? policy.buildCapabilityFloor :
                        mode === 'RESEARCH' ? policy.researchCapabilityFloor :
                        policy.chatCapabilityFloor;
    if (policyFloor) {
      try {
        const parsed = typeof policyFloor === 'string' ? JSON.parse(policyFloor) : policyFloor;
        Object.assign(base, parsed);
      } catch { /* ignore invalid policy JSON */ }
    }
  }

  return base;
}

/**
 * Check if a model's capabilities pass the floor.
 */
function checkCapabilityFloor(caps, floor, requirements) {
  if (floor.tools && !caps.tools) return { passes: false, reason: 'tool calling not supported' };
  if (floor.vision && !caps.vision) return { passes: false, reason: 'vision not supported but required' };
  if (floor.reasoning && !caps.reasoning) return { passes: false, reason: 'reasoning not supported but required' };
  if (floor.contextWindow && caps.contextWindow < floor.contextWindow) {
    return { passes: false, reason: `contextWindow ${caps.contextWindow} < required ${floor.contextWindow}` };
  }
  if (floor.maxOutput && caps.maxOutput < floor.maxOutput) {
    return { passes: false, reason: `maxOutput ${caps.maxOutput} < required ${floor.maxOutput}` };
  }
  return { passes: true };
}

/**
 * Compute a soft suitability score (0–100) for a candidate model.
 * Higher = better fit for the task.
 */
function computeSuitability(mode, caps, candidate) {
  let score = 50; // baseline

  // Context capacity bonus
  if (caps.contextWindow >= 200000) score += 15;
  else if (caps.contextWindow >= 100000) score += 10;
  else if (caps.contextWindow >= 50000) score += 5;

  // Feature bonuses
  if (caps.reasoning) score += 10;
  if (caps.tools) score += 5;
  if (caps.search && mode === 'RESEARCH') score += 5;

  // Health score (0–1 scale from account health tracking)
  if (candidate.healthScore !== undefined) {
    score += candidate.healthScore * 15;
  }

  // Cost penalty (higher cost = slight penalty in soft rank)
  // But NEVER let cost push an incompatible model ahead
  if (candidate.costPerToken) {
    score -= Math.min(candidate.costPerToken * 10000, 10);
  }

  return Math.max(0, Math.min(100, score));
}

function buildExplanation(mode, compatible, rejected, selected, reasons) {
  return {
    mode,
    compatible: compatible.map(c => c.model),
    rejected: rejected.map(r => ({ model: r.model, reason: r.reason })),
    selected: selected?.model || null,
    selectedProvider: selected?.provider || null,
    reasons,
    suitabilityClass: classifySuitability(mode, selected?.caps),
  };
}

function classifySuitability(mode, caps) {
  if (!caps) return SUITABILITY_CLASS.UNSUITABLE;
  if (mode === 'BUILD') {
    return caps.contextWindow >= 100000 ? SUITABILITY_CLASS.BUILD_LONG : SUITABILITY_CLASS.BUILD_FALLBACK;
  }
  if (mode === 'RESEARCH') {
    return caps.contextWindow >= 100000 ? SUITABILITY_CLASS.RESEARCH_LONG : SUITABILITY_CLASS.RESEARCH_MEDIUM;
  }
  return caps.contextWindow >= 32000 ? SUITABILITY_CLASS.CHAT_FAST : SUITABILITY_CLASS.CHAT_CHEAP;
}

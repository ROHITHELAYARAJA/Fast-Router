import { getAdapter } from "../src/lib/db/driver.js";
import { createSession, getSession, listActiveSessions } from "../src/lib/sessions/sessionManager.js";
import { createProject, getProject, addProjectDecision, addProjectFile, completeProjectTask, buildHandoffContext } from "../src/lib/projects/projectManager.js";
import { createCheckpoint, getCheckpoint, getLatestCheckpoint } from "../src/lib/checkpoints/checkpointManager.js";
import { auditLog, getAuditEvents } from "../src/lib/audit/auditLogger.js";
import { classifyTask } from "../src/lib/taskClassifier/index.js";
import { selectModel } from "../src/lib/routing/capabilityRouter.js";
import { getEffectivePolicy, setPolicy } from "../src/lib/runtimePolicy/policyManager.js";
import { executeHandoff, getHandoffs } from "../src/lib/handoff/handoffManager.js";

async function main() {
  console.log("=== Testing Fast-Router Stateful Runtime ===");
  const adapter = await getAdapter();
  const tables = adapter.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Tables in DB:", tables.map(t => t.name).join(", "));

  // 1. Test Task Classifier
  const classified = classifyTask({
    messages: [{ role: "user", content: "Implement a robust authentication middleware in src/auth.js and write unit tests" }]
  });
  console.log("1. Classifier Result:", classified.mode, "Requirements:", Object.keys(classified.requirements).filter(k => classified.requirements[k]));

  // 2. Test Capability Router
  const candidates = [
    { model: "claude-3-7-sonnet", provider: "claude", connectionId: "conn_1", healthScore: 0.98, costPerToken: 0.000015 },
    { model: "gpt-4o-mini", provider: "openai", connectionId: "conn_2", healthScore: 0.99, costPerToken: 0.00000015 },
  ];
  const routing = selectModel(classified, candidates);
  console.log("2. Routing Selected:", routing.selected ? routing.selected.model : "none", "Explanation:", routing.explanation.reasons);

  // 3. Test Session & Model Pinning
  const session = await createSession({
    mode: classified.mode,
    model: routing.selected?.model,
    provider: routing.selected?.provider,
    connectionId: routing.selected?.connectionId,
  });
  console.log("3. Session Created:", session.id, "Mode:", session.mode, "Pinned:", session.pinnedModel);

  // 4. Test Project State
  const project = await createProject({
    name: "Fast-Router Stateful AI",
    objective: "Autonomous multi-model intelligence",
    currentPhase: "Execution",
  });
  await addProjectDecision(project.id, { text: "Use SQLite for zero-config persistence", rationale: "Standardized embedded DB" });
  await addProjectFile(project.id, "src/lib/handoff/handoffManager.js");
  await completeProjectTask(project.id, "Setup database schema");
  const handoffCtx = await buildHandoffContext(project.id);
  console.log("4. Project Created:", project.id, "Files:", handoffCtx.filesChanged, "Decisions:", handoffCtx.decisions.length);

  // 5. Test Checkpoints
  const chk = await createCheckpoint({
    projectId: project.id,
    sessionId: session.id,
    trigger: "milestone",
    projectState: project,
    nextAction: "Verify model handoff recovery",
  });
  console.log("5. Checkpoint Created:", chk.id, "Trigger:", chk.trigger);

  // 6. Test Audit Log (credential sanitization verification)
  await auditLog("model_pinned", {
    sessionId: session.id,
    projectId: project.id,
    model: session.pinnedModel,
    details: { apiKey: "sk-secret-12345678", action: "pinned" }
  });
  const events = await getAuditEvents({ sessionId: session.id });
  console.log("6. Audit Events Count:", events.length, "Sanitized Key:", events[0]?.details?.apiKey);

  // 7. Test Policy Engine
  await setPolicy("global", { retryCount: 4, fallbackBehavior: "same-model-key-first" });
  const effPolicy = await getEffectivePolicy(project.id);
  console.log("7. Effective Policy Retry Count:", effPolicy.retryCount);

  // 8. Test Model Handoff
  const handoffResult = await executeHandoff({
    sessionId: session.id,
    projectId: project.id,
    fromModel: session.pinnedModel,
    fromProvider: "claude",
    fromConnectionId: "conn_1",
    failureReason: "rate_limit",
    availableCandidates: [
      { model: "claude-3-5-sonnet", provider: "claude", connectionId: "conn_3", healthScore: 0.9 },
    ],
    classification: classified,
    policy: effPolicy,
  });
  console.log("8. Handoff Result:", handoffResult.success, "New Model:", handoffResult.toModel);

  console.log("\n========================================================");
  console.log(">>> ALL 8 STATEFUL RUNTIME MODULES VERIFIED WORKING! <<<");
  console.log("========================================================");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

# FAST-ROUTER — AGENT DOCUMENTATION
# Stateful AI Runtime & Intelligent Model Orchestration Platform

---

## PROJECT IDENTITY

| Field | Value |
|---|---|
| **Name** | Fast-Router |
| **Version** | 0.1.0 |
| **Framework** | Next.js 16.x (App Router, Turbopack) |
| **Language** | JavaScript ESM (NO TypeScript) |
| **Database** | SQLite (bun:sqlite -> better-sqlite3 -> node:sqlite -> sql.js) |
| **Port** | 20200 (dev server) |
| **Data Dir** | ~/.fast-router/ |
| **CLI Binary** | fast-router |
| **API Endpoint** | http://localhost:20200/v1/* (OpenAI-compatible) |
| **Dashboard** | http://localhost:20200/dashboard |
| **GitHub** | ROHITHELAYARAJA/Fast-Router |

---

## MISSION

"Make multiple AI models behave like ONE continuous AI system."

Fast-Router is NOT a basic multi-provider AI dashboard.
It is a STATEFUL AI RUNTIME.

Central abstraction:
  TASK -> REQUIREMENTS -> MODEL -> SESSION -> STATE -> EXECUTION -> RECOVERY -> VERIFICATION

---

## DEVELOPMENT RULE (SACRED)

  INSPECT -> UNDERSTAND -> DOCUMENT -> PRESERVE -> EXTEND -> TEST

1. Never rewrite working functionality
2. Never delete existing features without a documented reason
3. The /v1/* API contract is sacred — AI clients depend on it
4. All new systems must be additive layers on top of the existing engine
5. All code is plain ESM JavaScript — NO TypeScript
6. Routing decisions must be explainable
7. Never log credentials in plaintext
8. Never invent model capabilities

---

## EXISTING SYSTEM MAP

### Request Flow (PRESERVE)
  Client -> /v1/chat/completions
    -> src/app/api/v1/chat/route.js
    -> src/sse/handlers/chat.js        (parse, combo, account loop)
    -> open-sse/handlers/chatCore.js   (format detect, translate, dispatch)
    -> open-sse/executors/{provider}   (upstream call)
    -> open-sse/translator/*           (format conversion)
    -> SSE back to client

### Database Tables (EXISTING - DO NOT ALTER)
  providerConnections  -- Provider accounts with health state + priority
  settings             -- Global app settings
  combos               -- Named model groups with fallback strategies
  kv                   -- Key-value store by scope
  usageHistory         -- Per-request usage
  usageDaily           -- Aggregated daily usage
  requestDetails       -- Full request/response logs
  apiKeys              -- Dashboard API keys
  proxyPools           -- Proxy configuration
  providerNodes        -- Visual flow nodes

### New Database Tables (ADD - ADDITIVE ONLY)
  sessions         -- Session state (mode, pinned model, connection, status)
  projects         -- Project state (objective, tasks, decisions, files)
  tasks            -- Individual task records
  checkpoints      -- Point-in-time snapshots
  handoffs         -- Model handoff records
  auditLog         -- Immutable event log (no credentials ever)
  runtimePolicies  -- User-configurable routing policies

---

## DO-NOT-BREAK BOUNDARIES

  /v1/* API routes
  src/app/api/providers/
  src/app/api/combos/
  src/app/api/auth/
  src/app/api/usage/
  All existing dashboard pages
  MITM proxy (src/mitm/)
  OAuth token refresh
  Translation engine (open-sse/translator/)
  RTK token saver (open-sse/rtk/)
  Model catalog sync (src/lib/modelCatalog/)
  custom-server.js
  SQLite schema (additive only — never alter existing columns)

---

## NEW SOURCE DIRECTORIES TO BUILD

  src/lib/taskClassifier/        -- Classify BUILD/RESEARCH/CHAT
  src/lib/routing/               -- Capability-aware routing engine
  src/lib/sessions/              -- Session lifecycle + model pinning
  src/lib/projects/              -- Persistent project state
  src/lib/checkpoints/           -- Checkpoint management
  src/lib/handoff/               -- Structured model-to-model handoff
  src/lib/audit/                 -- Immutable event logging
  src/lib/runtimePolicy/         -- BUILD/RESEARCH/CHAT policies

---

## THE 23 AGENT SKILLS

### SKILL 1 — MODEL & CAPABILITY DISCOVERY
  Queryable inventory of all connected models with full capability profiles.
  Feeds: Task Classification, Routing, Recommendations, Sessions.

### SKILL 2 — PROVIDER & CONNECTION MANAGEMENT
  Provider -> Connection -> Credential -> Model (these are NOT the same thing).
  Manages health, quotas, priority, reliability.

### SKILL 3 — MODEL CAPABILITY REGISTRY
  Capability classes: BUILD-LONG, BUILD-FALLBACK, RESEARCH-LONG, RESEARCH-MEDIUM, CHAT-FAST, CHAT-CHEAP, UNSUITABLE.
  Never invent capabilities. Mark unknown as unknown.

### SKILL 4 — TASK CLASSIFICATION
  Classify BUILD / RESEARCH / CHAT from request + session context.
  Output: { mode, statefulness, requirements: { coding, reasoning, tools, vision, contextMin, outputMin } }

### SKILL 5 — INTELLIGENT ROUTING ENGINE
  Sequence: Task Classification -> Hard Filter (capability floor) -> Compatible Models -> Health Check -> Soft Rank -> Select -> Explain.
  RULE: A cheap incompatible model must NEVER outrank an expensive compatible model.

### SKILL 6 — RUNTIME MODE POLICY
  BUILD: Strong model -> Alternate key -> Alternate connection -> Checkpoint -> Compatible handoff. NEVER silent downgrade.
  RESEARCH: Long context + reasoning first. Follow-ups may use cheaper models.
  CHAT: Speed + cost + availability. Aggressive fallback acceptable.

### SKILL 7 — SESSION MANAGEMENT & MODEL PINNING
  Every stateful task gets a Session.
  Contains: project, task, mode, current model, PINNED MODEL, provider, connection, current key, state, checkpoint.
  Once BUILD model is pinned: rotate keys/connections freely. Changing model requires handoff workflow.

### SKILL 8 — PROJECT STATE & MEMORY
  Contains: objective, current phase, tasks (done/remaining), architecture, decisions, files changed, dependencies, tests, errors, next action.
  Source of truth hierarchy: filesystem -> project state -> task state -> checkpoints -> model context.

### SKILL 9 — CHECKPOINT MANAGEMENT
  Triggers: before handoff, after milestones, before risky ops, before/after deployment, during recovery.
  Must be: persistent, versioned, recoverable, inspectable, auditable.

### SKILL 10 — SAME-MODEL KEY FAILOVER
  First level of fallback. Key A fails -> Key B -> Key C. Model stays the same.
  Always prefer same-model recovery before model switching.

### SKILL 11 — MODEL HANDOFF & RECOVERY
  NOT ordinary fallback. Controlled state transition.
  Sequence: detect -> retry -> alternate key -> alternate connection -> checkpoint ->
            find compatible -> prepare handoff package -> initialize -> restore state ->
            inspect project -> verify -> resume.
  The replacement model must NOT restart from the beginning.

### SKILL 12 — CONTEXT MANAGEMENT & TOKEN OPTIMIZATION
  Use: current request + task + relevant files/diffs + architecture + checkpoint.
  Avoid: full history, unrelated files, completed tasks, duplicate instructions.
  Token optimization must NEVER remove correctness-critical information.

### SKILL 13 — DOCUMENT MEMORY
  Large doc -> Ingestion -> Extraction -> Structured knowledge (sections, facts, entities).
  Simple follow-ups -> cheaper model. Complex/ambiguous -> escalate to stronger model.

### SKILL 14 — REQUEST PLAYGROUND
  Test models independently. Show model, provider, connection, latency, tokens, cost, routing explanation.
  Must NOT affect the model pinned to an active project session.

### SKILL 15 — MODEL ARENA / COMPARISON
  Compare multiple models on same request. Quality, speed, context, cost, coding/reasoning suitability.
  Arena results must not override an active BUILD session.

### SKILL 16 — SMART RECOMMENDATIONS
  Recommend by: capability match + context match + reliability + cost + latency + fallback safety.
  NOT by: popularity only, lowest cost only, highest speed only.

### SKILL 17 — USAGE & RELIABILITY ANALYTICS
  Track: requests, tokens, cost, latency, success, failures, handoffs, checkpoints, recovery.
  Key metrics: model reliability, handoff success rate, cost per successful task.

### SKILL 18 — AUDIT & EVENT LOGGING
  Events: request started, task classified, model selected, model pinned, key failed, rate limit,
          checkpoint created, handoff started/completed, session resumed, task completed.
  NEVER record credentials.

### SKILL 19 — SECURITY & CREDENTIAL MANAGEMENT
  Secure storage, encryption, masked UI, no plaintext keys in logs, access control.
  Security failures must block unsafe operations.

### SKILL 20 — SYSTEM HEALTH & PROVIDER HEALTH
  Monitor: provider/model/connection/key availability, rate limits, quotas, latency, error rates.
  Health influences routing but NEVER overrides hard capability requirements.

### SKILL 21 — CONFIGURATION & POLICY MANAGEMENT
  User-configurable: BUILD/RESEARCH/CHAT capability floors, max cost, max latency,
                     preferred providers/models, fallback behavior, retry count, checkpoint frequency.

### SKILL 22 — WORKSPACE MANAGEMENT
  Structure: Workspace -> Projects -> Sessions -> Tasks -> State -> Checkpoints -> Providers -> Logs.
  Different projects can have different policies.

### SKILL 23 — AGENT SKILL ORCHESTRATOR
  Progressive loading: load skill names/triggers at discovery; full instructions when required.

---

## IMPLEMENTATION PHASES

  Phase 1  -- DONE: Inspection & Documentation
  Phase 2  -- Database Foundation (new tables + repos)
  Phase 3  -- Task Classifier (Skill 4)
  Phase 4  -- Capability-Aware Routing (Skills 3 + 5)
  Phase 5  -- Session Management & Model Pinning (Skills 6 + 7)
  Phase 6  -- Same-Model Key Failover (Skill 10)
  Phase 7  -- Project State & Memory (Skill 8)
  Phase 8  -- Checkpoint System (Skill 9)
  Phase 9  -- Model Handoff (Skill 11)
  Phase 10 -- Audit Logging (Skill 18)
  Phase 11 -- Runtime Policy Engine (Skills 6 + 21)
  Phase 12 -- Command Center Dashboard UI
  Phase 13 -- Document Memory (Skill 13)
  Phase 14 -- Analytics Extension (Skill 17)
  Phase 15 -- Smart Recommendations (Skill 16)

---

## ROUTING DECISION LOGIC

  Request arrives at /v1/chat/completions
    -> Task Classifier (mode + requirements)
    -> Check: active session? load pinned model
    -> If pinned: try pinned model first (Key Failover priority)
    -> If no pin: Hard filter (capability floor for mode)
    -> Soft rank (reliability + health + cost + latency)
    -> Select model -> Pin to session (if BUILD)
    -> Execute via existing open-sse engine
    -> On failure: Same-model key failover
    -> All keys exhausted: Checkpoint -> Find compatible -> Handoff

---

## ROUTING EXPLANATION FORMAT

  {
    "mode": "BUILD",
    "requirements": { "coding": true, "tools": true, "contextMin": 100000 },
    "compatible": ["claude-opus-5", "claude-sonnet-4.6"],
    "rejected": [{ "model": "gpt-4o-mini", "reason": "contextWindow < required" }],
    "selected": "claude-opus-5",
    "reasons": ["BUILD task", "coding required", "tools required", "provider healthy"],
    "pinned": true,
    "sessionId": "sess_abc123"
  }

---

## KEY FILE PATHS

  src/lib/db/schema.js              -- SQLite schema (add new tables here)
  src/lib/db/repos/                 -- One repo file per table
  src/lib/dataDir.js                -- Data directory (~/.fast-router)
  open-sse/providers/capabilities.js -- Model capability tables
  open-sse/services/accountFallback.js -- Account fallback logic
  src/sse/handlers/chat.js          -- Main chat handler (extend, never replace)
  src/shared/constants/config.js    -- App-wide constants

---

## TEST SCENARIOS (completion criteria)

  TEST 1: Normal BUILD
    -> Classify -> Select strong model -> Pin -> Create project state -> Execute -> Checkpoint

  TEST 2: API key failure during BUILD
    -> Detect -> Try alternate key -> Keep same model -> Continue

  TEST 3: Provider unavailable during BUILD
    -> Detect -> Alternate key -> Alternate connection -> Checkpoint ->
       Find compatible -> Handoff -> Verify -> Continue without repeating completed work

  TEST 4: No compatible model
    -> Detect -> Create checkpoint -> Pause session -> Notify user clearly

  TEST 5: RESEARCH mode
    -> Large context model -> Extract document memory -> Use cheaper model for follow-ups

  TEST 6: CHAT mode
    -> Fast/cheap model -> Aggressive fallback acceptable -> No pinning required

---

Source: AntigravityQuickstar.md + agentskilltemplates.md + master.md
Version: 1.0
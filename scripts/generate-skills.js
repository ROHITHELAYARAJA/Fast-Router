/**
 * Generator script for Fast-Router's 23 Antigravity Agent Skills
 * based on agentskilltemplates.md and antigravity-skill-creator.md.
 */

const fs = require("fs");
const path = require("path");

const SKILLS_DIR = path.resolve(__dirname, "../.agents/skills");

const SKILLS_DEFINITIONS = [
  {
    folder: "discovering-model-capabilities",
    name: "discovering-model-capabilities",
    description: "Discovers connected AI models and builds searchable capability profiles across providers. Use when the user asks to inventory models, inspect model metadata, check model context or output limits, or discover newly added models.",
    title: "Model & AI Capability Discovery",
    triggers: [
      "Inventorying available AI models and connected providers",
      "Checking model context window size, max output tokens, or modalities",
      "Inspecting whether a model supports tool calling, vision, or coding",
      "Scanning newly connected provider endpoints for supported models",
    ],
    checklist: [
      "Connect to provider endpoint or query local registry",
      "Fetch list of available models and raw capability manifests",
      "Normalize context window, max output, coding, vision, and tool flags",
      "Register discovered models in Fast-Router SQLite registry",
      "Verify model metadata is accessible via GET /api/models or GET /api/runtime/health",
    ],
    instructions: `### Fast-Router Model Discovery Protocol

1. **Query Connected Providers**:
\`\`\`bash
# List all active provider connections
curl -s http://localhost:20200/api/providers | jq .
\`\`\`

2. **Retrieve Authoritative Capabilities**:
Fast-Router discovers capabilities dynamically and maps them through \`open-sse/providers/capabilities.js\`.

3. **Check Specific Model Dimensions**:
Verify context window and output limits:
- \`contextWindow\`: e.g. 200,000 for Claude 3.7 / 3.5 Sonnet, 128,000 for GPT-4o
- \`maxOutput\`: e.g. 64,000 for Claude 3.7 (thinking), 16,384 for GPT-4o
- \`tools\`: boolean flag indicating native tool/function calling support
- \`coding\`: suitability for software development tasks
- \`vision\`: image/multimodal attachment support

4. **Integration**:
Feeds metadata directly into **Task Classification** (\`classifying-tasks\`) and **Routing** (\`routing-with-capability-floors\`).`,
  },

  {
    folder: "managing-providers-and-connections",
    name: "managing-providers-and-connections",
    description: "Manages connected AI providers, accounts, OAuth tokens, and API key credentials. Use when adding or removing providers, rotating API keys, configuring priority order, or testing provider health.",
    title: "Provider & Connection Management",
    triggers: [
      "Adding, editing, or deleting an AI provider connection",
      "Managing multiple API keys or accounts for the same provider",
      "Setting connection priorities and round-robin strategies",
      "Testing connection status and checking error codes",
    ],
    checklist: [
      "Identify provider kind (anthropic, openai, gemini, deepseek, etc.)",
      "Determine auth type (apikey, oauth, access_token)",
      "Assign connection priority to control rotation sequence",
      "Validate connection health via test probe",
      "Ensure raw secrets are never logged or exposed in plaintext",
    ],
    instructions: `### Provider & Connection Entity Separation

Fast-Router strictly enforces separation between entities:
\`\`\`
Provider (e.g. Anthropic)
 └── Connection (e.g. Work Account, Personal Account)
      └── Credential / API Key (Key A, Key B, OAuth Token)
           └── Model (Claude 3.7 Sonnet, Claude 3.5 Haiku)
\`\`\`

1. **List Configured Connections**:
\`\`\`bash
curl -s http://localhost:20200/api/providers | jq .
\`\`\`

2. **Add / Update Connection**:
Use Fast-Router CLI or POST to \`/api/providers\`.
\`\`\`bash
node app/cli/bin/fast-router.js
# Or via REST API
curl -s -X POST http://localhost:20200/api/providers \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"anthropic","name":"Primary Team Key","apiKey":"sk-ant-...","priority":1}'
\`\`\`

3. **Connection Failover Rules**:
- A rate limit on Key A must fail over to Key B on the **same connection/provider** before switching models.
- Priority order is 1-indexed (lowest number = highest priority).`,
  },

  {
    folder: "registering-model-capabilities",
    name: "registering-model-capabilities",
    description: "Maintains authoritative capability profiles and suitability classes for models. Use when categorizing models into BUILD-LONG, RESEARCH-LONG, or CHAT-FAST classes, or evaluating if a model meets task requirements.",
    title: "Model Capability Registry",
    triggers: [
      "Categorizing models into BUILD-LONG, BUILD-FALLBACK, RESEARCH-LONG, or CHAT-FAST",
      "Answering 'Can this model handle this coding or research task?'",
      "Defining custom capability floors in runtime policies",
    ],
    checklist: [
      "Look up model in open-sse/providers/capabilities.js",
      "Evaluate hard capability floor (contextWindow, maxOutput, tools, coding)",
      "Assign dynamic suitability class",
      "Enforce capability floor during candidate scoring",
    ],
    instructions: `### Model Suitability Classes

Models are categorized dynamically based on verified metrics:

- \`BUILD-LONG\`: Strong reasoning + coding + native tools + >=32K context (e.g. Claude 3.7 Sonnet, GPT-4o).
- \`BUILD-FALLBACK\`: Strong compatible model suitable for taking over BUILD work after checkpointed handoff.
- \`RESEARCH-LONG\`: Large context (>=50K) + document understanding (e.g. Gemini 2.5 Pro, Claude 3.5 Sonnet).
- \`RESEARCH-MEDIUM\`: Moderate context suitable for follow-up Q&A and structured summaries.
- \`CHAT-FAST\`: Fast, low-latency models for conversational assistance (e.g. Gemini 2.5 Flash, GPT-4o-mini).
- \`UNSUITABLE\`: Models failing the task's hard capability floor.

### Checking Model Capabilities in Code
\`\`\`javascript
import { getCapabilitiesForModel } from "open-sse/providers/capabilities.js";

const caps = getCapabilitiesForModel("anthropic", "claude-3-7-sonnet");
// Returns: { contextWindow: 200000, maxOutput: 64000, tools: true, vision: true }
\`\`\``,
  },

  {
    folder: "classifying-tasks",
    name: "classifying-tasks",
    description: "Classifies incoming requests into BUILD, RESEARCH, or CHAT modes, detecting statefulness and capability floors. Use when a new user prompt arrives or when determining required context and tools.",
    title: "Task Classification",
    triggers: [
      "Classifying an incoming user prompt or conversation",
      "Detecting whether a task is stateful BUILD, document RESEARCH, or stateless CHAT",
      "Determining minimum context window and output requirements for a task",
    ],
    checklist: [
      "Analyze message text, attachments, code blocks, and tool definitions",
      "Check active session mode and project context",
      "Score BUILD, RESEARCH, and CHAT signal weights",
      "Compute confidence level and capability requirements",
      "Log audit event 'task_classified'",
    ],
    instructions: `### Fast-Router Task Classification Protocol

Call the classification API directly:
\`\`\`bash
curl -s -X POST http://localhost:20200/api/runtime/classify \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Implement user authentication with bcrypt and JWT tokens in Express",
    "tools": []
  }' | jq .
\`\`\`

Output schema:
\`\`\`json
{
  "success": true,
  "classification": {
    "mode": "BUILD",
    "statefulness": "stateful",
    "requirements": {
      "coding": true,
      "reasoning": true,
      "tools": false,
      "vision": false,
      "longContext": false,
      "contextMin": 32000,
      "outputMin": 4000
    },
    "confidence": 0.9,
    "explanation": ["message contains coding keywords", "BUILD score: 8 > CHAT: 1"]
  }
}
\`\`\``,
  },

  {
    folder: "routing-with-capability-floors",
    name: "routing-with-capability-floors",
    description: "Executes capability-aware two-stage routing: hard capability floor filtering followed by soft ranking. Use when selecting a model for a task or explaining routing decisions.",
    title: "Intelligent Routing Engine",
    triggers: [
      "Selecting the best model for a classified task",
      "Filtering out under-capable candidate models",
      "Explaining why a specific model was selected or rejected",
    ],
    checklist: [
      "Obtain task classification and capability requirements",
      "Stage 1: Apply Hard Capability Floor (disqualify models lacking context, output, or tools)",
      "Stage 2: Soft Rank compatible models by reliability, latency, health, and cost",
      "Respect pinned model if session is in BUILD mode",
      "Log audit event 'model_selected' with explanation",
    ],
    instructions: `### Two-Stage Routing Process

\`\`\`
Task Classification
      ↓
Stage 1: Hard Capability Floor Filter
   (Remove models lacking context, tools, coding, or output)
      ↓
Stage 2: Soft Ranking
   (Score by reliability: 40%, quality: 30%, latency: 15%, cost: 15%)
      ↓
Selected Model + Decision Explanation
\`\`\`

**Rule**: A cheap incompatible model must **NEVER** outrank an expensive compatible model.

### Execute Routing API:
\`\`\`bash
curl -s -X POST http://localhost:20200/api/runtime/route \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Refactor the database migrations and write tests",
    "policy": { "qualityPreference": "quality" }
  }' | jq .
\`\`\``,
  },

  {
    folder: "enforcing-runtime-modes",
    name: "enforcing-runtime-modes",
    description: "Applies policy rules for BUILD, RESEARCH, and CHAT runtime modes. Use when configuring continuity rules, model pinning behavior, or document memory escalation.",
    title: "Runtime Mode Policy",
    triggers: [
      "Configuring runtime mode behaviors (BUILD, RESEARCH, CHAT)",
      "Enforcing model pinning for engineering and coding workflows",
      "Handling document Q&A escalation in research mode",
    ],
    checklist: [
      "BUILD Mode: Pin model, mandate same-model key failover, checkpoint before any handoff",
      "RESEARCH Mode: Extract document memory, use cheaper model for simple queries, escalate for complex queries",
      "CHAT Mode: Prioritize speed/cost, allow lightweight fallbacks",
    ],
    instructions: `### Runtime Mode Rules

1. **BUILD Policy (Continuity First)**:
   - Primary model is PINNED for the session.
   - Key failure -> Rotate to another key for the SAME model.
   - Connection failure -> Rotate to another connection for the SAME model.
   - Model failure -> Create checkpoint -> Model handoff to compatible strong model.
   - *Never silently downgrade to a small/cheap model.*

2. **RESEARCH Policy (Evidence & Memory First)**:
   - Ingest document -> Store structured document memory -> Retrieve relevant chunks.
   - Follow-up questions use document memory rather than resending full PDF/document.

3. **CHAT Policy (Speed & Cost First)**:
   - Stateless or lightweight context. Fast fallback allowed.`,
  },

  {
    folder: "managing-sessions-and-pinning",
    name: "managing-sessions-and-pinning",
    description: "Manages stateful sessions, model pinning, and session lifecycles. Use when creating sessions, tracking pinned models, passing session headers, or closing sessions.",
    title: "Session Management & Model Pinning",
    triggers: [
      "Starting a new stateful session for a coding or research project",
      "Pinning a model to maintain consistency across multi-step tasks",
      "Associating requests with X-Fast-Router-Session-ID headers",
      "Listing or closing active sessions",
    ],
    checklist: [
      "Generate or retrieve session ID (prefix: sess_)",
      "Set mode (BUILD, RESEARCH, CHAT) and link projectId",
      "Pin primary model upon session start",
      "Pass X-Fast-Router-Session-ID header in SSE chat requests",
      "Update session status to completed upon task finish",
    ],
    instructions: `### Session Management APIs

1. **Create Pinned Session**:
\`\`\`bash
curl -s -X POST http://localhost:20200/api/runtime/sessions \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "BUILD",
    "model": "claude-3-7-sonnet",
    "provider": "anthropic",
    "projectId": "proj_core"
  }' | jq .
\`\`\`

2. **Send Request with Session Header**:
\`\`\`bash
curl -s -X POST http://localhost:20200/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "X-Fast-Router-Session-ID: sess_0245dee92e1e4beb" \\
  -d '{
    "model": "claude-3-7-sonnet",
    "messages": [{"role": "user", "content": "Start phase 2 implementation"}]
  }'
\`\`\`

3. **Close Session**:
\`\`\`bash
curl -s -X DELETE http://localhost:20200/api/runtime/sessions/sess_0245dee92e1e4beb
\`\`\``,
  },

  {
    folder: "managing-project-memory",
    name: "managing-project-memory",
    description: "Maintains durable project state, objectives, completed tasks, decisions, and file manifests independently of LLM context. Use when updating project state or building handoff contexts.",
    title: "Project State & Memory",
    triggers: [
      "Creating or updating persistent project memory",
      "Recording architectural decisions or file modifications",
      "Marking project tasks completed or pending",
      "Formatting structured project state for model handoffs",
    ],
    checklist: [
      "Load project state from SQLite projects table",
      "Record objective, current phase, and next action",
      "Log architectural decisions (title, rationale, alternatives)",
      "Track modified files and completed tasks",
      "Source of truth: Filesystem > Project DB > Checkpoints > Model context",
    ],
    instructions: `### Project State Management

1. **Create / Update Project**:
\`\`\`bash
curl -s -X POST http://localhost:20200/api/runtime/projects \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Fast-Router Core",
    "objective": "Build stateful multi-model continuous AI runtime",
    "currentPhase": "Execution"
  }' | jq .
\`\`\`

2. **Add Architectural Decision**:
\`\`\`bash
curl -s -X PATCH http://localhost:20200/api/runtime/projects/proj_core \\
  -H "Content-Type: application/json" \\
  -d '{
    "addDecision": {
      "title": "Use Multi-Driver SQLite Storage",
      "rationale": "Ensures zero native build dependencies on Node 22.5+ while supporting better-sqlite3 and sql.js."
    }
  }' | jq .
\`\`\`

3. **Complete Task**:
\`\`\`bash
curl -s -X PATCH http://localhost:20200/api/runtime/projects/proj_core \\
  -H "Content-Type: application/json" \\
  -d '{
    "completeTask": {
      "taskName": "Implement Task Classifier",
      "result": "Created app/src/lib/taskClassifier/index.js"
    }
  }' | jq .
\`\`\``,
  },

  {
    folder: "managing-checkpoints",
    name: "managing-checkpoints",
    description: "Creates versioned, recoverable project snapshot checkpoints at critical milestones or before model handoffs. Use when taking snapshots, inspecting past states, or rolling back project state.",
    title: "Checkpoint Management",
    triggers: [
      "Taking snapshot checkpoints before major model handoffs",
      "Recording milestone checkpoints after completing significant tasks",
      "Restoring project state from a previous snapshot checkpoint",
      "Listing versioned checkpoints for auditing and rollback",
    ],
    checklist: [
      "Identify trigger: before_handoff, milestone, before_deploy, recovery, or manual",
      "Capture snapshot of project state, files changed, decisions, and next action",
      "Insert into checkpoints table with unique ID (prefix: chk_)",
      "Log audit event 'checkpoint_created'",
      "Support rollback via POST /api/runtime/checkpoints/:id/restore",
    ],
    instructions: `### Checkpoint Protocol

1. **Create Checkpoint**:
\`\`\`bash
curl -s -X POST http://localhost:20200/api/runtime/checkpoints \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "proj_core",
    "trigger": "milestone",
    "nextAction": "Deploy runtime UI to staging"
  }' | jq .
\`\`\`

2. **List Checkpoints**:
\`\`\`bash
curl -s "http://localhost:20200/api/runtime/checkpoints?projectId=proj_core" | jq .
\`\`\`

3. **Restore Checkpoint**:
\`\`\`bash
curl -s -X POST http://localhost:20200/api/runtime/checkpoints/chk_ea69bcb0b88a4a0e/restore | jq .
\`\`\``,
  },

  {
    folder: "failing-over-keys",
    name: "failing-over-keys",
    description: "Recovers from rate limits, quota exhaustion, or auth errors by rotating API keys for the same model without model switching. Use when handling 429, 401, or quota errors.",
    title: "Same-Model Key Failover",
    triggers: [
      "Encountering HTTP 429 Too Many Requests or rate limits",
      "Encountering quota exhaustion or expired credentials on an active account",
      "Rotating to an alternate API key or connection for the SAME model",
    ],
    checklist: [
      "Classify error: rate_limit, quota, auth, or timeout",
      "Mark current connection temporarily unavailable with retry-after backoff",
      "Query next highest priority active connection supporting the SAME model",
      "Retry request with the new key without changing the model",
      "Only escalate to model handoff if all keys for the model are exhausted",
    ],
    instructions: `### Key Failover Protocol

\`\`\`
Active Request (Model A + Key 1)
           ↓
   [Rate Limit / 429]
           ↓
Mark Key 1 unavailable (resetsAtMs = now + retryAfter)
           ↓
Select Key 2 for SAME Model A
           ↓
Execute Request with Key 2
\`\`\`

**Critical Guarantee**: Never change models when an alternate credential for the same model is available.`,
  },

  {
    folder: "executing-model-handoffs",
    name: "executing-model-handoffs",
    description: "Safely transfers an active task from a failed model to a compatible replacement model via structured context packages. Use when all credentials for a model fail and work must continue seamlessly.",
    title: "Model Handoff & Recovery",
    triggers: [
      "All credentials/connections for the primary model are exhausted",
      "The primary provider is experiencing an extended outage",
      "Executing a controlled state transition to an equivalent compatible model",
    ],
    checklist: [
      "Create immediate snapshot checkpoint (trigger: 'before_handoff')",
      "Log audit event 'handoff_started'",
      "Select replacement model that satisfies EQUIVALENT capability floor",
      "Build structured handoff package from persistent project state",
      "Update session to new model and log 'handoff_completed'",
      "Receiver inspects actual filesystem before proceeding",
    ],
    instructions: `### Model Handoff Execution API

Execute structured handoff:
\`\`\`bash
curl -s -X POST http://localhost:20200/api/runtime/handoff \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "sess_0245dee92e1e4beb",
    "projectId": "proj_core",
    "fromModel": "claude-3-7-sonnet",
    "fromProvider": "anthropic",
    "failureReason": "quota",
    "failureDetails": "Rate limit exceeded on all accounts"
  }' | jq .
\`\`\`

The response returns the replacement model and the exact handoff package containing objective, completed tasks, architecture, decisions, and next action.`,
  },

  {
    folder: "optimizing-context-tokens",
    name: "optimizing-context-tokens",
    description: "Optimizes context transmission to reduce token waste while preserving correctness. Use when constructing model prompts, loading diffs, or preventing redundant context.",
    title: "Context Management & Token Optimization",
    triggers: [
      "Constructing prompts for large projects without token waste",
      "Replacing full file transmissions with targeted diffs and summaries",
      "Pruning completed tasks and irrelevant history from prompts",
    ],
    checklist: [
      "Transmit current task + relevant project state + active checkpoint",
      "Do NOT resend entire multi-turn conversation history",
      "Use diff-based context for modified files",
      "Never compress away correctness-critical information",
    ],
    instructions: `### Layered Context Architecture

Fast-Router constructs prompts in priority layers:
1. **Current Task**: Immediate objective and prompt
2. **Project State Manifest**: Objective, phase, and last known good state
3. **Decisions & Constraints**: Key architectural decisions
4. **Relevant Diffs**: Only modified files, not full repository
5. **Checkpoint Snapshot**: Recent milestone summary

**Token Optimization Goal**:
\`\`\`
Less Token Waste + More Relevant Context = Higher Correctness
\`\`\``,
  },

  {
    folder: "managing-document-memory",
    name: "managing-document-memory",
    description: "Ingests large documents and creates structured document memory for token-efficient research workflows. Use when processing PDFs, research papers, or large textual documents.",
    title: "Document Memory",
    triggers: [
      "Ingesting PDFs, financial reports, or research documents",
      "Building structured entity/relationship memory from text",
      "Handling document follow-up queries without re-transmitting full files",
    ],
    checklist: [
      "Ingest raw document and extract sections, entities, and facts",
      "Store structured document memory in project workspace",
      "Retrieve relevant excerpts for user questions",
      "Route simple follow-up questions to lightweight fast models",
      "Escalate complex synthetic questions to high-reasoning models",
    ],
    instructions: `### Document Ingestion Flow

\`\`\`
Raw Document (PDF/Text)
       ↓
Structure Extraction (Sections, Entities, Facts)
       ↓
Persistent Document Memory
       ↓
Relevant Retrieval Chunking
       ↓
Targeted Model Context
\`\`\``,
  },

  {
    folder: "testing-routing-playground",
    name: "testing-routing-playground",
    description: "Tests model capabilities and routing behavior in an isolated playground. Use when validating routing decisions or testing model outputs without affecting live project sessions.",
    title: "Request Playground",
    triggers: [
      "Testing routing and classification behavior on test prompts",
      "Inspecting candidate floor matching and score breakdowns",
      "Simulating provider failures and observing handoff execution",
    ],
    checklist: [
      "Open http://localhost:20200/dashboard/runtime in browser",
      "Select preset or enter custom prompt",
      "Inspect live classification, capability floor filter, and selected model",
      "Click 'Simulate Provider Failure & Handoff' to verify resilience",
    ],
    instructions: `### Playground Isolation Rule

Testing in the Playground **MUST NOT** alter pinned models on active project sessions. Playground requests run independently of active project state.`,
  },

  {
    folder: "comparing-models-arena",
    name: "comparing-models-arena",
    description: "Compares multiple models side-by-side on the same prompt across quality, latency, token cost, and tool support. Use when evaluating models for engineering tasks.",
    title: "Model Arena / Comparison",
    triggers: [
      "Comparing responses from multiple models side-by-side",
      "Benchmarking latency, cost per 1M tokens, and output quality",
      "Evaluating whether an alternative model meets capability requirements",
    ],
    checklist: [
      "Select candidate models (e.g. Claude 3.7 Sonnet vs GPT-4o)",
      "Send parallel requests through Fast-Router SSE gateway",
      "Compare response latency, token count, and output completeness",
      "Use findings to update runtime routing policies",
    ],
    instructions: `### Model Comparison Testing
Evaluate models side-by-side using standard OpenAI-compatible endpoints:
\`\`\`bash
# Model A
curl -s http://localhost:20200/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"claude-3-7-sonnet","messages":[{"role":"user","content":"Compare Rust vs Go concurrency"}]}'

# Model B
curl -s http://localhost:20200/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Compare Rust vs Go concurrency"}]}'
\`\`\``,
  },

  {
    folder: "generating-smart-recommendations",
    name: "generating-smart-recommendations",
    description: "Generates task-aware model and connection recommendations based on capability floors, reliability, and cost. Use when advising users on model choices.",
    title: "Smart Recommendations",
    triggers: [
      "Recommending optimal models for specific tasks or projects",
      "Suggesting cost-efficient models that satisfy capability requirements",
      "Advising users on provider reliability trends",
    ],
    checklist: [
      "Identify task mode and required capability floor",
      "Filter out any model failing the capability floor",
      "Recommend models with highest composite score (reliability + quality + cost)",
      "Provide transparent reasoning for the recommendation",
    ],
    instructions: `### Recommendation Rule
**NEVER** recommend a cheaper model if it fails the task's capability floor. Correctness always takes precedence over cost.`,
  },

  {
    folder: "analyzing-usage-and-reliability",
    name: "analyzing-usage-and-reliability",
    description: "Tracks and analyzes token consumption, estimated costs, provider error rates, and handoff recovery success rates. Use when reviewing metrics and runtime telemetry.",
    title: "Usage & Reliability Analytics",
    triggers: [
      "Viewing token consumption and cost analytics",
      "Tracking provider and connection error rates",
      "Measuring handoff success rates and recovery duration",
    ],
    checklist: [
      "Query Fast-Router metrics from database",
      "Aggregate token usage by model, provider, and session",
      "Calculate reliability percentage = (successful requests / total requests) * 100",
      "Display analytics in dashboard usage charts",
    ],
    instructions: `### Query Usage & Telemetry
\`\`\`bash
# Query health and session metrics
curl -s http://localhost:20200/api/runtime/health | jq .

# Query recent audit events
curl -s "http://localhost:20200/api/runtime/audit?limit=20" | jq .
\`\`\``,
  },

  {
    folder: "logging-audit-events",
    name: "logging-audit-events",
    description: "Writes and queries immutable audit logs of runtime routing decisions, key failovers, checkpoints, and handoffs with zero secret leaks. Use when reviewing execution logs.",
    title: "Audit & Event Logging",
    triggers: [
      "Logging runtime events: model_selected, key_failover, checkpoint_created, handoff_completed",
      "Querying audit trail for debugging long-running multi-agent tasks",
      "Verifying zero-leak credential sanitization",
    ],
    checklist: [
      "Sanitize all payload details: redact apiKey, token, secret, password",
      "Record timestamp, eventType, sessionId, projectId, model, provider",
      "Write to SQLite auditLog table (fail-safe, never throws)",
      "Expose via GET /api/runtime/audit and /dashboard/runtime/audit",
    ],
    instructions: `### Audit Logging API

1. **Query Events**:
\`\`\`bash
curl -s "http://localhost:20200/api/runtime/audit?limit=10" | jq .
\`\`\`

2. **Log Custom Event**:
\`\`\`bash
curl -s -X POST http://localhost:20200/api/runtime/audit \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventType": "verification_completed",
    "ctx": {
      "projectId": "proj_core",
      "details": { "testsPassed": 14, "durationMs": 450 }
    }
  }' | jq .
\`\`\``,
  },

  {
    folder: "securing-credentials",
    name: "securing-credentials",
    description: "Protects API keys, OAuth tokens, and sensitive project data against accidental leakage in logs, UI, or model context. Use when handling credentials or auditing security.",
    title: "Security & Credential Management",
    triggers: [
      "Adding or rotating sensitive API keys or OAuth credentials",
      "Auditing logs and payloads to verify no plaintext secrets exist",
      "Enforcing local-only access or CLI machine token validation",
    ],
    checklist: [
      "Never store raw credentials in project memory or checkpoints",
      "Redact credentials from audit logs and error messages",
      "Require dashboard session cookie or CLI token for protected routes",
      "Enforce default password rotation before remote network exposure",
    ],
    instructions: `### Zero-Leak Redaction Rules

- Any object passed to \`auditLog()\` passes through \`sanitizeDetails()\`.
- Keys matching \`apiKey\`, \`token\`, \`secret\`, \`password\`, \`bearer\` are replaced with \`[REDACTED]\`.
- Hand-off packages reference connection IDs, never plaintext keys.`,
  },

  {
    folder: "monitoring-system-health",
    name: "monitoring-system-health",
    description: "Monitors provider health, connection latency, rate limit cooldowns, and error rates. Use when checking provider status or diagnosing failing connections.",
    title: "System & Provider Health",
    triggers: [
      "Checking provider availability and operational status",
      "Monitoring rate-limited connections and cooldown timers",
      "Diagnosing network errors or provider outages",
    ],
    checklist: [
      "Query GET /api/runtime/health for provider status",
      "Track active vs failing connection counts",
      "Check rateLimitedUntil timestamps for cooling connections",
      "Feed health scores into Stage 2 Soft Ranking in capability router",
    ],
    instructions: `### Health Query API
\`\`\`bash
curl -s http://localhost:20200/api/runtime/health | jq .
\`\`\`

Returns operational status, total connections, active connections, failing connections, and cooling rate limits per provider.`,
  },

  {
    folder: "managing-configuration-policies",
    name: "managing-configuration-policies",
    description: "Configures runtime routing policies, capability floors, cost caps, and retry parameters. Use when tailoring orchestration behavior for specific environments.",
    title: "Configuration & Policy Management",
    triggers: [
      "Setting custom capability floors for BUILD or RESEARCH modes",
      "Configuring preferred providers or cost/latency thresholds",
      "Adjusting retry counts and checkpoint snapshot frequencies",
    ],
    checklist: [
      "Define policy object in runtimePolicies table",
      "Specify mode capability overrides (e.g. minContext: 64000)",
      "Set qualityPreference: 'quality' | 'balanced' | 'cost' | 'speed'",
      "Pass policy to /api/runtime/route or store per workspace",
    ],
    instructions: `### Policy Object Format
\`\`\`json
{
  "qualityPreference": "quality",
  "capabilityFloors": {
    "BUILD": { "contextWindow": 64000, "maxOutput": 8000, "tools": true },
    "RESEARCH": { "contextWindow": 100000, "maxOutput": 4000 }
  },
  "maxRetries": 3,
  "autoCheckpointOnMilestone": true
}
\`\`\``,
  },

  {
    folder: "managing-workspaces",
    name: "managing-workspaces",
    description: "Organizes projects, sessions, tasks, and checkpoints into isolated workspaces. Use when separating different applications, clients, or repositories.",
    title: "Workspace Management",
    triggers: [
      "Organizing multiple projects and sessions under a unified workspace",
      "Switching between different application codebases",
      "Isolating routing policies and provider preferences by workspace",
    ],
    checklist: [
      "Associate projects and sessions with workspace identifier",
      "Ensure project memory and checkpoints remain isolated",
      "Apply workspace-specific routing policies",
    ],
    instructions: `### Workspace Organization
\`\`\`
Workspace
  ├── Projects (proj_*)
  │     ├── Persistent State & Objectives
  │     ├── Completed Tasks & Decisions
  │     └── Versioned Checkpoints (chk_*)
  ├── Sessions (sess_*)
  │     └── Pinned Models & Execution History
  └── Workspace Policies & Health
\`\`\``,
  },

  {
    folder: "orchestrating-agent-skills",
    name: "orchestrating-agent-skills",
    description: "Coordinates the 23 Agent Skills progressively without context bloat, activating only the skills required for the current execution phase. Use for end-to-end task lifecycles.",
    title: "Agent Skill Orchestrator",
    triggers: [
      "Executing an end-to-end task lifecycle (Request -> Classify -> Pin -> Execute -> Checkpoint -> Verify)",
      "Coordinating multiple skills during a complex coding or research workflow",
      "Progressively activating skills based on execution triggers",
    ],
    checklist: [
      "Phase 1: Task Classification (classifying-tasks) -> Mode & Floor",
      "Phase 2: Model Selection (routing-with-capability-floors) -> Primary Model",
      "Phase 3: Session & Memory (managing-sessions-and-pinning, managing-project-memory)",
      "Phase 4: Execution & Snapshot (managing-checkpoints)",
      "Phase 5: Failure Recovery (failing-over-keys, executing-model-handoffs)",
      "Phase 6: Audit & Telemetry (logging-audit-events, analyzing-usage-and-reliability)",
    ],
    instructions: `### Master Orchestration Lifecycle

\`\`\`
User Request
     ↓
[classifying-tasks] — Detect BUILD / RESEARCH / CHAT
     ↓
[routing-with-capability-floors] — Filter & Rank
     ↓
[managing-sessions-and-pinning] — Pin Model
     ↓
[managing-project-memory] — Record Objectives & Tasks
     ↓
[Execution via Fast-Router Gateway]
     ↓
On Milestone: [managing-checkpoints] — Snapshot
     ↓
On Error:
   1. [failing-over-keys] — Same model, alternate key
   2. [executing-model-handoffs] — Checkpoint + compatible model switch
     ↓
[logging-audit-events] — Transparent zero-leak audit record
\`\`\``,
  },
];

console.log(`Generating ${SKILLS_DEFINITIONS.length} Agent Skills...`);

for (const skill of SKILLS_DEFINITIONS) {
  const skillDir = path.join(SKILLS_DIR, skill.folder);
  if (!fs.existsSync(skillDir)) {
    fs.mkdirSync(skillDir, { recursive: true });
  }

  const skillContent = `---
name: ${skill.name}
description: ${skill.description}
---

# ${skill.title}

## When to use this skill
${skill.triggers.map((t) => `- ${t}`).join("\n")}

## Workflow & Checklist
${skill.checklist.map((c) => `- [ ] ${c}`).join("\n")}

## Instructions & API Interfaces
${skill.instructions}

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at \`http://localhost:20200/dashboard/runtime\`
`;

  const skillPath = path.join(skillDir, "SKILL.md");
  fs.writeFileSync(skillPath, skillContent, "utf8");
  console.log(`✓ Created .agents/skills/${skill.folder}/SKILL.md`);
}

console.log("All 23 Agent Skills successfully generated!");

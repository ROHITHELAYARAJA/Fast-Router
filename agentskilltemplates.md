# AGENT SKILLS TEMPLATES
# STATEFUL AI RUNTIME
# Refined Implementation Specification for Antigravity

---

# PURPOSE

This document defines the Agent Skills that power the Stateful AI Runtime.

The platform is not merely a collection of AI providers.

The Skills must work together to provide:

- Intelligent task classification
- Capability-aware model selection
- BUILD / RESEARCH / CHAT routing
- Provider and API-key management
- Stateful sessions
- Model pinning
- Project memory
- Checkpointing
- Safe failure recovery
- Same-model key failover
- Compatible model handoff
- Context reconstruction
- Token-efficient execution
- Usage and reliability analytics
- Professional AI infrastructure management

Every Skill must be independently understandable, independently testable,
and capable of communicating with other Skills through clearly defined
interfaces.

---

# GLOBAL AGENT SKILL PRINCIPLES

Every Skill must follow these principles:

1. Do not assume all AI models are equivalent.
2. Do not route only according to availability.
3. Do not use cost as the primary routing criterion.
4. Do not silently downgrade a stateful BUILD task.
5. Do not confuse API-key failover with model failover.
6. Preserve project state independently of model context.
7. Treat the repository/filesystem as a source of truth for software projects.
8. Use checkpoints for important state transitions.
9. Make model handoffs explicit and recoverable.
10. Keep sensitive credentials protected.
11. Keep Skills modular.
12. Load detailed instructions progressively.
13. Avoid unnecessary context transmission.
14. Never invent model capabilities or limits.
15. Preserve existing application functionality.
16. Every important routing or recovery decision must be explainable.
17. Every stateful operation must be resumable.
18. A failed model must not automatically result in a weaker model taking over.
19. The runtime must prefer continuity over blind fallback.
20. Skills must cooperate through shared project/session state.

---

# STANDARD SKILL STRUCTURE

Every Skill must contain:

- Skill identity
- Purpose
- Description
- Activation triggers
- Required capabilities
- Inputs
- Outputs
- Dependencies
- State requirements
- Workflow
- Decision rules
- Error handling
- Security requirements
- Integration points
- Testing requirements
- Completion criteria

Each Skill should have a clear boundary.

Do not create Skills that duplicate another Skill's responsibility.

---

# SKILL 1 — MODEL & AI CAPABILITY DISCOVERY

## Purpose

Provide a complete searchable inventory of connected AI models and providers.

This Skill is NOT simply a list of AI tools.

Its primary purpose is to understand what each connected model is actually
capable of doing.

## Responsibilities

- Discover connected providers
- Discover available models
- Maintain model metadata
- Maintain capability metadata
- Maintain context limits
- Maintain output limits
- Maintain modality information
- Maintain tool-calling capability
- Maintain reasoning capability
- Maintain coding capability
- Maintain availability
- Maintain reliability information
- Maintain pricing information
- Maintain performance information
- Maintain recommended runtime modes

## Search capabilities

Users should be able to search by:

- Model
- Provider
- Model family
- Capability
- Context capacity
- Output capacity
- Coding
- Reasoning
- Tool calling
- Vision
- Cost
- Latency
- Reliability
- Availability
- BUILD suitability
- RESEARCH suitability
- CHAT suitability

## Critical requirement

A model must never be represented only as:

"available" or "unavailable."

The runtime must understand:

"What can this model safely do?"

## Integration

Feeds information to:

- Task Classification
- Capability Matching
- Routing Engine
- Recommendations
- Provider Management
- Analytics
- Session Management

---

# SKILL 2 — PROVIDER & CONNECTION MANAGEMENT

## Purpose

Manage all connected AI providers and their connections.

A provider may have:

- Multiple API keys
- Multiple accounts
- Multiple OAuth connections
- Multiple endpoints
- Multiple model families

## Responsibilities

- Add provider
- Remove provider
- Enable/disable connection
- Test connection
- Health check
- Discover models
- Track quotas
- Track rate limits
- Track provider status
- Track connection reliability
- Manage connection priority

## Critical distinction

The system must understand:

Provider
→ Connection
→ Credential/API key
→ Model

These are separate entities.

Do not treat them as one object.

## Security

- Never expose credentials
- Never display complete API keys
- Never place credentials in normal logs
- Never expose credentials to frontend code unnecessarily
- Encrypt sensitive credentials
- Use secure credential retrieval

## Integration

Feeds:

- Model Discovery
- Key Failover
- Routing
- Usage Analytics
- Recovery

---

# SKILL 3 — MODEL CAPABILITY REGISTRY

## Purpose

Maintain the authoritative capability profile of every model.

This Skill is responsible for answering:

"Can this model actually handle this task?"

## Capability dimensions

Track at minimum:

- Context window
- Maximum output
- Coding
- Reasoning
- Tool calling
- Vision
- Audio/multimodal support
- Structured output
- Long-context suitability
- Agentic suitability
- Reliability
- Latency
- Cost
- Availability
- Quota

## Capability classes

Models should be categorized dynamically into suitability classes such as:

### BUILD-LONG

Strong model suitable for serious software development and long-running
stateful tasks.

### BUILD-FALLBACK

Strong compatible model suitable for taking over BUILD work after a
checkpointed handoff.

### RESEARCH-LONG

Large-context model suitable for long documents and complex research.

### RESEARCH-MEDIUM

Suitable for structured follow-up questions and moderate analysis.

### CHAT-FAST

Fast, inexpensive models suitable for simple conversations.

### CHAT-CHEAP

Lowest-cost models that satisfy basic chat requirements.

### UNSUITABLE

Models that do not satisfy the requirements of a specific task.

These are suitability classifications, not permanent labels.

---

# SKILL 4 — TASK CLASSIFICATION

## Purpose

Understand what the user is actually trying to accomplish before routing
the request.

## Primary task modes

### BUILD

Examples:

- Build website
- Modify application
- Build software
- Debug repository
- Implement feature
- Refactor code
- Deploy application
- Execute multi-step coding workflow

BUILD is stateful.

### RESEARCH / DOCUMENT

Examples:

- Read PDF
- Analyze document
- Study research material
- Compare documents
- Extract knowledge
- Answer questions from a large document

RESEARCH may be stateful or semi-stateful.

### CHAT

Examples:

- Simple questions
- Casual conversation
- Brainstorming
- Small transformations
- Short explanations

CHAT is generally stateless.

## Classification factors

Do not classify only from keywords.

Consider:

- Current workspace
- Current project
- Existing repository
- Current session
- Current task
- Files
- Tool requirements
- Context requirements
- Expected output
- Previous requests
- Existing state

## Output

The Skill must produce:

- Task mode
- Statefulness
- Capability requirements
- Context requirements
- Output requirements
- Tool requirements
- Coding requirement
- Reasoning requirement
- Vision requirement
- Long-running requirement
- Project scope

---

# SKILL 5 — INTELLIGENT ROUTING ENGINE

## Purpose

Select the most appropriate model for a task.

This is the central decision-making Skill.

## Routing sequence

Task Classification

↓

Capability Requirements

↓

Capability Floor

↓

Available Models

↓

Compatible Models

↓

Provider Health

↓

Connection Health

↓

Key Health

↓

Model Ranking

↓

Model Selection

↓

Session Policy

## Hard requirements

A model must first satisfy:

- Required context
- Required output capacity
- Required coding capability
- Required reasoning capability
- Required tool calling
- Required modality
- Required task type

Only compatible models proceed to ranking.

## Soft ranking

Rank compatible models using:

- Reliability
- Quality
- Latency
- Cost
- Quota
- Provider health
- Historical success
- Task-specific performance

## Critical rule

A cheap incompatible model must NEVER outrank an expensive compatible model.

---

# SKILL 6 — RUNTIME MODE POLICY

## Purpose

Apply different routing behavior depending on the type of work.

---

## BUILD POLICY

BUILD is continuity-first.

Default behavior:

Strong Model

↓

Same Model / Alternate Key

↓

Same Model / Alternate Connection

↓

Checkpoint

↓

Compatible Strong Model

↓

Handoff

↓

Verify

↓

Continue

Never:

Strong Model

↓

Small Model

↓

Cheap Model

↓

Random Model

---

## RESEARCH POLICY

Research prioritizes:

- Context
- Reasoning
- Accuracy
- Document understanding

Follow-up questions may use cheaper models when structured document
memory provides sufficient context.

Complex questions should escalate to a stronger model.

---

## CHAT POLICY

Chat prioritizes:

- Speed
- Cost
- Availability

Multiple cheap/fast models may be used.

Aggressive fallback is acceptable.

---

# SKILL 7 — SESSION MANAGEMENT & MODEL PINNING

## Purpose

Maintain continuity during an active task.

Every stateful task receives a Session.

A Session contains:

- Project
- Task
- Mode
- Current model
- Pinned model
- Provider
- Connection
- Current key
- State
- Checkpoint
- Current objective
- Completed work
- Remaining work
- Next action
- Errors
- Tests

## Model pinning

For BUILD:

Once the runtime selects a suitable primary model, the model becomes
the session's pinned model.

The runtime may rotate:

- API keys
- Connections

without changing the model.

Changing the model requires the model handoff workflow.

---

# SKILL 8 — PROJECT STATE & MEMORY

## Purpose

Maintain persistent state independently from the model's context window.

The model's context is temporary.

The project state is persistent.

## Project state must include

- Objective
- Current phase
- Current task
- Completed tasks
- Remaining tasks
- Architecture
- Files
- File changes
- Decisions
- Dependencies
- Environment requirements
- Tests
- Errors
- Last known good state
- Next action

## Source of truth hierarchy

1. Repository/filesystem
2. Project state
3. Task state
4. Checkpoints
5. Structured decisions
6. Test results
7. Error history
8. Model context

The model must never be considered the sole source of truth.

---

# SKILL 9 — CHECKPOINT MANAGEMENT

## Purpose

Create recoverable project snapshots.

## Checkpoint triggers

Create checkpoints:

- Before model handoff
- After milestones
- Before risky operations
- Before deployment
- After deployment
- Before recovery
- After successful recovery
- After important architecture decisions
- During long-running tasks

## Checkpoint must preserve

- Project state
- Task state
- Repository state
- File changes
- Architecture
- Decisions
- Tests
- Errors
- Current objective
- Next action

## Requirements

Checkpoints must be:

- Persistent
- Versioned
- Recoverable
- Inspectable
- Auditable

---

# SKILL 10 — SAME-MODEL KEY FAILOVER

## Purpose

Recover provider/API failures without changing the model.

This is the first level of fallback.

## Example

Current:

Model A
Key A

Failure:

Rate limit

Recovery:

Model A
Key B

If Key B fails:

Model A
Key C

The model remains unchanged.

## Failure types

Handle:

- Rate limit
- Quota exhaustion
- Authentication failure
- Temporary provider error
- Timeout
- Network error
- Connection failure

## Critical rule

Always prefer same-model recovery before model switching.

---

# SKILL 11 — MODEL HANDOFF & RECOVERY

## Purpose

Safely transfer a stateful task from one model to another compatible model.

This is NOT ordinary fallback.

It is a controlled state transition.

## Handoff sequence

Detect failure

↓

Attempt safe retry

↓

Try alternate key

↓

Try alternate connection

↓

Create checkpoint

↓

Determine capability requirements

↓

Find compatible replacement model

↓

Generate handoff context

↓

Initialize replacement model

↓

Restore state

↓

Inspect project

↓

Verify repository

↓

Resume task

## Handoff context must explain

- Project objective
- Current phase
- Current task
- Completed work
- Remaining work
- Architecture
- Important decisions
- Files changed
- Repository state
- Tests
- Errors
- Dependencies
- Environment requirements
- Last successful action
- Next required action
- Reason for handoff

## Critical rule

The receiving model must inspect the actual project before continuing.

It must not blindly recreate previous work.

---

# SKILL 12 — CONTEXT MANAGEMENT & TOKEN OPTIMIZATION

## Purpose

Reduce unnecessary context transmission while preserving correctness.

## Context layers

Use:

1. Current request
2. Current task
3. Relevant project state
4. Relevant files
5. Relevant diffs
6. Architecture
7. Decisions
8. Checkpoint
9. Historical context only when required

## Do not repeatedly transmit

- Entire project history
- Unrelated files
- Completed task details that are no longer relevant
- Duplicate instructions

## Important

Token optimization must never remove information required for correctness.

---

# SKILL 13 — DOCUMENT MEMORY

## Purpose

Create persistent structured memory from large documents.

## Workflow

Document

↓

Ingestion

↓

Extraction

↓

Structured knowledge

↓

Sections

↓

Facts

↓

Entities

↓

Relationships

↓

References

↓

Document memory

↓

Follow-up questions

The system should use cheaper models for simple follow-ups when the
document memory contains everything required.

Complex or ambiguous questions should escalate to a stronger model.

---

# SKILL 14 — REQUEST PLAYGROUND

## Purpose

Allow users to test models independently.

Users should be able to inspect:

- Model
- Provider
- Connection
- Response
- Latency
- Input usage
- Output usage
- Cost
- Errors
- Capability match
- Routing explanation

The playground must clearly distinguish:

"Testing a model"

from:

"Executing a stateful project session."

Testing a model must not accidentally change the model pinned to a project.

---

# SKILL 15 — MODEL ARENA / COMPARISON

## Purpose

Compare multiple models on the same request.

Compare:

- Quality
- Speed
- Context capability
- Output capability
- Cost
- Reliability
- Tool support
- Coding suitability
- Reasoning suitability

Arena is an evaluation system.

Arena results must not automatically override an active BUILD session.

---

# SKILL 16 — SMART RECOMMENDATIONS

## Purpose

Recommend models based on actual task requirements.

Do not recommend based solely on:

- Popularity
- Lowest cost
- Highest speed
- Provider preference

Recommendations should explain:

- Why this model fits
- Capability match
- Context match
- Output match
- Reliability
- Cost
- Latency
- Fallback safety
- Suitability for the current mode

---

# SKILL 17 — USAGE & RELIABILITY ANALYTICS

## Purpose

Understand actual runtime behavior.

Track:

- Requests
- Tokens
- Input tokens
- Output tokens
- Cost
- Latency
- Success
- Failure
- Rate limits
- Key failures
- Provider failures
- Model failures
- Handoffs
- Checkpoints
- Recovery
- Task completion

Important metrics:

- Model reliability
- Provider reliability
- Key reliability
- Handoff success rate
- Recovery success rate
- Average recovery time
- Task completion rate
- Cost per successful task
- Failure frequency
- Model utilization

---

# SKILL 18 — AUDIT & EVENT LOGGING

## Purpose

Create a transparent history of runtime decisions.

Record events such as:

- Request started
- Task classified
- Model selected
- Model pinned
- Key selected
- Request completed
- Key failed
- Rate limit detected
- Provider failed
- Checkpoint created
- Handoff started
- Handoff completed
- Session resumed
- Task completed

Never record sensitive credentials.

---

# SKILL 19 — SECURITY & CREDENTIAL MANAGEMENT

## Purpose

Protect provider credentials and sensitive project state.

Requirements:

- Secure credential storage
- Encryption
- Masked UI
- No plaintext API keys in logs
- Secure retrieval
- Access control
- Session security
- Project-state security
- Checkpoint security
- Handoff-state security
- Audit logging

Security failures must block unsafe operations.

---

# SKILL 20 — SYSTEM HEALTH & PROVIDER HEALTH

## Purpose

Continuously understand runtime health.

Monitor:

- Provider availability
- Model availability
- Connection health
- Key health
- Rate limits
- Quotas
- Latency
- Error rates
- Recent failures

Health must influence routing.

However:

Health information must never override hard capability requirements.

---

# SKILL 21 — CONFIGURATION & POLICY MANAGEMENT

## Purpose

Allow users to define how the runtime behaves.

Policies include:

- BUILD capability floor
- RESEARCH capability floor
- CHAT capability floor
- Maximum cost
- Maximum latency
- Preferred providers
- Preferred models
- Pinned models
- Fallback behavior
- Handoff behavior
- Retry count
- Checkpoint frequency

Policies must be configurable.

---

# SKILL 22 — WORKSPACE MANAGEMENT

## Purpose

Organize persistent projects and sessions.

Structure:

Workspace

→ Projects

→ Sessions

→ Tasks

→ State

→ Checkpoints

→ Providers

→ Models

→ Logs

→ Analytics

Different projects can have different policies.

---

# SKILL 23 — AGENT SKILL ORCHESTRATOR

## Purpose

Coordinate Skills without loading every Skill into context.

## Progressive loading

At discovery:

Load:

- Skill names
- Skill descriptions
- Triggers
- Capabilities

When required:

Load the complete Skill instructions.

During execution:

Load only the relevant context.

## Example flow

User requests:

"Build the authentication system."

The orchestrator should activate:

Task Classification

→ Capability Registry

→ Routing Engine

→ Session Management

→ Project State

→ Build Execution

If a model fails:

Key Failover

→ Checkpoint

→ Model Handoff

→ State Restoration

→ Resume

Do not activate unrelated Skills.

---

# SKILL DEPENDENCY PRINCIPLES

The core dependency chain is:

MODEL DISCOVERY
↓
CAPABILITY REGISTRY
↓
TASK CLASSIFICATION
↓
ROUTING
↓
SESSION
↓
EXECUTION
↓
STATE
↓
CHECKPOINT
↓
RECOVERY
↓
HANDOFF
↓
VERIFICATION

Provider and credential management support the entire chain.

Analytics observes the entire chain.

---

# SKILL COMMUNICATION RULES

Skills must communicate through structured state.

Never depend on informal text alone.

Every Skill-to-Skill interaction should have:

- Input
- Output
- Context
- State
- Errors
- Request/session identifier

Stateful operations must carry the active project/session identity.

---

# STATE PERSISTENCE RULE

Any important decision that may affect future execution should be persisted.

Examples:

- Selected model
- Pinned model
- Routing reason
- Capability requirements
- Current task
- Completed task
- Checkpoint
- Error
- Handoff
- Recovery result
- Important architecture decision

---

# ERROR RECOVERY RULE

Every Skill must define:

1. Failure detection
2. Failure classification
3. Safe retry
4. Recovery action
5. State preservation
6. User notification
7. Audit event

Never create generic fallback behavior that ignores task state.

---

# BUILD CONTINUITY RULE

For BUILD tasks:

The project must survive:

- API-key failure
- Provider failure
- Timeout
- Rate limit
- Model unavailability
- Session interruption
- Runtime restart
- Model handoff

The project should resume from persistent state rather than relying on
the previous model remembering everything.

---

# MODEL SWITCHING RULE

Model switching is allowed only when:

1. The current model cannot continue.
2. Same-model connection recovery has been attempted when appropriate.
3. A checkpoint exists.
4. The replacement model satisfies the capability floor.
5. A handoff package is created.
6. The new model restores the project state.
7. The project state is verified.
8. The user is informed when the model changes.

---

# UNSAFE FALLBACK RULE

The following behavior is prohibited:

A strong BUILD model fails
→ automatically select a small model
→ continue coding
→ hope the model understands the project.

Instead:

Strong BUILD model fails
→ recover same model
→ checkpoint
→ compatible-model selection
→ state reconstruction
→ verification
→ continue.

---

# QUALITY RULE

A Skill is not complete simply because its UI exists.

A Skill is complete only when:

- Its responsibility is clear.
- Its state is defined.
- Its inputs/outputs are defined.
- Its integrations work.
- Its failure behavior works.
- Its security requirements work.
- Its tests pass.
- It preserves existing functionality.

---

# SKILL IMPLEMENTATION CHECKLIST

For every Skill:

- Skill identity defined
- Description defined
- Triggers defined
- Capabilities defined
- Inputs defined
- Outputs defined
- Dependencies mapped
- State requirements defined
- Workflow defined
- Error handling defined
- Security requirements defined
- Integration points defined
- Tests defined
- Documentation defined
- Completion criteria defined

---

# MASTER VALIDATION SCENARIO

The complete Skill system must successfully support:

A user starts a large software project.

The system identifies:

BUILD
STATEFUL
CODING
TOOL USE
LONG RUNNING

A strong large-context model is selected.

The model becomes pinned.

The model completes part of the project.

Its API key reaches a rate limit.

The system switches to another key for the SAME model.

The project continues.

Later the entire provider becomes unavailable.

The system creates a checkpoint.

It evaluates compatible models.

It selects another strong model.

It creates a handoff package.

The new model reads the project state.

It inspects the repository.

It understands completed work.

It understands remaining work.

It continues from the correct point.

It does not recreate completed work.

The project reaches completion.

The runtime records:

- Model used
- Keys used
- Failures
- Checkpoints
- Handoff
- Recovery
- Completion
- Usage
- Cost
- Reliability

This scenario is the benchmark for the entire Agent Skills architecture.

---

# FINAL ARCHITECTURAL PRINCIPLE

The Agent Skills system must not be designed around:

"Which AI can answer this request?"

It must be designed around:

"What work is happening?"

"What capabilities does that work require?"

"What state already exists?"

"Which model can safely continue?"

"What happens if that model fails?"

"How can another model continue without losing the work?"

The result should behave like one continuous AI runtime even though many
different models, providers, connections, and keys may exist underneath it.

# END OF AGENT SKILLS TEMPLATES
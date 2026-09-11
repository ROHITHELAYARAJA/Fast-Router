# ANTIGRAVITY QUICKSTART
# Stateful AI Runtime & Intelligent Model Orchestration Platform

---

# START HERE

You are working on an existing AI platform.

Your mission is to transform the existing platform into a:

STATEFUL AI RUNTIME

with:

- Intelligent model routing
- Capability-aware model selection
- BUILD / RESEARCH / CHAT modes
- Persistent project state
- Model pinning
- Same-model key failover
- Provider recovery
- Checkpointing
- Safe model handoff
- Context reconstruction
- Token-efficient execution
- Verification
- Usage and reliability analytics

Do not treat this as a simple multi-provider AI dashboard.

Do not build a basic 9Router clone.

The objective is:

MAKE MULTIPLE AI MODELS BEHAVE LIKE ONE CONTINUOUS AI SYSTEM.

---

# IMPORTANT DEVELOPMENT RULE

This is an EXISTING PROJECT.

Before changing anything:

INSPECT → UNDERSTAND → DOCUMENT → PRESERVE → EXTEND → TEST

Never begin by rewriting the application.

Never delete working functionality simply because a new architecture is preferred.

Never replace existing infrastructure without understanding its dependencies.

---

# YOUR PRIMARY OBJECTIVE

Convert the current AI platform from:

"Connect many AI models and switch between them"

into:

"Understand the task, select the right model, preserve state, recover safely, and continue work across model failures."

The runtime must prioritize:

1. Correctness
2. Capability
3. Continuity
4. Reliability
5. Recovery
6. Quality
7. Cost
8. Speed

Do not reverse this order for BUILD tasks.

---

# PHASE 1 — INSPECT THE EXISTING PROJECT

Before implementing new features, inspect the complete project.

Determine:

- Framework
- Frontend architecture
- Backend architecture
- Database
- Authentication
- API routes
- Existing provider system
- Existing model system
- Existing routing system
- Existing fallback system
- Existing API-key management
- Existing workspace system
- Existing UI
- Existing state management
- Existing tests
- Existing configuration
- Existing environment variables
- Existing security mechanisms

Understand what already exists.

Do not assume the architecture.

---

# CREATE AN EXISTING-SYSTEM MAP

Document:

- Existing routes
- Existing APIs
- Existing components
- Existing services
- Existing database models
- Existing provider integrations
- Existing authentication
- Existing environment configuration
- Existing state management
- Existing tests

Also identify:

- What must remain untouched
- What can be extended
- What should be refactored
- What is obsolete
- What is missing

---

# CREATE A DO-NOT-BREAK BOUNDARY

Protect:

- Authentication
- Existing users
- Existing provider connections
- Existing API routes
- Existing database data
- Existing working features
- Existing design system
- Existing security controls

Any modification to an existing system must have a clear reason.

---

# PHASE 2 — UNDERSTAND THE CURRENT PROVIDER ARCHITECTURE

Before implementing routing, understand how the current application represents:

Provider

Connection

Credential

Model

Request

Session

Workspace

Fallback

Usage

Separate these concepts if they are currently mixed together.

The final architecture must understand:

Provider
→ Connection
→ Credential
→ Model

These are NOT the same thing.

---

# PHASE 3 — BUILD THE MODEL CAPABILITY REGISTRY

Create the foundation for intelligent routing.

Every connected model must have capability information.

Track:

- Provider
- Model
- Model family
- Context window
- Maximum output
- Coding
- Reasoning
- Tool calling
- Vision
- Multimodal support
- Structured output
- Reliability
- Latency
- Cost
- Quota
- Availability

Do not invent capabilities.

If capability information is unavailable, mark it as unknown.

Do not assume an unknown capability is supported.

---

# PHASE 4 — IMPLEMENT TASK CLASSIFICATION

The runtime must determine what the user is actually doing.

Primary modes:

## BUILD

For:

- Websites
- Applications
- Software
- Repositories
- Coding
- Debugging
- Refactoring
- Deployment
- Long-running agentic work

BUILD is stateful.

---

## RESEARCH / DOCUMENT

For:

- Large documents
- PDFs
- Research
- Study
- Document comparison
- Knowledge extraction
- Long-context analysis

RESEARCH may be stateful.

---

## CHAT

For:

- Simple questions
- Brainstorming
- Casual conversations
- Short transformations
- Simple explanations

CHAT can prioritize speed and cost.

---

# PHASE 5 — IMPLEMENT CAPABILITY-AWARE ROUTING

The router must NOT simply select:

"the next available model."

Instead:

CLASSIFY TASK

↓

DETERMINE REQUIREMENTS

↓

FILTER INCOMPATIBLE MODELS

↓

CHECK PROVIDER HEALTH

↓

CHECK CONNECTION HEALTH

↓

CHECK KEY HEALTH

↓

RANK COMPATIBLE MODELS

↓

SELECT MODEL

The router must explain its decision.

Example:

"Selected Model A because:

- BUILD task
- coding required
- long context required
- tool calling required
- current project requires large context
- provider healthy
- connection healthy
- reliability above threshold"

---

# PHASE 6 — IMPLEMENT BUILD MODE

BUILD is the most important mode.

When BUILD begins:

1. Classify task
2. Determine capability requirements
3. Select compatible strong model
4. Pin model to session
5. Create project state
6. Begin execution
7. Save progress
8. Create checkpoints
9. Verify important milestones

Do not silently downgrade the model.

---

# BUILD MODEL PINNING

Once a BUILD model is selected:

PIN THE MODEL.

The session should continue using that model.

If the current API key fails:

Use another key for the same model.

If another connection exists:

Use another connection for the same model.

Do not immediately change models.

---

# PHASE 7 — IMPLEMENT SAME-MODEL KEY FAILOVER

Failure hierarchy:

CURRENT KEY

↓

ALTERNATE KEY

↓

ALTERNATE CONNECTION

↓

RETRY

↓

CHECKPOINT

↓

MODEL HANDOFF

The first recovery attempt should preserve the model.

Example:

Model A
Key 1

fails.

↓

Model A
Key 2

The model remains Model A.

This is NOT a model handoff.

---

# PHASE 8 — IMPLEMENT PROJECT STATE

The model context must not be the only place where project information exists.

Create persistent project state.

Project state must contain:

- Objective
- Current phase
- Current task
- Completed tasks
- Remaining tasks
- Architecture
- Decisions
- Files changed
- Dependencies
- Environment requirements
- Tests
- Errors
- Last known good state
- Next action

The repository/filesystem remains the source of truth for code.

---

# PHASE 9 — IMPLEMENT CHECKPOINTS

Checkpoints are mandatory for long-running BUILD tasks.

Create checkpoints:

- Before model handoff
- After important milestones
- Before risky changes
- Before deployment
- After successful deployment
- During recovery
- Before major state transitions

Each checkpoint must allow the project to resume safely.

---

# PHASE 10 — IMPLEMENT MODEL HANDOFF

A model handoff is NOT ordinary fallback.

When the current model can no longer continue:

1. Detect failure
2. Classify failure
3. Retry safely
4. Try alternate key
5. Try alternate connection
6. Create checkpoint
7. Determine required capabilities
8. Find compatible model
9. Prepare handoff package
10. Initialize new model
11. Restore project state
12. Inspect repository
13. Verify existing work
14. Continue from the correct point

The replacement model must NOT restart the project from the beginning.

---

# HANDOFF PACKAGE

The receiving model must know:

- Project objective
- Current phase
- Current task
- Completed work
- Remaining work
- Architecture
- Important decisions
- Files modified
- Repository state
- Dependencies
- Environment
- Tests
- Errors
- Last successful action
- Next action
- Reason for handoff

Keep this structured and concise.

Do not send the entire conversation unless necessary.

---

# PHASE 11 — IMPLEMENT RESEARCH / DOCUMENT MODE

When a large document is provided:

1. Ingest document
2. Understand structure
3. Extract important information
4. Create structured document memory
5. Preserve references
6. Store relevant knowledge
7. Answer follow-up questions using document memory

Do not repeatedly resend the entire document unnecessarily.

Use stronger models for difficult document reasoning.

Use cheaper models for simple follow-up questions when sufficient structured
memory exists.

---

# PHASE 12 — IMPLEMENT CHAT MODE

CHAT should prioritize:

- Speed
- Availability
- Cost

Multiple models may be used.

Aggressive fallback is acceptable when no persistent project state is involved.

CHAT should not inherit BUILD's strict model-pinning behavior unless the user
is working inside an active stateful project session.

---

# PHASE 13 — IMPLEMENT SESSION MANAGEMENT

Create explicit session state.

Every stateful session must identify:

- Session
- Workspace
- Project
- Mode
- Current model
- Pinned model
- Provider
- Connection
- Current credential/key
- Current task
- Project state
- Checkpoint
- Status

Possible states include:

- Starting
- Running
- Waiting
- Recovering
- Checkpointing
- Handoff
- Verifying
- Completed
- Failed
- Paused

---

# PHASE 14 — IMPLEMENT TOKEN-EFFICIENT CONTEXT

The runtime must not repeatedly send unnecessary context.

Prefer:

- Current task
- Relevant files
- Relevant diffs
- Project state
- Architecture
- Decisions
- Current checkpoint
- Relevant errors
- Required instructions

Avoid:

- Entire conversation history
- Unrelated files
- Repeated completed tasks
- Duplicate instructions
- Redundant model metadata

Token optimization must NEVER remove correctness-critical information.

---

# PHASE 15 — IMPLEMENT VERIFICATION

After a model resumes work following recovery or handoff:

VERIFY FIRST.

The model must inspect:

- Repository
- Current files
- Current state
- Recent changes
- Tests
- Errors
- Checkpoint

Then continue.

Do not assume the previous model completed its work correctly.

---

# PHASE 16 — IMPLEMENT AUDIT LOGGING

Record:

- Request
- Task classification
- Model selection
- Routing reason
- Model pin
- Key selection
- Provider
- Request result
- Failure
- Retry
- Key failover
- Checkpoint
- Handoff
- Recovery
- Verification
- Completion

Never record secrets.

---

# PHASE 17 — IMPLEMENT HEALTH MONITORING

Monitor:

- Provider status
- Model status
- Connection status
- Credential status
- Quota
- Rate limits
- Latency
- Error rate
- Reliability

Use health information in routing.

But health must never override hard capability requirements.

---

# PHASE 18 — IMPLEMENT THE PROFESSIONAL COMMAND CENTER

The UI must feel like professional AI infrastructure.

It should NOT look like:

- A gaming dashboard
- A generic chatbot
- A neon crypto interface
- A simple model directory
- A basic provider settings page

The interface should make runtime behavior understandable.

---

# CORE DASHBOARD

Display:

- Active projects
- Active sessions
- Current model
- Pinned model
- Provider health
- Runtime health
- Current task
- Current phase
- Progress
- Recent failures
- Recent checkpoints
- Recent handoffs
- Usage
- Cost
- Reliability

---

# ACTIVE SESSION VIEW

Show:

CURRENT TASK

CURRENT MODEL

PINNED MODEL

PROVIDER

CONNECTION

SESSION STATUS

PROJECT PROGRESS

LAST CHECKPOINT

CURRENT ACTION

NEXT ACTION

RECOVERY STATUS

The user should immediately understand:

"What is the AI doing right now?"

---

# ROUTING VISUALIZER

When a request is routed, show:

Task

↓

Requirements

↓

Compatible Models

↓

Rejected Models

↓

Selected Model

↓

Reason

For failures:

Current Model

↓

Failure

↓

Key Recovery

↓

Checkpoint

↓

Compatible Replacement

↓

Handoff

↓

Verification

↓

Resume

---

# MODEL HANDOFF VIEW

When a handoff occurs, show:

Why the model failed

What recovery was attempted

Checkpoint created

Replacement model

Why replacement model is compatible

State restored

Verification result

Next action

This is one of the most important differentiating UI experiences.

---

# PHASE 19 — BUILD TEST SCENARIOS

Do not consider the system complete until these scenarios work.

---

## TEST 1 — NORMAL BUILD

User requests a serious software project.

System:

- Classifies BUILD
- Selects compatible strong model
- Pins model
- Creates project state
- Executes task
- Saves progress
- Completes successfully

---

## TEST 2 — API KEY FAILURE

During BUILD:

Current model key fails.

System:

- Detects failure
- Uses alternate key
- Keeps same model
- Continues work
- Records recovery

---

## TEST 3 — MODEL HANDOFF

During BUILD:

Current provider becomes unavailable.

System:

- Detects failure
- Attempts recovery
- Creates checkpoint
- Finds compatible replacement
- Creates handoff state
- Starts replacement model
- Restores project state
- Inspects repository
- Continues
- Does not repeat completed work

---

## TEST 4 — NO COMPATIBLE MODEL

Current model fails.

No compatible replacement exists.

System must:

PAUSE SAFELY.

Do NOT:

- Downgrade silently
- Use an incompatible model
- Destroy state
- Restart the project

Tell the user that no compatible model is currently available.

Preserve the project for later continuation.

---

## TEST 5 — RESEARCH

User provides a large document.

System:

- Selects suitable long-context model
- Ingests document
- Creates structured memory
- Answers follow-up questions
- Uses cheaper models when safe
- Escalates complex questions when required

---

## TEST 6 — CHAT

User asks a simple question.

System:

- Classifies CHAT
- Selects fast/cheap compatible model
- Responds quickly
- Uses normal fallback if required

---

# PHASE 20 — TEST STATE CONTINUITY

Test:

Model A completes approximately 20% of a large project.

Model A fails.

Model B takes over.

The system must prove that Model B knows:

- What was already completed
- What remains
- Which files changed
- Which architecture decisions were made
- Which tests passed
- Which errors remain
- What it should do next

Model B must continue instead of rebuilding completed work.

---

# PHASE 21 — TEST TOKEN EFFICIENCY

Verify that model handoff does not require transmitting the entire history.

Measure:

- Context size
- Relevant context
- Redundant context
- State size
- Handoff package size

The system should provide the receiving model with the smallest context
that preserves correctness.

---

# PHASE 22 — TEST SECURITY

Verify:

- Credentials are protected
- Keys are masked
- Secrets do not appear in logs
- Sensitive state is protected
- Unauthorized users cannot access provider credentials
- Handoff state does not expose secrets

---

# PHASE 23 — TEST REGRESSION

After every major change:

Verify:

- Existing routes
- Existing APIs
- Authentication
- Existing provider connections
- Existing UI
- Existing database behavior
- Existing tests
- Existing user workflows

Nothing should break simply because the runtime architecture was upgraded.

---

# IMPLEMENTATION ORDER

Follow this order.

1. Existing project inspection
2. Existing architecture documentation
3. Provider/connection/model separation
4. Model capability registry
5. Task classification
6. Capability-aware routing
7. Session management
8. Model pinning
9. Project state
10. Checkpoint system
11. Same-model key failover
12. Model handoff
13. Verification
14. Token-efficient context
15. Research/document memory
16. Health monitoring
17. Audit logs
18. Analytics
19. Command center UI
20. Routing visualizer
21. Handoff UI
22. Full testing

Do not build the visual dashboard first and connect the runtime later.

The runtime architecture is the foundation.

---

# DEVELOPMENT RULES FOR ANTIGRAVITY

Work incrementally.

After each major subsystem:

1. Implement
2. Test
3. Verify
4. Document
5. Integrate
6. Regression test

Do not implement the entire system blindly in one pass.

---

# AGENT EXECUTION RULE

Before modifying a file:

Understand why the file exists.

Before modifying an API:

Understand who uses it.

Before modifying the database:

Understand existing data.

Before replacing a routing system:

Understand its current behavior.

Before replacing fallback:

Understand current provider recovery.

Before introducing a new Skill:

Check whether another Skill already owns that responsibility.

---

# DO NOT CREATE DUPLICATE SYSTEMS

Do not create:

- Multiple competing routers
- Multiple session managers
- Multiple checkpoint stores
- Multiple provider registries
- Multiple credential stores
- Multiple project-state systems

There must be one authoritative runtime state.

---

# FINAL DEFINITION OF DONE

The platform is complete only when:

A user can start a serious BUILD task.

The system identifies the task correctly.

The system selects a capable model.

The model becomes pinned.

The project state persists independently.

The model can survive API-key failures.

The system can create checkpoints.

The system can safely hand off to another compatible model.

The receiving model can reconstruct the task.

The receiving model can inspect the repository.

The receiving model can continue without repeating completed work.

The system can verify the resumed state.

The system can pause safely when no compatible model exists.

The system records the complete runtime history.

The system minimizes unnecessary token usage.

The existing application remains functional.

The entire workflow is visible and understandable through the UI.

---

# THE CORE TEST

The final product must demonstrate:

ONE PROJECT

MULTIPLE MODELS

MULTIPLE PROVIDERS

MULTIPLE KEYS

ONE CONTINUOUS STATE

ONE CONTINUOUS WORKFLOW

The user should feel that they are working with ONE reliable AI system,
not manually switching between different AI models.

---

# FINAL PRODUCT PRINCIPLE

Do not build:

"An app that connects many AI models."

Build:

"An intelligent runtime that knows which model should work, remembers what
has already happened, protects the project's state, recovers from failures,
and safely transfers work between compatible models."

That is the core of the product.

# END OF ANTIGRAVITY QUICKSTART
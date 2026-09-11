You are the lead architect, product engineer, AI systems engineer, and reliability engineer responsible for transforming the existing project into a professional Stateful AI Runtime and Intelligent Model Orchestration Platform.

Your job is NOT to build another generic AI chatbot, model directory, or simple API gateway.

The goal is to make multiple AI models behave like ONE continuous, stateful AI engineering system.

The existing project must be inspected, understood, preserved, and extended. Do not blindly rewrite working functionality. Do not remove existing capabilities unless they directly conflict with the new architecture and the reason is documented.

==================================================
1. EXECUTIVE DIRECTIVE
==================================================

Build a professional AI infrastructure platform that can intelligently work across multiple AI providers, models, connections, and API keys while preserving project continuity.

The central product promise is:

"One continuous AI runtime across many models."

The user should be able to start a serious task with one AI model and continue working even when:

- an API key reaches its limit
- a provider becomes unavailable
- a connection fails
- a model becomes unavailable
- the model reaches its context limitation
- the model reaches its output limitation
- latency becomes unacceptable
- provider reliability drops
- another compatible model becomes a better option

The system must recover intelligently without unnecessarily restarting work or forcing the user to repeat context.

The platform must understand that switching models is fundamentally different from switching API keys.

The system must preserve:

- project state
- task state
- repository state
- decisions
- architecture
- files
- completed work
- remaining work
- tests
- errors
- checkpoints
- relevant context
- previous actions
- next action

The user should experience continuity rather than "fallback."

==================================================
2. CORE PRODUCT VISION
==================================================

The platform should combine:

- multi-provider AI access
- model discovery
- model capability intelligence
- intelligent routing
- runtime modes
- session management
- model pinning
- API-key rotation
- provider failover
- capability-aware model switching
- persistent project memory
- checkpoints
- model handoff
- context management
- token optimization
- verification
- observability
- audit logging
- professional developer tooling

The product must behave like an AI runtime rather than a collection of unrelated model integrations.

The core loop is:

REQUEST
→ CLASSIFY
→ UNDERSTAND REQUIREMENTS
→ SELECT CAPABLE MODEL
→ START SESSION
→ PIN MODEL
→ EXECUTE
→ SAVE STATE
→ CHECKPOINT
→ MONITOR
→ DETECT FAILURE
→ RECOVER
→ ROTATE KEY IF POSSIBLE
→ SWITCH CONNECTION IF POSSIBLE
→ CHECK MODEL COMPATIBILITY
→ HANDOFF ONLY WHEN REQUIRED
→ RESTORE STATE
→ VERIFY
→ CONTINUE

==================================================
3. FUNDAMENTAL ARCHITECTURAL PRINCIPLE
==================================================

Separate these concepts completely:

PROVIDER
CONNECTION
API KEY / CREDENTIAL
MODEL
MODEL FAMILY
CAPABILITY
SESSION
PROJECT
TASK
CONTEXT
CHECKPOINT
HANDOFF
EXECUTION
RESULT

Never treat an API key as the model.

Never treat a provider as the model.

Never assume two models are interchangeable.

Never perform blind model fallback.

The routing system must know:

- which provider owns the model
- which connections are available
- which keys are available
- which model is being used
- which capabilities the model supports
- which limits apply
- which session is active
- which project is active
- which task is active
- what state must survive a failure

==================================================
4. API-KEY FAILOVER VS MODEL FAILOVER
==================================================

This distinction is one of the most important parts of the entire platform.

A key failure does NOT automatically mean a model failure.

Preferred recovery hierarchy:

LEVEL 1
Same model + alternate API key

LEVEL 2
Same model + alternate connection

LEVEL 3
Same model + alternate provider connection when equivalent availability exists

LEVEL 4
Checkpoint current state

LEVEL 5
Find another model with sufficient capability

LEVEL 6
Create a model handoff package

LEVEL 7
Initialize the new model with the recovered state

LEVEL 8
Verify repository/project state

LEVEL 9
Continue the task

Never silently downgrade a serious task to a weaker model simply because it is available.

==================================================
5. MODEL FAILOVER IS NOT SIMPLE FALLBACK
==================================================

A model switch must be treated as a controlled handoff.

Before switching models:

- determine why the switch is required
- determine what capability was required
- determine what capability is still required
- create or load a recent checkpoint
- collect project state
- collect task state
- collect relevant files
- collect decisions
- collect architecture information
- collect test results
- collect errors
- collect dependencies
- identify the last successful action
- identify the next required action
- identify the previous model
- identify the reason for handoff

The new model must not simply receive a large raw conversation history.

It should receive a structured handoff package containing only the information required to continue correctly.

==================================================
6. RUNTIME MODES
==================================================

The system must support three primary runtime modes.

------------------------------------------
BUILD MODE
------------------------------------------

BUILD mode is for:

- application development
- website development
- software engineering
- repository work
- agent development
- debugging
- refactoring
- testing
- deployment
- architecture implementation
- long-running technical tasks

BUILD mode requires:

- strong coding capability
- sufficient context
- sufficient output capability
- tool support when required
- reasoning capability when required
- reliable execution
- project state persistence
- checkpointing
- safe recovery
- model pinning

Once BUILD mode begins, select an appropriate strong model and pin it for the session.

Do not randomly change models between requests.

If the API key fails, rotate to another key for the SAME MODEL first.

Only change models when necessary.

------------------------------------------
RESEARCH / DOCUMENT MODE
------------------------------------------

This mode is designed for:

- large documents
- research
- analysis
- reports
- study
- document comparison
- long-form reasoning
- evidence extraction
- structured knowledge

The system should prioritize:

- context capacity
- reasoning quality
- document understanding
- reliable retrieval
- structured document memory
- evidence preservation

The platform should avoid repeatedly sending entire documents to every model.

Instead:

INGEST
→ UNDERSTAND
→ STRUCTURE
→ STORE DOCUMENT MEMORY
→ RETRIEVE RELEVANT INFORMATION
→ ANSWER

A cheaper model may handle simple follow-up questions when appropriate.

Complex questions should be escalated to a stronger compatible model.

------------------------------------------
CHAT MODE
------------------------------------------

CHAT mode is for:

- simple questions
- casual conversations
- lightweight assistance
- short tasks
- low-risk requests

Chat mode can prioritize:

- speed
- low cost
- availability

Aggressive fallback is acceptable here because the state requirements are lower.

==================================================
7. TASK CLASSIFICATION
==================================================

Every incoming request must be classified before routing.

Possible task dimensions include:

- chat
- coding
- debugging
- architecture
- research
- document analysis
- summarization
- extraction
- reasoning
- tool execution
- vision
- structured output
- data analysis
- long-context processing
- multi-step agent execution

Classification should determine:

- runtime mode
- required capabilities
- context requirements
- output requirements
- reliability requirements
- tool requirements
- acceptable latency
- cost sensitivity
- whether model pinning is required
- whether state persistence is required

==================================================
8. MODEL CAPABILITY REGISTRY
==================================================

Create a structured capability registry for every model.

The registry should contain, where available:

- provider
- model ID
- model family
- context window
- maximum output
- coding capability
- reasoning capability
- tool calling
- vision
- structured output
- multimodal support
- reliability
- historical success rate
- latency
- pricing
- quota information
- availability
- provider health
- known limitations
- supported runtime modes

Do not hardcode assumptions about model capabilities when information can be discovered or configured.

The architecture must allow model metadata to evolve.

==================================================
9. CAPABILITY FLOOR
==================================================

Every task must have a minimum capability requirement.

For example:

A coding task may require:

- coding support
- tool support
- sufficient context
- sufficient output
- strong reliability

A document task may require:

- sufficient context
- document understanding
- reasoning
- structured output

A vision task requires:

- vision support

A model that fails the hard capability requirements must not be selected simply because it is cheap or available.

First apply HARD FILTERS.

Then apply SOFT SCORING.

==================================================
10. INTELLIGENT ROUTING ENGINE
==================================================

Routing must happen in two stages.

------------------------------------------
STAGE 1 — HARD FILTER
------------------------------------------

Remove models that cannot satisfy:

- context requirements
- output requirements
- modality requirements
- coding requirements
- reasoning requirements
- tool requirements
- structured-output requirements
- runtime-mode requirements

------------------------------------------
STAGE 2 — SOFT SCORE
------------------------------------------

Among compatible models, score based on:

- reliability
- quality
- latency
- cost
- quota availability
- provider health
- historical success
- task fit
- current system load
- session continuity

The routing decision must be explainable.

The system should be able to answer:

"Why was this model selected?"

Example reasoning:

- required context: available
- coding capability: supported
- tools: supported
- provider health: healthy
- reliability: high
- latency: acceptable
- cost: within policy
- session continuity: preferred

==================================================
11. SESSION PINNING
==================================================

Once a serious BUILD session begins:

- select the best compatible model
- pin that model
- keep the model stable
- rotate keys when necessary
- rotate connections when necessary
- do not change models unnecessarily

Model switching should be exceptional rather than routine.

The session must maintain:

- session ID
- project ID
- task ID
- pinned model
- provider
- connection
- active credential reference
- runtime mode
- routing decision
- checkpoint reference
- current state

==================================================
12. PROJECT STATE IS MORE IMPORTANT THAN MODEL CONTEXT
==================================================

The repository or persistent project state is the ultimate source of truth.

Priority order:

1. Repository / filesystem
2. Project state
3. Task state
4. Checkpoints
5. Structured decisions
6. Test results
7. Error history
8. Model context

Never make the model's conversation history the only source of truth.

If a model disappears, the project must remain understandable.

==================================================
13. PROJECT STATE MANIFEST
==================================================

Every serious project should maintain structured state containing:

- project objective
- project description
- current phase
- current task
- completed tasks
- remaining tasks
- files created
- files modified
- files deleted
- architecture
- important decisions
- dependencies
- environment requirements
- tests
- test results
- known errors
- resolved errors
- last-known-good state
- current checkpoint
- previous checkpoint
- next action
- current risks
- active constraints

This state must survive model changes.

==================================================
14. CHECKPOINT SYSTEM
==================================================

Create checkpoints:

- before major model handoff
- before risky changes
- after major milestones
- before deployment
- after successful deployment
- before recovery
- when a long-running task reaches an important stage

A checkpoint should capture enough information to resume safely.

Checkpoint contents should include:

- project state
- task state
- repository state
- decisions
- architecture
- relevant files
- tests
- errors
- dependencies
- current objective
- completed work
- remaining work
- last successful action
- next action
- timestamp
- previous model
- session information

==================================================
15. MODEL HANDOFF PACKAGE
==================================================

When a model switch is required, create a structured handoff package.

The handoff package should contain:

OBJECTIVE
Current objective.

PHASE
Current development phase.

CURRENT TASK
What is being worked on now.

COMPLETED
What has already been completed.

REMAINING
What still needs to be done.

ARCHITECTURE
Important architectural decisions.

PROJECT STATE
Current repository and project state.

FILES
Relevant files and their current status.

DECISIONS
Important decisions that must not be reversed without reason.

TESTS
Tests already run and their results.

ERRORS
Known errors and attempted fixes.

DEPENDENCIES
Relevant dependencies and environment requirements.

PREVIOUS MODEL
The model that was previously executing the task.

HANDOFF REASON
Why the switch occurred.

LAST SUCCESSFUL ACTION
The last verified successful action.

NEXT ACTION
The exact next action required.

The new model must use this information to continue rather than restart.

==================================================
16. HANDOFF SAFETY
==================================================

Before the new model continues:

1. Load project state.
2. Load checkpoint.
3. Inspect the repository.
4. Verify the actual current state.
5. Compare repository state with checkpoint state.
6. Detect any mismatch.
7. Confirm completed work.
8. Confirm remaining work.
9. Run relevant verification when necessary.
10. Continue from the next action.

Never assume the previous model's description is correct without checking the actual project state.

==================================================
17. NO-COMPATIBLE-MODEL POLICY
==================================================

If no available model satisfies the minimum capability requirements:

DO NOT:

- silently downgrade
- pretend the task continued successfully
- destroy state
- restart from zero
- fabricate completion

Instead:

- checkpoint the current state
- explain the blocking requirement
- identify what capability is missing
- pause safely
- wait for a compatible model/provider/connection

Correctness is more important than availability.

==================================================
18. COMBO PROVIDER POLICY
==================================================

Support provider configurations that expose:

- multiple API keys
- multiple connections
- multiple models
- custom endpoints
- compatible provider aliases
- user-configured credentials

Treat every connection independently.

A provider may expose several models.

A model may be available through multiple connections.

A connection may have independent health and quota state.

The routing system must understand these relationships.

==================================================
19. PROVIDER MANAGEMENT
==================================================

Provide a professional provider management system.

Users should be able to:

- add providers
- configure connections
- configure API keys
- enable/disable connections
- view health
- view usage
- view quota
- view latency
- view failures
- configure priorities
- configure routing policies
- test connections

Never display secrets in logs or UI.

Secrets must be stored and handled securely.

==================================================
20. AI MODEL DISCOVERY
==================================================

The platform should support model discovery.

Discovery should identify:

- provider
- model
- capabilities
- limits
- context
- output
- pricing
- availability
- supported modalities
- tools
- reliability information

Discovered models should enter the model registry.

Users should be able to inspect model capabilities before using them.

==================================================
21. REQUEST PLAYGROUND
==================================================

Provide a professional playground where users can:

- enter a request
- select runtime mode
- view detected task type
- see required capabilities
- see candidate models
- see selected model
- inspect routing reasoning
- compare estimated cost
- compare latency
- test providers
- inspect output
- inspect execution metadata

The playground should help users understand how the routing system behaves.

==================================================
22. MODEL ARENA
==================================================

Provide a model comparison environment.

Users should be able to compare compatible models based on:

- quality
- latency
- cost
- context
- reasoning
- coding
- tool support
- reliability
- task-specific performance

The comparison should be useful for engineering decisions rather than just displaying benchmark numbers.

==================================================
23. PROJECT WORKSPACES
==================================================

Provide project-based workspaces.

A workspace should contain:

- project identity
- active sessions
- project state
- tasks
- checkpoints
- model history
- provider history
- files
- decisions
- tests
- errors
- audit events

Projects should remain understandable even after the active model changes.

==================================================
24. DOCUMENT MEMORY
==================================================

For research and document workflows:

- ingest documents
- extract structure
- create document memory
- preserve evidence
- identify important sections
- store summaries
- store entities
- store relationships
- retrieve relevant context
- avoid unnecessary repeated document transmission

The system should distinguish:

RAW DOCUMENT
→ STRUCTURED DOCUMENT MEMORY
→ RELEVANT RETRIEVAL
→ MODEL CONTEXT

This is a major token-efficiency mechanism.

==================================================
25. CONTEXT MANAGEMENT
==================================================

Do not repeatedly send the entire conversation or project to the model.

Context should be constructed from:

- current task
- project state
- relevant checkpoint
- relevant files
- relevant decisions
- relevant errors
- relevant test results
- required documentation
- recent actions

Do not compress away correctness-critical information.

Prioritize correctness over aggressive token reduction.

==================================================
26. TOKEN EFFICIENCY
==================================================

The platform should optimize tokens through:

- progressive context loading
- structured state
- checkpoint summaries
- relevant-file retrieval
- diff-based context
- decision memory
- error memory
- document memory
- task-focused context
- progressive skill loading
- avoiding duplicate instructions
- avoiding repeated large histories

The objective is:

LESS TOKEN WASTE
+
MORE RELEVANT CONTEXT
+
BETTER OUTPUT
+
CONTINUOUS STATE

==================================================
27. AGENT SKILLS ARCHITECTURE
==================================================

The platform must use modular Agent Skills.

Core skills should cover:

- model discovery
- provider management
- model capability registry
- task classification
- intelligent routing
- runtime mode policy
- session management
- model pinning
- project state
- checkpoints
- same-model key failover
- model handoff
- context management
- token optimization
- document memory
- request playground
- model comparison
- recommendations
- usage analytics
- reliability analytics
- audit logging
- security
- provider health
- configuration
- workspace management
- skill orchestration

Skills must be independently understandable and progressively loaded.

Do not load every instruction into every task.

==================================================
28. SKILL ORCHESTRATION
==================================================

The system should activate only the skills required for the current task.

Example:

A BUILD task may require:

Task Classification
→ Capability Registry
→ Routing
→ Session Management
→ Project State
→ Execution
→ Checkpoint
→ Verification

A model failure may activate:

Failure Classification
→ Key Failover
→ Provider Health
→ Checkpoint
→ Model Handoff
→ State Recovery
→ Verification

A document task may activate:

Document Ingestion
→ Document Memory
→ Retrieval
→ Reasoning
→ Evidence Verification

Skills must communicate through structured state rather than repeated natural-language explanations.

==================================================
29. FAILURE CLASSIFICATION
==================================================

The runtime must distinguish:

- invalid API key
- expired credential
- quota exhaustion
- rate limit
- provider outage
- connection failure
- timeout
- model unavailable
- context overflow
- output limit
- unsupported capability
- tool failure
- malformed request
- internal execution failure
- task failure
- verification failure

Different failures require different recovery strategies.

Never treat every error as "model unavailable."

==================================================
30. SAFE RECOVERY
==================================================

Recovery sequence should generally be:

DETECT
→ CLASSIFY
→ RETRY WHEN SAFE
→ SAME MODEL / ALTERNATE KEY
→ SAME MODEL / ALTERNATE CONNECTION
→ CHECKPOINT
→ FIND COMPATIBLE MODEL
→ CREATE HANDOFF
→ RESTORE STATE
→ VERIFY
→ CONTINUE

Every recovery action must be observable.

==================================================
31. VERIFICATION
==================================================

The platform must verify important work.

Verification may include:

- file existence
- repository state
- test results
- build results
- task completion
- expected output
- deployment status
- state consistency

Never claim completion merely because a model returned a successful response.

For serious engineering tasks:

MODEL OUTPUT
≠
VERIFIED RESULT

==================================================
32. AUDIT LOG
==================================================

Maintain an audit trail for important events.

Record events such as:

- request received
- task classified
- model selected
- routing decision
- provider selected
- connection selected
- key rotated
- failure detected
- checkpoint created
- handoff initiated
- model changed
- state restored
- verification completed
- task completed

Never log secrets.

The audit system should allow users to understand what happened during a long-running task.

==================================================
33. SYSTEM HEALTH
==================================================

Track provider and model health.

Useful metrics include:

- availability
- latency
- error rate
- timeout rate
- quota state
- recent failures
- successful executions
- model reliability
- provider reliability

Health information should influence routing.

==================================================
34. USAGE & RELIABILITY ANALYTICS
==================================================

Provide analytics for:

- requests
- tokens
- estimated cost
- model usage
- provider usage
- key usage
- failure rate
- latency
- success rate
- model switching
- handoffs
- checkpoint frequency
- task completion
- recovery success

Users should be able to understand how the system is performing.

==================================================
35. SMART RECOMMENDATIONS
==================================================

The system may recommend:

- a better model
- a cheaper compatible model
- a more reliable provider
- another connection
- another API key
- a routing policy change
- a context strategy
- a model specialization

Recommendations must respect task requirements.

Never recommend a cheaper model if it fails the capability floor.

==================================================
36. ROUTING PRESETS
==================================================

Support configurable policies such as:

QUALITY FIRST
BALANCED
COST FIRST
SPEED FIRST
RELIABILITY FIRST
CODING FIRST
RESEARCH FIRST
LONG CONTEXT
CUSTOM

Presets must never override hard capability requirements.

==================================================
37. SECURITY
==================================================

Security is a first-class requirement.

Protect:

- API keys
- provider credentials
- connection details
- project information
- repository information
- documents
- execution history

Never expose secrets through:

- logs
- audit events
- model context
- error messages
- UI
- checkpoints
- handoff packages

Use references to credentials rather than copying secrets into state.

==================================================
38. EXISTING PROJECT SAFETY
==================================================

Before modifying the existing project:

INSPECT
→ UNDERSTAND
→ DOCUMENT
→ PRESERVE
→ EXTEND
→ TEST

First understand:

- current architecture
- frontend
- backend
- provider integrations
- configuration
- state management
- existing routing
- existing UI
- existing tools
- existing storage
- existing authentication
- existing tests

Create a clear boundary between:

EXISTING FUNCTIONALITY
and
NEW STATEFUL RUNTIME FUNCTIONALITY

Do not rewrite working systems simply for stylistic reasons.

==================================================
39. CONFIGURATION-DRIVEN ARCHITECTURE
==================================================

The system must be extensible.

Do not hardcode the architecture around a fixed number of models or providers.

The platform must allow future additions such as:

- new provider
- new model
- new connection
- new key
- new capability
- new routing strategy
- new runtime mode
- new skill
- new recovery strategy

Adding a new model should not require rewriting the entire routing system.

==================================================
40. PROFESSIONAL UI / UX
==================================================

The interface must look like professional AI infrastructure / developer tooling.

Avoid:

- gaming aesthetics
- excessive neon
- childish interfaces
- generic chatbot appearance
- unnecessary animations
- clutter

Prioritize:

- clarity
- information density
- professional typography
- clear hierarchy
- useful status indicators
- readable logs
- meaningful charts
- developer-friendly workflows
- responsive layouts

The product should feel like serious infrastructure software.

==================================================
41. CORE DASHBOARD
==================================================

The dashboard should communicate:

- active projects
- active sessions
- active model
- provider health
- connection health
- key status
- current task
- runtime mode
- routing activity
- recent failures
- checkpoints
- handoffs
- token usage
- cost
- reliability

Users should immediately understand:

"What is the AI doing right now?"

and:

"Why is it using this model?"

==================================================
42. ACTIVE SESSION VIEW
==================================================

Show:

- project
- task
- runtime mode
- pinned model
- provider
- connection
- active key reference
- current state
- progress
- recent actions
- checkpoint status
- health
- next action

The active session should feel like a live AI execution environment.

==================================================
43. ROUTING VISUALIZER
==================================================

Provide a visual explanation of routing.

Show:

REQUEST
→ TASK TYPE
→ REQUIRED CAPABILITIES
→ CANDIDATE MODELS
→ FILTERED MODELS
→ SCORED MODELS
→ SELECTED MODEL
→ PROVIDER
→ CONNECTION
→ KEY

During failure, show:

FAILURE
→ KEY ROTATION
→ CONNECTION RECOVERY
→ CHECKPOINT
→ MODEL COMPATIBILITY CHECK
→ HANDOFF
→ STATE RESTORATION
→ CONTINUATION

This is a major product differentiator.

==================================================
44. HANDOFF VIEW
==================================================

When model switching occurs, show:

- previous model
- reason
- checkpoint
- required capabilities
- candidate replacement models
- selected replacement
- handoff package status
- state restoration status
- verification status
- continuation status

Users should be able to see that the system did not simply restart.

==================================================
45. OBSERVABILITY
==================================================

Every important runtime decision must be explainable.

For example:

"Model B was selected because Model A became unavailable, Model B supports the required coding and tool capabilities, has sufficient context, and passed the current reliability threshold."

The platform should make complex orchestration understandable.

==================================================
46. TESTING STRATEGY
==================================================

Test the platform at multiple levels.

Test:

- skill behavior
- routing
- capability filtering
- model selection
- key failover
- provider failover
- session pinning
- checkpoint creation
- state restoration
- model handoff
- context management
- token efficiency
- verification
- provider health
- audit logging
- security
- UI
- regression

==================================================
47. CRITICAL ACCEPTANCE TEST
==================================================

This is the most important test.

Create or use a sufficiently large software project.

Start BUILD mode.

Select a strong Model A.

Pin Model A.

Complete approximately 20% of the project.

Then simulate:

1. active API key failure
2. alternate key availability
3. alternate key failure
4. provider/connection failure
5. Model A becoming unavailable

The system must:

- detect the failure
- classify the failure
- attempt same-model recovery
- use alternate key when possible
- avoid unnecessary model switching
- create a checkpoint
- identify compatible replacement models
- select a compatible strong Model B
- create a handoff package
- restore project state
- inspect the actual repository
- verify previous work
- continue from the next action
- avoid repeating completed work
- avoid silently downgrading quality
- preserve the project objective
- preserve architecture
- preserve decisions
- preserve tests
- preserve errors
- produce an auditable trail

The user should experience:

"Model A stopped, but my work continued."

==================================================
48. RESEARCH ACCEPTANCE TEST
==================================================

Start a large-document research session.

Use a strong long-context model.

Ingest documents.

Create structured document memory.

Ask multiple follow-up questions.

Ensure the system does not repeatedly transmit the entire document unnecessarily.

Force a model change.

The replacement model must answer using preserved document state and relevant retrieved context.

Verify evidence continuity.

==================================================
49. CHAT ACCEPTANCE TEST
==================================================

Start a simple chat task.

Use a low-cost or fast model.

Simulate a provider failure.

Verify that the system can quickly move to another suitable model without unnecessary checkpoint complexity.

==================================================
50. SECURITY ACCEPTANCE TEST
==================================================

Verify that:

- API keys never appear in logs
- credentials never enter handoff packages
- secrets never enter model context unnecessarily
- audit events contain references rather than secrets
- UI does not expose raw credentials

==================================================
51. PRODUCT DIFFERENTIATION
==================================================

Do not position the product as:

"Another AI model aggregator."

Do not position it as:

"Another API gateway."

Do not position it as:

"Another chatbot."

Do not position it as:

"Another model comparison website."

Position it as:

"A Stateful AI Runtime that keeps AI work continuous across models, providers, connections, and failures."

The unique value is:

STATE + CAPABILITY + ROUTING + CHECKPOINT + HANDOFF + VERIFICATION

==================================================
52. WHAT NOT TO BUILD
==================================================

Do not waste development effort on:

- generic social features
- unnecessary community systems
- irrelevant marketplace features
- generic chatbot extras
- dozens of unrelated agents
- decorative AI features
- unnecessary mobile applications
- complex ERP-like functionality
- features unrelated to model orchestration and state continuity

Prioritize the core runtime.

==================================================
53. DEVELOPMENT ORDER
==================================================

Implement in this order:

PHASE 1
Inspect existing project.

PHASE 2
Document existing architecture.

PHASE 3
Separate provider, connection, key, and model concepts.

PHASE 4
Build model capability registry.

PHASE 5
Build task classification.

PHASE 6
Build capability-aware routing.

PHASE 7
Build runtime modes.

PHASE 8
Build session management.

PHASE 9
Build model pinning.

PHASE 10
Build project state.

PHASE 11
Build checkpoints.

PHASE 12
Build same-model key failover.

PHASE 13
Build provider/connection recovery.

PHASE 14
Build model handoff.

PHASE 15
Build state restoration and verification.

PHASE 16
Build context management.

PHASE 17
Build token optimization.

PHASE 18
Build document memory.

PHASE 19
Build provider/model health.

PHASE 20
Build audit logging.

PHASE 21
Build usage and reliability analytics.

PHASE 22
Build professional dashboard.

PHASE 23
Build routing visualizer.

PHASE 24
Build handoff visualization.

PHASE 25
Complete acceptance testing.

Do not jump directly to UI polish while the runtime architecture is incomplete.

==================================================
54. AGENT EXECUTION RULES
==================================================

When working on the repository:

1. Understand before modifying.
2. Preserve existing working functionality.
3. Make small, traceable changes.
4. Maintain project state.
5. Create checkpoints at important milestones.
6. Verify changes.
7. Never claim success without verification.
8. Never silently downgrade serious tasks.
9. Never perform blind model switching.
10. Never lose project state.
11. Never repeat completed work unnecessarily.
12. Keep secrets out of project state.
13. Keep architecture extensible.
14. Prefer configuration over hardcoding.
15. Keep the user informed about important routing and recovery decisions.

==================================================
55. DEFINITION OF DONE
==================================================

The platform is complete only when:

- multiple providers can be configured
- multiple connections can exist
- multiple API keys can exist
- models are represented independently from providers
- model capabilities are known
- tasks are classified
- routing is capability-aware
- BUILD mode pins an appropriate model
- same-model key rotation works
- provider recovery works
- model handoff works
- checkpoints work
- project state survives model changes
- context is reconstructed intelligently
- token usage is optimized
- verification works
- document memory works
- provider health influences routing
- audit logs exist
- analytics exist
- the UI clearly explains orchestration
- security requirements are satisfied
- acceptance tests pass
- existing project functionality remains intact

==================================================
56. FINAL PRODUCT MODEL
==================================================

The final architecture should conceptually operate as:

USER
↓
REQUEST
↓
TASK CLASSIFIER
↓
REQUIREMENT / CAPABILITY ENGINE
↓
ROUTING ENGINE
↓
MODEL
↓
PROVIDER
↓
CONNECTION
↓
KEY
↓
EXECUTION
↓
PROJECT STATE
↓
CHECKPOINT
↓
VERIFICATION
↓
CONTINUATION

When failure occurs:

FAILURE
↓
CLASSIFY
↓
SAME MODEL / NEW KEY
↓
SAME MODEL / NEW CONNECTION
↓
CHECKPOINT
↓
CAPABILITY MATCH
↓
NEW MODEL
↓
HANDOFF PACKAGE
↓
STATE RESTORATION
↓
REPOSITORY VERIFICATION
↓
CONTINUE

==================================================
57. FINAL ARCHITECTURAL PRINCIPLE
==================================================

The most important rule is:

THE MODEL IS NOT THE MEMORY.

THE MODEL IS NOT THE PROJECT.

THE MODEL IS NOT THE SOURCE OF TRUTH.

The project state, repository, checkpoints, decisions, task state, and verification results are the durable system of record.

Models are interchangeable execution engines only when their capabilities are compatible.

Therefore:

MODEL FAILURE
must not become
PROJECT FAILURE.

PROVIDER FAILURE
must not become
PROJECT FAILURE.

API KEY FAILURE
must not become
PROJECT FAILURE.

CONTEXT LIMIT
must not become
PROJECT FAILURE.

The runtime must preserve continuity.

==================================================
58. FINAL PRODUCT POSITIONING
==================================================

The final product should communicate one clear idea:

"AI work should not stop just because the model changed."

This platform makes multiple AI models behave like one continuous engineering system by combining:

- intelligent routing
- capability awareness
- session pinning
- key failover
- provider recovery
- persistent project memory
- checkpoints
- model handoff
- token-efficient context
- verification
- observability

The final goal is not simply to connect more models.

The final goal is:

ONE CONTINUOUS STATEFUL AI RUNTIME ACROSS MANY MODELS.

Build the system around this principle from architecture to execution to UI.
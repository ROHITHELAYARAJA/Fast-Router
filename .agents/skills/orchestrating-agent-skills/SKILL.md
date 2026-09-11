---
name: orchestrating-agent-skills
description: Coordinates the 23 Agent Skills progressively without context bloat, activating only the skills required for the current execution phase. Use for end-to-end task lifecycles.
---

# Agent Skill Orchestrator

## When to use this skill
- Executing an end-to-end task lifecycle (Request -> Classify -> Pin -> Execute -> Checkpoint -> Verify)
- Coordinating multiple skills during a complex coding or research workflow
- Progressively activating skills based on execution triggers

## Workflow & Checklist
- [ ] Phase 1: Task Classification (classifying-tasks) -> Mode & Floor
- [ ] Phase 2: Model Selection (routing-with-capability-floors) -> Primary Model
- [ ] Phase 3: Session & Memory (managing-sessions-and-pinning, managing-project-memory)
- [ ] Phase 4: Execution & Snapshot (managing-checkpoints)
- [ ] Phase 5: Failure Recovery (failing-over-keys, executing-model-handoffs)
- [ ] Phase 6: Audit & Telemetry (logging-audit-events, analyzing-usage-and-reliability)

## Instructions & API Interfaces
### Master Orchestration Lifecycle

```
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
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

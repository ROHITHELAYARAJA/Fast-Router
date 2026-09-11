---
name: testing-routing-playground
description: Tests model capabilities and routing behavior in an isolated playground. Use when validating routing decisions or testing model outputs without affecting live project sessions.
---

# Request Playground

## When to use this skill
- Testing routing and classification behavior on test prompts
- Inspecting candidate floor matching and score breakdowns
- Simulating provider failures and observing handoff execution

## Workflow & Checklist
- [ ] Open http://localhost:20200/dashboard/runtime in browser
- [ ] Select preset or enter custom prompt
- [ ] Inspect live classification, capability floor filter, and selected model
- [ ] Click 'Simulate Provider Failure & Handoff' to verify resilience

## Instructions & API Interfaces
### Playground Isolation Rule

Testing in the Playground **MUST NOT** alter pinned models on active project sessions. Playground requests run independently of active project state.

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

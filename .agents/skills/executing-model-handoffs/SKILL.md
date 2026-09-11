---
name: executing-model-handoffs
description: Safely transfers an active task from a failed model to a compatible replacement model via structured context packages. Use when all credentials for a model fail and work must continue seamlessly.
---

# Model Handoff & Recovery

## When to use this skill
- All credentials/connections for the primary model are exhausted
- The primary provider is experiencing an extended outage
- Executing a controlled state transition to an equivalent compatible model

## Workflow & Checklist
- [ ] Create immediate snapshot checkpoint (trigger: 'before_handoff')
- [ ] Log audit event 'handoff_started'
- [ ] Select replacement model that satisfies EQUIVALENT capability floor
- [ ] Build structured handoff package from persistent project state
- [ ] Update session to new model and log 'handoff_completed'
- [ ] Receiver inspects actual filesystem before proceeding

## Instructions & API Interfaces
### Model Handoff Execution API

Execute structured handoff:
```bash
curl -s -X POST http://localhost:20200/api/runtime/handoff \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_0245dee92e1e4beb",
    "projectId": "proj_core",
    "fromModel": "claude-3-7-sonnet",
    "fromProvider": "anthropic",
    "failureReason": "quota",
    "failureDetails": "Rate limit exceeded on all accounts"
  }' | jq .
```

The response returns the replacement model and the exact handoff package containing objective, completed tasks, architecture, decisions, and next action.

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

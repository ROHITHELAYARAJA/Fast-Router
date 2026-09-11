---
name: managing-checkpoints
description: Creates versioned, recoverable project snapshot checkpoints at critical milestones or before model handoffs. Use when taking snapshots, inspecting past states, or rolling back project state.
---

# Checkpoint Management

## When to use this skill
- Taking snapshot checkpoints before major model handoffs
- Recording milestone checkpoints after completing significant tasks
- Restoring project state from a previous snapshot checkpoint
- Listing versioned checkpoints for auditing and rollback

## Workflow & Checklist
- [ ] Identify trigger: before_handoff, milestone, before_deploy, recovery, or manual
- [ ] Capture snapshot of project state, files changed, decisions, and next action
- [ ] Insert into checkpoints table with unique ID (prefix: chk_)
- [ ] Log audit event 'checkpoint_created'
- [ ] Support rollback via POST /api/runtime/checkpoints/:id/restore

## Instructions & API Interfaces
### Checkpoint Protocol

1. **Create Checkpoint**:
```bash
curl -s -X POST http://localhost:20200/api/runtime/checkpoints \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_core",
    "trigger": "milestone",
    "nextAction": "Deploy runtime UI to staging"
  }' | jq .
```

2. **List Checkpoints**:
```bash
curl -s "http://localhost:20200/api/runtime/checkpoints?projectId=proj_core" | jq .
```

3. **Restore Checkpoint**:
```bash
curl -s -X POST http://localhost:20200/api/runtime/checkpoints/chk_ea69bcb0b88a4a0e/restore | jq .
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

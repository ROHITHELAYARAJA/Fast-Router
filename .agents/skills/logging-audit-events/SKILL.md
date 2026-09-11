---
name: logging-audit-events
description: Writes and queries immutable audit logs of runtime routing decisions, key failovers, checkpoints, and handoffs with zero secret leaks. Use when reviewing execution logs.
---

# Audit & Event Logging

## When to use this skill
- Logging runtime events: model_selected, key_failover, checkpoint_created, handoff_completed
- Querying audit trail for debugging long-running multi-agent tasks
- Verifying zero-leak credential sanitization

## Workflow & Checklist
- [ ] Sanitize all payload details: redact apiKey, token, secret, password
- [ ] Record timestamp, eventType, sessionId, projectId, model, provider
- [ ] Write to SQLite auditLog table (fail-safe, never throws)
- [ ] Expose via GET /api/runtime/audit and /dashboard/runtime/audit

## Instructions & API Interfaces
### Audit Logging API

1. **Query Events**:
```bash
curl -s "http://localhost:20200/api/runtime/audit?limit=10" | jq .
```

2. **Log Custom Event**:
```bash
curl -s -X POST http://localhost:20200/api/runtime/audit \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "verification_completed",
    "ctx": {
      "projectId": "proj_core",
      "details": { "testsPassed": 14, "durationMs": 450 }
    }
  }' | jq .
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

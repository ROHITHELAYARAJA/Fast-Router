---
name: managing-sessions-and-pinning
description: Manages stateful sessions, model pinning, and session lifecycles. Use when creating sessions, tracking pinned models, passing session headers, or closing sessions.
---

# Session Management & Model Pinning

## When to use this skill
- Starting a new stateful session for a coding or research project
- Pinning a model to maintain consistency across multi-step tasks
- Associating requests with X-Fast-Router-Session-ID headers
- Listing or closing active sessions

## Workflow & Checklist
- [ ] Generate or retrieve session ID (prefix: sess_)
- [ ] Set mode (BUILD, RESEARCH, CHAT) and link projectId
- [ ] Pin primary model upon session start
- [ ] Pass X-Fast-Router-Session-ID header in SSE chat requests
- [ ] Update session status to completed upon task finish

## Instructions & API Interfaces
### Session Management APIs

1. **Create Pinned Session**:
```bash
curl -s -X POST http://localhost:20200/api/runtime/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "BUILD",
    "model": "claude-3-7-sonnet",
    "provider": "anthropic",
    "projectId": "proj_core"
  }' | jq .
```

2. **Send Request with Session Header**:
```bash
curl -s -X POST http://localhost:20200/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-Fast-Router-Session-ID: sess_0245dee92e1e4beb" \
  -d '{
    "model": "claude-3-7-sonnet",
    "messages": [{"role": "user", "content": "Start phase 2 implementation"}]
  }'
```

3. **Close Session**:
```bash
curl -s -X DELETE http://localhost:20200/api/runtime/sessions/sess_0245dee92e1e4beb
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

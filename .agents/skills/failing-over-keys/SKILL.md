---
name: failing-over-keys
description: Recovers from rate limits, quota exhaustion, or auth errors by rotating API keys for the same model without model switching. Use when handling 429, 401, or quota errors.
---

# Same-Model Key Failover

## When to use this skill
- Encountering HTTP 429 Too Many Requests or rate limits
- Encountering quota exhaustion or expired credentials on an active account
- Rotating to an alternate API key or connection for the SAME model

## Workflow & Checklist
- [ ] Classify error: rate_limit, quota, auth, or timeout
- [ ] Mark current connection temporarily unavailable with retry-after backoff
- [ ] Query next highest priority active connection supporting the SAME model
- [ ] Retry request with the new key without changing the model
- [ ] Only escalate to model handoff if all keys for the model are exhausted

## Instructions & API Interfaces
### Key Failover Protocol

```
Active Request (Model A + Key 1)
           ↓
   [Rate Limit / 429]
           ↓
Mark Key 1 unavailable (resetsAtMs = now + retryAfter)
           ↓
Select Key 2 for SAME Model A
           ↓
Execute Request with Key 2
```

**Critical Guarantee**: Never change models when an alternate credential for the same model is available.

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

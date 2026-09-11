---
name: monitoring-system-health
description: Monitors provider health, connection latency, rate limit cooldowns, and error rates. Use when checking provider status or diagnosing failing connections.
---

# System & Provider Health

## When to use this skill
- Checking provider availability and operational status
- Monitoring rate-limited connections and cooldown timers
- Diagnosing network errors or provider outages

## Workflow & Checklist
- [ ] Query GET /api/runtime/health for provider status
- [ ] Track active vs failing connection counts
- [ ] Check rateLimitedUntil timestamps for cooling connections
- [ ] Feed health scores into Stage 2 Soft Ranking in capability router

## Instructions & API Interfaces
### Health Query API
```bash
curl -s http://localhost:20200/api/runtime/health | jq .
```

Returns operational status, total connections, active connections, failing connections, and cooling rate limits per provider.

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

---
name: analyzing-usage-and-reliability
description: Tracks and analyzes token consumption, estimated costs, provider error rates, and handoff recovery success rates. Use when reviewing metrics and runtime telemetry.
---

# Usage & Reliability Analytics

## When to use this skill
- Viewing token consumption and cost analytics
- Tracking provider and connection error rates
- Measuring handoff success rates and recovery duration

## Workflow & Checklist
- [ ] Query Fast-Router metrics from database
- [ ] Aggregate token usage by model, provider, and session
- [ ] Calculate reliability percentage = (successful requests / total requests) * 100
- [ ] Display analytics in dashboard usage charts

## Instructions & API Interfaces
### Query Usage & Telemetry
```bash
# Query health and session metrics
curl -s http://localhost:20200/api/runtime/health | jq .

# Query recent audit events
curl -s "http://localhost:20200/api/runtime/audit?limit=20" | jq .
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

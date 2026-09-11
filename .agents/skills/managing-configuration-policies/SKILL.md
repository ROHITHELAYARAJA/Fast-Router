---
name: managing-configuration-policies
description: Configures runtime routing policies, capability floors, cost caps, and retry parameters. Use when tailoring orchestration behavior for specific environments.
---

# Configuration & Policy Management

## When to use this skill
- Setting custom capability floors for BUILD or RESEARCH modes
- Configuring preferred providers or cost/latency thresholds
- Adjusting retry counts and checkpoint snapshot frequencies

## Workflow & Checklist
- [ ] Define policy object in runtimePolicies table
- [ ] Specify mode capability overrides (e.g. minContext: 64000)
- [ ] Set qualityPreference: 'quality' | 'balanced' | 'cost' | 'speed'
- [ ] Pass policy to /api/runtime/route or store per workspace

## Instructions & API Interfaces
### Policy Object Format
```json
{
  "qualityPreference": "quality",
  "capabilityFloors": {
    "BUILD": { "contextWindow": 64000, "maxOutput": 8000, "tools": true },
    "RESEARCH": { "contextWindow": 100000, "maxOutput": 4000 }
  },
  "maxRetries": 3,
  "autoCheckpointOnMilestone": true
}
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

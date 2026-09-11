---
name: routing-with-capability-floors
description: Executes capability-aware two-stage routing: hard capability floor filtering followed by soft ranking. Use when selecting a model for a task or explaining routing decisions.
---

# Intelligent Routing Engine

## When to use this skill
- Selecting the best model for a classified task
- Filtering out under-capable candidate models
- Explaining why a specific model was selected or rejected

## Workflow & Checklist
- [ ] Obtain task classification and capability requirements
- [ ] Stage 1: Apply Hard Capability Floor (disqualify models lacking context, output, or tools)
- [ ] Stage 2: Soft Rank compatible models by reliability, latency, health, and cost
- [ ] Respect pinned model if session is in BUILD mode
- [ ] Log audit event 'model_selected' with explanation

## Instructions & API Interfaces
### Two-Stage Routing Process

```
Task Classification
      ↓
Stage 1: Hard Capability Floor Filter
   (Remove models lacking context, tools, coding, or output)
      ↓
Stage 2: Soft Ranking
   (Score by reliability: 40%, quality: 30%, latency: 15%, cost: 15%)
      ↓
Selected Model + Decision Explanation
```

**Rule**: A cheap incompatible model must **NEVER** outrank an expensive compatible model.

### Execute Routing API:
```bash
curl -s -X POST http://localhost:20200/api/runtime/route \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Refactor the database migrations and write tests",
    "policy": { "qualityPreference": "quality" }
  }' | jq .
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

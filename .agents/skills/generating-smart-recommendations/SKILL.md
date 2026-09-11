---
name: generating-smart-recommendations
description: Generates task-aware model and connection recommendations based on capability floors, reliability, and cost. Use when advising users on model choices.
---

# Smart Recommendations

## When to use this skill
- Recommending optimal models for specific tasks or projects
- Suggesting cost-efficient models that satisfy capability requirements
- Advising users on provider reliability trends

## Workflow & Checklist
- [ ] Identify task mode and required capability floor
- [ ] Filter out any model failing the capability floor
- [ ] Recommend models with highest composite score (reliability + quality + cost)
- [ ] Provide transparent reasoning for the recommendation

## Instructions & API Interfaces
### Recommendation Rule
**NEVER** recommend a cheaper model if it fails the task's capability floor. Correctness always takes precedence over cost.

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

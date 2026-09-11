---
name: enforcing-runtime-modes
description: Applies policy rules for BUILD, RESEARCH, and CHAT runtime modes. Use when configuring continuity rules, model pinning behavior, or document memory escalation.
---

# Runtime Mode Policy

## When to use this skill
- Configuring runtime mode behaviors (BUILD, RESEARCH, CHAT)
- Enforcing model pinning for engineering and coding workflows
- Handling document Q&A escalation in research mode

## Workflow & Checklist
- [ ] BUILD Mode: Pin model, mandate same-model key failover, checkpoint before any handoff
- [ ] RESEARCH Mode: Extract document memory, use cheaper model for simple queries, escalate for complex queries
- [ ] CHAT Mode: Prioritize speed/cost, allow lightweight fallbacks

## Instructions & API Interfaces
### Runtime Mode Rules

1. **BUILD Policy (Continuity First)**:
   - Primary model is PINNED for the session.
   - Key failure -> Rotate to another key for the SAME model.
   - Connection failure -> Rotate to another connection for the SAME model.
   - Model failure -> Create checkpoint -> Model handoff to compatible strong model.
   - *Never silently downgrade to a small/cheap model.*

2. **RESEARCH Policy (Evidence & Memory First)**:
   - Ingest document -> Store structured document memory -> Retrieve relevant chunks.
   - Follow-up questions use document memory rather than resending full PDF/document.

3. **CHAT Policy (Speed & Cost First)**:
   - Stateless or lightweight context. Fast fallback allowed.

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

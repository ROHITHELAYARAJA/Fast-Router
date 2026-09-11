---
name: optimizing-context-tokens
description: Optimizes context transmission to reduce token waste while preserving correctness. Use when constructing model prompts, loading diffs, or preventing redundant context.
---

# Context Management & Token Optimization

## When to use this skill
- Constructing prompts for large projects without token waste
- Replacing full file transmissions with targeted diffs and summaries
- Pruning completed tasks and irrelevant history from prompts

## Workflow & Checklist
- [ ] Transmit current task + relevant project state + active checkpoint
- [ ] Do NOT resend entire multi-turn conversation history
- [ ] Use diff-based context for modified files
- [ ] Never compress away correctness-critical information

## Instructions & API Interfaces
### Layered Context Architecture

Fast-Router constructs prompts in priority layers:
1. **Current Task**: Immediate objective and prompt
2. **Project State Manifest**: Objective, phase, and last known good state
3. **Decisions & Constraints**: Key architectural decisions
4. **Relevant Diffs**: Only modified files, not full repository
5. **Checkpoint Snapshot**: Recent milestone summary

**Token Optimization Goal**:
```
Less Token Waste + More Relevant Context = Higher Correctness
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

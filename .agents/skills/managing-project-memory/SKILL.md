---
name: managing-project-memory
description: Maintains durable project state, objectives, completed tasks, decisions, and file manifests independently of LLM context. Use when updating project state or building handoff contexts.
---

# Project State & Memory

## When to use this skill
- Creating or updating persistent project memory
- Recording architectural decisions or file modifications
- Marking project tasks completed or pending
- Formatting structured project state for model handoffs

## Workflow & Checklist
- [ ] Load project state from SQLite projects table
- [ ] Record objective, current phase, and next action
- [ ] Log architectural decisions (title, rationale, alternatives)
- [ ] Track modified files and completed tasks
- [ ] Source of truth: Filesystem > Project DB > Checkpoints > Model context

## Instructions & API Interfaces
### Project State Management

1. **Create / Update Project**:
```bash
curl -s -X POST http://localhost:20200/api/runtime/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fast-Router Core",
    "objective": "Build stateful multi-model continuous AI runtime",
    "currentPhase": "Execution"
  }' | jq .
```

2. **Add Architectural Decision**:
```bash
curl -s -X PATCH http://localhost:20200/api/runtime/projects/proj_core \
  -H "Content-Type: application/json" \
  -d '{
    "addDecision": {
      "title": "Use Multi-Driver SQLite Storage",
      "rationale": "Ensures zero native build dependencies on Node 22.5+ while supporting better-sqlite3 and sql.js."
    }
  }' | jq .
```

3. **Complete Task**:
```bash
curl -s -X PATCH http://localhost:20200/api/runtime/projects/proj_core \
  -H "Content-Type: application/json" \
  -d '{
    "completeTask": {
      "taskName": "Implement Task Classifier",
      "result": "Created app/src/lib/taskClassifier/index.js"
    }
  }' | jq .
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

---
name: managing-workspaces
description: Organizes projects, sessions, tasks, and checkpoints into isolated workspaces. Use when separating different applications, clients, or repositories.
---

# Workspace Management

## When to use this skill
- Organizing multiple projects and sessions under a unified workspace
- Switching between different application codebases
- Isolating routing policies and provider preferences by workspace

## Workflow & Checklist
- [ ] Associate projects and sessions with workspace identifier
- [ ] Ensure project memory and checkpoints remain isolated
- [ ] Apply workspace-specific routing policies

## Instructions & API Interfaces
### Workspace Organization
```
Workspace
  ├── Projects (proj_*)
  │     ├── Persistent State & Objectives
  │     ├── Completed Tasks & Decisions
  │     └── Versioned Checkpoints (chk_*)
  ├── Sessions (sess_*)
  │     └── Pinned Models & Execution History
  └── Workspace Policies & Health
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

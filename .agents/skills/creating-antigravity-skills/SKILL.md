---
name: creating-antigravity-skills
description: Designs, structures, and creates high-quality custom Skills for the Antigravity agent environment. Use when the user asks to build a skill, create a new skill, generate an Antigravity skill, or package a workflow into a skill.
---

# Creating Antigravity Skills

## When to use this skill
- When the user requests a new skill for Antigravity (e.g., "build me a skill for [X]").
- When packaging repetitive development patterns, CLI scripts, or complex workflows into agent skills.
- When scaffolding `.agents/skills/<skill-name>/` directories.

## Workflow

```markdown
- [ ] 1. Identify Task Scope & Gerund Name (e.g., `testing-components`, `managing-deployments`)
- [ ] 2. Define Triggers & Third-Person Description (max 1024 chars)
- [ ] 3. Create `<skill-name>/SKILL.md` with YAML frontmatter
- [ ] 4. Add Supporting Scripts, Examples, or Resources if needed
- [ ] 5. Validate Frontmatter & Path Formatting (forward slashes `/` only)
```

## Structural Standards

Every generated skill must follow this directory layout:

```
.agents/skills/<skill-name>/
├── SKILL.md          # Required: Instructions & frontmatter
├── scripts/          # Optional: Helper utilities (Python / Node / Bash)
├── examples/         # Optional: Reference implementations
└── resources/        # Optional: Templates, schemas, assets
```

### Frontmatter Specification
- **name**: Lowercase gerund form (`verb-ing`), numbers, hyphens only. Max 64 characters. Never include "claude" or "anthropic".
- **description**: Third-person voice. Must include specific keyword triggers. Max 1024 characters.

### Writing Rules
- **Concise**: Assume the agent is capable. Avoid explaining standard concepts.
- **Progressive Disclosure**: Keep `SKILL.md` under 500 lines. Reference secondary documents one level deep.
- **Paths**: Always use forward slashes (`/`).
- **Checklists**: Provide copyable markdown checklists for multi-step tasks.
- **Error Handling**: Document black-box command invocation with `--help` guidance.

---
name: classifying-tasks
description: Classifies incoming requests into BUILD, RESEARCH, or CHAT modes, detecting statefulness and capability floors. Use when a new user prompt arrives or when determining required context and tools.
---

# Task Classification

## When to use this skill
- Classifying an incoming user prompt or conversation
- Detecting whether a task is stateful BUILD, document RESEARCH, or stateless CHAT
- Determining minimum context window and output requirements for a task

## Workflow & Checklist
- [ ] Analyze message text, attachments, code blocks, and tool definitions
- [ ] Check active session mode and project context
- [ ] Score BUILD, RESEARCH, and CHAT signal weights
- [ ] Compute confidence level and capability requirements
- [ ] Log audit event 'task_classified'

## Instructions & API Interfaces
### Fast-Router Task Classification Protocol

Call the classification API directly:
```bash
curl -s -X POST http://localhost:20200/api/runtime/classify \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Implement user authentication with bcrypt and JWT tokens in Express",
    "tools": []
  }' | jq .
```

Output schema:
```json
{
  "success": true,
  "classification": {
    "mode": "BUILD",
    "statefulness": "stateful",
    "requirements": {
      "coding": true,
      "reasoning": true,
      "tools": false,
      "vision": false,
      "longContext": false,
      "contextMin": 32000,
      "outputMin": 4000
    },
    "confidence": 0.9,
    "explanation": ["message contains coding keywords", "BUILD score: 8 > CHAT: 1"]
  }
}
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

---
name: registering-model-capabilities
description: Maintains authoritative capability profiles and suitability classes for models. Use when categorizing models into BUILD-LONG, RESEARCH-LONG, or CHAT-FAST classes, or evaluating if a model meets task requirements.
---

# Model Capability Registry

## When to use this skill
- Categorizing models into BUILD-LONG, BUILD-FALLBACK, RESEARCH-LONG, or CHAT-FAST
- Answering 'Can this model handle this coding or research task?'
- Defining custom capability floors in runtime policies

## Workflow & Checklist
- [ ] Look up model in open-sse/providers/capabilities.js
- [ ] Evaluate hard capability floor (contextWindow, maxOutput, tools, coding)
- [ ] Assign dynamic suitability class
- [ ] Enforce capability floor during candidate scoring

## Instructions & API Interfaces
### Model Suitability Classes

Models are categorized dynamically based on verified metrics:

- `BUILD-LONG`: Strong reasoning + coding + native tools + >=32K context (e.g. Claude 3.7 Sonnet, GPT-4o).
- `BUILD-FALLBACK`: Strong compatible model suitable for taking over BUILD work after checkpointed handoff.
- `RESEARCH-LONG`: Large context (>=50K) + document understanding (e.g. Gemini 2.5 Pro, Claude 3.5 Sonnet).
- `RESEARCH-MEDIUM`: Moderate context suitable for follow-up Q&A and structured summaries.
- `CHAT-FAST`: Fast, low-latency models for conversational assistance (e.g. Gemini 2.5 Flash, GPT-4o-mini).
- `UNSUITABLE`: Models failing the task's hard capability floor.

### Checking Model Capabilities in Code
```javascript
import { getCapabilitiesForModel } from "open-sse/providers/capabilities.js";

const caps = getCapabilitiesForModel("anthropic", "claude-3-7-sonnet");
// Returns: { contextWindow: 200000, maxOutput: 64000, tools: true, vision: true }
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

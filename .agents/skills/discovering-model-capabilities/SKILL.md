---
name: discovering-model-capabilities
description: Discovers connected AI models and builds searchable capability profiles across providers. Use when the user asks to inventory models, inspect model metadata, check model context or output limits, or discover newly added models.
---

# Model & AI Capability Discovery

## When to use this skill
- Inventorying available AI models and connected providers
- Checking model context window size, max output tokens, or modalities
- Inspecting whether a model supports tool calling, vision, or coding
- Scanning newly connected provider endpoints for supported models

## Workflow & Checklist
- [ ] Connect to provider endpoint or query local registry
- [ ] Fetch list of available models and raw capability manifests
- [ ] Normalize context window, max output, coding, vision, and tool flags
- [ ] Register discovered models in Fast-Router SQLite registry
- [ ] Verify model metadata is accessible via GET /api/models or GET /api/runtime/health

## Instructions & API Interfaces
### Fast-Router Model Discovery Protocol

1. **Query Connected Providers**:
```bash
# List all active provider connections
curl -s http://localhost:20200/api/providers | jq .
```

2. **Retrieve Authoritative Capabilities**:
Fast-Router discovers capabilities dynamically and maps them through `open-sse/providers/capabilities.js`.

3. **Check Specific Model Dimensions**:
Verify context window and output limits:
- `contextWindow`: e.g. 200,000 for Claude 3.7 / 3.5 Sonnet, 128,000 for GPT-4o
- `maxOutput`: e.g. 64,000 for Claude 3.7 (thinking), 16,384 for GPT-4o
- `tools`: boolean flag indicating native tool/function calling support
- `coding`: suitability for software development tasks
- `vision`: image/multimodal attachment support

4. **Integration**:
Feeds metadata directly into **Task Classification** (`classifying-tasks`) and **Routing** (`routing-with-capability-floors`).

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

---
name: managing-providers-and-connections
description: Manages connected AI providers, accounts, OAuth tokens, and API key credentials. Use when adding or removing providers, rotating API keys, configuring priority order, or testing provider health.
---

# Provider & Connection Management

## When to use this skill
- Adding, editing, or deleting an AI provider connection
- Managing multiple API keys or accounts for the same provider
- Setting connection priorities and round-robin strategies
- Testing connection status and checking error codes

## Workflow & Checklist
- [ ] Identify provider kind (anthropic, openai, gemini, deepseek, etc.)
- [ ] Determine auth type (apikey, oauth, access_token)
- [ ] Assign connection priority to control rotation sequence
- [ ] Validate connection health via test probe
- [ ] Ensure raw secrets are never logged or exposed in plaintext

## Instructions & API Interfaces
### Provider & Connection Entity Separation

Fast-Router strictly enforces separation between entities:
```
Provider (e.g. Anthropic)
 └── Connection (e.g. Work Account, Personal Account)
      └── Credential / API Key (Key A, Key B, OAuth Token)
           └── Model (Claude 3.7 Sonnet, Claude 3.5 Haiku)
```

1. **List Configured Connections**:
```bash
curl -s http://localhost:20200/api/providers | jq .
```

2. **Add / Update Connection**:
Use Fast-Router CLI or POST to `/api/providers`.
```bash
node app/cli/bin/fast-router.js
# Or via REST API
curl -s -X POST http://localhost:20200/api/providers \
  -H "Content-Type: application/json" \
  -d '{"provider":"anthropic","name":"Primary Team Key","apiKey":"sk-ant-...","priority":1}'
```

3. **Connection Failover Rules**:
- A rate limit on Key A must fail over to Key B on the **same connection/provider** before switching models.
- Priority order is 1-indexed (lowest number = highest priority).

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

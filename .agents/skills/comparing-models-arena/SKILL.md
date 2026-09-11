---
name: comparing-models-arena
description: Compares multiple models side-by-side on the same prompt across quality, latency, token cost, and tool support. Use when evaluating models for engineering tasks.
---

# Model Arena / Comparison

## When to use this skill
- Comparing responses from multiple models side-by-side
- Benchmarking latency, cost per 1M tokens, and output quality
- Evaluating whether an alternative model meets capability requirements

## Workflow & Checklist
- [ ] Select candidate models (e.g. Claude 3.7 Sonnet vs GPT-4o)
- [ ] Send parallel requests through Fast-Router SSE gateway
- [ ] Compare response latency, token count, and output completeness
- [ ] Use findings to update runtime routing policies

## Instructions & API Interfaces
### Model Comparison Testing
Evaluate models side-by-side using standard OpenAI-compatible endpoints:
```bash
# Model A
curl -s http://localhost:20200/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-7-sonnet","messages":[{"role":"user","content":"Compare Rust vs Go concurrency"}]}'

# Model B
curl -s http://localhost:20200/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Compare Rust vs Go concurrency"}]}'
```

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

---
name: securing-credentials
description: Protects API keys, OAuth tokens, and sensitive project data against accidental leakage in logs, UI, or model context. Use when handling credentials or auditing security.
---

# Security & Credential Management

## When to use this skill
- Adding or rotating sensitive API keys or OAuth credentials
- Auditing logs and payloads to verify no plaintext secrets exist
- Enforcing local-only access or CLI machine token validation

## Workflow & Checklist
- [ ] Never store raw credentials in project memory or checkpoints
- [ ] Redact credentials from audit logs and error messages
- [ ] Require dashboard session cookie or CLI token for protected routes
- [ ] Enforce default password rotation before remote network exposure

## Instructions & API Interfaces
### Zero-Leak Redaction Rules

- Any object passed to `auditLog()` passes through `sanitizeDetails()`.
- Keys matching `apiKey`, `token`, `secret`, `password`, `bearer` are replaced with `[REDACTED]`.
- Hand-off packages reference connection IDs, never plaintext keys.

## Integration & Dependencies
- **Upstream Skills**: Task Classification, Provider Management, Capability Registry
- **Downstream Skills**: Session Pinning, Checkpoint Management, Audit Logging
- **Fast-Router Dashboard**: Available at `http://localhost:20200/dashboard/runtime`

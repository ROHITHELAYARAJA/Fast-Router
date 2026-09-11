# Fast-Router — Autonomous Stateful AI Runtime & Multi-Model Orchestration Platform

<p align="center">
  <b>Make multiple AI models behave like ONE continuous, stateful AI system.</b>
</p>

---

## 🌟 Overview

**Fast-Router** is an intelligent local AI runtime, gateway, and orchestration platform. It connects developer tools and autonomous agents (Cursor, Claude Code, Antigravity, OpenCode, Cline, Continue, Aider) to multiple AI model providers while maintaining continuous task state, project memory, model pinning, checkpoint recovery, and automated handoffs.

Rather than acting as a simple proxy, Fast-Router operates on the core lifecycle:
```
TASK ➔ REQUIREMENTS ➔ MODEL ➔ SESSION ➔ STATE ➔ EXECUTION ➔ RECOVERY ➔ VERIFICATION
```

---

## ⚡ Key Capabilities

### 1. Task Classification & Capability Floor (Skills 3, 4, 5)
- Requests are analyzed dynamically into **BUILD**, **RESEARCH**, or **CHAT** modes.
- Hard filters eliminate under-capable models (e.g. models lacking tool-calling or context capacity during BUILD).
- Soft ranking optimizes across reliability, health, latency, and cost.

### 2. Session Management & Model Pinning (Skill 7)
- Tasks are bound to a persistent session (`sess_*`).
- For **BUILD** tasks, the selected model is **pinned**.
- Account and API key rotation happens silently without resetting context or downgrading models.

### 3. Structured Project Memory & Checkpointing (Skills 8, 9)
- Stores project objectives, architectural decisions, completed tasks, and file modifications in embedded SQLite (`~/.fast-router/db/data.sqlite`).
- Point-in-time snapshots are captured automatically before risky operations, at task milestones, and prior to handoffs.

### 4. Autonomous Model Handoff & Recovery (Skills 10, 11)
- When a model or all provider keys are exhausted:
  1. Captures a `before_handoff` snapshot.
  2. Queries for a replacement model that meets the capability floor.
  3. Prepares a structured context transfer package.
  4. Resumes execution seamlessly without re-running finished work.

### 5. Sanitized Audit Logging (Skill 18)
- Every routing decision, session update, key rotation, checkpoint, and handoff is recorded immutably.
- Credentials and API keys are automatically stripped and sanitized.

### 6. Universal Localhost Gateway
- OpenAI and Anthropic compatible endpoints at `http://localhost:20200/v1`.
- Built-in Next.js management dashboard at `http://localhost:20200/dashboard`.
- Interactive CLI binary `fast-router`.

---

## 📁 Repository Structure

```
fast_router/
├── app/                              # Fast-Router Application Core
│   ├── src/
│   │   ├── app/                      # Next.js App Router (Dashboard & API)
│   │   │   └── api/v1/chat/          # /v1/chat/completions endpoint
│   │   ├── lib/
│   │   │   ├── taskClassifier/       # Skill 4: BUILD / RESEARCH / CHAT Classifier
│   │   │   ├── routing/              # Skills 3 & 5: Capability-Aware Router
│   │   │   ├── sessions/             # Skill 7: Stateful Session & Model Pinning
│   │   │   ├── projects/             # Skill 8: Project State & Context Memory
│   │   │   ├── checkpoints/          # Skill 9: Snapshot Checkpoint Manager
│   │   │   ├── handoff/              # Skill 11: Model Handoff & Recovery
│   │   │   ├── audit/                # Skill 18: Sanitized Audit Logger
│   │   │   ├── runtimePolicy/        # Skills 6 & 21: Policy Engine
│   │   │   └── db/                   # SQLite Multi-Driver Storage Layer
│   │   └── sse/                      # Real-time streaming & account failover
│   ├── open-sse/                     # Provider translation & protocol engine
│   ├── cli/                          # Fast-Router CLI binary
│   ├── AGENTS.md                     # Agent developer specification
│   └── package.json                  # Dependencies & scripts (Port 20200)
├── master.md                         # Master Architecture Specification
├── agentskilltemplates.md            # Complete 23 Agent Skills Reference
└── README.md                         # Project Overview & Setup Guide
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ (v22+ or v24 recommended)
- **npm** or **bun**

### 2. Start the Fast-Router Server
```bash
cd app
npm run dev
```
The server will boot on `http://localhost:20200`.

### 3. Open the Dashboard
Navigate in your browser to:
```
http://localhost:20200/dashboard
```

### 4. Install and Run the CLI
```bash
cd app/cli
npm install -g .
fast-router
```

---

## 🔌 Connecting AI Tools

Configure any AI tool to point to your Fast-Router gateway:

| Tool | Base URL / Endpoint | API Key |
|---|---|---|
| **Claude Code** | `http://localhost:20200/v1` | *(Any value or Fast-Router key)* |
| **Cursor** | `http://localhost:20200/v1` | *(Any value or Fast-Router key)* |
| **Antigravity** | `http://localhost:20200/v1` | *(Any value or Fast-Router key)* |
| **Cline / Roo** | `http://localhost:20200/v1` | *(Any value or Fast-Router key)* |
| **Continue** | `http://localhost:20200/v1` | *(Any value or Fast-Router key)* |

---

## 🛡️ The 23 Agent Skills Architecture

| # | Skill Name | Purpose |
|---|---|---|
| 1 | Model & Capability Discovery | Dynamic registry of connected models and features |
| 2 | Provider & Connection Management | Health, quota, and credential isolation |
| 3 | Model Capability Registry | Standardized capability profiling |
| 4 | Task Classification | Context-aware BUILD / RESEARCH / CHAT classification |
| 5 | Intelligent Routing Engine | Capability floors and multi-factor ranking |
| 6 | Runtime Mode Policy | Behavior rules per execution mode |
| 7 | Session Management & Pinning | Stateful session persistence & model locking |
| 8 | Project State & Memory | Source of truth tracking across model transitions |
| 9 | Checkpoint Management | Versioned, recoverable project snapshots |
| 10 | Same-Model Key Failover | Seamless account rotation without model switches |
| 11 | Model Handoff & Recovery | Controlled state transition between models |
| 12 | Context Optimization | Intelligent context window grooming |
| 13 | Document Memory | Ingestion and extraction for large documents |
| 14 | Request Playground | Model testing without affecting active sessions |
| 15 | Model Arena | Multi-model side-by-side evaluation |
| 16 | Smart Recommendations | Recommendation engine for optimal model selection |
| 17 | Usage & Reliability Analytics | Cost, latency, and success metrics |
| 18 | Audit & Event Logging | Immutable decision logs without credentials |
| 19 | Security & Credential Management | Encrypted storage & masked tokens |
| 20 | System Health Monitoring | Real-time connection & rate-limit monitoring |
| 21 | Configuration & Policy Management | Workspace and project customizable rules |
| 22 | Workspace Management | Multi-tenant and project scoping |
| 23 | Agent Skill Orchestrator | Dynamic on-demand skill execution |

---

## 📄 License

MIT License — see [LICENSE](app/LICENSE) for details.

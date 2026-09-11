<div align="center">

```
███████╗ █████╗ ███████╗████████╗   ██████╗  ██████╗ ██╗   ██╗████████╗███████╗██████╗ 
██╔════╝██╔══██╗██╔════╝╚══██╔══╝   ██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔══██╗
█████╗  ███████║███████╗   ██║█████╗██████╔╝██║   ██║██║   ██║   ██║   █████╗  ██████╔╝
██╔══╝  ██╔══██║╚════██║   ██║╚════╝██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ██╔══██╗
██║     ██║  ██║███████║   ██║      ██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗██║  ██║
╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝      ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝
```

### Next-Gen AI Neural Gateway & Stateful Inference Orchestrator
**One endpoint. Resilient continuity. Zero context loss.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=node.js)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Status: Active](https://img.shields.io/badge/Core%20Gateway-ONLINE-ff4d4d?style=flat)](http://localhost:20200)

[Overview](#-overview) •
[Brand & Design](#-brand-identity--design-system) •
[Quick Start](#-quick-start) •
[Stateful AI Runtime](#-stateful-ai-runtime-architecture) •
[23 Agent Skills](#-the-23-agent-skills-suite) •
[Connecting Tools](#-connecting-developer-tools) •
[CLI Usage](#-cli-usage)

---

</div>

## 🌟 Overview

**Fast-Router** is an enterprise-grade AI proxy, runtime engine, and intelligent load balancer. It bridges modern AI coding agents (Cursor, Claude Code, Antigravity, Cline, Continue, Aider) to multiple AI model providers (Anthropic, OpenAI, Google Gemini, DeepSeek, xAI, Groq, Ollama, Minimax, Kimi) while enforcing **stateful task continuity**.

### The Core Problem Solved
Traditional AI routers act as dumb stateless pass-throughs. When a model rate-limits (429), runs out of context, or throws a provider outage, your IDE crashes or context is lost.

Fast-Router replaces this fragile loop with an **Autonomous Resilience Lifecycle**:
```
TASK CLASSIFICATION ➔ CAPABILITY FLOOR ➔ MODEL PINNING ➔ PROJECT MEMORY ➔ CHECKPOINT SNAPSHOT ➔ KEY FAILOVER ➔ CONTROLLED HANDOFF
```

---

## 🎨 Brand Identity & Design System

Fast-Router features a visual identity inspired by **boxy architectural brutalism** and **industrial typographic design** (referencing *BIGSTAGE* and *MONTECH* design systems):

* **Color Hierarchy**:
  * **Deep Black (`#09090B`) & Crisp White (`#FFFFFF`)**: High-contrast, minimal foundation.
  * **Sky-Blue (`#38BDF8`)**: Primary accent, active navigation, connection status, and ambient glow.
  * **Light-Red / Coral (`#FF4D4D`)**: High-energy badges, critical telemetry, alert beacons, and logo badge.
* **Typography**:
  * **Display Wordmarks**: `Chakra Petch` & `Space Grotesk` (boxy, semi-condensed, angular cuts).
  * **Body & UI**: `Inter` & `Roboto`.
  * **Telemetry & Terminals**: `JetBrains Mono`.
* **Glassmorphism**: 20px backdrop blur, subtle borders, and multi-layered elevation shadows.

---

## 🚀 Quick Start

### 1. Prerequisites
* **Node.js**: v20+ (v22+ or v24 LTS recommended)
* **npm** (included with Node.js)

### 2. Clone and Launch
```bash
# Clone the repository
git clone https://github.com/ROHITHELAYARAJA/Fast-Router.git
cd Fast-Router

# Enter app directory and install dependencies
cd app
npm install

# Start the Fast-Router server (Default Port 20200)
npm run dev
```

### 3. Access Dashboard & Login
Open your browser at:
👉 **[http://localhost:20200/login](http://localhost:20200/login)**

* **Default Gateway Password**: `123456`
* **Quick Fill**: Click the **`[FILL: 123456]`** button on the login screen for one-click access.
* **Localhost Safety**: Developers accessing on localhost are protected from lockouts.

---

## 🧠 Stateful AI Runtime Architecture

Fast-Router enforces the foundational law: **"The Model is Not the Memory"**.

```
                           ┌──────────────────────────┐
                           │   Incoming Agent Task    │
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │    Task Classification   │
                           │  (BUILD / RESEARCH / CHAT│
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │  Capability Floor Filter │
                           │(Context, Tools, Thinking)│
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │ Session Binding & Pinning│
                           │(sess_* ➔ Primary Model)  │
                           └─────────────┬────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │ 429 / Quota Error?     │                     │ Total Provider Outage? │
     │ Same-Model Key Failover│                     │ Pre-Handoff Checkpoint │
     │ (No Model Switch)      │                     │ ➔ Qualified Handoff    │
     └────────────────────────┘                     └────────────────────────┘
```

1. **Task Classification (`/api/runtime/classify`)**:
   Automatically categorizes prompts into `BUILD`, `RESEARCH`, or `CHAT` with required context window limits, output floors, and tool requirements.
2. **Capability Floor Routing (`/api/runtime/route`)**:
   Strict hard filters reject under-capable models (e.g. models without tool support during coding tasks), followed by multi-factor soft scoring (cost, latency, health).
3. **Session Persistence & Model Pinning (`/api/runtime/sessions`)**:
   Binds long-running coding sessions to a selected model to prevent cognitive drift.
4. **Same-Model Key Rotation**:
   Rotates API credentials seamlessly across multiple keys of the same model without model hopping.
5. **Autonomous Model Handoff (`/api/runtime/handoff`)**:
   When all keys for a model are exhausted, Fast-Router creates a versioned snapshot checkpoint (`chk_*`), qualifies a replacement candidate that passes the same capability floor, and transfers state cleanly.
6. **Sanitized Audit Logger (`/api/runtime/audit`)**:
   Maintains an immutable timeline of decisions with zero secret leakage.

---

## 🛡️ The 23 Agent Skills Suite

Built-in skills following standard Antigravity & Agent skill specifications are located in [`.agent/skills/`](file:///.agent/skills/) and [`.agents/skills/`](file:///.agents/skills/):

| # | Skill Identifier | Description |
|---|---|---|
| 01 | `discovering-model-capabilities` | Maps available model capabilities, context windows, and pricing dynamically. |
| 02 | `managing-providers-and-connections` | Health monitoring, priority weighting, and credential validation. |
| 03 | `registering-model-capabilities` | Categorizes models into `BUILD-LONG`, `RESEARCH-LONG`, and `CHAT-FAST`. |
| 04 | `classifying-tasks` | Analyzes incoming prompts into `BUILD`, `RESEARCH`, or `CHAT` modes. |
| 05 | `routing-with-capability-floors` | Hard-filter validation ensuring models meet minimum operational thresholds. |
| 06 | `enforcing-runtime-modes` | Applies continuous execution policies based on task mode. |
| 07 | `managing-sessions-and-pinning` | Manages stateful session IDs, model pinning, and header routing. |
| 08 | `managing-project-memory` | Maintains durable project memory independently of LLM context windows. |
| 09 | `managing-checkpoints` | Point-in-time recoverable project snapshots (`milestone`, `before_handoff`). |
| 10 | `failing-over-keys` | Recovers from 429 rate limits by rotating keys for the same model. |
| 11 | `executing-model-handoffs` | Transfers active tasks to compatible replacements via structured handoff packages. |
| 12 | `optimizing-context-tokens` | Context trimming and token compaction to prevent context window bloat. |
| 13 | `managing-document-memory` | Ingests and processes large PDFs and multi-file text trees. |
| 14 | `testing-routing-playground` | Sandbox playground for evaluating prompts against model topologies. |
| 15 | `comparing-models-arena` | Side-by-side comparative benchmarking for quality, cost, and latency. |
| 16 | `generating-smart-recommendations` | Context-aware model recommendations based on historic health telemetry. |
| 17 | `analyzing-usage-and-reliability` | Tracks token consumption, recovery rates, and estimated expenditures. |
| 18 | `logging-audit-events` | Immutable, zero-leak audit logging for compliance and debugging. |
| 19 | `securing-credentials` | Dynamic obfuscation, environment variable fallback, and push protection. |
| 20 | `monitoring-system-health` | Real-time connection pinging, error rates, and cooldown tracking. |
| 21 | `managing-configuration-policies` | Policy engine for retry budgets, fallback ladders, and cost caps. |
| 22 | `managing-workspaces` | Workspace scoping for isolated multi-project orchestration. |
| 23 | `orchestrating-agent-skills` | End-to-end orchestration coordinator for full agent lifecycles. |
| ★ | `brand-identity` | Authoritative brand tokens, boxy geometry, voice & tone constraints. |

---

## 🔌 Connecting Developer Tools

Fast-Router exposes universal OpenAI and Anthropic compatible endpoints at:
* **Base URL**: `http://localhost:20200/v1`
* **API Key**: `any-key` *(or your configured Fast-Router master key)*

### Quick Configuration Examples

#### Cursor
1. Go to **Cursor Settings** ➔ **Models** ➔ **OpenAI API Key**.
2. Set **Override OpenAI Base URL**: `http://localhost:20200/v1`.
3. Add models: `claude-3-7-sonnet`, `gpt-4o`, `deepseek-r1`, `gemini-2.5-pro`.

#### Claude Code (CLI)
```bash
export ANTHROPIC_BASE_URL=http://localhost:20200
export ANTHROPIC_API_KEY=fast-router-local
claude
```

#### Antigravity IDE
Configure settings with:
```json
{
  "antigravity.proxyUrl": "http://localhost:20200/v1"
}
```

#### Continue (VS Code & JetBrains)
In `~/.continue/config.json`:
```json
{
  "models": [
    {
      "title": "Fast-Router Universal",
      "provider": "openai",
      "model": "claude-3-7-sonnet",
      "apiBase": "http://localhost:20200/v1",
      "apiKey": "fast-router"
    }
  ]
}
```

---

## 💻 CLI Usage

Fast-Router comes with an interactive terminal interface:

```bash
# Run CLI directly from the repo
node app/cli/cli.js

# Display version
node app/cli/cli.js -v
# Output: 0.1.0

# Start on custom port
node app/cli/cli.js --port 20200
```

---

## 🧪 Validation & Test Suite

Fast-Router includes an automated Antigravity validation suite verifying the full resilience pipeline:

```bash
# Run the 6/6 master validation suite
node tests/antigravity-validation.js

# Run provider baseline verification
node app/tests/__baseline__/verify-providers.mjs
```

**Results**:
```
==================================================
FAST-ROUTER: ANTIGRAVITY MASTER VALIDATION SUITE
==================================================
✓ 1. Normal Build Workflow (Classification, Selection, Pinning)
✓ 2. Same-Model Key Failover (Continuity Preserved)
✓ 3. Controlled Model Handoff (Pre-Handoff Checkpoint Created)
✓ 4. Inadequate Candidate Blocked (Capability Floor Enforced)
✓ 5. Research & Document Memory Protocol
✓ 6. Chat Fast-Mode Routing
==================================================
VALIDATION RESULT: 6 / 6 TESTS PASSED
==================================================
```

---

## 📁 Repository Structure

```
fast_router/
├── .agent/
│   └── skills/brand-identity/        # Brand design tokens & tech rules
├── .agents/
│   └── skills/                       # 23 Antigravity Agent Skills
├── app/
│   ├── cli/                          # Fast-Router CLI binary
│   ├── open-sse/                     # Provider protocol translation engine
│   ├── src/
│   │   ├── app/                      # Next.js App Router (Dashboard & REST APIs)
│   │   │   ├── (dashboard)/          # Dashboard pages (Runtime, Providers, Quotas)
│   │   │   ├── api/auth/             # Authentication & session endpoints
│   │   │   ├── api/runtime/          # Stateful AI Runtime endpoints
│   │   │   └── api/v1/               # OpenAI & Anthropic compatible proxy routes
│   │   ├── shared/components/        # FastRouterLogo, Header, Sidebar, Cards
│   │   └── lib/                      # Router, Sessions, Checkpoints, Audit Engine
│   ├── tests/                        # Vitest & baseline test suites
│   ├── custom-server.js              # Production HTTP server & proxy bridge
│   └── package.json                  # Scripts & dependencies
├── tests/
│   └── antigravity-validation.js     # Master 6-scenario verification suite
├── .gitignore                        # Comprehensive root gitignore
├── master.md                         # Master Architecture Specification
├── agentskilltemplates.md            # Skills generation templates
└── README.md                         # This documentation
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](app/LICENSE) for more information.

<div align="center">

**Built with precision for continuous, autonomous AI engineering.**

</div>

# Fast-Router — Autonomous Stateful AI Runtime & Gateway

**Continuous multi-model AI system with intelligent task classification, model pinning, stateful memory, and seamless handoff.**

**Connect All AI Code Tools (Claude Code, Cursor, Antigravity, Copilot, Codex, Gemini, OpenCode, Cline...) to 40+ AI Providers & 100+ Models.**

---

## 🚀 Key Features

- 🧠 **Stateful AI Runtime** — Task classification (BUILD / RESEARCH / CHAT) with capability requirements.
- 📌 **Model Pinning** — Locks strong models during critical BUILD phases; rotates keys/accounts transparently without losing context.
- 🔄 **Autonomous Handoff** — If all keys fail, creates a snapshot checkpoint, selects a compatible model meeting the capability floor, and transfers structured project memory.
- 💾 **Project Memory & Checkpoints** — Persistent tracking of objectives, files changed, architectural decisions, and tasks.
- 🛡️ **Audit Logging** — Immutable decision event log with automatic secret/credential sanitization.
- ⚡ **RTK Token Saver** — Compress tool outputs and reduce token burn by 20-40%.
- 🌐 **Universal Local Gateway** — Drop-in OpenAI/Claude API compatibility at `http://localhost:20200/v1`.

---

## ⚡ Quick Start

```bash
# Install CLI
cd cli
npm install -g .

# Start Fast-Router
fast-router

# Or run development server
cd ..
npm run dev
```

Dashboard opens at `http://localhost:20200/dashboard`

---

## 🛠️ Supported Tools

Claude Code • Cursor • Antigravity • Codex • Gemini CLI • Continue • Roo • Copilot • Kilo Code • OpenCode • Aider

---

## 💾 Data Location

- **macOS/Linux**: `~/.fast-router/db/data.sqlite`
- **Windows**: `%USERPROFILE%/.fast-router/db/data.sqlite`

---

## 📄 License

MIT License

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { HEAVY_PRODUCTION_MODELS } from "../chat/ChatClient";
import FastRouterLogo from "@/shared/components/FastRouterLogo";

const PRESET_APP_TEMPLATES = [
  {
    id: "code-security-auditor",
    name: "Code Security Auditor",
    slug: "security-auditor",
    category: "Security & DevTools",
    description: "Performs rigorous vulnerability analysis and static review for security leaks and edge cases.",
    modelId: "claude-3-7-sonnet",
    temperature: 0.2,
    maxTokens: 4096,
    responseFormat: "markdown",
    systemPrompt: `You are an elite application security auditor. Analyze the submitted code diff for:
1. SQL injection, remote code execution, and path traversal
2. Authentication bypass, replay vulnerability, and token leakage
3. Re-entrancy, memory leaks, and concurrency race conditions
4. Cryptographic timing attacks

Source Code / Diff to analyze:
{{code_diff}}

Framework & Stack:
{{stack_context}}

Respond with an exhaustive, prioritized vulnerability report with actionable remediation diffs.`,
    defaultVariables: {
      code_diff: `export async function handleLogin(req, res) {
  const { username, password } = req.body;
  const user = await db.query("SELECT * FROM users WHERE user = '" + username + "'");
  if (user && user.password === password) {
    res.json({ token: jwt.sign({ id: user.id }, "secret_key_123") });
  }
}`,
      stack_context: "Node.js Express + PostgreSQL + jsonwebtoken",
    },
  },
  {
    id: "json-data-normalizer",
    name: "JSON Schema Normalizer",
    slug: "schema-normalizer",
    category: "Data Processing",
    description: "Extracts unstructured documents or logs and coerces them into strict, validated JSON Schema.",
    modelId: "deepseek-reasoner",
    temperature: 0.0,
    maxTokens: 2048,
    responseFormat: "json_object",
    systemPrompt: `You are a high-speed data extraction agent. Extract structured entities from raw input into valid JSON.
Output must be strictly JSON with keys: 'status', 'confidence', 'entities', 'summary'.

Target Schema:
{{target_schema}}

Raw Input Payload:
{{raw_input}}`,
    defaultVariables: {
      target_schema: `{
  "entities": [{"name": "string", "category": "string", "amount": "number"}],
  "summary": "string"
}`,
      raw_input: "Invoice #9821 from Acme Corp for $4,500 consulting services and $250 server hosting, issued Sept 10 2026.",
    },
  },
  {
    id: "sql-optimizer-agent",
    name: "SQL Query Optimizer",
    slug: "sql-optimizer",
    category: "Database & Analytics",
    description: "Transforms natural language inquiries into high-performance, index-aware SQL queries.",
    modelId: "o3-mini",
    temperature: 0.1,
    maxTokens: 2048,
    responseFormat: "markdown",
    systemPrompt: `You are a Principal Database Administrator and Performance Engineer.
Write high-performance, production-grade SQL for the specified dialect.
Explain index requirements, execution plan rationale, and query cost.

Dialect:
{{database_dialect}}

Table Schemas:
{{table_schemas}}

User Inquest:
{{user_inquiry}}`,
    defaultVariables: {
      database_dialect: "PostgreSQL 16",
      table_schemas: `CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  amount NUMERIC(12,2),
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_customer ON orders (customer_id, created_at);`,
      user_inquiry: "Get total revenue and order count for active customers who spent more than $1000 in the last 30 days, grouped by week.",
    },
  },
  {
    id: "customer-support-copilot",
    name: "Customer Support Copilot",
    slug: "support-copilot",
    category: "Customer Experience",
    description: "Empathetic, context-aware copilot grounded in company policy and ticket history.",
    modelId: "gpt-4o",
    temperature: 0.5,
    maxTokens: 2048,
    responseFormat: "markdown",
    systemPrompt: `You are a Tier-3 Support Specialist for {{company_name}}.
Tone: {{desired_tone}}.
Adhere strictly to refund and warranty policy: {{company_policy}}.

Customer Query:
{{customer_message}}

Customer Account Tier:
{{customer_tier}}`,
    defaultVariables: {
      company_name: "Fast-Router Cloud",
      desired_tone: "Professional, empathetic, technical, and concise",
      company_policy: "Full refunds allowed within 14 days of subscription. 99.99% uptime SLA guarantee.",
      customer_message: "Our gateway experienced 3 minutes of 504 timeouts during our product launch. We need an SLA credit.",
      customer_tier: "Enterprise Tier ($2,500/mo)",
    },
  },
];

const STORAGE_KEY = "fast-router.app-builder.apps.v2";

export default function AppBuilderClient() {
  const [apps, setApps] = useState(PRESET_APP_TEMPLATES);
  const [activeAppId, setActiveAppId] = useState(PRESET_APP_TEMPLATES[0].id);
  const [activeTab, setActiveTab] = useState("config"); // "config" | "sandbox" | "export"
  const [exportLanguage, setExportLanguage] = useState("curl"); // "curl" | "node" | "python"
  const [copiedExport, setCopiedExport] = useState(false);

  // Live test runner state
  const [variableInputs, setVariableInputs] = useState({});
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testLatency, setTestLatency] = useState(null);
  const [testError, setTestError] = useState(null);

  // Load user saved apps
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApps(parsed);
          setActiveAppId(parsed[0].id);
        }
      }
    } catch {}
  }, []);

  // Active App Object
  const activeApp = useMemo(() => {
    return apps.find((a) => a.id === activeAppId) || apps[0] || PRESET_APP_TEMPLATES[0];
  }, [apps, activeAppId]);

  // Detected variables in the system prompt (e.g. {{variable}})
  const detectedVariables = useMemo(() => {
    const prompt = activeApp.systemPrompt || "";
    const matches = prompt.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
    return Array.from(new Set(matches.map((m) => m.replace(/[\{\}]/g, ""))));
  }, [activeApp.systemPrompt]);

  // Sync variableInputs when switching apps
  useEffect(() => {
    const defaults = activeApp.defaultVariables || {};
    const initial = {};
    for (const v of detectedVariables) {
      initial[v] = defaults[v] || "";
    }
    setVariableInputs(initial);
    setTestResult(null);
    setTestError(null);
    setTestLatency(null);
  }, [activeApp.id, detectedVariables]);

  // Save changes to active app
  const updateActiveApp = (patch) => {
    setApps((prev) => {
      const updated = prev.map((a) => (a.id === activeApp.id ? { ...a, ...patch } : a));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Create new blank app
  const handleCreateNewApp = () => {
    const newApp = {
      id: `app_${Date.now()}`,
      name: "New Production App",
      slug: `app-${Date.now().toString(36)}`,
      category: "Custom Agent",
      description: "Custom AI application configured for production deployment.",
      modelId: "claude-3-7-sonnet",
      temperature: 0.7,
      maxTokens: 2048,
      responseFormat: "markdown",
      systemPrompt: `You are a production AI worker. Process the user input according to the guidelines:

Input:
{{user_input}}`,
      defaultVariables: {
        user_input: "Sample input text to test the application.",
      },
    };
    setApps((prev) => [newApp, ...prev]);
    setActiveAppId(newApp.id);
  };

  // Run live test against Fast-Router gateway
  const handleRunLiveTest = async () => {
    setIsRunningTest(true);
    setTestResult(null);
    setTestError(null);
    const startTime = Date.now();

    try {
      // Interpolate system prompt with variables
      let interpolatedPrompt = activeApp.systemPrompt;
      for (const [key, val] of Object.entries(variableInputs)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        interpolatedPrompt = interpolatedPrompt.replace(regex, val || "");
      }

      const bodyPayload = {
        model: activeApp.modelId,
        messages: [
          { role: "system", content: interpolatedPrompt },
          { role: "user", content: "Execute application with the provided parameters." },
        ],
        temperature: activeApp.temperature,
        max_tokens: activeApp.maxTokens,
      };

      if (activeApp.responseFormat === "json_object") {
        bodyPayload.response_format = { type: "json_object" };
      }

      const response = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();
      const latency = Date.now() - startTime;
      setTestLatency(latency);

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || `Request failed (${response.status})`);
      }

      const outputText = data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);
      setTestResult(outputText);
    } catch (err) {
      setTestError(err.message);
    } finally {
      setIsRunningTest(false);
    }
  };

  // Generate code export
  const generatedCode = useMemo(() => {
    let interpolatedPrompt = activeApp.systemPrompt;
    for (const [key, val] of Object.entries(variableInputs)) {
      interpolatedPrompt = interpolatedPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || "");
    }

    if (exportLanguage === "curl") {
      return `curl -X POST http://localhost:20200/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_FAST_ROUTER_API_KEY" \\
  -d '${JSON.stringify(
    {
      model: activeApp.modelId,
      messages: [
        { role: "system", content: interpolatedPrompt },
        { role: "user", content: "Execute application task." },
      ],
      temperature: activeApp.temperature,
      max_tokens: activeApp.maxTokens,
      ...(activeApp.responseFormat === "json_object" ? { response_format: { type: "json_object" } } : {}),
    },
    null,
    2
  )}'`;
    }

    if (exportLanguage === "node") {
      return `import OpenAI from "openai";

// Initialize OpenAI client pointed at Fast-Router
const client = new OpenAI({
  baseURL: "http://localhost:20200/v1",
  apiKey: process.env.FAST_ROUTER_API_KEY || "YOUR_FAST_ROUTER_API_KEY",
});

export async function run${activeApp.slug.replace(/[-_]/g, "")}() {
  const completion = await client.chat.completions.create({
    model: "${activeApp.modelId}",
    messages: [
      {
        role: "system",
        content: ${JSON.stringify(interpolatedPrompt)},
      },
      {
        role: "user",
        content: "Execute application task.",
      },
    ],
    temperature: ${activeApp.temperature},
    max_tokens: ${activeApp.maxTokens},
    ${activeApp.responseFormat === "json_object" ? `response_format: { type: "json_object" },` : ""}
  });

  console.log("Output:", completion.choices[0].message.content);
  return completion.choices[0].message.content;
}

run${activeApp.slug.replace(/[-_]/g, "")}();`;
    }

    if (exportLanguage === "python") {
      return `from openai import OpenAI
import os

# Initialize client pointed at Fast-Router local gateway
client = OpenAI(
    base_url="http://localhost:20200/v1",
    api_key=os.environ.get("FAST_ROUTER_API_KEY", "YOUR_FAST_ROUTER_API_KEY"),
)

response = client.chat.completions.create(
    model="${activeApp.modelId}",
    messages=[
        {"role": "system", "content": ${JSON.stringify(interpolatedPrompt)}},
        {"role": "user", "content": "Execute application task."},
    ],
    temperature=${activeApp.temperature},
    max_tokens=${activeApp.maxTokens},
    ${activeApp.responseFormat === "json_object" ? `response_format={"type": "json_object"},` : ""}
)

print(response.choices[0].message.content)
`;
    }

    return "";
  }, [activeApp, variableInputs, exportLanguage]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    } catch {}
  };

  return (
    <div className="flex h-[calc(100vh-68px)] w-full overflow-hidden bg-[#09090B] text-white">
      {/* Left App Catalog Sidebar */}
      <aside className="w-72 flex flex-col border-r border-border-subtle bg-[#0c0d12]/90 backdrop-blur-xl shrink-0">
        {/* Create App Header */}
        <div className="p-3 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-400 text-[20px]">widgets</span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-white">
              App Studio
            </span>
          </div>
          <button
            onClick={handleCreateNewApp}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-mono font-semibold transition-all cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.15)]"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>NEW</span>
          </button>
        </div>

        {/* Apps List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="px-2 py-1 text-[10px] font-mono uppercase text-text-muted/60 tracking-wider">
            Production Applications ({apps.length})
          </div>
          {apps.map((app) => {
            const isSelected = app.id === activeApp.id;
            return (
              <div
                key={app.id}
                onClick={() => {
                  setActiveAppId(app.id);
                  setActiveTab("config");
                }}
                className={cn(
                  "p-2.5 rounded-xl cursor-pointer transition-all border flex flex-col gap-1",
                  isSelected
                    ? "bg-sky-500/15 border-sky-500/40 text-white shadow-[inset_0_0_10px_rgba(56,189,248,0.12)]"
                    : "border-transparent text-text-muted hover:bg-surface-2 hover:border-border/40 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white truncate">{app.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-sky-400">
                    {app.modelId}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                  {app.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted/60 mt-0.5">
                  <span>{app.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Link back to Chat */}
        <div className="p-3 border-t border-border/30 bg-surface-1/40">
          <Link
            href="/dashboard/chat"
            className="flex items-center gap-2 p-2 rounded-lg text-xs font-mono text-sky-400 hover:bg-sky-500/10 border border-sky-500/20 transition-all group"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <div className="truncate">
              <div className="font-bold text-[11px] leading-tight">Reasoning Chat</div>
              <div className="text-[10px] text-text-muted">Return to chat studio</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#09090B]">
        {/* Top Header / App Identity */}
        <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-border/40 bg-[#09090B]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeApp.name}
                  onChange={(e) => updateActiveApp({ name: e.target.value })}
                  className="bg-transparent font-mono font-bold text-sm text-white focus:outline-none focus:border-b border-sky-400"
                />
                <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  READY
                </span>
              </div>
              <div className="text-[11px] font-mono text-text-muted">{activeApp.category} · Slug: /{activeApp.slug}</div>
            </div>
          </div>

          {/* Action Tabs: Config, Sandbox, Export */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-1/90 border border-border/50">
            {[
              { id: "config", label: "App Config", icon: "tune" },
              { id: "sandbox", label: "Test Sandbox", icon: "science" },
              { id: "export", label: "Code Export", icon: "code" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer",
                  activeTab === tab.id
                    ? "bg-sky-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                    : "text-text-muted hover:text-white hover:bg-surface-2"
                )}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: App Configurator */}
        {activeTab === "config" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full custom-scrollbar">
            {/* Model & Runtime Hyperparameters Card */}
            <div className="p-5 rounded-2xl border border-border/50 bg-[#12131a] space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-sky-400" />
                <span>Production Model & Execution Parameters</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model Selector */}
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1.5">Production Model</label>
                  <select
                    value={activeApp.modelId}
                    onChange={(e) => updateActiveApp({ modelId: e.target.value })}
                    className="w-full bg-surface-1 border border-border/60 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    {HEAVY_PRODUCTION_MODELS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#12131a] text-white">
                        {m.name} ({m.provider} · {m.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Response Format */}
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1.5">Output Format</label>
                  <select
                    value={activeApp.responseFormat}
                    onChange={(e) => updateActiveApp({ responseFormat: e.target.value })}
                    className="w-full bg-surface-1 border border-border/60 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="markdown" className="bg-[#12131a] text-white">Markdown / Freeform Text</option>
                    <option value="json_object" className="bg-[#12131a] text-white">Strict JSON Object Schema</option>
                  </select>
                </div>

                {/* Temperature */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-text-muted mb-1.5">
                    <span>Temperature</span>
                    <span className="text-sky-400 font-bold">{activeApp.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={activeApp.temperature}
                    onChange={(e) => updateActiveApp({ temperature: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400 h-1.5 bg-surface-2 rounded cursor-pointer"
                  />
                  <span className="text-[10px] text-text-muted/60 font-mono">Lower = deterministic, Higher = creative</span>
                </div>

                {/* Max Tokens */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-text-muted mb-1.5">
                    <span>Max Output Tokens</span>
                    <span className="text-sky-400 font-bold">{activeApp.maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="8192"
                    step="256"
                    value={activeApp.maxTokens}
                    onChange={(e) => updateActiveApp({ maxTokens: parseInt(e.target.value, 10) })}
                    className="w-full accent-sky-400 h-1.5 bg-surface-2 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* System Persona & Prompt Editor */}
            <div className="p-5 rounded-2xl border border-border/50 bg-[#12131a] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-sky-400" />
                  <span>System Persona & Prompt Template</span>
                </h2>
                <span className="text-[10px] font-mono text-text-muted/70 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  Use {`{{variable_name}}`} for dynamic inputs
                </span>
              </div>

              <textarea
                value={activeApp.systemPrompt}
                onChange={(e) => updateActiveApp({ systemPrompt: e.target.value })}
                rows={10}
                className="w-full bg-surface-1 border border-border/60 rounded-xl p-3 text-xs font-mono text-white placeholder:text-text-muted/40 focus:outline-none focus:border-sky-400 transition-colors custom-scrollbar leading-relaxed"
              />

              {/* Detected Variables Bar */}
              {detectedVariables.length > 0 && (
                <div className="pt-2 border-t border-border/30 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-text-muted">Detected Variables:</span>
                  {detectedVariables.map((v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-[10px] font-bold"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Button to Test */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveTab("sandbox")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-mono text-xs font-bold transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)] cursor-pointer"
              >
                <span>Test in Live Sandbox</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Live Test Sandbox */}
        {activeTab === "sandbox" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full custom-scrollbar">
            {/* Variable Inputs Form */}
            <div className="p-5 rounded-2xl border border-border/50 bg-[#12131a] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-sky-400" />
                  <span>Sandbox Inputs ({detectedVariables.length} Variables)</span>
                </h2>
                <button
                  onClick={handleRunLiveTest}
                  disabled={isRunningTest}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer",
                    isRunningTest
                      ? "bg-surface-2 text-text-muted cursor-wait"
                      : "bg-sky-500 hover:bg-sky-400 text-white shadow-[0_0_16px_rgba(56,189,248,0.3)]"
                  )}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isRunningTest ? "hourglass_empty" : "play_arrow"}
                  </span>
                  <span>{isRunningTest ? "Executing Model..." : "Run Application Test"}</span>
                </button>
              </div>

              <div className="space-y-3">
                {detectedVariables.length === 0 ? (
                  <p className="text-xs text-text-muted font-mono py-2">
                    No variables defined in system prompt. The model will run directly with the system persona.
                  </p>
                ) : (
                  detectedVariables.map((v) => (
                    <div key={v}>
                      <label className="block text-[11px] font-mono font-bold text-sky-400 mb-1">
                        {`{{${v}}}`}
                      </label>
                      <textarea
                        value={variableInputs[v] || ""}
                        onChange={(e) =>
                          setVariableInputs((prev) => ({ ...prev, [v]: e.target.value }))
                        }
                        rows={3}
                        placeholder={`Enter test payload for {{${v}}}...`}
                        className="w-full bg-surface-1 border border-border/60 rounded-xl p-2.5 text-xs font-mono text-white placeholder:text-text-muted/40 focus:outline-none focus:border-sky-400 custom-scrollbar"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Test Results Inspection */}
            {(testResult || testError || isRunningTest) && (
              <div className="p-5 rounded-2xl border border-border/50 bg-[#12131a] space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span>Application Output</span>
                  </h2>
                  {testLatency && (
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      Latency: {(testLatency / 1000).toFixed(2)}s
                    </span>
                  )}
                </div>

                {testError ? (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs">
                    ⚠️ {testError}
                  </div>
                ) : isRunningTest ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="size-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mb-3" />
                    <span className="text-xs font-mono text-sky-400">
                      Routing through Fast-Router gateway to {activeApp.modelId}...
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-surface-1 border border-border/50 text-xs font-mono text-white whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
                    {testResult}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Production Code Export */}
        {activeTab === "export" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full custom-scrollbar">
            <div className="p-5 rounded-2xl border border-border/50 bg-[#12131a] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-sky-400" />
                    <span>1-Click Production Code Generation</span>
                  </h2>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Copy and paste directly into your microservices, CLI tools, or Next.js production backend.
                  </p>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-1 border border-border/50">
                  {[
                    { id: "curl", label: "cURL" },
                    { id: "node", label: "Node / Next.js" },
                    { id: "python", label: "Python" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setExportLanguage(lang.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer",
                        exportLanguage === lang.id
                          ? "bg-sky-500 text-white"
                          : "text-text-muted hover:text-white"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Box */}
              <div className="relative">
                <pre className="p-4 rounded-xl bg-surface-1 border border-border/60 text-xs font-mono text-emerald-300 overflow-x-auto custom-scrollbar leading-relaxed">
                  {generatedCode}
                </pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedExport ? "check" : "content_copy"}
                  </span>
                  <span>{copiedExport ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              {/* Deployment Checklist */}
              <div className="p-4 rounded-xl bg-surface-1/40 border border-border/30 text-xs font-mono text-text-muted space-y-1.5">
                <div className="font-bold text-white mb-1">Production Deployment Checklist:</div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Local Gateway Endpoint: http://localhost:20200/v1</span>
                </div>
                <div className="flex items-center gap-2 text-sky-400">
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  <span>Set your Fast-Router API Key in FAST_ROUTER_API_KEY environment variable</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <span className="material-symbols-outlined text-[16px]">dns</span>
                  <span>Configured upstream model will failover automatically if quotas are exhausted</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

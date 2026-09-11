"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/shared/components";

const PRESETS = [
  {
    label: "Code & Architecture",
    mode: "BUILD",
    prompt: "Refactor the session management service to support multi-driver SQLite and write comprehensive unit tests with coverage verification.",
  },
  {
    label: "Document Research",
    mode: "RESEARCH",
    prompt: "Analyze this 150-page financial audit report, extract all risk factors, compare quarter-over-quarter revenue discrepancies, and synthesize key findings into a structured summary.",
  },
  {
    label: "Lightweight Chat",
    mode: "CHAT",
    prompt: "What is the difference between TCP and UDP in terms of reliability and latency?",
  },
  {
    label: "Tool & Agent Task",
    mode: "BUILD",
    prompt: "Call the GitHub API to list open issues with label 'bug', triage them by severity, and create an execution plan for the highest-priority ticket.",
  },
];

export default function RuntimePlaygroundPage() {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [selectedMode, setSelectedMode] = useState("AUTO");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [simulatedFailure, setSimulatedFailure] = useState(false);
  const [simulatedHandoff, setSimulatedHandoff] = useState(null);
  const [handoffLoading, setHandoffLoading] = useState(false);

  useEffect(() => {
    runRoutingAnalysis(prompt);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runRoutingAnalysis = async (testPrompt = prompt) => {
    setLoading(true);
    try {
      const res = await fetch("/api/runtime/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: testPrompt,
          policy: selectedMode !== "AUTO" ? { modeOverride: selectedMode } : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFailure = async () => {
    if (!result?.selected) return;
    setHandoffLoading(true);
    setSimulatedFailure(true);
    try {
      const res = await fetch("/api/runtime/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromModel: result.selected.model,
          fromProvider: result.selected.provider,
          fromConnectionId: result.selected.connectionId,
          failureReason: "quota",
          failureDetails: "API Rate limit exceeded (429) - simulated",
          classification: result.classification,
        }),
      });
      const data = await res.json();
      setSimulatedHandoff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setHandoffLoading(false);
    }
  };

  const classification = result?.classification;
  const selected = result?.selected;
  const explanation = result?.explanation;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
            <span className="material-symbols-outlined text-white text-[22px]">psychology</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Stateful AI Runtime Playground
            </h1>
            <p className="text-sm text-text-muted">
              Intelligent multi-model orchestration, capability floors, session pinning, and continuous recovery
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Input & Controls */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase text-text-muted">Presets:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p.prompt);
                  runRoutingAnalysis(p.prompt);
                }}
                className="px-2.5 py-1 text-xs rounded-md bg-surface-2 hover:bg-surface-3 text-text-main border border-border-subtle transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border-subtle self-start">
            {["AUTO", "BUILD", "RESEARCH", "CHAT"].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMode(m)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  selectedMode === m
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Test Request / Prompt
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface-1 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono resize-none"
            placeholder="Enter request to analyze routing and capability matching..."
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            onClick={() => runRoutingAnalysis(prompt)}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              {loading ? "progress_activity" : "route"}
            </span>
            {loading ? "Classifying & Routing..." : "Evaluate Capabilities & Route"}
          </Button>

          {selected && (
            <Button
              variant="outline"
              onClick={handleSimulateFailure}
              disabled={handoffLoading}
              className="border-red-500/40 text-red-500 hover:bg-red-500/10 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              {handoffLoading ? "Simulating Handoff..." : "Simulate Provider Failure & Handoff"}
            </Button>
          )}
        </div>
      </Card>

      {/* Live Routing Analysis Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Classification Column */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-500 text-[20px]">filter_alt</span>
                <h2 className="text-sm font-semibold text-text-main">1. Task Classification</h2>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  classification.mode === "BUILD"
                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                    : classification.mode === "RESEARCH"
                    ? "bg-purple-500/15 text-purple-500 border border-purple-500/30"
                    : "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                }`}
              >
                {classification.mode} MODE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-text-muted">
                <span>Statefulness:</span>
                <span className="font-semibold text-text-main capitalize">
                  {classification.statefulness}
                </span>
              </div>
              <div className="flex justify-between items-center text-text-muted">
                <span>Confidence:</span>
                <span className="font-semibold text-text-main">
                  {Math.round(classification.confidence * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-text-muted">
                <span>Min Context Required:</span>
                <span className="font-semibold text-text-main">
                  {classification.requirements.contextMin.toLocaleString()} tokens
                </span>
              </div>
              <div className="flex justify-between items-center text-text-muted">
                <span>Min Output Required:</span>
                <span className="font-semibold text-text-main">
                  {classification.requirements.outputMin.toLocaleString()} tokens
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
                Required Capabilities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(classification.requirements)
                  .filter(([k, v]) => typeof v === "boolean" && v)
                  .map(([req]) => (
                    <span
                      key={req}
                      className="px-2 py-0.5 rounded bg-surface-2 text-text-main border border-border-subtle text-[11px] font-mono capitalize"
                    >
                      ✓ {req}
                    </span>
                  ))}
                {Object.values(classification.requirements).filter((v) => typeof v === "boolean" && v)
                  .length === 0 && (
                  <span className="text-xs text-text-muted italic">Standard text processing</span>
                )}
              </div>
            </div>
          </Card>

          {/* Hard Filter & Matching Column */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 text-[20px]">tune</span>
                <h2 className="text-sm font-semibold text-text-main">2. Capability Floor Filter</h2>
              </div>
              <span className="text-xs text-text-muted">
                {explanation?.compatible?.length || 0} Qualified
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {explanation?.compatible?.map((c, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-surface-2 border border-border-subtle flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-text-main">{c.model}</div>
                    <div className="text-[10px] text-text-muted uppercase">{c.provider}</div>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 font-medium">
                    Pass
                  </span>
                </div>
              ))}

              {explanation?.rejected?.map((r, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-surface-2/50 border border-border-subtle/50 flex items-center justify-between opacity-60"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-medium text-text-muted truncate">{r.model}</div>
                    <div className="text-[10px] text-red-400 truncate">{r.reason}</div>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                    Floor Fail
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Selected Model & Decision Explanation Column */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">stars</span>
                <h2 className="text-sm font-semibold text-text-main">3. Selected & Pinned Model</h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-brand-500/15 text-brand-500 border border-brand-500/30 text-xs font-bold">
                PINNED
              </span>
            </div>

            {selected ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-brand-500/10 to-transparent border border-brand-500/30">
                  <div className="text-sm font-bold text-text-main">{selected.model}</div>
                  <div className="text-xs text-brand-500 font-medium capitalize mt-0.5">
                    Provider: {selected.provider}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                    Routing Reasoning:
                  </span>
                  <p className="text-xs text-text-main leading-relaxed bg-surface-2 p-3 rounded-lg border border-border-subtle">
                    {explanation?.reason || "Highest composite capability and reliability score."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                No compatible model met the minimum capability floor for this task.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Simulated Failure & Handoff Visualizer Banner */}
      {simulatedFailure && simulatedHandoff && (
        <Card className="p-6 space-y-4 border-amber-500/40 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[26px]">
                published_with_changes
              </span>
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Simulated Model Handoff Executed
                </h3>
                <p className="text-xs text-text-muted">
                  The primary model failed. Rather than aborting the session, Fast-Router created a checkpoint and safely transferred state to a compatible replacement.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-500 border border-green-500/30 text-xs font-bold">
              Continuous Recovery: SUCCESS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-2">
            <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle">
              <span className="text-text-muted block mb-1">Previous Model</span>
              <span className="font-mono font-semibold text-red-400">
                {simulatedHandoff.handoffPackage?.previousModel || "claude-3-7-sonnet"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle">
              <span className="text-text-muted block mb-1">Replacement Model</span>
              <span className="font-mono font-semibold text-green-400">
                {simulatedHandoff.toModel || "gpt-4o"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle">
              <span className="text-text-muted block mb-1">Checkpoint Snapshot</span>
              <span className="font-mono font-semibold text-text-main">
                {simulatedHandoff.checkpointId}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle">
              <span className="text-text-muted block mb-1">Next Action Preserved</span>
              <span className="font-semibold text-text-main">
                {simulatedHandoff.handoffPackage?.nextAction || "Continue planned implementation"}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Resilience Pipeline Workflow Diagram */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <span className="material-symbols-outlined text-brand-500 text-[20px]">linear_scale</span>
          <h2 className="text-sm font-semibold text-text-main">Continuous AI Resilience Pipeline</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-2">
          {[
            { step: "1", title: "Request", desc: "User prompt", icon: "terminal" },
            { step: "2", title: "Classify", desc: "BUILD/RESEARCH", icon: "filter_alt" },
            { step: "3", title: "Cap Floor", desc: "Hard filter", icon: "tune" },
            { step: "4", title: "Pin Model", desc: "Keep stable", icon: "push_pin" },
            { step: "5", title: "Key Failover", desc: "Rotate key", icon: "vpn_key" },
            { step: "6", title: "Checkpoint", desc: "Snapshot state", icon: "save" },
            { step: "7", title: "Handoff", desc: "Clean transition", icon: "swap_horiz" },
            { step: "8", title: "Continue", desc: "Verified result", icon: "check_circle" },
          ].map((s) => (
            <div
              key={s.step}
              className="p-3 rounded-xl bg-surface-2 border border-border-subtle flex flex-col items-center text-center group hover:border-brand-500 transition-colors"
            >
              <div className="size-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-text-muted mb-2 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                {s.step}
              </div>
              <span className="material-symbols-outlined text-[20px] text-text-muted group-hover:text-brand-500 transition-colors mb-1">
                {s.icon}
              </span>
              <span className="text-xs font-bold text-text-main">{s.title}</span>
              <span className="text-[10px] text-text-muted mt-0.5">{s.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

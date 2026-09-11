"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/shared/components";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // New session modal state
  const [newMode, setNewMode] = useState("BUILD");
  const [newModel, setNewModel] = useState("claude-3-7-sonnet");
  const [newProvider, setNewProvider] = useState("anthropic");
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, projRes] = await Promise.all([
        fetch("/api/runtime/sessions"),
        fetch("/api/runtime/projects"),
      ]);
      const sessData = await sessRes.json();
      const projData = await projRes.json();
      if (sessData.success) setSessions(sessData.sessions || []);
      if (projData.success) {
        setProjects(projData.projects || []);
        if (projData.projects?.length > 0 && !selectedProject) {
          setSelectedProject(projData.projects[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load sessions/projects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      let projectId = selectedProject?.id;
      if (newProjectName.trim()) {
        const pRes = await fetch("/api/runtime/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newProjectName.trim(),
            objective: "Build stateful multi-model continuous AI runtime",
            currentPhase: "Execution",
          }),
        });
        const pData = await pRes.json();
        if (pData.success) {
          projectId = pData.project.id;
        }
      }

      await fetch("/api/runtime/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: newMode,
          model: newModel,
          provider: newProvider,
          projectId,
        }),
      });

      setNewProjectName("");
      await fetchData();
    } catch (err) {
      console.error("Failed to create session", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseSession = async (id) => {
    try {
      await fetch(`/api/runtime/sessions/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      console.error("Failed to close session", err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
            <span className="material-symbols-outlined text-white text-[22px]">memory</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Sessions & Persistent Project Memory
            </h1>
            <p className="text-sm text-text-muted">
              Durable project state, model pinning, and context manifests that survive failures
            </p>
          </div>
        </div>
      </div>

      {/* Fundamental Principle Banner */}
      <div className="p-4 rounded-xl bg-surface-2 border border-brand-500/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-brand-500 text-[24px] shrink-0 mt-0.5">
          verified
        </span>
        <div className="text-xs space-y-1">
          <span className="font-bold text-text-main text-sm">
            Core Architectural Guarantee: The Model is Not the Memory
          </span>
          <p className="text-text-muted leading-relaxed">
            Project state, task progress, architectural decisions, and checkpoints live in persistent storage independent of any single LLM. When an API key runs out or a provider goes down, work resumes seamlessly without repeating context.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Sessions & Quick Launch */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-500 text-[20px]">
                  view_list
                </span>
                <h2 className="text-base font-semibold text-text-main">Active Sessions</h2>
              </div>
              <span className="text-xs text-text-muted">{sessions.length} active</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-text-muted">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <span className="material-symbols-outlined text-text-muted text-[36px]">
                  radio_button_unchecked
                </span>
                <p className="text-xs text-text-muted">No active sessions running.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-surface-2 border border-border-subtle hover:border-brand-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-500">{s.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.mode === "BUILD"
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                              : "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                          }`}
                        >
                          {s.mode}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] uppercase font-medium">
                          {s.status}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-text-main flex items-center gap-2">
                        <span>Pinned Model:</span>
                        <span className="font-mono text-brand-400">
                          {s.pinnedModel || s.currentModel || "None"}
                        </span>
                        <span className="text-text-muted">({s.provider})</span>
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Project: {s.projectId || "default-project"} | Started:{" "}
                        {new Date(s.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCloseSession(s.id)}
                      className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 self-start md:self-center"
                    >
                      Close Session
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Create New Session Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <span className="material-symbols-outlined text-brand-500 text-[20px]">add_circle</span>
              <h2 className="text-base font-semibold text-text-main">Start New Pinned Session</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Mode</label>
                <select
                  value={newMode}
                  onChange={(e) => setNewMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-1 text-text-main text-xs font-semibold focus:outline-none"
                >
                  <option value="BUILD">BUILD (Stateful & Pinned)</option>
                  <option value="RESEARCH">RESEARCH (Document Memory)</option>
                  <option value="CHAT">CHAT (Lightweight)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Model to Pin</label>
                <select
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-1 text-text-main text-xs font-mono focus:outline-none"
                >
                  <option value="claude-3-7-sonnet">claude-3-7-sonnet</option>
                  <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  <option value="deepseek-chat">deepseek-chat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Provider</label>
                <select
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-1 text-text-main text-xs focus:outline-none capitalize"
                >
                  <option value="anthropic">anthropic</option>
                  <option value="openai">openai</option>
                  <option value="gemini">gemini</option>
                  <option value="deepseek">deepseek</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Project Name (optional — links to persistent project memory)
              </label>
              <input
                type="text"
                placeholder="e.g., Fast-Router Core Development"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-1 text-text-main text-xs focus:outline-none"
              />
            </div>

            <Button onClick={handleCreateSession} disabled={isCreating} className="text-xs">
              {isCreating ? "Initializing..." : "Start Pinned Session"}
            </Button>
          </Card>
        </div>

        {/* Right Column: Persistent Project Memory Manifest */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500 text-[20px]">
                  folder_open
                </span>
                <h2 className="text-base font-semibold text-text-main">Project Memory</h2>
              </div>
              <span className="text-xs text-purple-400 font-mono">
                {selectedProject?.id || "None"}
              </span>
            </div>

            {selectedProject ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-text-muted font-medium block">Project Name:</span>
                  <span className="text-sm font-bold text-text-main">{selectedProject.name}</span>
                </div>

                <div>
                  <span className="text-text-muted font-medium block">Objective:</span>
                  <p className="text-text-main bg-surface-2 p-2.5 rounded-lg border border-border-subtle mt-1 leading-relaxed">
                    {selectedProject.objective || "Continuous AI engineering system"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-surface-2 border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">Phase</span>
                    <span className="font-semibold text-text-main">
                      {selectedProject.currentPhase || "Execution"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-2 border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">
                      Last Known Good
                    </span>
                    <span className="font-semibold text-green-400 truncate block">
                      {selectedProject.lastKnownGoodState || "Operational"}
                    </span>
                  </div>
                </div>

                {/* Completed tasks */}
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                    Completed Tasks ({selectedProject.completedTasks?.length || 0})
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {selectedProject.completedTasks?.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded bg-surface-2 border border-border-subtle flex items-center gap-1.5 text-text-main"
                      >
                        <span className="material-symbols-outlined text-green-500 text-[14px]">
                          check_circle
                        </span>
                        <span className="truncate">{typeof t === "string" ? t : t.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architectural Decisions */}
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                    Architectural Decisions ({selectedProject.decisions?.length || 0})
                  </span>
                  <div className="space-y-1">
                    {selectedProject.decisions?.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-surface-2 border border-border-subtle space-y-0.5"
                      >
                        <div className="font-semibold text-text-main">{d.title}</div>
                        <div className="text-[11px] text-text-muted">{d.rationale}</div>
                      </div>
                    ))}
                    {(!selectedProject.decisions || selectedProject.decisions.length === 0) && (
                      <div className="text-text-muted italic text-[11px]">
                        No recorded decisions yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-text-muted">
                No project selected. Create or select a project.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

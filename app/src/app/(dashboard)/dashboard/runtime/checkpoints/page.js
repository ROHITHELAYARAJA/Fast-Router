"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/shared/components";

export default function CheckpointsPage() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [restoredNotice, setRestoredNotice] = useState(null);

  useEffect(() => {
    fetchCheckpoints();
  }, []);

  const fetchCheckpoints = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/runtime/checkpoints?limit=50");
      const data = await res.json();
      if (data.success) {
        setCheckpoints(data.checkpoints || []);
        if (data.checkpoints?.length > 0 && !selectedCheckpoint) {
          setSelectedCheckpoint(data.checkpoints[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualCheckpoint = async () => {
    try {
      const res = await fetch("/api/runtime/checkpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger: "manual",
          nextAction: "Continue active implementation milestone",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCheckpoints();
        setSelectedCheckpoint(data.checkpoint);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreCheckpoint = async (id) => {
    setRestoringId(id);
    try {
      const res = await fetch(`/api/runtime/checkpoints/${id}/restore`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setRestoredNotice(`Successfully restored state from checkpoint ${id}`);
        setTimeout(() => setRestoredNotice(null), 5000);
        await fetchCheckpoints();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
            <span className="material-symbols-outlined text-white text-[22px]">restore</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Checkpoints & Model Handoff
            </h1>
            <p className="text-sm text-text-muted">
              Versioned project snapshots, rollback points, and structured handoff packages
            </p>
          </div>
        </div>

        <Button onClick={handleCreateManualCheckpoint} className="flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
          Create Checkpoint Now
        </Button>
      </div>

      {restoredNotice && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {restoredNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkpoint Timeline List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-500 text-[20px]">history</span>
                <h2 className="text-base font-semibold text-text-main">Checkpoint History</h2>
              </div>
              <span className="text-xs text-text-muted">{checkpoints.length} snapshots</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-text-muted">Loading snapshots...</div>
            ) : checkpoints.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <span className="material-symbols-outlined text-text-muted text-[36px]">
                  history_toggle_off
                </span>
                <p className="text-xs text-text-muted">No checkpoints recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkpoints.map((c) => {
                  const isSelected = selectedCheckpoint?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCheckpoint(c)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-surface-2 border-brand-500 ring-1 ring-brand-500"
                          : "bg-surface-1 border-border-subtle hover:bg-surface-2"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-text-main">{c.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.trigger === "before_handoff"
                                ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                : c.trigger === "milestone"
                                ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                                : "bg-purple-500/15 text-purple-500 border border-purple-500/30"
                            }`}
                          >
                            {c.trigger}
                          </span>
                          {c.restoredAt && (
                            <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-medium">
                              Restored
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-text-muted">
                          Next Action:{" "}
                          <span className="text-text-main font-medium">
                            {c.nextAction || "Continue active milestone"}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted">
                          Created: {new Date(c.createdAt).toLocaleString()} | Project:{" "}
                          {c.projectId || "default"}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreCheckpoint(c.id);
                        }}
                        disabled={restoringId === c.id}
                        className="text-xs shrink-0 self-start md:self-center flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">settings_backup_restore</span>
                        {restoringId === c.id ? "Restoring..." : "Restore State"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Snapshot Inspector */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 text-[20px]">
                  visibility
                </span>
                <h2 className="text-base font-semibold text-text-main">Snapshot Inspector</h2>
              </div>
              <span className="font-mono text-xs text-text-muted">
                {selectedCheckpoint?.id || "None"}
              </span>
            </div>

            {selectedCheckpoint ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-text-muted font-semibold block mb-1">Trigger Reason</span>
                  <span className="text-text-main font-medium uppercase px-2 py-1 rounded bg-surface-2 border border-border-subtle inline-block">
                    {selectedCheckpoint.trigger}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted font-semibold block mb-1">Preserved Next Action</span>
                  <p className="text-text-main bg-surface-2 p-2.5 rounded-lg border border-border-subtle leading-relaxed">
                    {selectedCheckpoint.nextAction || "Continue active implementation milestone"}
                  </p>
                </div>

                <div>
                  <span className="text-text-muted font-semibold block mb-1">
                    Files Captured ({selectedCheckpoint.filesChanged?.length || 0})
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {selectedCheckpoint.filesChanged?.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded bg-surface-2 border border-border-subtle font-mono text-[11px] text-text-main truncate"
                      >
                        {typeof f === "string" ? f : f.path}
                      </div>
                    ))}
                    {(!selectedCheckpoint.filesChanged ||
                      selectedCheckpoint.filesChanged.length === 0) && (
                      <div className="text-text-muted italic">No files in snapshot.</div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-text-muted font-semibold block mb-1">Decisions Preserved</span>
                  <div className="space-y-1">
                    {selectedCheckpoint.decisions?.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-surface-2 border border-border-subtle space-y-0.5"
                      >
                        <div className="font-semibold text-text-main">{d.title}</div>
                        <div className="text-[11px] text-text-muted">{d.rationale}</div>
                      </div>
                    ))}
                    {(!selectedCheckpoint.decisions || selectedCheckpoint.decisions.length === 0) && (
                      <div className="text-text-muted italic">No architectural decisions recorded.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-text-muted">
                Select a checkpoint to inspect its snapshot state.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

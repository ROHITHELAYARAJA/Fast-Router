"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/shared/components";

const EVENT_FILTERS = [
  "ALL",
  "task_classified",
  "model_selected",
  "model_pinned",
  "checkpoint_created",
  "handoff_completed",
  "state_restored",
  "session_started",
];

export default function AuditPage() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = "/api/runtime/audit?limit=100";
      if (filter !== "ALL") url += `&eventType=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      e.eventType?.toLowerCase().includes(s) ||
      e.model?.toLowerCase().includes(s) ||
      e.provider?.toLowerCase().includes(s) ||
      e.sessionId?.toLowerCase().includes(s) ||
      e.projectId?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
            <span className="material-symbols-outlined text-white text-[22px]">verified_user</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Runtime Audit Log & Observability
            </h1>
            <p className="text-sm text-text-muted">
              Immutable telemetry for all orchestration decisions, failovers, and handoffs
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchEvents}
          className="flex items-center gap-2 self-start text-xs"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh Audit Trail
        </Button>
      </div>

      {/* Security Guarantee Banner */}
      <div className="p-4 rounded-xl bg-surface-2 border border-green-500/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-green-500 text-[22px] shrink-0 mt-0.5">
          security
        </span>
        <div className="text-xs space-y-1">
          <span className="font-bold text-text-main text-sm">
            Zero-Leak Security Redaction Protocol
          </span>
          <p className="text-text-muted leading-relaxed">
            Fast-Router strictly sanitizes all runtime audit events before persistence. API keys, bearer tokens, OAuth credentials, and passwords are unconditionally replaced with [REDACTED] references.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {EVENT_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                  filter === f
                    ? "bg-brand-500 text-white font-semibold shadow-sm"
                    : "bg-surface-2 hover:bg-surface-3 text-text-muted border border-border-subtle"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search by event, model, session..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-1 text-text-main text-xs focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Events Table and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-semibold text-text-main">Audit Events</h2>
              <span className="text-xs text-text-muted">{filteredEvents.length} events</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-text-muted">Loading audit trail...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">
                No events match current filter.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEvents.map((evt) => {
                  const isSelected = selectedEvent?.id === evt.id;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-surface-2 border-brand-500 ring-1 ring-brand-500"
                          : "bg-surface-1 border-border-subtle hover:bg-surface-2"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              evt.eventType.includes("fail")
                                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                : evt.eventType.includes("handoff")
                                ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                : evt.eventType.includes("checkpoint")
                                ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {evt.eventType}
                          </span>
                          {evt.model && (
                            <span className="font-mono text-xs font-semibold text-text-main truncate">
                              {evt.model}
                            </span>
                          )}
                          {evt.provider && (
                            <span className="text-[10px] text-text-muted uppercase">
                              ({evt.provider})
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-text-muted truncate">
                          {evt.sessionId && `Session: ${evt.sessionId} • `}
                          {evt.projectId && `Project: ${evt.projectId} • `}
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      <span className="material-symbols-outlined text-text-muted text-[16px] shrink-0">
                        chevron_right
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Details Inspector */}
        <div>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-semibold text-text-main">Event Payload</h2>
              <span className="font-mono text-xs text-text-muted">
                {selectedEvent ? `#${selectedEvent.id}` : ""}
              </span>
            </div>

            {selectedEvent ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-text-muted block text-[11px]">Timestamp:</span>
                  <span className="font-mono text-text-main">
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[11px]">Event Type:</span>
                  <span className="font-semibold text-brand-500">{selectedEvent.eventType}</span>
                </div>

                {selectedEvent.model && (
                  <div>
                    <span className="text-text-muted block text-[11px]">Model:</span>
                    <span className="font-mono text-text-main">{selectedEvent.model}</span>
                  </div>
                )}

                {selectedEvent.details && (
                  <div>
                    <span className="text-text-muted block text-[11px] mb-1">
                      Sanitized Details:
                    </span>
                    <pre className="p-3 rounded-lg bg-surface-2 border border-border-subtle font-mono text-[11px] text-text-main overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedEvent.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-text-muted">
                Select an event from the audit trail to inspect sanitized execution details.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

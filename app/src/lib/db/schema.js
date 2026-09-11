// ⚠️ AGENT/DEV: Bump this by +1 EVERY TIME you change the schema below
// (add/remove/alter a table, column, or index in TABLES). It drives the
// pre-change safety backup in migrate.js: when the stored version is lower,
// one lightweight DB backup is taken before applying schema changes. Forgetting
// to bump only skips that backup — it does NOT break the additive auto-sync.
export const SCHEMA_VERSION = 2;


export const PRAGMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 30000000;
PRAGMA cache_size = -64000;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
`;

// Declarative current schema. Used by syncSchemaFromTables() to
// auto-add missing tables/columns/indexes after versioned migrations.
// For destructive changes (drop/rename/type-change), write a migration file.
export const TABLES = {
  _meta: {
    columns: {
      key: "TEXT PRIMARY KEY",
      value: "TEXT NOT NULL",
    },
  },
  settings: {
    columns: {
      id: "INTEGER PRIMARY KEY CHECK (id = 1)",
      data: "TEXT NOT NULL",
    },
  },
  providerConnections: {
    columns: {
      id: "TEXT PRIMARY KEY",
      provider: "TEXT NOT NULL",
      authType: "TEXT NOT NULL",
      name: "TEXT",
      email: "TEXT",
      priority: "INTEGER",
      isActive: "INTEGER DEFAULT 1",
      data: "TEXT NOT NULL",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_pc_provider ON providerConnections(provider)",
      "CREATE INDEX IF NOT EXISTS idx_pc_provider_active ON providerConnections(provider, isActive)",
      "CREATE INDEX IF NOT EXISTS idx_pc_priority ON providerConnections(provider, priority)",
    ],
  },
  providerNodes: {
    columns: {
      id: "TEXT PRIMARY KEY",
      type: "TEXT",
      name: "TEXT",
      data: "TEXT NOT NULL",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: ["CREATE INDEX IF NOT EXISTS idx_pn_type ON providerNodes(type)"],
  },
  proxyPools: {
    columns: {
      id: "TEXT PRIMARY KEY",
      isActive: "INTEGER DEFAULT 1",
      testStatus: "TEXT",
      data: "TEXT NOT NULL",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_pp_active ON proxyPools(isActive)",
      "CREATE INDEX IF NOT EXISTS idx_pp_status ON proxyPools(testStatus)",
    ],
  },
  apiKeys: {
    columns: {
      id: "TEXT PRIMARY KEY",
      key: "TEXT UNIQUE NOT NULL",
      name: "TEXT",
      machineId: "TEXT",
      isActive: "INTEGER DEFAULT 1",
      createdAt: "TEXT NOT NULL",
    },
    indexes: ["CREATE INDEX IF NOT EXISTS idx_ak_key ON apiKeys(key)"],
  },
  combos: {
    columns: {
      id: "TEXT PRIMARY KEY",
      name: "TEXT UNIQUE NOT NULL",
      kind: "TEXT",
      models: "TEXT NOT NULL",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: ["CREATE INDEX IF NOT EXISTS idx_combo_name ON combos(name)"],
  },
  kv: {
    columns: {
      scope: "TEXT NOT NULL",
      key: "TEXT NOT NULL",
      value: "TEXT NOT NULL",
    },
    primaryKey: "PRIMARY KEY (scope, key)",
    indexes: ["CREATE INDEX IF NOT EXISTS idx_kv_scope ON kv(scope)"],
  },
  usageHistory: {
    columns: {
      id: "INTEGER PRIMARY KEY AUTOINCREMENT",
      timestamp: "TEXT NOT NULL",
      provider: "TEXT",
      model: "TEXT",
      connectionId: "TEXT",
      apiKey: "TEXT",
      endpoint: "TEXT",
      promptTokens: "INTEGER DEFAULT 0",
      completionTokens: "INTEGER DEFAULT 0",
      cost: "REAL DEFAULT 0",
      status: "TEXT",
      tokens: "TEXT",
      meta: "TEXT",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_uh_ts ON usageHistory(timestamp DESC)",
      "CREATE INDEX IF NOT EXISTS idx_uh_provider ON usageHistory(provider)",
      "CREATE INDEX IF NOT EXISTS idx_uh_model ON usageHistory(model)",
      "CREATE INDEX IF NOT EXISTS idx_uh_conn ON usageHistory(connectionId)",
    ],
  },
  usageDaily: {
    columns: {
      dateKey: "TEXT PRIMARY KEY",
      data: "TEXT NOT NULL",
    },
  },
  requestDetails: {
    columns: {
      id: "TEXT PRIMARY KEY",
      timestamp: "TEXT NOT NULL",
      provider: "TEXT",
      model: "TEXT",
      connectionId: "TEXT",
      status: "TEXT",
      data: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_rd_ts ON requestDetails(timestamp DESC)",
      "CREATE INDEX IF NOT EXISTS idx_rd_provider ON requestDetails(provider)",
      "CREATE INDEX IF NOT EXISTS idx_rd_model ON requestDetails(model)",
      "CREATE INDEX IF NOT EXISTS idx_rd_conn ON requestDetails(connectionId)",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // FAST-ROUTER STATEFUL RUNTIME TABLES (Phase 2)
  // All additive — no existing tables altered.
  // ──────────────────────────────────────────────────────────────────────────

  // Active sessions — one per stateful task (BUILD/RESEARCH/CHAT)
  sessions: {
    columns: {
      id: "TEXT PRIMARY KEY",
      workspaceId: "TEXT",
      projectId: "TEXT",
      mode: "TEXT NOT NULL DEFAULT 'CHAT'",    // BUILD | RESEARCH | CHAT
      status: "TEXT NOT NULL DEFAULT 'starting'", // starting|running|waiting|recovering|checkpointing|handoff|verifying|completed|failed|paused
      pinnedModel: "TEXT",                     // model locked to this session
      currentModel: "TEXT",                    // model currently in use
      provider: "TEXT",
      connectionId: "TEXT",
      currentTaskId: "TEXT",
      checkpointId: "TEXT",                    // last checkpoint taken
      routingReason: "TEXT",                   // JSON: last routing explanation
      metadata: "TEXT",                        // JSON: free-form session metadata
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
      completedAt: "TEXT",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_sess_project ON sessions(projectId)",
      "CREATE INDEX IF NOT EXISTS idx_sess_status ON sessions(status)",
      "CREATE INDEX IF NOT EXISTS idx_sess_model ON sessions(pinnedModel)",
    ],
  },

  // Persistent project state — survives model changes
  projects: {
    columns: {
      id: "TEXT PRIMARY KEY",
      name: "TEXT NOT NULL",
      objective: "TEXT",                       // what the project is trying to achieve
      currentPhase: "TEXT",
      currentTaskId: "TEXT",
      architectureNotes: "TEXT",               // JSON array of architecture decisions
      decisions: "TEXT",                       // JSON array of important decisions
      dependencies: "TEXT",                    // JSON object: name -> version
      filesChanged: "TEXT",                    // JSON array of modified files
      completedTasks: "TEXT",                  // JSON array of completed task ids
      pendingTasks: "TEXT",                    // JSON array of pending task ids
      testResults: "TEXT",                     // JSON: last known test results
      errorHistory: "TEXT",                    // JSON array of errors encountered
      lastKnownGoodState: "TEXT",              // description of last stable state
      nextAction: "TEXT",                      // what should happen next
      metadata: "TEXT",                        // JSON: free-form project metadata
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_proj_phase ON projects(currentPhase)",
    ],
  },

  // Individual tasks within a project
  tasks: {
    columns: {
      id: "TEXT PRIMARY KEY",
      projectId: "TEXT NOT NULL",
      sessionId: "TEXT",
      name: "TEXT NOT NULL",
      description: "TEXT",
      mode: "TEXT DEFAULT 'BUILD'",
      status: "TEXT DEFAULT 'pending'",        // pending|running|completed|failed|skipped
      model: "TEXT",                           // model that executed this task
      provider: "TEXT",
      connectionId: "TEXT",
      result: "TEXT",                          // JSON: task outcome
      errorDetails: "TEXT",                    // JSON: error info if failed
      filesChanged: "TEXT",                    // JSON array
      checkpointId: "TEXT",                    // checkpoint taken after completion
      tokensUsed: "INTEGER DEFAULT 0",
      costUsd: "REAL DEFAULT 0",
      startedAt: "TEXT",
      completedAt: "TEXT",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_task_project ON tasks(projectId)",
      "CREATE INDEX IF NOT EXISTS idx_task_session ON tasks(sessionId)",
      "CREATE INDEX IF NOT EXISTS idx_task_status ON tasks(status)",
    ],
  },

  // Point-in-time snapshots for recovery
  checkpoints: {
    columns: {
      id: "TEXT PRIMARY KEY",
      projectId: "TEXT NOT NULL",
      sessionId: "TEXT",
      taskId: "TEXT",
      trigger: "TEXT NOT NULL",               // before_handoff|milestone|before_deploy|recovery|manual
      projectState: "TEXT NOT NULL",          // JSON: full project state snapshot
      taskState: "TEXT",                      // JSON: current task state
      filesChanged: "TEXT",                   // JSON array of files at this point
      repositoryState: "TEXT",               // JSON: git status/hash if available
      decisions: "TEXT",                      // JSON: decisions up to this point
      testResults: "TEXT",                    // JSON: test results at this point
      nextAction: "TEXT",                     // what should happen after restore
      restoredAt: "TEXT",                     // set if this checkpoint was restored from
      createdAt: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_chk_project ON checkpoints(projectId)",
      "CREATE INDEX IF NOT EXISTS idx_chk_session ON checkpoints(sessionId)",
      "CREATE INDEX IF NOT EXISTS idx_chk_trigger ON checkpoints(trigger)",
      "CREATE INDEX IF NOT EXISTS idx_chk_created ON checkpoints(createdAt DESC)",
    ],
  },

  // Model-to-model handoff records
  handoffs: {
    columns: {
      id: "TEXT PRIMARY KEY",
      sessionId: "TEXT NOT NULL",
      projectId: "TEXT",
      checkpointId: "TEXT",                   // checkpoint created before handoff
      fromModel: "TEXT NOT NULL",
      fromProvider: "TEXT",
      fromConnectionId: "TEXT",
      toModel: "TEXT",                        // null until a replacement is found
      toProvider: "TEXT",
      toConnectionId: "TEXT",
      failureReason: "TEXT NOT NULL",         // rate_limit|quota|auth|timeout|network|model_unavailable
      failureDetails: "TEXT",                 // JSON: raw error info
      recoveryAttempted: "INTEGER DEFAULT 0", // number of recovery attempts before handoff
      handoffPackage: "TEXT",                 // JSON: context sent to receiving model
      verificationResult: "TEXT",             // JSON: result of post-handoff verification
      status: "TEXT DEFAULT 'pending'",       // pending|completed|failed
      startedAt: "TEXT NOT NULL",
      completedAt: "TEXT",
      createdAt: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_ho_session ON handoffs(sessionId)",
      "CREATE INDEX IF NOT EXISTS idx_ho_project ON handoffs(projectId)",
      "CREATE INDEX IF NOT EXISTS idx_ho_status ON handoffs(status)",
    ],
  },

  // Immutable runtime event log — never write credentials here
  auditLog: {
    columns: {
      id: "INTEGER PRIMARY KEY AUTOINCREMENT",
      timestamp: "TEXT NOT NULL",
      eventType: "TEXT NOT NULL",             // request_started|task_classified|model_selected|model_pinned|key_failed|rate_limit|checkpoint_created|handoff_started|handoff_completed|session_resumed|task_completed
      sessionId: "TEXT",
      projectId: "TEXT",
      taskId: "TEXT",
      handoffId: "TEXT",
      checkpointId: "TEXT",
      model: "TEXT",
      provider: "TEXT",
      connectionId: "TEXT",                  // reference only — no credential values
      details: "TEXT",                       // JSON: event-specific data (no secrets)
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_al_ts ON auditLog(timestamp DESC)",
      "CREATE INDEX IF NOT EXISTS idx_al_type ON auditLog(eventType)",
      "CREATE INDEX IF NOT EXISTS idx_al_session ON auditLog(sessionId)",
      "CREATE INDEX IF NOT EXISTS idx_al_project ON auditLog(projectId)",
    ],
  },

  // Per-workspace/project routing policies
  runtimePolicies: {
    columns: {
      id: "TEXT PRIMARY KEY",
      scope: "TEXT NOT NULL",                // 'global' | 'workspace:{id}' | 'project:{id}'
      buildCapabilityFloor: "TEXT",          // JSON: minimum capabilities for BUILD
      researchCapabilityFloor: "TEXT",       // JSON: minimum capabilities for RESEARCH
      chatCapabilityFloor: "TEXT",           // JSON: minimum capabilities for CHAT
      preferredProviders: "TEXT",            // JSON array of provider ids
      preferredModels: "TEXT",               // JSON array of model ids
      pinnedModels: "TEXT",                  // JSON: { BUILD: model, RESEARCH: model }
      maxCostPerRequestUsd: "REAL",
      maxLatencyMs: "INTEGER",
      fallbackBehavior: "TEXT DEFAULT 'same-model-key-first'",
      handoffBehavior: "TEXT DEFAULT 'checkpoint-then-compatible'",
      retryCount: "INTEGER DEFAULT 3",
      checkpointFrequency: "TEXT DEFAULT 'milestone'", // milestone|periodic|manual
      metadata: "TEXT",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_rp_scope ON runtimePolicies(scope)",
    ],
  },
};

export function buildCreateTableSql(name, def) {
  const cols = Object.entries(def.columns).map(([k, v]) => `${k} ${v}`);
  if (def.primaryKey) cols.push(def.primaryKey);
  return `CREATE TABLE IF NOT EXISTS ${name} (${cols.join(", ")})`;
}

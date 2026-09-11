// Fast-Router Capability-Aware Routing Engine API Endpoint
import { NextResponse } from "next/server";
import { selectModel } from "@/lib/routing/capabilityRouter.js";
import { classifyTask } from "@/lib/taskClassifier/index.js";
import { getProviderConnections } from "@/lib/db/repos/connectionsRepo.js";
import { auditLog } from "@/lib/audit/auditLogger.js";

// Standard model roster across known providers if none supplied
const DEFAULT_MODEL_CANDIDATES = [
  { model: "claude-3-7-sonnet", provider: "anthropic", healthScore: 98, costPerToken: 0.000015 },
  { model: "claude-3-5-sonnet", provider: "anthropic", healthScore: 96, costPerToken: 0.000015 },
  { model: "gpt-4o", provider: "openai", healthScore: 97, costPerToken: 0.000010 },
  { model: "gpt-4o-mini", provider: "openai", healthScore: 99, costPerToken: 0.000001 },
  { model: "gemini-2.5-pro", provider: "gemini", healthScore: 95, costPerToken: 0.000007 },
  { model: "gemini-2.5-flash", provider: "gemini", healthScore: 99, costPerToken: 0.000001 },
  { model: "deepseek-chat", provider: "deepseek", healthScore: 93, costPerToken: 0.000002 },
  { model: "deepseek-reasoner", provider: "deepseek", healthScore: 92, costPerToken: 0.000004 },
  { model: "qwen-max", provider: "qwen", healthScore: 90, costPerToken: 0.000005 },
];

export async function POST(request) {
  try {
    const body = await request.json();
    let {
      prompt,
      messages,
      tools,
      modelHint,
      classification,
      candidates,
      policy = null,
      pinnedModel = null,
      sessionId = null,
      projectId = null,
    } = body;

    // 1. Classify if classification wasn't pre-computed
    if (!classification) {
      const requestBody = {
        messages: messages || (prompt ? [{ role: "user", content: prompt }] : []),
        tools: tools || [],
        model: modelHint || "",
      };
      classification = classifyTask(requestBody);
    }

    // 2. Discover available candidates if not provided
    if (!candidates || candidates.length === 0) {
      const conns = await getProviderConnections({ isActive: true });
      if (conns && conns.length > 0) {
        candidates = conns.map((c) => ({
          model: c.defaultModel || (c.provider === "anthropic" ? "claude-3-5-sonnet" : c.provider === "openai" ? "gpt-4o" : "gemini-2.5-flash"),
          provider: c.provider,
          connectionId: c.id,
          healthScore: c.testStatus === "active" ? 95 : 80,
          costPerToken: 0.00001,
        }));
      } else {
        candidates = DEFAULT_MODEL_CANDIDATES;
      }
    }

    // 3. Execute capability-aware routing
    const result = selectModel(classification, candidates, policy, pinnedModel);

    // 4. Audit decision
    await auditLog("model_selected", {
      sessionId,
      projectId,
      model: result.selected?.model || null,
      provider: result.selected?.provider || null,
      connectionId: result.selected?.connectionId || null,
      details: {
        mode: classification.mode,
        explanation: result.explanation,
      },
    });

    return NextResponse.json({
      success: true,
      classification,
      selected: result.selected,
      explanation: result.explanation,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Routing evaluation failed" },
      { status: 500 }
    );
  }
}

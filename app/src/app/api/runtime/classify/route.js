import { NextResponse } from "next/server";
import { classifyTask } from "@/lib/taskClassifier/index.js";
import { auditLog } from "@/lib/audit/auditLogger.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, messages, tools, model, session = null, project = null } = body;

    const requestBody = {
      messages: messages || (prompt ? [{ role: "user", content: prompt }] : []),
      tools: tools || [],
      model: model || "",
    };

    const classification = classifyTask(requestBody, session, project);

    await auditLog("task_classified", {
      sessionId: session?.id || null,
      projectId: project?.id || null,
      model,
      details: {
        mode: classification.mode,
        statefulness: classification.statefulness,
        confidence: classification.confidence,
        requirements: classification.requirements,
      },
    });

    return NextResponse.json({
      success: true,
      classification,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to classify task" },
      { status: 500 }
    );
  }
}

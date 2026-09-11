/**
 * Fast-Router — Task Classifier (Skill 4)
 *
 * Classifies incoming requests into BUILD / RESEARCH / CHAT modes,
 * and determines what capabilities the task requires.
 *
 * Rule: Do not classify only from keywords. Consider the full request
 * body, existing session, project context, and tool requirements.
 *
 * Output shape:
 * {
 *   mode: 'BUILD' | 'RESEARCH' | 'CHAT',
 *   statefulness: 'stateful' | 'semi-stateful' | 'stateless',
 *   requirements: {
 *     coding: boolean,
 *     reasoning: boolean,
 *     tools: boolean,
 *     vision: boolean,
 *     longContext: boolean,
 *     contextMin: number,   // minimum context window tokens needed
 *     outputMin: number,    // minimum output tokens needed
 *   },
 *   confidence: number,     // 0–1
 *   explanation: string[],  // human-readable reasons
 * }
 */

// BUILD signals — strongly indicate software development work
const BUILD_SIGNALS = [
  // Direct build/code terms
  /\b(build|implement|create|write|code|develop|program|script)\b/i,
  /\b(function|class|module|component|api|endpoint|server|cli|app|application)\b/i,
  /\b(bug|fix|debug|error|exception|crash|issue|regression)\b/i,
  /\b(refactor|restructure|migrate|upgrade|update|patch|improve)\b/i,
  /\b(test|spec|unit test|integration test|e2e|jest|vitest|mocha)\b/i,
  /\b(deploy|build|compile|bundle|package|release|publish)\b/i,
  /\b(git|commit|push|pull request|branch|merge|diff|patch)\b/i,
  /\b(database|schema|migration|query|sql|nosql|orm)\b/i,
  /\b(docker|container|kubernetes|k8s|dockerfile|compose)\b/i,
  /\b(repository|codebase|project|workspace|directory|file)\b/i,
  // File extensions
  /\.(js|ts|py|go|rs|java|kt|swift|cs|rb|php|html|css|json|yaml|yml|toml|sql)\b/i,
];

// RESEARCH signals — large documents, analysis, knowledge extraction
const RESEARCH_SIGNALS = [
  /\b(read|analyze|analyse|summarize|summarise|extract|study|review)\b/i,
  /\b(document|pdf|paper|article|report|research|book|whitepaper)\b/i,
  /\b(compare|contrast|evaluate|assess|audit|survey)\b/i,
  /\b(what does .* say|find in .* document|according to|based on the)\b/i,
  /\b(translate|transcribe|understand|explain this)\b/i,
];

// CHAT signals — simple, stateless, conversational
const CHAT_SIGNALS = [
  /\b(what is|what are|how do|can you|tell me|explain|describe)\b/i,
  /\b(help me understand|give me|list|enumerate|provide)\b/i,
  /\b(brainstorm|ideas|suggestions|options|alternatives)\b/i,
  /\b(quick|simple|brief|short|one-liner|tldr)\b/i,
];

// Tool-use signals
const TOOL_SIGNALS = [
  /\b(search|lookup|find|fetch|retrieve|get)\b/i,
  /\btool\b/i,
  /\bfunction call\b/i,
  /\bweb search\b/i,
];

// Vision signals — image or file attachments
const VISION_SIGNALS = [
  /\b(image|photo|screenshot|diagram|chart|picture|visual)\b/i,
  /\b(ocr|describe this image|what's in this|look at this)\b/i,
];

// Coding signals
const CODING_SIGNALS = [
  /```[a-z]*/i,    // code blocks
  /\bfunction\b/i,
  /\bconst\b|\blet\b|\bvar\b/,
  /\bimport\b|\bexport\b/,
  /\bclass\b|\bdef\b|\bfn\b/,
];

/**
 * Classify a chat request.
 *
 * @param {object} body  - Request body (messages, tools, model, etc.)
 * @param {object|null} session - Active session if any
 * @param {object|null} project - Active project state if any
 * @returns {object} Classification result
 */
export function classifyTask(body, session = null, project = null) {
  const text = extractTextFromBody(body);
  const hasTools = !!(body.tools?.length || body.tool_choice);
  const hasImages = hasImageAttachments(body);
  const hasCodeBlock = /```[a-z]*/i.test(text);
  const hasManyMessages = (body.messages?.length || 0) > 5;
  const modelHint = body.model || '';

  // Score each mode
  let buildScore = 0;
  let researchScore = 0;
  let chatScore = 0;
  const reasons = [];

  // Existing session/project context heavily influences classification
  if (session?.mode === 'BUILD' && session?.status !== 'completed') {
    buildScore += 5;
    reasons.push('active BUILD session in progress');
  }
  if (project) {
    buildScore += 2;
    reasons.push('active project context');
  }

  // Scan message text
  for (const pattern of BUILD_SIGNALS) {
    if (pattern.test(text)) {
      buildScore++;
    }
  }
  for (const pattern of RESEARCH_SIGNALS) {
    if (pattern.test(text)) researchScore++;
  }
  for (const pattern of CHAT_SIGNALS) {
    if (pattern.test(text)) chatScore++;
  }

  // Code blocks are a strong BUILD signal
  if (hasCodeBlock) {
    buildScore += 2;
    reasons.push('message contains code blocks');
  }

  // Long context + document patterns suggest RESEARCH
  if (hasManyMessages && researchScore > 0) {
    researchScore += 2;
    reasons.push('multi-turn + research signals');
  }

  // Tool requirements
  const requiresTools = hasTools;
  if (hasTools) {
    buildScore += 1;
    reasons.push('request includes tool definitions');
  }

  // Vision requirements
  const requiresVision = hasImages;
  if (hasImages) {
    reasons.push('request contains image attachments');
  }

  // Coding signals
  const requiresCoding = CODING_SIGNALS.some(p => p.test(text)) || buildScore > 3;

  // Reasoning — complex analysis or debugging
  const requiresReasoning = buildScore > 5 || researchScore > 3;

  // Long context — large conversation or research
  const messageLen = body.messages?.reduce((acc, m) => {
    const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
    return acc + content.length;
  }, 0) || 0;
  const estimatedTokens = Math.ceil(messageLen / 4); // rough estimate
  const requiresLongContext = estimatedTokens > 50000;

  // Determine mode
  let mode;
  if (buildScore > researchScore && buildScore > chatScore) {
    mode = 'BUILD';
    reasons.push(`BUILD score: ${buildScore} > RESEARCH: ${researchScore}, CHAT: ${chatScore}`);
  } else if (researchScore > chatScore) {
    mode = 'RESEARCH';
    reasons.push(`RESEARCH score: ${researchScore} > CHAT: ${chatScore}`);
  } else {
    mode = 'CHAT';
    reasons.push(`CHAT score: ${chatScore}`);
  }

  // Statefulness
  const statefulness =
    mode === 'BUILD' ? 'stateful' :
    mode === 'RESEARCH' ? 'semi-stateful' :
    'stateless';

  // Context and output requirements
  const contextMin = requiresLongContext ? 100000 : mode === 'BUILD' ? 32000 : 8000;
  const outputMin = mode === 'BUILD' ? 4000 : 2000;

  const confidence = Math.min(
    (Math.max(buildScore, researchScore, chatScore) / 10),
    1
  );

  return {
    mode,
    statefulness,
    requirements: {
      coding: requiresCoding,
      reasoning: requiresReasoning,
      tools: requiresTools,
      vision: requiresVision,
      longContext: requiresLongContext,
      contextMin,
      outputMin,
    },
    confidence,
    explanation: reasons,
    scores: { build: buildScore, research: researchScore, chat: chatScore },
  };
}

function extractTextFromBody(body) {
  if (!body.messages) return '';
  return body.messages.map(m => {
    if (typeof m.content === 'string') return m.content;
    if (Array.isArray(m.content)) {
      return m.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join(' ');
    }
    return '';
  }).join('\n');
}

function hasImageAttachments(body) {
  if (!body.messages) return false;
  return body.messages.some(m => {
    if (!Array.isArray(m.content)) return false;
    return m.content.some(c =>
      c.type === 'image_url' || c.type === 'image' || c.type === 'document'
    );
  });
}

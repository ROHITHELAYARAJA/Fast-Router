"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components";
import FastRouterLogo from "@/shared/components/FastRouterLogo";

// Exclusive catalog of top-tier, heavy-end production models
export const HEAVY_PRODUCTION_MODELS = [
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    badge: "HYBRID THINKING",
    badgeColor: "border-sky-500/40 bg-sky-500/10 text-sky-400",
    description: "Hybrid fast/deep reasoning frontier model. SOTA coding & multi-file architecture.",
    contextWindow: "200K",
    hasThinking: true,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet v2",
    provider: "Anthropic",
    badge: "CODE FLAGSHIP",
    badgeColor: "border-sky-500/40 bg-sky-500/10 text-sky-400",
    description: "Industry gold standard for complex code generation, refactoring, and agentic workflows.",
    contextWindow: "200K",
    hasThinking: false,
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    badge: "MASSIVE REASONING",
    badgeColor: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    description: "Exhaustive synthesis, nuanced analysis, and philosophical depth.",
    contextWindow: "200K",
    hasThinking: false,
  },
  {
    id: "o1",
    name: "OpenAI o1",
    provider: "OpenAI",
    badge: "DELIBERATE REASONING",
    badgeColor: "border-[#FF4D4D]/40 bg-[#FF4D4D]/10 text-[#FF4D4D]",
    description: "Full deliberate chain-of-thought for mathematical proofs, algorithms, and hard sciences.",
    contextWindow: "200K",
    hasThinking: true,
  },
  {
    id: "o3-mini",
    name: "OpenAI o3-mini",
    provider: "OpenAI",
    badge: "STEM & CODE REASONER",
    badgeColor: "border-[#FF4D4D]/40 bg-[#FF4D4D]/10 text-[#FF4D4D]",
    description: "High-reasoning STEM powerhouse optimized for competitive programming and fast logic.",
    contextWindow: "200K",
    hasThinking: true,
  },
  {
    id: "gpt-4.5-preview",
    name: "OpenAI GPT-4.5 Preview",
    provider: "OpenAI",
    badge: "ORION FLAGSHIP",
    badgeColor: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    description: "Massive scale foundation model with unmatched cross-domain intuition and breadth.",
    contextWindow: "128K",
    hasThinking: false,
  },
  {
    id: "gpt-4o",
    name: "OpenAI GPT-4o",
    provider: "OpenAI",
    badge: "OMNI PRODUCTION",
    badgeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    description: "Omni multimodal heavy production workhorse for high-speed analysis and vision.",
    contextWindow: "128K",
    hasThinking: false,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    badge: "2M HEAVY REASONING",
    badgeColor: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    description: "Next-gen heavy reasoning engine with native multimodal understanding across 2M tokens.",
    contextWindow: "2M",
    hasThinking: true,
  },
  {
    id: "gemini-2.0-flash-thinking-exp-01-21",
    name: "Gemini 2.0 Flash Thinking",
    provider: "Google",
    badge: "FLASH THINKING",
    badgeColor: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    description: "Real-time transparent chain-of-thought with ultra-low time-to-first-token.",
    contextWindow: "1M",
    hasThinking: true,
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek R1 (671B)",
    provider: "DeepSeek",
    badge: "671B REASONER",
    badgeColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
    description: "Frontier open-weights reasoning model with emergent self-correction and exhaustive proofs.",
    contextWindow: "64K",
    hasThinking: true,
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek V3 (671B MoE)",
    provider: "DeepSeek",
    badge: "671B MoE HEAVY",
    badgeColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
    description: "Massive 671B mixture-of-experts production model delivering flagship intelligence.",
    contextWindow: "64K",
    hasThinking: false,
  },
  {
    id: "grok-2-1212",
    name: "xAI Grok 2",
    provider: "xAI",
    badge: "FRONTIER REASONING",
    badgeColor: "border-amber-400/40 bg-amber-400/10 text-amber-400",
    description: "High-compute flagship model with unconstrained synthesis and real-time awareness.",
    contextWindow: "128K",
    hasThinking: false,
  },
  {
    id: "meta-llama/llama-3.1-405b-instruct",
    name: "Llama 3.1 405B Instruct",
    provider: "Meta",
    badge: "405B OPEN FLAGSHIP",
    badgeColor: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
    description: "The world's largest open-weights frontier model rivaling closed proprietary flagships.",
    contextWindow: "128K",
    hasThinking: false,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    provider: "Meta",
    badge: "70B PRODUCTION",
    badgeColor: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
    description: "Dense instruction precision matching previous generation 405B capabilities.",
    contextWindow: "128K",
    hasThinking: false,
  },
];

const STORAGE_KEYS = {
  sessions: "fast-router.chat.sessions.v2",
  activeSessionId: "fast-router.chat.activeId.v2",
};

function generateId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Split content into thinking block and response body
function parseThinkingAndResponse(text = "") {
  if (!text) return { thinking: "", response: "" };

  // Match <think>...</think> tag
  const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    const thinking = thinkMatch[1].trim();
    const response = text.replace(/<think>[\s\S]*?<\/think>/i, "").trim();
    return { thinking, response };
  }

  // Handle open unclosed <think> during live streaming
  const openThinkMatch = text.match(/<think>([\s\S]*)$/i);
  if (openThinkMatch) {
    return { thinking: openThinkMatch[1].trim(), response: "" };
  }

  return { thinking: "", response: text };
}

export default function ChatClient() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(HEAVY_PRODUCTION_MODELS[0].id);
  const [inputPrompt, setInputPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("You are an elite, production-grade AI assistant routed via Fast-Router. Provide accurate, rigorous, high-quality answers with complete code where relevant.");
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveStreamingText, setLiveStreamingText] = useState("");
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Initialize or load sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.sessions);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const savedActiveId = localStorage.getItem(STORAGE_KEYS.activeSessionId);
          const activeExists = parsed.some((s) => s.id === savedActiveId);
          setActiveSessionId(activeExists ? savedActiveId : parsed[0].id);
          return;
        }
      }
    } catch {
      // ignore parse error
    }

    // Create fresh initial session
    const initialSession = {
      id: generateId(),
      title: "New Reasoning Thread",
      modelId: HEAVY_PRODUCTION_MODELS[0].id,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
        localStorage.setItem(STORAGE_KEYS.activeSessionId, activeSessionId);
      } catch {}
    }
  }, [sessions, activeSessionId]);

  // Current active session
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  // Current selected model definition
  const currentModel = useMemo(() => {
    return (
      HEAVY_PRODUCTION_MODELS.find((m) => m.id === (activeSession?.modelId || selectedModelId)) ||
      HEAVY_PRODUCTION_MODELS[0]
    );
  }, [activeSession, selectedModelId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, liveStreamingText]);

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setInputPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 220)}px`;
  };

  // Create new session
  const handleNewChat = () => {
    const newSession = {
      id: generateId(),
      title: "New Reasoning Thread",
      modelId: currentModel.id,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  // Delete session
  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== id);
    if (filtered.length === 0) {
      const fresh = {
        id: generateId(),
        title: "New Reasoning Thread",
        modelId: currentModel.id,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(filtered);
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  // Switch model
  const handleSelectModel = (modelId) => {
    setSelectedModelId(modelId);
    setModelSelectorOpen(false);
    if (activeSession) {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? { ...s, modelId } : s))
      );
    }
  };

  // Copy code or message
  const handleCopyText = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch {}
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Send Message
  const handleSendMessage = async () => {
    const prompt = inputPrompt.trim();
    if (!prompt || isGenerating || !activeSession) return;

    const userMessage = {
      id: generateId(),
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...activeSession.messages, userMessage];
    const sessionTitle =
      activeSession.messages.length === 0
        ? prompt.slice(0, 36) + (prompt.length > 36 ? "..." : "")
        : activeSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: sessionTitle,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );

    setInputPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsGenerating(true);
    setLiveStreamingText("");

    abortControllerRef.current = new AbortController();
    const startTime = Date.now();

    try {
      // Build request payload
      const requestPayloadMessages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: currentModel.id,
          messages: requestPayloadMessages,
          temperature,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errMsg =
          errorJson.error?.message ||
          errorJson.message ||
          `Error ${response.status}: Failed to reach Fast-Router model gateway.`;
        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to read response stream from gateway.");
      }

      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const dataStr = trimmed.replace(/^data:\s*/, "");
          if (dataStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta;
            const chunk = delta?.content || delta?.reasoning_content || "";
            if (chunk) {
              accumulatedText += chunk;
              setLiveStreamingText(accumulatedText);
            }
          } catch {
            // non-json line, pass
          }
        }
      }

      const latencyMs = Date.now() - startTime;
      const assistantMessage = {
        id: generateId(),
        role: "assistant",
        content: accumulatedText || "No response received.",
        modelId: currentModel.id,
        latencyMs,
        createdAt: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                messages: [...updatedMessages, assistantMessage],
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );
    } catch (err) {
      if (err.name === "AbortError") {
        if (liveStreamingText) {
          const assistantMessage = {
            id: generateId(),
            role: "assistant",
            content: liveStreamingText + "\n\n*(Generation stopped)*",
            modelId: currentModel.id,
            createdAt: new Date().toISOString(),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSession.id
                ? {
                    ...s,
                    messages: [...updatedMessages, assistantMessage],
                    updatedAt: new Date().toISOString(),
                  }
                : s
            )
          );
        }
      } else {
        const errorMessage = {
          id: generateId(),
          role: "assistant",
          isError: true,
          content: `⚠️ Gateway Error: ${err.message}\n\nPlease check your provider credentials or route in **Providers** or **Endpoint & Key**.`,
          createdAt: new Date().toISOString(),
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? {
                  ...s,
                  messages: [...updatedMessages, errorMessage],
                  updatedAt: new Date().toISOString(),
                }
              : s
          )
        );
      }
    } finally {
      setIsGenerating(false);
      setLiveStreamingText("");
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-68px)] w-full overflow-hidden bg-[#09090B] text-white">
      {/* Collapsible Chat History Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border-subtle bg-[#0c0d12]/90 backdrop-blur-xl transition-all duration-300 z-10 shrink-0",
          historyDrawerOpen ? "w-64" : "w-0 overflow-hidden border-none"
        )}
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-border/30">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-mono text-xs font-semibold tracking-wider transition-all shadow-[0_0_12px_rgba(56,189,248,0.15)] group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>NEW CHAT</span>
            </div>
            <span className="text-[10px] bg-sky-500/20 px-1.5 py-0.5 rounded text-sky-300 font-sans font-bold">
              HEAVY
            </span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="px-2 py-1 text-[10px] font-mono uppercase text-text-muted/60 tracking-wider">
            Conversations ({sessions.length})
          </div>
          {sessions.map((session) => {
            const isSelected = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={cn(
                  "group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-all border",
                  isSelected
                    ? "bg-sky-500/15 border-sky-500/30 text-white font-medium shadow-[inset_0_0_8px_rgba(56,189,248,0.1)]"
                    : "border-transparent text-text-muted hover:bg-surface-2 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 pr-6">
                  <span
                    className={cn(
                      "material-symbols-outlined text-[16px] shrink-0",
                      isSelected ? "text-sky-400" : "text-text-muted group-hover:text-sky-400"
                    )}
                  >
                    chat_bubble_outline
                  </span>
                  <span className="truncate">{session.title || "New Thread"}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  title="Delete chat"
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#FF4D4D] transition-opacity text-text-muted shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Link to App Builder */}
        <div className="p-3 border-t border-border/30 bg-surface-1/40">
          <Link
            href="/dashboard/apps"
            className="flex items-center gap-2 p-2 rounded-lg text-xs font-mono text-sky-400 hover:bg-sky-500/10 border border-sky-500/20 transition-all group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
              rocket_launch
            </span>
            <div className="truncate">
              <div className="font-bold text-[11px] leading-tight">AI App Builder</div>
              <div className="text-[10px] text-text-muted">Export production apps</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        {/* Top Control Bar */}
        <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border/40 bg-[#09090B]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            {/* Toggle History Button */}
            <button
              onClick={() => setHistoryDrawerOpen(!historyDrawerOpen)}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-surface-2 transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">
                {historyDrawerOpen ? "dock_to_left" : "menu_open"}
              </span>
            </button>

            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setModelSelectorOpen(!modelSelectorOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border/60 bg-surface-1/80 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all text-xs cursor-pointer shadow-sm"
              >
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="font-mono font-bold tracking-tight text-white">{currentModel.name}</span>
                <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border", currentModel.badgeColor)}>
                  {currentModel.badge}
                </span>
                <span className="material-symbols-outlined text-[16px] text-text-muted">
                  {modelSelectorOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {modelSelectorOpen && (
                <div className="absolute left-0 mt-2 w-96 max-h-[460px] overflow-y-auto rounded-xl border border-border-subtle bg-[#12131a] p-2 shadow-2xl z-50 custom-scrollbar animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-border/30 text-[11px] font-mono text-text-muted/70 uppercase tracking-wider flex items-center justify-between">
                    <span>Heavy-End Production Models</span>
                    <span className="text-[#FF4D4D] font-bold">FRONTIER ONLY</span>
                  </div>
                  <div className="space-y-1 py-1">
                    {HEAVY_PRODUCTION_MODELS.map((model) => {
                      const isSelected = model.id === currentModel.id;
                      return (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel(model.id)}
                          className={cn(
                            "w-full text-left p-2.5 rounded-lg transition-all border flex flex-col gap-1 cursor-pointer",
                            isSelected
                              ? "bg-sky-500/15 border-sky-500/40 shadow-[inset_0_0_10px_rgba(56,189,248,0.15)]"
                              : "border-transparent hover:bg-surface-2 hover:border-border/40"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                              {model.name}
                              {model.hasThinking && (
                                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/30">
                                  THINK
                                </span>
                              )}
                            </span>
                            <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border", model.badgeColor)}>
                              {model.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                            {model.description}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted/60 mt-0.5">
                            <span>Provider: {model.provider}</span>
                            <span>Context: {model.contextWindow}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Settings Drawer Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer",
                showSystemPrompt
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                  : "border-border/40 text-text-muted hover:text-white hover:bg-surface-2"
              )}
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span className="hidden sm:inline">System & Params</span>
            </button>
          </div>
        </div>

        {/* System Prompt & Parameter Accordion Drawer */}
        {showSystemPrompt && (
          <div className="px-4 py-3 border-b border-border/40 bg-[#0c0d12]/95 backdrop-blur-md flex flex-col md:flex-row gap-4 z-10 animate-in slide-in-from-top-2">
            <div className="flex-1">
              <label className="block text-[10px] font-mono uppercase text-sky-400 font-bold mb-1">
                System Persona & Context
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={2}
                placeholder="Instruct the model on tone, constraints, guidelines, or persona..."
                className="w-full bg-[#12131a] border border-border/50 rounded-lg p-2 text-xs font-mono text-white placeholder:text-text-muted/40 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
            <div className="w-full md:w-56 flex flex-col justify-between">
              <div>
                <div className="flex justify-between text-[10px] font-mono text-text-muted mb-1">
                  <span>Temperature</span>
                  <span className="text-sky-400 font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-surface-2 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted/60 pt-2 border-t border-border/20">
                <span>Active Route:</span>
                <span className="text-emerald-400 font-bold">Fast-Router /v1</span>
              </div>
            </div>
          </div>
        )}

        {/* Chat Feed Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 custom-scrollbar">
          {(!activeSession || activeSession.messages.length === 0) && !liveStreamingText ? (
            /* Empty State Hero */
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-[#FF4D4D]/20 border border-sky-500/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                <FastRouterLogo size="md" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-white mb-2">
                Fast-Router Reasoning Studio
              </h1>
              <p className="text-xs md:text-sm text-text-muted leading-relaxed mb-6 max-w-md">
                Connected directly to frontier heavy-end production models. Execute complex architecture,
                deep coding, mathematical proofs, and agentic tasks with ultra-high throughput.
              </p>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                {[
                  {
                    title: "Architecture Refactoring",
                    desc: "Design a resilient distributed rate-limiter with token bucket and Redis fallback.",
                  },
                  {
                    title: "Competitive Code Proof",
                    desc: "Analyze time complexity and write an optimal O(N log N) algorithm for 2D range tree.",
                  },
                  {
                    title: "SQL & Schema Optimizer",
                    desc: "Optimize a PostgreSQL query with composite indexing and CTE partitioning.",
                  },
                  {
                    title: "Security & Vulnerability Audit",
                    desc: "Review a Next.js middleware implementation for JWT replay attacks and timing leaks.",
                  },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputPrompt(sample.desc);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 rounded-xl border border-border/40 bg-surface-1/60 hover:bg-surface-2 hover:border-sky-500/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-mono font-bold text-white group-hover:text-sky-400 transition-colors">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-text-muted line-clamp-2 mt-0.5">{sample.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Feed */
            activeSession?.messages.map((message, index) => {
              const isUser = message.role === "user";
              const { thinking, response } = parseThinkingAndResponse(message.content);

              return (
                <div
                  key={message.id || index}
                  className={cn("flex flex-col gap-2 max-w-4xl mx-auto", isUser ? "items-end" : "items-start")}
                >
                  {/* Avatar & Sender Info */}
                  <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-text-muted">
                    {isUser ? (
                      <>
                        <span>You</span>
                        <span className="size-1.5 rounded-full bg-sky-400" />
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-sky-400">{message.modelId || currentModel.name}</span>
                        {message.latencyMs && (
                          <span className="text-[10px] text-text-muted/60">
                            ({(message.latencyMs / 1000).toFixed(2)}s)
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-full overflow-x-auto",
                      isUser
                        ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-medium shadow-lg"
                        : message.isError
                          ? "bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs w-full"
                          : "bg-surface-1/90 border border-border/50 text-white w-full shadow-md"
                    )}
                  >
                    {/* Thinking Process Disclosure (if present) */}
                    {thinking && (
                      <details className="mb-3 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 text-xs font-mono text-purple-200">
                        <summary className="cursor-pointer font-bold flex items-center gap-2 text-purple-400 hover:text-purple-300 select-none">
                          <span className="material-symbols-outlined text-[16px]">psychology</span>
                          <span>Thought Process & Reasoning Chain</span>
                        </summary>
                        <div className="mt-2.5 pt-2 border-t border-purple-500/20 text-purple-200/90 whitespace-pre-wrap leading-relaxed text-[11px]">
                          {thinking}
                        </div>
                      </details>
                    )}

                    {/* Formatted Content */}
                    <div className="whitespace-pre-wrap break-words">{response || message.content}</div>

                    {/* Copy Button on Assistant Messages */}
                    {!isUser && !message.isError && (
                      <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-text-muted">
                        <span className="text-[10px] text-text-muted/50">Fast-Router Gateway</span>
                        <button
                          onClick={() => handleCopyText(response || message.content, index)}
                          className="flex items-center gap-1 hover:text-sky-400 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {copiedIndex === index ? "check" : "content_copy"}
                          </span>
                          <span>{copiedIndex === index ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Live Streaming Indicator Bubble */}
          {isGenerating && liveStreamingText && (
            <div className="flex flex-col gap-2 max-w-4xl mx-auto items-start">
              <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-sky-400">
                <span className="size-2 rounded-full bg-sky-400 animate-ping" />
                <span className="font-bold">{currentModel.name} (Generating...)</span>
              </div>
              <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed bg-surface-1/90 border border-sky-500/30 text-white w-full shadow-md">
                {(() => {
                  const { thinking, response } = parseThinkingAndResponse(liveStreamingText);
                  return (
                    <>
                      {thinking && (
                        <div className="mb-3 rounded-lg border border-purple-500/40 bg-purple-500/10 p-3 text-xs font-mono text-purple-200 animate-pulse">
                          <div className="font-bold flex items-center gap-2 text-purple-300 mb-1">
                            <span className="material-symbols-outlined text-[16px] animate-spin">
                              progress_activity
                            </span>
                            <span>Thinking...</span>
                          </div>
                          <div className="text-[11px] whitespace-pre-wrap">{thinking}</div>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap break-words">
                        {response}
                        <span className="inline-block w-2 h-4 ml-1 bg-sky-400 animate-pulse" />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-border/40 bg-[#09090B]/95 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            {/* Stop Button (When generating) */}
            {isGenerating && (
              <div className="flex justify-center">
                <button
                  onClick={handleStopGeneration}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-[#FF4D4D] text-xs font-mono hover:bg-red-500/30 transition-all cursor-pointer shadow-lg"
                >
                  <span className="material-symbols-outlined text-[14px]">stop</span>
                  <span>Stop Generating</span>
                </button>
              </div>
            )}

            {/* Prompt Input Box */}
            <div className="relative rounded-2xl border border-border/60 bg-[#12131a] focus-within:border-sky-400/80 focus-within:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all flex flex-col p-2.5">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={`Ask ${currentModel.name} anything... (Enter to send, Shift+Enter for newline)`}
                className="w-full bg-transparent resize-none text-sm text-white placeholder:text-text-muted/50 focus:outline-none px-2 py-1 max-h-56 custom-scrollbar"
              />

              {/* Bottom Action Bar inside Textarea */}
              <div className="flex items-center justify-between pt-2 px-1 border-t border-white/5 mt-1">
                <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-sky-400 font-bold">
                    {currentModel.provider}
                  </span>
                  <span>{inputPrompt.length} chars</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputPrompt.trim() || isGenerating}
                    className={cn(
                      "size-8 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                      inputPrompt.trim() && !isGenerating
                        ? "bg-sky-500 hover:bg-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                        : "bg-surface-2 text-text-muted/40 cursor-not-allowed"
                    )}
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Micro disclaimer */}
            <div className="text-center text-[10px] font-mono text-text-muted/50">
              Fast-Router orchestrates requests with sub-millisecond local routing. Responses generated by upstream production providers.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

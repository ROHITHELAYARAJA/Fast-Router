"use client";

import { useState, useEffect } from "react";
import FastRouterLogo from "@/shared/components/FastRouterLogo";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetHint, setResetHint] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(null);
  const [authMode, setAuthMode] = useState("password");
  const [ssoType, setSsoType] = useState("oidc");
  const [oidcConfigured, setOidcConfigured] = useState(false);
  const [oidcLoginLabel, setOidcLoginLabel] = useState("Sign in with OIDC");
  const [samlConfigured, setSamlConfigured] = useState(false);
  const [samlLoginLabel, setSamlLoginLabel] = useState("Sign in with SAML SSO");
  const [mustChange, setMustChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Rate-limit countdown
  useEffect(() => {
    if (retryAfter <= 0) return;
    const id = setInterval(() => setRetryAfter((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  useEffect(() => {
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

      try {
        const res = await fetch(`${baseUrl}/api/auth/status`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated === true || data.requireLogin === false) {
            window.location.assign("/dashboard");
            return;
          }
          setHasPassword(!!data.hasPassword);
          setAuthMode(data.authMode || "password");
          setSsoType(data.ssoType || "oidc");
          setOidcConfigured(data.oidcConfigured === true);
          setOidcLoginLabel(data.oidcLoginLabel || "Sign in with OIDC");
          setSamlConfigured(data.samlConfigured === true);
          setSamlLoginLabel(data.samlLoginLabel || "Sign in with SAML SSO");
        } else {
          setHasPassword(true);
        }
      } catch {
        clearTimeout(timeoutId);
        setHasPassword(true);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setResetHint("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.mustChangePassword) {
          setMustChange(true);
          return;
        }
        window.location.assign("/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid gateway password");
        if (data.resetHint) setResetHint(data.resetHint);
        if (data.retryAfter) setRetryAfter(Number(data.retryAfter));
      }
    } catch {
      setError("Connection error. Please ensure Fast-Router is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setPassword("123456");
    setError("");
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      if (res.ok) {
        window.location.assign("/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update password");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOidcLogin = () => {
    window.location.href = "/api/auth/oidc/start";
  };

  const handleSamlLogin = () => {
    window.location.href = "/api/auth/saml/start";
  };

  const isSsoEnabled = ["sso", "oidc", "saml", "both"].includes(authMode);
  const activeSsoType = ssoType || (authMode === "saml" ? "saml" : "oidc");
  const samlAvailable = isSsoEnabled && activeSsoType === "saml" && samlConfigured;
  const oidcAvailable = isSsoEnabled && activeSsoType === "oidc" && oidcConfigured;
  const ssoAvailable = samlAvailable || oidcAvailable;
  const passwordAvailable = authMode === "password" || authMode === "both" || !ssoAvailable;

  if (hasPassword === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
          <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            INITIALIZING FAST-ROUTER GATEWAY...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-white px-4 py-12 relative overflow-hidden font-sans select-none">
      {/* High-Contrast Dual Accents: Sky-Blue & Light-Red Ambiance */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#FF4D4D]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Industrial Tech Grid Lines */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#27272a1a_1px,transparent_1px),linear-gradient(to_bottom,#27272a1a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Geometric Display Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <span className="size-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-slate-300 font-semibold tracking-wider uppercase">CORE GATEWAY</span>
            <span className="text-slate-600">//</span>
            <span className="text-[#FF4D4D] font-bold">ONLINE</span>
          </div>

          {/* Logo with Boxy Geometric Display Typography (BIGSTAGE & MONTECH inspired) */}
          <div className="mb-3">
            <FastRouterLogo size="lg" showSubtitle={false} />
          </div>

          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">
            STATEFUL AI RUNTIME // LOAD BALANCER // V.02
          </p>
        </div>

        {/* Architectural Card */}
        <div className="rounded-xl border border-slate-800 bg-[#121216]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Top highlight bar in Sky-Blue to Light-Red gradient */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 via-white to-[#FF4D4D]" />

          {mustChange ? (
            <form onSubmit={handleSetNewPassword} className="flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs leading-relaxed font-mono">
                SECURITY PROTOCOL: Define a new master password before remote gateway access.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  New Gateway Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new master password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all text-sm font-mono"
                />
                {error && <p className="text-xs text-[#FF4D4D] mt-1 font-mono">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={!newPassword || loading}
                className="w-full py-3 px-4 rounded-lg bg-[#FF4D4D] hover:bg-[#ef4444] text-white font-bold text-sm shadow-[0_0_20px_rgba(255,77,77,0.35)] transition-all cursor-pointer disabled:opacity-50 font-display uppercase tracking-wider"
              >
                {loading ? "UPDATING..." : "CONFIRM NEW CREDENTIAL"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              {samlAvailable && (
                <button
                  type="button"
                  onClick={handleSamlLogin}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
                >
                  <span className="material-symbols-outlined text-sky-400 text-[18px]">verified_user</span>
                  {samlLoginLabel}
                </button>
              )}

              {oidcAvailable && (
                <button
                  type="button"
                  onClick={handleOidcLogin}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
                >
                  <span className="material-symbols-outlined text-sky-400 text-[18px]">badge</span>
                  {oidcLoginLabel}
                </button>
              )}

              {ssoAvailable && passwordAvailable && (
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-[1px] bg-slate-800" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">OR ACCESS VIA KEY</span>
                  <div className="flex-1 h-[1px] bg-slate-800" />
                </div>
              )}

              {passwordAvailable && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                        ACCESS KEY // PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={handleQuickFill}
                        className="text-[11px] font-mono font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20"
                      >
                        FILL: 123456
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password (e.g. 123456)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        className="w-full pl-4 pr-11 py-3 rounded-lg bg-black/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all text-sm font-mono tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>

                    {error && (
                      <div className="p-2.5 mt-1 rounded-lg bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center gap-2 text-xs text-[#FF4D4D] font-mono">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>{error}</span>
                      </div>
                    )}

                    {retryAfter > 0 && (
                      <p className="text-xs text-amber-400 font-mono mt-1">
                        Locked. Cooling down: {retryAfter}s remaining.
                      </p>
                    )}

                    {resetHint && (
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Forgot key? Run <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">node app/cli/cli.js</code> → Settings → Reset Password.
                      </p>
                    )}
                  </div>

                  {/* Primary Submit Button: High-Impact Boxy Display Design */}
                  <button
                    id="login-btn"
                    type="submit"
                    disabled={loading || retryAfter > 0 || !password}
                    className="w-full py-3.5 px-4 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 font-display uppercase tracking-wider"
                    style={{
                      fontFamily: "'Chakra Petch', 'Space Grotesk', system-ui, sans-serif"
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="size-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                        <span>AUTHENTICATING...</span>
                      </>
                    ) : retryAfter > 0 ? (
                      <span>WAIT {retryAfter}s</span>
                    ) : (
                      <>
                        <span>ENTER GATEWAY</span>
                        <span className="font-bold text-base">&gt;</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/60">
                    <span className="text-[11px] font-mono text-slate-500">DEFAULT KEY:</span>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-[11px] font-mono font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20 hover:bg-sky-400/20 transition-colors cursor-pointer"
                    >
                      123456
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Technical Brutalist Footer */}
        <div className="mt-8 text-center text-xs font-mono text-slate-500 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-white font-bold">FAST-ROUTER</span>
            <span>//</span>
            <span>NEURAL AI GATEWAY</span>
            <span>//</span>
            <span className="text-[#FF4D4D] font-bold">2026</span>
          </div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">
            ALL RIGHTS RESERVED • RESILIENT INFERENCE PROXY
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

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
      <div className="min-h-screen flex items-center justify-center bg-[#090D16] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            Initializing Fast-Router...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090D16] px-4 py-12 relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Grid Background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Gateway Status: Active
          </div>

          <div className="size-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-[0_0_30px_rgba(37,99,235,0.4)] mb-4">
            <div className="w-full h-full bg-[#0F172A] rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-[32px]">
                router
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Fast<span className="text-blue-500">-Router</span>
          </h1>
          <p className="text-sm text-slate-400 font-normal max-w-xs">
            High-Performance AI Proxy & Stateful Inference Gateway
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#0F172A]/85 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Subtle top highlight line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          {mustChange ? (
            <form onSubmit={handleSetNewPassword} className="flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
                Security notice: set a strong replacement password before accessing Fast-Router remotely.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new master password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-mono"
                />
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={!newPassword || loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Updating Credentials..." : "Set Password & Continue"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              {samlAvailable && (
                <button
                  type="button"
                  onClick={handleSamlLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-blue-400 text-[18px]">verified_user</span>
                  {samlLoginLabel}
                </button>
              )}

              {oidcAvailable && (
                <button
                  type="button"
                  onClick={handleOidcLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-blue-400 text-[18px]">badge</span>
                  {oidcLoginLabel}
                </button>
              )}

              {ssoAvailable && passwordAvailable && (
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-[1px] bg-slate-800" />
                  <span className="text-[11px] font-mono text-slate-500 uppercase">or sign in with key</span>
                  <div className="flex-1 h-[1px] bg-slate-800" />
                </div>
              )}

              {passwordAvailable && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Gateway Access Key
                      </label>
                      <button
                        type="button"
                        onClick={handleQuickFill}
                        className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        [Quick Fill: 123456]
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
                        className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all text-sm font-mono tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>

                    {error && (
                      <div className="p-2.5 mt-1 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400 animate-shake">
                        <span className="material-symbols-outlined text-[16px] text-red-400">error</span>
                        <span>{error}</span>
                      </div>
                    )}

                    {retryAfter > 0 && (
                      <p className="text-xs text-amber-400 font-mono mt-1">
                        Locked. Cooling down: {retryAfter}s remaining.
                      </p>
                    )}

                    {resetHint && (
                      <p className="text-xs text-slate-400 mt-1">
                        Reset via CLI: <code className="text-blue-300 bg-slate-900 px-1 py-0.5 rounded">node app/cli/cli.js</code> → Settings → Reset Password.
                      </p>
                    )}
                  </div>

                  <button
                    id="login-btn"
                    type="submit"
                    disabled={loading || retryAfter > 0 || !password}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(37,99,235,0.35)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : retryAfter > 0 ? (
                      <span>Wait {retryAfter}s</span>
                    ) : (
                      <>
                        <span>Enter Gateway</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
                    <span className="text-xs text-slate-500">Default Credentials:</span>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      123456
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 flex flex-col items-center gap-1">
          <p>© 2026 Fast-Router Systems. All rights reserved.</p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>v0.1.0</span>
            <span>•</span>
            <span>Zero-Config AI Gateway</span>
            <span>•</span>
            <span>Local & Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

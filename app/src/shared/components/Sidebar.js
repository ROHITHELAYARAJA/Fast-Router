"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { UPDATER_CONFIG } from "@/shared/constants/config";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import Button from "./Button";
import { ConfirmModal } from "./Modal";
import FastRouterLogo from "./FastRouterLogo";

// Primary Workspace navigation (Core products)
const coreItems = [
  {
    href: "/dashboard/chat",
    label: "AI Chat",
    icon: "chat",
    badge: "HEAVY",
    description: "Production reasoning chat",
  },
  {
    href: "/dashboard/apps",
    label: "App Builder",
    icon: "apps",
    badge: "STUDIO",
    description: "Build & export AI apps",
  },
];

// Infrastructure & Gateway navigation
const gatewayItems = [
  { href: "/dashboard/endpoint", label: "Endpoint & Key", icon: "api" },
  { href: "/dashboard/providers", label: "Providers", icon: "dns" },
  { href: "/dashboard/combos", label: "Routing & Combos", icon: "layers" },
  { href: "/dashboard/usage", label: "Usage & Metrics", icon: "bar_chart" },
  { href: "/dashboard/quota", label: "Quota Tracker", icon: "data_usage" },
];

// System & Preferences
const systemItems = [
  { href: "/dashboard/profile", label: "Settings", icon: "settings" },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shutdownCountdown, setShutdownCountdown] = useState(0);
  const { copied, copy } = useCopyToClipboard(2000);

  const INSTALL_CMD = UPDATER_CONFIG.installCmdLatest;

  // Lazy check for new npm version on mount
  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasUpdate) setUpdateInfo(data);
      })
      .catch(() => {});
  }, []);

  const isActive = (href) => {
    if (href === "/dashboard/endpoint") {
      return pathname === "/dashboard/endpoint";
    }
    if (href === "/dashboard/chat") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/chat");
    }
    return pathname.startsWith(href);
  };

  const handleUpdate = () => {
    setShowUpdateModal(false);
    setIsUpdating(true);
  };

  const handleCopyAndShutdown = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
    } catch {
      /* clipboard blocked */
    }
    copy(INSTALL_CMD);
    let remaining = UPDATER_CONFIG.shutdownCountdownSec;
    setShutdownCountdown(remaining);
    const timer = setInterval(() => {
      remaining -= 1;
      setShutdownCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        fetch("/api/version/shutdown", { method: "POST" }).catch(() => {});
        setIsDisconnected(true);
      }
    }, 1000);
  };

  const handleCancelUpdate = () => {
    setIsUpdating(false);
    setShutdownCountdown(0);
  };

  return (
    <>
      <aside className="flex w-72 flex-col border-r border-border-subtle bg-vibrancy backdrop-blur-xl transition-colors duration-300 min-h-full select-none">
        {/* Traffic lights */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>

        {/* Logo */}
        <div className="px-5 py-4 flex flex-col gap-2 border-b border-border/40">
          <Link href="/dashboard" className="transition-transform hover:scale-[1.02]">
            <FastRouterLogo size="md" />
          </Link>
          {updateInfo && (
            <div className="flex flex-col gap-1.5 rounded p-1 -m-1">
              <span className="text-xs font-semibold text-green-600 dark:text-amber-500">
                ↑ New version available: v{updateInfo.latestVersion}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Update now
                </button>
                <button
                  onClick={() => copy(INSTALL_CMD)}
                  title="Copy install command"
                  className="flex-1 text-left hover:opacity-80 transition-opacity cursor-pointer min-w-0"
                >
                  <code className="block text-[10px] text-green-600/80 dark:text-amber-400/70 font-mono truncate">
                    {copied ? "✓ copied!" : INSTALL_CMD}
                  </code>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Section: Core Workspace */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-mono font-bold text-sky-400 tracking-wider uppercase flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
              <span>Workspace</span>
            </p>
            {coreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg transition-all group border border-transparent",
                  isActive(item.href)
                    ? "bg-sky-500/10 text-white font-semibold shadow-[inset_0_0_12px_rgba(56,189,248,0.15)] border-sky-500/30 border-l-2 border-l-sky-400"
                    : "text-text-muted hover:bg-surface-2 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "material-symbols-outlined text-[19px] transition-colors",
                      isActive(item.href) ? "text-sky-400 fill-1" : "group-hover:text-sky-400"
                    )}
                  >
                    {item.icon}
                  </span>
                  <div className="truncate">
                    <span className="text-[13px] font-medium block leading-tight">{item.label}</span>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider border",
                      isActive(item.href)
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        : "bg-surface-2 text-text-muted border-border/40 group-hover:text-sky-400 group-hover:border-sky-500/30"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Section: Router & Gateway */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-mono font-bold text-text-muted/70 tracking-wider uppercase flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#FF4D4D] shadow-[0_0_6px_rgba(255,77,77,0.6)]" />
              <span>Router Gateway</span>
            </p>
            {gatewayItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all group border border-transparent",
                  isActive(item.href)
                    ? "bg-sky-500/10 text-white font-semibold shadow-[inset_0_0_12px_rgba(56,189,248,0.12)] border-l-2 border-l-sky-400"
                    : "text-text-muted hover:bg-surface-2 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[18px] transition-colors",
                    isActive(item.href) ? "text-sky-400 fill-1" : "group-hover:text-sky-400"
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-[13px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Section: System & Preferences */}
          <div className="space-y-1 pt-1 border-t border-border/20">
            <p className="px-3 text-[11px] font-mono font-bold text-text-muted/60 tracking-wider uppercase">
              System
            </p>
            {systemItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all group border border-transparent",
                  isActive(item.href)
                    ? "bg-sky-500/10 text-white font-semibold border-l-2 border-l-sky-400"
                    : "text-text-muted hover:bg-surface-2 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[18px] transition-colors",
                    isActive(item.href) ? "text-sky-400 fill-1" : "group-hover:text-sky-400"
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-[13px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer Gateway Info */}
        <div className="p-3 mx-3 mb-3 rounded-lg border border-border/40 bg-surface-1/60 text-[11px]">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-sky-400 font-bold">Fast-Router v0.1</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-text-muted/80 leading-tight">
            High-throughput production gateway for heavy LLM models.
          </p>
        </div>
      </aside>

      {/* Update Confirmation Modal */}
      <ConfirmModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={handleUpdate}
        title="Update Fast-Router"
        message={`Show install command for v${updateInfo?.latestVersion || ""}? You can copy it and shutdown to install manually.`}
        confirmText="Show Command"
        cancelText="Cancel"
        variant="primary"
      />

      {/* Disconnected / Updating Overlay */}
      {(isDisconnected || isUpdating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          {isUpdating ? (
            <ManualUpdatePanel
              latestVersion={updateInfo?.latestVersion}
              installCmd={INSTALL_CMD}
              copied={copied}
              onCopyAndShutdown={handleCopyAndShutdown}
              onCancel={handleCancelUpdate}
              countdown={shutdownCountdown}
              isDisconnected={isDisconnected}
            />
          ) : (
            <div className="text-center p-8">
              <div className="flex items-center justify-center size-16 rounded-full bg-red-500/20 text-red-500 mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">power_off</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Server Disconnected</h2>
              <p className="text-text-muted mb-6">The proxy server has been stopped.</p>
              <Button variant="secondary" onClick={() => globalThis.location.reload()}>
                Reload Page
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

Sidebar.propTypes = {
  onClose: PropTypes.func,
};

function ManualUpdatePanel({
  latestVersion,
  installCmd,
  copied,
  onCopyAndShutdown,
  onCancel,
  countdown,
  isDisconnected,
}) {
  const isCountingDown = countdown > 0;
  return (
    <div className="w-full max-w-lg rounded-xl bg-neutral-900/95 border border-white/10 p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center size-11 rounded-full bg-amber-500/20 text-amber-400">
          <span className="material-symbols-outlined text-[24px]">content_copy</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            Update Fast-Router{latestVersion ? ` to v${latestVersion}` : ""}
          </h2>
          <p className="text-xs text-white/60">
            {isDisconnected
              ? "Server stopped. Paste the command into a terminal to install."
              : isCountingDown
                ? `Command copied. Server will stop in ${countdown}s...`
                : "Click the button below to copy the install command and shutdown."}
          </p>
        </div>
      </div>

      <p className="text-sm text-white/80 mb-2">Install command:</p>
      <div className="w-full px-3 py-2 rounded bg-white/5 mb-4">
        <code className="text-xs font-mono text-amber-400 break-all">{installCmd}</code>
      </div>

      <ol className="text-xs text-white/70 space-y-1 list-decimal list-inside mb-4">
        <li>
          Click <strong>Copy & Shutdown</strong> below.
        </li>
        <li>Paste the command into your terminal and press Enter.</li>
        <li>
          Run <code className="px-1 rounded bg-white/10 text-green-400">Fast-Router</code> again after install.
        </li>
      </ol>

      {isDisconnected ? (
        <Button variant="secondary" fullWidth onClick={() => globalThis.location.reload()}>
          Reload Page
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isCountingDown}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onCopyAndShutdown}
            disabled={isCountingDown}
          >
            {copied
              ? "✓ Copied — shutting down..."
              : isCountingDown
                ? `Shutting down in ${countdown}s`
                : "Copy & Shutdown"}
          </Button>
        </div>
      )}
    </div>
  );
}

ManualUpdatePanel.propTypes = {
  latestVersion: PropTypes.string,
  installCmd: PropTypes.string.isRequired,
  copied: PropTypes.bool,
  onCopyAndShutdown: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  countdown: PropTypes.number,
  isDisconnected: PropTypes.bool,
};

"use client";

import PropTypes from "prop-types";

/**
 * FastRouterLogo
 * Stylized geometric display logo inspired by the BIGSTAGE & MONTECH boxy industrial design.
 * Features:
 * - High-impact boxy typography with chamfered geometry
 * - Colorway: Crisp White (#FFFFFF), Deep Black (#09090B), Sky-Blue (#38BDF8), and Light-Red (#FF4D4D)
 * - Directional router chevron '>' and speed vector
 */
export default function FastRouterLogo({ size = "md", showSubtitle = true, className = "" }) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none tracking-tight ${className}`}>
      {/* Geometric Router Hex-Box Icon */}
      <div
        className={`relative shrink-0 flex items-center justify-center rounded-xl bg-[#09090B] border border-slate-800 shadow-md ${
          isLg ? "size-14" : isSm ? "size-8" : "size-10"
        } overflow-hidden group`}
      >
        {/* Sky-Blue and Light-Red dynamic accent glow */}
        <div className="absolute -top-3 -left-3 size-8 bg-sky-400/30 rounded-full blur-sm" />
        <div className="absolute -bottom-3 -right-3 size-8 bg-red-400/30 rounded-full blur-sm" />

        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isLg ? "size-8" : isSm ? "size-5" : "size-6"}
        >
          {/* Top router signal arc - Sky Blue */}
          <path
            d="M8 12C13.5 7.5 22.5 7.5 28 12"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Middle router signal arc - Crisp White */}
          <path
            d="M12 17C15.5 14 20.5 14 24 17"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Center core emitter - Light Red */}
          <rect
            x="14"
            y="21"
            width="8"
            height="8"
            rx="2"
            fill="#FF4D4D"
          />
          <circle cx="18" cy="25" r="1.5" fill="#FFFFFF" />
          {/* Directional beam indicator */}
          <path
            d="M18 29V32"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Typographic Wordmark (Boxy Display Font inspired by BIGSTAGE & MONTECH) */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          {/* FAST */}
          <span
            className={`font-black uppercase text-white font-display tracking-wide ${
              isLg ? "text-3xl" : isSm ? "text-lg" : "text-xl"
            }`}
            style={{
              fontFamily: "'Chakra Petch', 'Space Grotesk', system-ui, sans-serif",
              letterSpacing: "-0.03em"
            }}
          >
            FAST
          </span>

          {/* ROUTER in boxy Light-Red badge */}
          <span
            className={`font-black uppercase px-2 py-0.5 rounded text-white bg-[#FF4D4D] shadow-[0_0_15px_rgba(255,77,77,0.35)] ${
              isLg ? "text-2xl" : isSm ? "text-sm" : "text-base"
            }`}
            style={{
              fontFamily: "'Chakra Petch', 'Space Grotesk', system-ui, sans-serif",
              letterSpacing: "-0.01em"
            }}
          >
            ROUTER
          </span>

          {/* MONTECH-style chevron '>' */}
          <span className="text-sky-400 font-bold font-mono text-sm sm:text-base ml-0.5">
            &gt;
          </span>
        </div>

        {/* Technical Subtitle */}
        {showSubtitle && (
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`font-mono uppercase font-semibold text-slate-400 tracking-widest ${
                isLg ? "text-[11px]" : "text-[9px]"
              }`}
            >
              STATEFUL AI GATEWAY
            </span>
            <span className="size-1 rounded-full bg-sky-400 animate-pulse" />
            <span className={`font-mono text-sky-400 font-bold ${isLg ? "text-[11px]" : "text-[9px]"}`}>
              V.02
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

FastRouterLogo.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showSubtitle: PropTypes.bool,
  className: PropTypes.string,
};

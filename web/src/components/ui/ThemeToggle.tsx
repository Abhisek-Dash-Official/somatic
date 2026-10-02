"use client";

import { useId, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === "dark";
    const [clicks, setClicks] = useState(0);
    const maskId = `moon-${useId().replace(/:/g, "")}`;

    const handleClick = () => {
        toggleTheme();
        setClicks((c) => c + 1);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            className="group relative h-10 w-10 overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_18px_rgba(8,169,181,0.25)] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
            <style>{`
                @keyframes tt-twinkle {
                    0%, 100% { opacity: .25; transform: scale(.6); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes tt-burst {
                    0% { opacity: .7; transform: scale(.2); }
                    100% { opacity: 0; transform: scale(2.4); }
                }
                @keyframes tt-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-1.5px); }
                }
                @keyframes tt-sweep {
                    0% { transform: translateX(-120%) skewX(-20deg); }
                    100% { transform: translateX(220%) skewX(-20deg); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .tt-anim, .tt-anim * { animation: none !important; transition-duration: 0s !important; }
                }
            `}</style>

            <span className="tt-anim absolute inset-0">
                {/* Sky: day */}
                <span
                    className={`absolute inset-0 bg-linear-to-br from-amber-100/80 via-sky-100/60 to-sky-200/40 transition-opacity duration-700 ${isDark ? "opacity-0" : "opacity-100"
                        }`}
                />
                {/* Sky: night */}
                <span
                    className={`absolute inset-0 bg-linear-to-br from-indigo-950 via-slate-900 to-slate-800 transition-opacity duration-700 ${isDark ? "opacity-100" : "opacity-0"
                        }`}
                />

                {/* Stars */}
                {[
                    { top: "18%", left: "68%", size: 3, delay: "0s" },
                    { top: "62%", left: "74%", size: 2, delay: "0.6s" },
                    { top: "30%", left: "22%", size: 2, delay: "1.1s" },
                    { top: "74%", left: "34%", size: 2, delay: "0.3s" },
                ].map((s, i) => (
                    <span
                        key={i}
                        className={`absolute rounded-full bg-white transition-all duration-700 ${isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"
                            }`}
                        style={{
                            top: s.top,
                            left: s.left,
                            width: s.size,
                            height: s.size,
                            transitionDelay: isDark ? `${200 + i * 90}ms` : "0ms",
                        }}
                    >
                        <span
                            className="block h-full w-full rounded-full bg-white"
                            style={{ animation: `tt-twinkle 2.4s ease-in-out ${s.delay} infinite` }}
                        />
                    </span>
                ))}

                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[tt-sweep_0.9s_ease-out]" />
            </span>

            {/* Sun / moon morph */}
            <span
                className="tt-anim absolute inset-0 flex items-center justify-center"
                style={{ animation: "tt-float 4s ease-in-out infinite" }}
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{ transform: isDark ? "rotate(-25deg)" : "rotate(0deg)" }}
                    aria-hidden="true"
                >
                    <defs>
                        <mask id={maskId}>
                            <rect width="24" height="24" fill="white" />
                            <circle
                                cx="17"
                                cy="8"
                                r="5.5"
                                fill="black"
                                style={{
                                    transform: isDark ? "translate(0px, 0px)" : "translate(10px, -10px)",
                                    transition: "transform 700ms cubic-bezier(0.65, 0, 0.35, 1)",
                                }}
                            />
                        </mask>
                    </defs>

                    <g
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        style={{
                            transformOrigin: "12px 12px",
                            transform: isDark ? "rotate(90deg) scale(0.3)" : "rotate(0deg) scale(1)",
                            opacity: isDark ? 0 : 1,
                            transition: "transform 700ms cubic-bezier(0.65, 0, 0.35, 1), opacity 400ms ease",
                        }}
                    >
                        {RAYS.map((deg) => (
                            <line
                                key={deg}
                                x1="12"
                                y1="2.5"
                                x2="12"
                                y2="4.5"
                                transform={`rotate(${deg} 12 12)`}
                            />
                        ))}
                    </g>

                    <circle
                        cx="12"
                        cy="12"
                        r="6"
                        mask={`url(#${maskId})`}
                        style={{
                            fill: isDark ? "#e0e7ff" : "#f59e0b",
                            transformOrigin: "12px 12px",
                            transform: isDark ? "scale(1.05)" : "scale(0.8)",
                            transition: "fill 700ms ease, transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                            filter: isDark
                                ? "drop-shadow(0 0 3px rgba(199,210,254,0.7))"
                                : "drop-shadow(0 0 3px rgba(245,158,11,0.6))",
                        }}
                    />
                </svg>
            </span>

            {clicks > 0 && (
                <span
                    key={clicks}
                    className="tt-anim pointer-events-none absolute inset-0 m-auto h-8 w-8 rounded-full border-2 border-primary/70"
                    style={{ animation: "tt-burst 0.7s ease-out forwards" }}
                />
            )}
        </button>
    );
}
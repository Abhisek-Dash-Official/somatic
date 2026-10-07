"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/50 hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
            <span className="relative flex h-5 w-5 items-center justify-center">
                <Sun
                    className={`absolute h-5 w-5 transition-all duration-200 ${isDark
                            ? "scale-75 rotate-90 opacity-0"
                            : "scale-100 rotate-0 opacity-100"
                        }`}
                />

                <Moon
                    className={`absolute h-5 w-5 transition-all duration-200 ${isDark
                            ? "scale-100 rotate-0 opacity-100"
                            : "scale-75 -rotate-90 opacity-0"
                        }`}
                />
            </span>
        </button>
    );
}
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#141a27] border border-slate-200 dark:border-[#232d43]" />
    );
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:border-slate-300 dark:border-[#232d43] dark:bg-[#141a27] dark:hover:bg-[#1c2438] dark:text-cyan-400 dark:hover:border-cyan-500/50 flex items-center justify-center text-sm transition cursor-pointer shadow-xs"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      <span>{isDark ? "🌙" : "☀️"}</span>
    </button>
  );
}
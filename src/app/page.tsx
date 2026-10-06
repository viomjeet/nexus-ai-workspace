"use client";

import React, { useState } from "react";
import AudioStudio from "./components/AudioStudio";
import VideoStudio from "./components/VideoStudio";
import { NavItemList } from "./api/dist/data";
import HistoryTab from "./components/HistoryTab";
import HeavyList from "./HeavyList";
import ThemeToggle from "./components/ThemeToggle";

export default function StudioApp() {
  const [activeNav, setActiveNav] = useState<any>("audio");
  const [navItems] = useState<any[]>(NavItemList)

  const navMenuClass = (activeNav: string, type: string) => {
    const selectedNav =
      activeNav === type
        ? "bg-cyan-50 text-cyan-700 font-semibold dark:bg-slate-800/60 dark:text-cyan-400"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/30";
    return `w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedNav}`;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-[#07090e] dark:text-[#f0f4fc] font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 border-r border-slate-200 dark:border-[#171d2b] bg-white dark:bg-[#0b0e17] flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-[#171d2b] gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block">
                NEXUS STUDIO
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400 block -mt-1">
                Enterprise AI Suite
              </span>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-2">
              Workspaces
            </div>

            <div className="space-y-1">
              {navItems.map((item, index) => {
                // Agar separator hai to divider line render karein
                if (item.type === "separator") {
                  return (
                    <div key={`sep-${index}`} className="my-2.5 px-3">
                      {item.label ? (
                        <p className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                          {item.label}
                        </p>
                      ) : (
                        <div className="border-t border-slate-200 dark:border-slate-700/50" />
                      )}
                    </div>
                  );
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={navMenuClass(activeNav, item.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={item.iconSize}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${item.badge.className}`}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-[#171d2b] space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Session Status</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
              Live Online
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#141a27] dark:hover:bg-[#1c2438] dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#232d43] transition">
              Log In
            </button>
            <button className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition">
              Register
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-[#171d2b] bg-white dark:bg-[#0a0d15] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {activeNav === "audio" && "Voiceover Studio / Production Console"}
              {activeNav === "video" && "AI Video Generation / Motion Deck"}
              {activeNav === "history" && "Saved Audio & Video Artifacts"}
              {activeNav === "large-data" && "Large Dataset Pipeline / Virtualized Stream"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Production Node #1</div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">100% Unlimited Quota</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-600 dark:text-cyan-400">
              AI
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* WORKSPACE VIEW ROUTER */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-100/70 dark:bg-gradient-to-b dark:from-[#090c13] dark:to-[#07090e]">
          {activeNav === "audio" && <AudioStudio />}
          {activeNav === "video" && <VideoStudio />}
          {activeNav === "history" && <HistoryTab />}
          {activeNav === "large-data" && <HeavyList />}
        </main>
      </div>
    </div>
  );
}
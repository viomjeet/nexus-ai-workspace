"use client";

import React, { useState } from "react";
import AudioStudio from "./components/AudioStudio";
import VideoStudio from "./components/VideoStudio";
import { NavItemList } from "./api/dist/static-api";
import HeavyList from "./HeavyList";
import ThemeToggle from "./components/ThemeToggle";
import ImageGenerator from "./components/ImageGenerator";

export default function StudioApp() {
  const [activeNav, setActiveNav] = useState<any>("large-data");
  const [navItems] = useState<any[]>(NavItemList);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavSelect = (itemId: string) => {
    setActiveNav(itemId);
    // Auto-close overlay drawer on mobile screens only
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const navMenuClass = (activeNav: string, type: string) => {
    const selectedNav =
      activeNav === type
        ? "bg-cyan-50 text-cyan-700 font-semibold dark:bg-slate-800/60 dark:text-cyan-400 shadow-xs"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/30";
    return `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${selectedNav}`;
  };

  return (
    <div className="flex h-[100dvh] w-screen max-w-full overflow-hidden bg-slate-100 text-slate-900 dark:bg-[#07090e] dark:text-[#f0f4fc] font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. SIDEBAR (Collapsible Drawer on Mobile, Collapsible Panel on Tablet & Desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full bg-white dark:bg-[#0b0e17] flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out md:static overflow-hidden ${
          sidebarOpen
            ? "w-72 max-w-[85vw] translate-x-0 shadow-2xl border-r border-slate-200 dark:border-[#171d2b] md:w-64 md:translate-x-0 md:shadow-none md:opacity-100 pointer-events-auto"
            : "-translate-x-full w-72 max-w-[85vw] md:translate-x-0 md:w-0 md:border-r-0 md:opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-72 md:w-64 h-full flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="flex flex-col min-h-0 flex-1">
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-5 md:px-6 border-b border-slate-200 dark:border-[#171d2b] shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20 shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
                    NEXUS STUDIO
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400 block -mt-0.5">
                    Enterprise AI Suite
                  </span>
                </div>
              </div>

              {/* Close / Collapse Button (Active on ALL screen sizes when sidebar is open) */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 -mr-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Items (Scrollable) */}
            <nav className="p-3 space-y-1 overflow-y-auto flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-2">
                Workspaces
              </div>

              <div className="space-y-1">
                {navItems.map((item, index) => {
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
                      onClick={() => handleNavSelect(item.id)}
                      className={navMenuClass(activeNav, item.id)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`${item.iconSize} shrink-0`}>{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${item.badge.className}`}
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

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-[#171d2b] space-y-2 shrink-0 bg-white dark:bg-[#0b0e17]">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Session Status</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                Live Online
              </span>
            </div>

            <div className="hidden grid grid-cols-2 gap-2 pt-1">
              <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#141a27] dark:hover:bg-[#1c2438] dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#232d43] transition cursor-pointer">
                Log In
              </button>
              <button className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer">
                Register
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-[#171d2b] bg-white dark:bg-[#0a0d15] flex items-center justify-between px-3.5 sm:px-6 md:px-8 shrink-0 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Hamburger / Sidebar Toggle Button (on ALL screen sizes: mobile, tablet, desktop) */}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className={`p-2 -ml-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                sidebarOpen
                  ? "bg-slate-100 text-cyan-600 dark:bg-slate-800 dark:text-cyan-400"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              }`}
              aria-label={sidebarOpen ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {activeNav === "audio" && "Voiceover Studio / Console"}
              {activeNav === "video" && "AI Video Generation / Motion Deck"}
              {activeNav === "image" && "Neural Image Studio"}
              {activeNav === "large-data" && "Data Pipeline / Virtual Stream"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">Production Node #1</div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">100% Unlimited Quota</div>
            </div>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] sm:text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
              AI
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* WORKSPACE VIEW ROUTER */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-8 bg-slate-100/70 dark:bg-gradient-to-b dark:from-[#090c13] dark:to-[#07090e] min-w-0">
          {activeNav === "audio" && <AudioStudio />}
          {activeNav === "video" && <VideoStudio />}
          {activeNav === "image" && <ImageGenerator />}
          {activeNav === "large-data" && <HeavyList />}
        </main>

        {/* 3. MOBILE BOTTOM NAVIGATION BAR (< 768px) */}
        <nav className="md:hidden shrink-0 h-14 bg-white/95 dark:bg-[#0b0e17]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#171d2b] flex items-center justify-around px-2 z-30">
          {[
            { id: "large-data", label: "Data", icon: "⚡" },
            { id: "audio", label: "Audio", icon: "🎙️" },
            { id: "video", label: "Video", icon: "🎬" },
            { id: "image", label: "Image", icon: "🎨" },
          ].map((tab) => {
            const isActive = activeNav === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveNav(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
                  isActive
                    ? "text-cyan-600 dark:text-cyan-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span className="text-[10px] mt-1 font-mono tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

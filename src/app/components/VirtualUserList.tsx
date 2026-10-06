"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export default function VirtualUserList({ users }: { users: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 6,
  });

  const parentDivStyle = (virtualizer: any) => ({
    height: `${virtualizer.getTotalSize()}px`,
    width: "100%",
    position: "relative" as const,
  });

  const childDivStyle = (virtualRow: any) => ({
    height: `${virtualRow.size}px`,
    transform: `translateY(${virtualRow.start}px)`,
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
  });

  const lavelClass = (isAdmin: boolean) => {
    isAdmin
      ? "bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-400 dark:border-cyan-800/40"
      : "bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800/40"
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-400px)] overflow-y-auto will-change-transform divide-y divide-slate-100 dark:divide-[#171d2b]"
    >
      <div style={parentDivStyle(rowVirtualizer)}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const user = users[virtualRow.index];
          const isAdmin = user.role === "Admin";
          const initial = user.name?.charAt(0) || "U";

          return (
            <div
              key={user.id}
              style={childDivStyle(virtualRow)}
              className="grid grid-cols-12 items-center px-6 py-2.5 bg-white hover:bg-slate-50 dark:bg-[#0b0f19] dark:hover:bg-[#121826] transition-colors border-b border-slate-100 dark:border-[#171d2b]"
            >
              <div className="col-span-8 sm:col-span-9 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-cyan-600 dark:bg-[#141a27] dark:text-cyan-400 text-xs font-mono font-bold flex items-center justify-center border border-slate-200 dark:border-[#232d43] shrink-0">
                  {initial}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="col-span-4 sm:col-span-3 flex justify-end">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${lavelClass(isAdmin)}`}>
                  {user.role}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
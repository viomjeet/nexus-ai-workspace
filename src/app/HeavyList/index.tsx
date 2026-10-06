"use client";

import { useState, useMemo } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import VirtualUserList from "../components/VirtualUserList";

const fetchUsers = async () => {
  const res = await fetch("/api/large-data");
  if (!res.ok) throw new Error("Failed to load records from server");
  return res.json();
};

function UsersContent() {
  const { data: users = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const filteredUsers = useMemo(() => {
    return users.filter((user: any) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
      const matchesRole = selectedRole === "All" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-[#1d2537] rounded-sm p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
        <div className="space-y-6">

          {/* 1. Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1d2537] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  User Directory Pipeline
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  Live Data
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                High-performance virtualized dataset with instant scrolling
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-50 dark:bg-[#070a12] px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#1d2537] text-xs font-mono text-slate-500 dark:text-slate-400">
                Showing: <span className="font-bold text-cyan-600 dark:text-cyan-400">{filteredUsers.length.toLocaleString()}</span> / {users.length.toLocaleString()}
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-95 rounded-lg shadow-md shadow-cyan-900/20 transition disabled:opacity-50 cursor-pointer"
              >
                {isFetching ? "Syncing..." : "Refresh Records"}
              </button>
            </div>
          </div>

          {/* 2. Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search dataset by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2.5 text-xs font-mono bg-slate-50 dark:bg-[#070a12] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#1d2537] rounded-lg focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              {/* Search Icon */}
              <svg
                className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {/* Clear Button */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-cyan-600 dark:text-slate-500 dark:hover:text-cyan-400 font-mono"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Role Filter Dropdown */}
            <div className="w-full sm:w-48">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full py-2.5 px-3 text-xs font-mono bg-slate-50 dark:bg-[#070a12] border border-slate-200 dark:border-[#1d2537] rounded-lg focus:outline-none focus:border-cyan-500 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="All">All Roles (Global)</option>
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>

          {/* 3. Content Section */}
          {isLoading ? (
            <div className="border border-slate-200 dark:border-[#1d2537] rounded-sm p-6 bg-slate-50/40 dark:bg-[#070a12]/40 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-200 dark:bg-[#141b2b]/60 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40 rounded-sm p-5 text-xs text-rose-600 dark:text-rose-400 font-mono">
              <span className="font-bold">[ERROR]:</span> {(error as Error).message}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="border border-slate-200 dark:border-[#1d2537] rounded-sm p-12 text-center bg-slate-50/30 dark:bg-[#070a12]/30">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No records found</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">Try adjusting your search criteria or role filters.</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-[#1d2537] rounded-sm overflow-hidden bg-white dark:bg-[#070a12]">
              {/* Table Header Row */}
              <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 dark:bg-[#0a0e18] border-b border-slate-200 dark:border-[#1d2537] text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                <span className="col-span-8 sm:col-span-9">Identity & Contact Info</span>
                <span className="col-span-4 sm:col-span-3 text-right">Access Level</span>
              </div>

              {/* Virtualized Body */}
              <VirtualUserList users={filteredUsers} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function HeavyList() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <UsersContent />
    </QueryClientProvider>
  );
}
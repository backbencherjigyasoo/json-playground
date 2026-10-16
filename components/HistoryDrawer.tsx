"use client";

import React, { useState, useRef } from "react";
import {
  X,
  History,
  Trash2,
  Download,
  Upload,
  Search,
  Star,
  ExternalLink,
  Clock,
  HardDrive,
  FileJson,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { HistoryItem } from "@/types";
import { formatBytes } from "@/lib/jsonQuery";

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export const HistoryDrawer: React.FC = () => {
  const {
    isHistoryOpen,
    setHistoryOpen,
    history,
    loadHistoryItem,
    deleteHistoryItem,
    toggleStarHistory,
    clearHistory,
    exportHistory,
    importHistory,
  } = useStore();

  const [filterQuery, setFilterQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isHistoryOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      item.request.url.toLowerCase().includes(q) ||
      item.request.method.toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    const dataStr = exportHistory();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `api-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importHistory(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => setHistoryOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Request History</h2>
              <span className="text-xs px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
                {history.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleExport}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                title="Export history as JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                title="Import history from JSON"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your request history?")) {
                      clearHistory();
                    }
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                  title="Clear all history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setHistoryOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Filter */}
          <div className="p-3 border-b border-zinc-800/60 bg-zinc-950/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter by URL or method..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 space-y-2">
                <FileJson className="w-8 h-8 mx-auto text-zinc-700" />
                <p className="text-xs">No matching requests found</p>
                <p className="text-[11px] text-zinc-600">
                  Every request you send will be stored here locally.
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const status = item.responseSummary?.status;
                const isError = item.responseSummary?.isError;

                return (
                  <div
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 transition-all cursor-pointer group flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            item.request.method === "GET"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : item.request.method === "POST"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          }`}
                        >
                          {item.request.method}
                        </span>
                        <span className="text-xs font-mono text-zinc-300 truncate">
                          {item.request.url}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarHistory(item.id);
                          }}
                          className={`p-1 rounded hover:bg-zinc-700 ${
                            item.isStarred ? "text-amber-400" : "text-zinc-600 hover:text-zinc-400"
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(item.id);
                          }}
                          className="p-1 rounded text-zinc-600 hover:text-rose-400 hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/40">
                      <div className="flex items-center gap-2">
                        {status ? (
                          <span
                            className={`font-mono text-[10px] ${
                              isError ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {status}
                          </span>
                        ) : null}
                        {item.responseSummary?.timeMs ? (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.responseSummary.timeMs}ms
                          </span>
                        ) : null}
                      </div>
                      <span>{formatRelativeTime(item.timestamp)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import {
  Zap,
  History,
  Bookmark,
  Sun,
  Moon,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Command,
  Send,
  Server,
} from "lucide-react";
import { useStore, API_PRESETS } from "@/store/useStore";

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    history,
    collections,
    mocks,
    setHistoryOpen,
    setSaveModalOpen,
    setMockModalOpen,
    useProxy,
    setUseProxy,
    loadPreset,
    sendRequest,
    isLoading,
  } = useStore();

  const [presetsOpen, setPresetsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md px-4 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-white dark:bg-zinc-950">
                <Zap className="h-4 w-4 text-emerald-500 dark:text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">API Lens</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Playground
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 -mt-0.5 hidden sm:block">
                In-Browser HTTP Client & JSON Explorer
              </p>
            </div>
          </div>

          {/* Quick Presets Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setPresetsOpen(!presetsOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm"
              title="Quick test APIs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden md:inline">API Presets</span>
              <span className="md:hidden">Presets</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {presetsOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setPresetsOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-72 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl py-1.5 z-30 divide-y divide-zinc-100 dark:divide-zinc-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Quick Sample APIs
                  </div>
                  <div className="py-1">
                    {API_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          loadPreset(preset);
                          setPresetsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors flex flex-col gap-0.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            {preset.method}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate w-full">
                          {preset.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mock Server Button */}
          <button
            onClick={() => setMockModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 rounded-md border border-emerald-200 dark:border-emerald-800/60 transition-all shadow-sm"
            title="Create & simulate mock API endpoints"
          >
            <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Mock Server</span>
            <span className="sm:hidden">Mocks</span>
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1 text-[10px] font-mono">
              {mocks.length}
            </span>
          </button>
        </div>

        {/* Center / Mode indicator */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Proxy Mode Toggle */}
          <button
            onClick={() => setUseProxy(!useProxy)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all border ${
              useProxy
                ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700/60 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
            title={
              useProxy
                ? "CORS Proxy: Requests routed through Next.js server to bypass CORS blocks"
                : "Direct Browser: Requests dispatched straight from browser fetch"
            }
          >
            {useProxy ? (
              <ShieldCheck className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            )}
            <span className="font-medium text-[11px]">
              {useProxy ? "CORS Proxy: Active" : "Direct Fetch"}
            </span>
          </button>

          {/* Shortcut hint */}
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400">
            <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-mono text-[10px]">
              ⌘/Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-mono text-[10px]">
              ↵
            </kbd>
            <span className="text-zinc-400 ml-0.5">Send</span>
          </div>
        </div>

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors"
            title="Request History"
          >
            <History className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white">
                {history.length}
              </span>
            )}
          </button>

          {/* Collections / Saved */}
          <button
            onClick={() => setSaveModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors"
            title="Saved Collections"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline">Saved</span>
            {collections.length > 0 && (
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden md:inline">
                ({collections.reduce((acc, c) => acc + c.requests.length, 0)})
              </span>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-800/80 transition-colors"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Primary Quick Send button */}
          <button
            onClick={() => sendRequest()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            <Send className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Sending..." : "Send"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};


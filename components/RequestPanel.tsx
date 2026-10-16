"use client";

import React, { useState } from "react";
import {
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sliders,
  Shield,
  Key,
  Layers,
  Sparkles,
  BookmarkPlus,
  RotateCcw,
} from "lucide-react";
import { HttpMethod } from "@/types";
import { useStore } from "@/store/useStore";
import { validateJson, formatJson, minifyJson } from "@/lib/jsonQuery";

const METHOD_COLORS: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  GET: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  POST: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  PUT: { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/30" },
  PATCH: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/30" },
  DELETE: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30" },
  HEAD: { bg: "bg-zinc-500/15", text: "text-zinc-400", border: "border-zinc-500/30" },
  OPTIONS: { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30" },
};

const COMMON_HEADERS = [
  "Content-Type",
  "Authorization",
  "Accept",
  "Cache-Control",
  "User-Agent",
  "X-Api-Key",
];

export const RequestPanel: React.FC = () => {
  const {
    method,
    setMethod,
    url,
    setUrl,
    queryParams,
    addQueryParam,
    updateQueryParam,
    removeQueryParam,
    headers,
    addHeader,
    updateHeader,
    removeHeader,
    bodyType,
    setBodyType,
    bodyContent,
    setBodyContent,
    auth,
    setAuth,
    useProxy,
    setUseProxy,
    requestTab,
    setRequestTab,
    sendRequest,
    isLoading,
    setSaveModalOpen,
  } = useStore();

  const [headerSuggestions, setHeaderSuggestions] = useState<string[]>([]);
  const [activeHeaderId, setActiveHeaderId] = useState<string | null>(null);

  // Validate active body content
  const jsonValidation = validateJson(bodyContent);

  const handleBeautifyJson = () => {
    setBodyContent(formatJson(bodyContent));
  };

  const handleMinifyJson = () => {
    setBodyContent(minifyJson(bodyContent));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      sendRequest();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Top Address & Action Bar */}
      <div className="p-3 bg-zinc-900/60 border-b border-zinc-800/80 flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1 items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1 focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all">
          {/* Method Dropdown */}
          <div className="relative">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className={`appearance-none font-mono text-xs font-bold px-2.5 py-1.5 rounded-md border cursor-pointer focus:outline-none transition-colors ${
                METHOD_COLORS[method].bg
              } ${METHOD_COLORS[method].text} ${METHOD_COLORS[method].border}`}
            >
              <option value="GET" className="bg-zinc-900 text-emerald-400">GET</option>
              <option value="POST" className="bg-zinc-900 text-amber-400">POST</option>
              <option value="PUT" className="bg-zinc-900 text-sky-400">PUT</option>
              <option value="PATCH" className="bg-zinc-900 text-violet-400">PATCH</option>
              <option value="DELETE" className="bg-zinc-900 text-rose-400">DELETE</option>
              <option value="HEAD" className="bg-zinc-900 text-zinc-400">HEAD</option>
              <option value="OPTIONS" className="bg-zinc-900 text-indigo-400">OPTIONS</option>
            </select>
          </div>

          {/* URL Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter request URL (e.g. https://api.github.com/users/octocat)"
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />

          {url && (
            <button
              onClick={() => setUrl("")}
              className="text-zinc-500 hover:text-zinc-300 p-1 text-xs"
              title="Clear URL"
            >
              ✕
            </button>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSaveModalOpen(true)}
            className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Save request to collection"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={() => sendRequest()}
            disabled={isLoading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
          >
            <Send className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Sending..." : "Send"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/40 px-3">
        <div className="flex items-center gap-1 overflow-x-auto py-1.5 text-xs font-medium">
          <button
            onClick={() => setRequestTab("params")}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              requestTab === "params"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <span>Params</span>
            {queryParams.filter((p) => p.enabled && p.key.trim()).length > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center">
                {queryParams.filter((p) => p.enabled && p.key.trim()).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setRequestTab("headers")}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              requestTab === "headers"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <span>Headers</span>
            {headers.filter((h) => h.enabled && h.key.trim()).length > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] flex items-center justify-center">
                {headers.filter((h) => h.enabled && h.key.trim()).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setRequestTab("body")}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              requestTab === "body"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <span>Body</span>
            {["POST", "PUT", "PATCH"].includes(method) && bodyContent.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setRequestTab("auth")}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              requestTab === "auth"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <Key className="w-3 h-3 text-zinc-400" />
            <span>Auth</span>
            {auth.type !== "none" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </button>

          <button
            onClick={() => setRequestTab("settings")}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              requestTab === "settings"
                ? "bg-zinc-800 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
            }`}
          >
            <Sliders className="w-3 h-3 text-zinc-400" />
            <span>Settings</span>
          </button>
        </div>

        {useProxy && (
          <span className="text-[11px] font-medium text-violet-400 bg-violet-950/60 border border-violet-800/50 px-2 py-0.5 rounded-full hidden md:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Proxy Active
          </span>
        )}
      </div>

      {/* Tab Contents Area */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* PARAMS TAB */}
        {requestTab === "params" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-800/60">
              <span className="font-semibold text-zinc-300">Query Parameters</span>
              <button
                onClick={addQueryParam}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3 h-3" /> Add Param
              </button>
            </div>

            <div className="divide-y divide-zinc-800/40">
              {queryParams.map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-1.5 group">
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={(e) => updateQueryParam(p.id, "enabled", e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={p.key}
                    onChange={(e) => updateQueryParam(p.id, "key", e.target.value)}
                    placeholder="Key (e.g. limit)"
                    className="flex-1 bg-zinc-900/70 border border-zinc-800/80 rounded px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                  <input
                    type="text"
                    value={p.value}
                    onChange={(e) => updateQueryParam(p.id, "value", e.target.value)}
                    placeholder="Value (e.g. 10)"
                    className="flex-1 bg-zinc-900/70 border border-zinc-800/80 rounded px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                  <button
                    onClick={() => removeQueryParam(p.id)}
                    className="text-zinc-600 hover:text-rose-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove parameter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HEADERS TAB */}
        {requestTab === "headers" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-800/60">
              <span className="font-semibold text-zinc-300">Request Headers</span>
              <button
                onClick={addHeader}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3 h-3" /> Add Header
              </button>
            </div>

            <div className="divide-y divide-zinc-800/40">
              {headers.map((h) => (
                <div key={h.id} className="relative flex items-center gap-2 py-1.5 group">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => updateHeader(h.id, "enabled", e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer"
                  />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={h.key}
                      onFocus={() => setActiveHeaderId(h.id)}
                      onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                      placeholder="Header Name"
                      className="w-full bg-zinc-900/70 border border-zinc-800/80 rounded px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                    {activeHeaderId === h.id && !h.key && (
                      <div className="absolute left-0 top-full mt-1 z-20 w-48 bg-zinc-900 border border-zinc-700 rounded shadow-xl py-1 text-xs">
                        <div className="px-2 py-0.5 text-[10px] text-zinc-500 uppercase">Common Headers</div>
                        {COMMON_HEADERS.map((common) => (
                          <button
                            key={common}
                            onMouseDown={() => {
                              updateHeader(h.id, "key", common);
                              setActiveHeaderId(null);
                            }}
                            className="w-full text-left px-2 py-1 hover:bg-zinc-800 text-zinc-300 text-xs"
                          >
                            {common}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                    placeholder="Header Value"
                    className="flex-1 bg-zinc-900/70 border border-zinc-800/80 rounded px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                  <button
                    onClick={() => removeHeader(h.id)}
                    className="text-zinc-600 hover:text-rose-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove header"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BODY TAB */}
        {requestTab === "body" && (
          <div className="space-y-2 h-full flex flex-col">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-300">Payload Format:</span>
                <span className="px-2 py-0.5 bg-zinc-800 rounded text-[11px] font-mono text-amber-300">
                  application/json
                </span>
              </div>

              {/* Validation Status Indicator */}
              <div className="flex items-center gap-1.5">
                {bodyContent.trim() ? (
                  jsonValidation.isValid ? (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Valid JSON
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20" title={jsonValidation.error}>
                      <AlertCircle className="w-3 h-3" /> Syntax Error
                      {jsonValidation.line && ` (Line ${jsonValidation.line})`}
                    </span>
                  )
                ) : (
                  <span className="text-[11px] text-zinc-500">Empty Body</span>
                )}
              </div>
            </div>

            {/* JSON Quick Actions Toolbar */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleBeautifyJson}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded border border-zinc-800 flex items-center gap-1 text-[11px] transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Prettify
              </button>
              <button
                onClick={handleMinifyJson}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded border border-zinc-800 text-[11px] transition-colors"
              >
                Minify
              </button>
              <button
                onClick={() => setBodyContent("")}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 rounded border border-zinc-800 text-[11px] ml-auto transition-colors"
              >
                Clear
              </button>
            </div>

            {/* JSON Code Textarea */}
            <div className="relative flex-1 min-h-[220px]">
              <textarea
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='{\n  "key": "value"\n}'
                className="w-full h-full min-h-[220px] bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-3 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-y"
              />
            </div>
            {!jsonValidation.isValid && jsonValidation.error && (
              <p className="text-[11px] text-rose-400 font-mono bg-rose-950/30 p-2 rounded border border-rose-800/40">
                {jsonValidation.error}
              </p>
            )}
          </div>
        )}

        {/* AUTH TAB */}
        {requestTab === "auth" && (
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Authorization Type
              </label>
              <select
                value={auth.type}
                onChange={(e) => setAuth({ type: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>

            {auth.type === "bearer" && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Bearer Token
                </label>
                <input
                  type="password"
                  value={auth.token || ""}
                  onChange={(e) => setAuth({ token: e.target.value })}
                  placeholder="Paste JWT or API token..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none"
                />
                <p className="text-[11px] text-zinc-500">
                  Automatically adds header:{" "}
                  <code className="text-zinc-400">Authorization: Bearer &lt;token&gt;</code>
                </p>
              </div>
            )}

            {auth.type === "basic" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={auth.username || ""}
                    onChange={(e) => setAuth({ username: e.target.value })}
                    placeholder="Username"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={auth.password || ""}
                    onChange={(e) => setAuth({ password: e.target.value })}
                    placeholder="Password"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Automatically Base64-encodes credentials into{" "}
                  <code className="text-zinc-400">Authorization: Basic &lt;base64&gt;</code>
                </p>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {requestTab === "settings" && (
          <div className="space-y-4 max-w-lg">
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Next.js Server Proxy (Bypass CORS)</h4>
                  <p className="text-[11px] text-zinc-400">
                    Route requests through this Next.js server route to bypass browser CORS restrictions.
                  </p>
                </div>
                <button
                  onClick={() => setUseProxy(!useProxy)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    useProxy ? "bg-violet-600" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      useProxy ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-2">
                <strong>Why CORS matters:</strong> Browsers block web pages from fetching APIs that lack `Access-Control-Allow-Origin`. Our built-in `/api/proxy` executes the request from Node/Vercel server-side where CORS does not apply.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs space-y-1.5">
              <h4 className="font-semibold text-zinc-200">Timeout & Networking</h4>
              <p className="text-[11px] text-zinc-400">
                Direct browser requests use default fetch timeouts. Proxy requests have a strict 30-second abort safeguard.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

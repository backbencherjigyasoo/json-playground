"use client";

import React, { useState } from "react";
import {
  X,
  Server,
  Plus,
  Play,
  Copy,
  Check,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { MockEndpoint, HttpMethod } from "@/types";
import { copyToClipboard, validateJson, formatJson } from "@/lib/jsonQuery";

const STATUS_OPTIONS = [
  { code: 200, label: "200 OK", type: "success" },
  { code: 201, label: "201 Created", type: "success" },
  { code: 400, label: "400 Bad Request", type: "error" },
  { code: 401, label: "401 Unauthorized", type: "error" },
  { code: 403, label: "403 Forbidden", type: "error" },
  { code: 404, label: "404 Not Found", type: "error" },
  { code: 500, label: "500 Internal Server Error", type: "error" },
  { code: 502, label: "502 Bad Gateway", type: "error" },
];

const DELAY_PRESETS = [
  { ms: 0, label: "0ms (Instant)" },
  { ms: 300, label: "300ms (Fast)" },
  { ms: 800, label: "800ms (Realistic)" },
  { ms: 1500, label: "1.5s (Slow UI Test)" },
  { ms: 3000, label: "3s (Heavy Load)" },
];

export const MockServerModal: React.FC = () => {
  const {
    isMockModalOpen,
    setMockModalOpen,
    mocks,
    addMock,
    updateMock,
    deleteMock,
    toggleMock,
    testMockInPlayground,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [path, setPath] = useState("");
  const [statusCode, setStatusCode] = useState<number>(200);
  const [delayMs, setDelayMs] = useState<number>(300);
  const [responseBody, setResponseBody] = useState('{\n  "message": "Hello from mock API",\n  "status": "success"\n}');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isMockModalOpen) return null;

  const jsonValidation = validateJson(responseBody);

  const handleEditClick = (mock: MockEndpoint) => {
    setEditingId(mock.id);
    setName(mock.name);
    setMethod(mock.method);
    setPath(mock.path);
    setStatusCode(mock.statusCode);
    setDelayMs(mock.delayMs);
    setResponseBody(mock.responseBody);
    setActiveTab("create");
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName("");
    setMethod("GET");
    setPath("");
    setStatusCode(200);
    setDelayMs(300);
    setResponseBody('{\n  "message": "Hello from mock API",\n  "status": "success"\n}');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;

    const cleanPath = path.trim().replace(/^\/+/, "");

    if (editingId) {
      updateMock(editingId, {
        name: name.trim(),
        method,
        path: cleanPath,
        statusCode,
        delayMs,
        responseBody,
      });
    } else {
      addMock({
        name: name.trim(),
        method,
        path: cleanPath,
        statusCode,
        delayMs,
        responseBody,
        headers: [{ id: "h1", key: "Content-Type", value: "application/json", enabled: true }],
        enabled: true,
      });
    }

    handleResetForm();
    setActiveTab("list");
  };

  const handleCopyUrl = async (mock: MockEndpoint) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const fullMockUrl = `${origin}/api/mock/${mock.path.replace(/^\/+/, "")}`;
    await copyToClipboard(fullMockUrl);
    setCopiedId(mock.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">API Mock Server</h3>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Engine
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Simulate endpoints with custom HTTP status codes, latency delays & live URLs.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setMockModalOpen(false);
              handleResetForm();
            }}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/40 px-4 pt-2 text-xs font-medium">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab("list");
                handleResetForm();
              }}
              className={`pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "list"
                  ? "border-emerald-400 text-white font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Configured Mocks</span>
              <span className="h-4 min-w-4 px-1 rounded-full bg-zinc-800 text-[10px] flex items-center justify-center">
                {mocks.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`pb-2 border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === "create"
                  ? "border-emerald-400 text-white font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? "Edit Mock" : "New Mock Endpoint"}</span>
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 hidden sm:block">
            Base: <code className="text-zinc-400 font-mono">/api/mock/[path]</code>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {activeTab === "list" ? (
            <div className="space-y-3">
              {mocks.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 space-y-3">
                  <Server className="w-10 h-10 mx-auto text-zinc-700" />
                  <p className="text-sm text-zinc-300 font-medium">No mock endpoints configured</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Create mock endpoints to simulate APIs before backend is ready, or test error handling.
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                  >
                    Create Your First Mock
                  </button>
                </div>
              ) : (
                mocks.map((mock) => {
                  const isCopied = copiedId === mock.id;
                  const isSuccess = mock.statusCode < 400;

                  return (
                    <div
                      key={mock.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                        mock.enabled
                          ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                          : "bg-zinc-950/40 border-zinc-900 opacity-60"
                      }`}
                    >
                      {/* Top Row: Method, Path, Name, Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Toggle active switch */}
                          <button
                            onClick={() => toggleMock(mock.id)}
                            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              mock.enabled ? "bg-emerald-500" : "bg-zinc-700"
                            }`}
                            title={mock.enabled ? "Disable mock" : "Enable mock"}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                mock.enabled ? "translate-x-3" : "translate-x-0"
                              }`}
                            />
                          </button>

                          {/* Method pill */}
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                              mock.method === "GET"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : mock.method === "POST"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-sky-500/15 text-sky-400 border-sky-500/30"
                            }`}
                          >
                            {mock.method}
                          </span>

                          {/* Route Path */}
                          <span className="font-mono text-xs font-semibold text-zinc-200">
                            /api/mock/{mock.path.replace(/^\/+/, "")}
                          </span>

                          <span className="text-zinc-500 text-xs hidden md:inline">•</span>
                          <span className="text-xs text-zinc-400 hidden md:inline truncate max-w-[180px]">
                            {mock.name}
                          </span>
                        </div>

                        {/* Badges & Actions */}
                        <div className="flex items-center gap-1.5">
                          {/* Status code pill */}
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                              isSuccess
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {mock.statusCode}
                          </span>

                          {/* Latency pill */}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {mock.delayMs}ms
                          </span>

                          {/* Test in Playground */}
                          <button
                            onClick={() => testMockInPlayground(mock)}
                            className="px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all"
                            title="Load and hit this endpoint in API Lens"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Test</span>
                          </button>

                          {/* Copy live URL */}
                          <button
                            onClick={() => handleCopyUrl(mock)}
                            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded transition-colors"
                            title="Copy external live URL"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEditClick(mock)}
                            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded transition-colors"
                            title="Edit mock endpoint"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteMock(mock.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 bg-zinc-800/80 hover:bg-zinc-700 rounded transition-colors"
                            title="Delete mock"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Snippet preview */}
                      <div className="bg-zinc-950/80 rounded-lg p-2 font-mono text-[11px] text-zinc-400 border border-zinc-800/60 overflow-hidden line-clamp-2">
                        {mock.responseBody}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* CREATE / EDIT FORM */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-zinc-300 font-semibold">Mock Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. User Profile, Checkout Failure"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-zinc-300 font-semibold">HTTP Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as HttpMethod)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>

              {/* Endpoint Path */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-semibold">Route Path</label>
                <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden focus-within:border-emerald-500">
                  <span className="px-3 py-2 bg-zinc-800/60 text-zinc-400 font-mono text-xs border-r border-zinc-800 select-none">
                    /api/mock/
                  </span>
                  <input
                    type="text"
                    required
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="users, cart/checkout, auth/login"
                    className="flex-1 bg-transparent px-3 py-2 text-zinc-200 font-mono text-xs focus:outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Status Code & Latency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-zinc-300 font-semibold">HTTP Status Code</label>
                  <select
                    value={statusCode}
                    onChange={(e) => setStatusCode(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-zinc-300 font-semibold">Simulated Latency (Delay)</label>
                  <select
                    value={delayMs}
                    onChange={(e) => setDelayMs(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                  >
                    {DELAY_PRESETS.map((d) => (
                      <option key={d.ms} value={d.ms}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Response JSON Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-zinc-300 font-semibold">
                    Mock Response JSON Body
                  </label>
                  <div className="flex items-center gap-2">
                    {jsonValidation.isValid ? (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid JSON
                      </span>
                    ) : (
                      <span className="text-[11px] text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Syntax Error
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setResponseBody(formatJson(responseBody))}
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" /> Prettify
                    </button>
                  </div>
                </div>

                <textarea
                  rows={7}
                  value={responseBody}
                  onChange={(e) => setResponseBody(e.target.value)}
                  placeholder='{\n  "status": "success",\n  "data": []\n}'
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 resize-y"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    handleResetForm();
                    setActiveTab("list");
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                >
                  {editingId ? "Save Mock Changes" : "Create Mock Route"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

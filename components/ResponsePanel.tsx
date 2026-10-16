"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Download,
  Search,
  Maximize2,
  Minimize2,
  Clock,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Terminal,
  Sparkles,
  ArrowRight,
  Eye,
  Code2,
  ListOrdered,
  Layers,
} from "lucide-react";
import { useStore, API_PRESETS } from "@/store/useStore";
import { JsonTreeViewer } from "@/components/JsonTreeViewer";
import {
  formatBytes,
  copyToClipboard,
  downloadJsonFile,
  evaluateJsonPath,
  countMatches,
} from "@/lib/jsonQuery";

export const ResponsePanel: React.FC = () => {
  const {
    response,
    isLoading,
    responseTab,
    setResponseTab,
    queryFilter,
    setQueryFilter,
    treeExpandAll,
    setTreeExpandAll,
    retryWithProxy,
    loadPreset,
    sendRequest,
  } = useStore();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!response) return;
    const textToCopy =
      response.isJson && response.data
        ? JSON.stringify(response.data, null, 2)
        : response.rawBody || "";
    await copyToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!response) return;
    downloadJsonFile(
      response.data || response.rawBody,
      `api-response-${Date.now()}.json`
    );
  };

  // Evaluate JSONPath or dot query if user provided one
  const filteredData = useMemo(() => {
    if (!response || !response.isJson || !response.data) return null;
    if (!queryFilter.trim()) return response.data;

    // If query starts with $ or contains dots / brackets, try JSONPath evaluation first
    if (
      queryFilter.startsWith("$") ||
      queryFilter.includes(".") ||
      queryFilter.includes("[")
    ) {
      const evalResult = evaluateJsonPath(response.data, queryFilter);
      if (evalResult.result !== undefined) {
        return evalResult.result;
      }
    }

    // Default to original data (tree viewer highlights search term matches)
    return response.data;
  }, [response, queryFilter]);

  // Match counter
  const matchCount = useMemo(() => {
    if (!response || !response.data || !queryFilter.trim()) return 0;
    return countMatches(response.data, queryFilter);
  }, [response, queryFilter]);

  // Status badge color
  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return {
        bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
        label: `${status} OK`,
      };
    }
    if (status >= 300 && status < 400) {
      return {
        bg: "bg-sky-500/15 border-sky-500/30 text-sky-400",
        label: `${status} Redirect`,
      };
    }
    if (status >= 400 && status < 500) {
      return {
        bg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
        label: `${status} Client Error`,
      };
    }
    if (status >= 500) {
      return {
        bg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
        label: `${status} Server Error`,
      };
    }
    return {
      bg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      label: "Request Failed",
    };
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors">
      {/* Response Header / Status Bar */}
      <div className="p-3 bg-zinc-50/90 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Response</span>

          {response && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                getStatusBadge(response.status).bg
              }`}
            >
              {response.status ? `${response.status} ${response.statusText}` : "Failed"}
            </span>
          )}

          {response && (
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 ml-2">
              <span className="flex items-center gap-1 font-mono" title="Response latency">
                <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                {response.timeMs} ms
              </span>
              <span className="flex items-center gap-1 font-mono" title="Response payload size">
                <HardDrive className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                {formatBytes(response.sizeBytes)}
              </span>
              {response.isProxy && (
                <span className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/40 px-1.5 py-0.2 rounded">
                  <ShieldCheck className="w-3 h-3" /> Proxy
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Switcher & Actions */}
        {response && !response.error && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setResponseTab("tree")}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  responseTab === "tree"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title="Interactive collapsible tree"
              >
                <Layers className="w-3 h-3" />
                <span>Tree</span>
              </button>
              <button
                onClick={() => setResponseTab("raw")}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  responseTab === "raw"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title="Formatted raw JSON"
              >
                <Code2 className="w-3 h-3" />
                <span>Raw</span>
              </button>
              <button
                onClick={() => setResponseTab("headers")}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  responseTab === "headers"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title="Response headers table"
              >
                <ListOrdered className="w-3 h-3" />
                <span>Headers</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center gap-1 transition-colors"
              title="Copy response body"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors"
              title="Download as JSON file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Query / Search Bar (When JSON response is present) */}
      {response && response.isJson && !response.error && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800/60 text-xs">
          <div className="relative flex-1 flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={queryFilter}
              onChange={(e) => setQueryFilter(e.target.value)}
              placeholder="Search keys/values or query path (e.g. $.posts[0].title or product.price)"
              className="w-full bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-md pl-8 pr-8 py-1 text-xs font-mono text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
            {queryFilter && (
              <button
                onClick={() => setQueryFilter("")}
                className="absolute right-2.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {queryFilter.trim() && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-zinc-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-zinc-700">
              {matchCount} {matchCount === 1 ? "match" : "matches"}
            </span>
          )}

          {responseTab === "tree" && (
            <button
              onClick={() => setTreeExpandAll(!treeExpandAll)}
              className="px-2 py-1 text-[11px] text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded flex items-center gap-1 transition-colors"
              title={treeExpandAll ? "Collapse all nodes" : "Expand all nodes"}
            >
              {treeExpandAll ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Collapse</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Expand</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <RotateCw className="w-4 h-4 text-emerald-500 dark:text-emerald-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">Fetching API response...</p>
          </div>
        )}

        {/* Error State */}
        {response?.error ? (
          <div className="p-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto h-full space-y-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-full border border-rose-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                {response.statusText || "Request Failed"}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-mono bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-left">
                {response.error}
              </p>
            </div>

            {/* Smart CORS Suggestion */}
            {response.errorCategory === "cors" && (
              <div className="p-3 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 rounded-lg text-left space-y-2 w-full">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                  <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Bypass with Next.js Server Proxy
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  The target API rejected the browser&apos;s origin header (CORS). We can dispatch this request through our Next.js backend proxy where origin restrictions do not apply.
                </p>
                <button
                  onClick={retryWithProxy}
                  className="w-full mt-1 px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-md shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Retry with Server Proxy
                </button>
              </div>
            )}
          </div>
        ) : !response ? (
          /* Empty / Welcome State */
          <div className="p-8 h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Terminal className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
              </div>
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 absolute -top-1 -right-1 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Ready to test & explore APIs
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Send a request or pick one of these sample endpoints to inspect real-time JSON:
              </p>
            </div>

            <div className="w-full space-y-1.5 text-left">
              {API_PRESETS.slice(0, 3).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    loadPreset(preset);
                    setTimeout(() => sendRequest(), 100);
                  }}
                  className="w-full p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800/80 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {preset.method}
                    </span>
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                      {preset.name}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 dark:text-zinc-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>

            <div className="text-[11px] text-zinc-500 flex items-center gap-2">
              <span>Tip: Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
                ⌘ / Ctrl + Enter
              </kbd>
              <span>to dispatch anytime</span>
            </div>
          </div>
        ) : (
          /* Response Display Views */
          <div>
            {/* TREE VIEW */}
            {responseTab === "tree" && (
              response.isJson ? (
                <JsonTreeViewer
                  data={filteredData}
                  searchTerm={queryFilter}
                  expandAll={treeExpandAll}
                />
              ) : (
                <div className="p-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  <div className="mb-2 p-2 bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 rounded">
                    Response is not valid JSON. Showing raw text below:
                  </div>
                  <pre className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded overflow-x-auto text-zinc-800 dark:text-zinc-300">
                    {response.rawBody}
                  </pre>
                </div>
              )
            )}

            {/* RAW JSON VIEW */}
            {responseTab === "raw" && (
              <div className="p-3 font-mono text-xs overflow-x-auto">
                <pre className="text-zinc-800 dark:text-zinc-300 selection:bg-indigo-500/30 selection:text-white">
                  {response.isJson
                    ? JSON.stringify(filteredData, null, 2)
                    : response.rawBody}
                </pre>
              </div>
            )}

            {/* HEADERS TABLE VIEW */}
            {responseTab === "headers" && (
              <div className="p-3">
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-100 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Header Name</th>
                        <th className="px-3 py-2 font-semibold">Value</th>
                        <th className="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 bg-white dark:bg-zinc-950/40">
                      {Object.entries(response.headers).map(([key, val]) => (
                        <tr key={key} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 group">
                          <td className="px-3 py-1.5 text-sky-600 dark:text-sky-300 font-medium whitespace-nowrap">
                            {key}
                          </td>
                          <td className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300 break-all">{val}</td>
                          <td className="px-3 py-1.5 text-right">
                            <button
                              onClick={() => copyToClipboard(val)}
                              className="text-zinc-400 hover:text-zinc-800 dark:text-zinc-600 dark:hover:text-white opacity-0 group-hover:opacity-100 p-1"
                              title="Copy header value"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

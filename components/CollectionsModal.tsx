"use client";

import React, { useState } from "react";
import {
  X,
  Bookmark,
  FolderPlus,
  Trash2,
  Play,
  Layers,
  Folder,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { RequestConfig } from "@/types";

export const CollectionsModal: React.FC = () => {
  const {
    isSaveModalOpen,
    setSaveModalOpen,
    collections,
    saveToCollection,
    deleteCollection,
    loadCollectionRequest,
    url,
    method,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"save" | "browse">("save");
  const [collectionName, setCollectionName] = useState("Favorites");
  const [requestName, setRequestName] = useState("");

  if (!isSaveModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionName.trim()) return;
    saveToCollection(collectionName.trim(), requestName.trim() || `${method} ${url}`);
    setRequestName("");
    setActiveTab("browse");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Collections & Saved Requests</h3>
          </div>
          <button
            onClick={() => setSaveModalOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 pt-2 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("save")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "save"
                ? "border-amber-500 text-amber-600 dark:text-white font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Save Current Request
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "browse"
                ? "border-amber-500 text-amber-600 dark:text-white font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Browse Saved ({collections.reduce((acc, c) => acc + c.requests.length, 0)})
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {activeTab === "save" ? (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 font-mono">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{method}</span>
                <span className="text-zinc-700 dark:text-zinc-300 truncate">{url}</span>
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium">Request Name</label>
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="e.g. Fetch Octocat Details"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium">Collection / Folder</label>
                <input
                  type="text"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g. Favorites, Auth APIs, E-Commerce"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
              >
                Save to Collection
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {collections.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No saved collections yet.
                </div>
              ) : (
                collections.map((col) => (
                  <div
                    key={col.id}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900/40"
                  >
                    <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900/80 flex items-center justify-between text-xs border-b border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                        <Folder className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>{col.name}</span>
                        <span className="text-[10px] text-zinc-500">
                          ({col.requests.length})
                        </span>
                      </div>
                      <button
                        onClick={() => deleteCollection(col.id)}
                        className="text-zinc-400 hover:text-rose-500 dark:text-zinc-600 dark:hover:text-rose-400 p-1"
                        title="Delete collection"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800/40">
                      {col.requests.map((req) => (
                        <div
                          key={req.id}
                          className="px-3 py-2 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/40 text-xs group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {req.method}
                            </span>
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                              {req.name}
                            </span>
                          </div>

                          <button
                            onClick={() => loadCollectionRequest(req)}
                            className="px-2 py-1 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] flex items-center gap-1 transition-colors shrink-0"
                          >
                            <Play className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                            Load
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

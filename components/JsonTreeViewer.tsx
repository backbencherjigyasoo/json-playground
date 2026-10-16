"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Copy, Check, Hash, Tag, Braces, Brackets } from "lucide-react";
import { copyToClipboard } from "@/lib/jsonQuery";

interface JsonTreeViewerProps {
  data: any;
  searchTerm?: string;
  expandAll?: boolean;
}

interface TreeNodeProps {
  keyName?: string;
  value: any;
  path: string;
  searchTerm?: string;
  depth: number;
  isLast?: boolean;
  forceExpand?: boolean;
}

function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-300/60 dark:bg-amber-400/30 text-amber-900 dark:text-amber-200 px-0.5 rounded border border-amber-400 dark:border-amber-500/40"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

const TreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  value,
  path,
  searchTerm,
  depth,
  isLast = true,
  forceExpand,
}) => {
  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isContainer = isObject || isArray;

  // Determine if node or any children match the search
  const matchesSearch = Boolean(
    searchTerm &&
      searchTerm.trim().length > 0 &&
      ((keyName && keyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (!isContainer && String(value).toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const [isOpen, setIsOpen] = useState<boolean>(depth < 2 || Boolean(forceExpand));
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedVal, setCopiedVal] = useState(false);

  useEffect(() => {
    if (forceExpand !== undefined) {
      setIsOpen(forceExpand);
    }
  }, [forceExpand]);

  // If search matches, auto expand
  useEffect(() => {
    if (searchTerm && matchesSearch) {
      setIsOpen(true);
    }
  }, [searchTerm, matchesSearch]);

  const handleCopyPath = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1500);
  };

  const handleCopyVal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    await copyToClipboard(str);
    setCopiedVal(true);
    setTimeout(() => setCopiedVal(false), 1500);
  };

  // Render Primitive values
  if (!isContainer) {
    let valueElement: React.ReactNode;
    let typeBadge = "";

    if (value === null) {
      valueElement = <span className="text-zinc-400 dark:text-zinc-500 italic">null</span>;
      typeBadge = "null";
    } else if (typeof value === "boolean") {
      valueElement = (
        <span className="text-purple-600 dark:text-purple-400 font-medium">{value ? "true" : "false"}</span>
      );
      typeBadge = "bool";
    } else if (typeof value === "number") {
      valueElement = (
        <span className="text-sky-600 dark:text-sky-400 font-mono">
          <HighlightText text={String(value)} query={searchTerm} />
        </span>
      );
      typeBadge = "num";
    } else {
      valueElement = (
        <span className="text-emerald-700 dark:text-emerald-400 font-mono">
          &quot;<HighlightText text={String(value)} query={searchTerm} />&quot;
        </span>
      );
      typeBadge = "str";
    }

    return (
      <div
        className={`group relative flex items-baseline gap-1.5 py-0.5 px-1.5 rounded transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/40 text-[13px] font-mono ${
          matchesSearch ? "bg-amber-500/10 border-l-2 border-amber-400" : ""
        }`}
        style={{ paddingLeft: `${depth * 18 + 20}px` }}
      >
        {keyName !== undefined && (
          <span className="text-sky-600 dark:text-sky-300 select-none">
            &quot;<HighlightText text={keyName} query={searchTerm} />&quot;:
          </span>
        )}
        <span className="break-all">{valueElement}</span>
        {!isLast && <span className="text-zinc-400 dark:text-zinc-500">,</span>}

        {/* Hover action badges */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto pl-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="text-[10px] px-1 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded border border-zinc-200 dark:border-zinc-700/50">
            {typeBadge}
          </span>
          <button
            onClick={handleCopyPath}
            title={`Copy path: ${path}`}
            className="hover:text-zinc-900 dark:hover:text-white px-1 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-750 flex items-center gap-0.5 text-[10px]"
          >
            {copiedPath ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Tag className="w-3 h-3" />}
            <span>path</span>
          </button>
          <button
            onClick={handleCopyVal}
            title="Copy value"
            className="hover:text-zinc-900 dark:hover:text-white px-1 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-750 flex items-center gap-0.5 text-[10px]"
          >
            {copiedVal ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    );
  }

  // Render Object or Array
  const entries = isArray
    ? value.map((val: any, idx: number) => ({ key: String(idx), val, isArrayIdx: true }))
    : Object.entries(value).map(([k, val]) => ({ key: k, val, isArrayIdx: false }));

  const count = entries.length;
  const opener = isArray ? "[" : "{";
  const closer = isArray ? "]" : "}";

  return (
    <div className="select-text text-[13px] font-mono">
      {/* Node Header Row */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-1 py-0.5 px-1.5 rounded cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/40 ${
          matchesSearch ? "bg-amber-500/10 border-l-2 border-amber-400" : ""
        }`}
        style={{ paddingLeft: `${depth * 18 + 4}px` }}
      >
        {/* Toggle Button */}
        <button
          type="button"
          className="w-4 h-4 flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded"
        >
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Key Name if object property */}
        {keyName !== undefined && (
          <span className="text-sky-600 dark:text-sky-300 font-medium">
            &quot;<HighlightText text={keyName} query={searchTerm} />&quot;:
          </span>
        )}

        {/* Opener bracket or collapsed summary */}
        <span className="text-zinc-500 dark:text-zinc-400">{opener}</span>

        {!isOpen && (
          <span className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/40 mx-1 flex items-center gap-1">
            {isArray ? <Brackets className="w-3 h-3 text-cyan-500 dark:text-cyan-400" /> : <Braces className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
            {count} {isArray ? (count === 1 ? "item" : "items") : count === 1 ? "key" : "keys"}
          </span>
        )}

        {!isOpen && <span className="text-zinc-500 dark:text-zinc-400">{closer}</span>}
        {!isOpen && !isLast && <span className="text-zinc-400 dark:text-zinc-500">,</span>}

        {/* Hover action badges */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto pl-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="text-[10px] px-1 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded border border-zinc-200 dark:border-zinc-700/50">
            {isArray ? `Array(${count})` : `Object(${count})`}
          </span>
          <button
            onClick={handleCopyPath}
            title={`Copy path: ${path}`}
            className="hover:text-zinc-900 dark:hover:text-white px-1 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-750 flex items-center gap-0.5 text-[10px]"
          >
            {copiedPath ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Tag className="w-3 h-3" />}
            <span>path</span>
          </button>
          <button
            onClick={handleCopyVal}
            title="Copy as JSON"
            className="hover:text-zinc-900 dark:hover:text-white px-1 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-750 flex items-center gap-0.5 text-[10px]"
          >
            {copiedVal ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Children list when open */}
      <div className="relative border-l border-zinc-200 dark:border-zinc-800/80 ml-2">
        {isOpen && entries.map((entry: any, index: number) => {
          const childPath = isArray
            ? `${path}[${entry.key}]`
            : path
            ? `${path}.${entry.key}`
            : entry.key;

          return (
            <TreeNode
              key={entry.key}
              keyName={isArray ? undefined : entry.key}
              value={entry.val}
              path={childPath}
              searchTerm={searchTerm}
              depth={depth + 1}
              isLast={index === entries.length - 1}
              forceExpand={forceExpand}
            />
          );
        })}

        {/* Closing Bracket Row */}
        {isOpen && (
          <div
            className="text-zinc-500 dark:text-zinc-400 py-0.5"
            style={{ paddingLeft: `${depth * 18 + 20}px` }}
          >
            {closer}
            {!isLast && <span className="text-zinc-400 dark:text-zinc-500">,</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({
  data,
  searchTerm,
  expandAll = true,
}) => {
  if (data === null || data === undefined) {
    return (
      <div className="p-4 text-sm text-zinc-500 font-mono italic">
        null
      </div>
    );
  }

  return (
    <div className="p-3 overflow-x-auto text-zinc-800 dark:text-zinc-300 font-mono selection:bg-indigo-500/30 selection:text-white">
      <TreeNode
        value={data}
        path="$"
        searchTerm={searchTerm}
        depth={0}
        forceExpand={expandAll}
      />
    </div>
  );
};

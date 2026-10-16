"use client";

import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { RequestPanel } from "@/components/RequestPanel";
import { ResponsePanel } from "@/components/ResponsePanel";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { CollectionsModal } from "@/components/CollectionsModal";
import { useStore } from "@/store/useStore";

export default function Home() {
  const { theme, sendRequest } = useStore();

  // Apply dark / light class to root document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  // Global Keyboard shortcuts: Cmd+Enter or Ctrl+Enter to send request
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        sendRequest();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [sendRequest]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Two-Panel Playground Layout */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden">
        {/* Left Panel: Request Builder (5 cols on lg) */}
        <section className="lg:col-span-5 h-[calc(100vh-5.5rem)] flex flex-col min-h-[500px]">
          <RequestPanel />
        </section>

        {/* Right Panel: Response Viewer & Explorer (7 cols on lg) */}
        <section className="lg:col-span-7 h-[calc(100vh-5.5rem)] flex flex-col min-h-[500px]">
          <ResponsePanel />
        </section>
      </main>

      {/* Slide-over Drawers & Modals */}
      <HistoryDrawer />
      <CollectionsModal />
    </div>
  );
}

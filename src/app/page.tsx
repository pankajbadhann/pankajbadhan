"use client";

import { useState, useEffect } from "react";
import Hero from "@/sections/hero";
import Pair from "@/sections/pair";
import Pro from "@/sections/pro";

export default function Home() {
  const [activeSection, setActiveSection] = useState<"hero" | "pair" | "pro">("hero");

  // Keyboard shortcuts listener for Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + K -> Pair Section
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActiveSection((prev) => (prev === "pair" ? "hero" : "pair"));
      }
      // Ctrl + Shift + P -> Pro Section
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setActiveSection((prev) => (prev === "pro" ? "hero" : "pro"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="w-[100vw] h-[100vh] overflow-hidden bg-[#09090B] relative">
      {/* Hero section hamesha dikhega */}
      <div className="absolute inset-0">
        <Hero />
      </div>

      {/* Pair section overlay */}
      {activeSection === "pair" && (
        <div className="absolute inset-0 z-50 bg-[#09090B]">
          <Pair />
        </div>
      )}

      {/* Pro section overlay */}
      {activeSection === "pro" && (
        <div className="absolute inset-0 z-50 bg-[#09090B]">
          <Pro />
        </div>
      )}

      {/* Mobile & Touch friendly Secret Toggle Bar (Screen de corners te chhothe jehe buttons jo bilkul subtle honge) */}
      <div className="absolute bottom-4 right-4 z-50 flex gap-2 md:hidden">
        <button
          onClick={() => setActiveSection(prev => prev === "pair" ? "hero" : "pair")}
          className="bg-zinc-800/80 text-zinc-400 text-xs px-3 py-1.5 rounded-full border border-zinc-700/50 backdrop-blur-sm active:scale-95 transition-transform"
        >
          {activeSection === "pair" ? "Close Pair" : "Pair"}
        </button>
        <button
          onClick={() => setActiveSection(prev => prev === "pro" ? "hero" : "pro")}
          className="bg-zinc-800/80 text-zinc-400 text-xs px-3 py-1.5 rounded-full border border-zinc-700/50 backdrop-blur-sm active:scale-95 transition-transform"
        >
          {activeSection === "pro" ? "Close Pro" : "Pro"}
        </button>
      </div>
    </main>
  );
}
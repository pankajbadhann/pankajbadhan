"use client";

import { useState, useEffect } from "react";
import Hero from "@/sections/hero";
import Pair from "@/sections/pair";

export default function Home() {
  const [showPair, setShowPair] = useState(false);

  // Keyboard shortcut listener (Ctrl + Shift + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowPair((prev) => !prev); // Toggle karega Pair section nu
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

      {/* Pair section sirf jad Ctrl + Shift + K dabaya javega tabhi overlay di tarah screen te aega */}
      {showPair && (
        <div className="absolute inset-0 z-50 bg-[#09090B]">
          <Pair />
        </div>
      )}
    </main>
  );
}
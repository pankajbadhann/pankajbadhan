"use client";

import React, { useState, useEffect } from "react";

interface PairData {
  name: string;
  category: string;
  setTimestamp: number | null;
  targetTimeStr: string;
}

export default function PairsDashboard() {
  const initialPairs: PairData[] = [
    // USD (11)
    { name: "USDZAR", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDPKR", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDMXN", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDJPY", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDINR", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDEGP", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDDZD", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDCOP", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDCHF", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDCAD", category: "USD", setTimestamp: null, targetTimeStr: "" },
    { name: "USDARS", category: "USD", setTimestamp: null, targetTimeStr: "" },

    // NZD (4)
    { name: "NZDUSD", category: "NZD", setTimestamp: null, targetTimeStr: "" },
    { name: "NZDJPY", category: "NZD", setTimestamp: null, targetTimeStr: "" },
    { name: "NZDCHF", category: "NZD", setTimestamp: null, targetTimeStr: "" },
    { name: "NZDCAD", category: "NZD", setTimestamp: null, targetTimeStr: "" },

    // GBP (6)
    { name: "GBPUSD", category: "GBP", setTimestamp: null, targetTimeStr: "" },
    { name: "GBPNZD", category: "GBP", setTimestamp: null, targetTimeStr: "" },
    { name: "GBPJPY", category: "GBP", setTimestamp: null, targetTimeStr: "" },
    { name: "GBPCHF", category: "GBP", setTimestamp: null, targetTimeStr: "" },
    { name: "GBPCAD", category: "GBP", setTimestamp: null, targetTimeStr: "" },
    { name: "GBPAUD", category: "GBP", setTimestamp: null, targetTimeStr: "" },

    // EUR (7)
    { name: "EURUSD", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "EURNZD", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "EURJPY", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "EURGBP", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "EURCHF", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "EURCAD", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "EURAUD", category: "AUD", setTimestamp: null, targetTimeStr: "" },

    // CHF (1)
    { name: "CHFJPY", category: "CHF", setTimestamp: null, targetTimeStr: "" },
    // CAD (2)
    { name: "CADJPY", category: "CAD", setTimestamp: null, targetTimeStr: "" },
    { name: "CADCHF", category: "CAD", setTimestamp: null, targetTimeStr: "" },
    // BTC (1)
    { name: "BTCUSD", category: "BTC", setTimestamp: null, targetTimeStr: "" },
    // BRL (1)
    { name: "BRLUSD", category: "BRL", setTimestamp: null, targetTimeStr: "" },
    // AUD (5)
    { name: "AUDUSD", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "AUDNZD", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "AUDJPY", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "AUDCHF", category: "AUD", setTimestamp: null, targetTimeStr: "" },
    { name: "AUDCAD", category: "AUD", setTimestamp: null, targetTimeStr: "" },
  ];

  const [pairs, setPairs] = useState<PairData[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quotex_pairs_data_v4");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return initialPairs;
  });

  const [selectedPair, setSelectedPair] = useState<PairData | null>(null);
  const [inputDateTime, setInputDateTime] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [, setTick] = useState(0);

  // Real-time timer update every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLocalDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDoubleClick = (pair: PairData) => {
    setSelectedPair(pair);
    setErrorMsg("");
    if (pair.setTimestamp) {
      setInputDateTime(formatLocalDateTime(new Date(pair.setTimestamp)));
    } else {
      setInputDateTime(formatLocalDateTime(new Date()));
    }
  };

  const handleSaveTime = () => {
    if (!selectedPair || !inputDateTime) return;

    const targetTimestamp = new Date(inputDateTime).getTime();
    const currentTimestamp = Date.now();
    const maxPastMs = (35 * 60 + 30) * 60 * 1000; // 35h 30m in ms
    const oldestAllowedTimestamp = currentTimestamp - maxPastMs;

    if (targetTimestamp > currentTimestamp) {
      setErrorMsg("⚠️ Future time is not allowed! Select past candle time.");
      return;
    }
    if (targetTimestamp < oldestAllowedTimestamp) {
      setErrorMsg("⚠️ Time exceeds 35h 30m limit! Choose a more recent time.");
      return;
    }

    const targetDate = new Date(inputDateTime);
    const day = String(targetDate.getDate()).padStart(2, "0");
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const hh = String(targetDate.getHours()).padStart(2, "0");
    const mm = String(targetDate.getMinutes()).padStart(2, "0");
    const readableStr = `${day}/${month} ${hh}:${mm}`;

    setPairs((prev) => {
      const updated = prev.map((p) =>
        p.name === selectedPair.name && p.category === selectedPair.category
          ? { ...p, setTimestamp: targetTimestamp, targetTimeStr: readableStr }
          : p,
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("quotex_pairs_data_v4", JSON.stringify(updated));
      }
      return updated;
    });

    setSelectedPair(null);
  };

  const handleResetPair = (pair: PairData, e: React.MouseEvent) => {
    e.stopPropagation();
    setPairs((prev) => {
      const updated = prev.map((p) =>
        p.name === pair.name && p.category === pair.category
          ? { ...p, setTimestamp: null, targetTimeStr: "" }
          : p,
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("quotex_pairs_data_v4", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const getPairStatus = (pair: PairData) => {
    if (!pair.setTimestamp) {
      return {
        priority: 4,
        className: "bg-green-800 hover:bg-green-700 text-white",
        remainingStr: "Ready",
      };
    }

    const totalDurationMs = (35 * 60 + 30) * 60 * 1000;
    const elapsedMs = Date.now() - pair.setTimestamp;
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));

    const limit1 = 11 * 60 + 50; // 11h 50m
    const limit2 = 23 * 40; // 23h 40m
    const limit3 = 35 * 60 + 30; // 35h 30m

    const remainingMs = totalDurationMs - elapsedMs;
    let remainingStr = "";
    if (remainingMs <= 0) {
      remainingStr = "Ready (Green)";
    } else {
      const remHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const remMins = Math.floor(
        (remainingMs % (1000 * 60 * 60)) / (1000 * 60),
      );
      const remSecs = Math.floor((remainingMs % (1000 * 60)) / 1000);
      remainingStr = `${remHours}h ${remMins}m ${remSecs}s`;
    }

    if (elapsedMinutes <= limit1) {
      return {
        priority: 1,
        className:
          "bg-red-600/90 hover:bg-red-600 text-white animate-pulse-subtle",
        remainingStr,
      };
    } else if (elapsedMinutes <= limit2) {
      return {
        priority: 2,
        className: "bg-orange-600/90 hover:bg-orange-600 text-white",
        remainingStr,
      };
    } else if (elapsedMinutes <= limit3) {
      return {
        priority: 3,
        className: "bg-yellow-500 hover:bg-yellow-400 text-black font-semibold",
        remainingStr,
      };
    } else {
      return {
        priority: 4,
        className: "bg-green-800 hover:bg-green-700 text-white",
        remainingStr: "Ready",
      };
    }
  };

  const sortedPairs = [...pairs].sort((a, b) => {
    return getPairStatus(b).priority - getPairStatus(a).priority;
  });

  // Calculate strict bounds for transparency
  const now = new Date();
  const maxDateTimeStr = formatLocalDateTime(now);
  const oldestDate = new Date(now.getTime() - (35 * 60 + 30) * 60 * 1000);
  const minDateTimeStr = formatLocalDateTime(oldestDate);

  // Quick preset shortcuts helper
  const handleQuickPreset = (hoursAgo: number) => {
    const target = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    setInputDateTime(formatLocalDateTime(target));
    setErrorMsg("");
  };

  return (
    <div className="w-screen min-h-screen bg-gray-950 text-white flex flex-col p-3 md:p-7 select-none overflow-x-hidden">
      {/* Top Header info bar */}
      {/* <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-900/80 border border-gray-800 rounded-xl p-3 mb-4 shadow-lg gap-2">
        <div>
          <h1 className="text-base md:text-lg font-black tracking-wider text-cyan-400">
            QUOTEX 35.5H PRO TRACKER
          </h1>
          <p className="text-[11px] text-gray-400">
            Double-click or tap any card to configure candle entry time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] md:text-xs">
          <span className="px-2 py-1 bg-red-600/30 border border-red-500 rounded text-red-300 font-medium">
            Red (&lt;11h50m)
          </span>
          <span className="px-2 py-1 bg-orange-600/30 border border-orange-500 rounded text-orange-300 font-medium">
            Orange (&lt;23h40m)
          </span>
          <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-300 font-medium">
            Yellow (&lt;35h30m)
          </span>
          <span className="px-2 py-1 bg-green-600/30 border border-green-500 rounded text-green-300 font-medium">
            Green (Ready)
          </span>
        </div>
      </div> */}

      {/* Responsive Grid Layout: Mobile friendly columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 flex-grow w-full pb-4">
        {sortedPairs.map((pair, index) => {
          const status = getPairStatus(pair);
          return (
            <div
              key={index}
              onDoubleClick={() => handleDoubleClick(pair)}
              onClick={() => handleDoubleClick(pair)} // Enables smooth tap on mobile screens
              className={`relative flex flex-col justify-between items-center rounded-xl cursor-pointer border border-gray-700/60 shadow-xl transition-all duration-200 p-2.5 active:scale-95 ${status.className}`}
              title="Tap to set time"
            >
              {/* Reset button */}
              {pair.setTimestamp && (
                <button
                  onClick={(e) => handleResetPair(pair, e)}
                  className="absolute top-1 right-1.5 text-xs md:text-sm bg-black/40 hover:bg-black/70 font-bold px-1.5 py-0.5 rounded-full text-white transition"
                  title="Reset to Green"
                >
                  ✕
                </button>
              )}

              {/* Pair Name */}
              <div className="flex items-center w-full px-1 mt-1">
                <span className="text-base md:text-xl font-black tracking-wide drop-shadow">
                  {pair.name}
                </span>
              </div>

              {/* Live Info Box */}
              <div className="flex flex-col items-center text-[10px] md:text-xs w-full bg-black/35 backdrop-blur-sm rounded-lg p-1 mt-2 border border-white/10">
                <span className="opacity-90 font-medium">
                  Start: {pair.targetTimeStr || "Not Set"}
                </span>
                <span className="font-bold tracking-tight text-cyan-200 mt-0.5">
                  Left: {status.remainingStr}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Production-Level Interactive Modal with Transparent Helpers */}
      {selectedPair && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 p-5 md:p-6 rounded-2xl shadow-2xl w-full max-w-md text-white animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-cyan-300">
                  {selectedPair.name}
                </h2>
                <p className="text-xs text-gray-400">
                  Configure Big Candle Timestamp
                </p>
              </div>
              <button
                onClick={() => setSelectedPair(null)}
                className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Transparency Panel: Shows exact allowable limits */}
            <div className="bg-cyan-950/40 border border-cyan-800/50 rounded-xl p-3 mb-4 text-xs text-cyan-200 space-y-1">
              <div className="font-semibold text-cyan-300">
                ℹ️ Rule & Transparency Guide:
              </div>
              <div>
                • Max allowed history: Exactly{" "}
                <strong className="text-white">35h 30m ago</strong>.
              </div>
              <div>• Future times are strictly blocked for accuracy.</div>
            </div>

            {/* Quick Preset Buttons for Super Fast Input */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Quick Shortcuts (Hours Ago):
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset(1)}
                  className="bg-gray-800 hover:bg-gray-700 text-xs py-1.5 rounded-lg border border-gray-700 text-cyan-300 font-medium"
                >
                  1h Ago
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(6)}
                  className="bg-gray-800 hover:bg-gray-700 text-xs py-1.5 rounded-lg border border-gray-700 text-cyan-300 font-medium"
                >
                  6h Ago
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(12)}
                  className="bg-gray-800 hover:bg-gray-700 text-xs py-1.5 rounded-lg border border-gray-700 text-cyan-300 font-medium"
                >
                  12h Ago
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(24)}
                  className="bg-gray-800 hover:bg-gray-700 text-xs py-1.5 rounded-lg border border-gray-700 text-cyan-300 font-medium"
                >
                  24h Ago
                </button>
              </div>
            </div>

            {/* Main Native Time Selector Input with Bounds */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Exact Date & Time Selector
              </label>
              <input
                type="datetime-local"
                value={inputDateTime}
                min={minDateTimeStr}
                max={maxDateTimeStr}
                onChange={(e) => {
                  setInputDateTime(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-base md:text-lg text-white focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
              />
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="bg-red-950/80 border border-red-700 text-red-200 text-xs p-2.5 rounded-xl mb-4 font-medium flex items-center gap-2">
                {errorMsg}
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex justify-end gap-2.5 mt-6">
              <button
                onClick={() => setSelectedPair(null)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-xs md:text-sm rounded-xl transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTime}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-xs md:text-sm font-bold rounded-xl transition shadow-lg shadow-cyan-900/50"
              >
                Start Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

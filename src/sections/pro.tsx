"use client";

import { type InputHTMLAttributes, useMemo, useRef, useState } from "react";

type Mode = "trade" | "day" | "week";

type TradeRow = {
  week: number;
  day: number;
  trade: number;
  result: "WIN" | "LOSS";
  before: number;
  risk: number;
  pnl: number;
  after: number;
};

const money = (v: number, d = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(Number.isFinite(v) ? v : 0);

const compact = (v: number) =>
  !Number.isFinite(v)
    ? "$0"
    : Math.abs(v) >= 1e9
      ? `$${(v / 1e9).toFixed(2)}B`
      : Math.abs(v) >= 1e6
        ? `$${(v / 1e6).toFixed(2)}M`
        : Math.abs(v) >= 1e3
          ? `$${(v / 1e3).toFixed(2)}K`
          : money(v);

const logRequired = (s: number, t: number, m: number) =>
  t <= s ? 0 : m <= 1 ? Infinity : Math.ceil(Math.log(t / s) / Math.log(m));

const card =
  "min-w-0 min-h-0 rounded-2xl border border-white/[.075] bg-gradient-to-br from-[#111720]/95 to-[#0b1017]/95 shadow-[0_15px_45px_rgba(0,0,0,.22)]";

function Field({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[.65px] text-[#c3ccd9]">
        {label}
      </span>

      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[42px] w-full rounded-[10px] border border-white/[.085] bg-[#0a0f15] px-3 text-[13px] font-semibold text-[#f4f7fb] outline-none transition focus:border-[#35d89a]/50 focus:ring-4 focus:ring-[#35d89a]/5"
      />
    </label>
  );
}

function Kpi({
  label,
  value,
  color = "text-[#f4f7fb]",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      className={`${card} flex min-h-[82px] flex-col justify-center p-3.5 sm:p-4`}
    >
      <span className="mb-2 text-[8px] font-extrabold uppercase tracking-[.7px] text-[#778396]">
        {label}
      </span>

      <span
        className={`truncate text-[16px] font-black tracking-[-.7px] sm:text-[20px] ${color}`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Resizable divider.
 *
 * The divider controls the percentage width of the left side.
 * In our 3-column layout:
 *
 * INPUT | CHART | TABLE
 *
 * First divider  = input/chart
 * Second divider = chart/table
 */
function ResizeHandle({
  onResize,
  // direction = "horizontal",
}: {
  onResize: (delta: number) => void;
  direction?: "horizontal";
}) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();

    dragging.current = true;
    lastX.current = e.clientX;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;

    const delta = e.clientX - lastX.current;

    if (Math.abs(delta) < 1) return;

    lastX.current = e.clientX;
    onResize(delta);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // noop
    }
  };

  return (
    <div
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="group relative z-30 hidden w-2 shrink-0 cursor-col-resize touch-none select-none lg:block"
      title="Drag to resize"
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/[.06] transition group-hover:bg-[#35d89a]/60" />

      <div className="absolute left-1/2 top-1/2 flex h-10 w-1 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/[.08] opacity-0 transition group-hover:opacity-100">
        <div className="h-5 w-[2px] rounded-full bg-[#35d89a]" />
      </div>
    </div>
  );
}

export default function DevProPage() {
  const [start, setStart] = useState("10");
  const [target, setTarget] = useState("1000");
  const [risk, setRisk] = useState("13");
  const [payout, setPayout] = useState("85");
  const [winRate, setWinRate] = useState("70");
  const [tradesPerDay, setTradesPerDay] = useState("5");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [weeks, setWeeks] = useState("2");
  const [mode] = useState<Mode>("trade");

  /**
   * Widths are percentages of the desktop content area.
   *
   * Default:
   * Input  = 22%
   * Chart  = 43%
   * Table  = 35%
   */
  const [inputWidth, setInputWidth] = useState(22);
  const [chartWidth, setChartWidth] = useState(43);

  const data = useMemo(() => {
    const s = Number(start);
    const t = Number(target);
    const r = Number(risk) / 100;
    const p = Number(payout) / 100;
    const wr = Number(winRate) / 100;
    const tpd = Number(tradesPerDay);
    const dpw = Number(daysPerWeek);
    const w = Number(weeks);

    const errors: string[] = [];

    if (!start.trim() || !Number.isFinite(s) || s <= 0)
      errors.push("Starting balance must be greater than 0.");

    if (!target.trim() || !Number.isFinite(t) || t <= 0)
      errors.push("Target must be greater than 0.");

    if (!risk.trim() || !Number.isFinite(r) || r <= 0 || r > 100)
      errors.push("Risk must be between 0.01% and 100%.");

    if (!payout.trim() || !Number.isFinite(p) || p < 0)
      errors.push("Enter a valid payout percentage.");

    if (!winRate.trim() || !Number.isFinite(wr) || wr < 0 || wr > 1)
      errors.push("Win rate must be between 0% and 100%.");

    if (!tradesPerDay.trim() || !Number.isFinite(tpd) || tpd <= 0)
      errors.push("Trades per day must be greater than 0.");

    if (!daysPerWeek.trim() || !Number.isFinite(dpw) || dpw <= 0 || dpw > 7)
      errors.push("Trading days must be between 1 and 7.");

    if (!weeks.trim() || !Number.isFinite(w) || w <= 0)
      errors.push("Weeks must be greater than 0.");

    if (errors.length) {
      return {
        valid: false as const,
        errors,
      };
    }

    const winGrowth = r * p;
    const winMultiplier = 1 + winGrowth;
    const lossMultiplier = 1 - r;

    const allWinTrades = logRequired(s, t, winMultiplier);

    const tradesAvailable = Math.floor(tpd * dpw * w);

    let expectedTrades = Infinity;

    if (t <= s) {
      expectedTrades = 0;
    } else if (wr === 1) {
      expectedTrades = allWinTrades;
    } else if (wr > 0 && lossMultiplier > 0) {
      const growth =
        wr * Math.log(winMultiplier) + (1 - wr) * Math.log(lossMultiplier);

      if (growth > 0) {
        expectedTrades = Math.ceil(Math.log(t / s) / growth);
      }
    }

    const requiredDays = Number.isFinite(expectedTrades)
      ? Math.ceil(expectedTrades / tpd)
      : Infinity;

    const requiredWeeks = Number.isFinite(expectedTrades)
      ? Math.ceil(expectedTrades / (dpw * tpd))
      : Infinity;

    /**
     * Deterministic 70/30 style sequence based on
     * the configured win rate.
     */
    const sequence = Array.from(
      { length: 100 },
      (_, i) => Math.round((i + 1) * wr) > Math.round(i * wr),
    );

    let balance = s;
    let reached = balance >= t;
    let tradeNumber = 0;

    const rows: TradeRow[] = [];
    const curve = [balance];

    const maxRows = Math.min(tradesAvailable, 2000);

    for (let week = 1; week <= w && !reached; week++) {
      for (let day = 1; day <= dpw && !reached; day++) {
        for (let trade = 1; trade <= tpd && !reached; trade++) {
          if (tradeNumber >= maxRows) break;

          tradeNumber++;

          const before = balance;
          const riskAmount = before * r;

          const isWin = sequence[(tradeNumber - 1) % 100];

          const pnl = isWin ? riskAmount * p : -riskAmount;

          balance += pnl;

          rows.push({
            week,
            day,
            trade: tradeNumber,
            result: isWin ? "WIN" : "LOSS",
            before,
            risk: riskAmount,
            pnl,
            after: balance,
          });

          curve.push(balance);

          reached = balance >= t;
        }
      }
    }

    let perfectBalance = s;

    const perfectCurve = [s];

    const perfectTrades = Math.min(
      Number.isFinite(allWinTrades) ? allWinTrades : 5000,
      5000,
    );

    for (let i = 1; i <= perfectTrades; i++) {
      perfectBalance *= winMultiplier;

      perfectCurve.push(perfectBalance);

      if (perfectBalance >= t) break;
    }

    const modeMultiplier =
      mode === "day"
        ? winMultiplier ** tpd
        : mode === "week"
          ? winMultiplier ** (tpd * dpw)
          : winMultiplier;

    return {
      valid: true as const,
      errors: [],
      s,
      t,
      r,
      p,
      wr,
      tpd,
      dpw,
      w,
      winGrowth,
      winMultiplier,
      lossMultiplier,
      allWinTrades,
      expectedTrades,
      requiredDays,
      requiredWeeks,
      tradesAvailable,
      balance,
      reached,
      rows,
      curve,
      perfectBalance,
      perfectCurve,
      modeMultiplier,
      modeSteps: logRequired(s, t, modeMultiplier),
    };
  }, [
    start,
    target,
    risk,
    payout,
    winRate,
    tradesPerDay,
    daysPerWeek,
    weeks,
    mode,
  ]);

  const status = !data.valid
    ? "WAITING FOR INPUT"
    : data.reached
      ? "TARGET REACHED"
      : Number.isFinite(data.expectedTrades) &&
          data.expectedTrades <= data.tradesAvailable
        ? "MATHEMATICALLY POSSIBLE"
        : "OUTSIDE SCHEDULE";

  /**
   * Keep the three columns inside 100%.
   *
   * Input: 18% → 32%
   * Chart: 25% → 60%
   * Table: whatever remains
   */
  const resizeInput = (delta: number) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1440;

    const deltaPercent = (delta / vw) * 100;

    setInputWidth((current) => {
      const next = current + deltaPercent;

      return Math.min(32, Math.max(18, next));
    });
  };

  const resizeChart = (delta: number) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1440;

    const deltaPercent = (delta / vw) * 100;

    setChartWidth((current) => {
      /**
       * Table must always retain at least 25%.
       */
      const maxChart = 100 - inputWidth - 25;

      const next = current + deltaPercent;

      return Math.min(Math.max(25, maxChart), Math.max(25, next));
    });
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#070a0f] p-2.5 text-[#f4f7fb] sm:p-3">
      <style>
        {`          
          ::-webkit-scrollbar {
            width: 1px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background: #aaa;
            border-radius: 100px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #aaa;
          }
            input[type="number"]::-webkit-inner-spin-button,
            input[type="number"]::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
        `}
      </style>
      <div className="mx-auto flex h-full w-full max-w-[2200px] flex-col overflow-hidden">
        {/* ================================
            3 COLUMN WORKSPACE
            INPUT | CHART | TABLE
        ================================= */}

        <section className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden overflow-y-auto lg:overflow-y-hidden">
          {/* ================================
              INPUT / ASIDE
          ================================= */}

          <aside
            style={{
              width:
                typeof window !== "undefined" && window.innerWidth >= 1024
                  ? `${inputWidth}%`
                  : "100%",
            }}
            className={`${card} min-h-0 w-full lg:w-auto shrink-0 overflow-y-auto p-4 sm:p-5`}
          >
            {/* Balance summary moved into sidebar */}

            {data.valid && (
              <div className="mb-4 rounded-xl border border-white/[.07] bg-[#0a0f15] p-3.5">
                <div className="mb-2 text-[8px] font-extrabold uppercase tracking-[.7px] text-[#778396]">
                  Balance
                </div>

                <div className="flex items-center gap-2 text-[18px] font-black tracking-[-.8px]">
                  <span className="truncate">{money(data.s)}</span>

                  <span className="shrink-0 text-[#35d89a]">→</span>

                  <span className="truncate">{money(data.t)}</span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[8px] uppercase tracking-[.5px] text-[#657185]">
                    {status}
                  </span>

                  <span
                    className={`rounded-md px-2 py-1 text-[7px] font-black ${
                      data.reached
                        ? "bg-[#35d89a]/10 text-[#35d89a]"
                        : "bg-[#f5c968]/10 text-[#f5c968]"
                    }`}
                  >
                    {compact(data.balance)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-2.5">
              <Field
                label="St Bal"
                value={start}
                onChange={setStart}
                type="number"
                min="0"
                step=".01"
              />

              <Field
                label="Target"
                value={target}
                onChange={setTarget}
                type="number"
                min="0"
                step=".01"
              />

              <Field
                label="RPT"
                value={risk}
                onChange={setRisk}
                type="number"
                min="0"
                max="100"
                step=".1"
              />

              <Field
                label="Payout %"
                value={payout}
                onChange={setPayout}
                type="number"
                min="0"
                step="1"
              />

              <Field
                label="Win rate"
                value={winRate}
                onChange={setWinRate}
                type="number"
                min="0"
                max="100"
              />

              <Field
                label="Trade / day"
                value={tradesPerDay}
                onChange={setTradesPerDay}
                type="number"
                min="1"
              />

              <Field
                label="Days / week"
                value={daysPerWeek}
                onChange={setDaysPerWeek}
                type="number"
                min="1"
                max="7"
              />

              <Field
                label="Weeks"
                value={weeks}
                onChange={setWeeks}
                type="number"
                min="1"
              />
            </div>

            {/* Sidebar KPIs */}

            {data.valid && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniStat
                  label="Win growth"
                  value={`+${(data.winGrowth * 100).toFixed(2)}%`}
                  color="text-[#35d89a]"
                />

                <MiniStat
                  label="Loss"
                  value={`−${(data.r * 100).toFixed(2)}%`}
                  color="text-[#ff6678]"
                />

                <MiniStat
                  label="100% wins"
                  value={
                    Number.isFinite(data.allWinTrades)
                      ? data.allWinTrades.toLocaleString()
                      : "∞"
                  }
                  color="text-[#79a9ff]"
                />

                <MiniStat
                  label="Schedule"
                  value={data.tradesAvailable.toLocaleString()}
                />
              </div>
            )}
          </aside>

          {/* INPUT / CHART RESIZER */}

          <ResizeHandle onResize={resizeInput} />

          {/* ================================
              CHART
          ================================= */}

          <section
            style={{
              width:
                typeof window !== "undefined" && window.innerWidth >= 1024
                  ? `${chartWidth}%`
                  : "100%",
            }}
            className="flex min-h-0 min-w-0 w-full lg:w-auto shrink-0 flex-col overflow-hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              {!data.valid ? (
                <div
                  className={`${card} grid min-h-0 flex-1 place-items-center overflow-auto p-6 text-center`}
                >
                  <div>
                    <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl border border-[#f5c968]/15 bg-[#f5c968]/10 text-lg font-black text-[#f5c968]">
                      !
                    </div>

                    <h3 className="mb-2 text-sm font-black">
                      Complete the scenario
                    </h3>

                    <div className="text-[10px] leading-7 text-[#778396]">
                      {data.errors.map((e) => (
                        <div key={e}>• {e}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Main KPIs above chart */}

                  <div className="grid grid-cols-2 gap-2.5">
                    <Kpi
                      label="Demo balance"
                      value={compact(data.balance)}
                      color={data.reached ? "text-[#35d89a]" : "text-[#f5c968]"}
                    />

                    <Kpi
                      label="Expected trades"
                      value={
                        Number.isFinite(data.expectedTrades)
                          ? data.expectedTrades.toLocaleString()
                          : "∞"
                      }
                      color="text-[#79a9ff]"
                    />
                  </div>

                  {/* Growth chart */}

                  <div
                    className={`${card} flex min-h-0 flex-1 flex-col overflow-hidden p-4`}
                  >
                    <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                      <h3 className="text-[11px] font-black">Growth curve</h3>

                      <span className="truncate text-[8px] text-[#778396]">
                        {data.rows.length} simulated trades
                      </span>
                    </div>

                    <div className="min-h-0 flex-1 overflow-auto">
                      <GrowthChart
                        values={data.curve}
                        start={data.s}
                        target={data.t}
                      />
                    </div>
                  </div>

                  {/* Secondary stats */}

                  <div className="grid grid-cols-2 gap-2.5">
                    <Kpi
                      label="Required days"
                      value={
                        Number.isFinite(data.requiredDays)
                          ? data.requiredDays.toLocaleString()
                          : "∞"
                      }
                    />

                    <Kpi
                      label="Required weeks"
                      value={
                        Number.isFinite(data.requiredWeeks)
                          ? data.requiredWeeks.toLocaleString()
                          : "∞"
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* CHART / TABLE RESIZER */}

          <ResizeHandle onResize={resizeChart} />

          {/* ================================
              TABLE
          ================================= */}

          <section className="min-h-0 min-w-0 w-full lg:flex-1 shrink-0 overflow-hidden">
            {data.valid ? (
              <div
                className={`${card} flex h-full min-h-0 min-w-0 flex-col overflow-hidden`}
              >
                {/* TABLE — vertically scrollable, no horizontal overflow */}
                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
                  <table className="w-full min-w-0 table-fixed border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#101720] text-[7px] uppercase tracking-[.55px] text-[#778396]">
                      <tr>
                        <th className="w-[14%] border-b border-white/[.04] px-2 py-2 text-left">
                          Period
                        </th>

                        <th className="w-[10%] border-b border-white/[.04] px-2 py-2 text-right">
                          Trade
                        </th>

                        <th className="w-[13%] border-b border-white/[.04] px-2 py-2 text-right">
                          Result
                        </th>

                        <th className="w-[16%] border-b border-white/[.04] px-2 py-2 text-right">
                          Before
                        </th>

                        <th className="w-[15%] border-b border-white/[.04] px-2 py-2 text-right">
                          Risk
                        </th>

                        <th className="w-[16%] border-b border-white/[.04] px-2 py-2 text-right">
                          P/L
                        </th>

                        <th className="w-[16%] border-b border-white/[.04] px-2 py-2 text-right">
                          After
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.rows.map((row) => (
                        <tr
                          key={row.trade}
                          className="text-[9px] text-[#aeb8c8] hover:bg-white/[.025]"
                        >
                          <td className="truncate border-b border-white/[.04] px-2 py-2 text-left">
                            W{row.week} · D{row.day}
                          </td>

                          <td className="truncate border-b border-white/[.04] px-2 py-2 text-right">
                            #{row.trade}
                          </td>

                          <td
                            className={`truncate border-b border-white/[.04] px-2 py-2 text-right font-extrabold ${
                              row.result === "WIN"
                                ? "text-[#35d89a]"
                                : "text-[#ff6678]"
                            }`}
                          >
                            {row.result}
                          </td>

                          <td className="truncate border-b border-white/[.04] px-2 py-2 text-right">
                            {money(row.before)}
                          </td>

                          <td className="truncate border-b border-white/[.04] px-2 py-2 text-right">
                            {money(row.risk)}
                          </td>

                          <td
                            className={`truncate border-b border-white/[.04] px-2 py-2 text-right ${
                              row.pnl >= 0 ? "text-[#35d89a]" : "text-[#ff6678]"
                            }`}
                          >
                            {row.pnl >= 0 ? "+" : ""}
                            {money(row.pnl)}
                          </td>

                          <td className="truncate border-b border-white/[.04] px-2 py-2 text-right">
                            {money(row.after)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div
                className={`${card} grid h-full min-w-0 place-items-center overflow-hidden text-center`}
              >
                <span className="text-[10px] font-bold text-[#657185]">
                  Table will appear here
                </span>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function MiniStat({
  label,
  value,
  color = "text-[#f4f7fb]",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[.055] bg-[#0a0f15] p-2.5">
      <div className="mb-1 truncate text-[7px] font-extrabold uppercase tracking-[.55px] text-[#657185]">
        {label}
      </div>

      <div className={`truncate text-[12px] font-black ${color}`}>{value}</div>
    </div>
  );
}

function GrowthChart({
  values,
  start,
  target,
}: {
  values: number[];
  start: number;
  target: number;
}) {
  const width = 1000;
  const height = 220;

  const pad = {
    left: 8,
    right: 8,
    top: 15,
    bottom: 20,
  };

  const min = Math.min(start, ...values);

  const max = Math.max(target, ...values);

  const safeMin = Math.max(0, min * 0.92);

  const safeMax = Math.max(safeMin + 1, max * 1.06);

  const plotW = width - pad.left - pad.right;

  const plotH = height - pad.top - pad.bottom;

  const x = (i: number) =>
    pad.left + (i / Math.max(1, values.length - 1)) * plotW;

  const y = (v: number) =>
    pad.top + (1 - (v - safeMin) / (safeMax - safeMin)) * plotH;

  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  const ty = y(target);

  return (
    <svg
      className="h-full min-h-[175px] w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#35d89a" />
          <stop offset="1" stopColor="#79a9ff" />
        </linearGradient>

        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#35d89a" stopOpacity=".13" />

          <stop offset="1" stopColor="#35d89a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3].map((i) => {
        const yy = pad.top + (i / 3) * plotH;

        return (
          <line
            key={i}
            x1={pad.left}
            x2={width - pad.right}
            y1={yy}
            y2={yy}
            stroke="rgba(255,255,255,.055)"
          />
        );
      })}

      {target >= safeMin && target <= safeMax && (
        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={ty}
          y2={ty}
          stroke="#f5c968"
          strokeOpacity=".65"
          strokeDasharray="6 6"
        />
      )}

      <polygon
        points={`${pad.left},${height - pad.bottom} ${points} ${
          width - pad.right
        },${height - pad.bottom}`}
        fill="url(#area)"
      />

      <polyline
        points={points}
        fill="none"
        stroke="url(#line)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {values.length > 0 && (
        <>
          <circle
            cx={x(values.length - 1)}
            cy={y(values.at(-1)!)}
            r="7"
            fill="rgba(53,216,154,.12)"
          />

          <circle
            cx={x(values.length - 1)}
            cy={y(values.at(-1)!)}
            r="3.5"
            fill="#69e9b4"
          />
        </>
      )}
    </svg>
  );
}

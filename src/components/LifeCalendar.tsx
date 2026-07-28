import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Settings2, Sparkles, X } from "lucide-react";

type Props = {
  age: number;
  onResume?: () => void;
  resumeTitle?: string;
  compact?: boolean;
  /** Show the inline "Customize" toggle. Defaults to !compact. */
  customizable?: boolean;
};

type Stage = { label: string; from: number; to: number; tint: string };

export const STAGES: Stage[] = [
  { label: "Childhood", from: 0,  to: 12, tint: "color-mix(in oklab, hsl(var(--foreground)) 6%, transparent)" },
  { label: "Teens",     from: 13, to: 19, tint: "color-mix(in oklab, hsl(var(--primary)) 8%, transparent)" },
  { label: "Twenties",  from: 20, to: 29, tint: "color-mix(in oklab, hsl(var(--primary)) 14%, transparent)" },
  { label: "Thirties",  from: 30, to: 39, tint: "color-mix(in oklab, hsl(var(--primary)) 10%, transparent)" },
  { label: "Forties",   from: 40, to: 49, tint: "color-mix(in oklab, hsl(var(--primary)) 8%, transparent)" },
  { label: "Fifties+",  from: 50, to: 79, tint: "color-mix(in oklab, hsl(var(--foreground)) 5%, transparent)" },
];

export const MILESTONES: { age: number; label: string }[] = [
  { age: 13, label: "Old enough to post" },
  { age: 18, label: "Adulthood" },
  { age: 25, label: "Peak learning years" },
  { age: 30, label: "Compound decade" },
  { age: 40, label: "Story to tell" },
  { age: 50, label: "Legacy chapter" },
  { age: 65, label: "Traditional retirement" },
];

const FUN_FACTS = [
  (d: number) => `≈ ${d.toLocaleString()} sunrises`,
  (d: number) => `≈ ${(d * 24).toLocaleString()} hours to spend`,
  (d: number) => `≈ ${(d * 100_000).toLocaleString()} heartbeats`,
  (d: number) => `≈ ${(d * 20_000).toLocaleString()} breaths`,
  (d: number) => `${d} chances to post something honest`,
  (d: number) => `${d} cups of coffee — give or take`,
];

const PREFS_KEY = "socialrum:calendar-prefs";
type Prefs = { stages: Record<string, boolean>; milestones: Record<number, boolean> };

function defaultPrefs(): Prefs {
  return {
    stages: Object.fromEntries(STAGES.map((s) => [s.label, true])),
    milestones: Object.fromEntries(MILESTONES.map((m) => [m.age, true])),
  };
}

function readPrefs(): Prefs {
  if (typeof window === "undefined") return defaultPrefs();
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPrefs();
    const p = JSON.parse(raw) as Partial<Prefs>;
    const base = defaultPrefs();
    return {
      stages: { ...base.stages, ...(p.stages ?? {}) },
      milestones: { ...base.milestones, ...(p.milestones ?? {}) },
    };
  } catch {
    return defaultPrefs();
  }
}

export function LifeCalendar({ age, onResume, resumeTitle, compact = false, customizable }: Props) {
  const TOTAL = 80;
  const COLS = 20;
  const ROWS = Math.ceil(TOTAL / COLS);
  const cell = compact ? 8 : 18;
  const gap = compact ? 4 : 7;
  const gridWidth = COLS * cell + (COLS - 1) * gap;
  const showCustomize = customizable ?? !compact;

  const lived = Math.max(0, Math.min(TOTAL, Math.floor(age)));
  const remaining = Math.max(0, TOTAL - lived);
  const currentStage = STAGES.find((s) => lived >= s.from && lived <= s.to);
  const cells = useMemo(() => Array.from({ length: TOTAL }, (_, i) => i), []);

  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs());
  const [mounted, setMounted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState<number>(lived);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [surprise, setSurprise] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPrefs(readPrefs());
    setMounted(true);
  }, []);

  useEffect(() => {
    // Debounce screen-reader announcements so rapid arrow-key navigation
    // doesn't flood assistive tech. Only the final resting cell is spoken.
    const activeIdx = hoverIdx ?? focusIdx;
    const activeCell = activeIdx != null ? activeIdx : lived;
    const activeStage = STAGES.find((s) => activeCell >= s.from && activeCell <= s.to)!;
    const activeMilestone = MILESTONES.find((m) => m.age === activeCell);
    const daysThisYear = 365;
    const daysFromHere = activeCell >= lived
      ? Math.max(0, (TOTAL - activeCell)) * 365
      : (lived - activeCell) * 365;
    const funFact = FUN_FACTS[activeCell % FUN_FACTS.length](daysThisYear);

    let text = `Age ${activeCell}. ${activeStage.label}. `;
    if (activeMilestone) text += `Milestone: ${activeMilestone.label}. `;
    if (activeCell === lived) {
      text += `~${daysThisYear} days in this year. ${funFact}. `;
    } else if (activeCell > lived) {
      text += `${daysThisYear} days at that age. ${daysFromHere.toLocaleString()} days from now. `;
    } else {
      text += `${daysThisYear} days at that age. ${daysFromHere.toLocaleString()} days ago. `;
    }
    text += `You have around ${remaining} years remaining.`;

    const t = setTimeout(() => setAnnouncement(text), 300);
    return () => clearTimeout(t);
  }, [hoverIdx, focusIdx, lived, remaining]);

  function updatePrefs(next: Prefs) {
    setPrefs(next);
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch {}
  }
  const toggleStage = (label: string) =>
    updatePrefs({ ...prefs, stages: { ...prefs.stages, [label]: !prefs.stages[label] } });
  const toggleMilestone = (a: number) =>
    updatePrefs({ ...prefs, milestones: { ...prefs.milestones, [a]: !prefs.milestones[a] } });
  const resetPrefs = () => updatePrefs(defaultPrefs());

  const stageOn = (label: string) => (mounted ? prefs.stages[label] !== false : true);
  const milestoneOn = (a: number) => (mounted ? prefs.milestones[a] !== false : true);

  function moveFocus(next: number) {
    const clamped = Math.max(0, Math.min(TOTAL - 1, next));
    setFocusIdx(clamped);
    cellRefs.current[clamped]?.focus();
  }

  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = focusIdx;
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); moveFocus(i + 1); break;
      case "ArrowLeft":  e.preventDefault(); moveFocus(i - 1); break;
      case "ArrowDown":  e.preventDefault(); moveFocus(i + COLS); break;
      case "ArrowUp":    e.preventDefault(); moveFocus(i - COLS); break;
      case "Home":       e.preventDefault(); moveFocus(Math.floor(i / COLS) * COLS); break;
      case "End":        e.preventDefault(); moveFocus(Math.floor(i / COLS) * COLS + COLS - 1); break;
      case "PageUp":     e.preventDefault(); moveFocus(0); break;
      case "PageDown":   e.preventDefault(); moveFocus(TOTAL - 1); break;
    }
  }

  function surpriseMe() {
    const pool = remaining > 0
      ? Array.from({ length: remaining }, (_, k) => lived + k + (k === 0 && lived < TOTAL - 1 ? 1 : 0))
      : cells;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSurprise(pick);
    moveFocus(pick);
  }

  const activeIdx = hoverIdx ?? focusIdx;
  const activeCell = activeIdx != null ? activeIdx : lived;
  const activeStage = STAGES.find((s) => activeCell >= s.from && activeCell <= s.to)!;
  const activeMilestone = MILESTONES.find((m) => m.age === activeCell);
  const daysThisYear = 365;
  const daysFromHere = activeCell >= lived
    ? Math.max(0, (TOTAL - activeCell)) * 365
    : (lived - activeCell) * 365;
  const funFact = useMemo(
    () => FUN_FACTS[activeCell % FUN_FACTS.length](daysThisYear),
    [activeCell, daysThisYear],
  );

  return (
    <div className={`${compact ? "" : "mt-14"} w-full max-w-[600px] mx-auto`}>
      {/* Screen-reader-only announcement region for hover/focus readout */}
      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80">
          Your life, in years
        </div>
        {showCustomize && (
          <>
            <button
              type="button"
              onClick={surpriseMe}
              aria-label="Surprise me — highlight a random year"
              title="Surprise me"
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              <Sparkles className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              aria-label={panelOpen ? "Close calendar customization" : "Open calendar customization"}
              aria-expanded={panelOpen}
              aria-controls="life-calendar-customize"
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              <Settings2 className="size-3.5" aria-hidden />
            </button>
          </>
        )}
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label={`Life calendar showing ${TOTAL} years. Currently at age ${lived}. Use arrow keys to explore.`}
        aria-rowcount={ROWS}
        aria-colcount={COLS}
        onKeyDown={onGridKeyDown}
        className="mt-4 grid mx-auto outline-none"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${cell}px)`,
          gap: `${gap}px`,
          width: `${gridWidth}px`,
        }}
      >
        {Array.from({ length: ROWS }, (_, r) => (
          <div key={`row-${r}`} role="row" aria-rowindex={r + 1} style={{ display: "contents" }}>
            {cells.slice(r * COLS, (r + 1) * COLS).map((i) => {
              const isPast = i < lived;
              const isNow = i === lived;
              const stage = STAGES.find((s) => i >= s.from && i <= s.to)!;
              const milestone = MILESTONES.find((m) => m.age === i);
              const showStageTint = stageOn(stage.label);
              const showMilestone = milestone && milestoneOn(milestone.age);
              const isSurprise = surprise === i;

              let bg: string;
              if (isNow) bg = "hsl(var(--primary))";
              else if (isPast) bg = "color-mix(in oklab, hsl(var(--foreground)) 55%, transparent)";
              else if (showStageTint) bg = stage.tint;
              else bg = "color-mix(in oklab, hsl(var(--foreground)) 12%, transparent)";

              const col = (i % COLS) + 1;
              const label = showMilestone
                ? `Age ${i}, ${stage.label}, milestone: ${milestone!.label}`
                : `Age ${i}, ${stage.label}${isNow ? ", current year" : isPast ? ", already lived" : ""}`;

              return (
                <button
                  key={i}
                  ref={(el) => { cellRefs.current[i] = el; }}
                  type="button"
                  role="gridcell"
                  aria-colindex={col}
                  aria-current={isNow ? "true" : undefined}
                  aria-label={label}
                  tabIndex={i === focusIdx ? 0 : -1}
                  onFocus={() => setFocusIdx(i)}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx((h) => (h === i ? null : h))}
                  onClick={() => { setFocusIdx(i); setSurprise(i); }}
                  className="relative block rounded-[2px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background transition-transform hover:scale-125"
                  style={{
                    height: `${cell}px`,
                    width: `${cell}px`,
                    background: bg,
                    padding: 0,
                    border: 0,
                    boxShadow: isNow
                      ? "0 0 0 2px color-mix(in oklab, hsl(var(--primary)) 30%, transparent)"
                      : isSurprise
                        ? "0 0 0 2px color-mix(in oklab, hsl(var(--primary)) 60%, transparent)"
                        : undefined,
                  }}
                >
                  {showMilestone && !isNow && (
                    <span
                      aria-hidden
                      className="absolute inset-0 m-auto rounded-full"
                      style={{
                        height: `${Math.max(3, cell - 6)}px`,
                        width: `${Math.max(3, cell - 6)}px`,
                        background: isPast
                          ? "color-mix(in oklab, hsl(var(--primary)) 85%, white)"
                          : "color-mix(in oklab, hsl(var(--primary)) 70%, transparent)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Visible hover/focus readout */}
      {!compact && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-3 mx-auto rounded-lg border border-border/60 bg-card/50 backdrop-blur px-3 py-2 text-[11px] text-muted-foreground text-center"
          style={{ maxWidth: `${gridWidth}px` }}
        >
          <div className="flex items-center justify-center gap-2 text-foreground">
            <span className="font-medium">Age {activeCell}</span>
            <span className="opacity-50">·</span>
            <span>{activeStage.label}</span>
            {activeMilestone && (
              <>
                <span className="opacity-50">·</span>
                <span>{activeMilestone.label}</span>
              </>
            )}
          </div>
          <div className="mt-0.5">
            {activeCell === lived ? (
              <>~{daysThisYear} days in this trip around the sun · {funFact}</>
            ) : activeCell > lived ? (
              <>{daysThisYear} days at that age · {daysFromHere.toLocaleString()} days from now until you're past it</>
            ) : (
              <>{daysThisYear} days at that age · {daysFromHere.toLocaleString()} days ago you were here</>
            )}
          </div>
        </div>
      )}

      {!compact && (
        <div
          className="mt-3 mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground"
          style={{ maxWidth: `${gridWidth}px` }}
        >
          {STAGES.filter((s) => stageOn(s.label)).map((s) => {
            const on = currentStage?.label === s.label;
            return (
              <span key={s.label} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block rounded-[2px]"
                  style={{ width: 8, height: 8, background: s.tint, outline: on ? "1px solid hsl(var(--primary))" : undefined }}
                />
                <span className={on ? "text-foreground" : ""}>{s.label}</span>
              </span>
            );
          })}
          {MILESTONES.some((m) => milestoneOn(m.age)) && (
            <span className="inline-flex items-center gap-1.5 ml-1">
              <span
                aria-hidden
                className="inline-block rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: "color-mix(in oklab, hsl(var(--primary)) 85%, white)",
                }}
              />
              <span>Milestone</span>
            </span>
          )}
        </div>
      )}

      {showCustomize && panelOpen && (
        <div
          id="life-calendar-customize"
          role="region"
          aria-label="Customize life calendar"
          className="mt-4 mx-auto rounded-2xl border border-border bg-card/70 backdrop-blur p-4 text-left"
          style={{ maxWidth: `${gridWidth + 40}px` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Customize calendar
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetPrefs}
                aria-label="Reset calendar customization to defaults"
                className="text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Close customize panel"
                className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>

          <div id="stage-group-label" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5">
            Age ranges
          </div>
          <div role="group" aria-labelledby="stage-group-label" className="flex flex-wrap gap-1.5 mb-3">
            {STAGES.map((s) => {
              const on = stageOn(s.label);
              return (
                <button
                  key={s.label}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={`${s.label}, ages ${s.from} to ${s.to}`}
                  onClick={() => toggleStage(s.label)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    on ? "border-primary/50 text-foreground" : "border-border text-muted-foreground opacity-60"
                  }`}
                >
                  <span aria-hidden className="inline-block rounded-[2px]" style={{ width: 8, height: 8, background: s.tint }} />
                  {s.label} <span className="opacity-60">({s.from}–{s.to})</span>
                </button>
              );
            })}
          </div>

          <div id="milestone-group-label" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5">
            Milestone years
          </div>
          <div role="group" aria-labelledby="milestone-group-label" className="flex flex-wrap gap-1.5">
            {MILESTONES.map((m) => {
              const on = milestoneOn(m.age);
              return (
                <button
                  key={m.age}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={`Age ${m.age}: ${m.label}`}
                  onClick={() => toggleMilestone(m.age)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    on ? "border-primary/50 text-foreground" : "border-border text-muted-foreground opacity-60"
                  }`}
                >
                  {m.age} · {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className={`${compact ? "mt-3 text-[12px]" : "mt-5 text-[13px]"} text-muted-foreground text-center leading-relaxed`}>
        You have around <span className="text-foreground font-medium">{remaining} years</span> left to say something.
        {!compact && (
          <>
            <br />
            The best time to post was yesterday. The next best time is today.
          </>
        )}
      </p>

      {onResume && resumeTitle && (
        <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
          <span>Age {age}</span>
          <span className="opacity-50">·</span>
          <button
            type="button"
            onClick={onResume}
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Resume "{resumeTitle}" →
          </button>
        </div>
      )}
    </div>
  );
}

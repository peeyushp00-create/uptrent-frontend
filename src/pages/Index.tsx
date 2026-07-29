import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, ArrowRight, X, CheckCircle2, Loader2, Circle, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/lib/supabase";
import { listSavedScripts } from "@/lib/api";
import { LifeCalendar } from "@/components/LifeCalendar";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const ONBOARD_KEY = "socialrum:calendar-onboarded";
const AGE_KEY = "socialrum:calendar-confirmed-age";

type Greeting = { line1: string; line2: string; highlight: string };

function pickGreeting(name: string, isFirstVisit: boolean, hour: number): Greeting {
  const first = name || "there";
  if (isFirstVisit) {
    return { line1: `Hey ${first},`, line2: "welcome to your creator agency.", highlight: "creator agency" };
  }
  if (hour >= 17 && hour < 23) {
    return { line1: `Hey ${first},`, line2: "prime posting hours ahead.", highlight: "prime posting hours" };
  }
  const pool: Greeting[] = [
    { line1: `Hey ${first},`, line2: "what are we making today?", highlight: "making today" },
    { line1: `Welcome back, ${first}.`, line2: "let's create something good.", highlight: "something good" },
    { line1: `Hey ${first},`, line2: "your creator agency is ready.", highlight: "creator agency" },
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderHighlighted(g: Greeting) {
  const idx = g.line2.toLowerCase().indexOf(g.highlight.toLowerCase());
  if (idx < 0) return g.line2;
  const before = g.line2.slice(0, idx);
  const match = g.line2.slice(idx, idx + g.highlight.length);
  const after = g.line2.slice(idx + g.highlight.length);
  return (
    <>
      {before}
      <span className="relative inline-block px-3 rounded-lg bg-primary/[0.22] text-primary">{match}</span>
      {after}
    </>
  );
}

type AssistantCta = { label: string; feature: "trending" | "scripts" | "studio" | "news"; query?: string };
type AssistantMsg =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; cta?: AssistantCta; pending?: boolean };

function researchSteps(platform: "Instagram" | "YouTube"): string[] {
  const content = platform === "Instagram" ? "reels" : "videos";
  return [
    "Understanding your topic",
    `Searching ${platform}`,
    `Finding high-performing ${content}`,
    "Detecting outliers",
    "Measuring engagement",
    "Studying audience behaviour",
    "Finding repeatable patterns",
    "Identifying content gaps",
    "Generating personalized insights",
    "Preparing recommendations",
  ];
}

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const platform: "Instagram" | "YouTube" =
    localStorage.getItem("platform") === "youtube" ? "YouTube" : "Instagram";
  const isIG = platform === "Instagram";

  const niche = (user?.user_metadata?.niches?.[0] || 'content').toLowerCase();
  const firstName = (user?.user_metadata?.full_name || user?.email || 'Creator').split(/[\s@]/)[0];

  // ── Life calendar — real saved-script count decides "first visit", real
  // age comes from the user's profile (confirmed once via the onboarding
  // modal below, persisted to Supabase like every other profile field). ──
  const [savedScriptCount, setSavedScriptCount] = useState(0);
  useEffect(() => {
    if (!user?.id) return;
    listSavedScripts(user.id).then(res => setSavedScriptCount(res.saved?.length || 0)).catch(() => {});
  }, [user?.id]);
  const isFirstVisit = savedScriptCount === 0;

  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState<Greeting>({ line1: `Hey ${firstName},`, line2: "welcome to your creator agency.", highlight: "creator agency" });
  useEffect(() => {
    setMounted(true);
    setGreeting(pickGreeting(firstName, isFirstVisit, new Date().getHours()));
  }, [firstName, isFirstVisit]);

  const age = Number(user?.user_metadata?.age) || 25;
  const [showOnboard, setShowOnboard] = useState(false);
  useEffect(() => {
    if (!user) return;
    try {
      const onboarded = localStorage.getItem(ONBOARD_KEY);
      const lastConfirmed = Number(localStorage.getItem(AGE_KEY));
      if (!user.user_metadata?.age) { setShowOnboard(!onboarded); return; }
      if (!onboarded) setShowOnboard(true);
      else if (Number.isFinite(lastConfirmed) && lastConfirmed !== age) setShowOnboard(true);
    } catch {}
  }, [user, age]);

  async function completeOnboard(confirmedAge: number) {
    await supabase.auth.updateUser({ data: { age: confirmedAge } });
    try {
      localStorage.setItem(ONBOARD_KEY, "1");
      localStorage.setItem(AGE_KEY, String(confirmedAge));
    } catch {}
    setShowOnboard(false);
  }

  // ── Ask-anything assistant — the sole interaction surface on Home, wired to
  // our own Express endpoint at /api/home/intent (rewired from the Lovable
  // redesign's home chat composer, which used its own Lovable-gateway version). ──
  const [assistantMessages, setAssistantMessages] = useState<AssistantMsg[]>([]);
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantSending, setAssistantSending] = useState(false);
  const assistantStarted = assistantMessages.length > 0;

  const [researching, setResearching] = useState(false);
  const [researchQuery, setResearchQuery] = useState("");
  const [researchStep, setResearchStep] = useState(0);
  const RESEARCH_STEPS = researchSteps(platform);

  function runAssistantCta(cta: AssistantCta) {
    const q = cta.query?.trim() || niche;
    if (cta.feature === "trending") navigate(isIG ? `/instagram/analyzer` : `/youtube/analyzer`, { state: { query: q } });
    else if (cta.feature === "scripts") navigate('/scripts', { state: { topic: q, niche } });
    else if (cta.feature === "studio") navigate('/studio');
    else if (cta.feature === "news") navigate('/news');
  }

  async function submitAssistant(e: React.FormEvent, presetQuery?: string) {
    e.preventDefault();
    const q = (presetQuery ?? assistantQuery).trim();
    if (!q || assistantSending) return;
    setAssistantQuery("");
    setAssistantSending(true);

    // Optimistically show the research-agent progress screen — most Home
    // searches resolve to "research" mode, and this reads as a live scrape
    // rather than a spinner. The checklist is capped just short of the end
    // so it never finishes before the real response lands.
    setResearchQuery(q);
    setResearchStep(0);
    setResearching(true);
    const cap = RESEARCH_STEPS.length - 2;
    const stepTimer = setInterval(() => {
      setResearchStep((i) => (i < cap ? i + 1 : i));
    }, 650);

    try {
      const res = await fetch(`${BASE}/api/home/intent`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q, niche, name: firstName }),
      });
      const data = await res.json().catch(() => ({}));
      clearInterval(stepTimer);
      if (data.mode === "research") {
        setResearchStep(RESEARCH_STEPS.length - 1);
        await new Promise((r) => setTimeout(r, 550));
        setResearching(false);
        navigate('/news', { state: { query: data.topic || q } });
        return;
      }
      setResearching(false);
      setAssistantMessages((prev) => [...prev, { role: "user", text: q }, { role: "assistant", text: "", pending: true }]);
      const answer = data.answer || (data.error ? `Sorry — I couldn't answer that (${data.error}).` : "Sorry — I couldn't answer that just now.");
      setAssistantMessages((prev) => {
        const next = prev.filter((m) => !(m.role === "assistant" && m.pending));
        next.push({ role: "assistant", text: answer });
        return next;
      });
    } catch (err) {
      clearInterval(stepTimer);
      setResearching(false);
      setAssistantMessages((prev) => [
        ...prev.filter((m) => !(m.role === "assistant" && m.pending)),
        { role: "user", text: q },
        { role: "assistant", text: `Sorry — something went wrong: ${(err as Error).message}` },
      ]);
    } finally {
      setAssistantSending(false);
    }
  }

  const CHIPS = [
    { emoji: "📈", label: t('home.chip_trending', { niche }), action: () => navigate('/news', { state: { query: niche } }) },
    { emoji: "✏️", label: t('home.chip_script'), action: () => navigate('/scripts', { state: { topic: niche, niche } }) },
    { emoji: "👤", label: t('home.chip_competitor'), action: () => navigate(isIG ? '/instagram/analyzer' : '/youtube/analyzer') },
    { emoji: "📅", label: t('home.chip_plan'), action: () => navigate('/studio') },
  ];

  return (
    <div
      className={`theme-redesign ${theme} min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col items-center justify-center px-5 pt-32 pb-12`}
      data-platform={isIG ? undefined : "youtube"}
    >
      {/* BG blob */}
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[480px] pointer-events-none rounded-full bg-primary"
        style={{ filter: "blur(90px)" }} />

      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center gap-8">

        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&display=swap" />

        {researching ? (
          <ResearchAgentLoader
            query={researchQuery}
            platform={platform}
            steps={RESEARCH_STEPS}
            activeStep={researchStep}
          />
        ) : (
        <>
        {/* Greeting */}
        <div className="w-full text-center space-y-3">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="w-full text-center font-normal leading-[1.08] tracking-[-0.02em] text-4xl md:text-5xl text-foreground"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
            <div>{mounted ? greeting.line1 : `Hey ${firstName},`}</div>
            <div className="mt-1">{mounted ? renderHighlighted(greeting) : "welcome to your creator agency."}</div>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-muted-foreground text-base max-w-md mx-auto">
            {t('home.greeting_subtitle')}
          </motion.p>
        </div>

        {/* Composer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="w-full">
          {!assistantStarted ? (
            <form onSubmit={(e) => submitAssistant(e)} className="w-full">
              <div className="chat-input-glow flex items-center gap-3 rounded-2xl border border-input bg-card py-2 pl-4 pr-2">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <input
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  placeholder={t('home.composer_placeholder')}
                  className="flex-1 bg-transparent outline-none text-[15px] py-3 placeholder:text-muted-foreground min-w-0"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={assistantSending || !assistantQuery.trim()}
                  className="shrink-0 grid place-items-center size-10 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="panel flex flex-col gap-3 p-4 max-h-[420px] overflow-y-auto">
              {assistantMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "user" ? (
                    <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md text-sm bg-primary text-primary-foreground">
                      {m.text}
                    </div>
                  ) : (
                    <div className="max-w-[92%] text-sm leading-relaxed text-foreground">
                      {m.pending ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-current animate-pulse" />
                          <span className="size-1.5 rounded-full bg-current animate-pulse [animation-delay:120ms]" />
                          <span className="size-1.5 rounded-full bg-current animate-pulse [animation-delay:240ms]" />
                        </span>
                      ) : (
                        <>
                          <div>{m.text}</div>
                          {m.cta && (
                            <button
                              onClick={() => runAssistantCta(m.cta!)}
                              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                            >
                              {m.cta.label} <ArrowRight className="size-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <form onSubmit={(e) => submitAssistant(e)} className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  placeholder="Reply…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                <button type="submit" disabled={assistantSending || !assistantQuery.trim()} className="text-primary disabled:opacity-40">
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          )}
        </motion.div>

        {/* Quick-action chips */}
        {!assistantStarted && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            <AnimatePresence>
              {CHIPS.map((chip, i) => (
                <motion.button key={chip.label}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={chip.action}
                  className="chip justify-start text-left gap-2 py-3"
                >
                  <span>{chip.emoji}</span>
                  <span className="flex-1">{chip.label}</span>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Life calendar — a gentle push to start creating today */}
        {mounted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <LifeCalendar age={age} />
          </motion.div>
        )}
        </>
        )}
      </div>

      {showOnboard && (
        <CalendarOnboarding
          key={age}
          initialAge={age}
          onClose={() => {
            try {
              localStorage.setItem(ONBOARD_KEY, "1");
              localStorage.setItem(AGE_KEY, String(age));
            } catch {}
            setShowOnboard(false);
          }}
          onConfirm={completeOnboard}
        />
      )}
    </div>
  );
}

function ResearchAgentLoader({
  query, platform, steps, activeStep,
}: {
  query: string;
  platform: "Instagram" | "YouTube";
  steps: string[];
  activeStep: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col items-center gap-6 text-center"
    >
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
        <Sparkles className="size-3.5" />
        Research agent working
      </span>

      <h1
        className="text-4xl md:text-5xl leading-[1.1] tracking-[-0.02em] text-foreground"
        style={{ fontFamily: '"Fraunces", Georgia, serif' }}
      >
        Researching <em className="italic text-primary">{query}</em>
        <br />
        across {platform}
      </h1>

      <p className="text-sm text-muted-foreground">&ldquo;{query}&rdquo;</p>

      <div className="panel w-full max-w-xl p-5 text-left">
        {steps.map((step, i) => {
          const state = i < activeStep ? "done" : i === activeStep ? "active" : "pending";
          return (
            <div
              key={step}
              className={`flex items-center gap-3 py-2 transition-opacity ${state === "pending" ? "opacity-40" : "opacity-100"}`}
            >
              {state === "done" && <CheckCircle2 className="size-4 text-primary shrink-0" />}
              {state === "active" && <Loader2 className="size-4 text-primary animate-spin shrink-0" />}
              {state === "pending" && <Circle className="size-4 text-muted-foreground shrink-0" />}
              <span className={`text-sm ${state === "active" ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                {step}
              </span>
              {state === "active" && <MoreHorizontal className="size-4 ml-auto text-muted-foreground shrink-0" />}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Live scrape · reusing SocialRum&apos;s smart cache when available
      </p>
    </motion.div>
  );
}

function CalendarOnboarding({
  initialAge, onConfirm, onClose,
}: {
  initialAge: number;
  onConfirm: (age: number) => void;
  onClose: () => void;
}) {
  const [val, setVal] = useState(String(initialAge));
  const n = /^\d{1,3}$/.test(val.trim()) ? parseInt(val, 10) : NaN;
  const ok = Number.isFinite(n) && n >= 13 && n <= 100;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 bg-black/60" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 md:p-7 shadow-2xl relative">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>

        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          A quick note before you start
        </div>
        <h2 className="mt-2 text-2xl leading-[1.15] tracking-[-0.01em]" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
          Meet your life calendar.
        </h2>
        <p className="mt-3 text-[13.5px] text-muted-foreground leading-relaxed">
          Each square is one year of a roughly 80-year life. Filled squares are
          behind you. The bright square is <span className="text-foreground">right now</span>.
          The empty ones are every video you haven't posted yet.
        </p>

        <div className="mt-5">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Confirm your age
            <span className="ml-2 text-[10px] opacity-70">Used to generate your calendar</span>
          </label>
          <input
            type="number" min={13} max={100} value={val}
            onChange={(e) => setVal(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          {!ok && val.length > 0 && (
            <div className="mt-1.5 text-[11px] text-destructive">
              Please enter a realistic age between 13 and 100.
            </div>
          )}
        </div>

        {ok && (
          <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
            <LifeCalendar age={n} compact />
          </div>
        )}

        <button
          disabled={!ok}
          onClick={() => ok && onConfirm(n)}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
        >
          This is me — show my calendar <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

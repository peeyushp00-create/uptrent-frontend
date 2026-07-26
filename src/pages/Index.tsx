import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

type AssistantCta = { label: string; feature: "trending" | "scripts" | "studio" | "news"; query?: string };
type AssistantMsg =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; cta?: AssistantCta; pending?: boolean };

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

  // ── Ask-anything assistant — the sole interaction surface on Home, wired to
  // our own Express endpoint at /api/home/intent (rewired from the Lovable
  // redesign's home chat composer, which used its own Lovable-gateway version). ──
  const [assistantMessages, setAssistantMessages] = useState<AssistantMsg[]>([]);
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantSending, setAssistantSending] = useState(false);
  const assistantStarted = assistantMessages.length > 0;

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
    setAssistantMessages((prev) => [...prev, { role: "user", text: q }, { role: "assistant", text: "", pending: true }]);
    setAssistantSending(true);
    try {
      const res = await fetch(`${BASE}/api/home/intent`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q, niche, name: firstName }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.mode === "research") {
        setAssistantMessages((prev) => prev.filter((m) => !(m.role === "assistant" && m.pending)));
        navigate('/discover', { state: { q: data.topic || q } });
        return;
      }
      const answer = data.answer || (data.error ? `Sorry — I couldn't answer that (${data.error}).` : "Sorry — I couldn't answer that just now.");
      setAssistantMessages((prev) => {
        const next = prev.filter((m) => !(m.role === "assistant" && m.pending));
        next.push({ role: "assistant", text: answer });
        return next;
      });
    } catch (err) {
      setAssistantMessages((prev) => {
        const next = prev.filter((m) => !(m.role === "assistant" && m.pending));
        next.push({ role: "assistant", text: `Sorry — something went wrong: ${(err as Error).message}` });
        return next;
      });
    } finally {
      setAssistantSending(false);
    }
  }

  const CHIPS = [
    { emoji: "📈", label: t('home.chip_trending', { niche }), action: () => navigate('/discover', { state: { q: niche } }) },
    { emoji: "✏️", label: t('home.chip_script'), action: () => navigate('/scripts', { state: { topic: niche, niche } }) },
    { emoji: "👤", label: t('home.chip_competitor'), action: () => navigate(isIG ? '/instagram/analyzer' : '/youtube/analyzer') },
    { emoji: "📅", label: t('home.chip_plan'), action: () => navigate('/studio') },
  ];

  return (
    <div
      className={`theme-redesign ${theme} min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col items-center justify-center px-5 py-12`}
      data-platform={isIG ? undefined : "youtube"}
    >
      {/* BG blob */}
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none rounded-full bg-primary"
        style={{ filter: "blur(80px)" }} />

      <div className="w-full max-w-xl relative z-10 flex flex-col items-center gap-8">

        {/* Greeting */}
        <div className="text-center space-y-3">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="font-heading text-3xl md:text-4xl font-bold leading-tight text-foreground">
            {t('home.greeting_hey')} {firstName},<br />
            {t('home.greeting_welcome')}{' '}
            <span className="inline-block px-2 py-0.5 rounded-lg bg-primary/15 text-primary">
              {t('home.greeting_highlight')}
            </span>.
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
      </div>
    </div>
  );
}

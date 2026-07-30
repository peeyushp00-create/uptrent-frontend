import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Keyboard } from "lucide-react";

type NavShortcut = {
  key: string;
  label: string;
  path: string;
  platform?: "instagram" | "youtube";
};

const NAV_SHORTCUTS: NavShortcut[] = [
  { key: "h", label: "Home", path: "/home" },
  { key: "n", label: "News", path: "/news" },
  { key: "s", label: "Scripts", path: "/scripts", platform: "instagram" },
  { key: "s", label: "Scripts", path: "/youtube/script", platform: "youtube" },
  { key: "a", label: "Analyzer", path: "/instagram/analyzer", platform: "instagram" },
  { key: "a", label: "Analyzer", path: "/youtube/analyzer", platform: "youtube" },
  { key: "e", label: "Studio", path: "/studio", platform: "instagram" },
  { key: "o", label: "SEO", path: "/youtube/seo", platform: "youtube" },
  { key: "t", label: "Trending", path: "/youtube/trending", platform: "youtube" },
  { key: ",", label: "Settings", path: "/settings" },
];

// Display-only — the actual key handling for these lives in Contentstudio.tsx,
// scoped to the editor so it can reach video/undo state directly. Listed here
// only so "?" has one shared place to show every shortcut in the app.
const STUDIO_SHORTCUTS: { key: string; label: string }[] = [
  { key: "Space", label: "Play / pause" },
  { key: "←  →", label: "Seek 1s (Shift = 5s)" },
  { key: "Ctrl/⌘ Z", label: "Undo" },
  { key: "Ctrl/⌘ ⇧ Z", label: "Redo" },
  { key: "Ctrl/⌘ S", label: "Save project" },
];

const SEARCH_INPUT_ID = "home-search-input";

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export default function KeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );

  useEffect(() => {
    const handleCustom = (e: any) => setPlatform(e.detail);
    const handleStorage = () => {
      const p = localStorage.getItem("platform") as "instagram" | "youtube";
      if (p) setPlatform(p);
    };
    const handleOpenHelp = () => setHelpOpen(true);
    window.addEventListener("platformChanged", handleCustom);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("open-shortcuts-modal", handleOpenHelp);
    return () => {
      window.removeEventListener("platformChanged", handleCustom);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("open-shortcuts-modal", handleOpenHelp);
    };
  }, []);

  const isYoutubePath = location.pathname.startsWith("/youtube");
  const effectivePlatform = isYoutubePath ? "youtube" : platform;
  // Studio has its own key handling (space/arrows/save) and losing an edit to
  // an accidental "s" → Scripts nav jump would be a bad time, so the global
  // single-letter nav shortcuts sit out while the editor is open.
  const isStudio = location.pathname.startsWith("/studio");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      if (e.key === "Escape" && helpOpen) {
        setHelpOpen(false);
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }
      if (helpOpen || isStudio) return;

      if (e.key === "/") {
        e.preventDefault();
        const focusInput = () => document.getElementById(SEARCH_INPUT_ID)?.focus();
        if (location.pathname !== "/home") {
          navigate("/home");
          setTimeout(focusInput, 60);
        } else {
          focusInput();
        }
        return;
      }

      const shortcut = NAV_SHORTCUTS.find(
        (s) => s.key === e.key && (!s.platform || s.platform === effectivePlatform)
      );
      if (shortcut) {
        e.preventDefault();
        navigate(shortcut.path);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [helpOpen, effectivePlatform, isStudio, location.pathname, navigate]);

  if (!helpOpen) return null;

  const activeShortcuts = NAV_SHORTCUTS.filter((s) => !s.platform || s.platform === effectivePlatform);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center px-4 bg-black/60" onClick={() => setHelpOpen(false)}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl relative">
        <button onClick={() => setHelpOpen(false)} aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="size-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Keyboard shortcuts</h2>
        </div>

        {isStudio ? (
          <div className="space-y-1.5">
            {STUDIO_SHORTCUTS.map((s) => (
              <div key={s.key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <kbd className="px-2 py-0.5 rounded-md border border-border bg-secondary text-[11px] font-semibold text-foreground">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeShortcuts.map((s) => (
              <div key={`${s.path}-${s.key}`} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <kbd className="px-2 py-0.5 rounded-md border border-border bg-secondary text-[11px] font-semibold text-foreground">
                  {s.key}
                </kbd>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Focus search</span>
              <kbd className="px-2 py-0.5 rounded-md border border-border bg-secondary text-[11px] font-semibold text-foreground">/</kbd>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm mt-1.5 pt-1.5 border-t border-border">
          <span className="text-muted-foreground">Show this menu</span>
          <kbd className="px-2 py-0.5 rounded-md border border-border bg-secondary text-[11px] font-semibold text-foreground">?</kbd>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          {isStudio
            ? "Navigation shortcuts are paused while the editor is open — text fields still work normally."
            : "Shortcuts are disabled while typing in a text field."}
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Send, Mic, FileText, RefreshCw, Trash2, User, ChevronDown, Square, Plus, MessageSquare, X, Pencil } from "lucide-react";
import {
  generateScriptFromMessage, transcribeAudio,
  listConversations, getConversation, createConversation, appendMessage, renameConversation, deleteConversation,
  type ConversationSummary, type StoredChatMessage, type ConversationTurn,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";

// ── Design tokens ──────────────────────────────────────────────
// Light tokens: clean white surfaces, dark text.
// Dark tokens: near-black surfaces, off-white text.
// Single restrained accent in both, minimal borders instead of tinted boxes.
const LIGHT = {
  BG: "#f8f9fa",
  SURFACE: "#ffffff",
  SURFACE_RAISED: "#ffffff",
  BORDER: "#e1e3e4",
  TEXT: "#191c1d",
  TEXT_MUTED: "#757684",
  ACCENT: "#7C3AED",
  ACCENT_SOLID: "#7C3AED",
};

const DARK = {
  BG: "#0A0A0B",
  SURFACE: "#141416",
  SURFACE_RAISED: "#1A1A1D",
  BORDER: "#262629",
  TEXT: "#F5F5F4",
  TEXT_MUTED: "#8A8A8E",
  ACCENT: "#A78BFA",
  ACCENT_SOLID: "#7C3AED",
};

const CONTENT_TYPES = [
  { id: "auto", label: "Auto", prompt: "" },
  { id: "educational", label: "Educational", prompt: "Create an educational script that clearly explains the topic step by step, uses simple language, and ends with a key takeaway." },
  { id: "storytelling", label: "Storytelling", prompt: "Create a storytelling script with a personal narrative arc — setup, conflict, resolution. Make it emotional and relatable." },
  { id: "trending", label: "Trending React", prompt: "Create a reaction script to this trending topic. Start with the news, give a strong opinion, and ask audience what they think." },
  { id: "tips", label: "Tips & Tricks", prompt: "Create a tips and tricks script with numbered points. Each tip should be specific, actionable and immediately useful." },
  { id: "comedy", label: "Comedy/Skit", prompt: "Create a funny, relatable comedy script with Indian humor. Use sarcasm, relatable situations, and a punchline ending." },
  { id: "motivational", label: "Motivational", prompt: "Create a powerful motivational script that connects emotionally, uses a real story or example, and ends with a strong call to action." },
  { id: "opinion", label: "Opinion/Take", prompt: "Create an opinion script with a strong controversial or unique take on the topic. Be bold, back it up with reasoning, and invite debate." },
  { id: "review", label: "Product Review", prompt: "Create an honest product or service review script covering pros, cons, who it's for, and a clear recommendation." },
];

// ── Language options (must match backend's languageInstructions keys) ──
const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'hinglish', label: 'Hinglish' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'telugu', label: 'Telugu' },
  { id: 'malayalam', label: 'Malayalam' },
  { id: 'manglish', label: 'Manglish' },
];

function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getScriptWordCount(script: { hook?: string; body?: string; cta?: string }): number {
  return getWordCount([script.hook, script.body, script.cta].filter(Boolean).join(' '));
}

function formatReadTime(words: number): string {
  const seconds = Math.round(words / 2.5);
  return seconds < 60 ? `~${seconds}s read` : `~${(seconds / 60).toFixed(1)}min read`;
}


// `key` values must exactly match the backend's MODEL_REGISTRY keys.
interface ModelTier {
  key: string;
  label: string;
}

interface Provider {
  id: string;
  label: string;
  logo: string;
  tiers: ModelTier[];
}

const PROVIDERS: Provider[] = [
  {
    id: "claude",
    label: "Claude",
    logo: "/ai-logos/claude-logo.png",
    tiers: [
      { key: "claude-haiku", label: "Haiku" },
      { key: "claude-sonnet", label: "Sonnet" },
      { key: "claude-opus", label: "Opus" },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    logo: "/ai-logos/gemini-logo.png",
    tiers: [
      { key: "gemini-flash-lite", label: "Flash-Lite" },
      { key: "gemini-flash", label: "Flash" },
      { key: "gemini-pro", label: "Pro" },
    ],
  },
  {
    id: "groq",
    label: "Groq",
    logo: "/ai-logos/groq-logo.png",
    tiers: [
      { key: "groq-8b", label: "Llama 8B" },
      { key: "groq-70b", label: "Llama 70B" },
      { key: "groq-oss120", label: "GPT-OSS 120B" },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    logo: "/ai-logos/chatgpt-logo.png",
    tiers: [
      { key: "chatgpt", label: "GPT-4o mini" },
    ],
  },
];

const DEFAULT_MODEL_KEY = "claude-sonnet";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = seconds / 60;
  return mins % 1 === 0 ? `${mins}min` : `${mins.toFixed(1)}min`;
}

function findProviderAndTier(modelKey: string): { provider: Provider; tier: ModelTier } {
  for (const provider of PROVIDERS) {
    const tier = provider.tiers.find(t => t.key === modelKey);
    if (tier) return { provider, tier };
  }
  const fallbackProvider = PROVIDERS[0];
  return { provider: fallbackProvider, tier: fallbackProvider.tiers[1] }; // claude-sonnet
}

// ── One-time onboarding flow for first-time users ──────────────
const ONBOARDING_NICHES = [
  "Fitness", "Finance", "Cricket", "Bollywood", "Tech", "Food",
  "Travel", "Gaming", "Motivation", "Skincare", "Yoga", "Crypto",
  "Business", "Education", "Fashion", "Comedy",
];

interface OnboardingQuestion {
  key: 'job' | 'location' | 'platform' | 'niche' | 'audience';
  question: string;
  options: string[];
}

const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    key: 'job',
    question: "What do you do?",
    options: ["Student", "Working professional", "Freelancer / Creator", "Business owner", "Other"],
  },
  {
    key: 'location',
    question: "Where are you based?",
    options: ["North India", "South India", "East India", "West India", "Outside India"],
  },
  {
    key: 'platform',
    question: "Which platform are you creating for?",
    options: ["Instagram", "YouTube", "Both"],
  },
  {
    key: 'niche',
    question: "What's your content niche?",
    options: ONBOARDING_NICHES,
  },
  {
    key: 'audience',
    question: "Who's your target audience?",
    options: ["Gen Z", "Young professionals", "Parents / Family", "General / Everyone"],
  },
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  script?: { hook?: string; body?: string; cta?: string; duration_seconds?: number; content_type?: string; topic?: string; ai_model?: string };
  error?: boolean;
  timestamp: number;
}

// Converts a backend-stored message row into the shape the UI renders
function fromStoredMessage(m: StoredChatMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    text: m.text || undefined,
    script: m.script_json || undefined,
    error: m.is_error,
    timestamp: new Date(m.created_at).getTime(),
  };
}

export default function ScriptsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const T = theme === 'dark' ? DARK : LIGHT;
  const { BG, SURFACE, SURFACE_RAISED, BORDER, TEXT, TEXT_MUTED, ACCENT, ACCENT_SOLID } = T;

  const userNiches: string[] = user?.user_metadata?.niches || (user?.user_metadata?.niche ? [user.user_metadata.niche] : []);
  const userNiche = userNiches.join(', ') || '';
  const [userVoiceStyle, setUserVoiceStyle] = useState(user?.user_metadata?.voice_style || '');

  // Same fallback chain as the sidebar avatar: YouTube channel pic → Google account pic → initials
  const userAvatarUrl: string | null =
    user?.user_metadata?.youtube_channel?.channel_thumbnail ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const fresh = data?.user?.user_metadata?.voice_style || '';
      if (fresh) setUserVoiceStyle(fresh);
    });
  }, []);

  // ── Onboarding: only for users who've never completed it ──────
  const [onboardingDone, setOnboardingDone] = useState<boolean>(!!user?.user_metadata?.onboarding_completed);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string>>({});
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setOnboardingDone(!!data?.user?.user_metadata?.onboarding_completed);
    });
  }, []);

  const [onboardingPhase, setOnboardingPhase] = useState<'questions' | 'confirm'>('questions');

  const handleOnboardingAnswer = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const q = ONBOARDING_QUESTIONS[onboardingStep];
    const updatedAnswers = { ...onboardingAnswers, [q.key]: trimmed };
    setOnboardingAnswers(updatedAnswers);

    if (onboardingStep < ONBOARDING_QUESTIONS.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      // All 5 answered — show confirmation summary before saving
      setOnboardingPhase('confirm');
    }
  };

  const handleOnboardingRestart = () => {
    setOnboardingAnswers({});
    setOnboardingStep(0);
    setOnboardingPhase('questions');
  };

  const handleOnboardingConfirm = async () => {
    setSavingOnboarding(true);
    try {
      await supabase.auth.updateUser({
        data: {
          job: onboardingAnswers.job,
          location_region: onboardingAnswers.location,
          platform: onboardingAnswers.platform,
          niche: onboardingAnswers.niche,
          niches: [onboardingAnswers.niche],
          target_audience: onboardingAnswers.audience,
          onboarding_completed: true,
        },
      });
      setOnboardingDone(true);
    } catch {
      // even if saving fails, let them proceed rather than getting stuck
      setOnboardingDone(true);
    } finally {
      setSavingOnboarding(false);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [contentType, setContentType] = useState('auto');
  const [showContentTypeMenu, setShowContentTypeMenu] = useState(false);
  const [selectedModelKey, setSelectedModelKey] = useState(DEFAULT_MODEL_KEY);
  const [showAiModelMenu, setShowAiModelMenu] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | 'auto'>('auto');
  const [showDurationMenu, setShowDurationMenu] = useState(false);
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomDurationInput, setShowCustomDurationInput] = useState(false);

  // Language switcher — initialised from localStorage so it persists across sessions
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english'
  );
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Title editing from inside the chat header
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleEditValue, setTitleEditValue] = useState('');
  const [currentConvTitle, setCurrentConvTitle] = useState<string | null>(null);
  const [hoveredProviderId, setHoveredProviderId] = useState<string | null>(null);

  // ── Conversations (multi-chat) ─────────────────────────────────
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [showConversationPanel, setShowConversationPanel] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  // When handleSend creates a brand-new conversation mid-send, it sets this ref so the
  // conversationId-watching effect below skips its reload (handleSend already owns local
  // state for that turn) — otherwise the fetch races the save and wipes the user's message.
  const skipNextConversationLoadRef = useRef(false);

  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentTypeMenuRef = useRef<HTMLDivElement>(null);
  const aiModelMenuRef = useRef<HTMLDivElement>(null);
  const durationMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating]);

  // Fetch the conversation list once the user is known (for the slide-over panel)
  const refreshConversationList = () => {
    if (!user?.id) return;
    listConversations(user.id).then(res => setConversations(res.conversations)).catch(() => {});
  };

  // Cmd/Ctrl+K opens the History panel
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowConversationPanel(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  // Sync the current conversation's title into local state (for header display + editing)
  useEffect(() => {
    if (!conversationId) { setCurrentConvTitle(null); return; }
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) setCurrentConvTitle(conv.title);
  }, [conversationId, conversations]);

  useEffect(() => {
    refreshConversationList();
  }, [user?.id]);

  // Load a conversation's messages whenever the active conversationId changes
  useEffect(() => {
    if (skipNextConversationLoadRef.current) {
      skipNextConversationLoadRef.current = false;
      return;
    }
    if (!user?.id || !conversationId) {
      setMessages([]);
      return;
    }
    setLoadingConversation(true);
    getConversation(user.id, conversationId)
      .then(res => setMessages(res.messages.map(fromStoredMessage)))
      .catch(() => setMessages([]))
      .finally(() => setLoadingConversation(false));
  }, [conversationId, user?.id]);

  // Pre-fill the input box from navigation state (e.g. arriving from the news feed
  // via navigate('/scripts', { state: { prompt } })) — without auto-sending, so the
  // user can review/edit before hitting send.
  useEffect(() => {
    const incomingPrompt = (location.state as { prompt?: string } | null)?.prompt;
    if (incomingPrompt) {
      setInput(incomingPrompt);
      textareaRef.current?.focus();
    }
  }, [location.state]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contentTypeMenuRef.current && !contentTypeMenuRef.current.contains(e.target as Node)) setShowContentTypeMenu(false);
      if (aiModelMenuRef.current && !aiModelMenuRef.current.contains(e.target as Node)) { setShowAiModelMenu(false); setHoveredProviderId(null); }
      if (durationMenuRef.current && !durationMenuRef.current.contains(e.target as Node)) setShowDurationMenu(false);
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) setShowLanguageMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedContentType = CONTENT_TYPES.find(c => c.id === contentType) || CONTENT_TYPES[0];
  const { provider: selectedProvider, tier: selectedTier } = findProviderAndTier(selectedModelKey);

  const handleSend = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || generating) return;

    // During onboarding, typed text answers the current question instead of generating a script
    if (!onboardingDone) {
      if (onboardingPhase === 'questions' && onboardingStep < ONBOARDING_QUESTIONS.length) {
        setInput('');
        handleOnboardingAnswer(messageText);
      }
      return;
    }

    if (!user?.id) {
      const errorMsg: ChatMessage = { id: `${Date.now()}-e`, role: 'assistant', text: 'Please sign in to generate scripts.', error: true, timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    setInput('');
    setGenerating(true);

    // Optimistically show the user's message right away (real id swapped in once saved)
    const tempUserMsg: ChatMessage = { id: `temp-${Date.now()}`, role: 'user', text: messageText, timestamp: Date.now() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Ensure there's an active conversation to write into
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const { conversation } = await createConversation(user.id);
        activeConversationId = conversation.id;
        skipNextConversationLoadRef.current = true;
        setConversationId(conversation.id);
      }

      // Persist the user's message, then swap the optimistic temp id for the real saved one
      const { message: savedUserMsg } = await appendMessage(user.id, activeConversationId, { role: 'user', text: messageText });
      setMessages(prev => prev.map(m => m.id === tempUserMsg.id ? { ...m, id: savedUserMsg.id } : m));

      // Build conversation history (prior turns only, not the message we're about to send)
      // so the AI can see what it already asked/learned and avoid repeating questions.
      const conversationHistory: ConversationTurn[] = messages
        .filter(m => !m.error)
        .map(m => m.role === 'user'
          ? { role: 'user' as const, text: m.text }
          : m.script
            ? { role: 'assistant' as const, script: m.script }
            : { role: 'assistant' as const, question: m.text }
        );

      const userLanguage = selectedLanguage;
      const result = await generateScriptFromMessage(user.id, messageText, {
        niche: userNiche,
        language: userLanguage,
        voiceStyle: userVoiceStyle,
        contentType: selectedContentType.id !== 'auto' ? selectedContentType.label : undefined,
        contentTypePrompt: selectedContentType.id !== 'auto' ? selectedContentType.prompt : undefined,
        aiModel: selectedModelKey,
        duration: selectedDuration !== 'auto' ? selectedDuration : undefined,
        conversationHistory,
      });

      const assistantMsg: ChatMessage = result.needs_clarification
        ? { id: `${Date.now()}-a`, role: 'assistant', text: result.question, timestamp: Date.now() }
        : { id: `${Date.now()}-a`, role: 'assistant', script: result, timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMsg]);

      // Persist the assistant's reply, then refresh the sidebar (title/ordering may have changed)
      await appendMessage(
        user.id,
        activeConversationId,
        result.needs_clarification
          ? { role: 'assistant', text: result.question }
          : { role: 'assistant', script: result }
      );
      refreshConversationList();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `${Date.now()}-e`,
        role: 'assistant',
        text: 'Sorry, I could not generate that script. Please try again.',
        error: true,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      // Best-effort: still try to persist the error reply so the conversation history stays accurate
      if (conversationId || conversations.length === 0) {
        const cid = conversationId;
        if (cid) appendMessage(user.id, cid, { role: 'assistant', text: errorMsg.text, isError: true }).catch(() => {});
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize the textarea to fit its content (grows on multi-line input,
  // shrinks back down after send/clear), capped by max-h-32 in the className below.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const copyScript = (script: ChatMessage['script'], id: string) => {
    if (!script) return;
    const parts = [];
    if (script.hook) parts.push(`HOOK:\n${script.hook}`);
    if (script.body) parts.push(`BODY:\n${script.body}`);
    if (script.cta) parts.push(`CTA:\n${script.cta}`);
    navigator.clipboard.writeText(parts.join('\n\n'));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConfirmTitleEdit = async () => {
    setEditingTitle(false);
    if (!user?.id || !conversationId || !titleEditValue.trim()) return;
    try {
      await renameConversation(user.id, conversationId, titleEditValue.trim());
      setCurrentConvTitle(titleEditValue.trim());
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, title: titleEditValue.trim() } : c));
    } catch { /* leave title as-is if rename fails */ }
  };

  const handleNewChat = () => {    setConversationId(null);
    setMessages([]);
    setShowConversationPanel(false);
  };

  const handleSwitchConversation = (id: string) => {
    if (id === conversationId) { setShowConversationPanel(false); return; }
    setConversationId(id);
    setShowConversationPanel(false);
  };

  const handleDeleteConversation = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user?.id) return;
    try {
      await deleteConversation(user.id, id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (id === conversationId) {
        setConversationId(null);
        setMessages([]);
      }
    } catch {
      // leave the list as-is if deletion failed; user can retry
    }
  };

  const handleStartRename = (conv: ConversationSummary, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const handleConfirmRename = async (id: string) => {
    if (!user?.id || !renameValue.trim()) { setRenamingId(null); return; }
    try {
      await renameConversation(user.id, id, renameValue.trim());
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: renameValue.trim() } : c));
    } catch {
      // ignore — title just won't update locally
    } finally {
      setRenamingId(null);
    }
  };

  const findPrecedingUserText = (index: number) => {
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return messages[i].text || '';
    }
    return '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const userLanguage = selectedLanguage;
        setTranscribing(true);
        try {
          const { text } = await transcribeAudio(audioBlob, userLanguage);
          setInput(prev => (prev ? `${prev} ${text}` : text));
        } catch {
          // silently ignore — user can just type instead
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, color: TEXT }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 px-5 h-16 flex items-center justify-between shrink-0"
        style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-5 h-5 shrink-0" style={{ color: TEXT }} />
          {conversationId && currentConvTitle ? (
            editingTitle ? (
              <input
                autoFocus
                value={titleEditValue}
                onChange={e => setTitleEditValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleConfirmTitleEdit(); if (e.key === 'Escape') setEditingTitle(false); }}
                onBlur={handleConfirmTitleEdit}
                className="font-semibold text-base tracking-tight bg-transparent outline-none border-b min-w-0 w-48"
                style={{ color: TEXT, borderColor: ACCENT, fontFamily: 'Inter, sans-serif' }}
              />
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="font-semibold text-base tracking-tight truncate max-w-[160px]" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>
                  {currentConvTitle}
                </h1>
                <button onClick={() => { setTitleEditValue(currentConvTitle); setEditingTitle(true); }}
                  style={{ color: TEXT_MUTED }} className="shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          ) : (
            <h1 className="font-semibold text-lg tracking-tight" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>
              Script Generator
            </h1>
          )}
          {userVoiceStyle && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
              style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
              <Mic className="w-3 h-3" /> Voice
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowConversationPanel(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: TEXT_MUTED }}
            onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = TEXT_MUTED)}>
            <MessageSquare className="w-3.5 h-3.5" /> History <span className="opacity-50 text-[10px]">⌘K</span>
          </button>
          <button onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ border: `1px solid ${BORDER}`, color: TEXT }}>
            <Plus className="w-3.5 h-3.5" /> New chat
          </button>
        </div>
      </header>

      {/* ── Conversation slide-over panel ── */}
      <AnimatePresence>
        {showConversationPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConversationPanel(false)}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] flex flex-col"
              style={{ background: SURFACE, borderRight: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between px-4 h-16 shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <p className="font-semibold text-sm" style={{ color: TEXT }}>Your chats</p>
                <button onClick={() => setShowConversationPanel(false)} style={{ color: TEXT_MUTED }}>
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="p-3">
                <button onClick={handleNewChat}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: `1px solid ${BORDER}`, color: TEXT }}>
                  <Plus className="w-4 h-4" /> New chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {conversations.length === 0 && (
                  <p className="text-xs text-center mt-8" style={{ color: TEXT_MUTED }}>No past chats yet.</p>
                )}
                {conversations.map(conv => (
                  <div key={conv.id}
                    onClick={() => handleSwitchConversation(conv.id)}
                    className="group flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
                    style={{ background: conv.id === conversationId ? (theme === 'dark' ? '#1A1A1D' : '#f3f4f5') : 'transparent' }}>
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: TEXT_MUTED }} />
                    {renamingId === conv.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => { if (e.key === 'Enter') handleConfirmRename(conv.id); if (e.key === 'Escape') setRenamingId(null); }}
                        onBlur={() => handleConfirmRename(conv.id)}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: TEXT, borderBottom: `1px solid ${ACCENT}` }}
                      />
                    ) : (
                      <span className="flex-1 truncate" style={{ color: conv.id === conversationId ? TEXT : TEXT_MUTED }}>{conv.title}</span>
                    )}
                    <button onClick={e => handleStartRename(conv, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: TEXT_MUTED }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => handleDeleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: TEXT_MUTED }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Message Thread ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6">

          {loadingConversation ? (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                <img src="/logo.png" alt="SocialRum" className="w-6 h-6 object-contain rounded-full" />
              </motion.div>
            </div>
          ) : !onboardingDone ? (
            <div className="flex flex-col gap-5">
              {/* Intro bubble */}
              <div className="flex justify-start">
                <div className="max-w-[85%] flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    <img src="/logo.png" alt="SocialRum" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm" style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER}` }}>
                    Before we make your first video, a few quick questions to personalize your scripts.
                  </div>
                </div>
              </div>

              {/* Previously answered questions, shown as completed exchanges */}
              {ONBOARDING_QUESTIONS.slice(0, onboardingStep).map(q => (
                <div key={q.key} className="flex flex-col gap-3">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                        <img src="/logo.png" alt="SocialRum" className="w-full h-full object-cover" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm" style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER}` }}>
                        {q.question}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm" style={{ background: ACCENT_SOLID, color: '#ffffff' }}>
                      {onboardingAnswers[q.key]}
                    </div>
                  </div>
                </div>
              ))}

              {/* Current question with tappable options */}
              {onboardingPhase === 'questions' && onboardingStep < ONBOARDING_QUESTIONS.length && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                        <img src="/logo.png" alt="SocialRum" className="w-full h-full object-cover" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm" style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER}` }}>
                        <p>{ONBOARDING_QUESTIONS[onboardingStep].question}</p>
                        <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>Select an option below, or type your own answer.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-9">
                    {ONBOARDING_QUESTIONS[onboardingStep].options.map(opt => (
                      <button key={opt} onClick={() => handleOnboardingAnswer(opt)}
                        className="px-3.5 py-2 rounded-full text-xs font-medium transition-colors"
                        style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = TEXT; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_MUTED; }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmation summary before saving */}
              {onboardingPhase === 'confirm' && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                        <img src="/logo.png" alt="SocialRum" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 rounded-2xl rounded-tl-sm overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                        <div className="px-4 py-2.5 text-sm" style={{ color: TEXT, borderBottom: `1px solid ${BORDER}` }}>
                          Here's what I've got — is this correct?
                        </div>
                        <div className="p-4 space-y-2.5">
                          {ONBOARDING_QUESTIONS.map(q => (
                            <div key={q.key} className="flex items-center justify-between text-sm">
                              <span style={{ color: TEXT_MUTED }}>{q.question}</span>
                              <span className="font-medium" style={{ color: TEXT }}>{onboardingAnswers[q.key]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pl-9">
                    <button onClick={handleOnboardingConfirm} disabled={savingOnboarding}
                      className="px-4 py-2 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
                      style={{ background: ACCENT_SOLID, color: '#ffffff' }}>
                      Looks good
                    </button>
                    <button onClick={handleOnboardingRestart} disabled={savingOnboarding}
                      className="px-4 py-2 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
                      style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                      Start over
                    </button>
                  </div>
                  {savingOnboarding && (
                    <p className="text-xs pl-9" style={{ color: TEXT_MUTED }}>Saving your preferences...</p>
                  )}
                </div>
              )}
            </div>
          ) : messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                <img src="/logo.png" alt="SocialRum" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-lg" style={{ color: TEXT }}>What script do you want to create?</p>
                <p className="text-sm mt-1.5" style={{ color: TEXT_MUTED }}>Describe it in your own words — topic, vibe, length, anything.</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {msg.role === 'user' ? (
                <div className="max-w-[80%] flex items-start gap-2.5 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    {userAvatarUrl && !avatarError ? (
                      <img src={userAvatarUrl} alt="You" className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
                    ) : (
                      <User className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
                    )}
                  </div>
                  <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm"
                    style={{ background: ACCENT_SOLID, color: '#ffffff' }}>
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%] flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    <img src="/logo.png" alt="SocialRum" className="w-full h-full object-cover" />
                  </div>

                  {msg.error ? (
                    <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm"
                      style={theme === 'dark'
                        ? { background: '#241616', color: '#F5A3A3', border: '1px solid #3A2222' }
                        : { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                      {msg.text}
                    </div>
                  ) : msg.script ? (
                    <div className="flex-1 rounded-2xl rounded-tl-sm overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                      {/* Script meta header */}
                      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <div className="flex items-center gap-2 flex-wrap">
                          {msg.script.content_type && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
                              style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                              {msg.script.content_type}
                            </span>
                          )}
                          {msg.script.duration_seconds && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
                              style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                              {formatDuration(msg.script.duration_seconds)}
                            </span>
                          )}
                          {(msg.script.hook || msg.script.body || msg.script.cta) && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
                              style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                              {formatReadTime(getScriptWordCount(msg.script))}
                            </span>
                          )}
                          {msg.script.ai_model && (() => {
                            const { provider, tier } = findProviderAndTier(msg.script.ai_model);
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
                                style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                                {provider.label} {tier.label}
                              </span>
                            );
                          })()}
                        </div>
                        <button onClick={() => copyScript(msg.script, msg.id)}
                          className="flex items-center gap-1 text-xs font-medium transition-colors"
                          style={{ color: copied === msg.id ? (theme === 'dark' ? '#4ADE80' : '#16a34a') : TEXT_MUTED }}>
                          {copied === msg.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </button>
                      </div>

                      {/* Script body */}
                      <div className="p-4 space-y-3">
                        {msg.script.hook && (
                          <div className="rounded-xl p-3.5" style={{ border: `1px solid ${BORDER}` }}>
                            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Hook</span>
                            <p className="text-sm leading-relaxed mt-1.5" style={{ color: TEXT }}>{msg.script.hook}</p>
                          </div>
                        )}
                        {msg.script.body && (
                          <div className="rounded-xl p-3.5" style={{ border: `1px solid ${BORDER}` }}>
                            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Body</span>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed mt-1.5" style={{ color: TEXT }}>{msg.script.body}</p>
                          </div>
                        )}
                        {msg.script.cta && (
                          <div className="rounded-xl p-3.5" style={{ border: `1px solid ${BORDER}` }}>
                            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Call to action</span>
                            <p className="text-sm leading-relaxed mt-1.5" style={{ color: TEXT }}>{msg.script.cta}</p>
                          </div>
                        )}
                      </div>

                      {/* Regenerate */}
                      <div className="px-4 pb-4">
                        <button onClick={() => handleSend(findPrecedingUserText(idx))} disabled={generating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                          style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                          <RefreshCw className="w-3 h-3" /> Regenerate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm"
                      style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER}` }}>
                      {msg.text}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {/* Generating indicator */}
          <AnimatePresence>
            {generating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                      <img src="/logo.png" alt="SocialRum" className="w-full h-full object-cover" />
                    </motion.div>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                    Writing your script with {selectedProvider.label} {selectedTier.label}...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input Bar ── */}
      <div className="sticky bottom-0 px-5 py-4 shrink-0" style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-2xl mx-auto">

          {/* Toolbar: content type + AI model pills */}
          <div className="flex items-center gap-2 mb-2.5">
            {/* Content type dropdown */}
            <div className="relative" ref={contentTypeMenuRef}>
              <button onClick={() => { setShowContentTypeMenu(prev => !prev); setShowAiModelMenu(false); setShowDurationMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                {selectedContentType.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showContentTypeMenu && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 mb-2 w-56 rounded-2xl overflow-hidden z-50 max-h-72 overflow-y-auto"
                    style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}`, boxShadow: theme === 'dark' ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)' }}>
                    {CONTENT_TYPES.map(c => (
                      <button key={c.id} onClick={() => { setContentType(c.id); setShowContentTypeMenu(false); }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-left transition-colors"
                        style={{ color: contentType === c.id ? TEXT : TEXT_MUTED, background: contentType === c.id ? SURFACE : 'transparent' }}>
                        {c.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Duration dropdown */}
            <div className="relative" ref={durationMenuRef}>
              <button onClick={() => { setShowDurationMenu(prev => !prev); setShowContentTypeMenu(false); setShowAiModelMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                {selectedDuration === 'auto' ? 'Duration: Auto' : formatDuration(selectedDuration)}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showDurationMenu && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 mb-2 w-48 rounded-2xl overflow-hidden z-50"
                    style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}`, boxShadow: theme === 'dark' ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)' }}>
                    {(['auto', 15, 30, 60, 90, 120] as const).map(d => (
                      <button key={d} onClick={() => { setSelectedDuration(d); setShowCustomDurationInput(false); setShowDurationMenu(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors"
                        style={{ color: selectedDuration === d && !showCustomDurationInput ? TEXT : TEXT_MUTED, background: selectedDuration === d && !showCustomDurationInput ? SURFACE : 'transparent' }}>
                        {d === 'auto' ? 'Auto (AI decides)' : formatDuration(d)}
                        {selectedDuration === d && !showCustomDurationInput && <Check className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
                      </button>
                    ))}
                    <button onClick={() => { setShowCustomDurationInput(true); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ borderTop: `1px solid ${BORDER}`, color: showCustomDurationInput ? TEXT : TEXT_MUTED, background: showCustomDurationInput ? SURFACE : 'transparent' }}>
                      Custom
                      {showCustomDurationInput && <Check className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
                    </button>
                    {showCustomDurationInput && (
                      <div className="px-4 pb-3 pt-1 flex items-center gap-2">
                        <input
                          autoFocus
                          type="number"
                          min={5} max={600}
                          value={customDuration}
                          onChange={e => {
                            setCustomDuration(e.target.value);
                            const n = parseInt(e.target.value, 10);
                            if (!isNaN(n) && n >= 5) setSelectedDuration(Math.min(n, 600));
                          }}
                          onKeyDown={e => { if (e.key === 'Enter') setShowDurationMenu(false); }}
                          placeholder="e.g. 45"
                          className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                          style={{ background: BORDER, color: TEXT, border: `1px solid ${BORDER}` }}
                        />
                        <span className="text-xs" style={{ color: TEXT_MUTED }}>sec</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI model dropdown — provider, then tier */}
            <div className="relative" ref={aiModelMenuRef}>
              <button onClick={() => { setShowAiModelMenu(prev => !prev); setShowContentTypeMenu(false); setShowDurationMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                <img src={selectedProvider.logo} alt={selectedProvider.label} className="w-3.5 h-3.5 object-contain rounded-full" />
                {selectedProvider.label} {selectedTier.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showAiModelMenu && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
                    style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}`, boxShadow: theme === 'dark' ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)' }}>
                    {PROVIDERS.map(p => {
                      const isExpanded = hoveredProviderId === p.id || selectedProvider.id === p.id;
                      return (
                        <div key={p.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <button
                            onClick={() => setHoveredProviderId(prev => prev === p.id ? null : p.id)}
                            onMouseEnter={() => setHoveredProviderId(p.id)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors"
                            style={{ background: selectedProvider.id === p.id ? SURFACE : 'transparent' }}>
                            <div className="flex items-center gap-2.5">
                              <img src={p.logo} alt={p.label} className="w-5 h-5 object-contain rounded-full shrink-0" />
                              <p style={{ color: selectedProvider.id === p.id ? TEXT : TEXT_MUTED }}>{p.label}</p>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ color: TEXT_MUTED, transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden">
                                {p.tiers.map(tier => (
                                  <button key={tier.key}
                                    onClick={() => { setSelectedModelKey(tier.key); setShowAiModelMenu(false); setHoveredProviderId(null); }}
                                    className="w-full flex items-center justify-between pl-12 pr-4 py-2 text-sm text-left transition-colors"
                                    style={{ background: selectedModelKey === tier.key ? SURFACE : 'transparent' }}>
                                    <p style={{ color: selectedModelKey === tier.key ? TEXT : TEXT_MUTED }}>{tier.label}</p>
                                    {selectedModelKey === tier.key && <Check className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language switcher */}
            <div className="relative" ref={languageMenuRef}>
              <button onClick={() => { setShowLanguageMenu(prev => !prev); setShowContentTypeMenu(false); setShowAiModelMenu(false); setShowDurationMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                {LANGUAGES.find(l => l.id === selectedLanguage)?.label || 'English'}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 mb-2 w-44 rounded-2xl overflow-hidden z-50"
                    style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}`, boxShadow: theme === 'dark' ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)' }}>
                    {LANGUAGES.map(l => (
                      <button key={l.id} onClick={() => {
                        setSelectedLanguage(l.id);
                        localStorage.setItem('userLanguage', l.id);
                        setShowLanguageMenu(false);
                      }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors"
                        style={{ color: selectedLanguage === l.id ? TEXT : TEXT_MUTED, background: selectedLanguage === l.id ? SURFACE : 'transparent' }}>
                        {l.label}
                        {selectedLanguage === l.id && <Check className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Input row */}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                transcribing ? "Transcribing..." :
                !onboardingDone ? "Type your answer..." :
                "Describe the script you want..."
              }
              rows={1}
              disabled={transcribing}
              className="flex-1 resize-none px-4 py-3 rounded-2xl outline-none text-sm transition-all max-h-32 overflow-y-auto disabled:opacity-60"
              style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}`, color: TEXT, minHeight: '48px' }}
              onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
              onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
            />

            {/* Mic button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={transcribing}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-50"
              style={isRecording
                ? (theme === 'dark'
                    ? { background: '#3A1F1F', color: '#F5A3A3', border: '1px solid #5A2A2A' }
                    : { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' })
                : { background: SURFACE_RAISED, color: TEXT_MUTED, border: `1px solid ${BORDER}` }}>
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4.5 h-4.5" />}
            </button>

            <button onClick={() => handleSend()} disabled={generating || !input.trim() || transcribing}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-all hover:shadow-md"
              style={{ background: ACCENT_SOLID, color: '#ffffff' }}>
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="text-[10px] text-center mt-2.5" style={{ color: TEXT_MUTED }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
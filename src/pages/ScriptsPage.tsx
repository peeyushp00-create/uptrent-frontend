import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Send, Mic, FileText, RefreshCw, Trash2, User, ChevronDown, Square } from "lucide-react";
import { generateScriptFromMessage, transcribeAudio } from "@/lib/api";
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

const SUGGESTIONS = [
  "Write a 30s fitness reel about home workouts",
  "Funny script about Bollywood movie tropes",
  "Educational reel explaining mutual funds",
  "Trending reaction script about IPL 2026",
];

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

const AI_MODELS = [
  { id: "claude", label: "Claude", description: "Best quality, default" },
  { id: "gemini", label: "Gemini", description: "Fast & free" },
  { id: "chatgpt", label: "ChatGPT", description: "GPT-4o mini" },
  { id: "groq", label: "Groq", description: "Llama 3.3, fastest" },
];

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

function loadHistory(): ChatMessage[] {
  try {
    return JSON.parse(localStorage.getItem("script_chat_history") || "[]");
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]) {
  localStorage.setItem("script_chat_history", JSON.stringify(messages.slice(-50)));
}

export default function ScriptsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const T = theme === 'dark' ? DARK : LIGHT;
  const { BG, SURFACE, SURFACE_RAISED, BORDER, TEXT, TEXT_MUTED, ACCENT, ACCENT_SOLID } = T;

  const userNiches: string[] = user?.user_metadata?.niches || (user?.user_metadata?.niche ? [user.user_metadata.niche] : []);
  const userNiche = userNiches.join(', ') || '';
  const [userVoiceStyle, setUserVoiceStyle] = useState(user?.user_metadata?.voice_style || '');

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

  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [contentType, setContentType] = useState('auto');
  const [showContentTypeMenu, setShowContentTypeMenu] = useState(false);
  const [aiModel, setAiModel] = useState('claude');
  const [showAiModelMenu, setShowAiModelMenu] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentTypeMenuRef = useRef<HTMLDivElement>(null);
  const aiModelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contentTypeMenuRef.current && !contentTypeMenuRef.current.contains(e.target as Node)) setShowContentTypeMenu(false);
      if (aiModelMenuRef.current && !aiModelMenuRef.current.contains(e.target as Node)) setShowAiModelMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedContentType = CONTENT_TYPES.find(c => c.id === contentType) || CONTENT_TYPES[0];
  const selectedAiModel = AI_MODELS.find(m => m.id === aiModel) || AI_MODELS[0];

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

    const userLanguage = localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english';
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: 'user', text: messageText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setGenerating(true);

    try {
      const result = await generateScriptFromMessage(messageText, {
        niche: userNiche,
        language: userLanguage,
        voiceStyle: userVoiceStyle,
        contentType: selectedContentType.id !== 'auto' ? selectedContentType.label : undefined,
        contentTypePrompt: selectedContentType.id !== 'auto' ? selectedContentType.prompt : undefined,
        aiModel: selectedAiModel.id,
      });
      const assistantMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: 'assistant',
        script: result,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `${Date.now()}-e`,
        role: 'assistant',
        text: 'Sorry, I could not generate that script. Please try again.',
        error: true,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
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

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('script_chat_history');
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
        const userLanguage = localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english';
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
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" style={{ color: TEXT }} />
          <h1 className="font-semibold text-lg tracking-tight" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>
            Script Generator
          </h1>
          {userVoiceStyle && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
              <Mic className="w-3 h-3" /> Voice
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: TEXT_MUTED }}
            onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = TEXT_MUTED)}>
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </header>

      {/* ── Message Thread ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6">

          {!onboardingDone ? (
            <div className="flex flex-col gap-5">
              {/* Intro bubble */}
              <div className="flex justify-start">
                <div className="max-w-[85%] flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ border: `1px solid ${BORDER}` }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
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
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ border: `1px solid ${BORDER}` }}>
                        <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
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
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ border: `1px solid ${BORDER}` }}>
                        <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm" style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER}` }}>
                        {ONBOARDING_QUESTIONS[onboardingStep].question}
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
                  <p className="text-xs pl-9" style={{ color: TEXT_MUTED }}>
                    Or type your own answer below.
                  </p>
                </div>
              )}

              {/* Confirmation summary before saving */}
              {onboardingPhase === 'confirm' && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ border: `1px solid ${BORDER}` }}>
                        <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
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
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ border: `1px solid ${BORDER}` }}>
                <Sparkles className="w-5 h-5" style={{ color: TEXT_MUTED }} />
              </div>
              <div>
                <p className="font-medium text-lg" style={{ color: TEXT }}>What script do you want to create?</p>
                <p className="text-sm mt-1.5" style={{ color: TEXT_MUTED }}>Describe it in your own words — topic, vibe, length, anything.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="px-3.5 py-2 rounded-full text-xs font-medium transition-colors text-left"
                    style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = TEXT; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_MUTED; }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {msg.role === 'user' ? (
                <div className="max-w-[80%] flex items-start gap-2.5 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ border: `1px solid ${BORDER}` }}>
                    <User className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
                  </div>
                  <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm"
                    style={{ background: ACCENT_SOLID, color: '#ffffff' }}>
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%] flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ border: `1px solid ${BORDER}` }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
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
                              {msg.script.duration_seconds}s
                            </span>
                          )}
                          {msg.script.ai_model && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide capitalize"
                              style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                              {msg.script.ai_model}
                            </span>
                          )}
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
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ border: `1px solid ${BORDER}` }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                    </motion.div>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                    Writing your script with {selectedAiModel.label}...
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
              <button onClick={() => { setShowContentTypeMenu(prev => !prev); setShowAiModelMenu(false); }}
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

            {/* AI model dropdown */}
            <div className="relative" ref={aiModelMenuRef}>
              <button onClick={() => { setShowAiModelMenu(prev => !prev); setShowContentTypeMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                <Sparkles className="w-3 h-3" style={{ color: ACCENT }} />
                {selectedAiModel.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showAiModelMenu && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 mb-2 w-60 rounded-2xl overflow-hidden z-50"
                    style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}`, boxShadow: theme === 'dark' ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)' }}>
                    {AI_MODELS.map(m => (
                      <button key={m.id} onClick={() => { setAiModel(m.id); setShowAiModelMenu(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors"
                        style={{ background: aiModel === m.id ? SURFACE : 'transparent' }}>
                        <div>
                          <p style={{ color: aiModel === m.id ? TEXT : TEXT_MUTED }}>{m.label}</p>
                          <p className="text-[10px]" style={{ color: TEXT_MUTED }}>{m.description}</p>
                        </div>
                        {aiModel === m.id && <Check className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
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
              className="flex-1 resize-none px-4 py-3 rounded-2xl outline-none text-sm transition-all max-h-32 disabled:opacity-60"
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
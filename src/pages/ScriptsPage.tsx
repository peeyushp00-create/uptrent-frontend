import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Send, Mic, FileText, RefreshCw, Trash2, User, ChevronDown, Square } from "lucide-react";
import { generateScriptFromMessage, transcribeAudio } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const PRIMARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #7C3AED)";
const PRIMARY_CONTAINER = "#ede9fe";

const SUGGESTIONS = [
  "Write a 30s fitness reel about home workouts",
  "Funny script about Bollywood movie tropes",
  "Educational reel explaining mutual funds",
  "Trending reaction script about IPL 2026",
];

const CONTENT_TYPES = [
  { id: "auto", label: "Auto", emoji: "✨", prompt: "" },
  { id: "educational", label: "Educational", emoji: "🎓", prompt: "Create an educational script that clearly explains the topic step by step, uses simple language, and ends with a key takeaway." },
  { id: "storytelling", label: "Storytelling", emoji: "📖", prompt: "Create a storytelling script with a personal narrative arc — setup, conflict, resolution. Make it emotional and relatable." },
  { id: "trending", label: "Trending React", emoji: "🔥", prompt: "Create a reaction script to this trending topic. Start with the news, give a strong opinion, and ask audience what they think." },
  { id: "tips", label: "Tips & Tricks", emoji: "💡", prompt: "Create a tips and tricks script with numbered points. Each tip should be specific, actionable and immediately useful." },
  { id: "comedy", label: "Comedy/Skit", emoji: "🎭", prompt: "Create a funny, relatable comedy script with Indian humor. Use sarcasm, relatable situations, and a punchline ending." },
  { id: "motivational", label: "Motivational", emoji: "💪", prompt: "Create a powerful motivational script that connects emotionally, uses a real story or example, and ends with a strong call to action." },
  { id: "opinion", label: "Opinion/Take", emoji: "📊", prompt: "Create an opinion script with a strong controversial or unique take on the topic. Be bold, back it up with reasoning, and invite debate." },
  { id: "review", label: "Product Review", emoji: "🛒", prompt: "Create an honest product or service review script covering pros, cons, who it's for, and a clear recommendation." },
];

const AI_MODELS = [
  { id: "claude", label: "Claude", description: "Best quality, default" },
  { id: "gemini", label: "Gemini", description: "Fast & free" },
  { id: "chatgpt", label: "ChatGPT", description: "GPT-4o mini" },
  { id: "groq", label: "Groq", description: "Llama 3.3, fastest" },
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
  const userNiches: string[] = user?.user_metadata?.niches || (user?.user_metadata?.niche ? [user.user_metadata.niche] : []);
  const userNiche = userNiches.join(', ') || '';
  const [userVoiceStyle, setUserVoiceStyle] = useState(user?.user_metadata?.voice_style || '');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const fresh = data?.user?.user_metadata?.voice_style || '';
      if (fresh) setUserVoiceStyle(fresh);
    });
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-gray-900">

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" style={{ color: PRIMARY }} />
          <h1 className="font-bold text-xl text-[#7C3AED] dark:text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Script Generator
          </h1>
          {userVoiceStyle && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
              <Mic className="w-3 h-3" /> Voice
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#757684] hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear chat
          </button>
        )}
      </header>

      {/* ── Message Thread ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-5">

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: PRIMARY_CONTAINER }}>
                <Sparkles className="w-7 h-7" style={{ color: PRIMARY }} />
              </div>
              <div>
                <p className="font-bold text-lg text-[#191c1d] dark:text-white">What script do you want to create?</p>
                <p className="text-sm text-[#757684] mt-1">Just describe it in your own words — topic, vibe, length, anything.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="px-3 py-2 rounded-full text-xs font-medium border border-[#c5c5d4] text-[#454652] dark:text-gray-300 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors text-left">
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
                <div className="max-w-[80%] flex items-start gap-2 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: PRIMARY_GRAD }}>
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white" style={{ background: PRIMARY_GRAD }}>
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%] flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: PRIMARY_CONTAINER }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                  </div>

                  {msg.error ? (
                    <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm bg-red-50 text-red-600 border border-red-200">
                      {msg.text}
                    </div>
                  ) : msg.script ? (
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm border border-[#e1e3e4] dark:border-gray-700 overflow-hidden">
                      {/* Script meta header */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e1e3e4] dark:border-gray-700 bg-[#fafafa] dark:bg-gray-900/40">
                        <div className="flex items-center gap-2 flex-wrap">
                          {msg.script.content_type && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: PRIMARY_GRAD }}>
                              {msg.script.content_type}
                            </span>
                          )}
                          {msg.script.duration_seconds && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e7e8e9] text-[#454652]">
                              {msg.script.duration_seconds}s
                            </span>
                          )}
                          {msg.script.ai_model && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e7e8e9] text-[#454652] capitalize">
                              {msg.script.ai_model}
                            </span>
                          )}
                        </div>
                        <button onClick={() => copyScript(msg.script, msg.id)}
                          className="flex items-center gap-1 text-xs font-semibold" style={{ color: PRIMARY }}>
                          {copied === msg.id ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </button>
                      </div>

                      {/* Script body */}
                      <div className="p-4 space-y-3">
                        {msg.script.hook && (
                          <div className="rounded-xl p-3" style={{ background: '#ede9fe', border: `1px solid ${PRIMARY}30` }}>
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PRIMARY }}>🎯 Hook</span>
                            <p className="text-sm text-[#191c1d] dark:text-white leading-relaxed mt-1">{msg.script.hook}</p>
                          </div>
                        )}
                        {msg.script.body && (
                          <div className="rounded-xl p-3 border border-[#e1e3e4] dark:border-gray-600 bg-[#f8f9fa] dark:bg-gray-700">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#757684]">📝 Body</span>
                            <p className="text-sm text-[#454652] dark:text-gray-200 whitespace-pre-wrap leading-relaxed mt-1">{msg.script.body}</p>
                          </div>
                        )}
                        {msg.script.cta && (
                          <div className="rounded-xl p-3" style={{ background: '#e8f5e9', border: '1px solid #a5d6a7' }}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">🚀 CTA</span>
                            <p className="text-sm text-green-900 leading-relaxed mt-1">{msg.script.cta}</p>
                          </div>
                        )}
                      </div>

                      {/* Regenerate */}
                      <div className="px-4 pb-3">
                        <button onClick={() => handleSend(findPrecedingUserText(idx))} disabled={generating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c5c5d4] text-xs font-semibold text-[#454652] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors disabled:opacity-50">
                          <RefreshCw className="w-3 h-3" /> Regenerate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-[#e1e3e4] dark:border-gray-700 text-[#191c1d] dark:text-white">
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
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: PRIMARY_CONTAINER }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                    </motion.div>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-[#e1e3e4] dark:border-gray-700 text-[#757684]">
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
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-[#e1e3e4] dark:border-gray-700 px-5 py-4 shrink-0">
        <div className="max-w-2xl mx-auto">

          {/* Toolbar: content type + AI model pills */}
          <div className="flex items-center gap-2 mb-2.5">
            {/* Content type dropdown */}
            <div className="relative" ref={contentTypeMenuRef}>
              <button onClick={() => { setShowContentTypeMenu(prev => !prev); setShowAiModelMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#c5c5d4] dark:border-gray-600 text-[#454652] dark:text-gray-300 hover:border-[#7C3AED] transition-colors">
                <span>{selectedContentType.emoji}</span>
                {selectedContentType.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showContentTypeMenu && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 border border-[#e1e3e4] dark:border-gray-600 rounded-2xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                    {CONTENT_TYPES.map(c => (
                      <button key={c.id} onClick={() => { setContentType(c.id); setShowContentTypeMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-[#f3f4f5] dark:hover:bg-gray-700 transition-colors"
                        style={contentType === c.id ? { background: PRIMARY_CONTAINER, color: PRIMARY, fontWeight: 600 } : { color: '#454652' }}>
                        <span>{c.emoji}</span> {c.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI model dropdown */}
            <div className="relative" ref={aiModelMenuRef}>
              <button onClick={() => { setShowAiModelMenu(prev => !prev); setShowContentTypeMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#c5c5d4] dark:border-gray-600 text-[#454652] dark:text-gray-300 hover:border-[#7C3AED] transition-colors">
                <Sparkles className="w-3 h-3" style={{ color: PRIMARY }} />
                {selectedAiModel.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showAiModelMenu && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 mb-2 w-60 bg-white dark:bg-gray-800 border border-[#e1e3e4] dark:border-gray-600 rounded-2xl shadow-xl overflow-hidden z-50">
                    {AI_MODELS.map(m => (
                      <button key={m.id} onClick={() => { setAiModel(m.id); setShowAiModelMenu(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-[#f3f4f5] dark:hover:bg-gray-700 transition-colors">
                        <div>
                          <p style={aiModel === m.id ? { color: PRIMARY, fontWeight: 600 } : { color: '#191c1d' }} className="dark:text-white">{m.label}</p>
                          <p className="text-[10px] text-[#757684]">{m.description}</p>
                        </div>
                        {aiModel === m.id && <Check className="w-3.5 h-3.5" style={{ color: PRIMARY }} />}
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
              placeholder={transcribing ? "Transcribing..." : "Describe the script you want... (e.g. 45s funny reel about gym fails)"}
              rows={1}
              disabled={transcribing}
              className="flex-1 resize-none px-4 py-3 rounded-2xl border border-[#c5c5d4] bg-[#f8f9fa] dark:bg-gray-800 dark:border-gray-600 text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none text-sm transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 max-h-32 disabled:opacity-60"
              style={{ minHeight: '48px' }}
            />

            {/* Mic button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={transcribing}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-50"
              style={isRecording
                ? { background: '#ef4444', color: '#fff' }
                : { background: PRIMARY_CONTAINER, color: PRIMARY }}>
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4.5 h-4.5" />}
            </button>

            <button onClick={() => handleSend()} disabled={generating || !input.trim() || transcribing}
              className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all hover:shadow-lg"
              style={{ background: PRIMARY_GRAD }}>
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="text-[10px] text-[#757684] text-center mt-2">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
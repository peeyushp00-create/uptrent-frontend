import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, User, Target, Globe, Palette, Save, Loader2, Check,
  Mic, MicOff, MessageSquare, Star, Send, ThumbsUp, Zap, Bug, Lightbulb
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeVoiceStyle as analyzeVoiceStyleRequest } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const NICHES = [
  "Finance", "Fitness", "Motivation", "Tech",
  "Food", "Travel", "Business", "Education",
  "Fashion", "Gaming", "Comedy", "Cricket",
  "Bollywood", "Yoga", "Skincare", "Other"
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "hinglish", label: "Hinglish (Hindi + English)" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "malayalam", label: "Malayalam" },
  { value: "manglish", label: "Manglish (Malayalam + English)" },
];

const STYLES = [
  { value: "casual", label: "Casual & Friendly" },
  { value: "professional", label: "Professional" },
  { value: "funny", label: "Funny & Entertaining" },
  { value: "motivational", label: "Motivational" },
  { value: "educational", label: "Educational" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "both", label: "Both" },
];

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

const FEEDBACK_CATEGORIES = [
  { id: "general", label: "General", icon: MessageSquare },
  { id: "feature", label: "Feature Request", icon: Lightbulb },
  { id: "bug", label: "Bug Report", icon: Bug },
  { id: "performance", label: "Performance", icon: Zap },
];

const BLUE_GRADIENT = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const BLUE = "#3B82F6";

const sampleText = {
  hindi: "नमस्ते दोस्तों! आज मैं आपके साथ कुछ बहुत जरूरी बातें शेयर करना चाहता हूं।",
  english: "Hey guys, welcome back! Today I want to share some really important tips that I have personally used.",
  tamil: "வணக்கம் நண்பர்களே! இன்று நான் உங்களுடன் சில முக்கியமான tips பகிர்ந்துகொள்ள விரும்புகிறேன்.",
  telugu: "నమస్కారం నేస్తాలు! ఈరోజు నేను మీతో కొన్ని చాలా ముఖ్యమైన tips share చేయాలనుకుంటున్నాను.",
  malayalam: "നമസ്കാരം സുഹൃത്തുക്കളേ! ഇന്ന് ഞാൻ നിങ്ങളുമായി ചില പ്രധാനപ്പെട്ട tips പങ്കിടാൻ ആഗ്രഹിക്കുന്നു.",
  hinglish: "Hey guys, welcome back! Aaj main aapke saath kuch bahut important tips share karna chahta hoon.",
  manglish: "Hello guys! Innu njaan ningalude koodey share cheyyaan pokunnathu chila important tips aanu.",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [voiceSaving, setVoiceSaving] = useState(false);
  const [voiceSaved, setVoiceSaved] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [niches, setNiches] = useState<string[]>(
    user?.user_metadata?.niches ||
    (user?.user_metadata?.niche ? [user.user_metadata.niche] : [])
  );
  const [language, setLanguage] = useState(user?.user_metadata?.language || 'hindi');
  const [style, setStyle] = useState(user?.user_metadata?.style || 'casual');
  const [platform, setPlatform] = useState(user?.user_metadata?.platform || 'both');

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState(user?.user_metadata?.voice_transcript || '');
  const [voiceStyle, setVoiceStyle] = useState(user?.user_metadata?.voice_style || '');
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const autoSaveTimer = useRef<any>(null);

  // Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const autoSave = useCallback(async (updates: Record<string, any>) => {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      await supabase.auth.updateUser({ data: updates });
    }, 1000);
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    autoSave({ full_name: val, niche: niches[0] || '', niches, language, style, platform });
  };

  const toggleNiche = (n: string) => {
    const updated = niches.includes(n) ? niches.filter(x => x !== n) : [...niches, n];
    setNiches(updated);
    autoSave({ full_name: name, niche: updated[0] || '', niches: updated, language, style, platform });
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    autoSave({ full_name: name, niche: niches[0] || '', niches, language: val, style, platform });
  };

  const handleStyleChange = (val: string) => {
    setStyle(val);
    autoSave({ full_name: name, niche: niches[0] || '', niches, language, style: val, platform });
  };

  const handlePlatformChange = (val: string) => {
    setPlatform(val);
    autoSave({ full_name: name, niche: niches[0] || '', niches, language, style, platform: val });
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Please use Chrome.');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'tamil' ? 'ta-IN' :
                       language === 'telugu' ? 'te-IN' :
                       language === 'malayalam' || language === 'manglish' ? 'ml-IN' :
                       language === 'hindi' || language === 'hinglish' ? 'hi-IN' : 'en-IN';
    let finalTranscript = '';
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
      }
      setVoiceTranscript(finalTranscript);
    };
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) { stopRecording(); return 60; }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
    if (voiceTranscript) await analyzeVoice(voiceTranscript);
  };

  const analyzeVoice = async (transcript: string) => {
    setAnalyzingVoice(true);
    try {
      const data = await analyzeVoiceStyleRequest(transcript);
      setVoiceStyle(data.style);
    } catch { console.error('Voice analysis failed'); }
    finally { setAnalyzingVoice(false); }
  };

  const handleSaveVoice = async () => {
    setVoiceSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, niche: niches[0] || '', niches, language, style, platform, voice_transcript: voiceTranscript, voice_style: voiceStyle }
    });
    setVoiceSaving(false);
    if (!error) { setVoiceSaved(true); setTimeout(() => setVoiceSaved(false), 3000); }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim() || feedbackRating === 0) return;
    setFeedbackLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setFeedbackLoading(false);
    setFeedbackSubmitted(true);
  };

  const avatarInitials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
          <span className="text-xs text-muted-foreground ml-auto">Auto-saved</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-2xl bg-card border border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
              style={activeTab === tab.id
                ? { background: BLUE_GRADIENT, color: "#fff" }
                : { color: "hsl(var(--muted-foreground))" }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <User className="w-4 h-4" style={{ color: BLUE }} /> Profile
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
                  style={{ background: BLUE_GRADIENT }}>{avatarInitials}</div>
                <div>
                  <p className="font-medium text-foreground">{name || 'Your Name'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 transition-colors text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-muted-foreground text-sm opacity-60 cursor-not-allowed" />
              </div>
            </div>

            {/* Niches */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <Target className="w-4 h-4" style={{ color: BLUE }} /> Content Niches
                {niches.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: "#3B82F615", color: BLUE }}>{niches.length} selected</span>}
              </h2>
              <div className="flex flex-wrap gap-2">
                {NICHES.map((n) => (
                  <button key={n} onClick={() => toggleNiche(n)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                    style={niches.includes(n)
                      ? { background: BLUE_GRADIENT, color: "#fff", borderColor: "transparent" }
                      : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    {niches.includes(n) && '✓ '}{n}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PREFERENCES TAB ── */}
        {activeTab === "preferences" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Platform */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <Palette className="w-4 h-4" style={{ color: BLUE }} /> Platform
              </h2>
              <div className="flex gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p.value} onClick={() => handlePlatformChange(p.value)}
                    className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all"
                    style={platform === p.value
                      ? { background: BLUE_GRADIENT, color: "#fff", borderColor: "transparent" }
                      : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" style={{ color: BLUE }} /> Script Language
              </h2>
              <div className="flex flex-col gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l.value} onClick={() => handleLanguageChange(l.value)}
                    className="w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left"
                    style={language === l.value
                      ? { background: BLUE_GRADIENT, color: "#fff", borderColor: "transparent" }
                      : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <Palette className="w-4 h-4" style={{ color: BLUE }} /> Content Style
              </h2>
              <div className="flex flex-col gap-2">
                {STYLES.map((s) => (
                  <button key={s.value} onClick={() => handleStyleChange(s.value)}
                    className="w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left"
                    style={style === s.value
                      ? { background: BLUE_GRADIENT, color: "#fff", borderColor: "transparent" }
                      : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── VOICE TAB ── */}
        {activeTab === "voice" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <Mic className="w-4 h-4" style={{ color: BLUE }} /> Voice Style
              </h2>
              <p className="text-xs text-muted-foreground">Record your voice so we can personalize scripts to match your natural speaking style</p>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1">
                <p className="text-xs font-medium" style={{ color: BLUE }}>📖 Read this text aloud while recording:</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {sampleText[language as keyof typeof sampleText] || sampleText.hindi}
                </p>
              </div>

              {voiceTranscript && !analyzingVoice && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Your transcript:</p>
                  <p className="text-sm text-foreground">{voiceTranscript.slice(0, 200)}...</p>
                </div>
              )}

              {voiceStyle && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="text-xs text-green-400 mb-1">✅ Voice style analyzed!</p>
                  <p className="text-sm text-foreground">{voiceStyle}</p>
                </div>
              )}

              {analyzingVoice && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing your speaking style...
                </div>
              )}

              <button onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ${isRecording ? 'bg-red-500 animate-pulse' : ''}`}
                style={!isRecording ? { background: BLUE_GRADIENT } : {}}>
                {isRecording
                  ? <><MicOff className="w-4 h-4" /> Stop Recording ({recordingTime}s)</>
                  : <><Mic className="w-4 h-4" /> {voiceStyle ? 'Re-record Voice' : 'Record Your Voice'}</>}
              </button>

              {voiceStyle && (
                <button onClick={handleSaveVoice} disabled={voiceSaving}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                  {voiceSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    : voiceSaved ? <><Check className="w-4 h-4" /> Saved!</>
                    : <><Save className="w-4 h-4" /> Save Voice Style</>}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── FEEDBACK TAB ── */}
        {activeTab === "feedback" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <AnimatePresence mode="wait">
              {feedbackSubmitted ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 gap-5 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: BLUE_GRADIENT }}>
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Thank You! 🎉</h2>
                    <p className="text-muted-foreground text-sm max-w-sm">Your feedback has been submitted. We review every message and use it to improve Uptrent.</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                    style={{ background: "#3B82F615", border: "1px solid #3B82F630", color: BLUE }}>
                    <ThumbsUp className="w-3.5 h-3.5" />
                    We'll respond within 24 hours
                  </div>
                  <button onClick={() => { setFeedbackSubmitted(false); setFeedbackRating(0); setFeedbackMessage(""); }}
                    className="px-6 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    Submit Another
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" className="space-y-4">
                  {/* Category */}
                  <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" style={{ color: BLUE }} /> Category
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      {FEEDBACK_CATEGORIES.map((cat) => (
                        <button key={cat.id} onClick={() => setFeedbackCategory(cat.id)}
                          className="flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all text-left"
                          style={feedbackCategory === cat.id
                            ? { background: "#3B82F615", borderColor: "#3B82F650", color: BLUE }
                            : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                          <cat.icon className="w-3.5 h-3.5 shrink-0" />{cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <h2 className="font-semibold text-foreground text-sm">Overall Rating</h2>
                    <div className="flex items-center justify-center gap-3">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <motion.button key={r} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                          onClick={() => setFeedbackRating(r)}
                          onMouseEnter={() => setHoveredRating(r)}
                          onMouseLeave={() => setHoveredRating(0)}>
                          <Star className="w-8 h-8 transition-all"
                            style={{ fill: r <= (hoveredRating || feedbackRating) ? BLUE : "transparent", color: r <= (hoveredRating || feedbackRating) ? BLUE : "hsl(var(--border))" }} />
                        </motion.button>
                      ))}
                    </div>
                    {(hoveredRating || feedbackRating) > 0 && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center text-xs font-medium" style={{ color: BLUE }}>
                        {["Poor", "Fair", "Good", "Great", "Excellent"][(hoveredRating || feedbackRating) - 1]}
                      </motion.p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <h2 className="font-semibold text-foreground text-sm">Your Feedback</h2>
                    <textarea value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value.slice(0, 500))}
                      placeholder="Tell us what you think... What do you love? What can we improve?"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none text-sm resize-none transition-all"
                      onFocus={e => { e.target.style.borderColor = "#3B82F650"; }}
                      onBlur={e => { e.target.style.borderColor = ""; }} />
                    <p className="text-xs text-muted-foreground text-right">{feedbackMessage.length}/500</p>
                  </div>

                  {/* Submit */}
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={handleFeedbackSubmit}
                    disabled={feedbackLoading || !feedbackMessage.trim() || feedbackRating === 0}
                    className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: BLUE_GRADIENT }}>
                    {feedbackLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      : <><Send className="w-4 h-4" /> Submit Feedback</>}
                  </motion.button>

                  {(!feedbackMessage.trim() || feedbackRating === 0) && (
                    <p className="text-xs text-muted-foreground text-center">
                      {feedbackRating === 0 ? "Please select a star rating" : "Please write your feedback"}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent reviews */}
            {!feedbackSubmitted && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-t border-border pt-4">
                  <h3 className="font-semibold text-foreground text-sm">Recent Reviews</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#3B82F615", color: BLUE }}>3</span>
                </div>
                {[
                  { name: "Rahul S.", rating: 5, text: "Amazing platform! The script generator saved me hours every week.", time: "2 days ago", niche: "Finance Creator" },
                  { name: "Priya M.", rating: 5, text: "Love the trending topics feature. Helps me stay relevant!", time: "5 days ago", niche: "Fitness Creator" },
                  { name: "Arjun K.", rating: 4, text: "Great tool overall. Would love more YouTube analytics features.", time: "1 week ago", niche: "Tech Creator" },
                ].map((review, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: BLUE_GRADIENT }}>{review.name[0]}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.niche}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.time}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-3 h-3"
                          style={{ fill: j < review.rating ? BLUE : "transparent", color: j < review.rating ? BLUE : "hsl(var(--border))" }} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{review.text}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
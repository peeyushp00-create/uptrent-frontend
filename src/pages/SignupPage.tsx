import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeVoiceStyle as analyzeVoiceStyleRequest } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Loader2, Mic, MicOff, Check, Mail, RefreshCw, Plus, X } from "lucide-react";
import SEO from "@/components/SEO";

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

const IG_GRAD = "linear-gradient(135deg, #7C3AED, #0D9488)";
const IG = "#7C3AED";

const SAMPLE_TEXTS: Record<string, string> = {
  hindi: "नमस्ते दोस्तों! आज मैं आपके साथ कुछ बहुत जरूरी बातें शेयर करना चाहता हूं। मैंने देखा है कि बहुत सारे क्रिएटर्स सही कंटेंट बनाने में struggle करते हैं। लेकिन असल में यह इतना मुश्किल नहीं है।",
  english: "Hey guys, welcome back! Today I want to share some really important tips that I have personally used. I have noticed that many creators struggle with making the right content. But actually it is not that difficult.",
  tamil: "வணக்கம் நண்பர்களே! இன்று நான் உங்களுடன் சில முக்கியமான tips பகிர்ந்துகொள்ள விரும்புகிறேன். நான் பார்த்தேன், பல creators சரியான content உருவாக்குவதில் கஷ்டப்படுகிறார்கள்.",
  telugu: "నమస్కారం నేస్తాలు! ఈరోజు నేను మీతో కొన్ని చాలా ముఖ్యమైన tips share చేయాలనుకుంటున్నాను. చాలా మంది creators సరైన content తయారు చేయడంలో struggle చేస్తున్నారని నేను గమనించాను.",
  malayalam: "നമസ്കാരം സുഹൃത്തുക്കളേ! ഇന്ന് ഞാൻ നിങ്ങളുമായി ചില പ്രധാനപ്പെട്ട tips പങ്കിടാൻ ആഗ്രഹിക്കുന്നു. ഒരുപാട് creators ശരിയായ content ഉണ്ടാക്കുന്നതിൽ struggle ചെയ്യുന്നതായി ഞാൻ കണ്ടിട്ടുണ്ട്.",
  hinglish: "Hey guys, welcome back! Aaj main aapke saath kuch bahut important tips share karna chahta hoon. Maine dekha hai ki bahut saare creators struggle karte hain sahi content banane mein. But actually it's not that difficult!",
  manglish: "Hello guys! Ente channel-il welkam! Innu njaan ningalude koodey share cheyyaan pokunnathu chila really important tips aanu. Kurachu creators kaanunnathu content undakkaan struggle cheyyunnathu. But actually athu athra difficult alla!",
};

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [nicheInput, setNicheInput] = useState("");
  const [language, setLanguage] = useState("english");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState("");
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingDone, setRecordingDone] = useState(false);

  // ✅ MediaRecorder refs for Whisper
  const mediaRecorderRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const navigate = useNavigate();

  const goToStep2 = () => {
    if (!name || !email || !password) { setError("Please fill all fields"); return; }
    setError(""); setStep(2);
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  const toggleNiche = (n: string) => {
    setNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  };

  const addCustomNiche = () => {
    const val = nicheInput.trim();
    if (!val) return;
    if (!niches.includes(val)) setNiches(prev => [...prev, val]);
    setNicheInput("");
  };

  const removeNiche = (n: string) => setNiches(prev => prev.filter(x => x !== n));

  // ✅ NEW: MediaRecorder-based recording for Whisper
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => chunksRef.current.push(e.data);
      mediaRecorder.start();

      setIsRecording(true);
      setRecordingDone(false);
      setVoiceStyle('');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) { stopRecording(); return 60; }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert('Microphone access denied. Please allow mic permissions and try again.');
    }
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    mediaRecorder.onstop = async () => {
      clearInterval(timerRef.current);
      setIsRecording(false);
      setRecordingDone(true);
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      await analyzeVoice(audioBlob);
    };

    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
  };

  const analyzeVoice = async (audioBlob: Blob) => {
    setAnalyzingVoice(true);
    try {
      const data = await analyzeVoiceStyleRequest(audioBlob, language);
      setVoiceStyle(data.style);
    } catch (err) {
      console.error('Voice analysis failed:', err);
    } finally {
      setAnalyzingVoice(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (niches.length === 0) { setError("Please select at least one niche"); return; }
    setLoading(true);
    setError("");
    localStorage.setItem('userLanguage', language);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: name, niche: niches[0], niches, language, voice_style: voiceStyle },
        emailRedirectTo: `${window.location.origin}/`,
      }
    });
    setLoading(false);
    if (error) setError(error.message);
    else setStep(4);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    await supabase.auth.resend({ type: 'signup', email });
    setResendLoading(false);
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <SEO title="Sign Up — SocialRum" noindex />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/socialrum-logo.png" alt="SocialRum" className="w-12 h-12 rounded-xl" />
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">Join thousands of creators on SocialRum</p>
        </div>

        {/* Step indicator */}
        {step <= 3 && (
          <>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3].map(n => (
                <div key={n} className="flex items-center gap-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={step >= n ? { background: IG_GRAD, color: '#fff' } : { border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                    {step > n ? <Check className="w-4 h-4" /> : n}
                  </div>
                  {n < 3 && <div className="w-8 h-0.5 transition-all" style={{ background: step > n ? IG : 'hsl(var(--border))' }} />}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-12 text-xs text-muted-foreground -mt-2">
              {["Account", "Niche", "Voice"].map((label, i) => (
                <span key={i} style={step >= i + 1 ? { color: IG } : {}}>{label}</span>
              ))}
            </div>
          </>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

          {/* ── Step 1 — Account ── */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <button type="button" onClick={handleGoogleSignup} disabled={googleLoading}
                className="w-full py-3 px-4 rounded-xl border border-border bg-card text-foreground text-sm font-medium flex items-center justify-center gap-3 hover:bg-accent transition-colors disabled:opacity-60">
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {googleLoading ? 'Signing up...' : 'Continue with Google'}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input id="signup-name" type="text" placeholder="Your name" value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('signup-email')?.focus(); } }}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  onFocus={e => e.target.style.borderColor = `${IG}60`}
                  onBlur={e => e.target.style.borderColor = ''} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input id="signup-email" type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('signup-password')?.focus(); } }}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  onFocus={e => e.target.style.borderColor = `${IG}60`}
                  onBlur={e => e.target.style.borderColor = ''} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input id="signup-password" type="password" placeholder="Min 6 characters" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); goToStep2(); } }}
                  required minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  onFocus={e => e.target.style.borderColor = `${IG}60`}
                  onBlur={e => e.target.style.borderColor = ''} />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="button" onClick={goToStep2}
                className="w-full py-3 rounded-xl text-white font-medium text-sm"
                style={{ background: IG_GRAD }}>
                Next →
              </button>
            </motion.div>
          )}

          {/* ── Step 2 — Niche & Language ── */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Content Niches</label>
                <p className="text-xs text-muted-foreground">
                  Pick from suggestions or type your own
                  {niches.length > 0 && <span className="ml-1" style={{ color: IG }}>({niches.length} selected)</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map(n => (
                    <button key={n} type="button" onClick={() => toggleNiche(n)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                      style={niches.includes(n)
                        ? { background: IG_GRAD, color: '#fff', borderColor: 'transparent' }
                        : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                      {niches.includes(n) && '✓ '}{n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={nicheInput}
                    onChange={e => setNicheInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomNiche(); } }}
                    placeholder="Type your own niche..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                    onFocus={e => e.target.style.borderColor = `${IG}60`}
                    onBlur={e => e.target.style.borderColor = ''} />
                  <button type="button" onClick={addCustomNiche}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-1.5"
                    style={{ background: IG_GRAD }}>
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                {niches.filter(n => !NICHES.includes(n)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <p className="text-xs text-muted-foreground w-full">Custom:</p>
                    {niches.filter(n => !NICHES.includes(n)).map(n => (
                      <span key={n} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: `${IG}20`, color: IG, border: `1px solid ${IG}40` }}>
                        {n}
                        <button type="button" onClick={() => removeNiche(n)} className="ml-0.5 hover:opacity-70">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Script Language</label>
                <div className="flex flex-col gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l.value} type="button" onClick={() => setLanguage(l.value)}
                      className="w-full py-2.5 px-4 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between"
                      style={language === l.value
                        ? { background: IG_GRAD, color: '#fff', borderColor: 'transparent' }
                        : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                      {l.label}
                      {language === l.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back
                </button>
                <button type="button"
                  onClick={() => { if (niches.length === 0) { setError("Please select at least one niche"); return; } setError(""); setStep(3); }}
                  className="flex-1 py-3 rounded-xl text-white font-medium text-sm"
                  style={{ background: IG_GRAD }}>
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3 — Voice ── */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="font-semibold text-foreground">🎤 Set up your Voice Style</h2>
                <p className="text-sm text-muted-foreground">Optional but highly recommended!</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { emoji: "🎯", title: "Personalized Scripts", desc: "Scripts written exactly like YOU — not a robot." },
                  { emoji: "🗣️", title: "Your Natural Tone", desc: "Casual, energetic or formal — scripts match your style." },
                  { emoji: "⚡", title: "Ready to Film", desc: "So natural you can film immediately without rewriting." },
                  { emoji: "🔒", title: "100% Private", desc: "We never store or share your actual voice recording.", highlight: true },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border"
                    style={b.highlight
                      ? { background: `${IG}10`, borderColor: `${IG}30` }
                      : { background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                    <span className="text-lg">{b.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <p className="text-xs font-medium" style={{ color: IG }}>📖 Read this aloud while recording:</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {SAMPLE_TEXTS[language] || SAMPLE_TEXTS.english}
                </p>
              </div>

              {recordingDone && !analyzingVoice && !voiceStyle && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl border flex items-center gap-3"
                  style={{ background: `${IG}10`, borderColor: `${IG}30` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: IG_GRAD }}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Voice recorded successfully!</p>
                    <p className="text-xs text-muted-foreground">Processing your speaking style...</p>
                  </div>
                </motion.div>
              )}

              {analyzingVoice && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" style={{ color: IG }} />
                  <div>
                    <p className="text-sm font-medium text-foreground">Analyzing your voice style...</p>
                    <p className="text-xs text-muted-foreground">This takes a few seconds</p>
                  </div>
                </motion.div>
              )}

              {isRecording && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm text-red-500 font-medium">Recording... {recordingTime}s / 60s</span>
                </div>
              )}

              {voiceStyle && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl border space-y-2"
                  style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.3)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-green-400">Voice Style Detected! 🎉</p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{voiceStyle}</p>
                  <p className="text-xs text-muted-foreground">Your scripts will match this style perfectly.</p>
                </motion.div>
              )}

              <button type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ${isRecording ? 'animate-pulse' : ''}`}
                style={{ background: isRecording ? '#ef4444' : IG_GRAD }}>
                {isRecording
                  ? <><MicOff className="w-4 h-4" /> Stop Recording ({recordingTime}s)</>
                  : voiceStyle
                    ? <><Mic className="w-4 h-4" /> Re-record Voice</>
                    : <><Mic className="w-4 h-4" /> {recordingDone ? 'Record Again' : 'Start Recording'}</>}
              </button>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: IG_GRAD }}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                    : (voiceStyle || recordingDone) ? "Save & Create Account ✨" : "Skip & Create Account"}
                </button>
              </div>
            </motion.div>
          )}

        </form>

        {/* ── Step 4 — Email Verification ── */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 py-4">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `${IG}15`, border: `2px solid ${IG}30` }}>
              <Mail className="w-8 h-8" style={{ color: IG }} />
            </motion.div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Check your email!</h2>
              <p className="text-xs text-muted-foreground">Verification link sent to</p>
              <p className="text-sm font-semibold px-3 py-1 rounded-xl" style={{ background: `${IG}15`, color: IG }}>
                {email}
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                Click the link to activate your account and start creating!
              </p>
            </div>
            <AnimatePresence>
              {resendSuccess && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-green-400">
                  ✅ Verification email resent!
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex gap-2 w-full">
              <button onClick={handleResend} disabled={resendLoading}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs text-muted-foreground flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
                {resendLoading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                  : <><RefreshCw className="w-3.5 h-3.5" /> Resend</>}
              </button>
              <button onClick={() => navigate("/login")}
                className="flex-1 py-2.5 rounded-xl text-white text-xs font-medium"
                style={{ background: IG_GRAD }}>
                Go to Login
              </button>
            </div>
          </motion.div>
        )}

        {step <= 3 && (
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium hover:underline" style={{ color: IG }}>Login</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
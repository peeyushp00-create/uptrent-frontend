import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { analyzeVoiceStyle as analyzeVoiceStyleRequest } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Loader2, Mic, MicOff, Check } from "lucide-react";

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

const IG_GRAD = "linear-gradient(135deg, #14BBA6, #0D9488)";
const IG = "#14BBA6";

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
  const [language, setLanguage] = useState("english");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("");
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingDone, setRecordingDone] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

  const toggleNiche = (n: string) => {
    setNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
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
    setRecordingDone(false);
    setVoiceStyle('');
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
    setRecordingDone(true);
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (niches.length === 0) { setError("Please select at least one niche"); return; }
    setLoading(true);
    setError("");

    // ✅ Save language to localStorage on signup
    localStorage.setItem('userLanguage', language);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          niche: niches[0],
          niches,
          language,
          voice_transcript: voiceTranscript,
          voice_style: voiceStyle,
        }
      }
    });

    if (error) { setError(error.message); setLoading(false); }
    else {
      setSuccess("Account created! Welcome to SocialRum 🎉");
setTimeout(() => navigate("/"), 1500);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/logo.png" alt="SocialRum" className="w-12 h-12 rounded-xl" />
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">Join thousands of creators on SocialRum</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={step >= s ? { background: IG_GRAD, color: '#fff' } : { border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className="w-8 h-0.5 transition-all" style={{ background: step > s ? IG : 'hsl(var(--border))' }} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-12 text-xs text-muted-foreground">
          <span style={step >= 1 ? { color: IG } : {}}>Account</span>
          <span style={step >= 2 ? { color: IG } : {}}>Niche</span>
          <span style={step >= 3 ? { color: IG } : {}}>Voice</span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">

          {/* ── Step 1 — Account Details ── */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input type="text" placeholder="Your name" value={name}
                  onChange={e => setName(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  onFocus={e => e.target.style.borderColor = `${IG}60`}
                  onBlur={e => e.target.style.borderColor = ''} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  onFocus={e => e.target.style.borderColor = `${IG}60`}
                  onBlur={e => e.target.style.borderColor = ''} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input type="password" placeholder="Min 6 characters" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  onFocus={e => e.target.style.borderColor = `${IG}60`}
                  onBlur={e => e.target.style.borderColor = ''} />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="button"
                onClick={() => { if (!name || !email || !password) { setError("Please fill all fields"); return; } setError(""); setStep(2); }}
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
                  Select one or more niches
                  {niches.length > 0 && <span className="ml-1" style={{ color: IG }}>({niches.length} selected)</span>}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
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

          {/* ── Step 3 — Voice Recording ── */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="font-semibold text-foreground">🎤 Set up your Voice Style</h2>
                <p className="text-sm text-muted-foreground">Optional but highly recommended!</p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  { emoji: "🎯", title: "Personalized Scripts", desc: "Scripts written exactly like YOU — not a robot." },
                  { emoji: "🗣️", title: "Your Natural Tone", desc: "Casual, energetic or formal — scripts match your style." },
                  { emoji: "⚡", title: "Ready to Film", desc: "So natural you can film immediately without rewriting." },
                  { emoji: "🔒", title: "100% Private", desc: "We never store or share your actual voice recording.", highlight: true },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border transition-all"
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

              {/* Sample text */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <p className="text-xs font-medium" style={{ color: IG }}>📖 Read this text aloud while recording:</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {SAMPLE_TEXTS[language] || SAMPLE_TEXTS.english}
                </p>
              </div>

              {/* ✅ Recording done — show success instead of transcript */}
              {recordingDone && !analyzingVoice && !voiceStyle && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl border flex items-center gap-3"
                  style={{ background: `${IG}10`, borderColor: `${IG}30` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: IG_GRAD }}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Voice recorded successfully!</p>
                    <p className="text-xs text-muted-foreground">Processing your speaking style...</p>
                  </div>
                </motion.div>
              )}

              {/* Analyzing */}
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

              {/* ✅ Voice style result */}
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
                  <p className="text-xs text-muted-foreground">Your scripts will now match this style perfectly.</p>
                </motion.div>
              )}

              {/* Record button */}
              <button type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all"
                style={isRecording ? { background: '#ef4444' } : { background: IG_GRAD }}
                {...(isRecording ? { className: "w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all animate-pulse bg-red-500" } : {})}>
                {isRecording
                  ? <><MicOff className="w-4 h-4" /> Stop Recording ({recordingTime}s)</>
                  : voiceStyle
                    ? <><Mic className="w-4 h-4" /> Re-record Voice</>
                    : <><Mic className="w-4 h-4" /> {recordingDone ? 'Record Again' : 'Start Recording'}</>}
              </button>

              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-green-400">{success}</p>}

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
                    : voiceStyle
                      ? "Save & Create Account ✨"
                      : "Skip & Create Account"}
                </button>
              </div>
            </motion.div>
          )}

        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium hover:underline" style={{ color: IG }}>Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
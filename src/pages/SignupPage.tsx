import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "malayalam", label: "Malayalam" },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [niche, setNiche] = useState("");
  const [language, setLanguage] = useState("hindi");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("");
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

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
                       language === 'malayalam' ? 'ml-IN' :
                       language === 'hindi' ? 'hi-IN' : 'en-IN';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      setVoiceTranscript(finalTranscript);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);

    if (voiceTranscript) {
      await analyzeVoiceStyle(voiceTranscript);
    }
  };

  const analyzeVoiceStyle = async (transcript: string) => {
    setAnalyzingVoice(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/scripts/analyze-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      const data = await response.json();
      setVoiceStyle(data.style);
    } catch (err) {
      console.error('Voice analysis failed');
    } finally {
      setAnalyzingVoice(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche) {
      setError("Please select your content niche");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          niche,
          language,
          voice_transcript: voiceTranscript,
          voice_style: voiceStyle
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess("Account created! Check your email to confirm.");
      setTimeout(() => navigate("/login"), 3000);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/logo.png" alt="Uptrent" className="w-12 h-12 rounded-xl" />
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">Join thousands of creators on Uptrent</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? 'text-white' : 'border border-border text-muted-foreground'
              }`}
              style={step >= s ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-pink-500' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-12 text-xs text-muted-foreground">
          <span className={step >= 1 ? 'text-pink-500' : ''}>Account</span>
          <span className={step >= 2 ? 'text-pink-500' : ''}>Niche</span>
          <span className={step >= 3 ? 'text-pink-500' : ''}>Voice</span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">

          {/* Step 1 - Account Details */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!name || !email || !password) {
                    setError("Please fill all fields");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full py-3 rounded-xl text-white font-medium text-sm"
                style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
              >
                Next →
              </button>
            </motion.div>
          )}

          {/* Step 2 - Niche & Language */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Content Niche</label>
                <p className="text-xs text-muted-foreground">This personalizes your trending topics and scripts</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {NICHES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNiche(n)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        niche === n ? "border-pink-500 text-white" : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                      style={niche === n ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Script Language</label>
                <div className="flex flex-col gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => setLanguage(l.value)}
                      className={`w-full py-2.5 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
                        language === l.value ? "border-pink-500 text-white" : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                      style={language === l.value ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!niche) {
                      setError("Please select your niche");
                      return;
                    }
                    setError("");
                    setStep(3);
                  }}
                  className="flex-1 py-3 rounded-xl text-white font-medium text-sm"
                  style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 - Voice Recording */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="font-semibold text-foreground">Set up your voice style</h2>
                <p className="text-xs text-muted-foreground">Record 30-60 seconds of yourself talking naturally. We'll analyze your style to personalize your scripts.</p>
                <p className="text-xs text-muted-foreground">You can skip this step and do it later in Settings.</p>
              </div>

              {voiceTranscript && !analyzingVoice && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Transcript:</p>
                  <p className="text-sm text-foreground">{voiceTranscript.slice(0, 150)}...</p>
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

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  isRecording ? 'bg-red-500 animate-pulse' : ''
                }`}
                style={!isRecording ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
              >
                {isRecording ? (
                  <><MicOff className="w-4 h-4" /> Stop Recording ({recordingTime}s)</>
                ) : (
                  <><Mic className="w-4 h-4" /> {voiceTranscript ? 'Re-record Voice' : 'Start Recording'}</>
                )}
              </button>

              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-green-400">{success}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Creating..." : voiceStyle ? "Create Account ✨" : "Skip & Create Account"}
                </button>
              </div>
            </motion.div>
          )}

        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-500 hover:underline font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Settings, User, Target, Globe, Palette, Save, Loader2, Check, Mic, MicOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "malayalam", label: "Malayalam" },
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

export default function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [niche, setNiche] = useState(user?.user_metadata?.niche || '');
  const [language, setLanguage] = useState(user?.user_metadata?.language || 'hindi');
  const [style, setStyle] = useState(user?.user_metadata?.style || 'casual');
  const [platform, setPlatform] = useState(user?.user_metadata?.platform || 'both');

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState(user?.user_metadata?.voice_transcript || '');
  const [voiceStyle, setVoiceStyle] = useState(user?.user_metadata?.voice_style || '');
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

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

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        niche,
        language,
        style,
        platform,
        voice_transcript: voiceTranscript,
        voice_style: voiceStyle
      }
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const avatarInitials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  const sampleText = {
    hindi: "नमस्ते दोस्तों! आज मैं आपके साथ कुछ बहुत जरूरी बातें शेयर करना चाहता हूं। मैंने देखा है कि बहुत सारे क्रिएटर्स सही कंटेंट बनाने में struggle करते हैं। लेकिन असल में यह इतना मुश्किल नहीं है।",
    english: "Hey guys, welcome back! Today I want to share some really important tips that I have personally used. I have noticed that many creators struggle with making the right content. But actually it is not that difficult.",
    tamil: "வணக்கம் நண்பர்களே! இன்று நான் உங்களுடன் சில முக்கியமான tips பகிர்ந்துகொள்ள விரும்புகிறேன். நான் பார்த்தேன், பல creators சரியான content உருவாக்குவதில் கஷ்டப்படுகிறார்கள்.",
    telugu: "నమస్కారం నేస్తాలు! ఈరోజు నేను మీతో కొన్ని చాలా ముఖ్యమైన tips share చేయాలనుకుంటున్నాను. చాలా మంది creators సరైన content తయారు చేయడంలో struggle చేస్తున్నారని నేను గమనించాను.",
    malayalam: "നമസ്കാരം സുഹൃത്തുക്കളേ! ഇന്ന് ഞാൻ നിങ്ങളുമായി ചില പ്രധാനപ്പെട്ട tips പങ്കിടാൻ ആഗ്രഹിക്കുന്നു. ഒരുപാട് creators ശരിയായ content ഉണ്ടാക്കുന്നതിൽ struggle ചെയ്യുന്നതായി ഞാൻ കണ്ടിട്ടുണ്ട്.",
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6" /> Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Customize your Uptrent experience</p>
        </div>

        {/* Profile Section */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-pink-500" /> Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}>
              {avatarInitials}
            </div>
            <div>
              <p className="font-medium text-foreground">{name || 'Your Name'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-muted-foreground text-sm opacity-60 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Niche Section */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-500" /> Content Niche
          </h2>
          <p className="text-xs text-muted-foreground">This personalizes your scripts and trending topics</p>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <button
                key={n}
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

        {/* Platform Section */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-500" /> Platform
          </h2>
          <p className="text-xs text-muted-foreground">Which platform do you create content for?</p>
          <div className="flex gap-3">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  platform === p.value ? "border-pink-500 text-white" : "border-border text-muted-foreground hover:text-foreground"
                }`}
                style={platform === p.value ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Section */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-pink-500" /> Script Language
          </h2>
          <p className="text-xs text-muted-foreground">Language for your generated scripts</p>
          <div className="flex flex-col gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={`w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
                  language === l.value ? "border-pink-500 text-white" : "border-border text-muted-foreground hover:text-foreground"
                }`}
                style={language === l.value ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Style Section */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-500" /> Content Style
          </h2>
          <p className="text-xs text-muted-foreground">Your preferred script writing style</p>
          <div className="flex flex-col gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
                  style === s.value ? "border-pink-500 text-white" : "border-border text-muted-foreground hover:text-foreground"
                }`}
                style={style === s.value ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Style Section */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Mic className="w-4 h-4 text-pink-500" /> Voice Style
          </h2>
          <p className="text-xs text-muted-foreground">Record your voice so we can personalize scripts to match your natural speaking style</p>

          {/* Sample text */}
          <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1">
            <p className="text-xs text-pink-500 font-medium">📖 Read this text aloud while recording:</p>
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

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              isRecording ? 'bg-red-500 animate-pulse' : ''
            }`}
            style={!isRecording ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
          >
            {isRecording ? (
              <><MicOff className="w-4 h-4" /> Stop Recording ({recordingTime}s)</>
            ) : (
              <><Mic className="w-4 h-4" /> {voiceStyle ? 'Re-record Voice' : 'Record Your Voice'}</>
            )}
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>

      </motion.div>
    </div>
  );
}
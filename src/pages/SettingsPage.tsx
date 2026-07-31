import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  User, Settings2 as SettingsIcon, Mic, MessageSquare, CreditCard, Instagram, Youtube, Globe, Check,
  Star, Send, Square, Loader2, Sparkles as SparklesIcon, Wand2, Save, X, Keyboard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { analyzeVoiceStyle as analyzeVoiceStyleRequest, type VoiceProfile } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { getPageState, setPageState } from '@/lib/pageCache';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const NICHES = [
  "Finance", "Fitness", "Motivation", "Tech",
  "Food", "Travel", "Business", "Education",
  "Fashion", "Gaming", "Comedy", "Cricket",
  "Bollywood", "Yoga", "Skincare", "Other"
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "hindi", label: "हिंदी (Hindi)" },
  { value: "tamil", label: "தமிழ் (Tamil)" },
  { value: "telugu", label: "తెలుగు (Telugu)" },
  { value: "malayalam", label: "മലയാളം (Malayalam)" },
];

const STYLES = [
  { value: "casual", label: "Casual & Friendly" },
  { value: "professional", label: "Professional" },
  { value: "funny", label: "Funny & Entertaining" },
  { value: "motivational", label: "Motivational" },
  { value: "educational", label: "Educational" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "both", label: "Both" },
];

type Tab = "profile" | "preferences" | "voice" | "billing" | "feedback";
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: SettingsIcon },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

const FEEDBACK_CATEGORIES = [
  { id: "general", label: "Feedback", icon: MessageSquare },
  { id: "feature", label: "Feature Request", icon: SparklesIcon },
  { id: "bug", label: "Bug Report", icon: Square },
  { id: "performance", label: "Performance", icon: SettingsIcon },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const _saved = getPageState('settings');

  const [active, setActive] = useState<Tab>(_saved?.activeTab ?? "profile");
  const [voiceSaving, setVoiceSaving] = useState(false);
  const [voiceSaved, setVoiceSaved] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [niches, setNiches] = useState<string[]>(
    user?.user_metadata?.niches ||
    (user?.user_metadata?.niche ? [user.user_metadata.niche] : [])
  );
  const [language, setLanguage] = useState(
    localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english'
  );
  const [style, setStyle] = useState(
    localStorage.getItem('userStyle') || user?.user_metadata?.style || 'casual'
  );
  const [platform, setPlatform] = useState(user?.user_metadata?.platform || 'both');
  const [igUsername, setIgUsername] = useState(user?.user_metadata?.instagram_username || '');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState(_saved?.voiceStyle ?? (user?.user_metadata?.voice_style || ''));
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(
    _saved?.voiceProfile ?? (user?.user_metadata?.voice_profile || null)
  );
  const [voiceEditOpen, setVoiceEditOpen] = useState(false);
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const autoSaveTimer = useRef<any>(null);

  const _stateRef = useRef<any>({});
  useEffect(() => { _stateRef.current = { activeTab: active, voiceStyle, voiceProfile }; });
  useEffect(() => () => { setPageState('settings', _stateRef.current); }, []);

  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [ytChannel, setYtChannel] = useState<any>(user?.user_metadata?.youtube_channel || null);
  const [ytConnecting, setYtConnecting] = useState(false);
  const [ytDisconnecting, setYtDisconnecting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{ active: boolean; plan?: string; renews_at?: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('youtube') === 'connected') {
      window.history.replaceState({}, '', '/settings');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${BASE}/api/payment/status?user_id=${user.id}`)
      .then(r => r.json()).then(setPaymentStatus).catch(() => {});
  }, [user?.id]);

  const handleYtConnect = async () => {
    if (!user?.id) return;
    setYtConnecting(true);
    try {
      const res = await fetch(`${BASE}/api/youtube/oauth/url?userId=${user.id}`);
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { console.error(e); setYtConnecting(false); }
  };

  const handleYtDisconnect = async () => {
    if (!user?.id) return;
    setYtDisconnecting(true);
    try {
      await fetch(`${BASE}/api/youtube/oauth/disconnect`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setYtChannel(null);
    } catch (e) { console.error(e); }
    finally { setYtDisconnecting(false); }
  };

  const autoSave = useCallback(async (updates: Record<string, any>) => {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      await supabase.auth.updateUser({ data: updates });
    }, 800);
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    autoSave({ full_name: val, niche: niches[0] || '', niches, language, style, platform, instagram_username: igUsername });
  };

  const handleIgUsernameChange = (val: string) => {
    setIgUsername(val);
    autoSave({ full_name: name, niche: niches[0] || '', niches, language, style, platform, instagram_username: val });
  };

  const toggleNiche = (n: string) => {
    const updated = niches.includes(n) ? niches.filter(x => x !== n) : [...niches, n];
    setNiches(updated);
    autoSave({ full_name: name, niche: updated[0] || '', niches: updated, language, style, platform, instagram_username: igUsername });
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem('userLanguage', val);
    i18n.changeLanguage({ english: 'en', hindi: 'hi', tamil: 'ta', telugu: 'te', malayalam: 'ml' }[val] || 'en');
    autoSave({ full_name: name, niche: niches[0] || '', niches, language: val, style, platform, instagram_username: igUsername });
  };

  const handleStyleChange = (val: string) => {
    setStyle(val);
    localStorage.setItem('userStyle', val);
    autoSave({ full_name: name, niche: niches[0] || '', niches, language, style: val, platform, instagram_username: igUsername });
  };

  const handlePlatformChange = (val: string) => {
    setPlatform(val);
    autoSave({ full_name: name, niche: niches[0] || '', niches, language, style, platform: val, instagram_username: igUsername });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e: BlobEvent) => chunksRef.current.push(e.data);
      mediaRecorder.start();
      setIsRecording(true);
      setVoiceStyle('');
      setVoiceProfile(null);
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
      const mimeType = mediaRecorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(chunksRef.current, { type: mimeType });
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
      setVoiceProfile(data);
    } catch (err: any) {
      console.error('Voice analysis failed:', err);
      alert(err.message || 'Voice analysis failed. Please try again.');
    } finally {
      setAnalyzingVoice(false);
    }
  };

  const handleSaveVoice = async (profileOverride?: VoiceProfile | null) => {
    setVoiceSaving(true);
    const profile = profileOverride !== undefined ? profileOverride : voiceProfile;
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, niche: niches[0] || '', niches, language, style, platform, voice_style: voiceStyle, voice_profile: profile, instagram_username: igUsername }
    });
    setVoiceSaving(false);
    if (!error) { setVoiceSaved(true); setTimeout(() => setVoiceSaved(false), 3000); }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim() || feedbackRating === 0) return;
    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      const res = await fetch(`${BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || user?.user_metadata?.full_name || 'Anonymous',
          email: user?.email || '',
          category: feedbackCategory,
          rating: feedbackRating,
          message: feedbackMessage,
          user_id: user?.id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setFeedbackSubmitted(true);
    } catch (e: any) {
      setFeedbackError(e.message || 'Failed to submit. Please try again.');
    } finally { setFeedbackLoading(false); }
  };

  const avatarInitials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className={`theme-redesign ${theme} min-h-screen bg-background text-foreground`}>
      <SEO title="Settings — SocialRum" noindex />

      <main className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="font-heading text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground mb-6">Auto-saved. Tune how SocialRum works for you.</p>

        <div className="mb-6 flex flex-wrap gap-2 p-1 rounded-xl bg-muted w-fit">
          {TABS.map((tabDef) => {
            const Icon = tabDef.icon;
            const on = active === tabDef.id;
            return (
              <button
                key={tabDef.id}
                onClick={() => setActive(tabDef.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  on ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" /> {tabDef.label}
              </button>
            );
          })}
        </div>

        {active === "profile" && (
          <div className="space-y-6">
            <Panel icon={User} title="Profile">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-14 rounded-full bg-gradient-to-br from-primary to-ring text-primary-foreground grid place-items-center font-heading font-bold text-lg">
                  {avatarInitials}
                </div>
                <div>
                  <div className="font-semibold">{name || 'Creator'}</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                  <div className="text-xs text-muted-foreground">{LANGUAGES.find(l => l.value === language)?.label || 'English'}</div>
                </div>
              </div>
              <FormField label="Full name">
                <input value={name} onChange={(e) => handleNameChange(e.target.value)} className="input" />
              </FormField>
              <FormField label="Email">
                <input value={user?.email || ''} readOnly disabled className="input opacity-60 cursor-not-allowed" />
              </FormField>
              <FormField label={<span className="inline-flex items-center gap-1.5"><Instagram className="size-3.5 text-primary" /> Instagram username</span>}>
                <input value={igUsername} onChange={(e) => handleIgUsernameChange(e.target.value)} placeholder="@ your_instagram_handle" className="input" />
              </FormField>
            </Panel>

            <Panel icon={Instagram} title="Instagram Account" iconClass="text-pink-500">
              <p className="text-sm text-muted-foreground mb-4">Connect your Instagram Business or Creator account to sync followers, posts, views, likes and comments.</p>
              <button
                onClick={() => alert("Instagram connect is coming soon.")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90"
              >
                <Instagram className="size-4" /> Connect Instagram
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">Read-only access · Revoke anytime from Meta Accounts Center</p>
            </Panel>

            <Panel icon={Youtube} title="YouTube Channel" iconClass="text-red-500">
              {ytChannel ? (
                <div className="flex items-center gap-3">
                  {ytChannel.channel_thumbnail && <img src={ytChannel.channel_thumbnail} alt="" className="size-10 rounded-full" />}
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{ytChannel.channel_name}</div>
                    <div className="text-xs text-muted-foreground">Connected</div>
                  </div>
                  <button onClick={handleYtDisconnect} disabled={ytDisconnecting}
                    className="px-3 py-2 rounded-lg border border-input text-xs font-medium hover:bg-muted disabled:opacity-50">
                    {ytDisconnecting ? <Loader2 className="size-3.5 animate-spin" /> : "Disconnect"}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">Connect your YouTube channel to get personalized content ideas.</p>
                  <button onClick={handleYtConnect} disabled={ytConnecting}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {ytConnecting ? <Loader2 className="size-4 animate-spin" /> : <Youtube className="size-4" />} Connect YouTube Channel
                  </button>
                </>
              )}
              <p className="text-xs text-muted-foreground text-center mt-3">Read-only access · Revoke anytime in Google Account settings</p>
            </Panel>

            <Panel icon={SparklesIcon} title="Content Niches" rightSlot={<span className="text-xs text-primary">{niches.length} selected</span>}>
              <div className="flex flex-wrap gap-2">
                {NICHES.map((n) => {
                  const on = niches.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleNiche(n)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {on && <Check className="inline size-3 mr-1" />}
                      {n}
                    </button>
                  );
                })}
              </div>
            </Panel>
          </div>
        )}

        {active === "preferences" && (
          <div className="space-y-6">
            <div className="panel p-4 flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/15 text-primary grid place-items-center"><Check className="size-4" /></div>
              <div className="text-sm">
                <div className="font-semibold">Current settings</div>
                <div className="text-muted-foreground">
                  Language: <span className="text-primary">{(LANGUAGES.find(l => l.value === language)?.label || 'English').split(" ")[0]}</span> · Style: <span className="text-primary">{(STYLES.find(s => s.value === style)?.label || '').split(" ")[0].toLowerCase()}</span>
                </div>
              </div>
            </div>

            <Panel icon={SparklesIcon} title="Platform">
              <div className="grid grid-cols-3 gap-3">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const on = platform === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() => handlePlatformChange(p.value)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition inline-flex items-center justify-center gap-2 ${
                        on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      {Icon && <Icon className="size-4" />} {p.label}
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel icon={Globe} title="Script Language" subtitle="All scripts and app UI will use this language">
              <div className="space-y-2">
                {LANGUAGES.map((l) => {
                  const on = language === l.value;
                  return (
                    <button
                      key={l.value}
                      onClick={() => handleLanguageChange(l.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                        on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm font-medium">{l.label}</span>
                      {on && <Check className="size-4" />}
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel icon={SparklesIcon} title="Content Style">
              <div className="space-y-2">
                {STYLES.map((s) => {
                  const on = style === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => handleStyleChange(s.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                        on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm font-medium">{s.label}</span>
                      {on && <Check className="size-4" />}
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel icon={Keyboard} title="Keyboard Shortcuts" subtitle="Navigate and edit faster without touching the mouse">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-shortcuts-modal"))}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:border-primary/50 transition"
              >
                <span className="text-sm font-medium">View all shortcuts</span>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">?</kbd>
              </button>
            </Panel>
          </div>
        )}

        {active === "voice" && (
          <div className="space-y-6">
            <Panel icon={Mic} title="Voice personalization" subtitle="Record 30–60 seconds. No script — just be yourself.">
              <p className="text-sm text-muted-foreground mb-4">
                Talk naturally about anything. We'll learn your tone, slang, and pacing, and use that style for every script we generate for you.
              </p>

              <div className={`rounded-2xl border p-5 transition ${voiceStyle ? "border-primary/40 bg-primary/5" : "border-dashed border-border bg-muted/30"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your recording</div>
                  <div className={`text-xs font-medium ${isRecording ? "text-red-500" : "text-muted-foreground"}`}>
                    {isRecording ? `● Recording · ${recordingTime}s` : voiceStyle ? "Captured" : "Not recording"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={analyzingVoice}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 ${
                      isRecording ? "bg-red-500" : "bg-gradient-to-r from-primary to-ring"
                    }`}
                  >
                    {analyzingVoice
                      ? <><Loader2 className="size-4 animate-spin" /> Analyzing…</>
                      : isRecording
                        ? <><Square className="size-4" /> Stop recording ({recordingTime}s)</>
                        : <><Mic className="size-4" /> {voiceStyle ? "Record again" : "Start recording"}</>}
                  </button>
                </div>
              </div>

              {voiceStyle && (
                <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">Detected voice style</div>
                    {voiceProfile && (
                      <button
                        onClick={() => setVoiceEditOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        <Wand2 className="size-3" /> Edit
                      </button>
                    )}
                  </div>
                  <div className="text-sm">{voiceStyle}</div>
                  {voiceProfile && (voiceProfile.slang?.length || voiceProfile.pronunciationNotes?.length) ? (
                    <div className="mt-2 pt-2 border-t border-primary/20 space-y-1">
                      {voiceProfile.slang && voiceProfile.slang.length > 0 && (
                        <div className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Slang:</span> {voiceProfile.slang.join(', ')}</div>
                      )}
                      {voiceProfile.pronunciationNotes && voiceProfile.pronunciationNotes.length > 0 && (
                        <div className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Pronunciation:</span> {voiceProfile.pronunciationNotes.join('; ')}</div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              <button
                disabled={!voiceStyle || voiceSaving}
                onClick={() => handleSaveVoice()}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-ring text-white text-sm font-semibold disabled:opacity-50"
              >
                {voiceSaving ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : voiceSaved ? <><Check className="size-4" /> Saved</> : <><Check className="size-4" /> Save voice style</>}
              </button>
              <p className="text-xs text-muted-foreground mt-4">
                Every script from now on is generated in your language and style — same slang, same rhythm, same word choice.
              </p>
            </Panel>
          </div>
        )}

        <VoiceStyleEditDialog
          open={voiceEditOpen}
          onOpenChange={setVoiceEditOpen}
          profile={voiceProfile}
          onSave={(updated) => {
            setVoiceProfile(updated);
            handleSaveVoice(updated);
            setVoiceEditOpen(false);
          }}
        />

        {active === "billing" && (
          <div className="space-y-6">
            <Panel icon={CreditCard} title="Current plan">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-heading text-2xl font-semibold">
                    {paymentStatus?.active ? (paymentStatus.plan || 'Pro') : 'Free'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {paymentStatus?.active && paymentStatus.renews_at
                      ? `Renews on ${new Date(paymentStatus.renews_at).toLocaleDateString()}`
                      : "You're on the free plan"}
                  </div>
                </div>
                <button onClick={() => navigate('/pricing')} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
                  {paymentStatus?.active ? "Manage plan" : "Upgrade"}
                </button>
              </div>
            </Panel>
          </div>
        )}

        {active === "feedback" && (
          <div className="space-y-6">
            <Panel icon={MessageSquare} title="Category">
              <div className="grid grid-cols-2 gap-3">
                {FEEDBACK_CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const on = feedbackCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setFeedbackCategory(c.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition ${
                        on ? "bg-primary/15 border-primary text-foreground" : "border-border hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-4 text-primary" /> {c.label}
                    </button>
                  );
                })}
              </div>
            </Panel>

            <div className="panel p-6">
              <div className="font-semibold mb-3">Overall Rating</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setFeedbackRating(n)}>
                    <Star className={`size-8 ${n <= feedbackRating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="panel p-6">
              <div className="font-semibold mb-3">Your Feedback</div>
              {feedbackSubmitted ? (
                <p className="text-sm text-primary flex items-center gap-2"><Check className="size-4" /> Thanks — your feedback was submitted.</p>
              ) : (
                <>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value.slice(0, 500))}
                    placeholder="Tell us what you think..."
                    className="w-full h-32 bg-background border border-input rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="text-xs text-muted-foreground text-right mt-1">{feedbackMessage.length}/500</div>
                  {feedbackError && <p className="text-sm text-destructive mt-1">{feedbackError}</p>}
                </>
              )}
            </div>

            {!feedbackSubmitted && (
              <button
                disabled={!feedbackMessage.trim() || feedbackRating === 0 || feedbackLoading}
                onClick={handleFeedbackSubmit}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-ring text-white text-sm font-semibold disabled:opacity-50"
              >
                {feedbackLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Panel({
  icon: Icon, title, subtitle, children, rightSlot, iconClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
  iconClass?: string;
}) {
  return (
    <section className="panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${iconClass ?? "text-primary"}`} />
          <div>
            <div className="font-semibold">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {rightSlot}
      </div>
      {children}
    </section>
  );
}

function toList(s: string): string[] {
  return s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
}
function fromList(a: string[] | undefined): string {
  return (a ?? []).join(', ');
}

function VoiceStyleEditDialog({
  open, onOpenChange, profile, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: VoiceProfile | null;
  onSave: (updated: VoiceProfile) => void;
}) {
  const [slang, setSlang] = useState('');
  const [pron, setPron] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [tone, setTone] = useState('');
  const [vocabulary, setVocabulary] = useState('');

  useEffect(() => {
    if (!profile) return;
    setSlang(fromList(profile.slang));
    setPron(fromList(profile.pronunciationNotes));
    setWritingStyle(profile.writingStyle ?? '');
    setTone(profile.tone ?? '');
    setVocabulary(profile.vocabulary ?? '');
  }, [profile, open]);

  if (!profile) return null;

  const save = () => {
    onSave({
      ...profile,
      slang: toList(slang),
      pronunciationNotes: toList(pron),
      writingStyle: writingStyle.trim(),
      tone: tone.trim() || profile.tone,
      vocabulary: vocabulary.trim() || profile.vocabulary,
      updatedAt: Date.now(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="size-4 text-primary" /> Edit voice style
          </DialogTitle>
          <DialogDescription>
            These fields shape every script we generate for you. Update them before generating your next script.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <FormField label="Writing style">
            <textarea value={writingStyle} onChange={(e) => setWritingStyle(e.target.value)} rows={2}
              className="w-full bg-background border border-input rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
          <FormField label="Slang & code-mix (comma or newline separated)">
            <textarea value={slang} onChange={(e) => setSlang(e.target.value)} rows={2}
              className="w-full bg-background border border-input rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
          <FormField label="Pronunciation notes">
            <textarea value={pron} onChange={(e) => setPron(e.target.value)} rows={2}
              className="w-full bg-background border border-input rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tone">
              <input value={tone} onChange={(e) => setTone(e.target.value)}
                className="w-full bg-background border border-input rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
            </FormField>
            <FormField label="Vocabulary">
              <input value={vocabulary} onChange={(e) => setVocabulary(e.target.value)}
                className="w-full bg-background border border-input rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
            </FormField>
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="px-3 py-2 rounded-lg border border-input text-xs inline-flex items-center gap-1.5 hover:bg-muted">
            <X className="size-3.5" /> Cancel
          </button>
          <button onClick={save} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs inline-flex items-center gap-1.5 hover:opacity-90">
            <Save className="size-3.5" /> Save style
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormField({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{label}</div>
      {children}
    </div>
  );
}

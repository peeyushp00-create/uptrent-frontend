import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { getPostLoginPath } from "@/lib/authRedirect";
import { useTheme } from "@/contexts/ThemeContext";

const IG_GRAD = "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--ring)))";
const IG = "hsl(var(--primary))";

export default function LoginPage() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"login" | "forgot" | "forgot_sent">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const postLoginPath = getPostLoginPath(location.state);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(postLoginPath, { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${postLoginPath}` }
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError('Please enter a valid email.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      setResetError(error.message);
    } else {
      setView('forgot_sent');
    }
  };

  // ── FORGOT PASSWORD VIEW ──
  if (view === 'forgot') {
    return (
      <div className={`theme-redesign ${theme} flex items-center justify-center min-h-screen bg-background text-foreground px-4`}>
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <img src="/socialrum-logo.png" alt="SocialRum" className="w-12 h-12 rounded-xl" />
            <h1 className="text-2xl font-bold text-foreground">Forgot Password?</h1>
            <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                onFocus={e => e.target.style.borderColor = "hsl(var(--primary) / 0.38)"}
                onBlur={e => e.target.style.borderColor = ''}
              />
            </div>

            {resetError && <p className="text-sm text-red-400">{resetError}</p>}

            <button type="submit" disabled={resetLoading}
              className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: IG_GRAD }}>
              {resetLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
            </button>
          </form>

          <button onClick={() => { setView('login'); setResetError(''); }}
            className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── RESET LINK SENT VIEW ──
  if (view === 'forgot_sent') {
    return (
      <div className={`theme-redesign ${theme} flex items-center justify-center min-h-screen bg-background text-foreground px-4`}>
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ background: "hsl(var(--primary) / 0.08)" }}>
              📧
            </div>
            <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a password reset link to<br />
              <span className="font-semibold" style={{ color: IG }}>{resetEmail}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl text-sm text-muted-foreground"
            style={{ background: "hsl(var(--primary) / 0.03)", border: "1px solid hsl(var(--primary) / 0.13)" }}>
            Click the link in the email to reset your password. Check your spam folder if you don't see it.
          </div>

          <button onClick={() => { setView('login'); setResetEmail(''); setResetError(''); }}
            className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── LOGIN VIEW ──
  return (
    <div className={`theme-redesign ${theme} flex items-center justify-center min-h-screen bg-background text-foreground px-4`}>
      <SEO title="Log In — SocialRum" noindex />
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/socialrum-logo.png" alt="SocialRum" className="w-12 h-12 rounded-xl" />
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your SocialRum account</p>
        </div>

        <button onClick={handleGoogleLogin} disabled={googleLoading}
          className="w-full py-3 px-4 rounded-xl border border-border bg-card text-foreground text-sm font-medium flex items-center justify-center gap-3 hover:bg-accent transition-colors disabled:opacity-60">
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              id="email" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('password')?.focus(); } }}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
              onFocus={e => e.target.style.borderColor = "hsl(var(--primary) / 0.38)"}
              onBlur={e => e.target.style.borderColor = ''}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
              {/* ✅ Forgot password link */}
              <button type="button" onClick={() => { setView('forgot'); setResetEmail(email); setResetError(''); }}
                className="text-xs hover:underline transition-colors"
                style={{ color: IG }}>
                Forgot password?
              </button>
            </div>
            <input
              id="password" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleLogin(e as any); } }}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
              onFocus={e => e.target.style.borderColor = "hsl(var(--primary) / 0.38)"}
              onBlur={e => e.target.style.borderColor = ''}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: IG_GRAD }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium hover:underline" style={{ color: IG }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

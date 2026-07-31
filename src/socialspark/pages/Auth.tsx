import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/socialspark/contexts/AuthContext";

import { z } from "zod";

const authSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});



export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, signInWithGithub, resetPassword } = useAuth();

  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = isSignUp ? "Sign up | ContentAI" : "Sign in | ContentAI";
  }, [isSignUp]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (isSignUp) {
        authSchema.parse(formData);
      } else {
        authSchema.omit({ name: true }).parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.name);
        toast.success("Account created successfully!");
      } else {
        await signIn(formData.email, formData.password);
        toast.success("Welcome back!");
      }
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage((error as { code: string }).code);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!");
      navigate("/dashboard");
    } catch (error: unknown) {
      toast.error(getFirebaseErrorMessage((error as { code: string }).code));
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      toast.success("Signed in with GitHub!");
      navigate("/dashboard");
    } catch (error: unknown) {
      toast.error(getFirebaseErrorMessage((error as { code: string }).code));
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }
    try {
      await resetPassword(formData.email);
      toast.success("Password reset email sent!");
    } catch (error: unknown) {
      toast.error(getFirebaseErrorMessage((error as { code: string }).code));
    }
  };



  const getFirebaseErrorMessage = (code: string): string => {
    switch (code) {
      case "app/firebase-not-configured":
        return "Firebase is not configured. Please add your Firebase Web App keys.";
      case "auth/api-key-not-valid":
        return "Firebase API key is invalid. Please check your Firebase config.";
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in instead.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled.";
      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-24 py-4 sm:py-8 lg:py-0">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 lg:mb-8 w-fit">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to home</span>
        </Link>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 lg:mb-8">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg sm:text-xl lg:text-2xl font-bold gradient-text">ContentAI</span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 lg:mb-8">
            {isSignUp ? "Start your journey to automated content distribution" : "Sign in to access your dashboard"}
          </p>



          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6 lg:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleGoogleSignIn}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="hidden sm:inline">Google</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleGithubSignIn}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 lg:mt-8">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline font-medium"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 to-accent/20 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-8 flex items-center justify-center animate-float">
            <Zap className="h-12 w-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">
            Automate Your Content Empire
          </h2>
          <p className="text-muted-foreground">
            Upload videos, let AI optimize everything, and publish across all platforms with a single click.
          </p>
        </div>
      </div>
    </div>
  );
}


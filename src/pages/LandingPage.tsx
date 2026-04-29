import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, Sparkles, Newspaper, FileText,
  Check, Star, ArrowRight, Zap, Target, Users
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Trending Topics",
    description: "Discover what's trending on Instagram and YouTube across 20+ niches in real time."
  },
  {
    icon: Sparkles,
    title: "AI Script Generator",
    description: "Generate ready-to-film scripts with hooks, body and CTA in seconds using Claude AI."
  },
  {
    icon: Newspaper,
    title: "Live News Feed",
    description: "Stay updated with the latest news in your niche to create timely content."
  },
  {
    icon: FileText,
    title: "Content Ideas",
    description: "Never run out of ideas. Get AI-powered content suggestions tailored to your niche."
  },
  {
    icon: Target,
    title: "Hashtag Research",
    description: "Find the best hashtags for maximum reach on Instagram and YouTube."
  },
  {
    icon: Zap,
    title: "Quick Hooks",
    description: "Generate viral hooks that stop the scroll and grab attention in the first 3 seconds."
  },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    handle: "@rahulfinance",
    niche: "Finance Creator",
    text: "Uptrent helped me grow from 5K to 50K followers in 3 months. The trending topics feature is a game changer!",
    avatar: "RS",
    stars: 5
  },
  {
    name: "Priya Mehta",
    handle: "@priyafitness",
    niche: "Fitness Creator",
    text: "I used to spend hours writing scripts. Now Uptrent generates them in seconds and they perform way better!",
    avatar: "PM",
    stars: 5
  },
  {
    name: "Arjun Kapoor",
    handle: "@arjuntech",
    niche: "Tech Creator",
    text: "The AI chat feature is incredible. It's like having a personal content strategist available 24/7.",
    avatar: "AK",
    stars: 5
  },
];

const freeFeatures = [
  "3 script generations per month",
  "Limited trending topics",
  "Basic news feed",
  "AI chat (5 messages/day)",
];

const proFeatures = [
  "Unlimited script generations",
  "Full trending data (20+ niches)",
  "Complete news feed",
  "Unlimited AI chat",
  "Hashtag research",
  "Content calendar",
  "Priority support",
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Uptrent" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg">Uptrent</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #E8B84B, #C17D20)" }}
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 md:py-32 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 max-w-3xl"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            AI-powered content discovery platform
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Create{" "}
            <span className="text-pink-500">Viral Content</span>{" "}
            for{" "}
            <span className="text-orange-500">Instagram</span>{" "}
            & YouTube
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl">
            Discover trending topics, generate AI scripts, find viral hashtags and grow your audience — all in one platform.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-white font-medium text-base"
              style={{ background: "linear-gradient(135deg, #E8B84B, #C17D20)" }}
            >
              Start for Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-xl border border-border bg-card text-foreground font-medium text-base hover:bg-accent transition-colors"
            >
              Login
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            No credit card required · Free plan available
          </p>
        </motion.div>

        {/* Hero image placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-4xl bg-card border border-border rounded-2xl p-8 mt-4"
        >
          <div className="grid grid-cols-3 gap-4">
            {["Fitness & Gym", "Stock Market", "Cricket & IPL"].map((topic, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  <span className="text-xs text-muted-foreground">Trending</span>
                </div>
                <p className="font-medium text-sm">{topic}</p>
                <p className="text-xs text-green-400 mt-1">↑ Rising</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-16 py-12 border-y border-border bg-card">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "20+", label: "Niches covered" },
            { value: "500+", label: "Scripts generated" },
            { value: "10K+", label: "Trending topics" },
            { value: "99%", label: "Creator satisfaction" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl font-bold text-pink-500">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything you need to go viral</h2>
            <p className="text-muted-foreground">Powerful tools built for content creators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-pink-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-pink-500" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-16 py-20 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Loved by creators</h2>
            <p className="text-muted-foreground">See what creators are saying about Uptrent</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-background border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.niche}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Simple pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you're ready</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free plan */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="font-bold text-xl mb-1">Free</h3>
              <p className="text-muted-foreground text-sm mb-4">Perfect to get started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-xl border border-border text-foreground font-medium hover:bg-accent transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro plan */}
            <div className="bg-card border-2 border-pink-500 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-medium text-white"
                style={{ background: "linear-gradient(135deg, #E8B84B, #C17D20)" }}>
                Most Popular
              </div>
              <h3 className="font-bold text-xl mb-1">Pro</h3>
              <p className="text-muted-foreground text-sm mb-4">For serious creators</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹799</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {proFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-pink-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-xl text-white font-medium"
                style={{ background: "linear-gradient(135deg, #E8B84B, #C17D20)" }}
              >
                Start Pro Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-16 py-20 bg-card border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to go viral?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of creators using Uptrent to grow faster</p>
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-white font-medium text-base mx-auto"
            style={{ background: "linear-gradient(135deg, #E8B84B, #C17D20)" }}
          >
            Start for Free Today
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-8 border-t border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Uptrent" className="w-6 h-6 rounded" />
            <span className="font-bold text-sm">Uptrent</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Uptrent Media. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

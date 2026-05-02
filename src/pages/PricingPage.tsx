import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Crown, Zap, Sparkles, TrendingUp, Newspaper,
  FileText, BarChart2, Hash, Infinity, ArrowRight,
  Shield, Star, Users, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const BLUE_G = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const GOLD_G = "linear-gradient(135deg, #E8B84B, #C17D20)";
const BLUE = "#3B82F6";
const GOLD = "#E8B84B";

const FREE_FEATURES = [
  "3 AI script generations/month",
  "Basic trending topics",
  "News feed (5 articles/day)",
  "AI chat (5 messages/day)",
  "Instagram Reels explorer",
];

const PRO_FEATURES = [
  { icon: Infinity, text: "Unlimited AI script generations" },
  { icon: TrendingUp, text: "Full trending data — 20+ niches" },
  { icon: Newspaper, text: "Complete news feed — all articles" },
  { icon: Sparkles, text: "Unlimited AI chat" },
  { icon: Hash, text: "YouTube SEO optimizer" },
  { icon: BarChart2, text: "Channel & profile analyzer" },
  { icon: FileText, text: "Viral hook engine" },
  { icon: Zap, text: "Priority support" },
];

declare global {
  interface Window { Razorpay: any; }
}

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!user) { setCheckingStatus(false); return; }
    fetch(`${BASE}/api/payment/status?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => { setIsPro(data.is_pro); setCheckingStatus(false); })
      .catch(() => setCheckingStatus(false));
  }, [user]);

  const handlePayment = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);

    try {
      const plan = annual ? 'pro_annual' : 'pro_monthly';
      const res = await fetch(`${BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, user_id: user.id, email: user.email }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error);

      const options = {
        key: RAZORPAY_KEY || order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Uptrent',
        description: order.description,
        image: '/logo.png',
        order_id: order.order_id,
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        },
        theme: { color: BLUE },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch(`${BASE}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
              email: user.email,
              plan,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setIsPro(true);
            setSuccess(true);
            setLoading(false);
          } else {
            alert('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert(e.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .cg{font-family:'Cormorant Garamond',serif!important}
        .dm{font-family:'DM Sans',sans-serif!important}
      `}</style>

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Crown className="w-5 h-5" style={{ color: GOLD }} />
          <h1 className="text-lg font-bold text-foreground dm">Pricing</h1>
          {isPro && (
            <span className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}30` }}>
              <Crown className="w-3 h-3" /> Pro Active
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">

        {/* Success banner */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-2xl flex items-center gap-3"
              style={{ background: "#22c55e12", border: "1px solid #22c55e30" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#22c55e20" }}>
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="dm font-semibold text-foreground text-sm">🎉 Welcome to Uptrent Pro!</p>
                <p className="dm text-xs text-muted-foreground">Your subscription is now active. Enjoy unlimited access!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Already pro */}
        {isPro && !success && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 rounded-2xl text-center"
            style={{ background: `${GOLD}0D`, border: `1px solid ${GOLD}25` }}>
            <Crown className="w-10 h-10 mx-auto mb-3" style={{ color: GOLD }} />
            <h2 className="cg font-bold text-2xl mb-1" style={{ color: GOLD }}>You're on Pro!</h2>
            <p className="dm text-sm text-muted-foreground">You have full access to all Uptrent Pro features.</p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="dm text-xs uppercase tracking-widest mb-2" style={{ color: BLUE, letterSpacing: ".16em" }}>Pricing</p>
          <h2 className="cg font-bold mb-3" style={{ fontSize: "clamp(36px, 6vw, 60px)", color: "hsl(var(--foreground))", lineHeight: 1.1 }}>
            Simple, <span style={{ background: BLUE_G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Honest</span> Pricing
          </h2>
          <p className="dm text-sm text-muted-foreground">Start free. Upgrade when you're ready.</p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="dm text-sm" style={{ color: annual ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))" }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)}
              className="w-12 h-6 rounded-full relative transition-all"
              style={{ background: annual ? BLUE_G : "hsl(var(--border))" }}>
              <motion.div animate={{ x: annual ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
            <span className="dm text-sm flex items-center gap-2" style={{ color: annual ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
              Annual
              <span className="dm text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "#22c55e18", color: "#22c55e" }}>Save 30%</span>
            </span>
          </div>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">

          {/* Free plan */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="rounded-2xl p-8 bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="cg font-bold text-2xl text-foreground">Free</h3>
              <span className="dm text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">Current Plan</span>
            </div>
            <p className="dm text-sm text-muted-foreground mb-6">Perfect to get started</p>
            <div className="flex items-end gap-1 mb-8">
              <span className="cg font-bold text-foreground" style={{ fontSize: 52, lineHeight: 1 }}>₹0</span>
              <span className="dm text-sm text-muted-foreground mb-1.5">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 dm text-sm text-muted-foreground">
                  <Check className="w-4 h-4 shrink-0 text-muted-foreground" />{f}
                </li>
              ))}
            </ul>
            <button className="w-full py-3.5 rounded-xl dm font-medium text-sm border border-border text-muted-foreground cursor-default">
              Current Plan
            </button>
          </motion.div>

          {/* Pro plan */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            whileHover={{ boxShadow: "0 0 60px #3B82F618" }}
            className="rounded-2xl p-8 relative transition-all"
            style={{ background: "hsl(var(--card))", border: `1px solid ${BLUE}40` }}>

            {/* Popular badge */}
            <motion.div animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full dm text-xs font-semibold"
              style={{ background: BLUE_G, color: "#fff" }}>
              ✦ Most Popular
            </motion.div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className="cg font-bold text-2xl text-foreground">Pro</h3>
              <Crown className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <p className="dm text-sm text-muted-foreground mb-6">For serious creators</p>
            <div className="flex items-end gap-1 mb-1">
              <motion.span key={annual ? "annual" : "monthly"}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="cg font-bold" style={{ fontSize: 52, lineHeight: 1, background: BLUE_G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {annual ? "₹559" : "₹799"}
              </motion.span>
              <span className="dm text-sm text-muted-foreground mb-1.5">/month</span>
            </div>
            {annual && <p className="dm text-xs text-green-400 mb-6">Billed ₹5,599/year — save ₹2,389</p>}
            {!annual && <div className="mb-6" />}

            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${BLUE}18` }}>
                    <f.icon className="w-3 h-3" style={{ color: BLUE }} />
                  </div>
                  <span className="dm text-sm text-foreground">{f.text}</span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: isPro ? 1 : 1.02, boxShadow: isPro ? "none" : "0 8px 32px #3B82F630" }}
              whileTap={{ scale: isPro ? 1 : 0.98 }}
              onClick={isPro ? undefined : handlePayment}
              disabled={loading || isPro}
              className="w-full py-4 rounded-xl dm font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
              style={{ background: isPro ? "#22c55e" : BLUE_G, color: "#fff" }}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : isPro ? (
                <><Check className="w-4 h-4" /> Already on Pro</>
              ) : (
                <><Crown className="w-4 h-4" /> Upgrade to Pro — {annual ? "₹559" : "₹799"}/mo <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>

            <p className="dm text-xs text-muted-foreground text-center mt-3">
              UPI · Cards · Netbanking · No hidden fees
            </p>
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: Shield, title: "Secure Payments", desc: "256-bit SSL encryption via Razorpay" },
            { icon: Star, title: "Cancel Anytime", desc: "No lock-in. Cancel with one click." },
            { icon: Users, title: "10,000+ Creators", desc: "Trusted by Indian content creators" },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl bg-card border border-border gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${BLUE}12` }}>
                <b.icon className="w-4 h-4" style={{ color: BLUE }} />
              </div>
              <p className="dm font-semibold text-foreground text-xs">{b.title}</p>
              <p className="dm text-xs text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="cg font-bold text-2xl text-foreground mb-5">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {[
              { q: "Can I cancel anytime?", a: "Yes! You can cancel your Pro subscription anytime. You'll keep access until the end of your billing period." },
              { q: "What payment methods are accepted?", a: "We accept UPI, credit/debit cards, netbanking, and all major Indian payment methods via Razorpay." },
              { q: "Is my payment secure?", a: "Yes. All payments are processed by Razorpay with 256-bit SSL encryption. We never store your card details." },
              { q: "What happens after I upgrade?", a: "Your Pro features are activated instantly after payment. No waiting, no manual approval." },
              { q: "Can I switch from monthly to annual?", a: "Yes! You can switch to annual billing anytime to save 30%." },
            ].map((faq, i) => (
              <div key={i} className="p-4 rounded-2xl bg-card border border-border">
                <p className="dm font-semibold text-sm text-foreground mb-1">{faq.q}</p>
                <p className="dm text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
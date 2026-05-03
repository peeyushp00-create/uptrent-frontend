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

const PLANS = [
  {
    id: "free",
    label: "Free",
    price: "₹0",
    period: "/month",
    desc: "Perfect to get started",
    tag: null,
    features: [
      "3 AI script generations/month",
      "Basic trending topics",
      "News feed (5 articles/day)",
      "Instagram Reels explorer",
    ],
    cta: "Current Plan",
    disabled: true,
    planKey: null,
    accent: "rgba(255,255,255,0.15)",
  },
  {
    id: "pro_monthly",
    label: "Pro",
    price: "₹799",
    period: "/month",
    desc: "Billed monthly · Cancel anytime",
    tag: null,
    features: [
      "Unlimited AI script generations",
      "Full trending data — 20+ niches",
      "Complete news feed",
      "YouTube SEO optimizer",
      "Channel & profile analyzer",
      "Viral hook engine",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    disabled: false,
    planKey: "pro_monthly",
    accent: "#3B82F6",
  },
  {
    id: "pro_quarterly",
    label: "Pro Quarterly",
    price: "₹699",
    period: "/month",
    desc: "Billed ₹2,097 every 3 months",
    tag: "Best Value",
    features: [
      "Everything in Pro Monthly",
      "Save ₹300 every 3 months",
      "Quarterly billing flexibility",
      "Dedicated onboarding support",
      "Early access to new features",
    ],
    cta: "Get Quarterly Plan",
    disabled: false,
    planKey: "pro_quarterly",
    accent: "#E8B84B",
  },
  {
    id: "pro_annual",
    label: "Pro Annual",
    price: "₹559",
    period: "/month",
    desc: "Billed ₹6,708/year · Save 30%",
    tag: "Most Popular",
    features: [
      "Everything in Pro Quarterly",
      "Save ₹2,389 vs monthly",
      "Annual billing — lowest price",
      "Priority feature requests",
      "1-on-1 creator consultation",
    ],
    cta: "Get Annual Plan",
    disabled: false,
    planKey: "pro_annual",
    accent: "#22c55e",
  },
];

declare global { interface Window { Razorpay: any; } }

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
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

  const handlePayment = async (planKey: string, planLabel: string) => {
    if (!user) { navigate('/login'); return; }
    setLoading(planKey);
    try {
      const res = await fetch(`${BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, user_id: user.id, email: user.email }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error);

      const options = {
        key: RAZORPAY_KEY || order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'SocialRum',
        description: order.description,
        image: '/logo.png',
        order_id: order.order_id,
        prefill: { name: user.user_metadata?.full_name || '', email: user.email || '' },
        theme: { color: '#3B82F6' },
        modal: { ondismiss: () => setLoading(null) },
        handler: async (response: any) => {
          const verifyRes = await fetch(`${BASE}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id, email: user.email, plan: planKey,
            }),
          });
          const v = await verifyRes.json();
          if (v.success) { setIsPro(true); setSuccess(true); }
          else alert('Payment verification failed. Contact support.');
          setLoading(null);
        },
      };
      new window.Razorpay(options).open();
    } catch (e: any) {
      alert(e.message || 'Something went wrong');
      setLoading(null);
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .cg{font-family:'Cormorant Garamond',serif!important}
        .dm{font-family:'DM Sans',sans-serif!important}
        *{box-sizing:border-box}
        .glass-card{
          background:rgba(255,255,255,0.04);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.08);
          transition:all .25s ease;
        }
        .glass-card:hover{
          background:rgba(255,255,255,0.07);
          border-color:rgba(255,255,255,0.14);
          transform:translateY(-4px);
        }
        .glass-card.featured{
          border-color:rgba(232,184,75,0.35);
          background:rgba(232,184,75,0.05);
        }
        .glass-card.featured:hover{
          border-color:rgba(232,184,75,0.5);
          background:rgba(232,184,75,0.08);
        }
      `}</style>

      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale:[1,1.2,1],opacity:[0.06,0.12,0.06] }} transition={{ duration:10,repeat:Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background:"radial-gradient(circle,#3B82F6,transparent 70%)",filter:"blur(80px)" }}/>
        <motion.div animate={{ scale:[1.1,1,1.1],opacity:[0.04,0.09,0.04] }} transition={{ duration:14,repeat:Infinity,delay:3 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background:"radial-gradient(circle,#E8B84B,transparent 70%)",filter:"blur(80px)" }}/>
        <motion.div animate={{ scale:[1,1.15,1],opacity:[0.03,0.07,0.03] }} transition={{ duration:12,repeat:Infinity,delay:6 }}
          className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full"
          style={{ background:"radial-gradient(circle,#22c55e,transparent 70%)",filter:"blur(80px)" }}/>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-20 px-4 py-3"
        style={{ background:"rgba(0,0,0,0.4)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Crown className="w-5 h-5" style={{ color:"#E8B84B" }}/>
          <h1 className="cg font-bold text-lg text-foreground">Pricing</h1>
          {isPro && (
            <span className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-full dm text-xs font-semibold"
              style={{ background:"rgba(232,184,75,0.15)",color:"#E8B84B",border:"1px solid rgba(232,184,75,0.3)" }}>
              <Crown className="w-3 h-3"/> Pro Active
            </span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 pb-24 relative z-10">

        {/* Success banner */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity:0,y:-16 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
              className="mb-8 p-5 rounded-2xl flex items-center gap-4 glass-card"
              style={{ borderColor:"rgba(34,197,94,0.35)",background:"rgba(34,197,94,0.08)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:"rgba(34,197,94,0.2)" }}>
                <Check className="w-5 h-5 text-green-400"/>
              </div>
              <div>
                <p className="cg font-bold text-foreground text-lg">Welcome to SocialRum Pro! ✦</p>
                <p className="dm text-xs text-muted-foreground">Your subscription is now active. Enjoy unlimited access to everything.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} className="text-center mb-14">
          <motion.div initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} transition={{ delay:0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full dm text-xs font-medium mb-6"
            style={{ background:"rgba(232,184,75,0.1)",border:"1px solid rgba(232,184,75,0.2)",color:"#E8B84B",letterSpacing:".12em" }}>
            <motion.span animate={{ opacity:[1,0.2,1] }} transition={{ duration:2,repeat:Infinity }}
              className="w-1.5 h-1.5 rounded-full inline-block" style={{ background:"#E8B84B" }}/>
            SIMPLE · TRANSPARENT · HONEST
          </motion.div>

          <h2 className="cg font-bold text-foreground mb-4" style={{ fontSize:"clamp(42px,7vw,80px)",lineHeight:1.05 }}>
            Choose Your <span className="italic" style={{ background:"linear-gradient(135deg,#E8B84B,#C17D20)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Plan</span>
          </h2>
          <p className="dm text-muted-foreground text-base max-w-lg mx-auto" style={{ lineHeight:1.7 }}>
            Start free and upgrade when you're ready. All paid plans include full access to every Pro feature.
          </p>
        </motion.div>

        {/* Plans grid — 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.id}
              initial={{ opacity:0,y:32 }} animate={{ opacity:1,y:0 }}
              transition={{ delay:i*0.08,duration:0.5,ease:[0.16,1,0.3,1] }}
              className={`glass-card rounded-3xl p-6 flex flex-col relative ${plan.tag === "Most Popular" || plan.tag === "Best Value" ? "featured" : ""}`}>

              {/* Tag badge */}
              {plan.tag && (
                <motion.div animate={{ opacity:[0.85,1,0.85] }} transition={{ duration:2.5,repeat:Infinity }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full dm text-xs font-semibold whitespace-nowrap"
                  style={{
                    background: plan.tag === "Most Popular"
                      ? "linear-gradient(135deg,#E8B84B,#C17D20)"
                      : "linear-gradient(135deg,#3B82F6,#1D4ED8)",
                    color: "#fff"
                  }}>
                  ✦ {plan.tag}
                </motion.div>
              )}

              {/* Plan name */}
              <div className="mb-4 mt-2">
                <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2" style={{ letterSpacing:".14em" }}>
                  {plan.label}
                </p>
                <div className="flex items-end gap-1">
                  <span className="cg font-bold text-foreground" style={{ fontSize:48,lineHeight:1,
                    ...(plan.accent !== "rgba(255,255,255,0.15)" ? {
                      background:`linear-gradient(135deg,${plan.accent},${plan.accent}99)`,
                      WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
                    } : {}) }}>
                    {plan.price}
                  </span>
                  <span className="dm text-xs text-muted-foreground mb-1.5">{plan.period}</span>
                </div>
                <p className="dm text-xs text-muted-foreground mt-1">{plan.desc}</p>
              </div>

              {/* Divider */}
              <div className="w-full h-px mb-4" style={{ background:"rgba(255,255,255,0.06)" }}/>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background:`${plan.accent === "rgba(255,255,255,0.15)" ? "rgba(255,255,255,0.1)" : plan.accent + "20"}` }}>
                      <Check className="w-2.5 h-2.5" style={{ color: plan.accent === "rgba(255,255,255,0.15)" ? "rgba(255,255,255,0.5)" : plan.accent }}/>
                    </div>
                    <span className="dm text-xs text-muted-foreground leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <motion.button
                whileHover={plan.disabled || isPro ? {} : { scale:1.03 }}
                whileTap={plan.disabled || isPro ? {} : { scale:0.97 }}
                onClick={() => plan.planKey && !plan.disabled && !isPro && handlePayment(plan.planKey, plan.label)}
                disabled={plan.disabled || !!loading || (isPro && plan.id !== "free")}
                className="w-full py-3 rounded-2xl dm font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{
                  background: plan.disabled
                    ? "rgba(255,255,255,0.06)"
                    : isPro && plan.id !== "free"
                      ? "rgba(34,197,94,0.2)"
                      : plan.accent === "rgba(255,255,255,0.15)"
                        ? "rgba(255,255,255,0.08)"
                        : `linear-gradient(135deg,${plan.accent},${plan.accent}99)`,
                  color: plan.disabled ? "rgba(255,255,255,0.3)"
                    : isPro && plan.id !== "free" ? "#22c55e"
                    : plan.accent === "rgba(255,255,255,0.15)" ? "rgba(255,255,255,0.4)"
                    : "#fff",
                  border: plan.disabled || plan.accent === "rgba(255,255,255,0.15)"
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "none"
                }}>
                {loading === plan.planKey
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin"/> Processing...</>
                  : isPro && plan.id !== "free"
                    ? <><Check className="w-3.5 h-3.5"/> Active</>
                    : <>{plan.cta} {!plan.disabled && <ArrowRight className="w-3.5 h-3.5"/>}</>}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Comparison note */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          className="glass-card rounded-2xl p-6 mb-12">
          <h3 className="cg font-bold text-foreground text-xl mb-4">All Pro plans include</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Infinity, label: "Unlimited Scripts", desc: "Generate as many scripts as you want" },
              { icon: TrendingUp, label: "20+ Niches", desc: "Full trending data across all niches" },
              { icon: BarChart2, label: "Analytics", desc: "Channel and profile deep insights" },
              { icon: Zap, label: "Priority Support", desc: "Get help when you need it" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background:"rgba(232,184,75,0.12)",border:"1px solid rgba(232,184,75,0.2)" }}>
                  <f.icon className="w-4 h-4" style={{ color:"#E8B84B" }}/>
                </div>
                <p className="dm font-semibold text-foreground text-sm">{f.label}</p>
                <p className="dm text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.55 }}
          className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: Shield, title: "Secure Payments", desc: "256-bit SSL · Razorpay" },
            { icon: Star, title: "Cancel Anytime", desc: "No lock-in period" },
            { icon: Users, title: "10,000+ Creators", desc: "Trusted across India" },
          ].map((b, i) => (
            <div key={i} className="glass-card rounded-2xl flex flex-col items-center text-center p-4 gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(59,130,246,0.12)" }}>
                <b.icon className="w-4 h-4" style={{ color:"#60A5FA" }}/>
              </div>
              <p className="cg font-bold text-foreground text-sm">{b.title}</p>
              <p className="dm text-xs text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.6 }}>
          <h3 className="cg font-bold text-foreground mb-5" style={{ fontSize:28 }}>Frequently Asked Questions</h3>
          <div className="space-y-3">
            {[
              { q: "What's the difference between the plans?", a: "All paid plans give you the same Pro features. The difference is billing frequency — monthly gives flexibility, quarterly saves ₹300 every 3 months, and annual gives the lowest price at ₹559/month." },
              { q: "Can I cancel anytime?", a: "Yes! Cancel anytime from your settings. You'll keep Pro access until the end of your current billing period." },
              { q: "What payment methods are accepted?", a: "UPI, credit/debit cards, netbanking, wallets and all major Indian payment methods via Razorpay." },
              { q: "Is my payment secure?", a: "Yes. All payments are processed by Razorpay with 256-bit SSL encryption. We never store your card details." },
              { q: "Can I upgrade from monthly to annual?", a: "Yes! You can switch to a higher plan anytime to save more." },
            ].map((faq, i) => (
              <div key={i} className="glass-card p-4 rounded-2xl">
                <p className="cg font-bold text-foreground text-base mb-1">{faq.q}</p>
                <p className="dm text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
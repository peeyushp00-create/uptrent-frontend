import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Crown, Zap, TrendingUp, BarChart2,
  Infinity, ArrowRight, Shield, Star, Users, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const IG_GRAD = "linear-gradient(135deg, #7C3AED, #22D3EE)";
const IG = "#7C3AED";
const GOLD_GRAD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const GOLD = "#E8B84B";

const PLANS = (annual: boolean) => [
  {
    id: "free",
    label: "Beginner",
    monthly: 0,
    annual: 0,
    price: "₹0",
    period: "/month",
    billing: "Free forever",
    tag: null,
    emoji: "🌱",
    features: [
      "3 AI script generations/month",
      "Basic trending topics",
      "News feed (5 articles/day)",
      "Instagram Reels explorer",
      "Micro niche search",
    ],
    cta: "Get Started Free",
    disabled: true,
    planKey: null,
    accentColor: "rgba(255,255,255,0.5)",
    accentGrad: "rgba(255,255,255,0.08)",
    isFree: true,
    cardClass: "",
  },
  {
    id: "creator",
    label: "Creator",
    monthly: 499,
    annual: 399,
    price: annual ? "₹399" : "₹499",
    period: "/month",
    billing: annual ? "Billed ₹4,788/year · Save ₹1,200" : "Billed monthly · Cancel anytime",
    tag: "Best Value",
    emoji: "🚀",
    features: [
      "50 AI script generations/month",
      "Full trending data — 20+ niches",
      "Complete news feed",
      "Instagram Reels explorer",
      "Micro niche search",
      "Viral hook engine",
      "Email support",
    ],
    cta: annual ? "Get Creator Annual" : "Get Creator Plan",
    disabled: false,
    planKey: annual ? "creator_annual" : "creator",
    accentColor: IG,
    accentGrad: IG_GRAD,
    isFree: false,
    cardClass: "teal",
  },
  {
    id: "pro",
    label: "Pro",
    monthly: 799,
    annual: 599,
    price: annual ? "₹599" : "₹799",
    period: "/month",
    billing: annual ? "Billed ₹7,188/year · Save ₹2,400" : "Billed monthly · Cancel anytime",
    tag: "Most Popular",
    emoji: "👑",
    features: [
      "Unlimited AI script generations",
      "Full trending data — 20+ niches",
      "Complete news feed",
      "YouTube SEO optimizer",
      "Channel & profile analyzer",
      "Viral hook engine",
      "1-on-1 creator consultation",
      "Priority support",
    ],
    cta: annual ? "Get Pro Annual" : "Upgrade to Pro",
    disabled: false,
    planKey: annual ? "pro_annual" : "pro_monthly",
    accentColor: GOLD,
    accentGrad: GOLD_GRAD,
    isFree: false,
    cardClass: "gold",
  },
];

declare global { interface Window { Razorpay: any; } }

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [success, setSuccess] = useState(false);

  const plans = PLANS(annual);

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
        theme: { color: planKey.includes('pro') ? GOLD : IG },
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
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: IG }} />
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
        .plan-card{background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.07);transition:all .25s ease;}
        .plan-card:hover{background:rgba(255,255,255,0.06);transform:translateY(-6px);}
        .plan-card.teal{border-color:rgba(20,187,166,0.25);background:rgba(20,187,166,0.04);}
        .plan-card.teal:hover{border-color:rgba(20,187,166,0.4);background:rgba(20,187,166,0.07);}
        .plan-card.gold{border-color:rgba(232,184,75,0.3);background:rgba(232,184,75,0.04);}
        .plan-card.gold:hover{border-color:rgba(232,184,75,0.5);background:rgba(232,184,75,0.08);}
        .toggle-track{position:relative;width:52px;height:28px;border-radius:99px;transition:background .3s;cursor:pointer;border:none;padding:0;}
        .toggle-thumb{position:absolute;top:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:left .3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 2px 8px rgba(0,0,0,0.3);}
      `}</style>

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale:[1,1.2,1],opacity:[0.05,0.1,0.05] }} transition={{ duration:10,repeat:Infinity }}
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full"
          style={{ background:"radial-gradient(circle,#7C3AED,transparent 70%)",filter:"blur(80px)" }}/>
        <motion.div animate={{ scale:[1.1,1,1.1],opacity:[0.04,0.08,0.04] }} transition={{ duration:14,repeat:Infinity,delay:3 }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
          style={{ background:"radial-gradient(circle,#E8B84B,transparent 70%)",filter:"blur(80px)" }}/>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-20 px-4 py-3"
        style={{ background:"rgba(0,0,0,0.4)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <Crown className="w-5 h-5" style={{ color: GOLD }}/>
          <h1 className="cg font-bold text-lg text-foreground">Pricing</h1>
          {isPro && (
            <span className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-full dm text-xs font-semibold"
              style={{ background:"rgba(232,184,75,0.15)",color: GOLD,border:"1px solid rgba(232,184,75,0.3)" }}>
              <Crown className="w-3 h-3"/> Pro Active
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 pb-24 relative z-10">

        {/* Success banner */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity:0,y:-16 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
              className="mb-8 p-5 rounded-2xl flex items-center gap-4"
              style={{ border:"1px solid rgba(20,187,166,0.35)",background:"rgba(20,187,166,0.08)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: IG_GRAD }}>
                <Check className="w-5 h-5 text-white"/>
              </div>
              <div>
                <p className="cg font-bold text-foreground text-lg">Welcome to SocialRum Pro! 🎉</p>
                <p className="dm text-xs text-muted-foreground">Your subscription is active. Enjoy unlimited access to everything.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero text */}
        <motion.div initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} className="text-center mb-10">
          <motion.div initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} transition={{ delay:0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full dm text-xs font-medium mb-6"
            style={{ background:"rgba(20,187,166,0.1)",border:"1px solid rgba(20,187,166,0.2)",color: IG,letterSpacing:".12em" }}>
            <motion.span animate={{ opacity:[1,0.2,1] }} transition={{ duration:2,repeat:Infinity }}
              className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: IG }}/>
            SIMPLE · TRANSPARENT · HONEST
          </motion.div>

          <h2 className="cg font-bold text-foreground mb-4" style={{ fontSize:"clamp(42px,7vw,80px)",lineHeight:1.05 }}>
            Choose Your{" "}
            <span className="italic" style={{ background: IG_GRAD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Plan
            </span>
          </h2>
          <p className="dm text-muted-foreground text-base max-w-lg mx-auto mb-8" style={{ lineHeight:1.7 }}>
            Start free. Upgrade when you're ready. No hidden fees.
          </p>

          {/* ── BILLING TOGGLE ── */}
          <div className="flex items-center justify-center gap-4">
            <span className="dm text-sm font-medium" style={{ color: !annual ? "#fff" : "rgba(255,255,255,0.4)" }}>
              Monthly
            </span>
            <button onClick={() => setAnnual(!annual)}
              className="toggle-track"
              style={{ background: annual ? IG_GRAD : "rgba(255,255,255,0.12)" }}>
              <div className="toggle-thumb" style={{ left: annual ? "27px" : "3px" }}/>
            </button>
            <div className="flex items-center gap-2">
              <span className="dm text-sm font-medium" style={{ color: annual ? "#fff" : "rgba(255,255,255,0.4)" }}>
                Annual
              </span>
              <motion.span
                animate={{ scale: annual ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.4 }}
                className="dm text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: annual ? `${IG}25` : "rgba(255,255,255,0.06)", color: annual ? IG : "rgba(255,255,255,0.3)", border: `1px solid ${annual ? IG + "40" : "rgba(255,255,255,0.08)"}` }}>
                Save up to 25%
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* 3 Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div key={plan.id}
              initial={{ opacity:0,y:32 }} animate={{ opacity:1,y:0 }}
              transition={{ delay:i*0.1,duration:0.5,ease:[0.16,1,0.3,1] }}
              className={`plan-card rounded-3xl p-7 flex flex-col relative ${plan.cardClass}`}>

              {/* Badge */}
              {plan.tag && (
                <motion.div animate={{ opacity:[0.85,1,0.85] }} transition={{ duration:2.5,repeat:Infinity }}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full dm text-xs font-bold whitespace-nowrap flex items-center gap-1.5"
                  style={{
                    background: plan.id === 'pro' ? GOLD_GRAD : IG_GRAD,
                    color: plan.id === 'pro' ? "#111" : "#fff",
                    boxShadow: plan.id === 'pro' ? "0 4px 20px rgba(232,184,75,0.3)" : "0 4px 20px rgba(20,187,166,0.3)"
                  }}>
                  {plan.id === 'pro' ? <Crown className="w-3 h-3"/> : '✦'} {plan.tag}
                </motion.div>
              )}

              {/* Emoji + Name */}
              <div className="mb-5 mt-3">
                <div className="text-3xl mb-3">{plan.emoji}</div>
                <p className="dm text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: plan.isFree ? "rgba(255,255,255,0.3)" : plan.accentColor, letterSpacing:".16em" }}>
                  {plan.label}
                </p>

                {/* Price with animation */}
                <AnimatePresence mode="wait">
                  <motion.div key={plan.price}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                    transition={{ duration:0.25 }}>
                    <div className="flex items-end gap-1.5 mb-1">
                      <span className="cg font-bold" style={{
                        fontSize: 56, lineHeight: 1,
                        ...(plan.isFree ? { color: "rgba(255,255,255,0.6)" } : {
                          background: plan.accentGrad,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent"
                        })
                      }}>
                        {plan.price}
                      </span>
                      <span className="dm text-xs text-muted-foreground mb-2">{plan.period}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <p className="dm text-xs text-muted-foreground">{plan.billing}</p>

                {/* Savings pill for annual */}
                {annual && !plan.isFree && (
                  <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                    className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full dm text-xs font-semibold"
                    style={{ background:`${plan.accentColor}20`, color: plan.accentColor, border:`1px solid ${plan.accentColor}30` }}>
                    🎉 You save ₹{plan.id === 'creator' ? '1,200' : '2,400'}/year
                  </motion.div>
                )}
              </div>

              {/* Divider */}
              <div className="w-full h-px mb-5"
                style={{ background: plan.isFree ? "rgba(255,255,255,0.06)" : `${plan.accentColor}25` }}/>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-7">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: plan.isFree ? "rgba(255,255,255,0.08)" : `${plan.accentColor}20` }}>
                      <Check className="w-2.5 h-2.5" style={{ color: plan.isFree ? "rgba(255,255,255,0.35)" : plan.accentColor }}/>
                    </div>
                    <span className="dm text-xs text-muted-foreground leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                whileHover={plan.disabled || isPro ? {} : { scale:1.03 }}
                whileTap={plan.disabled || isPro ? {} : { scale:0.97 }}
                onClick={() => plan.planKey && !plan.disabled && !isPro && handlePayment(plan.planKey, plan.label)}
                disabled={plan.disabled || !!loading || (isPro && !plan.isFree)}
                className="w-full py-3.5 rounded-2xl dm font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{
                  background: plan.disabled
                    ? "rgba(255,255,255,0.06)"
                    : isPro && !plan.isFree
                      ? "rgba(20,187,166,0.15)"
                      : plan.accentGrad,
                  color: plan.disabled
                    ? "rgba(255,255,255,0.25)"
                    : isPro && !plan.isFree
                      ? IG
                      : plan.id === 'pro' ? "#111" : "#fff",
                  border: plan.disabled ? "1px solid rgba(255,255,255,0.06)" : "none",
                  boxShadow: !plan.disabled && !isPro
                    ? plan.id === 'pro'
                      ? "0 8px 24px rgba(232,184,75,0.25)"
                      : plan.id === 'creator'
                        ? "0 8px 24px rgba(20,187,166,0.25)"
                        : "none"
                    : "none"
                }}>
                {loading === plan.planKey
                  ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</>
                  : isPro && !plan.isFree
                    ? <><Check className="w-4 h-4"/> Active</>
                    : <>{plan.cta} {!plan.disabled && <ArrowRight className="w-4 h-4"/>}</>}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* All plans include */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          className="rounded-2xl p-6 mb-12"
          style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="cg font-bold text-foreground text-xl mb-6">Everything in paid plans</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Infinity, label: "Unlimited Scripts", desc: "No monthly limits on Pro", color: IG },
              { icon: TrendingUp, label: "20+ Niches", desc: "Full trending coverage", color: IG },
              { icon: BarChart2, label: "Deep Analytics", desc: "Channel & profile insights", color: GOLD },
              { icon: Zap, label: "Priority Support", desc: "Get help fast", color: GOLD },
            ].map((f, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background:`${f.color}15`,border:`1px solid ${f.color}25` }}>
                  <f.icon className="w-4 h-4" style={{ color: f.color }}/>
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
            { icon: Shield, title: "Secure Payments", desc: "256-bit SSL · Razorpay", color: IG },
            { icon: Star, title: "Cancel Anytime", desc: "No lock-in period", color: GOLD },
            { icon: Users, title: "10,000+ Creators", desc: "Trusted across India", color: IG },
          ].map((b, i) => (
            <div key={i} className="rounded-2xl flex flex-col items-center text-center p-4 gap-2"
              style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background:`${b.color}15` }}>
                <b.icon className="w-4 h-4" style={{ color: b.color }}/>
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
              { q: "What's the difference between Creator and Pro?", a: "Creator gives you 50 scripts/month with core features for ₹499/month. Pro gives unlimited scripts, YouTube SEO optimizer, channel analyzer, and 1-on-1 consultation for ₹799/month." },
              { q: "How much do I save with annual billing?", a: "Creator annual saves ₹1,200/year (₹399/month vs ₹499/month). Pro annual saves ₹2,400/year (₹599/month vs ₹799/month)." },
              { q: "Can I cancel anytime?", a: "Yes! Cancel anytime from your settings. You'll keep access until the end of your billing period." },
              { q: "What payment methods are accepted?", a: "UPI, credit/debit cards, netbanking, wallets and all major Indian payment methods via Razorpay." },
              { q: "Can I upgrade from Creator to Pro?", a: "Yes! You can upgrade anytime to get full Pro access." },
            ].map((faq, i) => (
              <div key={i} className="p-4 rounded-2xl"
                style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)" }}>
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

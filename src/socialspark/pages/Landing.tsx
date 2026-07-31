import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import "./landing.css";
import { 
  Zap, 
  Upload, 
  Sparkles, 
  BarChart3, 
  Calendar, 
  Users, 
  Play,
  ArrowRight,
  Check
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Multi-Platform Upload",
    description: "Upload once, publish everywhere. YouTube, Instagram, TikTok, and LinkedIn."
  },
  {
    icon: Sparkles,
    title: "AI-Powered Optimization",
    description: "Auto-generate tags, descriptions, and thumbnails optimized for each platform."
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Schedule content at the best times for maximum engagement."
  },
  {
    icon: BarChart3,
    title: "Cross-Platform Analytics",
    description: "Track performance across all platforms in one unified dashboard."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started",
    features: ["5 uploads/month", "2 platforms", "Basic analytics", "Email support"]
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious creators",
    features: ["Unlimited uploads", "All platforms", "AI optimization", "Advanced analytics", "Priority support"],
    popular: true
  },
  {
    name: "Team",
    price: "$79",
    period: "/month",
    description: "For teams and agencies",
    features: ["Everything in Pro", "5 team members", "Brand management", "API access", "Dedicated support"]
  }
];

export default function Landing() {
  return (
    <div className="social-spark-landing min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold gradient-text">SocialRum</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Content Distribution</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Create Once,
            <br />
            <span className="gradient-text">Publish Everywhere</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automate your social media workflow with AI. Upload videos, generate optimized content, and distribute across all platforms in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
  <Link to="/signup" className="w-full sm:w-auto">
    <Button variant="gradient" size="lg" className="gap-2 w-full sm:w-auto">
      Start Free Trial
      <ArrowRight className="h-4 w-4" />
    </Button>
  </Link>
  <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
    <Play className="h-4 w-4" />
    Watch Demo
  </Button>
</div>

        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help content creators save time and maximize reach.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground">Choose the plan that fits your needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`glass-card rounded-xl p-6 relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? "gradient" : "outline"} className="w-full">
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
     <section className="py-20 px-6">
  <div className="container mx-auto">
    <div className="glass-card rounded-2xl p-12 text-center bg-gradient-to-br from-primary/10 to-accent/10">
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
        Ready to Transform Your Content Strategy?
      </h2>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
        Join thousands of creators who are saving hours every week with SocialRum.
      </p>

      {/* Centered button container */}
      <div className="flex justify-center">
        <Link to="/signup" className="w-full sm:w-auto">
          <Button variant="gradient" size="lg" className="w-full sm:w-auto">
            Start Your Free Trial
          </Button>
        </Link>
      </div>
    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold">SocialRum</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 SocialRum. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

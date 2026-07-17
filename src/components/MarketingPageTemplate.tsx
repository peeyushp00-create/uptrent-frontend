import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import SEO, { type SEOProps } from "@/components/SEO";

export interface MarketingPageTemplateProps {
  seo: Pick<SEOProps, "title" | "description" | "ogImage" | "canonical">;
  /** H1 shown at the top of the page — should match/reinforce the SEO title. */
  heading: string;
  /** Short standfirst under the heading. */
  subheading?: string;
  /** Page body — each page supplies its own content once copy is ready. */
  children?: ReactNode;
}

// Shared shell for public, crawlable marketing/feature pages (see the pages
// in src/pages/marketing/). Deliberately minimal — no content yet, per the
// scaffolding request; each page fills in `children` when copy is ready.
export default function MarketingPageTemplate({ seo, heading, subheading, children }: MarketingPageTemplateProps) {
  return (
    <div className="relative min-h-screen bg-[#03000a] text-white overflow-x-hidden" style={{ fontFamily: "'Roboto',sans-serif" }}>
      <SEO {...seo} />

      <header style={{ padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#fff" }}>
          <img src="/socialrum-logo.png" alt="SocialRum" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 8 }} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>SocialRum</span>
        </Link>
        <Link to="/signup"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", padding: "10px 22px", borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: "none", color: "#fff" }}>
          Get Started
        </Link>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px 120px" }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16, lineHeight: 1.15 }}>{heading}</h1>
        {subheading && (
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.65)", marginBottom: 48, maxWidth: 640 }}>{subheading}</p>
        )}
        {children}
      </main>
    </div>
  );
}

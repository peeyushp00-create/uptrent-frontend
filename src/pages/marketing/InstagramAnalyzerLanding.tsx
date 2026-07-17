import MarketingPageTemplate from "@/components/MarketingPageTemplate";

// Public, crawlable marketing page at /instagram-analyzer — distinct from
// the authenticated app tool at /instagram/analyzer (InstagramAnalyzer.tsx).
// TODO: add screenshots, feature breakdown, and a signup CTA below.
export default function InstagramAnalyzerLanding() {
  return (
    <MarketingPageTemplate
      seo={{
        title: "Instagram Analyzer — SocialRum",
        description: "See exactly what's working for top Instagram creators in your niche — SocialRum's Competitor Analyzer surfaces their best-performing content and the gaps you can win.",
      }}
      heading="Instagram Analyzer"
      subheading="See exactly what's winning for top creators in your space — and which gaps they're leaving open. Find the opportunity before everyone else does."
    >
      {/* TODO: feature content, screenshots, CTA */}
    </MarketingPageTemplate>
  );
}

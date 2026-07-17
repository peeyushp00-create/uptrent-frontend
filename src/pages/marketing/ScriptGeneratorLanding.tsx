import MarketingPageTemplate from "@/components/MarketingPageTemplate";

// Public, crawlable marketing page at /script-generator — distinct from the
// authenticated app tool at /scripts (ScriptsPage.tsx).
// TODO: add screenshots, feature breakdown, and a signup CTA below.
export default function ScriptGeneratorLanding() {
  return (
    <MarketingPageTemplate
      seo={{
        title: "AI Script Generator — SocialRum",
        description: "Generate ready-to-film YouTube and Instagram scripts in your language with SocialRum's AI Script Generator — hooks, body, and CTA, built for your niche.",
      }}
      heading="AI Script Generator"
      subheading="Your niche, your language, your voice — a full ready-to-film script in 60 seconds. Hooks that stop the scroll, bodies that hold retention, CTAs that convert."
    >
      {/* TODO: feature content, screenshots, CTA */}
    </MarketingPageTemplate>
  );
}

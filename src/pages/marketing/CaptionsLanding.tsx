import MarketingPageTemplate from "@/components/MarketingPageTemplate";

// Public, crawlable marketing page at /captions — distinct from the
// authenticated Content Studio app tool at /studio (Contentstudio.tsx).
// TODO: add screenshots, feature breakdown, and a signup CTA below.
export default function CaptionsLanding() {
  return (
    <MarketingPageTemplate
      seo={{
        title: "Multilingual Captions — SocialRum",
        description: "Write captions, thumbnails, and descriptions in Hindi, Tamil, Telugu, and more with SocialRum — tuned for the algorithm, written once, optimized everywhere.",
      }}
      heading="Multilingual Captions"
      subheading="Captions in every Indian language, thumbnails, and descriptions tuned for the algorithm. Write once, optimise everywhere, post in minutes."
    >
      {/* TODO: feature content, screenshots, CTA */}
    </MarketingPageTemplate>
  );
}

import MarketingPageTemplate from "@/components/MarketingPageTemplate";

// Public, crawlable marketing page at /creator-news — distinct from the
// authenticated app tool at /news (NewsPage.tsx).
// TODO: add screenshots, feature breakdown, and a signup CTA below.
export default function CreatorNewsLanding() {
  return (
    <MarketingPageTemplate
      seo={{
        title: "Creator News Feed — SocialRum",
        description: "Stay ahead of platform updates and trending topics with SocialRum's Creator News Feed — signals surfaced before they peak, so you publish first.",
      }}
      heading="Creator News Feed"
      subheading="Platform updates, trending topics, and creator economy signals — surfaced before they peak so you publish first and own the moment."
    >
      {/* TODO: feature content, screenshots, CTA */}
    </MarketingPageTemplate>
  );
}

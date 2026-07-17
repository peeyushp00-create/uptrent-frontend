import MarketingPageTemplate from "@/components/MarketingPageTemplate";

// Public, crawlable marketing page at /about.
// TODO: founding story, team, and mission section below are genuinely
// unknown to me — everything else here is grounded in the actual product
// (features/pricing already in this codebase), not invented.
export default function AboutPage() {
  return (
    <MarketingPageTemplate
      seo={{
        title: "About SocialRum",
        description: "SocialRum is an AI content intelligence platform built for Indian YouTube and Instagram creators, helping them write, analyze, and publish content in their own language.",
      }}
      heading="About SocialRum"
      subheading="We're building the tools Indian creators actually need — AI scripts in their language, real competitor insight, and trends before they peak."
    >
      {/* TODO: founding story, team, mission */}
    </MarketingPageTemplate>
  );
}

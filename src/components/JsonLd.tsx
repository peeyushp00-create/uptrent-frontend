import { Helmet } from "react-helmet-async";

// Renders a JSON-LD <script> tag via react-helmet-async. Same caveat as
// SEO.tsx: this only ever reaches the DOM after the client JS bundle runs —
// it is NOT present in the raw server response, since this app has no
// SSR/prerendering. Non-JS crawlers will not see this structured data.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

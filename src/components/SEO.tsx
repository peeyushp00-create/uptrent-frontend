import { Helmet } from "react-helmet-async";

const SITE_NAME = "SocialRum";
const SITE_URL = "https://www.socialrum.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/socialrum-og-image.png`;

export interface SEOProps {
  /** Page title. Rendered as-is — pass the full string, e.g. "Pricing — SocialRum". */
  title: string;
  description?: string;
  /** When true, emits <meta name="robots" content="noindex, nofollow"> and omits OG/canonical tags. */
  noindex?: boolean;
  /** Absolute URL to the OG/Twitter card image. Defaults to the site-wide og-image. */
  ogImage?: string;
  /** Absolute canonical URL for this page. Defaults to SITE_URL + current pathname when omitted and not noindex. */
  canonical?: string;
}

// Applied per-route (see each page for usage). Note: this only ever renders
// after the client-side JS bundle runs — react-helmet-async cannot inject
// tags into the raw server response, since this app has no SSR/prerendering.
// Crawlers that don't execute JS will not see any of these tags; only
// index.html's static <head> tags are visible to them.
export default function SEO({ title, description, noindex = false, ogImage, canonical }: SEOProps) {
  const resolvedImage = ogImage || DEFAULT_OG_IMAGE;
  const resolvedCanonical = canonical || (typeof window !== "undefined" ? `${SITE_URL}${window.location.pathname}` : SITE_URL);

  return (
    <Helmet>
      <title>{title}</title>
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          {description && <meta name="description" content={description} />}
          <link rel="canonical" href={resolvedCanonical} />
          <meta property="og:title" content={title} />
          {description && <meta property="og:description" content={description} />}
          <meta property="og:image" content={resolvedImage} />
          <meta property="og:url" content={resolvedCanonical} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content={SITE_NAME} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          {description && <meta name="twitter:description" content={description} />}
          <meta name="twitter:image" content={resolvedImage} />
        </>
      )}
    </Helmet>
  );
}

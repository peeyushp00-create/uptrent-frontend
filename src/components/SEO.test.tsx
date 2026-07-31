import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import SEO from "./SEO";

afterEach(() => {
  cleanup();
  // react-helmet-async commits tags into the real document.head; clear them
  // between tests so assertions never see a previous test's tags.
  document.querySelectorAll('meta[data-rh="true"], link[data-rh="true"], title[data-rh="true"]').forEach((el) => el.remove());
});

// react-helmet-async v3 commits to the real document.head asynchronously
// (after an effect flush). Querying the DOM directly is more reliable in
// this test environment than the HelmetProvider `context` callback, which
// doesn't consistently fire under React 18 + jsdom here.
async function renderSEO(props: React.ComponentProps<typeof SEO>) {
  render(
    <HelmetProvider>
      <SEO {...props} />
    </HelmetProvider>
  );
  await waitFor(() => expect(document.title).toBe(props.title));
}

describe("SEO", () => {
  it("renders the title", async () => {
    await renderSEO({ title: "Pricing — SocialRum" });
    expect(document.title).toBe("Pricing — SocialRum");
  });

  it("emits noindex,nofollow and omits OG/canonical tags when noindex is true", async () => {
    await renderSEO({ title: "Settings — SocialRum", noindex: true });
    const robots = document.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute("content")).toBe("noindex, nofollow");
    expect(document.querySelector('meta[property="og:title"]')).toBeNull();
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it("emits description, canonical, OG, and Twitter tags when not noindex", async () => {
    await renderSEO({
      title: "SocialRum — Content Intelligence for Indian Creators",
      description: "Test description",
      canonical: "https://www.socialrum.com/",
    });

    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe("Test description");
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(
      "SocialRum — Content Intelligence for Indian Creators"
    );
    expect(document.querySelector('meta[property="og:site_name"]')?.getAttribute("content")).toBe("SocialRum");
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute("content")).toBe("summary_large_image");
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://www.socialrum.com/");
  });

  it("falls back to the default OG image when none is provided", async () => {
    await renderSEO({ title: "Blog — SocialRum", description: "d", canonical: "https://www.socialrum.com/blog" });
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toContain("socialrum-og-image.png");
  });

  it("uses a custom OG image when provided", async () => {
    await renderSEO({
      title: "Custom — SocialRum",
      description: "d",
      canonical: "https://www.socialrum.com/x",
      ogImage: "https://www.socialrum.com/custom-image.png",
    });
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe(
      "https://www.socialrum.com/custom-image.png"
    );
  });

  it("defaults og:type to website and allows overriding to article", async () => {
    await renderSEO({ title: "Default type — SocialRum", canonical: "https://www.socialrum.com/y" });
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute("content")).toBe("website");

    await renderSEO({ title: "Post — SocialRum Blog", canonical: "https://www.socialrum.com/blog/post", ogType: "article" });
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute("content")).toBe("article");
  });
});

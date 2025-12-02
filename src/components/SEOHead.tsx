import { useEffect } from "react";
import { useSeoConfigMap } from "@/hooks/useSeoConfig";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  structuredData?: object;
}

const SEOHead = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonicalPath = "",
  noIndex = false,
  structuredData,
}: SEOHeadProps) => {
  const { configMap, isLoading } = useSeoConfigMap();

  useEffect(() => {
    if (isLoading) return;

    const siteTitle = configMap.site_title || "SIMPA BEND BKADKU";
    const siteDescription = configMap.site_description || "";
    const siteKeywords = configMap.site_keywords || "";
    const baseUrl = configMap.canonical_url || window.location.origin;
    const defaultOgImage = configMap.og_image || "/og-image.png";
    const twitterHandle = configMap.twitter_handle || "";
    const googleVerification = configMap.google_verification || "";
    const bingVerification = configMap.bing_verification || "";

    // Set document title
    const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    document.title = pageTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to update or create link tag
    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Basic meta tags
    setMeta("description", description || siteDescription);
    setMeta("keywords", keywords || siteKeywords);
    setMeta("author", "BKAD Kabupaten Kolaka Utara");
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    // Canonical URL
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    setLink("canonical", canonicalUrl);

    // Open Graph tags
    setMeta("og:title", pageTitle, true);
    setMeta("og:description", description || siteDescription, true);
    setMeta("og:type", ogType, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:image", ogImage || `${baseUrl}${defaultOgImage}`, true);
    setMeta("og:site_name", siteTitle, true);
    setMeta("og:locale", "id_ID", true);

    // Twitter Card tags
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", pageTitle);
    setMeta("twitter:description", description || siteDescription);
    setMeta("twitter:image", ogImage || `${baseUrl}${defaultOgImage}`);
    if (twitterHandle) {
      setMeta("twitter:site", twitterHandle);
      setMeta("twitter:creator", twitterHandle);
    }

    // Verification tags
    if (googleVerification) {
      setMeta("google-site-verification", googleVerification);
    }
    if (bingVerification) {
      setMeta("msvalidate.01", bingVerification);
    }

    // Structured Data (JSON-LD)
    const existingScript = document.querySelector('script[data-seo="structured-data"]');
    if (existingScript) {
      existingScript.remove();
    }

    const defaultStructuredData = configMap.structured_data_org 
      ? JSON.parse(configMap.structured_data_org) 
      : null;

    const finalStructuredData = structuredData || defaultStructuredData;
    if (finalStructuredData) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "structured-data");
      script.textContent = JSON.stringify(finalStructuredData);
      document.head.appendChild(script);
    }

    // WebSite structured data for search box
    const websiteScript = document.querySelector('script[data-seo="website"]');
    if (!websiteScript) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "website");
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteTitle,
        url: baseUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      });
      document.head.appendChild(script);
    }

  }, [isLoading, configMap, title, description, keywords, ogImage, ogType, canonicalPath, noIndex, structuredData]);

  return null;
};

export default SEOHead;

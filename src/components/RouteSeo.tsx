import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, resolveRouteSeo } from "@/lib/seo-config";

/**
 * Mount once inside the router. Dynamically sets per-route head tags
 * (title, description, canonical, og:*, twitter:*, JSON-LD) on every
 * navigation. Falls back to a sensible default when a route has no entry.
 */
export function RouteSeo() {
  const { pathname } = useLocation();
  const seo = resolveRouteSeo(pathname);
  const url = `${SITE_URL}${pathname === "/" ? "" : pathname}` || SITE_URL;
  const image = seo.ogImage ?? DEFAULT_OG_IMAGE;
  const schemas = seo.jsonLd ? (Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd]) : [];

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={url} />

      {/* OpenGraph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={seo.ogType ?? "website"} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seo.title} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@hyvoai" />
      <meta name="twitter:creator" content="@hyvoai" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
}

export default RouteSeo;

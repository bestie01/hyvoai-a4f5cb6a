import { Helmet } from "react-helmet-async";

const SITE_URL = "https://hyvoai.lovable.app";

interface SeoProps {
  title: string;
  description: string;
  path: string; // e.g. "/pricing"
  ogType?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Per-route head tags. Drop into any page component to override
 * the sitewide tags from index.html.
 */
export function Seo({ title, description, path, ogType = "website", jsonLd }: SeoProps) {
  const url = `${SITE_URL}${path}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
}

export default Seo;

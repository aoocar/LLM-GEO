import { normUrl } from "./schema";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aoobee.com";

/**
 * 生成标准 meta 标签
 */
export function generateMeta({
  title,
  description,
  keywords,
  url,
  image,
  type = "website",
}: {
  title: string;
  description?: string;
  keywords?: string[];
  url?: string;
  image?: string;
  type?: string;
}) {
  const fullTitle = title.includes("AooBee") ? title : `${title} | AooBee`;
  // 归一为尾斜杠，与 trailingSlash:true 服务地址 / sitemap / JSON-LD canonical 保持一致，避免重复页判定。
  const fullUrl = normUrl(url ? `${BASE_URL}${url}` : BASE_URL);
  const desc = description || "";

  return {
    title: fullTitle,
    description: desc,
    keywords: keywords?.join(", "),
    openGraph: {
      title: fullTitle,
      description: desc,
      url: fullUrl,
      siteName: "AooBee",
      type,
      locale: "zh_CN",
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image" as const,
      title: fullTitle,
      description,
      ...(image && { images: [image] }),
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

/**
 * 生成 canonical URL
 */
export function canonicalUrl(path: string) {
  return `${BASE_URL}${path}`;
}

/**
 * slug 转中文关键词（用于面包屑等）
 */
export function slugToDisplay(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

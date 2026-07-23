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
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const desc = description || "";

  // OG 图指向预先生成的真实 .png 文件（public/og/...），由 scripts/gen-og.ts 产出，
  // 避免静态导出把图当 application/octet-stream 返回。无 url（首页）回退到 /og/home.png。
  const ogImage = image || (url ? `/og${url}.png` : "/og/home.png");

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
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: fullTitle,
      description,
      images: [ogImage],
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

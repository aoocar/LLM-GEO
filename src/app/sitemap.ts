import type { MetadataRoute } from "next";
import { getCategories, getProducts, getArticles, getReviews } from "@/lib/content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aoobee.com";

export const dynamic = "force-static";

const ARTICLE_PREFIX: Record<string, string> = {
  GUIDE: "guide",
  COMPARISON: "compare",
  REVIEW: "review",
  FAQ: "faq",
  LISTICLE: "guide",
  HOW_TO: "guide",
  BEST: "best",
};

// 内容聚合枢纽页（列表页）：承接「XX推荐 / XX对比 / XX指南」这类列表型查询
const HUB_PATHS = ["best", "compare", "review", "reviews", "guide", "faq"] as const;

// 信息页（About/Contact/Privacy/Terms）：E-E-A-T 信任信号，需被收录但权重低
const INFO_PATHS = ["about", "contact", "privacy", "terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // 静态 / 枢纽 / 信息页内容基本不变，用固定部署日期而非构建时刻，避免每次构建都把 lastmod 刷成 now 导致变更信号失真。
  const STATIC_LASTMOD = new Date("2026-08-01");

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: STATIC_LASTMOD, changeFrequency: "daily", priority: 1 },
    {
      url: `${BASE_URL}/categories/`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...HUB_PATHS.map((p) => ({
      url: `${BASE_URL}/${p}/`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...INFO_PATHS.map((p) => ({
      url: `${BASE_URL}/${p}/`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  const categoryPages: MetadataRoute.Sitemap = getCategories().map((cat) => ({
    url: `${BASE_URL}/${cat.slug}/`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = getProducts().map((p) => ({
    url: `${BASE_URL}/${p.category.slug}/${p.slug}/`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = getArticles().map((a) => ({
    url: `${BASE_URL}/${ARTICLE_PREFIX[a.type] || "guide"}/${a.slug}/`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const reviewPages: MetadataRoute.Sitemap = getReviews()
    .filter((r) => r.published)
    .map((r) => ({
      url: `${BASE_URL}/reviews/${r.slug}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...productPages, ...articlePages, ...reviewPages];
}

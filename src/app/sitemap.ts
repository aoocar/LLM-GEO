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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
  ];

  const categoryPages: MetadataRoute.Sitemap = getCategories().map((cat) => ({
    url: `${BASE_URL}/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = getProducts().map((p) => ({
    url: `${BASE_URL}/${p.category.slug}/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = getArticles().map((a) => ({
    url: `${BASE_URL}/${ARTICLE_PREFIX[a.type] || "guide"}/${a.slug}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const reviewPages: MetadataRoute.Sitemap = getReviews()
    .filter((r) => r.published)
    .map((r) => ({
      url: `${BASE_URL}/reviews/${r.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...productPages, ...articlePages, ...reviewPages];
}

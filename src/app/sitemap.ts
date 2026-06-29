import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aoobee.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    // 获取所有已发布分类
    const categories = await db.category.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${BASE_URL}/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // 获取所有已发布产品
    const products = await db.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: { select: { slug: true } },
      },
    });

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${BASE_URL}/${product.category.slug}/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // 获取所有已发布文章
    const articles = await db.article.findMany({
      where: { published: true },
      select: { slug: true, type: true, updatedAt: true },
    });

    const articlePrefixMap: Record<string, string> = {
      GUIDE: "guide",
      COMPARISON: "compare",
      REVIEW: "review",
      FAQ: "faq",
      LISTICLE: "guide",
      HOW_TO: "guide",
      BEST: "best",
    };

    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${BASE_URL}/${articlePrefixMap[article.type] || "guide"}/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...productPages, ...articlePages];
  } catch {
    // 数据库连接失败时只返回静态页面
    console.error("Failed to generate sitemap from database");
    return staticPages;
  }
}

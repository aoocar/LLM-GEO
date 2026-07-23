import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getProducts, getArticles, getReviews } from "@/lib/content";
import { SearchResults, type SearchItem } from "@/components/search/search-results";

export const metadata = generateMeta({
  title: "搜索 - AooBee 产品与服务目录",
  description: "在 AooBee 全行业产品目录中搜索产品、工具、服务与评测文章。",
  url: "/search",
});

const ARTICLE_PREFIX: Record<string, string> = {
  GUIDE: "guide",
  COMPARISON: "compare",
  REVIEW: "review",
  FAQ: "faq",
  LISTICLE: "guide",
  HOW_TO: "guide",
  BEST: "best",
};

export default async function SearchPage() {
  const products = getProducts();
  const articles = getArticles();
  const reviews = getReviews().filter((r) => r.published);

  const items: SearchItem[] = [
    ...products.map((p) => ({
      title: p.name,
      description: p.description,
      url: `/${p.category.slug}/${p.slug}`,
      type: "产品",
      category: p.category.name,
    })),
    ...articles.map((a) => ({
      title: a.title,
      description: a.excerpt || "",
      url: `/${ARTICLE_PREFIX[a.type] || "guide"}/${a.slug}`,
      type: "文章",
      category: a.category?.name || "",
    })),
    ...reviews.map((r) => ({
      title: r.title,
      description: r.summary || "",
      url: `/reviews/${r.slug}`,
      type: "点评",
      category: r.product,
    })),
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: "https://www.aoobee.com" },
          { name: "搜索", url: "https://www.aoobee.com/search" },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "搜索", href: "/search" }]} />

        <h1 className="text-3xl font-bold text-gray-900 mt-4">搜索</h1>
        <p className="mt-2 text-gray-500">
          在 AooBee 全行业产品目录中检索产品、工具、服务与评测。
        </p>

        <Suspense fallback={<div className="mt-6 text-gray-500">加载中...</div>}>
          <SearchResults items={items} />
        </Suspense>
      </div>
    </>
  );
}

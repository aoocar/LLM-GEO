import { Suspense } from "react";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getProducts, getArticles, getReviews } from "@/lib/content";
import { SearchResults, type SearchItem } from "@/components/search/search-results";
import { SearchResultList } from "@/components/search/search-list";

export const metadata = {
  ...generateMeta({
    title: "搜索 - AooBee 产品与服务目录",
    description: "在 AooBee 全行业产品目录中搜索产品、工具、服务与评测文章。",
    url: "/search",
  }),
  // GSC「备用网页」修复 P0：/search/?q=* 参数变体全部 noindex,follow，
  // 覆盖 generateMeta 默认的 index,follow，避免大量搜索标签页被收录为备用网页。
  robots: {
    index: false,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

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

        <Suspense
          fallback={
            <div className="mt-6">
              <form
                action="/search"
                method="GET"
                className="flex gap-2 max-w-xl"
              >
                <input
                  name="q"
                  placeholder="输入关键词，如 AI 写作、CRM..."
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  搜索
                </button>
              </form>
              <p className="mt-6 text-gray-600">
                共收录 {items.length} 条，输入关键词开始筛选
              </p>
              <SearchResultList items={items} />
            </div>
          }
        >
          <SearchResults items={items} />
        </Suspense>
      </div>
    </>
  );
}

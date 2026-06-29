import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { db } from "@/lib/db";

export const revalidate = 60;

export const metadata = generateMeta({
  title: "行业指南 - 专业知识与选购建议",
  description: "AooBee 提供各行业的专业指南、选购建议、对比分析和使用教程，帮助您做出明智的决策。",
  keywords: ["行业指南", "选购指南", "产品评测", "使用教程", "对比分析"],
  url: "/guide",
});

export default async function GuideListPage() {
  const articles = await db.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    include: { category: { select: { name: true, slug: true } } },
  });

  // 文章类型显示名
  const typeLabel: Record<string, string> = {
    GUIDE: "行业指南",
    COMPARISON: "对比分析",
    REVIEW: "产品评测",
    FAQ: "常见问题",
    LISTICLE: "清单推荐",
    HOW_TO: "使用教程",
    BEST: "最佳推荐",
  };

  const typeColor: Record<string, string> = {
    GUIDE: "bg-blue-50 text-blue-700",
    COMPARISON: "bg-purple-50 text-purple-700",
    REVIEW: "bg-green-50 text-green-700",
    FAQ: "bg-orange-50 text-orange-700",
    LISTICLE: "bg-pink-50 text-pink-700",
    HOW_TO: "bg-teal-50 text-teal-700",
    BEST: "bg-yellow-50 text-yellow-700",
  };

  // 文章路径前缀
  const articlePrefix: Record<string, string> = {
    GUIDE: "guide",
    COMPARISON: "compare",
    REVIEW: "review",
    FAQ: "faq",
    LISTICLE: "guide",
    HOW_TO: "guide",
    BEST: "best",
  };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: "https://www.aoobee.com" },
          { name: "行业指南", url: "https://www.aoobee.com/guide" },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "行业指南", href: "/guide" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">行业指南</h1>
          <p className="mt-2 text-gray-500">
            专业行业分析、产品评测、对比指南和使用教程，助您做出明智选择。
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">暂无文章，敬请期待</p>
          </div>
        ) : (
          <div className="space-y-5">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/${articlePrefix[article.type] || "guide"}/${article.slug}`}
                className="group block bg-white rounded-xl border border-gray-200 p-6
                           hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${typeColor[article.type] || "bg-gray-100 text-gray-600"}`}>
                    {typeLabel[article.type] || article.type}
                  </span>
                  {article.category && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Tag className="w-3 h-3" />
                      {article.category.name}
                    </span>
                  )}
                  {article.readTime && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {article.readTime} 分钟阅读
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  <span>{article.authorName}</span>
                  {article.publishedAt && (
                    <span>{new Date(article.publishedAt).toLocaleDateString("zh-CN")}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

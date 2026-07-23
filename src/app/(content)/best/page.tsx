import Link from "next/link";
import { Star, Award } from "lucide-react";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getArticlesByType } from "@/lib/content";

export const metadata = generateMeta({
  title: "最佳推荐 - 各行业最佳产品榜单",
  description: "AooBee 精心整理的各行业最佳产品推荐榜单，帮您快速找到最适合的工具和服务。",
  keywords: ["最佳推荐", "产品榜单", "工具推荐", "排行榜"],
  url: "/best",
});

export default async function BestListPage() {
  const bestArticles = getArticlesByType("BEST");

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: "https://www.aoobee.com" },
          { name: "最佳推荐", url: "https://www.aoobee.com/best" },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "最佳推荐", href: "/best" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">最佳推荐</h1>
          <p className="mt-2 text-gray-500">
            AooBee 精心整理的各行业最佳产品推荐榜单，帮您快速找到最适合的工具和服务。
          </p>
        </div>

        {bestArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestArticles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/best/${article.slug}`}
                className="group bg-white rounded-xl border border-gray-200 p-6
                           hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏆</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {index === 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
                          <Award className="w-3 h-3" /> 热门
                        </span>
                      )}
                      {article.category && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {article.category.name}
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
                    <span className="inline-block mt-3 text-sm text-primary font-medium">
                      查看榜单 →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
            <p className="font-medium">暂无推荐榜单</p>
            <p className="mt-1 text-sm">
              向 content/articles/best/ 添加 Markdown 文件后重新构建即可在此展示。
            </p>
          </div>
        )}
      </div>
    </>
  );
}

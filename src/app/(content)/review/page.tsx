import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getArticlesByType } from "@/lib/content";

export const metadata = generateMeta({
  title: "产品评测 - 深度体验与横向评测",
  description: "AooBee 提供各类产品的深度评测与真实使用体验，帮您判断产品是否值得入手。",
  keywords: ["产品评测", "深度评测", "使用体验", "测评"],
  url: "/review",
});

export default async function ReviewListPage() {
  const articles = getArticlesByType("REVIEW");

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: "https://www.aoobee.com" },
          { name: "产品评测", url: "https://www.aoobee.com/review" },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "产品评测", href: "/review" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">产品评测</h1>
          <p className="mt-2 text-gray-500">
            基于真实场景的深度评测与使用体验，帮您在入手前看清产品优劣。
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">暂无评测，请向 content/articles/review 添加。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/review/${article.slug}`}
                className="group block bg-white rounded-xl border border-gray-200 p-6
                           hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    产品评测
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
                      {article.readTime} 分钟
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
                )}
                <div className="mt-3 text-xs text-gray-400">
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

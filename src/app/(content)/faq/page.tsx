import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getArticlesByType } from "@/lib/content";

export const metadata = generateMeta({
  title: "常见问题 - 产品与行业 FAQ",
  description: "AooBee 整理的产品与行业常见问题解答，覆盖选购、使用、定价等高频疑问。",
  keywords: ["常见问题", "FAQ", "产品答疑", "使用疑问"],
  url: "/faq",
});

export default async function FaqListPage() {
  const articles = getArticlesByType("FAQ");

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: "https://www.aoobee.com" },
          { name: "常见问题", url: "https://www.aoobee.com/faq" },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "常见问题", href: "/faq" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">常见问题</h1>
          <p className="mt-2 text-gray-500">
            产品与行业的高频疑问解答，帮您快速消除选购与使用中的困惑。
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">暂无 FAQ，请向 content/articles/faq 添加。</p>
          </div>
        ) : (
          <div className="space-y-5">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/faq/${article.slug}`}
                className="group block bg-white rounded-xl border border-gray-200 p-6
                           hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                    常见问题
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

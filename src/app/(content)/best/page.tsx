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

  // 预置推荐榜单（content/ 未提供时的展示）
  const presetBests = [
    { slug: "ai-xie-zuo-gong-ju", title: "2026年十大AI写作工具推荐", desc: "精选最值得使用的10款AI写作工具，涵盖综合写作、营销文案、SEO文章等场景", icon: "✍️", category: "人工智能" },
    { slug: "ai-gong-ju", title: "2026年最佳AI工具推荐", desc: "覆盖对话、绘画、编程、分析等领域的顶级AI工具", icon: "🤖", category: "人工智能" },
    { slug: "she-ji-gong-ju", title: "2026年最佳UI/UX设计工具推荐", desc: "Figma、即时设计、Adobe XD等主流设计工具深度评测", icon: "🎨", category: "设计创意" },
    { slug: "crm", title: "2026年最佳CRM系统推荐", desc: "Salesforce、HubSpot、纷享销客等CRM系统对比评测", icon: "📊", category: "企业管理" },
    { slug: "xiang-mu-guan-li", title: "2026年最佳项目管理工具推荐", desc: "Jira、Notion、飞书、Asana等项目管理工具对比", icon: "📋", category: "企业管理" },
    { slug: "dian-shang-ping-tai", title: "2026年最佳电商平台推荐", desc: "Shopify、有赞、WooCommerce等电商平台对比评测", icon: "🛒", category: "电商零售" },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {presetBests.map((item, index) => (
            <Link
              key={item.slug}
              href={`/best/${item.slug}`}
              className="group bg-white rounded-xl border border-gray-200 p-6
                         hover:shadow-lg hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {index === 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
                        <Award className="w-3 h-3" /> 热门
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
                  <span className="inline-block mt-3 text-sm text-primary font-medium">
                    查看榜单 →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {bestArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">更多推荐</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bestArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/best/${article.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 p-6
                             hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="mt-2 text-sm text-gray-500">{article.excerpt}</p>
                  )}
                  <span className="inline-block mt-3 text-sm text-primary font-medium">
                    查看详情 →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

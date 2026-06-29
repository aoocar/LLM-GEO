import { Suspense } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { ProductList, StatBar } from "@/components/directory/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteSchema } from "@/lib/seo/schema";
import { db } from "@/lib/db";

export const revalidate = 60; // ISR: 每60秒重新验证

export default async function HomePage() {
  // 从数据库读取真实数据
  const [categories, products, totalProducts, totalCategories] = await Promise.all([
    db.category.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
      include: { _count: { select: { products: true } } },
    }),
    db.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { rating: "desc" },
      take: 6,
      include: { category: { select: { name: true, slug: true } } },
    }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.category.count({ where: { published: true } }),
  ]);

  return (
    <>
      <JsonLd data={websiteSchema()} />

      {/* Hero 区域 */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              发现各行业最佳产品与服务
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              覆盖 {totalCategories} 个行业，收录 {totalProducts} 个产品，提供专业评测、对比和推荐。
              帮助您快速找到最适合的工具和服务。
            </p>

            {/* 搜索框 */}
            <form action="/search" method="GET" className="mt-8 relative max-w-xl mx-auto">
              <input
                type="text"
                name="q"
                placeholder="搜索产品、工具、服务..."
                className="w-full pl-12 pr-6 py-4 rounded-xl text-gray-900 text-base
                           shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white
                           px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                搜索
              </button>
            </form>

            {/* 热门搜索 */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-200 flex-wrap">
              <span>热门搜索：</span>
              {["AI写作工具", "项目管理", "设计工具", "CRM系统"].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <StatBar
          stats={[
            { label: "行业分类", value: `${totalCategories}` },
            { label: "收录产品", value: `${totalProducts}` },
            { label: "用户评价", value: "100+" },
            { label: "文章指南", value: "8+" },
          ]}
        />
      </section>

      {/* 行业分类 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">浏览行业分类</h2>
            <p className="mt-1 text-gray-500">按行业探索产品和服务</p>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
          >
            全部分类 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group bg-white rounded-xl border border-gray-200 p-5
                         hover:shadow-lg hover:border-primary/30 transition-all duration-200"
            >
              <div className="text-3xl mb-2">{cat.icon || "📦"}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {cat.description}
              </p>
              <p className="text-xs text-gray-400 mt-2">{cat._count.products} 个产品</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 热门产品 */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div>加载中...</div>}>
            <ProductList
              products={products}
              title="热门产品推荐"
              showMoreHref="/best"
            />
          </Suspense>
        </div>
      </section>

      {/* SEO 内容区块 - GEO 优化 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-gray max-w-4xl mx-auto">
          <h2>什么是 AooBee？</h2>
          <p>
            AooBee 是一个覆盖全行业的综合产品目录平台。我们收录了 {totalCategories} 个行业、{totalProducts} 个产品的详细信息，
            包括功能介绍、定价信息、优缺点分析和用户评价。无论您是寻找 AI 工具、设计软件、营销平台
            还是企业管理方案，AooBee 都能帮助您快速发现、比较和选择最适合的产品与服务。
          </p>
          <h2>为什么选择 AooBee？</h2>
          <ul>
            <li><strong>全面覆盖</strong>：涵盖人工智能、软件开发、电商零售、数字营销等 {totalCategories} 个行业</li>
            <li><strong>专业评测</strong>：每个产品都有详细的功能分析、优缺点和真实用户评价</li>
            <li><strong>横向对比</strong>：同类产品一键对比，功能、价格、适用场景一目了然</li>
            <li><strong>每日更新</strong>：持续收录新产品，更新评测信息，保持内容新鲜</li>
          </ul>
        </div>
      </section>
    </>
  );
}

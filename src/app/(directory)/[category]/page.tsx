import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { ProductList } from "@/components/directory/product-card";
import { FaqSection } from "@/components/directory/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { collectionPageSchema, faqSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { db } from "@/lib/db";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = await db.category.findUnique({ where: { slug: category } });

  if (!cat) {
    return generateMeta({ title: "分类未找到", description: "该行业分类不存在" });
  }

  const productCount = await db.product.count({ where: { categoryId: cat.id, status: "ACTIVE" } });

  return generateMeta({
    title: `${cat.name} - 最佳${cat.name}产品推荐与评测`,
    description: `发现最好的${cat.name}产品和服务。AooBee 收录了${productCount}个${cat.name}领域的优质工具，提供详细评测、对比和推荐。`,
    keywords: [cat.name, `${cat.name}工具`, `${cat.name}产品`, `${cat.name}推荐`, `${cat.name}评测`],
    url: `/${category}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  const cat = await db.category.findUnique({
    where: { slug: category },
    include: {
      children: { where: { published: true }, orderBy: { sortOrder: "asc" } },
      products: {
        where: { status: "ACTIVE" },
        orderBy: { rating: "desc" },
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  });

  if (!cat) {
    notFound();
  }

  // 获取该分类下的文章中包含FAQ的
  const articles = await db.article.findMany({
    where: { categoryId: cat.id, published: true, type: "FAQ" },
    take: 1,
  });

  const faqItems = articles.length > 0 && articles[0].faqItems
    ? (articles[0].faqItems as Array<{ question: string; answer: string }>)
    : [
        { question: `什么是${cat.name}？`, answer: cat.description || `${cat.name}是相关产品和服务的分类集合。` },
        { question: `如何选择合适的${cat.name}产品？`, answer: "建议根据实际需求、预算和团队规模来选择，可以参考我们的评测和对比文章。" },
      ];

  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            name: cat.name,
            description: cat.description || `${cat.name}产品和服务目录`,
            url: `https://www.aoobee.com/${category}`,
          }),
          faqSchema(faqItems),
          breadcrumbSchema([
            { name: "首页", url: "https://www.aoobee.com" },
            { name: cat.name, url: `https://www.aoobee.com/${category}` },
          ]),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: cat.name, href: `/${category}` }]} />

        {/* 分类标题区 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{cat.icon || "📦"}</span>
            <h1 className="text-3xl font-bold text-gray-900">{cat.name}</h1>
          </div>
          <p className="text-gray-600 max-w-3xl">{cat.description}</p>
        </div>

        {/* 子分类导航 */}
        {cat.children.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {cat.children.map((sub) => (
              <a
                key={sub.slug}
                href={`/${category}/${sub.slug}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full
                           text-sm font-medium text-gray-600 hover:border-primary
                           hover:text-primary transition-colors"
              >
                {sub.name}
              </a>
            ))}
          </div>
        )}

        {/* 产品列表 */}
        <Suspense fallback={<div className="text-center py-12">加载产品列表...</div>}>
          <ProductList products={cat.products} title={`${cat.name}产品推荐`} />
        </Suspense>

        {/* FAQ */}
        <FaqSection items={faqItems} title={`${cat.name}常见问题`} />
      </div>
    </>
  );
}

import { notFound } from "next/navigation";
import { Star, Check, X, Clock, MapPin, Building } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { FaqSection } from "@/components/directory/faq-section";
import { RelatedReads } from "@/components/directory/related-reads";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { productSchema, faqSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { getProduct, getProductBySlug, getProducts, getArticles } from "@/lib/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return generateMeta({ title: "产品未找到", description: "该产品不存在" });
  }

  return generateMeta({
    title: `${product.name} - 功能介绍、定价、评测和替代品`,
    description: product.description,
    keywords: [...(product.tags || []), `${product.name}评测`, `${product.name}替代品`, `${product.name}定价`],
    url: `/${product.category.slug}/${product.slug}`,
  });
}

export function generateStaticParams() {
  return getProducts().map((p) => ({ category: p.category.slug, slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const product = getProduct(category, slug);

  if (!product || category !== product.category.slug) {
    notFound();
  }

  const alternatives = product.alternatives;
  const faqItems = product.faqItems;
  const features = product.features;

  return (
    <>
      <JsonLd
        data={[
          productSchema({
            name: product.name,
            description: product.description,
            url: undefined,
            logo: product.logo,
            rating: product.rating,
            reviewCount: product.reviewCount,
            pricing: product.pricing,
            company: product.company,
            category: product.category.slug,
          }),
          faqSchema(faqItems),
          breadcrumbSchema([
            { name: "首页", url: "https://www.aoobee.com" },
            { name: product.category.name, url: `https://www.aoobee.com/${product.category.slug}` },
            { name: product.name, url: `https://www.aoobee.com/${product.category.slug}/${product.slug}` },
          ]),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: product.category.name, href: `/${product.category.slug}` },
            { label: product.name, href: `/${product.category.slug}/${product.slug}` },
          ]}
        />

        {/* 产品 Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">
                {product.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
              </div>
              <p className="mt-2 text-gray-600">{product.description}</p>
              <div className="mt-4 flex items-center gap-4 flex-wrap text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <strong className="text-gray-900">{product.rating}</strong>
                  <span>({product.reviewCount} 评价)</span>
                </span>
                {product.company && (
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {product.company}
                  </span>
                )}
                {product.founded && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    成立于 {product.founded}
                  </span>
                )}
                {product.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {product.location}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(product.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center min-w-[160px]">
                <div className="text-sm text-blue-600 font-medium">定价</div>
                <div className="text-lg font-bold text-blue-700 mt-1">
                  {product.pricing || "暂无"}
                </div>
                {product.pricingDetail && (
                  <div className="text-xs text-blue-500 mt-1">
                    {product.pricingDetail}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主内容区 */}
          <div className="lg:col-span-2">
            {/* 详细描述 */}
            {product.longDesc && (
              <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">产品介绍</h2>
                <div className="prose prose-gray max-w-none">
                  {product.longDesc.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* 功能特性 */}
            {features.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">核心功能</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature) => (
                    <div key={feature.name} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{feature.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 优缺点 */}
            {(product.pros.length > 0 || product.cons.length > 0) && (
              <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">优缺点分析</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.pros.length > 0 && (
                    <div>
                      <h3 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4" /> 优点
                      </h3>
                      <ul className="space-y-2">
                        {product.pros.map((pro) => (
                          <li key={pro} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product.cons.length > 0 && (
                    <div>
                      <h3 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                        <X className="w-4 h-4" /> 缺点
                      </h3>
                      <ul className="space-y-2">
                        {product.cons.map((con) => (
                          <li key={con} className="flex items-start gap-2 text-sm text-gray-600">
                            <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 适用场景 */}
            {product.useCases.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">适用场景</h2>
                <ul className="space-y-2">
                  {product.useCases.map((uc) => (
                    <li key={uc} className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 点评（内容类型，非交互） */}
            {product.reviews.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  产品点评 ({product.reviews.length})
                </h2>
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900 text-sm">{review.author}</span>
                        <span className="flex items-center gap-0.5 text-sm">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {review.rating}
                        </span>
                        {review.verified && (
                          <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-xs rounded">
                            已验证
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{review.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            <FaqSection items={faqItems} title="常见问题" />

            <RelatedReads
              items={getArticles()
                .filter((a) => a.category?.slug === product.category.slug)
                .map((a) => {
                  const seg: Record<string, string> = {
                    BEST: "best",
                    COMPARISON: "compare",
                    REVIEW: "review",
                    GUIDE: "guide",
                    FAQ: "faq",
                  };
                  const s = seg[a.type] || a.type.toLowerCase();
                  return `/${s}/${a.slug}`;
                })}
            />
          </div>

          {/* 侧边栏 */}
          <aside className="lg:col-span-1 space-y-6">
            {/* 替代品推荐 */}
            {alternatives.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  {product.name} 的替代品
                </h3>
                <div className="space-y-3">
                  {alternatives.map((alt) => (
                    <Link
                      key={alt.slug}
                      href={`/${alt.category.slug}/${alt.slug}`}
                      className="block p-3 border border-gray-100 rounded-lg hover:border-primary/30 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm">{alt.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{alt.description}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 相关标签 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">相关标签</h3>
              <div className="flex flex-wrap gap-2">
                {(product.tags || []).map((tag) => (
                  // GSC「备用网页」修复 P1：不再链到 /search?q=，纯展示避免爬虫发现大量参数变体
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

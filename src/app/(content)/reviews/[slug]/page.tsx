import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { reviewSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { getReview, getReviews, getProductBySlug } from "@/lib/content";
import { markdownToHtml } from "@/lib/content/markdown";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = getReview(slug);
  if (!review) {
    return generateMeta({ title: "页面未找到", description: "该点评不存在" });
  }
  return generateMeta({
    title: review.title,
    description: review.summary || review.title,
    url: `/reviews/${slug}`,
  });
}

export function generateStaticParams() {
  return getReviews().map((r) => ({ slug: r.slug }));
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = getReview(slug);
  if (!review || !review.published) notFound();

  const product = review.product ? getProductBySlug(review.product) : null;
  const productHref = product
    ? `/${product.category.slug}/${product.slug}`
    : null;

  return (
    <>
      <JsonLd
        data={[
          reviewSchema({
            title: review.title,
            slug: review.slug,
            product: review.product,
            author: review.author,
            rating: review.rating,
            summary: review.summary,
          }),
          breadcrumbSchema([
            { name: "首页", url: "https://www.aoobee.com" },
            { name: "产品点评", url: "https://www.aoobee.com/reviews" },
            { name: review.title, url: `https://www.aoobee.com/reviews/${review.slug}` },
          ]),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: "产品点评", href: "/reviews" },
            { label: review.title, href: `/reviews/${review.slug}` },
          ]}
        />

        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold text-gray-900">{review.title}</h1>
          {review.rating != null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              {review.rating.toFixed(1)} / 5
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
          {review.author && <span>{review.author}</span>}
          {productHref && (
            <Link href={productHref} className="text-primary hover:underline">
              查看 {review.product} 产品页
            </Link>
          )}
        </div>

        {review.summary && (
          <p className="text-lg text-gray-600 mb-6 border-l-4 border-primary/40 pl-4">
            {review.summary}
          </p>
        )}

        {(review.pros.length > 0 || review.cons.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {review.pros.length > 0 && (
              <div className="bg-green-50/60 rounded-xl border border-green-100 p-5">
                <h2 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                  <ThumbsUp className="w-4 h-4" /> 优点
                </h2>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {review.pros.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-500">+</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {review.cons.length > 0 && (
              <div className="bg-red-50/60 rounded-xl border border-red-100 p-5">
                <h2 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
                  <ThumbsDown className="w-4 h-4" /> 缺点
                </h2>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {review.cons.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-500">-</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <article className="prose prose-gray max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(review.content) }} />
        </article>
      </div>
    </>
  );
}

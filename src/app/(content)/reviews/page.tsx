import Link from "next/link";
import { Star } from "lucide-react";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getReviews } from "@/lib/content";

export const metadata = generateMeta({
  title: "产品点评 - 真实用户视角",
  description: "AooBee 产品点评，从真实使用视角拆解各产品优缺点与适用人群。",
  keywords: ["产品点评", "用户点评", "优缺点", "真实体验"],
  url: "/reviews",
});

export default async function ReviewsListPage() {
  const reviews = getReviews().filter((r) => r.published);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: "https://www.aoobee.com" },
          { name: "产品点评", url: "https://www.aoobee.com/reviews" },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "产品点评", href: "/reviews" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">产品点评</h1>
          <p className="mt-2 text-gray-500">
            从真实使用视角出发的点评，客观拆解每个产品的优缺点与适用人群。
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">暂无点评，请向 content/reviews 添加。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((review) => (
              <Link
                key={review.slug}
                href={`/reviews/${review.slug}`}
                className="group block bg-white rounded-xl border border-gray-200 p-6
                           hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    产品点评
                  </span>
                  {review.rating != null && (
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {review.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
                  {review.title}
                </h2>
                {review.summary && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{review.summary}</p>
                )}
                <div className="mt-3 text-xs text-gray-400">
                  <span>点评对象：{review.product}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

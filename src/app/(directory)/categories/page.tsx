import Link from "next/link";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { db } from "@/lib/db";

export const revalidate = 60;

export const metadata = generateMeta({
  title: "全部行业分类",
  description: "浏览 AooBee 收录的全部行业分类，涵盖人工智能、软件开发、电商零售、数字营销等各行业产品和服务。",
  keywords: ["行业分类", "产品目录", "工具分类", "服务分类"],
  url: "/categories",
});

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: "https://www.aoobee.com" },
          { name: "全部行业分类", url: "https://www.aoobee.com/categories" },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "全部行业分类", href: "/categories" }]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">全部行业分类</h1>
          <p className="mt-2 text-gray-500">
            AooBee 收录了 {categories.length} 个行业分类，点击进入查看该行业下的产品和服务。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group bg-white rounded-xl border border-gray-200 p-6
                         hover:shadow-lg hover:border-primary/30 transition-all duration-200"
            >
              <div className="text-4xl mb-3">{cat.icon || "📦"}</div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {cat.description}
                </p>
              )}
              <p className="mt-3 text-sm text-primary font-medium">
                {cat._count.products} 个产品 →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

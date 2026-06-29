import Link from "next/link";
import { Star, TrendingUp, ExternalLink } from "lucide-react";

// 产品卡片组件
export function ProductCard({
  product,
}: {
  product: {
    name: string;
    slug: string;
    description: string;
    logo?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    pricing?: string | null;
    category?: { name: string; slug: string } | null;
  };
}) {
  return (
    <Link
      href={`/${product.category?.slug || "uncategorized"}/${product.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 p-5
                 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center
                        overflow-hidden shrink-0">
          {product.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.logo}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-primary">
              {product.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary truncate">
              {product.name}
            </h3>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
            {product.rating != null && product.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {product.rating.toFixed(1)}
              </span>
            )}
            {product.reviewCount != null && product.reviewCount > 0 && (
              <span>{product.reviewCount} 评价</span>
            )}
            {product.pricing && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                {product.pricing}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// 产品列表组件
export function ProductList({
  products,
  title,
  showMoreHref,
}: {
  products: Array<{
    name: string;
    slug: string;
    description: string;
    logo?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    pricing?: string | null;
    category?: { name: string; slug: string } | null;
  }>;
  title?: string;
  showMoreHref?: string;
}) {
  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {showMoreHref && (
            <Link
              href={showMoreHref}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              查看更多 →
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

// 分类卡片组件
export function CategoryCard({
  category,
}: {
  category: {
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    _count?: { products: number };
  };
}) {
  return (
    <Link
      href={`/${category.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 p-6
                 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
    >
      <div className="text-3xl mb-3">{category.icon || "📦"}</div>
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
        {category.name}
      </h3>
      {category.description && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {category.description}
        </p>
      )}
      {category._count && (
        <p className="mt-3 text-xs text-gray-400">
          {category._count.products} 个产品
        </p>
      )}
    </Link>
  );
}

// 统计数据组件
export function StatBar({
  stats,
}: {
  stats: Array<{ label: string; value: string; icon?: React.ReactNode }>;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border border-gray-200 p-4 text-center"
        >
          <div className="flex items-center justify-center mb-2 text-primary">
            {stat.icon || <TrendingUp className="w-5 h-5" />}
          </div>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aoobee.com";

/**
 * 统一给页面型 URL 补末尾斜杠，使 JSON-LD 中的 canonical 与 trailingSlash:true 下
 * 实际生成的链接（/guide/slug/）保持一致，避免爬虫把 /guide/slug 与 /guide/slug/ 视为重复。
 * 根域名、带文件后缀、已含斜杠的地址原样返回。
 */
function normUrl(u: string): string {
  if (!/^https?:\/\//.test(u)) return u;
  const clean = u.split("#")[0].split("?")[0];
  if (/\.[a-z0-9]{2,}$/i.test(clean)) return u;
  if (clean.endsWith("/")) return u;
  try {
    const path = new URL(u).pathname;
    if (path === "/" || path === "") return u;
  } catch {
    /* ignore */
  }
  return u + "/";
}

/**
 * 产品 @type 按分类映射：实体家电=Product，维修/装修/养老等服务=Service，
 * AI/办公/教育/育儿等软件或应用保持 SoftwareApplication（省略即默认）。
 */
const PRODUCT_SCHEMA_TYPE: Record<string, string> = {
  jiadian: "Product",
  weixiu: "Service",
  zhuangxiu: "Service",
  yanglao: "Service",
};

export function productSchema(product: {
  name: string;
  description?: string | null;
  url?: string | null;
  logo?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  pricing?: string | null;
  company?: string | null;
  category?: string | null;
  features?: Array<{ name: string; description?: string }> | null;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": PRODUCT_SCHEMA_TYPE[product.category ?? ""] ?? "SoftwareApplication",
    name: product.name,
    description: product.description || product.name,
    applicationCategory: product.category || "GeneralApplication",
    operatingSystem: "Web",
  };

  if (product.url) schema.url = normUrl(product.url);
  if (product.logo) schema.image = product.logo;
  if (product.company) {
    schema.author = {
      "@type": "Organization",
      name: product.company,
    };
  }

  if (product.pricing) {
    schema.offers = {
      "@type": "Offer",
      price: product.pricing === "免费" ? "0" : "",
      priceCurrency: "CNY",
      availability: "https://schema.org/OnlineOnly",
    };
  }

  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
}

/**
 * FAQ 结构化数据
 */
export function faqSchema(
  items: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * 文章结构化数据
 */
export function articleSchema(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  image?: string | null;
  authorName?: string;
  url?: string;
}) {
  const canonical = normUrl(article.url || `${BASE_URL}/guide/${article.slug}`);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: canonical,
    author: {
      "@type": "Organization",
      name: article.authorName || "AooBee 编辑部",
    },
    publisher: {
      "@type": "Organization",
      name: "AooBee",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.svg`,
      },
    },
  };

  if (article.publishedAt) {
    schema.datePublished = new Date(article.publishedAt).toISOString();
  }
  if (article.updatedAt) {
    schema.dateModified = new Date(article.updatedAt).toISOString();
  }
  if (article.image) {
    schema.image = article.image;
  }

  return schema;
}

/**
 * 面包屑结构化数据
 */
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: normUrl(item.url),
    })),
  };
}

/**
 * ItemList 结构化数据 (用于推荐列表页)
 */
export function itemListSchema(
  items: Array<{ name: string; url: string; description?: string }>,
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      description: item.description,
    })),
  };
}

/**
 * CollectionPage 结构化数据 (用于分类页)
 */
export function collectionPageSchema(collection: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    description: collection.description,
    url: collection.url,
  };
}

/**
 * WebSite 结构化数据 (用于首页)
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AooBee",
    alternateName: "AooBee 全行业平台",
    url: BASE_URL,
    description:
      "全行业产品、工具、服务平台目录，提供专业评测、对比和推荐",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * 品牌实体外部权威档案 URL（schema.org sameAs 语义 = 指向"同一实体"的**站外**权威页面，
 * 如微博/知乎/B站/GitHub/企查查主体页等）。
 *
 * 注意：**不要放本站自己的 URL**（如首页 / /about / /contact）——自指对实体识别无效，
 * 反而是错误信号。没有真实外部档案时保持为空数组，schema 中直接不输出 sameAs 字段。
 * 将来拿到真实链接时，只需在此数组补 URL，无需改动其他代码。
 */
const ORG_SAME_AS: string[] = [];

/**
 * 组织实体结构化数据 (用于首页，声明品牌身份；有外部权威档案时输出 sameAs，
 * 利于 AI 与搜索引擎理解"谁是 AooBee")
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AooBee",
    alternateName: "AooBee 全行业平台",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    description: "全行业产品、工具与服务目录，提供专业评测、对比和推荐。",
    ...(ORG_SAME_AS.length > 0 ? { sameAs: ORG_SAME_AS } : {}),
  };
}

/**
 * 点评结构化数据 (Review 内容类型，非交互评价)
 */
export function reviewSchema(review: {
  title: string;
  slug: string;
  product: string;
  author?: string | null;
  rating?: number | null;
  summary?: string | null;
  category?: string | null;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: review.title,
    url: normUrl(`${BASE_URL}/reviews/${review.slug}`),
    itemReviewed: {
      "@type": PRODUCT_SCHEMA_TYPE[review.category ?? ""] ?? "SoftwareApplication",
      name: review.product,
    },
    author: {
      "@type": "Organization",
      name: review.author || "AooBee 编辑部",
    },
    publisher: {
      "@type": "Organization",
      name: "AooBee",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.svg`,
      },
    },
  };

  if (review.rating != null) {
    schema.reviewRating = {
      "@type": "Rating",
      ratingValue: review.rating.toString(),
      bestRating: "5",
      worstRating: "1",
    };
  }
  if (review.summary) schema.reviewBody = review.summary;

  return schema;
}

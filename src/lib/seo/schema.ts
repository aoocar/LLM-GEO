const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aoobee.com";

/**
 * 产品页结构化数据 - SoftwareApplication
 */
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
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.description || product.name,
    applicationCategory: product.category || "GeneralApplication",
    operatingSystem: "Web",
  };

  if (product.url) schema.url = product.url;
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
  const canonical = article.url || `${BASE_URL}/guide/${article.slug}`;
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
        url: `${BASE_URL}/logo.png`,
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
      item: item.url,
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
 * 点评结构化数据 (Review 内容类型，非交互评价)
 */
export function reviewSchema(review: {
  title: string;
  slug: string;
  product: string;
  author?: string | null;
  rating?: number | null;
  summary?: string | null;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: review.title,
    url: `${BASE_URL}/reviews/${review.slug}`,
    itemReviewed: {
      "@type": "SoftwareApplication",
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
        url: `${BASE_URL}/logo.png`,
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

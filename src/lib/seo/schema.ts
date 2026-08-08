const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aoobee.com";

/**
 * 统一给页面型 URL 补末尾斜杠，使 JSON-LD 中的 canonical 与 trailingSlash:true 下
 * 实际生成的链接（/guide/slug/）保持一致，避免爬虫把 /guide/slug 与 /guide/slug/ 视为重复。
 * 根域名、带文件后缀、已含斜杠的地址原样返回。
 */
export function normUrl(u: string): string {
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
 * 产品 @type 按分类映射：实体家电=Product，维修/装修/养老等服务=LocalBusiness
 * （Service 的父类型，且明确在 Google 评价摘要支持列表内），
 * AI/办公/教育/育儿等软件或应用保持 SoftwareApplication（省略即默认）。
 */
const PRODUCT_SCHEMA_TYPE: Record<string, string> = {
  jiadian: "Product",
  weixiu: "LocalBusiness",
  zhuangxiu: "LocalBusiness",
  yanglao: "LocalBusiness",
  tongxun: "Product",
  digital: "Product",
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
  reviews?: Array<{ id: string; author?: string; rating?: number; content: string }> | null;
}) {
  const type = PRODUCT_SCHEMA_TYPE[product.category ?? ""] ?? "SoftwareApplication";
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    name: product.name,
    description: product.description || product.name,
  };

  // applicationCategory / operatingSystem 是 SoftwareApplication 专有属性，
  // 对 Product / Service 属非法字段，仅在该类型下输出，避免富结果被拒。
  if (type === "SoftwareApplication") {
    schema.applicationCategory = product.category || "GeneralApplication";
    schema.operatingSystem = "Web";
  }

  if (product.url) schema.url = normUrl(product.url);
  // image：loader 已保证 logo 非空（无显式 logo 时回退到 /aoobee-logo.jpg），
  // 此处再兜底一次并转绝对 URL，解决 GSC「未填写字段 image」严重问题。
  schema.image = product.logo
    ? product.logo.startsWith("http")
      ? product.logo
      : `${BASE_URL}${product.logo}`
    : `${BASE_URL}/logo.svg`;
  // brand：全局标识符缺失的 GSC 提示，用公司名或产品名补齐。
  schema.brand = {
    "@type": "Brand",
    name: product.company || product.name,
  };
  if (product.company) {
    schema.author = {
      "@type": "Organization",
      name: product.company,
    };
  }

  // offers：仅当能可靠解析出价格时才输出，避免非法空 price Offer 拖累富结果。
  if (product.pricing) {
    let price: string | null = null;
    if (product.pricing === "免费") {
      price = "0";
    } else {
      const m = product.pricing.match(/(\d+(?:\.\d+)?)/);
      if (m) price = m[1];
    }
    if (price !== null) {
      const currency = /\$/.test(product.pricing) ? "USD" : "CNY";
      schema.offers = {
        "@type": "Offer",
        price,
        priceCurrency: currency,
        availability: "https://schema.org/OnlineOnly",
        // GSC 提示 offers 缺退货政策/配送信息：补保守默认值（线上服务不适用七天无理由）。
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "CN",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
          merchantReturnDays: 0,
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency,
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "CN",
          },
        },
      };
    }
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

  // review：把本站真实点评注入 itemReviewed（最多 2 条），解决 GSC「未填写字段 review」；
  // 与 aggregateRating 双保险，产品富结果可同时带评分与评价内容。
  if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    const reviews = product.reviews.slice(0, 2).map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Organization",
        name: r.author || "AooBee 编辑部",
      },
      ...(typeof r.rating === "number"
        ? {
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating.toString(),
              bestRating: "5",
              worstRating: "1",
            },
          }
        : {}),
      ...(r.content ? { reviewBody: r.content.slice(0, 500) } : {}),
    }));
    schema.review = reviews.length === 1 ? reviews[0] : reviews;
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
  const raw = article.url || `${BASE_URL}/guide/${article.slug}`;
  const canonical = normUrl(raw.startsWith("http") ? raw : `${BASE_URL}${raw}`);
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
 *
 * itemReviewed 补齐产品完整信息（与产品页 productSchema 一致）：
 * image / brand / url / description + review / aggregateRating，
 * 解决 GSC「产品摘要结构化数据」未填写字段 review、aggregateRating 问题；
 * 同时补 datePublished（无点评日期时按产品页 updatedAt 派生）。
 */
export function reviewSchema(review: {
  title: string;
  slug: string;
  product: string;
  /** 产品真实名称（如“土巴兔”），缺省回退到产品 slug */
  productName?: string | null;
  author?: string | null;
  rating?: number | null;
  summary?: string | null;
  category?: string | null;
  /** 产品页 logo（缺省时用 AooBee 自有 logo 兜底，与产品页一致） */
  productLogo?: string | null;
  /** 品牌/公司名（如“中国联通”），解决 GSC「未提供全局标识符」 */
  productBrand?: string | null;
  /** 产品详情页 URL（如 /tongxun/liantong-dawangka） */
  productUrl?: string | null;
  /** 产品描述 */
  productDescription?: string | null;
  /** 产品页 updatedAt，用于派生 datePublished（点评 frontmatter 无日期字段） */
  productUpdatedAt?: string | null;
}) {
  const productHref = review.productUrl
    ? normUrl(
        review.productUrl.startsWith("http")
          ? review.productUrl
          : `${BASE_URL}${review.productUrl}`
      )
    : normUrl(`${BASE_URL}/reviews/${review.slug}`);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: review.title,
    url: normUrl(`${BASE_URL}/reviews/${review.slug}`),
    itemReviewed: {
      "@type": PRODUCT_SCHEMA_TYPE[review.category ?? ""] ?? "SoftwareApplication",
      name: review.productName || review.product,
      // image：与产品页一致，真实 logo 缺失时用 AooBee 自有 logo 兜底，保证非空
      image: review.productLogo
        ? review.productLogo.startsWith("http")
          ? review.productLogo
          : `${BASE_URL}${review.productLogo}`
        : `${BASE_URL}/aoobee-logo.jpg`,
      // brand：全局标识符，公司名或产品名兜底
      brand: {
        "@type": "Brand",
        name: review.productBrand || review.productName || review.product,
      },
      // url：指向产品详情页，便于搜索引擎关联点评与产品实体
      url: productHref,
      description: review.productDescription || review.summary || review.title,
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
    // 点评自身即一条 Review：回填进 itemReviewed.review + aggregateRating，
    // 让「产品摘要」富结果拿到完整评价数据，解决 GSC 未填写字段 review/aggregateRating
    ;(schema.itemReviewed as Record<string, unknown>).review = {
      "@type": "Review",
      name: review.title,
      reviewBody: review.summary || "",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating.toString(),
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Organization",
        name: review.author || "AooBee 编辑部",
      },
    };
    (schema.itemReviewed as Record<string, unknown>).aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: review.rating.toString(),
      reviewCount: "1",
      bestRating: "5",
      worstRating: "1",
    };
  }
  if (review.summary) schema.reviewBody = review.summary;

  // 点评 frontmatter 无日期字段，按产品页 updatedAt 派生，保证 datePublished 非空
  if (review.productUpdatedAt) {
    schema.datePublished = new Date(review.productUpdatedAt).toISOString();
  }

  return schema;
}

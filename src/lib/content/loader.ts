import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { markdownToHtml } from "./markdown";
import type { Category, Product, ProductSummary, Article, Review, ReviewSummary } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

const DIR_TO_TYPE: Record<string, string> = {
  guide: "GUIDE",
  best: "BEST",
  compare: "COMPARISON",
  faq: "FAQ",
  review: "REVIEW",
};

let _cats: Category[] | null = null;
let _products: Product[] | null = null;
let _articles: Article[] | null = null;
let _reviews: Review[] | null = null;

function fileSlug(file: string): string {
  return path.basename(file, ".md");
}

/**
 * 从 markdown 正文派生 meta description：跳过纯标题行，取首个有效段落，
 * 去掉 markdown 标记后截取前 160 字。仅当 frontmatter 未显式提供 description 时使用。
 */
function deriveDescription(content: string): string {
  const paras = content
    .split(/\n\s*\n/)
    .map((p) => p.replace(/^#+\s*/gm, "").replace(/[*_`>#]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const first = paras.find((p) => p.length > 10) || paras[0] || "";
  return first.slice(0, 160);
}

/**
 * 派生文章 meta description：FAQ 类文章正文为空、内容在 faqItems 中，
 * 故优先用前几条问答拼接；其余类型回退到正文首段。避免 description 退化成仅标题。
 */
function deriveArticleDesc(
  faqItems: Array<{ question?: string; answer?: string }>,
  content: string
): string {
  if (Array.isArray(faqItems) && faqItems.length > 0) {
    const combined = faqItems
      .slice(0, 3)
      .map((f) =>
        `${(f.question || "").replace(/\s+/g, "")}${(f.answer || "").replace(/\s+/g, "")}`
      )
      .join("");
    const text = combined.replace(/[*_`>#]/g, "").trim();
    if (text) return text.slice(0, 160);
  }
  return deriveDescription(content);
}

function listMd(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => path.join(dir, f));
}

/**
 * 统计每个分类下的产品数量（只读 frontmatter 的 category 字段，避免触发 getProducts 产生递归）。
 * 用于分类卡片 / 全部分类页展示真实产品数。
 */
function countProductsByCategory(): Record<string, number> {
  const base = path.join(CONTENT_DIR, "products");
  const counts: Record<string, number> = {};
  if (!fs.existsSync(base)) return counts;
  for (const catDir of fs.readdirSync(base, { withFileTypes: true })) {
    if (!catDir.isDirectory()) continue;
    for (const f of listMd(path.join(base, catDir.name))) {
      const { data } = matter(fs.readFileSync(f, "utf-8"));
      if (data.published === false) continue;
      const catSlug = (data.category as string) || catDir.name;
      counts[catSlug] = (counts[catSlug] || 0) + 1;
    }
  }
  return counts;
}

// ---------- Categories ----------
function parseCategories(): Category[] {
  const dir = path.join(CONTENT_DIR, "categories");
  return listMd(dir)
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(f, "utf-8"));
      const slug = (data.slug as string) || fileSlug(f);
      return {
        slug,
        name: (data.name as string) || slug,
        description: (data.description as string) || content.trim().slice(0, 200),
        icon: data.icon as string | undefined,
        order: typeof data.order === "number" ? data.order : 999,
        published: data.published !== false,
        children: [],
        products: [],
        productCount: 0,
      } as Category;
    })
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export function getCategories(): Category[] {
  if (!_cats) {
    const counts = countProductsByCategory();
    _cats = parseCategories().map((c) => ({
      ...c,
      productCount: counts[c.slug] || 0,
    }));
  }
  return _cats;
}

export function getCategory(slug: string): Category | null {
  const base = getCategories().find((c) => c.slug === slug);
  if (!base) return null;
  const products = getProductsByCategory(slug);
  return { ...base, children: [], products, productCount: products.length };
}

// ---------- Products ----------
function toSummary(p: Product): ProductSummary {
  return {
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category,
    rating: p.rating,
    pricing: p.pricing,
    tags: p.tags,
    logo: p.logo,
  };
}

function resolveAlternatives(
  slugs: string[],
  catSlug: string,
  selfSlug: string,
  all: Product[]
): ProductSummary[] {
  if (slugs.length > 0) {
    return slugs
      .map((s) => all.find((p) => p.slug === s))
      .filter((p): p is Product => !!p)
      .map(toSummary);
  }
  return all
    .filter((p) => p.category.slug === catSlug && p.slug !== selfSlug)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)
    .map(toSummary);
}

function parseProduct(file: string, catDirName: string): Product | null {
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  if (data.published === false) return null;
  const slug = (data.slug as string) || fileSlug(file);
  const categorySlug = (data.category as string) || catDirName;
  const category = getCategories().find((c) => c.slug === categorySlug);
  const reviews = getReviewsByProductSlug(slug);
  const altSlugs: string[] = Array.isArray(data.alternatives) ? data.alternatives : [];
  return {
    slug,
    name: (data.name as string) || slug,
    description: (data.description as string) || deriveDescription(content),
    category: { name: category?.name || categorySlug, slug: categorySlug },
    url: (data.url as string) || null,
    company: (data.company as string) || null,
    founded: (data.founded as string) || null,
    location: (data.location as string) || null,
    pricing: (data.pricing as string) || null,
    pricingDetail: (data.pricingDetail as string) || null,
    rating: typeof data.rating === "number" ? data.rating : 0,
    reviewCount: reviews.length,
    longDesc: content.trim() || null,
    features: Array.isArray(data.features) ? data.features : [],
    pros: Array.isArray(data.pros) ? data.pros : [],
    cons: Array.isArray(data.cons) ? data.cons : [],
    useCases: Array.isArray(data.useCases) ? data.useCases : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    alternatives: [],
    reviews,
    faqItems:
      Array.isArray(data.faqItems) && data.faqItems.length > 0
        ? data.faqItems
        : buildDefaultFaq({
            name: (data.name as string) || slug,
            description: (data.description as string) || "",
            pricing: (data.pricing as string) || null,
            pricingDetail: (data.pricingDetail as string) || null,
            useCases: Array.isArray(data.useCases) ? data.useCases : [],
            pros: Array.isArray(data.pros) ? data.pros : [],
            cons: Array.isArray(data.cons) ? data.cons : [],
            company: (data.company as string) || null,
            location: (data.location as string) || null,
          }),
    // 内部辅助：暂存替代品 slug，稍后填充
    _altSlugs: altSlugs,
  } as Product & { _altSlugs: string[] };
}

function parseProducts(): Product[] {
  const base = path.join(CONTENT_DIR, "products");
  if (!fs.existsSync(base)) return [];
  const result: Product[] = [];
  const altMap = new Map<string, string[]>();
  const dirs = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  for (const catDir of dirs) {
    for (const f of listMd(path.join(base, catDir))) {
      const p = parseProduct(f, catDir);
      if (p) {
        const { _altSlugs, ...rest } = p as Product & { _altSlugs: string[] };
        result.push(rest as Product);
        altMap.set(rest.slug, _altSlugs);
      }
    }
  }
  // 全部产品就位后再填充替代品，避免递归读盘
  for (const p of result) {
    p.alternatives = resolveAlternatives(altMap.get(p.slug) || [], p.category.slug, p.slug, result);
  }
  return result;
}

export function getProducts(): Product[] {
  if (!_products) _products = parseProducts();
  return _products;
}

export function getProductBySlug(slug: string): Product | null {
  return getProducts().find((p) => p.slug === slug) || null;
}

export function getProduct(categorySlug: string, slug: string): Product | null {
  return (
    getProducts().find((p) => p.slug === slug && p.category.slug === categorySlug) || null
  );
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return getProducts().filter((p) => p.category.slug === categorySlug);
}

// ---------- Articles ----------
function parseArticle(file: string, typeFromDir: string): Article | null {
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  if (data.published === false) return null;
  const slug = (data.slug as string) || fileSlug(file);
  const type = (data.type as string) || typeFromDir;
  const catSlug = data.category as string | undefined;
  const category = catSlug ? getCategories().find((c) => c.slug === catSlug) : null;
  return {
    slug,
    title: (data.title as string) || slug,
    type,
    excerpt: (data.excerpt as string) || null,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    metaTitle: (data.metaTitle as string) || null,
    metaDesc:
      (data.metaDesc as string) ||
      deriveArticleDesc(
        Array.isArray(data.faqItems) ? data.faqItems : [],
        content
      ),
    content: content.trim(),
    contentHtml: markdownToHtml(content),
    faqItems: Array.isArray(data.faqItems) ? data.faqItems : [],
    publishedAt: data.publishedAt ? new Date(data.publishedAt as string).toISOString() : null,
    updatedAt: data.updatedAt ? new Date(data.updatedAt as string).toISOString() : null,
    readTime: typeof data.readTime === "number" ? data.readTime : null,
    authorName: (data.authorName as string) || null,
    category: category ? { name: category.name, slug: category.slug } : null,
    related: Array.isArray(data.related) ? data.related.map((x: unknown) => String(x)) : [],
    definition: (data.definition as string) || null,
    definitionTerm: (data.definitionTerm as string) || null,
    audience: (data.audience as string) || null,
    published: true,
  };
}

function parseArticles(): Article[] {
  const base = path.join(CONTENT_DIR, "articles");
  if (!fs.existsSync(base)) return [];
  const result: Article[] = [];
  const dirs = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  for (const dirName of dirs) {
    const typeFromDir = DIR_TO_TYPE[dirName] || dirName.toUpperCase();
    for (const f of listMd(path.join(base, dirName))) {
      const a = parseArticle(f, typeFromDir);
      if (a) result.push(a);
    }
  }
  return result;
}

export function getArticles(): Article[] {
  if (!_articles) _articles = parseArticles();
  return _articles;
}

export function getArticle(slug: string): Article | null {
  return getArticles().find((a) => a.slug === slug) || null;
}

export function getArticlesByType(type: string): Article[] {
  return getArticles().filter((a) => a.type === type);
}

// ---------- Reviews (content type) ----------
function parseReviews(): Review[] {
  const dir = path.join(CONTENT_DIR, "reviews");
  return listMd(dir).map((f) => {
    const { data, content } = matter(fs.readFileSync(f, "utf-8"));
    const slug = (data.slug as string) || fileSlug(f);
    return {
      slug,
      title: (data.title as string) || slug,
      product: (data.product as string) || "",
      author: (data.author as string) || null,
      rating: typeof data.rating === "number" ? data.rating : null,
      pros: Array.isArray(data.pros) ? data.pros : [],
      cons: Array.isArray(data.cons) ? data.cons : [],
      summary: (data.summary as string) || null,
      content: content.trim(),
    contentHtml: markdownToHtml(content),
    related: Array.isArray(data.related) ? data.related.map((x: unknown) => String(x)) : [],
    published: data.published !== false,
  };
  });
}

export function getReviews(): Review[] {
  if (!_reviews) _reviews = parseReviews();
  return _reviews;
}

export function getReview(slug: string): Review | null {
  return getReviews().find((r) => r.slug === slug) || null;
}

export function getReviewsByProductSlug(productSlug: string): ReviewSummary[] {
  return getReviews()
    .filter((r) => r.product === productSlug)
    .map((r) => ({
      id: r.slug,
      author: r.author || undefined,
      rating: r.rating || undefined,
      content: r.content,
      verified: false,
    }));
}

// ---------- Sitemap helper ----------
export function getAllContent() {
  return {
    categories: getCategories(),
    products: getProducts(),
    articles: getArticles(),
    reviews: getReviews(),
  };
}

// 当产品未提供 faqItems 时，基于字段生成默认 FAQ（保留原产品页体验）
function buildDefaultFaq(p: {
  name: string;
  description?: string;
  pricing?: string | null;
  pricingDetail?: string | null;
  useCases: string[];
  pros: string[];
  cons: string[];
  company?: string | null;
  location?: string | null;
}): Array<{ question: string; answer: string }> {
  return [
    { question: `${p.name} 是什么？`, answer: p.description || `${p.name} 是一款产品/服务。` },
    {
      question: `${p.name} 的定价是多少？`,
      answer: p.pricingDetail || (p.pricing ? `${p.pricing}，请访问官网了解详情。` : "暂无定价信息"),
    },
    {
      question: `${p.name} 适合哪些人使用？`,
      answer: p.useCases.length > 0 ? `适用于：${p.useCases.join("、")}。` : "适合各类用户使用。",
    },
    {
      question: `${p.name} 的优点有哪些？`,
      answer: p.pros.length > 0 ? p.pros.join("；") + "。" : "暂无评价数据。",
    },
    {
      question: `${p.name} 的缺点有哪些？`,
      answer: p.cons.length > 0 ? p.cons.join("；") + "。" : "暂无评价数据。",
    },
    {
      question: `${p.name} 的公司是哪家？`,
      answer: p.company ? `${p.name}由${p.company}开发，公司位于${p.location || "未知"}。` : "暂无公司信息。",
    },
  ];
}

import { getArticle, getReview, getProduct } from "./loader";

export type RelatedInput = string | { href: string; title?: string };

export interface RelatedItem {
  title: string;
  href: string;
}

// 文章类型段名 → 内部 type 值（与 loader DIR_TO_TYPE 对齐）
const ARTICLE_SEGMENT_TYPE: Record<string, string> = {
  best: "BEST",
  compare: "COMPARISON",
  review: "REVIEW",
  guide: "GUIDE",
  faq: "FAQ",
};

/**
 * 将 related 输入解析为可渲染的 {title, href} 列表。
 * 支持两种写法：纯路径字符串（如 "/compare/tujia-vs-qijia"），
 * 或显式对象 { href, title }。路径按 文章段/点评/reviews/产品 顺序解析，
 * 解析失败（目标不存在）的条目会被过滤，保证渲染不出死链。
 */
export function resolveRelated(inputs?: RelatedInput[]): RelatedItem[] {
  if (!Array.isArray(inputs) || inputs.length === 0) return [];
  const out: RelatedItem[] = [];
  for (const input of inputs) {
    if (typeof input === "string") {
      const item = resolvePath(input);
      if (item) out.push(item);
    } else if (input && typeof input.href === "string") {
      const title = input.title || resolvePath(input.href)?.title || input.href;
      out.push({ href: input.href, title });
    }
  }
  return out;
}

function resolvePath(href: string): RelatedItem | null {
  const clean = href.replace(/^\/+/, "").replace(/\/+$/, "");
  const parts = clean.split("/");
  if (parts.length < 2) return null;
  const [seg, slug] = parts;

  if (seg === "reviews") {
    const r = getReview(slug);
    if (r) return { href: `/reviews/${slug}`, title: r.title };
    return null;
  }

  const type = ARTICLE_SEGMENT_TYPE[seg];
  if (type) {
    const a = getArticle(slug);
    if (a && a.type === type) return { href: `/${seg}/${slug}`, title: a.title };
    return null;
  }

  // 产品页：/category/slug
  const product = getProduct(seg, slug);
  if (product) return { href: `/${seg}/${slug}`, title: product.name };
  return null;
}

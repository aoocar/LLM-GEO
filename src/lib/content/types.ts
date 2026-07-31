// 内容数据类型定义（对齐原 Prisma 模型字段，便于页面最小改动迁移）

export interface Category {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  published: boolean;
  children: Category[];
  products: ProductSummary[];
  productCount: number;
}

export interface ProductSummary {
  slug: string;
  name: string;
  description: string;
  category: { name: string; slug: string };
  rating?: number | null;
  reviewCount?: number | null;
  pricing?: string | null;
  tags?: string[];
  logo?: string | null;
}

export interface Product extends ProductSummary {
  url?: string | null;
  company?: string | null;
  founded?: string | null;
  location?: string | null;
  pricingDetail?: string | null;
  rating: number;
  reviewCount: number;
  longDesc?: string | null;
  features: Array<{ name: string; description?: string }>;
  pros: string[];
  cons: string[];
  useCases: string[];
  alternatives: ProductSummary[];
  reviews: ReviewSummary[];
  faqItems: Array<{ question: string; answer: string }>;
}

export interface ReviewSummary {
  id: string;
  author?: string;
  rating?: number;
  content: string;
  verified?: boolean;
}

export interface Article {
  slug: string;
  title: string;
  type: string;
  excerpt?: string | null;
  keywords?: string[];
  metaTitle?: string | null;
  metaDesc?: string | null;
  content: string;
  contentHtml: string;
  faqItems: Array<{ question: string; answer: string }>;
  publishedAt?: string | null;
  updatedAt?: string | null;
  readTime?: number | null;
  authorName?: string | null;
  related?: string[];
  category: { name: string; slug: string } | null;
  published: boolean;
}

// content/reviews/ 下的点评内容（原 Review 模型，人工/AI 生成，非交互）
export interface Review {
  slug: string;
  title: string;
  product: string;
  author?: string | null;
  rating?: number | null;
  pros: string[];
  cons: string[];
  summary?: string | null;
  related?: string[];
  content: string;
  contentHtml: string;
  published: boolean;
}

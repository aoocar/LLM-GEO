// 构建前生成 public/llms.txt（静态导出不支持 route handler）
import fs from "fs";
import path from "path";
import { getAllContent } from "../src/lib/content";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aoobee.com";
const { categories, products, articles, reviews } = getAllContent();

const ARTICLE_PREFIX: Record<string, string> = {
  GUIDE: "guide",
  COMPARISON: "compare",
  REVIEW: "review",
  FAQ: "faq",
  LISTICLE: "guide",
  HOW_TO: "guide",
  BEST: "best",
};

const lines: string[] = [];
lines.push("# AooBee");
lines.push("");
lines.push("AooBee 是全行业产品与服务目录，面向 GEO/SEO 提供结构化内容源。");
lines.push("");
lines.push("## 内容清单");
lines.push("");
for (const c of categories) lines.push(`- 分类 ${c.name}: ${BASE}/${c.slug}`);
for (const p of products) lines.push(`- 产品 ${p.name}: ${BASE}/${p.category.slug}/${p.slug}`);
for (const a of articles) {
  const prefix = ARTICLE_PREFIX[a.type] || "guide";
  lines.push(`- 文章 ${a.title}: ${BASE}/${prefix}/${a.slug}`);
}
for (const r of reviews) lines.push(`- 点评 ${r.title}: ${BASE}/reviews/${r.slug}`);
lines.push("");
lines.push("## 说明");
lines.push("- 所有内容以 Markdown 文件形式维护于 content/ 目录，可用 Obsidian 管理。");
lines.push(`- 站点地址：${BASE}`);

fs.mkdirSync(path.join(process.cwd(), "public"), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), "public", "llms.txt"), lines.join("\n"));
console.log(
  `llms.txt generated: ${categories.length + products.length + articles.length + reviews.length} entries`
);

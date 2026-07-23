// 内容模板生成器：根据内容类型输出符合 content/ 目录规范的 Markdown 脚手架
// 用法：npm run gen -- template <type> <slug> [--name "显示名"]
// 支持类型：category / product / guide / best / compare / faq / review / reviews

type ContentType =
  | "category"
  | "product"
  | "guide"
  | "best"
  | "compare"
  | "faq"
  | "review"
  | "reviews";

const TYPE_DIR: Record<ContentType, string> = {
  category: "content/categories",
  product: "content/products",
  guide: "content/articles/guide",
  best: "content/articles/best",
  compare: "content/articles/compare",
  faq: "content/articles/faq",
  review: "content/articles/review",
  reviews: "content/reviews",
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildTemplate(type: ContentType, slug: string, name?: string): string {
  const label = name || slug;
  const date = today();
  switch (type) {
    case "category":
      return `---
slug: ${slug}
name: ${label}
description: ${label}相关的产品、工具与服务目录。
icon: 📁
order: 99
published: true
---
${label}分类下收录了各类优质产品与服务，提供专业评测、对比与推荐。
`;
    case "product":
      return `---
slug: ${slug}
name: ${label}
category: ai
url: https://example.com
company: 公司名
founded: 2020
location: 城市
pricing: 免费/付费
pricingDetail: 具体定价说明
rating: 4.5
description: ${label} 是一款……（定义句式开头）
features: [功能1, 功能2]
pros: [优点1, 优点2]
cons: [缺点1, 缺点2]
useCases: [场景1, 场景2]
alternatives: []
published: true
---
在这里写 500-800 字的产品详细介绍，使用 Markdown 格式。
`;
    case "guide":
      return `---
title: ${label}
type: GUIDE
category: ai
keywords: [关键词1, 关键词2]
excerpt: 150 字以内的摘要，直接回答核心问题。
authorName: AooBee 编辑部
metaTitle: SEO 标题（60 字内）
metaDesc: SEO 描述（160 字内）
publishedAt: ${date}
updatedAt: ${date}
readTime: 8
published: true
---
# ${label}

开头 2-3 句直接回答核心问题，方便 AI 提取答案。
`;
    case "best":
      return `---
title: ${label}
type: BEST
category: ai
keywords: [关键词1, 关键词2]
excerpt: 150 字以内摘要。
authorName: AooBee 编辑部
metaTitle: SEO 标题
metaDesc: SEO 描述
publishedAt: ${date}
updatedAt: ${date}
readTime: 6
published: true
---
# ${label}

开头综述 + 选择建议，使用 Markdown 格式。
`;
    case "compare":
      return `---
title: ${label}
type: COMPARISON
category: ai
keywords: [关键词1, 关键词2]
excerpt: 150 字以内摘要。
authorName: AooBee 编辑部
metaTitle: SEO 标题
metaDesc: SEO 描述
publishedAt: ${date}
updatedAt: ${date}
readTime: 7
published: true
---
# ${label}

使用对比表格展示关键差异，给出选择建议。
`;
    case "faq":
      return `---
title: ${label}
type: FAQ
category: ai
keywords: [关键词1, 关键词2]
excerpt: 150 字以内摘要。
authorName: AooBee 编辑部
metaTitle: SEO 标题
metaDesc: SEO 描述
publishedAt: ${date}
updatedAt: ${date}
readTime: 4
published: true
---
# ${label}

直接回答该问题，给出简洁明确的定义或结论。
`;
    case "review":
      return `---
title: ${label}
type: REVIEW
category: ai
keywords: [关键词1, 关键词2]
excerpt: 150 字以内摘要。
authorName: AooBee 编辑部
metaTitle: SEO 标题
metaDesc: SEO 描述
publishedAt: ${date}
updatedAt: ${date}
readTime: 6
published: true
---
# ${label}

基于真实场景的深度评测与使用体验。
`;
    case "reviews":
      return `---
title: ${label}
product: chatgpt
author: AooBee 编辑部
rating: 4.7
pros: [优点1, 优点2]
cons: [缺点1, 缺点2]
summary: 一句话总评，客观拆解优缺点与适用人群。
published: true
---
从真实使用视角出发的点评正文，客观拆解产品的优缺点与适用人群。
`;
  }
}

// 允许通过 node 直接调用：node scripts/content-template.ts <type> <slug> [name]
import fs from "fs";
import path from "path";

const argv = process.argv.slice(2);
if (argv.length >= 2 && !argv.includes("--silent")) {
  const [type, slug, name] = argv;
  if (!(type in TYPE_DIR)) {
    console.error(
      `未知类型 "${type}"。可选：${Object.keys(TYPE_DIR).join(", ")}`
    );
    process.exit(1);
  }
  const tmpl = buildTemplate(type as ContentType, slug, name);
  const dir = TYPE_DIR[type as ContentType];
  fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
  const file = path.join(process.cwd(), dir, `${slug}.md`);
  if (fs.existsSync(file)) {
    console.error(`已存在，跳过：${file}`);
    process.exit(0);
  }
  fs.writeFileSync(file, tmpl);
  console.log(`已生成模板：${file}`);
}

export { buildTemplate, TYPE_DIR };
export type { ContentType };

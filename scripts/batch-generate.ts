/**
 * LLM 批量内容生成脚本（关键词驱动 + 自动入库）
 *
 * 用法:
 *   npx tsx scripts/batch-generate.ts                          # 使用默认配置 batch-config.json
 *   npx tsx scripts/batch-generate.ts my-keywords.json         # 使用自定义配置文件
 *   npx tsx scripts/batch-generate.ts --dry-run                # 预览模式（不入库）
 *   npx tsx scripts/batch-generate.ts --skip-existing          # 跳过已存在的内容
 *
 * 配置文件格式 (JSON 数组):
 * [
 *   {
 *     "type": "best|guide|compare|product|faq",
 *     "keyword": "目标关键词",
 *     "category": "行业分类",
 *     "productA": "产品A (对比用)",
 *     "productB": "产品B (对比用)",
 *     "seoTitle": "SEO标题",
 *     "seoDesc": "SEO描述",
 *     "keywords": ["关键词1", "关键词2"]
 *   }
 * ]
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  generateProductContent,
  generateComparison,
  generateGuide,
  generateBestList,
  generateFaq,
} from "../src/lib/llm/prompts";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

interface BatchItem {
  type: "product" | "comparison" | "guide" | "best" | "faq";
  keyword: string;
  category?: string;
  productA?: string;
  productB?: string;
  seoTitle?: string;
  seoDesc?: string;
  keywords?: string[];
}

// ==================== 工具函数 ====================

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

async function findOrCreateCategory(name: string) {
  if (!name) return null;
  let cat = await db.category.findUnique({ where: { slug: name } });
  if (!cat) cat = await db.category.findFirst({ where: { name } });
  if (!cat) {
    const slug = toSlug(name);
    const maxSort = await db.category.aggregate({ _max: { sortOrder: true } });
    cat = await db.category.create({
      data: {
        name, slug, icon: "📦",
        description: `${name}行业的产品和服务`,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        published: true,
      },
    });
    console.log(`  📁 新建分类: ${name}`);
  }
  return cat;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 生成逻辑 ====================

async function processItem(item: BatchItem, dryRun: boolean, skipExisting: boolean) {
  const { type, keyword, category: categoryName } = item;
  const category = categoryName ? await findOrCreateCategory(categoryName) : null;

  switch (type) {
    // ---------- 产品 ----------
    case "product": {
      const slug = toSlug(keyword);
      if (skipExisting) {
        const existing = await db.product.findUnique({ where: { slug } });
        if (existing) { console.log(`  ⏭️  跳过（已存在）: ${keyword}`); return; }
      }

      const result = await generateProductContent({ name: keyword, category: categoryName || "通用" });
      if (dryRun) {
        console.log(`  🔍 [预览] 产品: ${keyword}`);
        console.log(`     描述: ${result.description?.slice(0, 80)}...`);
        return;
      }

      await db.product.upsert({
        where: { slug },
        create: {
          name: keyword, slug,
          description: result.description,
          longDesc: result.longDesc,
          categoryId: category?.id || (await findOrCreateCategory("未分类"))!.id,
          features: result.features,
          pros: result.pros, cons: result.cons,
          tags: result.tags, useCases: result.useCases,
          status: "ACTIVE", publishedAt: new Date(),
        },
        update: {
          description: result.description, longDesc: result.longDesc,
          features: result.features, pros: result.pros, cons: result.cons,
          tags: result.tags, useCases: result.useCases,
        },
      });

      if (result.faqItems?.length > 0) {
        await db.article.upsert({
          where: { slug: `${slug}-faq` },
          create: {
            title: `${keyword} 常见问题`, slug: `${slug}-faq`,
            type: "FAQ",
            content: result.faqItems.map(f => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
            faqItems: result.faqItems,
            keywords: result.keywords,
            metaTitle: item.seoTitle || result.metaTitle,
            metaDesc: item.seoDesc || result.metaDesc,
            categoryId: category?.id,
            authorName: "AooBee 编辑部",
            published: true, publishedAt: new Date(),
          },
          update: { content: result.faqItems.map(f => `### ${f.question}\n\n${f.answer}`).join("\n\n"), faqItems: result.faqItems },
        });
      }
      console.log(`  ✅ 产品: ${keyword} → /${category?.slug || "uncategorized"}/${slug}`);
      break;
    }

    // ---------- 对比 ----------
    case "comparison": {
      const result = await generateComparison({
        productA: item.productA || keyword.split(" vs ")[0] || keyword,
        productB: item.productB || keyword.split(" vs ")[1] || "竞品",
        category: categoryName || "通用",
      });
      const slug = toSlug(item.seoTitle || result.title);

      if (skipExisting) {
        const existing = await db.article.findUnique({ where: { slug } });
        if (existing) { console.log(`  ⏭️  跳过（已存在）: ${result.title}`); return; }
      }

      if (dryRun) {
        console.log(`  🔍 [预览] 对比: ${result.title}`);
        return;
      }

      await db.article.upsert({
        where: { slug },
        create: {
          title: item.seoTitle || result.title, slug,
          type: "COMPARISON",
          content: result.content,
          excerpt: item.seoDesc || result.metaDesc,
          faqItems: result.faqItems,
          keywords: item.keywords || result.keywords,
          metaTitle: item.seoTitle || result.metaTitle,
          metaDesc: item.seoDesc || result.metaDesc,
          categoryId: category?.id,
          authorName: "AooBee 编辑部",
          readTime: 10, wordCount: 2500,
          published: true, publishedAt: new Date(),
        },
        update: { content: result.content, faqItems: result.faqItems },
      });
      console.log(`  ✅ 对比: ${result.title} → /compare/${slug}`);
      break;
    }

    // ---------- 指南 ----------
    case "guide": {
      const result = await generateGuide({
        category: categoryName || "通用",
        topic: keyword,
        targetKeywords: item.keywords || [keyword],
      });
      const slug = toSlug(item.seoTitle || result.title);

      if (skipExisting) {
        const existing = await db.article.findUnique({ where: { slug } });
        if (existing) { console.log(`  ⏭️  跳过（已存在）: ${result.title}`); return; }
      }

      if (dryRun) {
        console.log(`  🔍 [预览] 指南: ${result.title}`);
        return;
      }

      await db.article.upsert({
        where: { slug },
        create: {
          title: item.seoTitle || result.title, slug,
          type: "GUIDE",
          content: result.content,
          excerpt: item.seoDesc || result.excerpt,
          faqItems: result.faqItems,
          keywords: item.keywords || result.keywords,
          metaTitle: item.seoTitle || result.metaTitle,
          metaDesc: item.seoDesc || result.metaDesc,
          categoryId: category?.id,
          authorName: "AooBee 编辑部",
          readTime: result.readTime, wordCount: result.wordCount,
          published: true, publishedAt: new Date(),
        },
        update: { content: result.content, faqItems: result.faqItems },
      });
      console.log(`  ✅ 指南: ${result.title} → /guide/${slug}`);
      break;
    }

    // ---------- 推荐 ----------
    case "best": {
      const result = await generateBestList({
        keyword, category: categoryName || "通用",
        products: [
          { name: "ChatGPT", description: "OpenAI AI助手" },
          { name: "Claude", description: "Anthropic AI助手" },
          { name: "DeepSeek", description: "DeepSeek AI助手" },
          { name: "通义千问", description: "阿里巴巴 AI助手" },
          { name: "文心一言", description: "百度 AI助手" },
        ],
      });
      const slug = toSlug(item.seoTitle || result.title);

      if (skipExisting) {
        const existing = await db.article.findUnique({ where: { slug } });
        if (existing) { console.log(`  ⏭️  跳过（已存在）: ${result.title}`); return; }
      }

      if (dryRun) {
        console.log(`  🔍 [预览] 推荐: ${result.title}`);
        return;
      }

      await db.article.upsert({
        where: { slug },
        create: {
          title: item.seoTitle || result.title, slug,
          type: "BEST",
          content: result.content,
          excerpt: item.seoDesc || result.metaDesc,
          faqItems: result.faqItems,
          keywords: item.keywords || result.keywords,
          metaTitle: item.seoTitle || result.metaTitle,
          metaDesc: item.seoDesc || result.metaDesc,
          categoryId: category?.id,
          authorName: "AooBee 编辑部",
          readTime: 10, wordCount: 2000,
          published: true, publishedAt: new Date(),
        },
        update: { content: result.content, faqItems: result.faqItems },
      });
      console.log(`  ✅ 推荐: ${result.title} → /best/${slug}`);
      break;
    }

    // ---------- FAQ ----------
    case "faq": {
      const slug = toSlug(keyword + "-faq");

      if (skipExisting) {
        const existing = await db.article.findUnique({ where: { slug } });
        if (existing) { console.log(`  ⏭️  跳过（已存在）: ${keyword} FAQ`); return; }
      }

      const result = await generateFaq({ topic: keyword, count: 10 });

      if (dryRun) {
        console.log(`  🔍 [预览] FAQ: ${keyword} (${result.length}条)`);
        return;
      }

      await db.article.upsert({
        where: { slug },
        create: {
          title: item.seoTitle || `${keyword} 常见问题`, slug,
          type: "FAQ",
          content: result.map(f => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
          faqItems: result,
          keywords: item.keywords || [keyword],
          metaTitle: item.seoTitle || `${keyword} 常见问题`,
          metaDesc: item.seoDesc || `${keyword}相关的常见问题和解答`,
          categoryId: category?.id,
          authorName: "AooBee 编辑部",
          published: true, publishedAt: new Date(),
        },
        update: { content: result.map(f => `### ${f.question}\n\n${f.answer}`).join("\n\n"), faqItems: result },
      });
      console.log(`  ✅ FAQ: ${keyword} (${result.length}条) → /faq/${slug}`);
      break;
    }
  }
}

// ==================== 主流程 ====================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const skipExisting = args.includes("--skip-existing");
  const configFile = args.find(a => !a.startsWith("--")) || "scripts/batch-config.json";

  const configPath = path.resolve(configFile);
  if (!fs.existsSync(configPath)) {
    console.error(`❌ 配置文件不存在: ${configPath}`);
    console.log(`
用法:
  npx tsx scripts/batch-generate.ts                        # 使用默认 batch-config.json
  npx tsx scripts/batch-generate.ts my-keywords.json       # 使用自定义配置
  npx tsx scripts/batch-generate.ts --dry-run              # 预览模式
  npx tsx scripts/batch-generate.ts --skip-existing        # 跳过已存在内容
    `);
    return;
  }

  const items: BatchItem[] = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  console.log(`
╔═══════════════════════════════════════════════╗
║     AooBee 批量内容生成系统                    ║
╚═══════════════════════════════════════════════╝

📁 配置文件: ${configFile}
📊 待生成: ${items.length} 条
🤖 模型: ${process.env.LLM_PROVIDER} / ${process.env.LLM_MODEL || "默认"}
${dryRun ? "🔍 模式: 预览（不入库）" : "💾 模式: 生成+入库"}
${skipExisting ? "⏭️  跳过已存在的内容" : ""}
`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`\n[${i + 1}/${items.length}] ${item.type.toUpperCase()} - ${item.keyword}`);

    try {
      await processItem(item, dryRun, skipExisting);
      success++;
    } catch (error: any) {
      console.error(`  ❌ 失败: ${error.message}`);
      failed++;
    }

    // 避免 API 限流，每次请求间隔 2 秒
    if (i < items.length - 1) {
      await sleep(2000);
    }
  }

  console.log(`
╔═══════════════════════════════════════════════╗
║  批量生成完成                                   ║
║  ✅ 成功: ${success}                                ║
║  ❌ 失败: ${failed}                                 ║
║  ⏭️  跳过: ${skipped}                                 ║
╚═══════════════════════════════════════════════╝
  `);
}

main().catch(console.error).finally(async () => {
  await db.$disconnect();
  await pool.end();
});

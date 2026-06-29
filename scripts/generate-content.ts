/**
 * LLM 批量内容生成脚本（自动生成 + 自动入库）
 *
 * 用法:
 *   npx tsx scripts/generate-content.ts product <name> <category>
 *   npx tsx scripts/generate-content.ts compare <productA> <productB> [category]
 *   npx tsx scripts/generate-content.ts guide <category> <topic> [keywords]
 *   npx tsx scripts/generate-content.ts best <keyword> [category]
 *   npx tsx scripts/generate-content.ts faq <topic>
 *
 * 生成后自动保存到数据库，前端立即可见。
 */

import "dotenv/config";
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

// 自动查找或创建分类
async function findOrCreateCategory(nameOrSlug: string) {
  let cat = await db.category.findUnique({ where: { slug: nameOrSlug } });
  if (!cat) cat = await db.category.findFirst({ where: { name: nameOrSlug } });
  if (!cat) {
    const slug = nameOrSlug.toLowerCase().replace(/[^a-z0-9一-龥]+/g, "-").replace(/^-|-$/g, "");
    const maxSort = await db.category.aggregate({ _max: { sortOrder: true } });
    cat = await db.category.create({
      data: {
        name: nameOrSlug, slug, icon: "📦",
        description: `${nameOrSlug}行业的产品和服务`,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        published: true,
      },
    });
    console.log(`📁 自动创建分类: ${nameOrSlug} → /${slug}`);
  }
  return cat;
}

// 生成产品 slug
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9一-龥]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
LLM 批量内容生成脚本（自动生成 + 自动入库）

用法:
  npx tsx scripts/generate-content.ts product <name> <category>
  npx tsx scripts/generate-content.ts compare <productA> <productB> [category]
  npx tsx scripts/generate-content.ts guide <category> <topic> [keywords]
  npx tsx scripts/generate-content.ts best <keyword> [category]
  npx tsx scripts/generate-content.ts faq <topic>

示例:
  npx tsx scripts/generate-content.ts product "全屋定制" "装修"
  npx tsx scripts/generate-content.ts best "全屋定制" "装修"
  npx tsx scripts/generate-content.ts compare "支付宝" "微信支付" "金融科技"
    `);
    return;
  }

  console.log(`\n🚀 开始生成内容: ${command}\n`);
  console.log(`📡 使用模型: ${process.env.LLM_PROVIDER} / ${process.env.LLM_MODEL || "默认"}\n`);

  try {
    switch (command) {
      // ==================== 产品描述 ====================
      case "product": {
        const name = args[1];
        const categoryName = args[2];
        if (!name || !categoryName) {
          console.error("用法: generate-content.ts product <name> <category>");
          return;
        }

        console.log(`📦 生成产品内容: ${name} (${categoryName})`);
        const result = await generateProductContent({ name, category: categoryName });

        const category = await findOrCreateCategory(categoryName);
        const slug = toSlug(name);

        await db.product.upsert({
          where: { slug },
          create: {
            name, slug,
            description: result.description,
            longDesc: result.longDesc,
            categoryId: category.id,
            features: result.features,
            pros: result.pros,
            cons: result.cons,
            tags: result.tags,
            useCases: result.useCases,
            status: "ACTIVE",
            publishedAt: new Date(),
          },
          update: {
            description: result.description,
            longDesc: result.longDesc,
            features: result.features,
            pros: result.pros,
            cons: result.cons,
            tags: result.tags,
            useCases: result.useCases,
          },
        });

        // 保存 FAQ 文章
        if (result.faqItems?.length > 0) {
          await db.article.upsert({
            where: { slug: `${slug}-faq` },
            create: {
              title: `${name} 常见问题`, slug: `${slug}-faq`,
              type: "FAQ",
              content: result.faqItems.map(f => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
              faqItems: result.faqItems,
              keywords: result.keywords,
              metaTitle: result.metaTitle, metaDesc: result.metaDesc,
              categoryId: category.id,
              authorName: "AooBee 编辑部",
              published: true, publishedAt: new Date(),
            },
            update: {
              content: result.faqItems.map(f => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
              faqItems: result.faqItems,
            },
          });
        }

        console.log(`\n✅ 产品已保存: ${name}`);
        console.log(`🔗 前台地址: /${category.slug}/${slug}`);
        break;
      }

      // ==================== 产品对比 ====================
      case "compare": {
        const productA = args[1];
        const productB = args[2];
        const categoryName = args[3];
        if (!productA || !productB) {
          console.error("用法: generate-content.ts compare <productA> <productB> [category]");
          return;
        }

        console.log(`⚖️ 生成对比文章: ${productA} vs ${productB}`);
        const result = await generateComparison({ productA, productB, category: categoryName || "通用" });

        const slug = toSlug(result.title);
        const category = categoryName ? await findOrCreateCategory(categoryName) : null;

        await db.article.upsert({
          where: { slug },
          create: {
            title: result.title, slug,
            type: "COMPARISON",
            content: result.content,
            excerpt: result.metaDesc,
            faqItems: result.faqItems,
            keywords: result.keywords,
            metaTitle: result.metaTitle, metaDesc: result.metaDesc,
            categoryId: category?.id,
            authorName: "AooBee 编辑部",
            readTime: 10, wordCount: 2500,
            published: true, publishedAt: new Date(),
          },
          update: {
            content: result.content,
            faqItems: result.faqItems,
          },
        });

        console.log(`\n✅ 对比文章已保存: ${result.title}`);
        console.log(`🔗 前台地址: /compare/${slug}`);
        break;
      }

      // ==================== 行业指南 ====================
      case "guide": {
        const categoryName = args[1];
        const topic = args[2];
        const keywords = args[3]?.split(",").map(k => k.trim()).filter(Boolean) || [];
        if (!categoryName || !topic) {
          console.error("用法: generate-content.ts guide <category> <topic> [keywords]");
          return;
        }

        console.log(`📖 生成行业指南: ${topic} (${categoryName})`);
        const result = await generateGuide({ category: categoryName, topic, targetKeywords: keywords });

        const slug = toSlug(result.title);
        const category = await findOrCreateCategory(categoryName);

        await db.article.upsert({
          where: { slug },
          create: {
            title: result.title, slug,
            type: "GUIDE",
            content: result.content,
            excerpt: result.excerpt,
            faqItems: result.faqItems,
            keywords: result.keywords,
            metaTitle: result.metaTitle, metaDesc: result.metaDesc,
            categoryId: category.id,
            authorName: "AooBee 编辑部",
            readTime: result.readTime, wordCount: result.wordCount,
            published: true, publishedAt: new Date(),
          },
          update: {
            content: result.content,
            faqItems: result.faqItems,
          },
        });

        console.log(`\n✅ 行业指南已保存: ${result.title}`);
        console.log(`🔗 前台地址: /guide/${slug}`);
        break;
      }

      // ==================== 推荐榜单 ====================
      case "best": {
        const keyword = args[1];
        const categoryName = args[2];
        if (!keyword) {
          console.error("用法: generate-content.ts best <keyword> [category]");
          return;
        }

        console.log(`🏆 生成推荐榜单: ${keyword} (${categoryName || "通用"})`);
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

        const slug = toSlug(result.title);
        const category = categoryName ? await findOrCreateCategory(categoryName) : null;

        await db.article.upsert({
          where: { slug },
          create: {
            title: result.title, slug,
            type: "BEST",
            content: result.content,
            excerpt: result.metaDesc,
            faqItems: result.faqItems,
            keywords: result.keywords,
            metaTitle: result.metaTitle, metaDesc: result.metaDesc,
            categoryId: category?.id,
            authorName: "AooBee 编辑部",
            readTime: 10, wordCount: 2000,
            published: true, publishedAt: new Date(),
          },
          update: {
            content: result.content,
            faqItems: result.faqItems,
          },
        });

        console.log(`\n✅ 推荐榜单已保存: ${result.title}`);
        console.log(`🔗 前台地址: /best/${slug}`);
        break;
      }

      // ==================== FAQ ====================
      case "faq": {
        const topic = args[1];
        if (!topic) {
          console.error("用法: generate-content.ts faq <topic>");
          return;
        }

        console.log(`❓ 生成FAQ: ${topic}`);
        const result = await generateFaq({ topic, count: 10 });

        const slug = toSlug(topic + "-faq");

        await db.article.upsert({
          where: { slug },
          create: {
            title: `${topic} 常见问题`, slug,
            type: "FAQ",
            content: result.map(f => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
            faqItems: result,
            keywords: [topic],
            authorName: "AooBee 编辑部",
            published: true, publishedAt: new Date(),
          },
          update: {
            content: result.map(f => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
            faqItems: result,
          },
        });

        console.log(`\n✅ FAQ已保存: ${topic} (${result.length}条)`);
        console.log(`🔗 前台地址: /faq/${slug}`);
        break;
      }

      default:
        console.error(`未知命令: ${command}`);
    }
  } catch (error) {
    console.error("❌ 生成失败:", error);
  } finally {
    await db.$disconnect();
    await pool.end();
  }
}

main();

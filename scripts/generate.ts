// 本地 AI 内容生成 CLI
// 用法：npx tsx scripts/generate.ts <kind> <slug> [options]
// kinds: product | guide | best | compare | faq | review | reviews
// options:
//   --category <cat>   产品目录子目录 / 文章所属分类（默认 ai）
//   --name <name>      显示名（默认 slug）
//   --product <name>   review/reviews 的被点评产品（默认 slug）
//   --url <url>        product 官网
//   --company <c>      product 公司
//   --features a,b,c   product 已知功能
//   --keywords a,b,c   附加关键词（覆盖 LLM 生成）
//   --topic <t>        guide/faq 的标题/主题（默认 name）
// 需要环境变量（由 LLM_PROVIDER 决定，默认 openai）：OPENAI_API_KEY 等
// .env 会被自动加载（若存在）。

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import {
  generateProductContent,
  generateGuide,
  generateBestList,
  generateComparison,
  generateFaq,
  generateReviewArticle,
  generateReviewContent,
} from "../src/lib/llm/prompts";
import { buildTemplate, TYPE_DIR } from "./content-template";

dotenv.config();

type Kind = keyof typeof TYPE_DIR;

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const opts: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        opts[key] = next;
        i++;
      } else {
        opts[key] = "true";
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, opts };
}

function listToArray(v?: string): string[] | undefined {
  if (!v) return undefined;
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function writeFileSafe(file: string, content: string) {
  if (fs.existsSync(file)) {
    console.error(`⚠️ 已存在，跳过（如需覆盖请先删除）：${file}`);
    return false;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`✅ 已生成：${file}`);
  return true;
}

function yamlArray(arr?: string[]): string {
  if (!arr || arr.length === 0) return "[]";
  return `[${arr.map((x) => JSON.stringify(x)).join(", ")}]`;
}

async function main() {
  const { positional, opts } = parseArgs(process.argv.slice(2));
  const [kind, slug] = positional;

  if (!kind || !slug) {
    console.error(
      "用法：npx tsx scripts/generate.ts <kind> <slug> [options]\nkinds: " +
        Object.keys(TYPE_DIR).join(", ")
    );
    process.exit(1);
  }
  if (!(kind in TYPE_DIR)) {
    console.error(`未知类型 "${kind}"。可选：${Object.keys(TYPE_DIR).join(", ")}`);
    process.exit(1);
  }

  const category = opts.category || "ai";
  const name = opts.name || slug;

  try {
    switch (kind) {
      case "product": {
        const out = await generateProductContent({
          name,
          category,
          url: opts.url,
          company: opts.company,
          features: listToArray(opts.features),
        });
        const body = `---\n${[
          `slug: ${slug}`,
          `name: ${out.description ? name : name}`,
          `category: ${category}`,
          opts.url ? `url: ${opts.url}` : null,
          opts.company ? `company: ${opts.company}` : null,
          `pricing: ${out.tags?.includes("免费") ? "免费" : "付费"}`,
          `rating: 0`,
          `description: ${JSON.stringify(out.description)}`,
          `features: ${yamlArray(out.features.map((f) => f.name))}`,
          `pros: ${yamlArray(out.pros)}`,
          `cons: ${yamlArray(out.cons)}`,
          `useCases: ${yamlArray(out.useCases)}`,
          `published: true`,
        ]
          .filter(Boolean)
          .join("\n")}\n---\n\n${out.longDesc}\n`;
        const dir = path.join(process.cwd(), "content/products", category);
        writeFileSafe(path.join(dir, `${slug}.md`), body);
        break;
      }
      case "guide":
      case "best":
      case "compare":
      case "review": {
        const typeMap: Record<string, string> = {
          guide: "GUIDE",
          best: "BEST",
          compare: "COMPARISON",
          review: "REVIEW",
        };
        const topic = opts.topic || name;
        let out: {
          title?: string;
          content?: string;
          keywords?: string[];
          excerpt?: string;
          metaTitle?: string;
          metaDesc?: string;
          readTime?: number;
        };
        if (kind === "guide") {
          out = await generateGuide({ category, topic, targetKeywords: listToArray(opts.keywords) || [] });
        } else if (kind === "best") {
          out = await generateBestList({ keyword: topic, category, products: [] });
        } else if (kind === "compare") {
          // 简单格式：topic 形如 "A vs B"
          const [a, b] = topic.split(" vs ");
          out = await generateComparison({ productA: a?.trim() || topic, productB: b?.trim() || "", category });
        } else {
          out = await generateReviewArticle({ product: topic, category });
        }
        const front = [
          `title: ${JSON.stringify(out.title || topic)}`,
          `type: ${typeMap[kind]}`,
          `category: ${category}`,
          `keywords: ${yamlArray(out.keywords || listToArray(opts.keywords) || [])}`,
          `excerpt: ${JSON.stringify(out.excerpt || "")}`,
          `authorName: AooBee 编辑部`,
          `metaTitle: ${JSON.stringify(out.metaTitle || "")}`,
          `metaDesc: ${JSON.stringify(out.metaDesc || "")}`,
          `publishedAt: ${new Date().toISOString().slice(0, 10)}`,
          `updatedAt: ${new Date().toISOString().slice(0, 10)}`,
          `readTime: ${out.readTime || 5}`,
          `published: true`,
        ].join("\n");
        const body = `---\n${front}\n---\n\n# ${out.title || topic}\n\n${out.content || ""}\n`;
        writeFileSafe(path.join(process.cwd(), TYPE_DIR[kind as Kind], `${slug}.md`), body);
        break;
      }
      case "faq": {
        const topic = opts.topic || name;
        const items = await generateFaq({ topic, count: 10 });
        const front = [
          `title: ${JSON.stringify(topic)}`,
          `type: FAQ`,
          `category: ${category}`,
          `keywords: ${yamlArray(listToArray(opts.keywords) || [topic])}`,
          `excerpt: ${JSON.stringify(`关于${topic}的常见问题解答。`)}`,
          `authorName: AooBee 编辑部`,
          `publishedAt: ${new Date().toISOString().slice(0, 10)}`,
          `updatedAt: ${new Date().toISOString().slice(0, 10)}`,
          `readTime: 4`,
          `published: true`,
        ].join("\n");
        const body = `---\n${front}\n---\n\n# ${topic}\n\n${items
          .map((it) => `## ${it.question}\n\n${it.answer}`)
          .join("\n\n")}\n`;
        writeFileSafe(path.join(process.cwd(), TYPE_DIR.faq, `${slug}.md`), body);
        break;
      }
      case "reviews": {
        const product = opts.product || slug;
        const out = await generateReviewContent({ product, category });
        const front = [
          `title: ${JSON.stringify(out.title)}`,
          `product: ${product}`,
          `author: ${out.author || "AooBee 编辑部"}`,
          `rating: ${out.rating}`,
          `pros: ${yamlArray(out.pros)}`,
          `cons: ${yamlArray(out.cons)}`,
          `summary: ${JSON.stringify(out.summary)}`,
          `published: true`,
        ].join("\n");
        const body = `---\n${front}\n---\n\n${out.content}\n`;
        writeFileSafe(path.join(process.cwd(), TYPE_DIR.reviews, `${slug}.md`), body);
        break;
      }
      default:
        console.error(`暂不支持的类型：${kind}`);
        process.exit(1);
    }
  } catch (err) {
    console.error("❌ 生成失败：", (err as Error).message);
    console.error("请确认已配置对应 LLM 提供商的 API Key（如 OPENAI_API_KEY）。");
    process.exit(1);
  }
}

main();

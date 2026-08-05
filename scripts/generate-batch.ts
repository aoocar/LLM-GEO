// 批量本地 AI 内容生成
// 用法：npx tsx scripts/generate-batch.ts [--spec scripts/generate-batch.json] [--concurrency 3]
// spec 为 JSON 数组，每项与 generate.ts 的 <kind> <slug> [options] 对应：
// [
//   { "kind": "product", "slug": "notion", "name": "Notion", "category": "ai", "company": "Notion Labs", "url": "https://notion.so" },
//   { "kind": "guide", "slug": "how-to-choose-ai-writing-tool", "name": "如何选择 AI 写作工具", "category": "ai" },
//   { "kind": "reviews", "slug": "notion-honest-review", "product": "notion", "category": "ai" }
// ]
// 每个条目会调用 scripts/generate.ts 的同名逻辑（复用 prompts）。

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

interface SpecItem {
  kind: string;
  slug: string;
  name?: string;
  product?: string;
  category?: string;
  url?: string;
  company?: string;
  features?: string;
  keywords?: string;
  topic?: string;
}

function parseArgs(argv: string[]) {
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
    }
  }
  return opts;
}

async function runItem(item: SpecItem): Promise<{ ok: boolean; msg: string }> {
  const args: string[] = [path.join(__dirname, "generate.ts"), item.kind, item.slug];
  if (item.name) args.push("--name", item.name);
  if (item.product) args.push("--product", item.product);
  if (item.category) args.push("--category", item.category);
  if (item.url) args.push("--url", item.url);
  if (item.company) args.push("--company", item.company);
  if (item.features) args.push("--features", item.features);
  if (item.keywords) args.push("--keywords", item.keywords);
  if (item.topic) args.push("--topic", item.topic);

  try {
    const out = execFileSync(
      process.execPath,
      [path.join(__dirname, "..", "node_modules", "tsx", "dist", "cli.mjs"), ...args],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }
    );
    return { ok: true, msg: out.trim().split("\n").pop() || "done" };
  } catch (err: unknown) {
    const e = err as { stderr?: string; message?: string };
    return { ok: false, msg: (e.stderr || e.message || String(err)).trim().split("\n").slice(-3).join(" | ") };
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const specPath = opts.spec || path.join(__dirname, "generate-batch.json");
  const concurrency = Number(opts.concurrency) || 3;

  if (!fs.existsSync(specPath)) {
    console.error(`找不到 spec 文件：${specPath}`);
    console.error(`请创建 JSON 数组，参考 scripts/README 或 generate-batch.ts 顶部注释。`);
    process.exit(1);
  }

  const items: SpecItem[] = JSON.parse(fs.readFileSync(specPath, "utf-8"));
  console.log(`开始批量生成：${items.length} 项，并发 ${concurrency}`);

  let done = 0;
  let failed = 0;
  const queue = [...items];

  async function worker() {
    while (queue.length) {
      const item = queue.shift()!;
      const res = await runItem(item);
      if (res.ok) {
        done++;
        console.log(`  [OK]   ${item.kind}/${item.slug} — ${res.msg}`);
      } else {
        failed++;
        console.error(`  [FAIL] ${item.kind}/${item.slug} — ${res.msg}`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);

  console.log(`\n完成：成功 ${done}，失败 ${failed}，共 ${items.length}。`);
  if (failed > 0) process.exit(1);
}

main();

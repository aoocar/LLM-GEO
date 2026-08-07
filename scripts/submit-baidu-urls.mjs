#!/usr/bin/env node
/**
 * 百度普通收录 API 提交脚本
 *
 * 用法：
 *   BAIDU_TOKEN=xxx node scripts/submit-baidu-urls.mjs [--dry-run] [--limit=100]
 *
 * 说明：
 *   - 默认从线上 sitemap.xml 抓取全部 URL（与线上收录目标完全一致）；
 *     若线上抓取失败，回退到 public/llms.txt（构建产物）提取 URL。
 *   - 按百度普通收录 API 规范，将每行一个 URL 的文本 POST 到
 *     http://data.zz.baidu.com/urls?site=<site>&token=<token>
 *   - token 从环境变量 BAIDU_TOKEN 读取（CI 内由 aoobee-secrets 密钥仓库注入，
 *     绝不写进 git 仓库 / 构建日志）。
 *   - 幂等/容错：网络失败自动重试一次；百度侧配额不足时只记 remain 不报错；
 *     无 token 或无 URL 时以非零码退出，便于 CI 定位问题。
 *
 * 百度普通收录 API 响应示例：
 *   { "remain": 48, "success": 10, "not_same_site": [], "not_valid": [] }
 */
import fs from "node:fs";
import path from "node:path";

const SITE = process.env.BAIDU_SITE || "https://www.aoobee.com";
const API_URL = "http://data.zz.baidu.com/urls";
// 百度普通收录 API 每日配额：10 条/天。轮转提交时每天取 BATCH 条，避免超配额报错。
const DEFAULT_BATCH = 10;
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ROTATE = args.includes("--rotate"); // 每日轮转：按天偏移取 BATCH 条
const LIMIT = parseLimit(args);

function parseLimit(argv) {
  const hit = argv.find((a) => a.startsWith("--limit="));
  if (!hit) return null;
  const n = parseInt(hit.split("=")[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getToken() {
  const t = process.env.BAIDU_TOKEN;
  if (!t || !t.trim()) {
    throw new Error("未找到 BAIDU_TOKEN 环境变量（请确认 .cnb.yml 已从 aoobee-secrets 注入）");
  }
  return t.trim();
}

/** 抓取线上 sitemap.xml，解析全部 <loc> */
async function fetchSitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`sitemap HTTP ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  return [...new Set(urls)];
}

/** 回退方案：从构建产物 public/llms.txt 提取 URL */
function fetchLocalUrls() {
  const llms = path.join(process.cwd(), "public", "llms.txt");
  if (!fs.existsSync(llms)) throw new Error("public/llms.txt 不存在，无法回退枚举 URL");
  const text = fs.readFileSync(llms, "utf8");
  const urls = [...text.matchAll(/https:\/\/[^\s]+/g)].map((m) => m[0].trim().replace(/[),.;]+$/, ""));
  return [...new Set(urls.filter((u) => u.startsWith(`${SITE}/`) || u === SITE))];
}

async function submit(token, urls) {
  const body = urls.join("\n");
  const target = `${API_URL}?site=${encodeURIComponent(SITE)}&token=${encodeURIComponent(token)}`;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body,
        signal: AbortSignal.timeout(30000),
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`百度返回非 JSON（HTTP ${res.status}）: ${text.slice(0, 300)}`);
      }
      return json;
    } catch (e) {
      if (attempt === 2) throw e;
      console.warn(`第 ${attempt} 次提交失败：${e.message}，1.5s 后重试…`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function main() {
  const token = getToken();

  let urls;
  try {
    urls = await fetchSitemapUrls();
    console.log(`✅ 已从线上 sitemap.xml 抓取 ${urls.length} 个 URL`);
  } catch (e) {
    console.warn(`⚠️ 线上 sitemap 抓取失败（${e.message}），回退到 public/llms.txt`);
    urls = fetchLocalUrls();
    console.log(`✅ 已从 llms.txt 提取 ${urls.length} 个 URL`);
  }

  if (urls.length === 0) {
    throw new Error("未获取到任何 URL，中止提交");
  }

  // 去掉可能混入的验证文件等非内容页，仅保留内容页（可选，按需放开）
  const excluded = ["/baidu_verify_", "/ads.txt", "/llms.txt"];
  urls = urls.filter((u) => !excluded.some((x) => u.includes(x)));

  let batch = urls;
  if (ROTATE) {
    // 以“天序号”为轮转游标，保证每天推进 DEFAULT_BATCH 条、按序覆盖全站
    const day = Math.floor(Date.now() / 86400000);
    const start = (day * DEFAULT_BATCH) % urls.length;
    batch = [...urls.slice(start), ...urls.slice(0, start)].slice(0, DEFAULT_BATCH);
    console.log(`🔁 轮转模式：第 ${day} 天，取 ${DEFAULT_BATCH} 条（游标 ${start}/${urls.length}）`);
  } else if (LIMIT) {
    batch = urls.slice(0, LIMIT);
  }

  console.log(`🔢 本次待提交 ${batch.length} 个 URL（site=${SITE}）`);
  urls = batch;
  if (DRY_RUN) {
    console.log("🧪 dry-run 模式，不发起真实提交，前 10 条：");
    urls.slice(0, 10).forEach((u) => console.log(`   - ${u}`));
    console.log("🧪 dry-run 完成（未调用百度 API）");
    return;
  }

  const json = await submit(token, urls);
  console.log("📬 百度普通收录 API 响应：");
  console.log(JSON.stringify(json, null, 2));

  const success = Number(json.success ?? 0);
  const remain = Number(json.remain ?? 0);
  const notValid = json.not_valid?.length ?? 0;
  const notSameSite = json.not_same_site?.length ?? 0;

  console.log("");
  console.log(`📊 提交结果汇总：成功 ${success} / 失败 ${notValid + notSameSite} / 今日剩余配额 ${remain}`);

  // 全部失败视为异常
  if (urls.length > 0 && success === 0 && notValid === 0 && notSameSite === 0) {
    throw new Error("百度返回 0 成功且无失败明细，疑似 token 无效或配额用尽，请检查");
  }
}

main().catch((e) => {
  console.error("❌ 百度收录提交失败:", e.message);
  process.exit(1);
});

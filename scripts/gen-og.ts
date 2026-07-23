// 构建前生成静态 OG 图（真实 .png 文件）到 public/og/，避免 Next 静态导出
// 把 opengraph-image 产出成无扩展名的文件、被 CDN 当作 application/octet-stream 返回。
// 真实 .png 文件会被 Vercel 原生以 image/png 提供，X/Twitter 卡片可正常抓取。
import fs from "fs";
import path from "path";
import { buildOgImage } from "../src/components/og/og-image";
import { getCategories, getProducts, getArticles, getReviews } from "../src/lib/content";

type Job = { url: string; title: string; eyebrow?: string };

const jobs: Job[] = [];

// 首页（无 url，落到 /og/home.png）
jobs.push({ url: "", title: "AooBee", eyebrow: "全行业产品、工具与服务目录" });

// 分类页
for (const c of getCategories()) {
  jobs.push({ url: `/${c.slug}`, title: c.name, eyebrow: "AooBee · 行业分类" });
}

// 产品页
for (const p of getProducts()) {
  jobs.push({
    url: `/${p.category.slug}/${p.slug}`,
    title: p.name,
    eyebrow: `AooBee · ${p.category.name}`,
  });
}

// 文章页（按类型）
for (const a of getArticles()) {
  const title = a.metaTitle || a.title;
  if (a.type === "BEST") {
    jobs.push({ url: `/best/${a.slug}`, title, eyebrow: "AooBee · 最佳推荐" });
  } else if (a.type === "COMPARISON") {
    jobs.push({ url: `/compare/${a.slug}`, title, eyebrow: "AooBee · 对比" });
  } else if (a.type === "FAQ") {
    jobs.push({ url: `/faq/${a.slug}`, title, eyebrow: "AooBee · 常见问题" });
  } else if (["GUIDE", "HOW_TO", "LISTICLE"].includes(a.type)) {
    jobs.push({ url: `/guide/${a.slug}`, title, eyebrow: "AooBee · 行业指南" });
  } else if (a.type === "REVIEW") {
    jobs.push({ url: `/review/${a.slug}`, title, eyebrow: "AooBee · 产品评测" });
  }
}

// 点评页
for (const r of getReviews()) {
  jobs.push({ url: `/reviews/${r.slug}`, title: r.title, eyebrow: "AooBee · 产品点评" });
}

// 静态/列表页（与页面 generateMeta 传入的 url 一一对应）
const staticPages: Record<string, { title: string; eyebrow?: string }> = {
  "/best": { title: "最佳推荐", eyebrow: "AooBee · 最佳推荐" },
  "/compare": { title: "产品对比", eyebrow: "AooBee · 对比" },
  "/faq": { title: "常见问题", eyebrow: "AooBee · 常见问题" },
  "/guide": { title: "行业指南", eyebrow: "AooBee · 行业指南" },
  "/reviews": { title: "产品点评", eyebrow: "AooBee · 产品点评" },
  "/review": { title: "产品评测", eyebrow: "AooBee · 产品评测" },
  "/categories": { title: "全行业分类", eyebrow: "AooBee · 行业分类" },
  "/about": { title: "关于 AooBee", eyebrow: "全行业产品、工具与服务目录" },
  "/contact": { title: "联系我们", eyebrow: "全行业产品、工具与服务目录" },
  "/privacy": { title: "隐私政策" },
  "/terms": { title: "使用条款" },
  "/search": { title: "搜索 AooBee", eyebrow: "全行业产品、工具与服务目录" },
};
for (const [u, v] of Object.entries(staticPages)) {
  jobs.push({ url: u, title: v.title, eyebrow: v.eyebrow });
}

async function main() {
  const publicDir = path.join(process.cwd(), "public");
  let count = 0;
  for (const job of jobs) {
    const rel = job.url === "" ? "og/home.png" : `og${job.url}.png`;
    const outPath = path.join(publicDir, rel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const resp = await buildOgImage({ title: job.title, eyebrow: job.eyebrow });
    const buf = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(outPath, buf);
    count++;
  }
  console.log(`og images generated: ${count} -> public/og/`);
}

main();

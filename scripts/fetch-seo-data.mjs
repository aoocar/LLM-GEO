#!/usr/bin/env node
/**
 * 自动拉取 GSC + GA4 数据并生成 SEO 周报/日报
 * 用法：
 *   GOOGLE_SA_JSON='...' node scripts/fetch-seo-data.mjs
 *   GOOGLE_SA_FILE=/path/to/sa.json node scripts/fetch-seo-data.mjs [--weeks=2]
 *
 * 说明：
 *   - 通过 Google 服务账号 JWT 换取 OAuth token
 *   - GSC: searchanalytics.query 拉查询词/页面/点击/展示/CTR/位置
 *   - GA4: properties.runReport 拉活跃用户/会话/页面浏览量/来源/前20页面
 *   - 输出: docs/seo-reports/seo-YYYY-MM-DD.md
 *   - 数据不足时输出占位报告，不报错
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// ---------- 配置 ----------
const DAYS = 30; // GSC 拉取窗口
const WEEKS = 2; // GA4 拉取窗口（周）
// GSC 站点：使用 www 网址前缀属性（已由大强在 GSC 验证 HTML 标签并授权服务账号），
// 避免 sc-domain 域名属性把 base.aoobee.com 旧站噪音统计进来。
const GSC_SITE = process.env.GSC_SITE || "https://www.aoobee.com/";
const GA4_PROPERTY = process.env.GA4_PROPERTY || "properties/327364970"; // Aoobee_www业务
const REPO_DIR = process.cwd();

function loadSa() {
  if (process.env.GOOGLE_SA_JSON) return JSON.parse(process.env.GOOGLE_SA_JSON);
  if (process.env.GOOGLE_SA_FILE) return JSON.parse(fs.readFileSync(process.env.GOOGLE_SA_FILE, "utf8"));
  // 尝试读取常见位置（CI 内）
  for (const p of ["/tmp/sa.json", "./sa.json", "./service-account.json"]) {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  }
  throw new Error("未找到 Google 服务账号密钥：请设置 GOOGLE_SA_JSON 或 GOOGLE_SA_FILE");
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: [
      "https://www.googleapis.com/auth/webmasters.readonly",
      "https://www.googleapis.com/auth/analytics.readonly",
    ].join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const signingInput = `${b64(header)}.${b64(claim)}`;
  const sig = crypto.sign("RSA-SHA256", Buffer.from(signingInput), sa.private_key).toString("base64url");
  const jwt = `${signingInput}.${sig}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`OAuth 换发失败: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function gscQuery(at, body) {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${at}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GSC 查询失败 ${res.status}: ${JSON.stringify(json)}`);
  return json.rows || [];
}

async function ga4RunReport(at, body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY}:runReport`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${at}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GA4 查询失败 ${res.status}: ${JSON.stringify(json)}`);
  return json.rows || [];
}

function fmt(n) {
  return n == null ? "-" : Number(n).toLocaleString("zh-CN");
}

function pct(n) {
  return n == null ? "-" : `${(n * 100).toFixed(1)}%`;
}

function fmtYMD(d) {
  // GA4 API 要求 YYYY-MM-DD 具体日期，不支持 relativeDate 表达式
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function main() {
  const sa = loadSa();
  console.log(`✅ 服务账号: ${sa.client_email}`);
  const at = await getAccessToken(sa);
  console.log("✅ OAuth access_token 换发成功");

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - DAYS);
  const fmtDate = (d) => d.toISOString().slice(0, 10);

  const report = [];
  report.push(`# AooBee SEO 数据报告（${fmtDate(startDate)} ~ ${fmtDate(today)}）`);
  report.push("");
  report.push(`- 生成时间：${today.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`);
  report.push(`- 数据源：Google Search Console + Google Analytics 4`);
  report.push(`- GSC 站点：${GSC_SITE} | GA4 属性：${GA4_PROPERTY}`);
  report.push("");

  // ===== 1. GSC 总体概览 =====
  let gscSummary = null;
  try {
    const rows = await gscQuery(at, {
      startDate: fmtDate(startDate),
      endDate: fmtDate(today),
      dimensions: [],
      rowLimit: 1,
    });
    if (rows.length > 0) {
      const r = rows[0];
      gscSummary = {
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      };
    }
  } catch (e) {
    report.push(`> ⚠️ GSC 总体概览拉取失败：${e.message}`);
  }

  report.push("## 一、GSC 总体概览（近30天）");
  if (gscSummary) {
    report.push("");
    report.push("| 指标 | 数值 |");
    report.push("|---|---|");
    report.push(`| 点击 | ${fmt(gscSummary.clicks)} |`);
    report.push(`| 展示 | ${fmt(gscSummary.impressions)} |`);
    report.push(`| 平均 CTR | ${pct(gscSummary.ctr)} |`);
    report.push(`| 平均排名 | ${gscSummary.position?.toFixed(1) ?? "-"} |`);
  } else {
    report.push("");
    report.push("数据不足或尚未产生搜索数据（新站/刚接入属正常）。");
  }
  report.push("");

  // ===== 2. GSC 热门查询词 =====
  report.push("## 二、热门查询词 Top20");
  try {
    const rows = await gscQuery(at, {
      startDate: fmtDate(startDate),
      endDate: fmtDate(today),
      dimensions: ["query"],
      rowLimit: 20,
    });
    if (rows.length > 0) {
      report.push("");
      report.push("| # | 查询词 | 点击 | 展示 | CTR | 排名 |");
      report.push("|---|------|-----|------|-----|-----|");
      rows.forEach((r, i) => {
        report.push(`| ${i + 1} | ${r.keys[0]?.slice(0, 40) || "-"} | ${fmt(r.clicks)} | ${fmt(r.impressions)} | ${pct(r.ctr)} | ${r.position?.toFixed(1) ?? "-"} |`);
      });
    } else {
      report.push("");
      report.push("暂无查询词数据。");
    }
  } catch (e) {
    report.push(`> ⚠️ 查询词拉取失败：${e.message}`);
  }
  report.push("");

  // ===== 3. GSC 热门页面 =====
  report.push("## 三、热门页面 Top20");
  try {
    const rows = await gscQuery(at, {
      startDate: fmtDate(startDate),
      endDate: fmtDate(today),
      dimensions: ["page"],
      rowLimit: 20,
    });
    if (rows.length > 0) {
      report.push("");
      report.push("| # | 页面 | 点击 | 展示 | CTR | 排名 |");
      report.push("|---|-----|-----|------|-----|-----|");
      rows.forEach((r, i) => {
        report.push(`| ${i + 1} | ${r.keys[0]?.replace("https://www.aoobee.com", "") || "-"} | ${fmt(r.clicks)} | ${fmt(r.impressions)} | ${pct(r.ctr)} | ${r.position?.toFixed(1) ?? "-"} |`);
      });
    } else {
      report.push("");
      report.push("暂无页面数据。");
    }
  } catch (e) {
    report.push(`> ⚠️ 页面拉取失败：${e.message}`);
  }
  report.push("");

  // ===== 4. GSC 收录状态（sitemap）=====
  report.push("## 四、GSC 收录状态（Sitemap）");
  try {
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/sitemaps`, {
      headers: { Authorization: `Bearer ${at}` },
    });
    const json = await res.json();
    const sitemaps = json.sitemap || [];
    if (sitemaps.length > 0) {
      report.push("");
      report.push("| Sitemap | 已提交 | 已收录 | 状态 |");
      report.push("|---------|--------|--------|------|");
      for (const s of sitemaps) {
        report.push(`| ${s.path} | ${fmt(s.contents?.submitted)} | ${fmt(s.contents?.indexed)} | ${s.isPending ? "待处理" : s.errors ? `错误 ${s.errors}` : "正常"} |`);
      }
    } else {
      report.push("");
      report.push("未找到已提交的 Sitemap。");
    }
  } catch (e) {
    report.push(`> ⚠️ Sitemap 拉取失败：${e.message}`);
  }
  report.push("");

  // ===== 5. GA4 概览 =====
  report.push("## 五、GA4 流量概览（近两周）");
  try {
    const gaStart = new Date(today);
    gaStart.setDate(gaStart.getDate() - WEEKS * 7);
    const rows = await ga4RunReport(at, {
      dateRanges: [{ startDate: fmtYMD(gaStart), endDate: fmtYMD(today) }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "userEngagementDuration" },
      ],
    });
    if (rows.length > 0) {
      const m = rows[0].metricValues;
      const dur = m[4]?.value ? parseFloat(m[4].value) : 0;
      const users = m[0]?.value ? parseFloat(m[0].value) : 0;
      const avgDur = users > 0 ? dur / users : 0;
      report.push("");
      report.push("| 指标 | 数值 |");
      report.push("|---|---|");
      report.push(`| 活跃用户 | ${fmt(m[0]?.value)} |`);
      report.push(`| 会话数 | ${fmt(m[1]?.value)} |`);
      report.push(`| 页面浏览量 | ${fmt(m[2]?.value)} |`);
      report.push(`| 互动率 | ${m[3]?.value ? pct(parseFloat(m[3].value)) : "-"} |`);
      report.push(`| 平均互动时长 | ${avgDur > 0 ? `${avgDur.toFixed(0)}s` : "-"} |`);
    } else {
      report.push("");
      report.push("暂无 GA4 数据（刚接入属正常）。");
    }
  } catch (e) {
    report.push(`> ⚠️ GA4 概览拉取失败：${e.message}`);
  }
  report.push("");

  // ===== 6. GA4 来源 Top10 =====
  report.push("## 六、流量来源 Top10");
  try {
    const gaStart = new Date(today);
    gaStart.setDate(gaStart.getDate() - WEEKS * 7);
    const rows = await ga4RunReport(at, {
      dateRanges: [{ startDate: fmtYMD(gaStart), endDate: fmtYMD(today) }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      limit: 10,
    });
    if (rows.length > 0) {
      report.push("");
      report.push("| 来源渠道 | 会话数 |");
      report.push("|---------|--------|");
      for (const r of rows) {
        report.push(`| ${r.dimensionValues?.[0]?.value || "-"} | ${fmt(r.metricValues?.[0]?.value)} |`);
      }
    } else {
      report.push("");
      report.push("暂无来源数据。");
    }
  } catch (e) {
    report.push(`> ⚠️ 来源拉取失败：${e.message}`);
  }
  report.push("");

  // ===== 7. GA4 热门页面 =====
  report.push("## 七、热门页面 Top20（GA4）");
  try {
    const gaStart = new Date(today);
    gaStart.setDate(gaStart.getDate() - WEEKS * 7);
    const rows = await ga4RunReport(at, {
      dateRanges: [{ startDate: fmtYMD(gaStart), endDate: fmtYMD(today) }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      limit: 20,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    });
    if (rows.length > 0) {
      report.push("");
      report.push("| # | 页面 | 浏览量 |");
      report.push("|---|-----|--------|");
      rows.forEach((r, i) => {
        report.push(`| ${i + 1} | ${r.dimensionValues?.[0]?.value?.slice(0, 50) || "-"} | ${fmt(r.metricValues?.[0]?.value)} |`);
      });
    } else {
      report.push("");
      report.push("暂无页面数据。");
    }
  } catch (e) {
    report.push(`> ⚠️ 页面拉取失败：${e.message}`);
  }
  report.push("");

  // ===== 8. 优化建议（数据不足时给通用建议）=====
  report.push("## 八、诊断与建议");
  const hasData = gscSummary && gscSummary.impressions > 0;
  if (!hasData) {
    report.push("");
    report.push("**当前数据量偏少（新站/刚接入 GSC-GA4 属正常）**，建议：");
    report.push("");
    report.push("1. 继续按内容路线图扩充长尾内容（榜单/对比/指南/FAQ），等待 Google 收录爬取");
    report.push("2. 关注 sitemap 是否被正常抓取，必要时在 GSC 手动提交关键新页面");
    report.push("3. 保持 AI 爬虫友好（llms.txt / robots.txt / 结构化数据），持续积累 GEO 可见度");
    report.push("4. 数据积累 2~4 周后，本报告将自动出现查询词/页面排名，届时可做定向优化");
  } else {
    report.push("");
    report.push("> 基于本期数据的定向建议将由 CodeBuddy 在评论区给出，并据此安排下一批内容/修复。");
  }
  report.push("");

  // 写文件
  const dateStr = fmtDate(today).replace(/-/g, "");
  const outDir = path.join(REPO_DIR, "docs", "seo-reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `seo-${dateStr}.md`);
  fs.writeFileSync(outFile, report.join("\n"), "utf8");
  console.log(`✅ 报告已生成: ${outFile}`);
  console.log(report.slice(0, 40).join("\n"));
  return outFile;
}

main().catch((e) => {
  console.error("❌ 拉数失败:", e.message);
  process.exit(1);
});

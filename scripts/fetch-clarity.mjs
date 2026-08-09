#!/usr/bin/env node
/**
 * 自动拉取 Microsoft Clarity 流量数据并生成日报
 *
 * 用法：
 *   CLARITY_TOKEN=xxx node scripts/fetch-clarity.mjs [--days=3]
 *
 * 说明：
 *   - token 从环境变量 CLARITY_TOKEN 读取（CI 内由 .cnb.yml 从 aoobee-secrets
 *     密钥仓库读取注入，绝不写进 git 仓库 / 构建日志）。
 *   - 使用 Clarity Data Export API（官方唯一数据拉取通道）：
 *     GET https://www.clarity.ms/export-data/api/v1/project-live-insights
 *   - 配额：每项目每日最多 10 次请求；数据仅限最近 1~3 天；
 *     单请求最多 3 个维度；响应最多 1000 行。
 *     本脚本每日 2 次调用，远低于配额上限。
 *   - 输出：docs/seo-reports/clarity-YYYY-MM-DD.md（与 seo-*.md 并存）。
 *   - 纯 Node 内置模块（fetch/fs/path），无第三方依赖。
 */
import fs from "node:fs";
import path from "node:path";

// ---------- 配置 ----------
const API_URL = "https://www.clarity.ms/export-data/api/v1/project-live-insights";
const REPO_DIR = process.cwd();

function getToken() {
  const t = process.env.CLARITY_TOKEN;
  if (!t || !t.trim()) {
    throw new Error(
      "未找到 CLARITY_TOKEN 环境变量（请确认 .cnb.yml 已从 aoobee-secrets 的 aoobee-seo-bot 注入）"
    );
  }
  return t.trim();
}

/** 调用 Clarity Data Export API，返回原始 JSON 数组 */
async function callApi(token, params) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${API_URL}?${qs.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Clarity API 返回非 JSON（HTTP ${res.status}）: ${text.slice(0, 300)}`);
  }
  if (!res.ok) {
    const msg = Array.isArray(json) ? JSON.stringify(json).slice(0, 300) : text.slice(0, 300);
    throw new Error(`Clarity API 请求失败（HTTP ${res.status}）: ${msg}`);
  }
  return json;
}

/** 把 [{metricName, information:[...]}] 转成 Map: metricName -> information */
function indexMetrics(rows) {
  const map = new Map();
  for (const row of rows || []) {
    if (row && row.metricName) map.set(row.metricName, row.information || []);
  }
  return map;
}

/** 取 information 中第一个对象的字段值（聚合类指标如 Traffic/ScrollDepth 等） */
function firstScalar(list, field) {
  if (!list || list.length === 0) return null;
  const v = list[0][field];
  return v === undefined || v === null ? null : v;
}

function fmt(n) {
  if (n == null) return "-";
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString("zh-CN") : "-";
}

function pct(n) {
  if (n == null) return "-";
  return `${(Number(n)).toFixed(1)}%`;
}

function ymd(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function main() {
  const token = getToken();
  const args = process.argv.slice(2);
  const daysHit = args.find((a) => a.startsWith("--days="));
  const DAYS = daysHit ? parseInt(daysHit.split("=")[1], 10) : 3;
  if (![1, 2, 3].includes(DAYS)) {
    throw new Error(`--days 仅支持 1/2/3（Clarity API 限制最近 1~3 天），收到: ${DAYS}`);
  }

  const now = Date.now();
  const start = now - DAYS * 24 * 3600 * 1000;
  const base = {
    startTime: String(start),
    endTime: String(now),
    granularity: "daily",
    limit: "200",
    offset: "0",
  };

  console.log(`✅ Clarity token 已读取，长度=${token.length}（仅提示，不回显内容）`);
  console.log(`📅 拉取窗口：${ymd(start)} ~ ${ymd(now)}（近 ${DAYS} 天）`);

  // 调用①：真人/爬虫 + 行为质量指标
  const call1Params = {
    ...base,
    metrics: "Traffic,ScrollDepth,EngagementTime,DeadClickCount,QuickbackClick,ExcessiveScroll,RageClickCount,ScriptErrorCount,ErrorClickCount",
  };
  // 调用②：热门页面 + 页面标题 + 用户画像
  const call2Params = {
    ...base,
    metrics: "PopularPages,PageTitle,ReferrerUrl,Browser,Device,OS,Country",
  };

  console.log("🔁 调用① 拉取流量/行为指标…");
  const r1 = await callApi(token, call1Params);
  console.log("🔁 调用② 拉取热门页面/画像指标…");
  const r2 = await callApi(token, call2Params);

  const m1 = indexMetrics(r1);
  const m2 = indexMetrics(r2);
  const merged = new Map([...m1, ...m2]); // 指标名不重叠，合并为一个 Map

  // ===== 解析关键指标 =====
  const traffic = firstScalar(merged.get("Traffic"), "totalSessionCount");
  const bot = firstScalar(merged.get("Traffic"), "totalBotSessionCount");
  const users = firstScalar(merged.get("Traffic"), "distinctUserCount");
  const pps = firstScalar(merged.get("Traffic"), "pagesPerSessionPercentage");
  const scroll = firstScalar(merged.get("ScrollDepth"), "averageScrollDepth");
  const totalTime = firstScalar(merged.get("EngagementTime"), "totalTime");
  const activeTime = firstScalar(merged.get("EngagementTime"), "activeTime");

  const report = [];
  report.push(`# AooBee Clarity 流量数据报告（${ymd(start)} ~ ${ymd(now)}）`);
  report.push("");
  report.push(`- 生成时间：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`);
  report.push("- 数据源：Microsoft Clarity（Data Export API）");
  report.push(`- 拉取窗口：近 ${DAYS} 天（Clarity API 限制最近 1~3 天）`);
  report.push("");
  report.push(`> 备注：Clarity 项目 ID = lx18ztcr4b；API 配额 10 次/日，本脚本每日 2 次。`);
  report.push("");

  // ===== 一、真人 vs 爬虫 =====
  report.push("## 一、真人 vs 爬虫");
  report.push("");
  if (traffic != null) {
    const real = Number(traffic);
    const botN = Number(bot ?? 0);
    const botPct = real + botN > 0 ? (botN / (real + botN)) * 100 : 0;
    report.push("| 指标 | 数值 |");
    report.push("|---|---|");
    report.push(`| 真人会话（非 Bot） | ${fmt(traffic)} |`);
    report.push(`| 机器人会话（Bot） | ${fmt(bot)} |`);
    report.push(`| 机器人占比 | ${pct(botPct)} |`);
    report.push(`| 去重用户 | ${fmt(users)} |`);
    report.push(`| 每会话页数 | ${pps != null ? Number(pps).toFixed(2) : "-"} |`);
    if (botPct > 50) {
      report.push("");
      report.push(`> ⚠️ 机器人占比超过 50%，本期流量以爬虫为主。`);
    }
  } else {
    report.push("暂无数据（新项目或近 3 天无流量属正常）。");
  }
  report.push("");

  // ===== 二、行为质量 =====
  report.push("## 二、行为质量");
  report.push("");
  report.push("| 指标 | 数值 |");
  report.push("|---|---|");
  report.push(`| 平均滚动深度 | ${scroll != null ? `${Number(scroll).toFixed(1)}%` : "-"} |`);
  report.push(`| 总互动时间 | ${totalTime != null ? `${fmt(totalTime)}s` : "-"} |`);
  report.push(`| 活跃互动时间 | ${activeTime != null ? `${fmt(activeTime)}s` : "-"} |`);
  const signalRows = [
    ["无效点击（DeadClick）", "DeadClickCount", "sessionsWithMetricPercentage"],
    ["快速返回（Quickback）", "QuickbackClick", "sessionsWithMetricPercentage"],
    ["过度滚动（ExcessiveScroll）", "ExcessiveScroll", "sessionsWithMetricPercentage"],
    ["愤怒点击（RageClick）", "RageClickCount", "sessionsWithMetricPercentage"],
    ["脚本错误（ScriptError）", "ScriptErrorCount", "sessionsWithMetricPercentage"],
    ["错误点击（ErrorClick）", "ErrorClickCount", "sessionsWithMetricPercentage"],
  ];
  for (const [label, key, field] of signalRows) {
    const row = merged.get(key);
    report.push(`| ${label} | ${row && row[0] ? pct(row[0][field]) : "-"} |`);
  }
  report.push("");

  // ===== 三、用户画像 =====
  report.push("## 三、用户画像");
  const dimRows = [
    ["浏览器", "Browser"],
    ["设备", "Device"],
    ["系统", "OS"],
    ["地域", "Country"],
  ];
  for (const [label, key] of dimRows) {
    const list = merged.get(key) || [];
    report.push("");
    report.push(`### ${label} Top`);
    if (list.length > 0) {
      report.push("");
      report.push("| 维度值 | 会话数 |");
      report.push("|--------|--------|");
      list.slice(0, 10).forEach((r) => {
        report.push(`| ${r.name ?? "-"} | ${fmt(r.sessionsCount ?? r.count ?? 0)} |`);
      });
    } else {
      report.push("");
      report.push("暂无数据。");
    }
  }
  report.push("");

  // ===== 四、热门页面 + 404 检测 =====
  report.push("## 四、热门页面 Top20");
  const pages = merged.get("PopularPages") || [];
  if (pages.length > 0) {
    report.push("");
    report.push("| # | 页面 URL | 访问量 |");
    report.push("|---|---------|--------|");
    pages.slice(0, 20).forEach((r, i) => {
      const url = r.url ?? "-";
      report.push(`| ${i + 1} | ${url} | ${fmt(r.visitsCount ?? r.count ?? 0)} |`);
    });
  } else {
    report.push("");
    report.push("暂无页面数据。");
  }
  report.push("");

  // ===== 五、404 / 异常页面检测 =====
  report.push("## 五、404 / 异常页面检测");
  report.push("");
  const suspicious = [];
  const titles = merged.get("PageTitle") || [];
  const notFoundTitles = titles.filter((r) => /分类未找到|页面未找到|404|not found/i.test(r.name ?? ""));
  for (const t of notFoundTitles) {
    suspicious.push(`页面标题「${t.name}」出现 ${t.sessionsCount ?? 0} 次会话`);
  }
  // 数字垃圾 URL 形态（旧站残留 /345.html、/356.html、/40/ 等）
  for (const r of pages) {
    const url = r.url ?? "";
    const clean = url.replace(/^https?:\/\/[^/]+/, "");
    if (/^\/(\d+)(\.html)?\/?$/.test(clean)) {
      suspicious.push(`数字垃圾 URL ${url} 出现 ${r.visitsCount ?? 0} 次访问`);
    }
  }
  if (suspicious.length > 0) {
    report.push("⚠️ 发现以下异常页面（站外死链 / 旧站残留 / 爬虫探测）：");
    report.push("");
    suspicious.forEach((s) => report.push(`- ${s}`));
    report.push("");
    report.push("> 这些 URL 通常不在 sitemap 内、站内零引用，当前 404 + noindex 行为正确，Google 不会收录；如持续增多可考虑在 next.config.ts 加数字路径 301 回首页规则。");
  } else {
    report.push("未检测到「分类未找到」/数字垃圾 URL 等异常页面，状态正常 ✅");
  }
  report.push("");

  // ===== 六、页面标题 Top =====
  report.push("## 六、页面标题 Top10");
  report.push("");
  if (titles.length > 0) {
    report.push("| # | 页面标题 | 会话数 |");
    report.push("|---|---------|--------|");
    titles.slice(0, 10).forEach((r, i) => {
      report.push(`| ${i + 1} | ${(r.name ?? "-").slice(0, 60)} | ${fmt(r.sessionsCount ?? 0)} |`);
    });
  } else {
    report.push("暂无数据。");
  }
  report.push("");

  // ===== 七、诊断与建议 =====
  report.push("## 七、诊断与建议");
  report.push("");
  const realN = traffic != null ? Number(traffic) : 0;
  if (realN === 0) {
    report.push("近 3 天暂无真人会话（新站起步期正常）。建议持续发布内容并等待收录，Clarity 会在有真实访问后自动累积数据。");
  } else if (suspicious.length > 0) {
    report.push(`本期真人会话 ${realN}，但检测到 ${suspicious.length} 处异常页面访问，建议关注外部死链来源。`);
  } else {
    report.push(`本期真人会话 ${realN}，无异常页面，行为数据正常。持续关注热门页面与滚动深度变化即可。`);
  }
  report.push("");

  // 写文件
  const dateStr = ymd(now).replace(/-/g, "");
  const outDir = path.join(REPO_DIR, "docs", "seo-reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `clarity-${dateStr}.md`);
  fs.writeFileSync(outFile, report.join("\n"), "utf8");
  console.log(`✅ 报告已生成: ${outFile}`);
  console.log(report.slice(0, 30).join("\n"));
  return outFile;
}

main().catch((e) => {
  console.error("❌ Clarity 拉数失败:", e.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * 自动刷新 BEST 榜单时效字段（updatedAt → 当天）
 *
 * 用途：
 *   由 .cnb.yml 的每周定时任务（crontab）自动执行，让 8 个行业 BEST 榜单
 *   的 updatedAt 保持"近一周内更新"，从而：
 *   - Article schema 的 dateModified 刷新 → 触发 Google 重新抓取/重算时效信号
 *   - sitemap.xml 的 lastModified 刷新 → 提示搜索引擎"内容有更新"
 *   - 页面可展示"更新于"时间，增强读者信任
 *
 * 幂等性：
 *   仅当榜单的 updatedAt 不是当天日期时才改写；已是最新则跳过，git 无 diff。
 *
 * 用法：
 *   node scripts/refresh-ranking-timeliness.mjs
 *   node scripts/refresh-ranking-timeliness.mjs --dry-run   # 只打印不落盘
 */
import fs from "node:fs";
import path from "node:path";

const BEST_DIR = path.join(process.cwd(), "content", "articles", "best");
const DRY_RUN = process.argv.includes("--dry-run");

// 构建机默认 UTC，换算 Asia/Shanghai 日期（UTC+8）
function todayShanghai() {
  const now = new Date();
  const sh = new Date(now.getTime() + 8 * 3600 * 1000);
  return sh.toISOString().slice(0, 10);
}

/**
 * 刷新单个 best 榜单文件：
 * - 已有 updatedAt → 更新为今天
 * - 无 updatedAt 且有 publishedAt → 在其后插入 updatedAt
 * - 其它情况不动
 * 返回 true 表示内容有变化。
 */
function refreshFile(file, today) {
  const raw = fs.readFileSync(file, "utf8");
  if (!raw.startsWith("---")) return false;
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return false;
  const fm = raw.slice(0, end + 4); // 包含结尾 --- 与换行
  const body = raw.slice(end + 4);
  let newFm;
  if (/^updatedAt:/m.test(fm)) {
    newFm = fm.replace(/^updatedAt:.*$/m, `updatedAt: ${today}`);
  } else if (/^publishedAt:/m.test(fm)) {
    newFm = fm.replace(/^(publishedAt:.*)$/m, `$1\nupdatedAt: ${today}`);
  } else {
    return false;
  }
  if (newFm === fm) return false;
  if (!DRY_RUN) fs.writeFileSync(file, newFm + body);
  return true;
}

if (!fs.existsSync(BEST_DIR)) {
  console.error(`未找到榜单目录: ${BEST_DIR}`);
  process.exit(1);
}

const today = todayShanghai();
const files = fs
  .readdirSync(BEST_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

let changed = 0;
for (const f of files) {
  const ok = refreshFile(path.join(BEST_DIR, f), today);
  if (ok) {
    console.log(`${DRY_RUN ? "[dry-run] " : ""}已刷新: ${f} → updatedAt=${today}`);
    changed++;
  }
}
console.log(`扫描 ${files.length} 个榜单文件，${DRY_RUN ? "模拟刷新" : "刷新"} ${changed} 个（日期 ${today}）`);
if (DRY_RUN) {
  console.log("dry-run 模式：未写入任何文件");
}

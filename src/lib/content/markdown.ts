// 简易 Markdown -> HTML（复用原 guide/[slug] 实现，供 loader 与页面共用）
//
// 2026-08-05 渲染器升级：兼容微信公众号导入文章的中文扁平结构。
// - 「一、二、三、」中文序号（短行）→ <h2> 小标题
// - 「第X步」「①②③」及数字序号（1. 2、）→ <ol><li>，保留原文编号（start）
// - 长正文行 / 行内序号（「第一步，打开…」）→ 保留 <p>
// - 兼容老文章的 ## / ** / - / 图片 / 链接 / 代码
// - 纯叙事散文（无结构）保持段落

// 中文序号：一、 二、 三、……（小标题 / 标题式段落）
const CN_SEQ = /^([一二三四五六七八九十]{1,3})、(.+)$/;
// 数字序号：1. 2、 3．
const NUM_SEQ = /^(\d{1,2})[.、．](.+)$/;
// 第X步 / 第1步 / 步骤一 / 步骤1
const STEP_SEQ = /^第[一二三四五六七八九十\d]{1,3}步(.*)$|^步骤[一二三四五六七八九十\d]{1,3}[:：、.]?(.*)$/;
// ①②③④⑤⑥⑦⑧⑨⑩
const CIRCLE_SEQ = /^([①②③④⑤⑥⑦⑧⑨⑩])(.*)$/;
// 行内步骤（「第一步，打开…」→ 段落）
const INLINE_STEP = /^第[一二三四五六七八九十\d]{1,3}步[，,:：]/;

const SHORT_TITLE_MAX = 26; // 中文序号 rest 超过此长度 → 视为标题式段落而非 h2

const CN_TO_NUM: Record<string, number> = {
  一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
};

/** 「一二」→ 12、「二十一」→ 21、「五」→ 5 */
function cnToNum(s: string): number {
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  if (s.length === 1) return CN_TO_NUM[s] || 0;
  if (s.length === 2) {
    if (s.startsWith("十")) return 10 + (CN_TO_NUM[s[1]] || 0);
    if (s.endsWith("十")) return (CN_TO_NUM[s[0]] || 0) * 10;
  }
  if (s.length === 3) return (CN_TO_NUM[s[0]] || 0) * 10 + (CN_TO_NUM[s[2]] || 0);
  return 0;
}

const CIRCLE_TO_NUM: Record<string, number> = {
  "①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5,
  "⑥": 6, "⑦": 7, "⑧": 8, "⑨": 9, "⑩": 10,
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

type ListState = { type: "ol" | "ul"; items: string[]; start: number } | null;

export function markdownToHtml(md: string): string {
  // 1) 块级语法：标题 / 引用 / 分隔线
  const html = md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^---+\s*$/gm, "<hr />");

  const lines = html.split("\n");
  const out: string[] = [];
  let list: ListState = null;
  let prevIsShort = false; // 上一行为「非序号短行」（用于合并被硬换行的列表项）

  const flushList = () => {
    if (list) {
      if (list.type === "ol") {
        out.push(
          `<ol${list.start > 1 ? ` start="${list.start}"` : ""}>` +
            list.items.map((li) => `<li>${li}</li>`).join("") +
            "</ol>"
        );
      } else {
        out.push(`<ul>` + list.items.map((li) => `<li>${li}</li>`).join("") + `</ul>`);
      }
      list = null;
    }
  };

  // 预处理：把每行分类为「有效内容行」（非空 / 非块级 HTML），
  // 数字序号行属于连续编号段的条件 = 隔空行后仍是数字序号，且编号连续递增
  const numSeqFlags: boolean[] = lines.map((raw, i) => {
    const line = raw.trim();
    if (!NUM_SEQ.test(line)) return false;
    // 往前找最近的非空行（跨空行）
    let prevIdx = i - 1;
    while (prevIdx >= 0 && lines[prevIdx].trim() === "") prevIdx--;
    const prevLine = prevIdx >= 0 ? lines[prevIdx].trim() : "";
    const prevNum = prevLine.match(NUM_SEQ);
    // 往后找最近的非空行
    let nextIdx = i + 1;
    while (nextIdx < lines.length && lines[nextIdx].trim() === "") nextIdx++;
    const nextLine = nextIdx < lines.length ? lines[nextIdx].trim() : "";
    const nextNum = nextLine.match(NUM_SEQ);
    // 编号连续（前后相差 1）才合并为同一列表
    const m = NUM_SEQ.exec(line);
    const num = m ? parseInt(m[1], 10) : 0;
    const prevOk = !!(prevNum && parseInt(prevNum[1], 10) === num - 1);
    const nextOk = !!(nextNum && parseInt(nextNum[1], 10) === num + 1);
    return prevOk || nextOk;
  });

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      // 空行：保留列表（跨空行合并 ①②③ / 连续编号），仅重置短行合并标记
      prevIsShort = false;
      continue;
    }

    // 已生成的块级 HTML（标题 / 引用 / 分隔线 / 图片）
    if (/^<(h1|h2|h3|blockquote|hr|img)/.test(line)) {
      flushList();
      out.push(line);
      prevIsShort = false;
      continue;
    }

    // 无序列表（兼容老文章 - 语法，连续合并为一个 <ul>）
    const ulMatch = line.match(/^[-*] (.+)$/);
    if (ulMatch) {
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [], start: 1 };
      }
      list.items.push(renderInline(escapeHtml(ulMatch[1])));
      prevIsShort = false;
      continue;
    }

    // 中文序号（一、二、三、……）
    const cnMatch = line.match(CN_SEQ);
    if (cnMatch) {
      const rest = cnMatch[2].trim();
      flushList();
      if (rest.length <= SHORT_TITLE_MAX) {
        // 短行 → h2 小标题
        out.push(`<h2>${renderInline(escapeHtml(line))}</h2>`);
      } else {
        // 长行（如「一、地址在哪？…」）→ 标题式段落
        out.push(`<p>${renderInline(escapeHtml(line))}</p>`);
      }
      prevIsShort = false;
      continue;
    }

    // 第X步 / 第1步 / 步骤一
    const stepMatch = line.match(STEP_SEQ);
    if (stepMatch) {
      const rawNum = (stepMatch[1] || stepMatch[2] || "").trim();
      const rest = rawNum.replace(/^[一二三四五六七八九十\d]{1,3}/, "").replace(/^[:：、.．]/, "").trim();
      const numText = rawNum.match(/^[一二三四五六七八九十\d]{1,3}/)?.[0] || "";
      const num = numText ? (/^\d+$/.test(numText) ? parseInt(numText, 10) : cnToNum(numText)) : 0;
      if (INLINE_STEP.test(line) && rest.length > SHORT_TITLE_MAX) {
        // 「第一步，打开…」行内步骤长行 → 段落
        flushList();
        out.push(`<p>${renderInline(escapeHtml(line))}</p>`);
      } else {
        if (!list || list.type !== "ol") {
          flushList();
          list = { type: "ol", items: [], start: num || 1 };
        }
        list.items.push(renderInline(escapeHtml(rest)));
      }
      prevIsShort = false;
      continue;
    }

    // ①②③……（编号步骤）
    const circleMatch = line.match(CIRCLE_SEQ);
    if (circleMatch) {
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [], start: CIRCLE_TO_NUM[circleMatch[1]] || 1 };
      }
      list.items.push(renderInline(escapeHtml(circleMatch[2].trim())));
      prevIsShort = false;
      continue;
    }

    // 数字序号（1. / 1、 / 1．）
    const numMatch = line.match(NUM_SEQ);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      const rest = numMatch[2].trim();
      // 连续编号段（体检 10 项这类 rest 长的列表）或短列表项 → ol
      if (numSeqFlags[i] || rest.length <= SHORT_TITLE_MAX) {
        if (!list || list.type !== "ol") {
          flushList();
          list = { type: "ol", items: [], start: num };
        }
        list.items.push(renderInline(escapeHtml(rest)));
      } else {
        // 孤立长行 → 段落
        flushList();
        out.push(`<p>${renderInline(escapeHtml(line))}</p>`);
      }
      prevIsShort = false;
      continue;
    }

    // 普通段落
    const isShort = line.length <= SHORT_TITLE_MAX && !INLINE_STEP.test(line);
    if (list && prevIsShort && isShort) {
      // 紧邻上一个短列表项且被硬换行 → 合并为同一 li（扁平结构优化）
      list.items[list.items.length - 1] += " " + renderInline(escapeHtml(line));
    } else {
      flushList();
      out.push(`<p>${renderInline(escapeHtml(line))}</p>`);
    }
    prevIsShort = isShort;
  }
  flushList();

  // 2) 清理空段落
  return out.join("").replace(/<p>\s*<\/p>/g, "");
}

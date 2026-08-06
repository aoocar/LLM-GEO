<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:aoobee-ai-ops -->
# AooBee 网站 AI 运营手册（供 AI 会话自动读取）

本文件是 AooBee（www.aoobee.com，Next.js 16 + React 19 内容目录站，GEO/SEO 核心）的**运营约定总纲**。任何 AI 会话接手本仓库的内容运营、修改、构建任务前，必须先读并遵守本文件，以及下方引用的子文档（若存在）。

## 0. 最高优先级纪律（覆盖一切文件改动）

**三步法工作纪律**：任何牵扯到修改 / 生成 / 删除文件的动作之前，必须严格走三步：
1. **提出方案**给用户；
2. **等用户看完方案**；
3. **等用户明确确认**后才执行。

在步骤 2、3 完成前，AI 不得创建 / 编辑 / 移动 / 删除任何文件，也不得提前写配置、跑会落盘的脚本。适用范围 = 一切文件改动（含代码 / 文档 / 配置 / 记忆文件）。

衍生规则（同样最高优先级）：
- **不要替用户虚构紧迫感或不可变性**：不得编"不修就出事 / 丢数据 / 手滑就炸"来催决策；不得把用户定的设计说成"宪法级 / 不可变更"。修复顺序、是否紧急，一律以用户判定为准。
- **不要自作主张做额外适配**：严格按用户命令执行；命令模糊或歧义时，先停下确认"我理解的任务是否与你的意图一致"，得到确认后再动手。匹配性 / 适配性调整只在用户明确发起"自行检测"时才做。
- **先判断、后动手**：当用户问"能不能 / 怎么装 / 是否可行"这类评估型问题时，先给结论与判断即可，不要主动创建 / 修改文件，除非用户明确说"帮我做 / 生成 / 补齐"。

## 1. 内容约定（目录 ↔ URL ↔ frontmatter）

### 1.1 内容类型与落盘位置

| 页面 URL | 文件位置 | frontmatter 必含 `type` |
|---|---|---|
| 榜单 `/best/<slug>` | `content/articles/best/<slug>.md` | `BEST` |
| 对比 `/compare/<slug>` | `content/articles/compare/<slug>.md` | `COMPARISON` |
| 编辑评测 `/review/<slug>` | `content/articles/review/<slug>.md` | `REVIEW` |
| 指南 `/guide/<slug>` | `content/articles/guide/<slug>.md` | `GUIDE` |
| 问答 `/faq/<slug>` | `content/articles/faq/<slug>.md` | `FAQ` |
| 用户点评 `/reviews/<slug>` | `content/reviews/<slug>.md` | **无 type 字段** |
| 产品页 `/<category>/<slug>` | `content/products/<category>/<slug>.md` | **无 type 字段** |
| 分类总览 `/categories/` | `content/categories/<slug>.md` 汇总 | — |

⚠️ **关键区别**：`content/reviews/`（用户点评，独立目录）与 `content/articles/review/`（编辑评测文章）是**两套完全不同的内容**，frontmatter 格式不同，绝不可混放。点评必须进 `content/reviews/`。

### 1.2 分类（共 8 个，slug 固定）
`zhuangxiu`(装修) / `jiadian`(家电) / `yuer`(育儿) / `weixiu`(维修) / `bangong`(办公) / `yanglao`(养老) / `jiaoyu`(教育) / `ai`(AI)。文章与产品的 `category` 字段必须取这 8 个之一。

### 1.3 三类 frontmatter 模板

**文章类**（best / compare / review / guide / faq 通用，仅换 `type`）：
```yaml
---
title: 标题
type: BEST            # 按 1.1 表换 BEST|COMPARISON|REVIEW|GUIDE|FAQ
category: ai          # 8 选 1
keywords: [关键词1, 关键词2]
excerpt: 一句话摘要（卡片展示用）
description: SEO 描述，≤160 字
authorName: AooBee 编辑部
publishedAt: 2026-07-31
faqItems:
  - question: 常见问题？
    answer: 回答。
related:
  - /compare/chatgpt-vs-claude
  - /ai/chatgpt
---
# 正文标题
正文用 Markdown 书写……
```

**用户点评类**（`content/reviews/`，字段不同）：
```yaml
---
title: ChatGPT 真实使用点评
product: chatgpt      # 必须 = 对应产品文件的 slug
author: AooBee 编辑部
rating: 4.7
pros: [优点1, 优点2]
cons: [缺点1, 缺点2]
summary: 一句话总评
description: SEO 描述
related:
  - /review/chatgpt-review
  - /best/ai-writing-tools-2026
  - /ai/chatgpt
---
正文……
```

**产品类**（`content/products/<category>/`）：
```yaml
---
name: ChatGPT
description: 一句话介绍
category: ai
url: https://chat.openai.com
company: OpenAI
pricing: 免费 / Plus $20
rating: 4.8
tags: [AI, 聊天机器人]
features:
  - name: 多轮对话
    description: 基于上下文的连续对话
pros: [生态成熟, 插件丰富]
cons: [需联网, 免费版有限额]
useCases: [写作辅助, 编程]
faqItems:
  - question: ChatGPT 收费吗？
    answer: 有免费版，Plus $20/月。
alternatives: [claude]   # 可选；不填则自动取同分类评分 Top5
---
正文……（纯段落，不要写 # 标题 / **加粗** 等 Markdown 符号；问答只写进 faqItems）
```

> ⚠️ **产品页正文编写规矩**：产品页正文（`---` 以下部分）被解析为 `longDesc`，按空行切成**纯文本段落**渲染，**不解析 Markdown**——`#`/`##`/`**`/列表等会原样显示为文字。因此：① 正文只写纯段落，不要写 `# 标题`、`## 小标题` 等标记；② 所有问答**只写进 `faqItems`**，绝不要写进正文（否则会重复显示且带丑陋的 `##` 符号）。`faqItems` 由 FaqSection 渲染并自动生成 FAQPage 结构化数据。

**分类类**（`content/categories/<slug>.md`）：
```yaml
---
slug: ai
name: AI 工具
description: 分类一句话介绍
icon: 🤖
order: 8
published: true
---
```

### 1.4 `related` 内链字段（核心机制）
- `related` 是文章 / 点评的数组字段，元素是**路径字符串**或 `{ href, title }` 对象。
- 仅接受以下路径，写错**不会报错但被静默过滤**（等于白写，页面不显示"相关阅读"）：
  - 文章段：`/best/x`、`/compare/x`、`/review/x`、`/guide/x`、`/faq/x`
  - 点评：`/reviews/x`
  - 产品：`/<category>/x`（如 `/ai/chatgpt`）
- 解析由 `src/lib/content/related.ts` 的 `resolveRelated` 完成；解析失败自动过滤，**不产生死链**。
- 产品页的"相关阅读"按分类自动聚合本类文章，无需手写 `related`。

### 1.5 slug 与命名
- slug 用 kebab-case 英文（出现在 URL 中）；中文写在 `title` 即可。
- 文件名即 slug（不含 `.md`）。

### 1.6 联系方式与二维码约定（2026-08-06 大强授权，全站统一）
凡用户要求"添加联系方式"的文章/页面，**统一直接填入以下内容，无需再向用户确认**：
- 联系电话：`15532661565`　|　微信号：`aoo697`　|　邮箱：`aoobee@sina.com`
- 二维码图片：**复用仓库内 `public/huomaAIfens.png`**（53 篇 guide 文章一直在用的那张，勿改用 Issue 中上传的新码）
- 文末固定格式：
```
**联系我们**
联系电话：15532661565　|　微信号：aoo697　|　邮箱：aoobee@sina.com

![扫码加入 AooBee 微信交流群](/huomaAIfens.png)
```

## 2. 本地预览与发布流程

1. 把 `.md` 放到对应目录（见 1.1）。
2. 本地预览：`npm run dev` → 打开 `http://localhost:3000/<类型>/<slug>`，重点检查底部"相关阅读"是否渲染。
3. 提交：`git add content/...` + `git commit -m "新增/修改 xx 内容"`。
4. **push 由 AI 直接完成**（commit 后顺手 push，偶发失败再回退手动；见 3）。
5. 线上验证：访问 URL 看是否 200、OG 分享图是否正常、sitemap 是否收录。

## 3. Git 分工

- **AI 可直接 push。** 2026-08-01 实测：本沙箱已具备可用凭据机制（HTTPS + credential helper 缓存 token），`git push origin main` 可正常执行（已成功推送 `0375399..e391117`），无需用户手动推送。commit 后顺手 push 即可，省用户一步。
- **若 push 偶发失败**（如凭据过期 / 沙箱网络受限），再回退到由用户在自己的终端跑；命令用 `;` 分隔、不用 `&&`。
- **PowerShell 不支持 `&&`**：给用户的命令要用 `;` 或分两行写，不要给 `&&` 串联。
- 不要替用户编造"不 push 就出事"的紧迫感。

## 4. GEO / SEO 约定（构建期自动，勿手改）

- **结构化数据**：FAQPage / Review / Rating / Article schema 已自动注入，是 AI 问答直接引用格式——写内容时把 FAQ 写进 `faqItems`、把评分写进点评 `rating`，即自动获得。
- **llms.txt**：全站 AI 爬虫地图，构建期自动生成（当前 66 条，格式为 `- 分类 X: url`）。
- **sitemap.xml / robots.txt**：自动生成；robots 已 Allow GPTBot / Claude / Perplexity / Google-Extended。
- **OG 图**：`opengraph-image.tsx` 原生约定，运行时以 `image/png` 提供，不手动生成 `.png`、不写 `public/og/`。中文字体 `assets/fonts/NotoSansSC.ttf` 须进仓库（Vercel=Linux 无系统中文字体）。
- 内容偏薄是已知短板（每页 300–1000 中文字，产品页较达标）；扩写内容时优先补 `best/compare/review` 到 800–1500 字、FAQ 增到 5–8 条。

## 5. 扩量到何级别需升级管理

当前 ~66 节点，全部构建时读入内存缓存，到几千文件都无压力。阶段：
- **A 当前（0–~300）**：Markdown + Obsidian + git，加 `content/_templates/` 模板库。
- **B 增长期（~300–1000）**：加 pre-commit / CI 校验（必填字段、related 路径存在、slug 唯一、分类合法）；可按分类拆 git 子仓库。
- **C 多编辑期（~1000–3000）**：上轻量 CMS（Decap / Strapi，输出 markdown），保留 markdown 为源。
- **D 规模化（3000+ 或多角色 / 关系查询）**：迁 Prisma + Postgres。注意 `src/lib/content/types.ts` 顶部已预留"对齐原 Prisma 模型字段，便于最小改动迁移"——**架构已预留**，届时 `llms.txt` / `sitemap` 改为从库生成。

原则：尽量长久保留"Markdown 即源"（git 版本化、AI 友好、零成本）；只有出现"多人并发编辑"或"复杂关系查询"才上数据库。

## 6. 给 AI 的接手清单（每次会话开头）

1. 读 `AGENTS.md`（本文件）与 `CLAUDE.md`（若存在）。
2. 改内容前，先用 `git status` 核对当前分支与工作区状态（跨轮次不要假设已提交 / 已 push）。
3. 任何文件改动先给方案 → 等确认。
4. 内容类改动用 `npm run dev` 预览即可；只有改代码 / 配置才需 `npm run build`。
5. 完成后 commit 并直接 push（新约定：本沙箱可推）；若 push 失败再提醒用户手动。

> 人工可看的全套运营教程（手动增改 / Obsidian 管理 / 扩量升级）见 `docs/运营手册/` 系列文档（如尚未生成，可要求 AI 补齐）。
<!-- END:aoobee-ai-ops -->

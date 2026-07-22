# AooBee Markdown 化重构方案（定稿 · 执行中）

> **目标**：把内容源从「Postgres 数据库」切换为「本地 Markdown 文件」，用 Obsidian 管理内容；
> Next.js 静态导出（SSG）成纯静态站，本地 `next build` 校验后再手动批量 push；
> 托管走「自有服务器 nginx + Cloudflare 前置」。**本阶段只做本地跑通。**
>
> **状态**：已与用户对齐定稿，进入落地执行阶段（先第 0 步备份，再按清单落地）。
> **变更量提示**：本方案改动较大（取数层整体替换 + 移除 Prisma/Postgres/admin），因此第 0 步「先备份」是强制前置。

---

## 第 0 步：先备份现有项目（已执行）

本次改动替换取数层、移除数据库依赖，属大改。落地前已打标签固化当前状态：

```bash
cd /d/project/www.aoobee.com
git add -A && git commit -m "backup: pre-md-refactor snapshot"
git tag pre-md-refactor
```

- 回退方式：`git checkout pre-md-refactor` 或 `git tag -d pre-md-refactor` 后删改文件。
- 原数据库代码（prisma/、src/lib/db）移入 `legacy/`，便于对照字段映射和随时回退，不立即删除。

---

## 一、总原则

1. **内容即文件**：`content/` 下的 `.md` 是唯一真相源，Prisma/Postgres 从数据流中移除。
2. **零内容迁移成本**：md 与渲染层解耦，将来换 Astro/Hugo 或加 ISR 都只换「渲染层」，md 一行不动。
3. **纯静态导出**：`output: 'export'` → 产出 `out/` 静态目录，无服务器、无数据库、无动态接口。
4. **最小改动跑通**：优先复用现有组件与样式，只替换「取数层」（db 查询 → md loader）。
5. **本地校验优先**：本地 build + 预览确认无误，再攒批量手动 push。
6. **AI 生成本地化**：AI 生成做成「本地 CLI 脚本」，输出直接落盘为 `.md`（不再走 web admin + 数据库）。
7. **内容类型四类**：categories / products / articles / reviews。**Review 是内容（人工/AI 生成的点评），不是用户交互**，因此保留。

---

## 二、目标架构（重构后）

```
本地(高配):  AI脚本生成md → Obsidian管理 → next build(本地校验) → 攒批量
     │  手动 git push（md 源 + 渲染代码）
     ▼
GitHub(版本 + 备份)
     │  ssh 拉取到自有服务器  (或你手动 scp out/)
     ▼
自有服务器: nginx 伺服 out/ 静态文件
     │
     ▼
Cloudflare(缓存/DDoS/全球加速) → 搜索引擎 & AI 爬虫
```

**移除项**：Postgres、Prisma、Docker 数据库、web 版 admin 后台、`/api/save`、`/api/admin/*`。
**保留/新增**：md loader、本地 authoring 脚本、静态 `out/`、Review 作为内容类型。

---

## 三、content/ 目录结构

```text
content/
├─ categories/
│  ├─ ai.md                      # 分类：人工智能（slug=ai）
│  └─ dev.md
├─ products/
│  ├─ ai/                        # 按分类 slug 分子目录（便于 Obsidian 归档）
│  │  ├─ chatgpt.md              # 产品 slug=chatgpt
│  │  └─ claude.md
│  └─ dev/
│     └─ github-copilot.md
├─ articles/
│  ├─ guide/                     # GUIDE/HOW_TO/LISTICLE → 路由 /guide/<slug>
│  │  └─ how-to-choose-ai-writing-tool.md
│  ├─ best/                      # BEST → /best/<slug>
│  │  └─ best-ai-writing-tools-2026.md
│  ├─ compare/                   # COMPARISON → /compare/<slug>
│  │  └─ chatgpt-vs-claude.md
│  ├─ faq/                       # FAQ → 路由 /faq/<slug>
│  └─ review/                    # REVIEW（评测长文）→ 路由 /review/<slug>
└─ reviews/                      # 原 Review 模型：人工/AI 生成的产品点评内容（非交互，是内容）
   └─ chatgpt-honest-review.md   # → 路由 /reviews/<slug>，frontmatter 含 product 关联
```

**约定**
- 文件名（去掉 `.md`）即 `slug`，全站唯一（产品/文章/review 各自唯一即可）。
- 产品所属分类：默认取「所在子目录名」映射到分类 slug；frontmatter 的 `category` 可覆盖。
- 文章/点评类型：默认取「所在子目录名」映射；frontmatter 的 `type` 可覆盖。

| 子目录 | 类型 | 路由前缀 |
|---|---|---|
| `guide/` | GUIDE / HOW_TO / LISTICLE | `/guide/<slug>` |
| `best/` | BEST | `/best/<slug>` |
| `compare/` | COMPARISON | `/compare/<slug>` |
| `faq/` | FAQ | `/faq/<slug>` |
| `review/`（在 articles 下） | REVIEW（评测长文） | `/review/<slug>` |
| `reviews/`（顶层） | 原 Review 模型（产品点评） | `/reviews/<slug>` |

> **Review 保留为内容类型（关键修正）**：Review 不是用户交互产生的「用户评价」，而是**人工/AI 生成的点评内容**，因此保留。映射为 `content/reviews/<slug>.md`，路由 `/reviews/<slug>`；每篇通过 frontmatter `product` 关联到某产品，产品页可列出关联点评。静态站本就无「实时用户评价交互区块」，无需处理。

---

## 四、frontmatter 字段规范

### 4.1 分类 `content/categories/<slug>.md`
```markdown
---
name: 人工智能
slug: ai            # 可省略，默认取文件名
description: AI 工具、模型与平台的综合目录
icon: 🤖            # 可选，分类图标
order: 1            # 可选，首页/导航排序
---
（可选：分类长描述正文，渲染在分类页顶部）
```

### 4.2 产品 `content/products/<category>/<slug>.md`
```markdown
---
name: ChatGPT
category: ai                 # 映射到 content/categories/ai.md
url: https://chat.openai.com
company: OpenAI
pricing: 免费 / Plus $20
rating: 4.8
tags: [AI, 聊天机器人]
features:                    # 数组，每项 {name, description}
  - name: 多轮对话
    description: 上下文记忆
pros: [生态成熟, 插件丰富]
cons: [需联网, 有封号风险]
useCases: [写作辅助, 编程]
faqItems:                    # 数组，{question, answer} → 同时生成 FAQ JSON-LD
  - question: 收费吗？
    answer: 有免费版，Plus 订阅 $20/月
published: true              # 默认 true；false 则不进入构建
---
# ChatGPT

一句话简介……

## 详细介绍
长文正文（Markdown，支持标题/列表/表格/代码）。

## 常见问题
### 收费吗？
有免费版……
```

### 4.3 文章 `content/articles/<type>/<slug>.md`
```markdown
---
title: 如何选择 AI 写作工具
type: GUIDE                  # GUIDE / BEST / COMPARISON / FAQ / HOW_TO / LISTICLE / REVIEW
category: ai                 # 可选关联分类
keywords: [AI写作, 工具选型]
excerpt: 选型要点一篇讲清。
published: true
---
正文 Markdown……
```

### 4.4 产品点评（Review）`content/reviews/<slug>.md`
```markdown
---
title: ChatGPT 真实使用点评
product: chatgpt             # 关联 products/ 下的 slug
author: 编辑部               # 可选，人工/AI 生成的内容署名
rating: 4.6
pros: [上下文强, 多模态]
cons: [偶发幻觉]
summary: 一句话总评
published: true
---
正文 Markdown（点评内容，非用户交互）……
```

> 字段映射来源：直接对应现有 `prisma/schema.prisma` 中 `Category / Product / Article / Review` 的字段，
> 保证从 DB 迁移到 md 时字段不丢。

---

## 五、md loader 设计（`src/lib/content/`）

新建目录，替代 `src/lib/db/index.ts` 的取数职责：

```
src/lib/content/
├─ types.ts        # Category / Product / Article / Review 类型（与现有页面 props 兼容）
├─ loader.ts       # 核心：用 fs + gray-matter 读 content/，返回结构化对象
└─ index.ts        # 对外导出各类 getXxx 函数
```

**关键实现点**
- 依赖：`gray-matter`（解析 frontmatter）+ `fs/promises`（读盘）。
- 缓存：模块级 `Map` 缓存解析结果，单次构建内不重复读盘。
- 与页面兼容：返回结构尽量对齐原 `db` 返回值（如 `features` 保持数组、`tags` 保持数组），使页面组件改动最小化。
- 辅助函数：
  - `getCategories()` → 首页/导航
  - `getProductsByCategory(slug)` → 分类页
  - `getProduct(category, slug)` → 产品详情页
  - `getArticlesByType(type)` / `getArticle(type, slug)` → 文章页
  - `getReviews()` / `getReviewsByProduct(slug)` → 点评页 / 产品页关联点评
  - `getAllContentForSitemap()` → sitemap/llms.txt
  - `markdownToHtml(body)` → 复用现有 `guide/[slug]/page.tsx` 里已有的转换函数

---

## 六、页面改造清单

| 文件 | 改造内容 |
|---|---|
| `src/app/page.tsx`（首页） | `db.xxx` → `loader.getCategories()/getProducts()`；统计数字改为从 loader 实时算（去掉硬编码） |
| `src/app/(directory)/[category]/page.tsx` | 改读 loader；加 `generateStaticParams` 列出所有分类 slug |
| `src/app/(directory)/[category]/[slug]/page.tsx` | 改读 `loader.getProduct()`；关联展示 `getReviewsByProduct()`；加 `generateStaticParams` |
| `src/app/(content)/guide/[slug]/page.tsx`（及 best/compare/faq/review） | 改读 `loader.getArticle()`；加 `generateStaticParams` |
| `src/app/(content)/reviews/[slug]/page.tsx`（新增） | 读取 `loader.getReview()`；加 `generateStaticParams` |
| `src/app/sitemap.ts` | 从 `loader.getAllContentForSitemap()` 生成（不再查库） |
| `src/app/llms.txt/route.ts` | 从 loader 生成清单（静态导出下改为静态文件输出） |
| `src/app/robots.ts` | 基本不变（仍是静态输出），仅确认 host 用 `NEXT_PUBLIC_SITE_URL` |
| `src/lib/seo/schema.ts` | JSON-LD 构造保持不变，数据源从 loader 取 |

> 现有 `guide/[slug]/page.tsx` 里已有 `markdownToHtml`，loader 直接复用，不重复造轮子。

---

## 七、静态导出配置

`next.config.ts` 增加：
```ts
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },   // 静态导出不支持 next/image 优化，需关掉或用外链
};
```
- 构建产物输出到 `out/`（默认）。
- 移除非静态兼容项：去掉 `revalidate`/ISR（纯静态无运行时）、`cookies()`、`headers()` 等运行时 API。
- `public/` 下静态资源（含补一张 `logo.svg/png`）原样拷进 `out/`。

---

## 八、移除运行时依赖（与静态导出冲突的部分）

| 项 | 处理 |
|---|---|
| `src/lib/db/index.ts` + Prisma | 移入 `legacy/`，不再被页面 import |
| `prisma/` 目录 | 保留但不再参与构建；可日后删除 |
| `src/app/api/save/route.ts` | 删除（写库逻辑改用本地脚本写 md） |
| `src/app/api/admin/*` | 删除（web admin 在静态站无法运行，整体去除） |
| `src/app/admin/page.tsx` | 删除 |
| `src/middleware.ts` | 删除（无服务端路由需要保护） |
| `docker-compose.yml` | 保留备用，但本方案不依赖 |
| **Review 模型** | **保留为内容类型 `content/reviews/`，不删除** |

---

## 九、AI 生成改落盘（本地 CLI 脚本）

把原 `/api/generate` 的逻辑抽成**本地脚本**，在本地生成 md：

```
scripts/
├─ generate.ts          # 调 LLM 生成（复用 src/lib/llm/），按 frontmatter 规范写 .md
├─ generate-batch.ts    # 批量：读一份 csv/json 任务清单，循环生成
└─ content-template.ts  # 生成文件的 frontmatter 模板
```

用法示例：
```bash
# 单条生成产品
npx tsx scripts/generate.ts product --category ai --name ChatGPT
# 批量
npx tsx scripts/generate-batch.ts tasks.json
```
生成的 `.md` 直接落进 `content/products/<category>/`，Obsidian 实时可见，你再人工润色 → 本地 build 校验 → 批量 push。

> LLM provider 切换逻辑（`LLM_PROVIDER` 环境变量）原样保留在 `src/lib/llm/`，脚本直接复用。

---

## 十、本地构建验证流程（跑通标准）

```bash
# 1. 安装新增依赖
npm i gray-matter

# 2. 准备样例内容（先放 3-5 篇 md 到 content/ 验证链路）
#    可直接手写在 Obsidian 里，或用 scripts/generate.ts 生成

# 3. 本地构建（全量静态导出）
npm run build          # 产出 out/

# 4. 本地预览
npx serve out/         # 或 npx http-server out/

# 5. 验证清单
#    - 首页 / 分类页 / 产品页 / 文章页 / 点评页 均正常渲染
#    - /sitemap.xml 含真实 md 内容
#    - /llms.txt 生成
#    - 浏览器无控制台报错（尤其 next/image unoptimized）
```

跑通 = 本阶段目标达成。之后才进入「托管到自有服务器」阶段。

---

## 十一、后续托管（方案 2：自有服务器 nginx + Cloudflare，本阶段不做）

本地跑通后，推送流程：
1. `git push` md 源 + 渲染代码到 GitHub（手动批量）；
2. 自有服务器 `git pull` → `npm run build` → `cp -r out/ /var/www/aoobee/`；
   或本地 build 完直接 `scp -r out/ 服务器:/var/www/aoobee/`；
3. 服务器 nginx 指向 `/var/www/aoobee`，Cloudflare 前置做缓存/DDoS/HTTPS。

（此步等你确认本地跑通后再细化，本方案不含其代码。）

---

## 十二、改动量评估

- **新增**：`src/lib/content/`（~3 文件）、`scripts/`（~3 文件）、`content/`（你的 md 资产）、本方案文档、`src/app/(content)/reviews/[slug]/page.tsx`。
- **修改**：首页、分类页、产品页、文章页（best/guide/compare/faq/review）、新增点评页、sitemap、llms.txt、next.config —— 均为「替换取数调用」，**组件结构基本不动**。
- **删除/弃用**：Prisma、db、api/save、api/admin、admin 页面、middleware、docker-compose 依赖。（Review 保留为内容类型，不删除。）
- **回退保障**：第 0 步备份 tag `pre-md-refactor` + 旧代码移入 `legacy/`，可一键还原。

> 结论：逻辑改动集中在「取数层一处替换」，页面是机械性替换调用，风险可控；
> 但涉及文件较多，已严格按第 0 步先备份。

---

## 确认结论（已与用户对齐）

1. ✅ **Review 保留为内容类型**：不是用户交互的「用户评价」，而是人工/AI 生成的点评内容，映射为 `content/reviews/<slug>.md`（路由 `/reviews/<slug>`），产品页可关联展示。
2. ✅ **faq / review 不简化**：均为内容生成的一部分，正常保留 `/faq/<slug>` 与 `/review/<slug>`。
3. ✅ **admin 整体去除**：web 后台无存在必要，AI 生成改为本地 CLI 脚本（`scripts/`）。
4. ✅ **执行顺序**：先第 0 步备份（git tag `pre-md-refactor`），再按清单落地代码。

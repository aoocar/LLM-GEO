# AooBee 全行业产品与服务目录

> 面向 GEO/SEO 优化的全行业产品与服务结构化目录站。内容源为 Markdown 文件，构建为**纯静态站点**，**无数据库、无服务端运行时**。

## 架构

- **Next.js 16（App Router）+ React 19**，通过 `output: 'export'` 导出纯静态 HTML 到 `out/`
- 内容源：`content/` 下的 Markdown 文件（推荐用 Obsidian 维护，作为唯一真相源）
- **无数据库、无 Supabase、无运行时 API** —— 部署即静态文件托管
- 页面内置结构化数据（JSON-LD：`Article` / `FAQPage` / `BreadcrumbList` / `CollectionPage` 等），便于 AI 爬虫与搜索引擎直接引用

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- gray-matter（Markdown frontmatter 解析）
- openai（可选，仅本地 `npm run gen` 生成内容时使用）

## 目录结构

```
content/
  categories/          分类定义（slug / name / description / icon / order）
  products/<分类>/       产品页（按分类分子目录）
  articles/guide/       指南类文章
  articles/faq/         FAQ 文章（faqItems 结构化问答）
  articles/...          评测 / 对比等
src/
  app/                  Next.js 路由（首页、分类、产品、搜索、法务页、404）
  components/           组件
  lib/content/          内容加载与解析（loader）
  lib/seo/              JSON-LD / meta 生成
scripts/
  generate.ts           AI 生成单条内容（需 OPENAI_API_KEY）
  generate-batch.ts     批量生成
  content-template.ts   内容脚手架（npm run gen:tpl）
  gen-llms.ts           构建时生成 llms.txt 与索引
docs/
  使用教程.md           内容录入与本地预览完整指南
  md化重构方案.md       内容源从数据库迁到 Markdown 的决策记录
```

## 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 本地开发：http://localhost:3000
npm run build        # 构建静态站点 → out/
```

本地预览构建产物：

```bash
npx serve out        # 或：python3 -m http.server 4173 --directory out
```

## 内容管理

内容以 Markdown 文件为唯一真相源，有三种录入方式：

1. **手写**：直接在 `content/` 对应目录新建 `.md`，填写 frontmatter（详见 `docs/使用教程.md`）
2. **脚手架**：`npm run gen:tpl` 按模板生成空文件
3. **AI 生成**：`npm run gen`（单条）/ `npm run gen:batch`（批量），需本地 `.env` 配置 `OPENAI_API_KEY`

> `.env` 已被 `.gitignore` 忽略，**不会**进入仓库，密钥不会泄露。

构建时会自动运行 `scripts/gen-llms.ts` 生成 `llms.txt`（供 AI 爬虫）与站点索引。

## 部署

- 推送**源码**到 GitHub（`git push`）→ Vercel 自动拉取、安装依赖、`npm run build` 生成 `out/` 并托管为静态站点
- **无需数据库，也无需在 Vercel 配置任何数据库连接环境变量**
- `out/`（构建产物）与 `.next/`（缓存）已被 `.gitignore` 忽略，不进入仓库 —— Vercel 在云端自行构建
- 旧的数据库时代文件（Prisma / Postgres / Docker / admin 后台 / seed）已从本地仓库移除，下次 `git push` 会同步从 GitHub 远端删除

## 文档

- 内容录入与本地预览：[docs/使用教程.md](docs/使用教程.md)
- 架构重构决策：[docs/md化重构方案.md](docs/md化重构方案.md)

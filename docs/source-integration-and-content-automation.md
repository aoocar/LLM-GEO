# AooBee 源码接入与自动内容生产方案（2026-08-05）

> 目标：解决 aoobee.com 的 **源码仓库接入**（GitHub → CNB）与 **内容自动生产** 两大问题，
> 让 CodeBuddy 在 CNB 侧拿到可读写的代码源，并**按用户需求直接自动生成内容**，走 PR 审核、由 Vercel 自动上线。
> （Obsidian 仅作为可选的「人工供稿」补充，不再阻塞生产。）

---

## ✅ 状态：已落地（2026-08-05）

> **源码已接入**：`github.com/aoocar/LLM-GEO` 已由用户设为**公开**，CodeBuddy 已完成完整 clone，
> 并将**全部源码 + content（65 个 md）+ 完整 git 历史**合并迁移到 CNB 仓库 `aoobee/aoobee` 的 `main` 分支。
> - 构建验证：`npm install` + `npm run build` 均通过 ✅，llms.txt / sitemap 自动生成。
> - CNB `main` = GitHub `aoocar/LLM-GEO` `main`（24cc051，含全部历史）。
> - 后续所有 GEO/SEO 内容运维直接在 CNB `aoobee/aoobee` 上进行，走 PR → 合并 → Vercel 自动上线。

---

## 1. 为什么当前没法直接开工（历史背景）

| 问题 | 现状 | 卡点 |
|------|------|------|
| 源码 | 用户排查到 `aoocar/aoobee`、`aoocar/2026-aoobee` 均非当前 Next.js 站源码；未发现匹配的公开仓库 | 无法改代码、加 schema、批量产内容 |
| 内容真源 | 网站内容由 Markdown/数据生成；用户已确认**无需自己在 Obsidian 写作**，授权 CodeBuddy 按需求直接生成 | 需先打通源码仓库，之后内容即可全自动生产 |
| 发布授权 | 用户希望直接由 NPC 提交 PR/推送生效 | 需先打通源码 + 部署链路（GitHub → Vercel） |

> 结论：**用户已授权 CodeBuddy 全自动内容生产**——源码到位后，
> 选题、写稿、建页、schema/sitemap 更新、上线全部可由 CodeBuddy 自动完成，Obsidian 不再是必要环节。

---

## 2. 最终架构（已落地）

```
 ┌─────────────────────────────┐        ┌──────────────────────────────┐
 │  用户（大强）                 │        │  CNB（CodeBuddy 工作区）      │
 │  提需求 / 审 PR / 订阅报告    │        │  aoobee/aoobee 仓库           │
 │        │                    │        │   Next.js 源码 + content/*    │
 │        │ ① 提需求            │        │        ▲                     │
 │        ▼                    │        │        │ ② 按需自动生产内容     │
 │  GitHub 公开仓库（镜像真源）  │◀───────┼────────┘  （选题/写稿/建页/    │
 │  aoocar/LLM-GEO ← 源码+内容  │        │        │   schema/sitemap）    │
 └─────────────┬───────────────┘        └────────┘                    │
               │ GitHub → Vercel 自动部署（已配置）                      │
               ▼                                                      │
         www.aoobee.com（生产站点）◀──────── 由 Git 提交驱动更新          │
```

要点：

1. **GitHub 仓库 `aoocar/LLM-GEO`（公开）作为真源镜像**，同时保存「Next.js 源码 + content 数据」。
2. **内容由 CodeBuddy 自动生产**：用户提需求（行业/主题/频次）后，CodeBuddy 直接在 CNB 侧完成选题 → 写稿 → 生成页面 → schema/sitemap 更新，全程无需用户写一个字符。
3. CNB `aoobee/aoobee` 已持有完整源码，直接读写、提交 PR。
4. **同步机制（建议后续搭建）**：CNB 侧改动需回推到 GitHub `aoocar/LLM-GEO` 才能触发 Vercel 部署。可选用：
   - **A. 双向同步（推荐）**：CNB 建 `.cnb.yml` 流水线，合并后自动 `git push` 回 GitHub（需 CNB 侧配置 GitHub 凭据，令牌放 CNB 密钥仓库）；
   - **B. 手动同步**：每次合并后 CodeBuddy 在本仓库 push 到 GitHub；
   - **C. Vercel 直连 CNB（备选）**：如 Vercel 支持，可直接从 CNB 拉取部署。
5. **Obsidian（可选）**：如你想偶尔手工供稿，仍可把 md 推进同一仓库，与自动生产共存。

---

## 3. 所需物料（已解决 / 待补充）

| 项 | 状态 | 说明 |
|----|------|------|
| 1. GitHub 源码仓库 | ✅ 已解决 | `github.com/aoocar/LLM-GEO`（公开） |
| 2. GitHub 访问令牌 | ⏳ 可选 | 用于 CNB → GitHub 自动回推（.cnb.yml 流水线）；如不用自动回推则不需要 |
| 3. 发布链路确认 | ✅ | GitHub → Vercel 自动部署已存在；CNB 侧改动需同步回 GitHub 生效 |
| 4. 内容生产授权 | ✅ | 用户已授权全自动内容生产 |

---

## 4. 内容自动化（已授权，无需 Obsidian）

**你提需求 → 我自动选题、写稿、建页、更新 schema/sitemap → 提交 PR → 合并 → Vercel 自动上线。全程你不用动手。**

工作流：
1. **选题**：按体检报告路线图 + 行业热度自动排期（榜单/对比/指南/FAQ/评测轮换）
2. **写稿与建页**：直接在 `content/` 目录生成内容 → 生成页面路由 → 更新索引
3. **GEO/SEO 配套**：自动带上 title/description、JSON-LD、canonical、sitemap、llms.txt
4. **提交 PR**：按批打包，附变更说明，合并后 Vercel 自动部署上线
5. **报告**：每次产完在评论区给你清单和上线链接

---

## 5. 密钥安全规范

- GitHub 令牌等敏感信息**禁止明文提交**到任何仓库。
- 如配置 CNB → GitHub 自动回推，令牌必须放 **CNB 密钥仓库**（`imports` 注入），不写明文。

---

## 6. 后续自动化节奏（打通后）

| 频率 | 动作 |
|------|------|
| 每日 | 增量校验/生成、内容健康度检查 |
| 每周 | CodeBuddy 新增 2~4 篇内容（榜单/对比/指南/FAQ 轮换），更新 sitemap |
| 每月 | 时效榜单刷新、GA4/Clarity 流量复盘、GEO 引用核查 |

---

*本方案配合 `docs/aoobee-site-audit-2026-08-05.md`（全站体检基线）使用。*

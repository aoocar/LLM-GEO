# AooBee 网站运维体检报告（2026-08-05）

> 对象：https://www.aoobee.com/（GitHub → Vercel 部署的 Next.js 全行业产品/服务目录站）
> 目的：为后续持续 GEO/SEO 运维建立基线，明确技术维护项与内容生产方向。

---

## 1. 站点概况

| 项目 | 状态 |
|------|------|
| 首页标题 | AooBee - 全行业产品与服务平台目录 |
| 技术栈 | Next.js（`/_next/static`，SSG 预渲染，`x-nextjs-prerender: 1`） |
| 部署 | Vercel（`server: Vercel`，边缘缓存命中，响应头完整） |
| 语言 | 中文（`lang="zh-CN"`） |
| 监控 | GA4 `G-LFP31YGTRT`、Microsoft Clarity（已预连接） |
| 变现 | Google AdSense `ca-pub-8752263153695128`（ads.txt 已挂载） |
| 百度站长 | 已绑定百度站点验证 `codeva-pifSw0Dfib` |

**规模**：8 个行业分类（AI/装修/维修/家电/办公/养老/教育/育儿）、9 个产品收录、8 篇榜单（best）、8 篇对比（compare）、9 篇评测（review/reviews）、8 篇指南（guide）、8 篇 FAQ（faq）。Sitemap 共 77 个 URL，**全部返回 200，无死链**。

---

## 2. SEO 基础设施体检

| 检查项 | 结果 | 评价 |
|--------|------|------|
| robots.txt | `Allow: /` + 单独放行 GPTBot/ChatGPT-User/ClaudeBot/PerplexityBot/Google-Extended/Bytespider 等；`Sitemap:` 已声明 | ✅ 优秀（已为 GEO 放行 AI 爬虫） |
| sitemap.xml | 77 URL，含 lastmod/changefreq/priority，覆盖全部内容页 | ✅ 完整 |
| llms.txt | 存在，HTTP 200，含全部内容清单链接 | ✅ 优秀（GEO 重要资产） |
| 首页 title/description | 齐备，含品牌词 + 行业词 | ✅ |
| 详情页 title/description | 全部按「产品名 - 功能/价格/评测 | AooBee」模板生成，不重复 | ✅ |
| canonical | 全站页面均有，指向自身 | ✅ |
| JSON-LD 结构化数据 | 产品页：SoftwareApplication/Offer/AggregateRating/FAQPage；内容页：Article/FAQPage | ✅ 优秀 |
| h1 | 每页 1 个且唯一 | ✅ |
| h2/h3 层级 | 合理 | ✅ |
| OG/Twitter 卡片 | og:title/description/image/type + twitter:card 齐备 | ✅ |
| og:image | 端点返回 308 重定向，建议核实最终 200 | ⚠️ 待确认 |
| img alt | 页面极少使用 img（多文字/图标），无缺 alt 问题 | ✅ |
| hreflang | 站点为纯中文，无多语言，无需 hreflang | ✅（不适用） |
| 性能头 | HSTS、x-content-type-options、referrer-policy 等安全头齐全 | ✅ |
| 页面大小 | 首页约 75KB HTML，SSG 预渲染 | ✅ |

**结论：基础 SEO/GEO 工程底子很好，无需大改，重点是"持续增量内容 + 站内关联 + 外部分发"。**

---

## 3. 发现的问题与优化建议

### 3.1 技术侧
1. **og:image 返回 308**（`/opengraph-image?...`）—— 308 是永久重定向，浏览器/爬虫一般能跟随，但建议确认最终目标返回 200 且为 png，避免部分抓取器放弃。
2. **`/search/` 支持站内搜索**，但 sitemap 未收录搜索词落地页；可评估是否为热门搜索词生成静态落地页（SEO 长尾机会）。
3. **对比页/评测页存在 `/review/` 与 `/reviews/` 双路径**（如 `/review/chatgpt-review/` 与 `/reviews/chatgpt-honest-review/`），属两个不同页面，注意不要造成主题重复；如需合并可加 canonical 或互相链接。
4. **广告位与正文比例**：已接入 AdSense，需持续观察有效展示密度（保持正文优先，避免影响 Core Web Vitals）。
5. 建议启用 **Bing Webmaster（必应站长）** 与 **Google Search Console** 的定期抓取核对（需要用户授权时再要账号）。

### 3.2 GEO 侧（面向 AI 答案引擎）
- 已有：AI 爬虫放行、llms.txt、JSON-LD（Product/Article/FAQ）。
- 下一步建议：
  - 为每个**产品详情页**增加更完整的 `Product` schema（品牌/价格区间/评分/优缺点字段），提升被 AI 引用时的信息完整度；
  - 增加 **`speakable`**（如适用）与 **`HowTo`** 结构到指南页；
  - 在 **llms.txt** 中增加每页的"一句话摘要"式描述，方便 AI 快速筛选引用；
  - 建立站内**互相引用网络**（产品 ↔ 榜单 ↔ 对比 ↔ 评测），提升 AI 爬取时的实体关联密度。

---

## 4. 内容生产路线图（后续执行）

按 **"覆盖行业 → 长尾问题 → 时效榜单"** 三层推进：

### A. 补齐现有 8 大行业的内容深度
| 行业 | 现有 | 可扩展方向 |
|------|------|-----------|
| AI | ChatGPT、Claude | 新增产品：DeepSeek、Kimi、豆包、文心一言、通义千问、Midjourney、Cursor 等 |
| 办公 | 钉钉 | 企业微信、飞书、WPS、Notion、腾讯会议、Slack |
| 家电 | 海尔 | 美的、格力、小米、方太、老板、戴森 |
| 装修 | 土巴兔 | 齐家网、住小帮、酷家乐、好好住 |
| 维修 | 58到家 | 啄木鸟、京东服务+、苏宁帮客、闪修侠 |
| 教育 | 猿辅导 | 作业帮、学而思、网易有道、高途 |
| 养老 | 泰康之家 | 亲和源、太保家园、国寿嘉园 |
| 育儿 | 亲宝宝 | 宝宝树、小豆苗、年糕妈妈、丁香妈妈 |

### B. 长尾内容类型（每行业 3~5 篇）
- **榜单（best/）**：`2026 年 X 行业 TOP10`（每月时效更新）
- **对比（compare/）**：竞品两两对比
- **指南（guide/）**：选购/使用教程
- **FAQ（faq/）**：长尾问题聚合（每行业 10~15 问）
- **评测（review/）**：产品深度实测

### C. 时效与热点
- 每月更新「当月值得关注的 AI 新产品 / 行业榜单」
- 跟踪大模型发布节奏（GPT-5.x、Claude 新版本等）及时产出对比/评测

---

## 5. 运维节奏建议

| 频率 | 动作 |
|------|------|
| 每周 | 新增 2~4 篇内容（榜单/对比/指南/FAQ 轮换），更新 sitemap |
| 每月 | 时效榜单刷新、旧内容数据核对、GA4/Clarity 流量复盘 |
| 季度 | 全站死链扫描、schema 升级、GEO 引用来源核查 |

---

*本报告为基线快照，后续更新将在此仓库维护。*

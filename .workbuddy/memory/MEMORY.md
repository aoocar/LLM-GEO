
## 部署与 OG 图约定（2026-07-23 确立）
- 部署方式：Next.js 服务器部署（非静态导出），Vercel 默认 serverless。next.config 不含 output:'export'。
- OG 图：用原生 opengraph-image.tsx 约定（src/app 及路由组下共 9 个），由 Next 运行时以 image/png 提供，不手动生成 .png 文件、不写 public/og/。
- generateMeta 不注入 og:image（交给 Next 元数据约定自动注入）；如需自定义图，页面传 image 参数。
- 中文字体 assets/fonts/NotoSansSC.ttf（子集化静态字体）须进仓库（Vercel=Linux 无系统中文字体）。

## Git 推送约定（2026-08-01 实测更正）
- remote = https://github.com/aoocar/LLM-GEO.git（HTTPS），credential.helper = helper-selector（Git Credential Manager 的 Windows GUI 选择器）。
- **2026-08-01 实测：本沙箱已可正常 push**——`git push origin main` 成功（0375399..e391117），不再卡 `/dev/tty`（环境已具备可用凭据 / credential helper 缓存 token）。
- 因此约定更新为：**AI 可直接 push**（commit 后顺手 push，省用户一步）。若偶发失败（凭据过期 / 网络受限等），再回退由用户在 PowerShell 手动跑。
- PowerShell 不支持 `&&`，给用户的命令要用 `;` 或分两行写。

## 内容与内链机制（2026-07-31 建立）
- 文章：content/articles/{best,compare,review,guide,faq}/，由 loader.ts 的 DIR_TO_TYPE 映射。
- **reviews 类型例外**：内容放独立目录 content/reviews/（parseReviews 解析），frontmatter 格式不同（title/product/author/rating/pros/cons/summary）。别放进 articles/reviews/。
- related 内链：frontmatter 写 related: [路径数组]；lib/content/related.ts 的 resolveRelated 解析成 {title,href}，解析不到的自动过滤 → 结构上不会产生死链。
- 产品页的"相关阅读"按分类自动聚合本类文章，无需手写 related；文章页/点评页需在 frontmatter 手写。

## AdSense 接入约定（2026-08-01 接入）
- 发布商 ID：`ca-pub-8752263153695128`（用户老账号，添加 www.aoobee.com 为新站点）。
- 三处落盘：①`public/ads.txt` = `google.com, pub-8752263153695128, DIRECT, f08c47fec0942fa0`；②`src/app/layout.tsx` 的 `metadata.other` 含 `google-adsense-account` 元标记；③`src/components/analytics.tsx` 含 AdSense loader `<Script>`（与 GA/Clarity 同模式）。
- 当前仅接入验证 + Auto Ads 启用；实际出广告取决于老账号状态与站点审核。手动固定广告位（`<AdSlot>`）为后续可选步骤。

## 站点战略定位（2026-08-01 确立）
- 站点根本目的 = **SEO（搜索引擎索引/排名）+ GEO（被 AI 引用）**，**不是**服务人类直接访问；人类流量只是副产品。
- 优先级：**内容扩写 + 排名提升是绝对主线**，所有资源向这两件事倾斜。
- AdSense 定位 = **set-and-forget（放着不用管）**：已接验证+loader，但**不主动优化广告位/不投入运营**；因人类流量有限，广告收入本就微薄，不值得占用主线精力。后续除非用户改口，否则不投入广告位设计。

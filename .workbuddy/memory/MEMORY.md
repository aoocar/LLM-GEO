
## 部署与 OG 图约定（2026-07-23 确立）
- 部署方式：Next.js 服务器部署（非静态导出），Vercel 默认 serverless。next.config 不含 output:'export'。
- OG 图：用原生 opengraph-image.tsx 约定（src/app 及路由组下共 9 个），由 Next 运行时以 image/png 提供，不手动生成 .png 文件、不写 public/og/。
- generateMeta 不注入 og:image（交给 Next 元数据约定自动注入）；如需自定义图，页面传 image 参数。
- 中文字体 assets/fonts/NotoSansSC.ttf（子集化静态字体）须进仓库（Vercel=Linux 无系统中文字体）。

## Git 推送约定（2026-07-31 查明原因）
- remote = https://github.com/aoocar/LLM-GEO.git（HTTPS），credential.helper = helper-selector（Git Credential Manager 的 Windows GUI 选择器）。
- **AI 侧 git push 必定失败**：执行环境无 /dev/tty，GCM 弹不出认证窗口，报 `could not read Username for 'https://github.com'`。
- 因此分工固定：AI 只做到 `git add` + `git commit`，**push 一律由用户在自己的 PowerShell 里跑**。不要再尝试代跑 push。
- PowerShell 不支持 `&&`，给用户的命令要用 `;` 或分两行写。

## 内容与内链机制（2026-07-31 建立）
- 文章：content/articles/{best,compare,review,guide,faq}/，由 loader.ts 的 DIR_TO_TYPE 映射。
- **reviews 类型例外**：内容放独立目录 content/reviews/（parseReviews 解析），frontmatter 格式不同（title/product/author/rating/pros/cons/summary）。别放进 articles/reviews/。
- related 内链：frontmatter 写 related: [路径数组]；lib/content/related.ts 的 resolveRelated 解析成 {title,href}，解析不到的自动过滤 → 结构上不会产生死链。
- 产品页的"相关阅读"按分类自动聚合本类文章，无需手写 related；文章页/点评页需在 frontmatter 手写。

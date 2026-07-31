
## 部署与 OG 图约定（2026-07-23 确立）
- 部署方式：Next.js 服务器部署（非静态导出），Vercel 默认 serverless。next.config 不含 output:'export'。
- OG 图：用原生 opengraph-image.tsx 约定（src/app 及路由组下共 9 个），由 Next 运行时以 image/png 提供，不手动生成 .png 文件、不写 public/og/。
- generateMeta 不注入 og:image（交给 Next 元数据约定自动注入）；如需自定义图，页面传 image 参数。
- 中文字体 assets/fonts/NotoSansSC.ttf（子集化静态字体）须进仓库（Vercel=Linux 无系统中文字体）。

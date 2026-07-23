import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 不再 output:'export'：改用 opengraph-image.tsx 原生约定，由 Next 运行时以
  // image/png 提供 OG 图（Vercel 默认 serverless 部署即可，无需静态导出）。
  images: { unoptimized: true },
  // 让子路由导出为 out/<route>/index.html（而非 out/<route>.html），
  // 这样任何静态服务器（Python http.server / nginx 默认 try_files）都能直接伺服干净 URL，
  // 否则 /ai 等子页会被当成目录列表、在静态托管下实际打不开。
  trailingSlash: true,
};

export default nextConfig;

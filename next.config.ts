import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 纯静态导出：无运行时、无数据库，产物输出到 out/
  output: "export",
  // 静态导出不支持 next/image 优化，关闭后用外链/本地图片
  images: { unoptimized: true },
  // 让子路由导出为 out/<route>/index.html（而非 out/<route>.html），
  // 这样任何静态服务器（Python http.server / nginx 默认 try_files）都能直接伺服干净 URL，
  // 否则 /ai 等子页会被当成目录列表、在静态托管下实际打不开。
  trailingSlash: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 纯静态导出：无运行时、无数据库，产物输出到 out/
  output: "export",
  // 静态导出不支持 next/image 优化，关闭后用外链/本地图片
  images: { unoptimized: true },
};

export default nextConfig;

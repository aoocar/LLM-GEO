import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/og-image";

export const alt = "AooBee - 全行业产品与服务平台目录";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return buildOgImage({
    title: "AooBee",
    eyebrow: "全行业产品、工具与服务目录",
  });
}

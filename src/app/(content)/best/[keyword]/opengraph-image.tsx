import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/og-image";
import { getArticles } from "@/lib/content";

export const alt = "AooBee 最佳推荐";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamic = "force-static";

export function generateStaticParams() {
  return getArticles()
    .filter((a) => a.type === "BEST")
    .map((a) => ({ keyword: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ keyword: string }> }) {
  const { keyword } = await params;
  const slug = decodeURIComponent(keyword);
  const article = getArticles().find((a) => a.slug === slug && a.type === "BEST");
  const title = article?.title || "最佳推荐";
  return buildOgImage({ title, eyebrow: "AooBee · 最佳推荐" });
}

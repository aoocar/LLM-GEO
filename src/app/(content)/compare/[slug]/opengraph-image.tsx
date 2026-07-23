import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/og-image";
import { getArticles } from "@/lib/content";

export const alt = "AooBee 产品对比";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getArticles()
    .filter((a) => a.type === "COMPARISON")
    .map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticles().find((a) => a.slug === slug && a.type === "COMPARISON");
  const title = article?.metaTitle || article?.title || "产品对比";
  return buildOgImage({ title, eyebrow: "AooBee · 对比" });
}

import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/og-image";
import { getArticles } from "@/lib/content";

export const alt = "AooBee 行业指南";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getArticles()
    .filter((a) => ["GUIDE", "HOW_TO", "LISTICLE"].includes(a.type))
    .map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticles().find(
    (a) => a.slug === slug && ["GUIDE", "HOW_TO", "LISTICLE"].includes(a.type)
  );
  const title = article?.metaTitle || article?.title || "行业指南";
  return buildOgImage({ title, eyebrow: "AooBee · 行业指南" });
}

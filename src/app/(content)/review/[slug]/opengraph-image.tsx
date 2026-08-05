import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/og-image";
import { getArticles } from "@/lib/content";

export const alt = "AooBee 产品评测";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamic = "force-static";

export function generateStaticParams() {
  return getArticles()
    .filter((a) => a.type === "REVIEW")
    .map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticles().find((a) => a.slug === slug && a.type === "REVIEW");
  const title = article?.metaTitle || article?.title || "产品评测";
  return buildOgImage({ title, eyebrow: "AooBee · 产品评测" });
}

import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/og-image";
import { getCategories, getCategory } from "@/lib/content";

export const alt = "AooBee 行业分类";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamic = "force-static";

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = getCategory(category);
  const name = cat?.name || "分类";
  return buildOgImage({ title: name, eyebrow: "AooBee · 行业分类" });
}

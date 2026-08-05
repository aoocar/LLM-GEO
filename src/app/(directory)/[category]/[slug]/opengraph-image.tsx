import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/og-image";
import { getProducts, getProductBySlug } from "@/lib/content";

export const alt = "AooBee 产品详情";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamic = "force-static";

export function generateStaticParams() {
  return getProducts().map((p) => ({ category: p.category.slug, slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  const name = product?.name || "产品";
  const eyebrow = product ? `AooBee · ${product.category.name}` : "AooBee";
  return buildOgImage({ title: name, eyebrow });
}

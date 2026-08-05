import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/og-image";
import { getReviews } from "@/lib/content";

export const alt = "AooBee 产品点评";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamic = "force-static";

export function generateStaticParams() {
  return getReviews().map((r) => ({ slug: r.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = getReviews().find((r) => r.slug === slug);
  const title = review?.title || "产品点评";
  return buildOgImage({ title, eyebrow: "AooBee · 产品点评" });
}

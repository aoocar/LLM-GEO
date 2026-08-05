import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { FaqSection } from "@/components/directory/faq-section";
import { RelatedReads } from "@/components/directory/related-reads";
import { DefinitionBlock } from "@/components/directory/definition-block";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { articleSchema, faqSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { getArticle, getArticles } from "@/lib/content";
import { markdownToHtml } from "@/lib/content/markdown";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    return generateMeta({ title: "页面未找到", description: "该文章不存在" });
  }
  return generateMeta({
    title: article.metaTitle || article.title,
    description: article.metaDesc || article.excerpt || article.title,
    keywords: article.keywords,
    url: `/guide/${slug}`,
  });
}

export function generateStaticParams() {
  return getArticles()
    .filter((a) => ["GUIDE", "HOW_TO", "LISTICLE"].includes(a.type))
    .map((a) => ({ slug: a.slug }));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const faqItems = article.faqItems;

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: article.title,
            description: article.excerpt || article.title,
            slug: article.slug,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt,
            url: `/guide/${article.slug}`,
          }),
          ...(faqItems.length > 0 ? [faqSchema(faqItems)] : []),
          breadcrumbSchema([
            { name: "首页", url: "https://www.aoobee.com" },
            { name: "行业指南", url: "https://www.aoobee.com/guide" },
            { name: article.title, url: `https://www.aoobee.com/guide/${article.slug}` },
          ]),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: "行业指南", href: "/guide" },
            { label: article.title, href: `/guide/${article.slug}` },
          ]}
        />

        <h1 className="text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
          <span>{article.authorName}</span>
          {article.publishedAt && (
            <span>{new Date(article.publishedAt).toLocaleDateString("zh-CN")}</span>
          )}
          {article.readTime && <span>约 {article.readTime} 分钟阅读</span>}
          {article.category && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
              {article.category.name}
            </span>
          )}
        </div>

        <DefinitionBlock article={article} />

        <article className="prose prose-gray max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }} />
        </article>

        {faqItems.length > 0 && <FaqSection items={faqItems} title="常见问题" />}

        <RelatedReads items={article.related} />
      </div>
    </>
  );
}

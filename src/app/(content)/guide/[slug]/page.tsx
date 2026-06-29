import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { FaqSection } from "@/components/directory/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { articleSchema, faqSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { db } from "@/lib/db";
import { Clock, Tag } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const article = await db.article.findUnique({ where: { slug } });

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

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const article = await db.article.findUnique({
    where: { slug },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!article) {
    notFound();
  }

  const faqItems = (article.faqItems as Array<{ question: string; answer: string }>) || [];

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
            authorName: article.authorName,
          }),
          ...(faqItems.length > 0 ? [faqSchema(faqItems)] : []),
          breadcrumbSchema([
            { name: "首页", url: "https://www.aoobee.com" },
            { name: "行业指南", url: "https://www.aoobee.com/guide" },
            { name: article.title, url: `https://www.aoobee.com/guide/${article.slug}` },
          ]),
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: "行业指南", href: "/guide" },
            { label: article.title, href: `/guide/${article.slug}` },
          ]}
        />

        {/* 文章 Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>

          <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
            <span>{article.authorName}</span>
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString("zh-CN")}</span>
            )}
            {article.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 约 {article.readTime} 分钟阅读
              </span>
            )}
            {article.category && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
                <Tag className="w-3 h-3" /> {article.category.name}
              </span>
            )}
          </div>

          {article.excerpt && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed border-l-4 border-primary pl-4">
              {article.excerpt}
            </p>
          )}
        </header>

        {/* 文章正文 */}
        <article className="prose prose-gray prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }} />
        </article>

        {/* 关键词 */}
        {article.keywords.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">关键词</h3>
            <div className="flex flex-wrap gap-2">
              {article.keywords.map((kw) => (
                <span key={kw} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {faqItems.length > 0 && <FaqSection items={faqItems} title="常见问题" />}
      </div>
    </>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<)(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

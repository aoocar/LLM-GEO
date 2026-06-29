import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { FaqSection } from "@/components/directory/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { generateMeta } from "@/lib/seo/meta";
import { articleSchema, faqSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { db } from "@/lib/db";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ keyword: string }> }) {
  const { keyword } = await params;
  const slug = decodeURIComponent(keyword);
  const article = await db.article.findUnique({ where: { slug } });

  if (!article) {
    return generateMeta({ title: "页面未找到", description: "该推荐页面不存在" });
  }

  return generateMeta({
    title: article.metaTitle || article.title,
    description: article.metaDesc || article.excerpt || article.title,
    keywords: article.keywords,
    url: `/best/${slug}`,
  });
}

export default async function BestKeywordPage({ params }: { params: Promise<{ keyword: string }> }) {
  const { keyword } = await params;
  const slug = decodeURIComponent(keyword);

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
          }),
          ...(faqItems.length > 0 ? [faqSchema(faqItems)] : []),
          breadcrumbSchema([
            { name: "首页", url: "https://www.aoobee.com" },
            { name: "最佳推荐", url: "https://www.aoobee.com/best" },
            { name: article.title, url: `https://www.aoobee.com/best/${article.slug}` },
          ]),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: "最佳推荐", href: "/best" },
            { label: article.title, href: `/best/${article.slug}` },
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

        {/* 文章正文 */}
        <article className="prose prose-gray max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }} />
        </article>

        {/* FAQ */}
        {faqItems.length > 0 && <FaqSection items={faqItems} title="常见问题" />}
      </div>
    </>
  );
}

// 简易 Markdown 转 HTML
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

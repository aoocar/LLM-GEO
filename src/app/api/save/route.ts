import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    let url = "";

    switch (type) {
      case "product": {
        const categoryInput = body.categorySlug || body.categoryName || body.category || "";
        // 先按 slug 查，再按名称查
        let category = await db.category.findUnique({ where: { slug: categoryInput } });
        if (!category) {
          category = await db.category.findFirst({ where: { name: categoryInput } });
        }
        // 自动生成 slug 再试一次
        if (!category) {
          const autoSlug = categoryInput.toLowerCase().replace(/[^a-z0-9一-龥]+/g, "-").replace(/^-|-$/g, "");
          category = await db.category.findUnique({ where: { slug: autoSlug } });
        }

        if (!category) {
          // 自动创建新分类（补充默认 icon 和 description）
          const newSlug = categoryInput.toLowerCase().replace(/[^a-z0-9一-龥]+/g, "-").replace(/^-|-$/g, "") || "uncategorized";
          const maxSort = await db.category.aggregate({ _max: { sortOrder: true } });
          category = await db.category.create({
            data: {
              name: categoryInput || "未分类",
              slug: newSlug,
              icon: "📦",
              description: `${categoryInput}行业的产品和服务`,
              sortOrder: (maxSort._max.sortOrder || 0) + 1,
              published: true,
            },
          });
        }

        const slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9一-龥]+/g, "-")
          .replace(/^-|-$/g, "");

        const product = await db.product.upsert({
          where: { slug },
          create: {
            name: data.name,
            slug,
            description: data.description || "",
            longDesc: data.longDesc || "",
            categoryId: category.id,
            pricing: data.pricing || null,
            company: data.company || null,
            features: data.features || [],
            pros: data.pros || [],
            cons: data.cons || [],
            tags: data.tags || [],
            useCases: data.useCases || [],
            status: "ACTIVE",
            publishedAt: new Date(),
          },
          update: {
            description: data.description || "",
            longDesc: data.longDesc || "",
            features: data.features || [],
            pros: data.pros || [],
            cons: data.cons || [],
            tags: data.tags || [],
            useCases: data.useCases || [],
          },
        });

        // 保存 FAQ 为文章
        if (data.faqItems && data.faqItems.length > 0) {
          await db.article.upsert({
            where: { slug: `${slug}-faq` },
            create: {
              title: `${data.name} 常见问题`,
              slug: `${slug}-faq`,
              type: "FAQ",
              content: data.faqItems.map((f: any) => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
              faqItems: data.faqItems,
              keywords: data.keywords || [],
              metaTitle: data.metaTitle || `${data.name} 常见问题`,
              metaDesc: data.metaDesc || `${data.name} 的常见问题和解答`,
              categoryId: category.id,
              productId: product.id,
              authorName: "AooBee 编辑部",
              published: true,
              publishedAt: new Date(),
            },
            update: {
              content: data.faqItems.map((f: any) => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
              faqItems: data.faqItems,
            },
          });
        }

        url = `/${category.slug}/${slug}`;
        break;
      }

      case "comparison":
      case "guide":
      case "best": {
        const typeMap: Record<string, string> = {
          comparison: "COMPARISON",
          guide: "GUIDE",
          best: "BEST",
        };

        const slug = (data.title || "untitled")
          .toLowerCase()
          .replace(/[^a-z0-9一-龥]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 80);

        // 先按 slug 查，再按名称查，最后自动创建
        const catInput = body.categorySlug || body.categoryName || body.category || "";
        let category = catInput ? await db.category.findUnique({ where: { slug: catInput } }) : null;
        if (!category && catInput) {
          category = await db.category.findFirst({ where: { name: catInput } });
        }
        if (!category && catInput) {
          const newSlug = catInput.toLowerCase().replace(/[^a-z0-9一-龥]+/g, "-").replace(/^-|-$/g, "") || "uncategorized";
          const maxSort = await db.category.aggregate({ _max: { sortOrder: true } });
          category = await db.category.create({
            data: {
              name: catInput,
              slug: newSlug,
              icon: "📦",
              description: `${catInput}行业的产品和服务`,
              sortOrder: (maxSort._max.sortOrder || 0) + 1,
              published: true,
            },
          });
        }

        await db.article.upsert({
          where: { slug },
          create: {
            title: data.title,
            slug,
            type: typeMap[type] as any,
            content: data.content || "",
            excerpt: data.excerpt || data.metaDesc || "",
            faqItems: data.faqItems || [],
            keywords: data.keywords || [],
            metaTitle: data.metaTitle || data.title,
            metaDesc: data.metaDesc || data.excerpt || "",
            categoryId: category?.id || null,
            authorName: "AooBee 编辑部",
            readTime: data.readTime || 10,
            wordCount: data.wordCount || 2000,
            published: true,
            publishedAt: new Date(),
          },
          update: {
            content: data.content || "",
            faqItems: data.faqItems || [],
          },
        });

        const prefix = type === "comparison" ? "compare" : type === "best" ? "best" : "guide";
        url = `/${prefix}/${slug}`;
        break;
      }

      case "faq": {
        if (Array.isArray(data)) {
          const slug = (body.topic || "faq")
            .toLowerCase()
            .replace(/[^a-z0-9一-龥]+/g, "-")
            .replace(/^-|-$/g, "");

          await db.article.upsert({
            where: { slug },
            create: {
              title: `${body.topic} 常见问题`,
              slug,
              type: "FAQ",
              content: data.map((f: any) => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
              faqItems: data,
              keywords: [body.topic],
              authorName: "AooBee 编辑部",
              published: true,
              publishedAt: new Date(),
            },
            update: {
              content: data.map((f: any) => `### ${f.question}\n\n${f.answer}`).join("\n\n"),
              faqItems: data,
            },
          });

          url = `/faq/${slug}`;
        }
        break;
      }

      default:
        return NextResponse.json({ error: `不支持的类型: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("[Save Error]", error);
    return NextResponse.json(
      { error: error.message || "保存失败" },
      { status: 500 }
    );
  }
}

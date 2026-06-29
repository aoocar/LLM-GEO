import { NextResponse } from "next/server";
import {
  generateProductContent,
  generateComparison,
  generateGuide,
  generateBestList,
  generateFaq,
} from "@/lib/llm/prompts";
import { getLLMInfo } from "@/lib/llm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    console.log(`[Generate] type=${type}, provider=${getLLMInfo().provider}, model=${getLLMInfo().model}`);

    let result: any;

    switch (type) {
      case "product":
        if (!body.name || !body.category) {
          return NextResponse.json({ error: "产品名称和行业为必填" }, { status: 400 });
        }
        result = await generateProductContent({
          name: body.name,
          category: body.category,
          url: body.url,
          company: body.company,
        });
        break;

      case "comparison":
        if (!body.productA || !body.productB) {
          return NextResponse.json({ error: "两个产品名称为必填" }, { status: 400 });
        }
        result = await generateComparison({
          productA: body.productA,
          productB: body.productB,
          category: body.category || "通用",
        });
        break;

      case "guide":
        if (!body.category || !body.topic) {
          return NextResponse.json({ error: "行业和主题为必填" }, { status: 400 });
        }
        result = await generateGuide({
          category: body.category,
          topic: body.topic,
          targetKeywords: body.keywords || [],
        });
        break;

      case "best":
        if (!body.keyword) {
          return NextResponse.json({ error: "推荐关键词为必填" }, { status: 400 });
        }
        result = await generateBestList({
          keyword: body.keyword,
          category: body.category || "通用",
          products: [
            { name: "ChatGPT", description: "OpenAI AI助手" },
            { name: "Claude", description: "Anthropic AI助手" },
            { name: "DeepSeek", description: "DeepSeek AI助手" },
            { name: "通义千问", description: "阿里巴巴 AI助手" },
            { name: "文心一言", description: "百度 AI助手" },
          ],
        });
        break;

      case "faq":
        if (!body.topic) {
          return NextResponse.json({ error: "FAQ主题为必填" }, { status: 400 });
        }
        result = await generateFaq({ topic: body.topic, count: 10 });
        break;

      default:
        return NextResponse.json({ error: `不支持的内容类型: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ result, provider: getLLMInfo() });
  } catch (error: any) {
    console.error("[Generate Error]", error);
    return NextResponse.json(
      { error: error.message || "内容生成失败" },
      { status: 500 }
    );
  }
}

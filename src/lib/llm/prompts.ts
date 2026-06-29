import { callLLM, callLLMJson } from "@/lib/llm";

// ==================== 系统提示词 ====================

const BASE_SYSTEM_PROMPT = `你是一个专业的行业分析师和 SEO 内容专家，服务于 AooBee 全行业产品目录平台。

## 内容规范
1. 使用清晰的标题层级（H2 > H3 > H4）
2. 开头 2-3 句直接回答核心问题（GEO 优化：方便 AI 提取答案）
3. 使用定义句式："[产品名]是一款[定义]"（方便 AI 理解实体）
4. 包含具体数据和事实，避免空泛描述
5. 每段控制在 100 字以内，适合移动端阅读
6. 语言：中文，专业但通俗易懂
7. 输出格式：Markdown

## GEO 优化要求
- 使用结构化的内容格式（列表、表格）
- 包含实体名称的完整形式（首次出现时）
- 段落之间有清晰的逻辑关系
- 在适当位置使用"根据..."、"数据显示..."等引用句式`;

// ==================== 产品描述生成 ====================

interface ProductContentInput {
  name: string;
  category: string;
  url?: string;
  company?: string;
  features?: string[];
}

interface ProductContentOutput {
  description: string;
  longDesc: string;
  features: Array<{ name: string; description: string }>;
  pros: string[];
  cons: string[];
  useCases: string[];
  faqItems: Array<{ question: string; answer: string }>;
  metaTitle: string;
  metaDesc: string;
  keywords: string[];
  tags: string[];
}

export async function generateProductContent(
  input: ProductContentInput
): Promise<ProductContentOutput> {
  const userPrompt = `请为以下产品生成完整的目录页面内容：

产品名称：${input.name}
所属行业：${input.category}
${input.url ? `官网：${input.url}` : ""}
${input.company ? `公司：${input.company}` : ""}
${input.features ? `已知功能：${input.features.join(", ")}` : ""}

请生成以下内容（JSON格式）：
{
  "description": "100字以内的产品简介，开头用定义句式",
  "longDesc": "500-800字的详细介绍，包含产品背景、核心能力、适用人群，使用 Markdown 格式",
  "features": [{"name": "功能名称", "description": "功能说明"}],
  "pros": ["优点1", "优点2", ...],
  "cons": ["缺点1", "缺点2", ...],
  "useCases": ["场景1", "场景2", ...],
  "faqItems": [{"question": "问题", "answer": "答案"}, ...],
  "metaTitle": "SEO标题(60字以内)",
  "metaDesc": "SEO描述(160字以内)",
  "keywords": ["关键词1", "关键词2", ...],
  "tags": ["标签1", "标签2", ...]
}

要求：
- features 提供 6-8 个核心功能
- pros 和 cons 各 5 个
- useCases 提供 5 个场景
- faqItems 提供 8-10 个常见问题
- keywords 提供 10 个 SEO 关键词
- tags 提供 5-8 个标签`;

  return callLLMJson<ProductContentOutput>(
    BASE_SYSTEM_PROMPT,
    userPrompt,
    { temperature: 0.5 }
  );
}

// ==================== 对比文章生成 ====================

interface ComparisonInput {
  productA: string;
  productB: string;
  category: string;
}

interface ComparisonOutput {
  title: string;
  content: string;
  metaTitle: string;
  metaDesc: string;
  keywords: string[];
  faqItems: Array<{ question: string; answer: string }>;
}

export async function generateComparison(
  input: ComparisonInput
): Promise<ComparisonOutput> {
  const userPrompt = `请生成一篇 ${input.productA} 和 ${input.productB} 的对比文章。

所属行业：${input.category}

请生成以下内容（JSON格式）：
{
  "title": "文章标题，如'ChatGPT vs Claude：哪个更适合你？'",
  "content": "2000-3000字的对比文章，使用 Markdown 格式，包含：\\n1. 产品概述对比\\n2. 功能对比表格\\n3. 定价对比\\n4. 适用场景分析\\n5. 选择建议",
  "metaTitle": "SEO标题",
  "metaDesc": "SEO描述",
  "keywords": ["关键词"],
  "faqItems": [{"question": "...", "answer": "..."}]
}

要求：
- 内容客观公正，不偏向任何一方
- 使用对比表格展示关键差异
- 提供明确的选择建议
- faqItems 提供 5-8 个相关问题`;

  return callLLMJson<ComparisonOutput>(
    BASE_SYSTEM_PROMPT,
    userPrompt,
    { temperature: 0.5 }
  );
}

// ==================== 行业指南生成 ====================

interface GuideInput {
  category: string;
  topic: string;
  targetKeywords: string[];
}

interface GuideOutput {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDesc: string;
  keywords: string[];
  readTime: number;
  wordCount?: number;
  faqItems: Array<{ question: string; answer: string }>;
}

export async function generateGuide(
  input: GuideInput
): Promise<GuideOutput> {
  const userPrompt = `请生成一篇关于"${input.topic}"的行业指南文章。

所属行业：${input.category}
目标关键词：${input.targetKeywords.join(", ")}

请生成以下内容（JSON格式）：
{
  "title": "文章标题",
  "content": "2500-3500字的行业指南，使用 Markdown 格式",
  "excerpt": "150字以内的文章摘要",
  "metaTitle": "SEO标题",
  "metaDesc": "SEO描述",
  "keywords": ["关键词列表"],
  "readTime": 预计阅读分钟数,
  "faqItems": [{"question": "...", "answer": "..."}]
}

要求：
- 内容专业权威，有实际参考价值
- 使用 H2/H3 层级分明的结构
- 适当推荐相关产品
- faqItems 提供 8-10 个常见问题
- 开头直接回答文章主题的核心问题`;

  return callLLMJson<GuideOutput>(
    BASE_SYSTEM_PROMPT,
    userPrompt,
    { temperature: 0.5 }
  );
}

// ==================== "最佳XX"推荐页生成 ====================

interface BestListInput {
  keyword: string;
  category: string;
  products: Array<{ name: string; description?: string }>;
}

interface BestListOutput {
  title: string;
  content: string;
  metaTitle: string;
  metaDesc: string;
  keywords: string[];
  productReviews: Array<{
    name: string;
    rank: number;
    review: string;
    bestFor: string;
  }>;
  faqItems: Array<{ question: string; answer: string }>;
}

export async function generateBestList(
  input: BestListInput
): Promise<BestListOutput> {
  const productInfo = input.products
    .map((p, i) => `${i + 1}. ${p.name}${p.description ? ` - ${p.description}` : ""}`)
    .join("\n");

  const userPrompt = `请生成一篇"${input.keyword}"的推荐榜单文章。

所属行业：${input.category}
产品列表：
${productInfo}

请生成以下内容（JSON格式）：
{
  "title": "文章标题，如'2026年十大AI写作工具推荐'",
  "content": "开头综述（200字）+ 选择建议（300字），使用 Markdown 格式",
  "metaTitle": "SEO标题",
  "metaDesc": "SEO描述",
  "keywords": ["关键词"],
  "productReviews": [{"name": "产品名", "rank": 1, "review": "200字简评", "bestFor": "最适合XX场景"}],
  "faqItems": [{"question": "...", "answer": "..."}]
}

要求：
- 每个产品简评 150-200 字
- 说明排名理由和最适合的场景
- faqItems 提供 5-8 个相关问题
- 内容客观公正`;

  return callLLMJson<BestListOutput>(
    BASE_SYSTEM_PROMPT,
    userPrompt,
    { temperature: 0.5 }
  );
}

// ==================== FAQ 生成 ====================

interface FaqGenInput {
  topic: string;
  context?: string;
  count?: number;
}

export async function generateFaq(
  input: FaqGenInput
): Promise<Array<{ question: string; answer: string }>> {
  const userPrompt = `请为"${input.topic}"生成 ${input.count || 10} 个常见问题和回答。
${input.context ? `\n背景信息：${input.context}` : ""}

请以 JSON 数组格式输出：
[{"question": "问题", "answer": "答案"}]

要求：
- 问题应该是用户真正会搜索的问题
- 答案简洁明了，50-100 字
- 涵盖入门、使用、对比、选择等不同角度`;

  return callLLMJson<Array<{ question: string; answer: string }>>(
    BASE_SYSTEM_PROMPT,
    userPrompt,
    { temperature: 0.5 }
  );
}

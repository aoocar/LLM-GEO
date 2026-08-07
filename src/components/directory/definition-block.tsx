// 文章页"定义块"组件 —— GEO 优化：提供清晰、可引用的"什么是 X / X 适合谁"结构，
// 帮助 AI 问答引擎直接摘录。字段缺失时回退到分类真实描述，保证所有文章页都有块。
import type { Article } from "@/lib/content/types";

// 各分类默认受众描述（编辑未填 audience 时的 fallback，基于真实分类语义，非编造）
const CATEGORY_AUDIENCE: Record<string, string> = {
  ai: "需要提升内容生产与工作效率的个人与团队、开发者、创作者与中小企业。",
  zhuangxiu: "准备装修新房或旧房改造的业主、包工头与家装设计师。",
  jiadian: "关注家用品质与性价比的家庭用户、租房人群与智能家居爱好者。",
  yuer: "0-12 岁孩子的父母、备孕家庭与母婴护理从业者。",
  weixiu: "需要上门维修家电、数码与家居的普通用户，以及维修服务商与师傅。",
  bangong: "企业行政、团队管理者、自由职业者与需要协同办公的各类组织。",
  yanglao: "关注父母养老的家庭、养老机构从业者与适老化改造服务商。",
  jiaoyu: "学生、家长、教师与需要职业培训、技能提升的成人学习者。",
  tongxun: "需要办理手机流量卡、选购随身WiFi或优化上网套餐的个人用户，以及租房、出差、直播等对灵活上网有需求的群体。",
  digital: "准备入学的大学生、准大学生与其家长，以及需要选购笔记本电脑、笔记本包等数码装备的学生与职场新人。",
};

export function DefinitionBlock({ article }: { article: Article }) {
  const term = article.definitionTerm || article.category?.name || "";
  const what = article.definition || article.excerpt || null;
  const who =
    article.audience ||
    (article.category ? CATEGORY_AUDIENCE[article.category.slug] || null : null);

  if (!what && !who) return null;

  return (
    <section
      className="definition-block mb-10 rounded-xl border border-gray-200 bg-gray-50 p-6"
      aria-label="核心定义与适用人群"
    >
      {what && (
        <div className="mb-4 last:mb-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {term ? `什么是${term}？` : "核心定义"}
          </h2>
          <p className="text-gray-700 leading-relaxed">{what}</p>
        </div>
      )}
      {who && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {term ? `${term}适合谁？` : "适合谁"}
          </h2>
          <p className="text-gray-700 leading-relaxed">{who}</p>
        </div>
      )}
    </section>
  );
}

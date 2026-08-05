import { generateMeta } from "@/lib/seo/meta";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata = generateMeta({
  title: "关于我们 - AooBee",
  description: "了解 AooBee：一个覆盖全行业的综合产品与服务目录平台，帮助您发现、比较和选择最佳工具。",
  url: "/about",
});

export default function AboutPage() {
  return (
    <LegalPage
      title="关于我们"
      description="AooBee 致力于成为全行业产品与服务的结构化信息源。"
      updated="2026-07-23"
      url="/about"
    >
      <p>
        AooBee 是一个覆盖全行业的综合产品目录平台。我们收录各行业的产品与服务信息，
        包括功能介绍、定价、优缺点分析和用户评价，帮助个人与企业快速发现、比较并选择最适合的工具。
      </p>
      <h2>我们的定位</h2>
      <p>
        在 AI 与自动化时代，AooBee 同时面向搜索引擎与 AI 爬虫提供结构化、干净、可被直接引用的内容源（GEO/SEO），
        让优质产品信息更容易被检索与理解。
      </p>
      <h2>内容来源</h2>
      <p>
        全部内容以 Markdown 文件形式维护，便于持续更新与版本管理。我们正在不断扩充行业与产品覆盖。
      </p>
    </LegalPage>
  );
}

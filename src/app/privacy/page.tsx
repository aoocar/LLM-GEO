import { generateMeta } from "@/lib/seo/meta";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata = generateMeta({
  title: "隐私政策 - AooBee",
  description: "AooBee 隐私政策：说明我们如何收集、使用与保护访问者信息。",
  url: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="隐私政策"
      description="本政策说明 AooBee 如何处理访问者信息。"
      updated="2026-07-23"
    >
      <p>
        AooBee（以下简称“我们”）重视您的隐私。本政策说明在您访问本网站时，我们如何对待相关信息。
      </p>
      <h2>我们收集的信息</h2>
      <p>
        作为以内容展示为主的目录站点，我们默认不要求您注册或提交个人身份信息。我们可能通过服务器日志与隐私友好的分析工具，
        收集访问量、来源与页面浏览等匿名聚合数据，用于改进内容质量。
      </p>
      <h2>Cookie 与本地存储</h2>
      <p>
        我们可能使用必要的技术以保障站点基本功能。我们不会向第三方出售您的个人信息。
      </p>
      <h2>第三方链接</h2>
      <p>
        本站包含指向外部产品与服务的链接，其隐私实践由对应方负责，与本政策无关。
      </p>
      <h2>联系我们</h2>
      <p>
        如对本政策有疑问，可通过 <a href="mailto:hello@aoobee.com" className="text-primary hover:underline">hello@aoobee.com</a> 联系我们。
      </p>
      <p className="text-sm text-gray-400">
        注：本页为占位模板，正式上线前请由法务或负责人审阅并补充完整条款。
      </p>
    </LegalPage>
  );
}

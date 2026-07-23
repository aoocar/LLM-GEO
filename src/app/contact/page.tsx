import { generateMeta } from "@/lib/seo/meta";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata = generateMeta({
  title: "联系我们 - AooBee",
  description: "与 AooBee 团队取得联系，提交产品收录建议或合作意向。",
  url: "/contact",
});

export default function ContactPage() {
  return (
    <LegalPage
      title="联系我们"
      description="欢迎提交产品收录建议、纠错或合作意向。"
      updated="2026-07-23"
    >
      <p>如果您希望推荐一款产品被 AooBee 收录，或发现内容有误，欢迎通过以下方式联系我们：</p>
      <ul>
        <li>收录建议与纠错：<a href="mailto:hello@aoobee.com" className="text-primary hover:underline">hello@aoobee.com</a></li>
        <li>商务合作：<a href="mailto:bd@aoobee.com" className="text-primary hover:underline">bd@aoobee.com</a></li>
      </ul>
      <p className="text-sm text-gray-400">
        注：本页为占位模板，请替换为实际可用的联系邮箱与渠道。
      </p>
    </LegalPage>
  );
}

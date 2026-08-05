import { generateMeta } from "@/lib/seo/meta";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata = generateMeta({
  title: "使用条款 - AooBee",
  description: "AooBee 使用条款：说明访问与使用本网站内容的规则。",
  url: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="使用条款"
      description="访问或使用 AooBee 即表示您同意以下条款。"
      updated="2026-07-23"
      url="/terms"
    >
      <p>欢迎访问 AooBee。访问或使用本网站，即表示您同意下列条款。</p>
      <h2>内容用途</h2>
      <p>
        本站提供的产品信息、评测与对比内容仅供一般参考。在做出购买或采用决策前，建议您结合自身需求进一步核实。
      </p>
      <h2>知识产权</h2>
      <p>
        本站原创内容（文字、结构、标识）的知识产权归 AooBee 所有。第三方产品名称、商标归各自权利人所有。
      </p>
      <h2>免责声明</h2>
      <p>
        对于因使用本站信息而产生的任何直接或间接损失，本站不承担责任。外部链接指向的内容由对应方负责。
      </p>
      <h2>条款变更</h2>
      <p>我们可能不时更新本条款，更新后以本站公示版本为准。</p>
    </LegalPage>
  );
}

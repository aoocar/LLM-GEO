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
      description="本政策说明 AooBee 如何处理访问者信息，以及我们与 Google 在使用广告时如何使用 Cookie。"
      updated="2026-08-01"
      url="/privacy"
    >
      <p>
        AooBee（以下简称“我们”）重视您的隐私。本政策说明在您访问本网站时，我们如何对待相关信息，
        以及我们与第三方（包括 Google）如何在使用广告时使用 Cookie 与类似技术。
      </p>
      <h2>我们收集的信息</h2>
      <p>
        作为以内容展示为主的目录站点，我们默认不要求您注册或提交个人身份信息。我们通过以下工具收集匿名聚合数据，用于改进内容质量与了解访问情况：
      </p>
      <ul>
        <li>服务器访问日志：访问量、来源、页面浏览、设备与浏览器类型等；</li>
        <li>Google Analytics（分析）：页面互动、流量来源与大致地域分布；</li>
        <li>Microsoft Clarity（体验分析）：页面点击、滚动与交互热区。</li>
      </ul>
      <p>这些数据通常以匿名或聚合形式呈现，不直接指向您个人。</p>
      <h2>Cookie 与本地存储</h2>
      <p>
        我们使用 Cookie 与类似技术以保障站点基本功能，并支持分析与广告。其中：
      </p>
      <ul>
        <li>必要 Cookie：保障站点正常运行，无法关闭；</li>
        <li>分析 Cookie：来自 Google Analytics 与 Microsoft Clarity，用于了解访问情况；</li>
        <li>广告 Cookie：来自 Google AdSense，用于投放广告并判断是否为您个性化广告（见下节）。</li>
      </ul>
      <h2>广告（Google AdSense）</h2>
      <p>
        本网站使用 Google AdSense 展示广告。Google 及其合作伙伴可能通过 Cookie，在您访问本网站及其他网站时，
        基于您的兴趣投放个性化广告或非个性化广告。
      </p>
      <p>您可以通过以下方式管理广告个性化：</p>
      <ul>
        <li>Google 广告设置：<a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">google.com/settings/ads</a></li>
        <li>About Ads（退出个性化广告）：<a href="https://www.aboutads.info/choices" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">aboutads.info/choices</a></li>
        <li>欧盟用户还可使用 Your Online Choices：<a href="https://www.youronlinechoices.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">youronlinechoices.com</a></li>
      </ul>
      <p>选择退出个性化广告后，您仍可能看到广告，但相关度会降低。</p>
      <h2>第三方链接</h2>
      <p>
        本站包含指向外部产品与服务的链接，其隐私实践由对应方负责，与本政策无关。
      </p>
      <h2>联系我们</h2>
      <p>
        如对本政策有疑问，可通过 <a href="mailto:hello@aoobee.com" className="text-primary hover:underline">hello@aoobee.com</a> 联系我们。
      </p>
    </LegalPage>
  );
}

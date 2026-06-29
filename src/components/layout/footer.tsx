import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "热门行业",
    links: [
      { label: "人工智能", href: "/ren-gong-zhi-neng" },
      { label: "软件开发", href: "/ruan-jian-kai-fa" },
      { label: "电商零售", href: "/dian-shang-ling-shou" },
      { label: "数字营销", href: "/shu-zi-ying-xiao" },
      { label: "设计创意", href: "/she-ji-chuang-yi" },
    ],
  },
  {
    title: "推荐",
    links: [
      { label: "最佳AI工具", href: "/best/ai-gong-ju" },
      { label: "最佳设计工具", href: "/best/she-ji-gong-ju" },
      { label: "最佳CRM", href: "/best/crm" },
      { label: "最佳项目管理", href: "/best/xiang-mu-guan-li" },
    ],
  },
  {
    title: "关于",
    links: [
      { label: "关于我们", href: "/about" },
      { label: "联系我们", href: "/contact" },
      { label: "隐私政策", href: "/privacy" },
      { label: "使用条款", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div>
            <Link href="/" className="text-2xl font-bold text-white">
              AooBee
            </Link>
            <p className="mt-3 text-sm text-gray-400">
              全行业产品与服务平台目录，帮助您发现、比较和选择最佳工具与服务。
            </p>
          </div>

          {/* 链接区域 */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AooBee. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
}

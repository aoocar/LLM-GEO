import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@/components/analytics";

export const metadata: Metadata = {
  title: "AooBee - 全行业产品与服务平台目录",
  description:
    "全行业产品、工具与服务目录，覆盖人工智能、装修、维修、家电、办公、养老、教育、育儿等领域，提供专业评测、对比和推荐，帮助你发现最适合的产品与服务。",
  keywords: [
    "产品目录",
    "工具推荐",
    "行业平台",
    "产品评测",
    "产品对比",
    "最佳工具",
    "SaaS",
    "AI工具",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.aoobee.com"
  ),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "AooBee",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  verification: {
    // google: "your-google-verification-code",
    // baidu: "your-baidu-verification-code",
  },
  other: {
    "google-adsense-account": "ca-pub-8752263153695128",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

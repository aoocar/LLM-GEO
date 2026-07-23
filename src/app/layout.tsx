import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "AooBee - 全行业产品与服务平台目录",
  description:
    "收录各行业产品、工具、服务，提供专业评测、对比和推荐。覆盖 50+ 行业，收录 5000+ 产品，帮助您发现最佳工具和服务。",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

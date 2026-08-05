import Link from "next/link";

export const metadata = {
  title: "页面未找到 - AooBee",
  description: "抱歉，您访问的页面不存在或已被移动。",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="text-5xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-lg text-gray-500">
        抱歉，您访问的页面不存在或已被移动。
      </p>
      <Link
        href="/"
        className="mt-8 inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}

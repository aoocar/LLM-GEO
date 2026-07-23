import Link from "next/link";

export function LegalPage({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-400">
        <Link href="/" className="hover:text-primary">
          首页
        </Link>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mt-4">{title}</h1>
      {description && <p className="mt-2 text-gray-500">{description}</p>}
      {updated && <p className="mt-2 text-xs text-gray-400">最后更新：{updated}</p>}

      <div className="mt-8 prose prose-gray max-w-none space-y-4 text-gray-700">
        {children}
      </div>
    </div>
  );
}

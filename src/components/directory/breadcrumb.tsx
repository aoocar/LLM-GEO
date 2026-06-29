import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({
  items,
}: {
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm text-gray-500 mb-4"
    >
      <Link href="/" className="hover:text-primary transition-colors">
        首页
      </Link>
      {items.map((item, index) => (
        <span key={item.href} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" />
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

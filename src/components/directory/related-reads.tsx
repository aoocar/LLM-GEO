import Link from "next/link";
import { resolveRelated, type RelatedInput } from "@/lib/content/related";

export function RelatedReads({
  items,
  title = "相关阅读",
}: {
  items?: RelatedInput[];
  title?: string;
}) {
  const resolved = resolveRelated(items);
  if (resolved.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resolved.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

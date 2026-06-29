// FAQ 组件 - 用于 GEO 优化
export function FaqSection({
  items,
  title = "常见问题",
}: {
  items: Array<{ question: string; answer: string }>;
  title?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <details
            key={index}
            className="group bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer px-6 py-4
                                font-medium text-gray-900 hover:bg-gray-50 transition-colors">
              <span>{item.question}</span>
              <ChevronIcon />
            </summary>
            <div className="px-6 pb-4 text-gray-600 leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

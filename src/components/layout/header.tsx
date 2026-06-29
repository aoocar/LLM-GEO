"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "首页", href: "/" },
  { label: "行业分类", href: "/categories" },
  { label: "最佳推荐", href: "/best" },
  { label: "指南", href: "/guide" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-bold text-primary">AooBee</span>
            <span className="hidden sm:inline text-sm text-gray-500">
              全行业平台
            </span>
          </Link>

          {/* 搜索框 - 桌面端 */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form action="/search" method="GET" className="relative w-full">
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索产品、工具、服务..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary focus:border-transparent
                           text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
          </div>

          {/* 导航 - 桌面端 */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-primary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 移动端菜单 */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            {/* 移动端搜索 */}
            <form action="/search" method="GET" className="relative mb-4">
              <input
                type="text"
                name="q"
                placeholder="搜索产品、工具、服务..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
            {/* 移动端导航 */}
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary
                             hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

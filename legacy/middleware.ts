import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只保护管理后台页面和 API
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin/")) {
    // 排除登录 API 本身
    if (pathname === "/api/admin/auth" || pathname === "/api/admin/logout") {
      return NextResponse.next();
    }

    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      // 未登录：API 返回 401，页面返回登录页
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      // 重定向到 admin 根路径（登录页会自动显示）
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

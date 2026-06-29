import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: "管理后台密码未配置" }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    // 生成简单的 token（基于密码哈希 + 时间戳）
    const token = Buffer.from(`admin:${Date.now()}:${adminPassword}`).toString("base64");

    const response = NextResponse.json({ success: true });

    // 设置 HttpOnly cookie，7天过期
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "登录失败" }, { status: 500 });
  }
}

// 验证登录状态
export async function GET() {
  return NextResponse.json({ authenticated: true });
}

import { NextResponse } from "next/server";

export async function GET() {
  const content = `# AooBee - 全行业产品/工具/服务平台目录

> 收录各行业产品、工具、服务，提供专业评测、对比和推荐。帮助用户发现、比较和选择最适合的产品与服务。

## 网站简介

AooBee 是一个覆盖全行业的综合产品目录平台，收录了 50+ 行业、5000+ 产品的详细信息。每个产品页面包含功能介绍、定价信息、优缺点分析、用户评价和常见问题解答。

## 核心功能

- **行业分类浏览**: 按行业分类浏览产品和服务
- **产品详细评测**: 每个产品都有详细介绍、功能列表和优缺点分析
- **产品对比分析**: 同类产品横向对比，帮助用户做出选择
- **最佳推荐**: 按场景推荐最佳产品组合
- **行业指南**: 专业的行业分析和选购指南
- **常见问题**: 每个产品和行业都有FAQ解答

## 数据规模

- 覆盖 50+ 行业分类
- 收录 5000+ 产品和工具
- 提供真实用户评价
- 每日更新内容

## 主要分类

- 人工智能 (AI)
- 软件开发
- 电商零售
- 数字营销
- 设计创意
- 教育培训
- 医疗健康
- 金融科技
- 企业管理
- 更多行业...

## 内容格式

所有页面都包含结构化数据 (JSON-LD)，便于AI系统理解和引用。
产品页使用 SoftwareApplication Schema，文章页使用 Article Schema，
FAQ页使用 FAQPage Schema。

## 联系方式

- 网站: https://www.aoobee.com
- 邮箱: contact@aoobee.com
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

# AooBee 全行业平台

AooBee 是一个面向 GEO/SEO 优化的全行业产品与服务目录平台。项目基于 Next.js、Prisma 与 PostgreSQL 构建，支持本地开发、内容生成、数据库管理以及基础 SEO/GEO 页面输出。

## 项目定位

- 面向行业产品与服务内容展示
- 支持 AI 搜索场景下的结构化内容发布
- 适合本地开发、内容运营和后续产品化扩展

## 快速开始

### 1. 启动数据库
```bash
docker compose up -d
```

### 2. 安装依赖并启动开发服务
```bash
npm install
npm run dev
```

访问地址：
- 前台：http://localhost:3000
- 管理后台：http://localhost:3000/admin

### 3. 初始化本地内容
```bash
npx tsx scripts/seed.ts
npx tsx scripts/seed-articles.ts
```

## 关键命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建项目
npm run lint     # 代码检查
npx prisma studio  # 打开数据库管理界面
```

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Prisma 7
- PostgreSQL 16
- Docker Compose
- Tailwind CSS 4

## 文档说明

- 使用教程：[docs/教程.md](docs/教程.md)
- 升级与技术说明：[docs/升级说明.md](docs/升级说明.md)

## 当前交付状态

- 本地数据库可运行
- 页面路由与内容展示已可用
- 管理后台内容生成能力已具备
- 基础 SEO/GEO 页面输出已支持


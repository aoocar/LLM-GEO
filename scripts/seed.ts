import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 开始填充种子数据...\n");

  // ========== 清空数据 ==========
  await db.review.deleteMany();
  await db.article.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  console.log("✅ 已清空旧数据");

  // ========== 创建行业分类 ==========
  const categories = await Promise.all([
    db.category.create({ data: { name: "人工智能", slug: "ren-gong-zhi-neng", icon: "🤖", description: "AI 工具、机器学习、自然语言处理、计算机视觉等产品和服务", sortOrder: 1 } }),
    db.category.create({ data: { name: "软件开发", slug: "ruan-jian-kai-fa", icon: "💻", description: "开发工具、IDE、代码托管、CI/CD、低代码平台等", sortOrder: 2 } }),
    db.category.create({ data: { name: "电商零售", slug: "dian-shang-ling-shou", icon: "🛒", description: "电商平台、店铺管理、支付系统、供应链管理等", sortOrder: 3 } }),
    db.category.create({ data: { name: "数字营销", slug: "shu-zi-ying-xiao", icon: "📢", description: "SEO工具、广告平台、社交媒体管理、邮件营销等", sortOrder: 4 } }),
    db.category.create({ data: { name: "设计创意", slug: "she-ji-chuang-yi", icon: "🎨", description: "UI/UX设计、图片编辑、视频制作、3D建模等", sortOrder: 5 } }),
    db.category.create({ data: { name: "企业管理", slug: "qi-ye-guan-li", icon: "📊", description: "ERP、CRM、HR、OA、项目管理、协作工具等", sortOrder: 6 } }),
    db.category.create({ data: { name: "教育培训", slug: "jiao-yu-pei-xun", icon: "📚", description: "在线学习、课程平台、知识管理、考试系统等", sortOrder: 7 } }),
    db.category.create({ data: { name: "金融科技", slug: "jin-rong-ke-ji", icon: "💰", description: "支付、区块链、量化交易、保险科技、风控等", sortOrder: 8 } }),
  ]);
  console.log(`✅ 创建 ${categories.length} 个行业分类`);

  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

  // ========== 创建产品 ==========
  const productsData = [
    // ---- 人工智能 ----
    { name: "ChatGPT", slug: "chatgpt", description: "OpenAI 推出的 AI 对话助手，支持文本生成、代码编写、问答等多种任务，是目前最流行的 AI 工具", categorySlug: "ren-gong-zhi-neng", pricing: "免费增值", rating: 4.8, reviewCount: 2400, company: "OpenAI", founded: "2022", location: "美国旧金山", tags: ["AI对话", "文本生成", "代码"], useCases: ["内容创作", "编程辅助", "学术研究", "翻译", "日常问答"], monthlyTraffic: 1800000000 },
    { name: "Claude", slug: "claude", description: "Anthropic 推出的 AI 助手，擅长长文本理解、深度推理和代码分析", categorySlug: "ren-gong-zhi-neng", pricing: "免费增值", rating: 4.7, reviewCount: 1200, company: "Anthropic", founded: "2021", location: "美国旧金山", tags: ["AI对话", "长文本", "推理"], useCases: ["长文分析", "代码审查", "研究报告", "创意写作"], monthlyTraffic: 600000000 },
    { name: "Midjourney", slug: "midjourney", description: "AI 图像生成工具，通过文字描述生成高质量艺术图片和设计素材", categorySlug: "ren-gong-zhi-neng", pricing: "付费", rating: 4.6, reviewCount: 800, company: "Midjourney", founded: "2022", location: "美国旧金山", tags: ["AI绘画", "图像生成", "设计"], useCases: ["概念设计", "插画创作", "营销素材", "游戏美术"], monthlyTraffic: 300000000 },
    { name: "文心一言", slug: "wenxin-yiyan", description: "百度推出的 AI 大模型对话产品，中文理解能力强，深度集成百度生态", categorySlug: "ren-gong-zhi-neng", pricing: "免费", rating: 4.3, reviewCount: 600, company: "百度", founded: "2023", location: "中国北京", tags: ["AI对话", "中文", "百度"], useCases: ["中文写作", "信息查询", "创意生成", "学习辅导"], monthlyTraffic: 200000000 },
    { name: "GitHub Copilot", slug: "github-copilot", description: "GitHub 推出的 AI 编程助手，基于 OpenAI 模型，提供实时代码建议和自动补全", categorySlug: "ren-gong-zhi-neng", pricing: "付费", rating: 4.5, reviewCount: 1500, company: "GitHub", founded: "2021", location: "美国旧金山", tags: ["AI编程", "代码补全", "GitHub"], useCases: ["代码编写", "代码审查", "学习编程", "调试"], monthlyTraffic: 150000000 },
    { name: "通义千问", slug: "tongyi-qianwen", description: "阿里巴巴推出的 AI 大模型，支持多种应用场景，与阿里云深度集成", categorySlug: "ren-gong-zhi-neng", pricing: "免费", rating: 4.2, reviewCount: 500, company: "阿里巴巴", founded: "2023", location: "中国杭州", tags: ["AI对话", "阿里云", "中文"], useCases: ["企业应用", "代码生成", "文档处理", "数据分析"], monthlyTraffic: 180000000 },

    // ---- 软件开发 ----
    { name: "VS Code", slug: "vscode", description: "微软推出的免费开源代码编辑器，支持海量扩展，是全球最流行的开发工具", categorySlug: "ruan-jian-kai-fa", pricing: "免费", rating: 4.8, reviewCount: 3500, company: "Microsoft", founded: "2015", location: "美国雷德蒙德", tags: ["代码编辑器", "IDE", "开源"], useCases: ["前端开发", "后端开发", "数据分析", "DevOps"], monthlyTraffic: 500000000 },
    { name: "Vercel", slug: "vercel", description: "现代 Web 应用部署平台，深度支持 Next.js，提供全球 CDN 和无服务器函数", categorySlug: "ruan-jian-kai-fa", pricing: "免费增值", rating: 4.6, reviewCount: 800, company: "Vercel", founded: "2015", location: "美国旧金山", tags: ["部署", "Next.js", "CDN"], useCases: ["网站部署", "前端托管", "API部署", "预览环境"], monthlyTraffic: 120000000 },
    { name: "GitHub", slug: "github", description: "全球最大的代码托管和协作开发平台，支持 Git 版本控制和项目管理", categorySlug: "ruan-jian-kai-fa", pricing: "免费增值", rating: 4.7, reviewCount: 5000, company: "GitHub", founded: "2008", location: "美国旧金山", tags: ["代码托管", "Git", "协作"], useCases: ["代码管理", "团队协作", "开源项目", "CI/CD"], monthlyTraffic: 1200000000 },
    { name: "Cursor", slug: "cursor", description: "AI 原生代码编辑器，基于 VS Code 构建，深度集成 AI 编程能力", categorySlug: "ruan-jian-kai-fa", pricing: "免费增值", rating: 4.5, reviewCount: 600, company: "Anysphere", founded: "2023", location: "美国旧金山", tags: ["AI编程", "代码编辑器", "AI原生"], useCases: ["AI辅助编程", "代码生成", "代码重构", "调试"], monthlyTraffic: 80000000 },
    { name: "Docker", slug: "docker", description: "容器化平台，标准化应用打包和部署，是 DevOps 和微服务架构的基础工具", categorySlug: "ruan-jian-kai-fa", pricing: "免费增值", rating: 4.5, reviewCount: 2800, company: "Docker", founded: "2013", location: "美国旧金山", tags: ["容器", "DevOps", "部署"], useCases: ["应用部署", "开发环境", "微服务", "CI/CD"], monthlyTraffic: 200000000 },

    // ---- 电商零售 ----
    { name: "Shopify", slug: "shopify", description: "全球领先的电商建站平台，提供完整的网店搭建、支付、物流和营销解决方案", categorySlug: "dian-shang-ling-shou", pricing: "付费", rating: 4.5, reviewCount: 3200, company: "Shopify", founded: "2006", location: "加拿大渥太华", tags: ["电商建站", "独立站", "SaaS"], useCases: ["独立站建站", "跨境电商", "品牌官网", "多渠道销售"], monthlyTraffic: 500000000 },
    { name: "有赞", slug: "youzan", description: "中国领先的电商 SaaS 平台，帮助商家在微信、小程序等渠道开店和运营", categorySlug: "dian-shang-ling-shou", pricing: "付费", rating: 4.2, reviewCount: 1800, company: "有赞", founded: "2012", location: "中国杭州", tags: ["电商SaaS", "微信电商", "小程序"], useCases: ["微信开店", "私域运营", "会员管理", "直播带货"], monthlyTraffic: 50000000 },
    { name: "WooCommerce", slug: "woocommerce", description: "WordPress 电商插件，开源免费，适合中小型商家快速搭建在线商店", categorySlug: "dian-shang-ling-shou", pricing: "免费", rating: 4.3, reviewCount: 2500, company: "Automattic", founded: "2011", location: "美国旧金山", tags: ["WordPress", "电商插件", "开源"], useCases: ["小型网店", "WordPress电商", "数字产品销售"], monthlyTraffic: 300000000 },
    { name: "抖音电商", slug: "douyin-ecommerce", description: "字节跳动旗下的兴趣电商平台，通过短视频和直播带货，覆盖海量用户", categorySlug: "dian-shang-ling-shou", pricing: "免费", rating: 4.1, reviewCount: 1500, company: "字节跳动", founded: "2020", location: "中国北京", tags: ["直播电商", "短视频", "兴趣电商"], useCases: ["直播带货", "短视频营销", "品牌推广", "达人合作"], monthlyTraffic: 600000000 },

    // ---- 数字营销 ----
    { name: "SEMrush", slug: "semrush", description: "综合数字营销工具，涵盖 SEO、SEM、社交媒体分析、竞品研究等全方位功能", categorySlug: "shu-zi-ying-xiao", pricing: "付费", rating: 4.4, reviewCount: 960, company: "SEMrush", founded: "2008", location: "美国波士顿", tags: ["SEO", "SEM", "竞品分析"], useCases: ["关键词研究", "竞品分析", "广告优化", "内容营销"], monthlyTraffic: 100000000 },
    { name: "Google Ads", slug: "google-ads", description: "谷歌广告平台，全球最大的搜索引擎广告系统，覆盖搜索、展示、视频等多种广告形式", categorySlug: "shu-zi-ying-xiao", pricing: "按需定价", rating: 4.3, reviewCount: 4500, company: "Google", founded: "2000", location: "美国山景城", tags: ["广告投放", "搜索引擎", "PPC"], useCases: ["搜索广告", "展示广告", "YouTube广告", "购物广告"], monthlyTraffic: 800000000 },
    { name: "HubSpot", slug: "hubspot", description: "集营销、销售、客服于一体的 CRM 平台，提供全渠道营销自动化解决方案", categorySlug: "shu-zi-ying-xiao", pricing: "免费增值", rating: 4.5, reviewCount: 1800, company: "HubSpot", founded: "2006", location: "美国剑桥", tags: ["CRM", "营销自动化", "SaaS"], useCases: ["邮件营销", "线索管理", "内容管理", "销售管道"], monthlyTraffic: 150000000 },
    { name: "巨量引擎", slug: "juliang", description: "字节跳动旗下的广告营销平台，覆盖抖音、今日头条等海量流量", categorySlug: "shu-zi-ying-xiao", pricing: "按需定价", rating: 4.2, reviewCount: 1200, company: "字节跳动", founded: "2014", location: "中国北京", tags: ["信息流广告", "抖音", "今日头条"], useCases: ["信息流广告", "品牌推广", "效果营销", "直播推广"], monthlyTraffic: 500000000 },

    // ---- 设计创意 ----
    { name: "Figma", slug: "figma", description: "在线协作设计工具，支持 UI/UX 设计、原型制作和团队实时协作", categorySlug: "she-ji-chuang-yi", pricing: "免费增值", rating: 4.9, reviewCount: 1500, company: "Figma", founded: "2012", location: "美国旧金山", tags: ["UI设计", "UX设计", "协作"], useCases: ["UI设计", "原型制作", "设计系统", "团队协作"], monthlyTraffic: 200000000 },
    { name: "Canva", slug: "canva", description: "在线图形设计平台，提供海量模板，让非专业设计师也能轻松制作精美图片", categorySlug: "she-ji-chuang-yi", pricing: "免费增值", rating: 4.7, reviewCount: 3000, company: "Canva", founded: "2012", location: "澳大利亚悉尼", tags: ["平面设计", "模板", "在线设计"], useCases: ["社交媒体图片", "演示文稿", "海报设计", "Logo设计"], monthlyTraffic: 400000000 },
    { name: "Adobe Creative Cloud", slug: "adobe-cc", description: "Adobe 全家桶，包含 Photoshop、Illustrator、Premiere Pro 等专业创意工具", categorySlug: "she-ji-chuang-yi", pricing: "付费", rating: 4.6, reviewCount: 4000, company: "Adobe", founded: "1982", location: "美国圣何塞", tags: ["专业设计", "图片编辑", "视频剪辑"], useCases: ["图片处理", "矢量设计", "视频剪辑", "排版印刷"], monthlyTraffic: 350000000 },
    { name: "即时设计", slug: "jsdesign", description: "国产 UI 设计工具，功能对标 Figma，支持中文和本地化需求", categorySlug: "she-ji-chuang-yi", pricing: "免费增值", rating: 4.4, reviewCount: 500, company: "即时设计", founded: "2020", location: "中国上海", tags: ["UI设计", "国产", "协作"], useCases: ["UI设计", "原型制作", "设计交付", "团队协作"], monthlyTraffic: 20000000 },

    // ---- 企业管理 ----
    { name: "Notion", slug: "notion", description: "集笔记、知识库、项目管理于一体的协作平台，灵活性极高", categorySlug: "qi-ye-guan-li", pricing: "免费增值", rating: 4.7, reviewCount: 1800, company: "Notion", founded: "2013", location: "美国旧金山", tags: ["笔记", "知识库", "项目管理"], useCases: ["团队协作", "知识管理", "项目跟踪", "个人笔记"], monthlyTraffic: 300000000 },
    { name: "飞书", slug: "feishu", description: "字节跳动旗下的企业协作平台，集成即时通讯、文档、日历、视频会议等功能", categorySlug: "qi-ye-guan-li", pricing: "免费增值", rating: 4.5, reviewCount: 1200, company: "字节跳动", founded: "2016", location: "中国北京", tags: ["企业协作", "即时通讯", "文档"], useCases: ["团队沟通", "文档协作", "视频会议", "审批流程"], monthlyTraffic: 100000000 },
    { name: "Salesforce", slug: "salesforce", description: "全球领先的 CRM 平台，提供销售、服务、营销、分析等全方位企业管理解决方案", categorySlug: "qi-ye-guan-li", pricing: "付费", rating: 4.4, reviewCount: 3500, company: "Salesforce", founded: "1999", location: "美国旧金山", tags: ["CRM", "销售管理", "企业级"], useCases: ["客户管理", "销售自动化", "营销自动化", "服务支持"], monthlyTraffic: 250000000 },
    { name: "钉钉", slug: "dingtalk", description: "阿里巴巴旗下的企业通讯和协作平台，覆盖即时通讯、OA、审批、考勤等", categorySlug: "qi-ye-guan-li", pricing: "免费增值", rating: 4.2, reviewCount: 2500, company: "阿里巴巴", founded: "2014", location: "中国杭州", tags: ["企业通讯", "OA", "考勤"], useCases: ["企业沟通", "审批管理", "考勤打卡", "视频会议"], monthlyTraffic: 200000000 },
    { name: "Jira", slug: "jira", description: "Atlassian 旗下的项目管理和问题跟踪工具，是敏捷开发团队的首选", categorySlug: "qi-ye-guan-li", pricing: "免费增值", rating: 4.3, reviewCount: 2000, company: "Atlassian", founded: "2002", location: "澳大利亚悉尼", tags: ["项目管理", "敏捷开发", "Bug跟踪"], useCases: ["敏捷开发", "Bug跟踪", "Sprint管理", "需求管理"], monthlyTraffic: 150000000 },

    // ---- 教育培训 ----
    { name: "Coursera", slug: "coursera", description: "全球最大的在线学习平台之一，提供来自顶尖大学和企业的课程和学位项目", categorySlug: "jiao-yu-pei-xun", pricing: "免费增值", rating: 4.5, reviewCount: 2000, company: "Coursera", founded: "2012", location: "美国山景城", tags: ["在线课程", "学位", "职业证书"], useCases: ["职业技能提升", "学位学习", "企业培训", "个人成长"], monthlyTraffic: 120000000 },
    { name: "中国大学MOOC", slug: "icourse163", description: "网易与高教社合作的在线教育平台，汇集中国顶尖高校的优质课程", categorySlug: "jiao-yu-pei-xun", pricing: "免费", rating: 4.3, reviewCount: 1500, company: "网易", founded: "2014", location: "中国杭州", tags: ["MOOC", "高校课程", "免费"], useCases: ["大学课程学习", "考研备考", "技能学习", "兴趣学习"], monthlyTraffic: 50000000 },
    { name: "网易云课堂", slug: "study-163", description: "网易旗下的实用技能学习平台，涵盖编程、设计、职场、生活等各类课程", categorySlug: "jiao-yu-pei-xun", pricing: "免费增值", rating: 4.1, reviewCount: 1200, company: "网易", founded: "2012", location: "中国杭州", tags: ["技能培训", "编程", "设计"], useCases: ["编程学习", "设计学习", "职场技能", "考证备考"], monthlyTraffic: 30000000 },

    // ---- 金融科技 ----
    { name: "Stripe", slug: "stripe", description: "全球领先的在线支付基础设施，为互联网企业提供简洁的支付 API 和解决方案", categorySlug: "jin-rong-ke-ji", pricing: "按需定价", rating: 4.7, reviewCount: 1800, company: "Stripe", founded: "2010", location: "美国旧金山", tags: ["支付", "API", "在线支付"], useCases: ["在线支付", "订阅计费", "跨境支付", "平台支付"], monthlyTraffic: 300000000 },
    { name: "支付宝", slug: "alipay", description: "蚂蚁集团旗下的数字支付平台，中国最大的第三方支付工具，覆盖支付、理财、保险等", categorySlug: "jin-rong-ke-ji", pricing: "免费", rating: 4.5, reviewCount: 5000, company: "蚂蚁集团", founded: "2004", location: "中国杭州", tags: ["移动支付", "理财", "生活服务"], useCases: ["移动支付", "理财投资", "生活缴费", "信用评估"], monthlyTraffic: 1000000000 },
    { name: "微信支付", slug: "wechat-pay", description: "腾讯旗下的移动支付工具，深度集成微信生态，覆盖线上线下各种支付场景", categorySlug: "jin-rong-ke-ji", pricing: "免费", rating: 4.5, reviewCount: 4500, company: "腾讯", founded: "2013", location: "中国深圳", tags: ["移动支付", "微信", "小程序支付"], useCases: ["扫码支付", "小程序支付", "红包转账", "商户收款"], monthlyTraffic: 1100000000 },
  ];

  const products = [];
  for (const p of productsData) {
    const product = await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: catMap[p.categorySlug],
        pricing: p.pricing,
        rating: p.rating,
        reviewCount: p.reviewCount,
        company: p.company,
        founded: p.founded,
        location: p.location,
        tags: p.tags,
        useCases: p.useCases,
        monthlyTraffic: p.monthlyTraffic,
        status: "ACTIVE",
        publishedAt: new Date(),
        pros: getDefaultPros(p.name),
        cons: getDefaultCons(p.name),
        features: getDefaultFeatures(p.name),
      },
    });
    products.push(product);
  }
  console.log(`✅ 创建 ${products.length} 个产品`);

  // ========== 创建评价 ==========
  const reviewAuthors = ["张三", "李四", "王五", "赵六", "小明", "小红", "产品经理老王", "开发者小李", "设计师阿花", "运营达人"];
  let reviewCount = 0;
  for (const product of products) {
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      await db.review.create({
        data: {
          productId: product.id,
          author: reviewAuthors[Math.floor(Math.random() * reviewAuthors.length)],
          rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
          content: getReviewContent(product.name),
          verified: Math.random() > 0.3,
          pros: ["功能强大", "体验好"],
          cons: ["价格偏高"],
        },
      });
      reviewCount++;
    }
  }
  console.log(`✅ 创建 ${reviewCount} 条评价`);

  // ========== 创建文章 ==========
  const articlesData = [
    { title: "2026年十大AI写作工具推荐", slug: "ai-xie-zuo-gong-ju", type: "BEST", categoryId: catMap["ren-gong-zhi-neng"], excerpt: "精选2026年最值得使用的10款AI写作工具", keywords: ["AI写作", "写作工具", "2026推荐"], content: "## AI写作工具正在改变内容创作的方式\n\n从博客文章到营销文案，AI写作助手可以大幅提升写作效率..." },
    { title: "ChatGPT vs Claude：最强AI助手全面对比", slug: "chatgpt-vs-claude", type: "COMPARISON", categoryId: catMap["ren-gong-zhi-neng"], excerpt: "ChatGPT和Claude深度对比分析", keywords: ["ChatGPT", "Claude", "AI对比"], content: "## 产品概述\n\nChatGPT和Claude是目前最受欢迎的两款AI对话助手..." },
    { title: "如何选择适合你的项目管理工具", slug: "ruhe-xuanze-xiangmu-guanli-gongju", type: "GUIDE", categoryId: catMap["qi-ye-guan-li"], excerpt: "项目管理工具选购完全指南", keywords: ["项目管理", "工具选择", "团队协作"], content: "## 为什么需要项目管理工具？\n\n在快节奏的工作环境中，一个合适的项目管理工具可以大幅提升团队效率..." },
    { title: "跨境电商独立站建站完全指南", slug: "kuajing-dianshan-jianzhan-zhinan", type: "GUIDE", categoryId: catMap["dian-shang-ling-shou"], excerpt: "从零开始搭建跨境电商独立站", keywords: ["跨境电商", "独立站", "建站指南"], content: "## 什么是跨境电商独立站？\n\n跨境电商独立站是指商家自建的电商网站..." },
    { title: "2026年最佳UI设计工具对比", slug: "ui-sheji-gongju-duibi", type: "COMPARISON", categoryId: catMap["she-ji-chuang-yi"], excerpt: "Figma vs 即时设计 vs Adobe XD全面对比", keywords: ["UI设计", "设计工具", "Figma"], content: "## 设计工具选择指南\n\n选择合适的UI设计工具对于设计团队的工作效率至关重要..." },
    { title: "企业数字化转型必备工具清单", slug: "qiye-shuzihua-zhuanxing-gongju", type: "LISTICLE", categoryId: catMap["qi-ye-guan-li"], excerpt: "企业数字化转型不可或缺的10类工具", keywords: ["数字化转型", "企业工具", "SaaS"], content: "## 数字化转型的核心工具\n\n企业数字化转型需要从多个维度进行工具升级..." },
    { title: "SEO入门指南：从零开始学搜索引擎优化", slug: "seo-rumen-zhinan", type: "HOW_TO", categoryId: catMap["shu-zi-ying-xiao"], excerpt: "SEO基础知识和实操指南", keywords: ["SEO", "搜索引擎优化", "入门指南"], content: "## 什么是SEO？\n\nSEO（Search Engine Optimization）即搜索引擎优化..." },
    { title: "在线教育平台哪个好？主流平台深度评测", slug: "zaixian-jiaoyu-pingtai-pingce", type: "REVIEW", categoryId: catMap["jiao-yu-pei-xun"], excerpt: "主流在线教育平台深度对比评测", keywords: ["在线教育", "学习平台", "MOOC"], content: "## 在线教育平台概览\n\n随着在线教育的蓬勃发展，越来越多的学习者选择在线平台..." },
  ];

  for (const a of articlesData) {
    await db.article.create({
      data: {
        ...a,
        type: a.type as "BEST" | "COMPARISON" | "GUIDE" | "REVIEW" | "LISTICLE" | "HOW_TO" | "FAQ",
        authorName: "AooBee 编辑部",
        keywords: a.keywords,
        readTime: 8 + Math.floor(Math.random() * 12),
        wordCount: 2000 + Math.floor(Math.random() * 3000),
        published: true,
        publishedAt: new Date(),
        metaTitle: a.title + " | AooBee",
        metaDesc: a.excerpt,
        faqItems: [
          { question: `什么是${a.title.split(/[：|]/)[0]}？`, answer: "这是一篇关于该主题的详细介绍文章。" },
          { question: `如何选择合适的工具？`, answer: "建议根据实际需求、预算和团队规模来选择。" },
        ],
      },
    });
  }
  console.log(`✅ 创建 ${articlesData.length} 篇文章`);

  console.log("\n🎉 种子数据填充完成！");
  console.log(`   - ${categories.length} 个行业分类`);
  console.log(`   - ${products.length} 个产品`);
  console.log(`   - ${reviewCount} 条评价`);
  console.log(`   - ${articlesData.length} 篇文章`);
}

// ========== 辅助函数 ==========
function getDefaultPros(name: string): string[] {
  return [`${name}功能全面，覆盖面广`, "用户体验良好", "社区活跃", "文档完善", "持续更新迭代"];
}
function getDefaultCons(name: string): string[] {
  return ["高级功能需要付费", "学习曲线有一定门槛", "国内访问可能不稳定"];
}
function getDefaultFeatures(name: string) {
  return [
    { name: "核心功能", description: `${name}的主要功能模块` },
    { name: "协作支持", description: "支持团队协作和实时同步" },
    { name: "API接口", description: "提供开放API便于集成" },
    { name: "数据安全", description: "企业级数据安全保障" },
    { name: "多平台支持", description: "支持Web、移动端和桌面端" },
    { name: "插件扩展", description: "丰富的插件和扩展生态" },
  ];
}
function getReviewContent(product: string): string {
  const templates = [
    `${product}是一款非常出色的工具，我们团队已经使用了半年多，整体体验很好。功能全面，上手也比较快。`,
    `使用${product}之后工作效率提升了很多，特别是协作功能非常实用。推荐给需要的团队。`,
    `${product}的性价比很高，免费版就能满足大部分需求。付费版的高级功能也很值得。`,
    `对比了多款同类产品后选择了${product}，目前来看是最适合我们团队的选择。`,
    `${product}的UI设计很美观，操作也很流畅。客服响应速度也很快，给个好评。`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

main()
  .catch((e) => { console.error("❌ 种子数据填充失败:", e); process.exit(1); })
  .finally(() => db.$disconnect());

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
    db.category.create({ data: { name: "装修", slug: "zhuang-xiu", icon: "🛠️", description: "装修设计、施工、家居材料、整装服务等", sortOrder: 9 } }),
    db.category.create({ data: { name: "家电", slug: "jia-dian", icon: "🧺", description: "家用电器、厨房电器、智能家居、家电安装服务等", sortOrder: 10 } }),
    db.category.create({ data: { name: "办公", slug: "bangong", icon: "💼", description: "办公家具、办公软件、会议设备、企业办公服务等", sortOrder: 11 } }),
    db.category.create({ data: { name: "教育", slug: "jiao-yu", icon: "🎓", description: "教育机构、培训课程、学习平台、教育服务等", sortOrder: 12 } }),
    db.category.create({ data: { name: "老年", slug: "lao-nian", icon: "👵", description: "老年健康、养老服务、适老家居、医疗陪护等", sortOrder: 13 } }),
    db.category.create({ data: { name: "育儿", slug: "yu-er", icon: "🧸", description: "母婴用品、育儿服务、早教产品、亲子服务等", sortOrder: 14 } }),
    db.category.create({ data: { name: "上门维修安装", slug: "shang-men-weixiu-an-zhuang", icon: "🔧", description: "上门维修、安装服务、家电维修、管道维修等", sortOrder: 15 } }),
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

    // ---- 装修 ----
    { name: "美家整装", slug: "meijia-zhengzhuang", description: "提供全屋整装设计、主材搭配与施工交付的一站式家装服务平台，适合新房装修和旧房翻新。", categorySlug: "zhuang-xiu", pricing: "报价制", rating: 4.6, reviewCount: 1800, company: "美家整装", founded: "2013", location: "中国深圳", tags: ["整装服务", "家装设计", "施工交付"], useCases: ["新房装修", "旧房翻新", "全屋定制", "设计搭配"], monthlyTraffic: 95000000 },
    { name: "土巴兔", slug: "tubatu", description: "连接装修公司、设计师和家装材料商，提供在线报价与施工管理服务。", categorySlug: "zhuang-xiu", pricing: "免费", rating: 4.4, reviewCount: 2400, company: "土巴兔", founded: "2010", location: "中国北京", tags: ["家装平台", "装修报价", "施工管理"], useCases: ["装修招标", "工长对接", "材料采购", "家装监理"], monthlyTraffic: 280000000 },
    { name: "齐家网", slug: "qijia", description: "集成装修案例、设计灵感、材料选购和装修攻略，适合家庭装修前期决策。", categorySlug: "zhuang-xiu", pricing: "免费", rating: 4.3, reviewCount: 1600, company: "齐家网", founded: "2005", location: "中国杭州", tags: ["装修案例", "家居灵感", "装修攻略"], useCases: ["空间设计", "预算测算", "选材参考", "风格参考"], monthlyTraffic: 220000000 },

    // ---- 家电 ----
    { name: "美的", slug: "midea", description: "覆盖空调、冰箱、洗衣机、厨电等多个品类的家电制造与智能家居品牌。", categorySlug: "jia-dian", pricing: "中高端", rating: 4.7, reviewCount: 3600, company: "美的集团", founded: "1968", location: "中国佛山", tags: ["空调", "冰箱", "智能家居"], useCases: ["厨房电器", "家居控制", "节能家电", "智能家居"], monthlyTraffic: 520000000 },
    { name: "海尔", slug: "haier", description: "以智能厨房和智慧家庭解决方案为核心，覆盖高端家电与物联网产品。", categorySlug: "jia-dian", pricing: "中高端", rating: 4.6, reviewCount: 3300, company: "海尔智家", founded: "1984", location: "中国青岛", tags: ["智能家居", "厨电", "洗衣机"], useCases: ["智能家居", "大件家电", "厨房设备", "节能控制"], monthlyTraffic: 480000000 },
    { name: "小米智家", slug: "xiaomi-smarthome", description: "通过智能硬件和生态连接，提供便捷的家居控制与场景联动体验。", categorySlug: "jia-dian", pricing: "中端", rating: 4.5, reviewCount: 2800, company: "小米", founded: "2010", location: "中国北京", tags: ["智能家居", "IoT", "场景联动"], useCases: ["灯光控制", "安防联动", "家电联动", "语音控制"], monthlyTraffic: 410000000 },

    // ---- 办公 ----
    { name: "微软 365", slug: "microsoft-365", description: "集成 Word、Excel、Teams 与云端协作能力的企业办公生产力平台。", categorySlug: "bangong", pricing: "付费", rating: 4.8, reviewCount: 4200, company: "Microsoft", founded: "2011", location: "美国雷德蒙德", tags: ["办公软件", "协作", "云端文档"], useCases: ["文档协作", "会议管理", "日程安排", "企业办公"], monthlyTraffic: 700000000 },
    { name: "企业微信", slug: "qiye-weixin", description: "面向企业的即时通讯与协同平台，适合企业内部沟通、审批和客户关系管理。", categorySlug: "bangong", pricing: "免费增值", rating: 4.5, reviewCount: 2600, company: "腾讯", founded: "2012", location: "中国深圳", tags: ["企业通讯", "审批", "协同"], useCases: ["群聊管理", "工作流审批", "客户沟通", "团队协作"], monthlyTraffic: 320000000 },
    { name: "罗技办公设备", slug: "logitech-office", description: "提供键鼠、会议设备、摄像头等办公硬件解决方案，适合远程办公场景。", categorySlug: "bangong", pricing: "中高端", rating: 4.4, reviewCount: 1500, company: "Logitech", founded: "1981", location: "瑞士", tags: ["办公设备", "会议设备", "键鼠"], useCases: ["远程办公", "视频会议", "办公硬件", "桌面管理"], monthlyTraffic: 180000000 },

    // ---- 教育 ----
    { name: "学而思", slug: "xueersi", description: "面向K12和素质教育的培训机构与课程平台，提供一站式学习服务。", categorySlug: "jiao-yu", pricing: "收费", rating: 4.6, reviewCount: 3000, company: "学而思", founded: "2007", location: "中国北京", tags: ["教育培训", "K12", "课程"], useCases: ["课外辅导", "学习提升", "素质教育", "考试备考"], monthlyTraffic: 250000000 },
    { name: "小猿搜题", slug: "xiaoyuan-suoti", description: "以作业答疑与学习辅助为核心的教育工具，帮助学生提高学习效率。", categorySlug: "jiao-yu", pricing: "免费增值", rating: 4.4, reviewCount: 1800, company: "腾讯", founded: "2016", location: "中国深圳", tags: ["学习工具", "作业答疑", "AI教育"], useCases: ["课后答疑", "学习辅助", "题库练习", "家长陪伴"], monthlyTraffic: 140000000 },
    { name: "腾讯课堂", slug: "tencent-class", description: "提供在线课程、直播教学和企业培训能力的教育与培训平台。", categorySlug: "jiao-yu", pricing: "免费增值", rating: 4.3, reviewCount: 2200, company: "腾讯", founded: "2017", location: "中国深圳", tags: ["在线课程", "直播课堂", "企业培训"], useCases: ["职业培训", "直播教学", "企业培训", "兴趣学习"], monthlyTraffic: 160000000 },

    // ---- 老年 ----
    { name: "康养无忧", slug: "kangyang-wuyou", description: "集成养老服务、陪护安排和居家照护服务的适老平台。", categorySlug: "lao-nian", pricing: "收费", rating: 4.5, reviewCount: 1300, company: "康养无忧", founded: "2018", location: "中国上海", tags: ["养老服务", "居家照护", "陪护"], useCases: ["居家养老", "康复护理", "陪诊服务", "老年照护"], monthlyTraffic: 90000000 },
    { name: "乐心健康", slug: "lexin-jiankang", description: "提供老人健康管理、体征监测和健康提醒的智能健康服务产品。", categorySlug: "lao-nian", pricing: "免费增值", rating: 4.4, reviewCount: 1100, company: "乐心", founded: "2011", location: "中国上海", tags: ["健康监测", "老年健康", "智能设备"], useCases: ["血压监测", "睡眠管理", "健康提醒", "家庭护理"], monthlyTraffic: 120000000 },
    { name: "适老家居平台", slug: "shiyao-jiajv", description: "聚合适老化家具、无障碍产品和安装服务，帮助家庭改善居住体验。", categorySlug: "lao-nian", pricing: "报价制", rating: 4.3, reviewCount: 900, company: "适老家居", founded: "2020", location: "中国广州", tags: ["适老家居", "无障碍", "家居改造"], useCases: ["浴室改造", "扶手安装", "防滑地板", "居家适配"], monthlyTraffic: 70000000 },

    // ---- 育儿 ----
    { name: "宝宝树", slug: "baobaoshu", description: "提供母婴知识、育儿交流和亲子服务的内容与社区平台。", categorySlug: "yu-er", pricing: "免费增值", rating: 4.6, reviewCount: 2200, company: "宝宝树", founded: "2006", location: "中国上海", tags: ["母婴社区", "育儿知识", "亲子"], useCases: ["育儿指导", "亲子交流", "商品推荐", "日常护理"], monthlyTraffic: 180000000 },
    { name: "贝贝", slug: "beibei", description: "母婴用品和亲子消费平台，覆盖奶粉、用品、玩具和儿童用品。", categorySlug: "yu-er", pricing: "中端", rating: 4.5, reviewCount: 2700, company: "贝贝", founded: "2014", location: "中国杭州", tags: ["母婴用品", "儿童用品", "亲子消费"], useCases: ["奶粉选购", "玩具购买", "儿童用品", "孕婴服务"], monthlyTraffic: 230000000 },
    { name: "小红书育儿", slug: "xiaohongshu-yuer", description: "通过优质内容和社区分享，帮助家长发现育儿、亲子和母婴好物。", categorySlug: "yu-er", pricing: "免费", rating: 4.4, reviewCount: 1700, company: "小红书", founded: "2013", location: "中国上海", tags: ["育儿内容", "亲子分享", "母婴推荐"], useCases: ["经验分享", "好物推荐", "育儿咨询", "亲子交流"], monthlyTraffic: 200000000 },

    // ---- 上门维修安装 ----
    { name: "58到家", slug: "58-daijia", description: "连接家政、维修、安装、清洁等多种上门服务，便于用户快速预约。", categorySlug: "shang-men-weixiu-an-zhuang", pricing: "按服务计费", rating: 4.4, reviewCount: 2600, company: "58同城", founded: "2005", location: "中国北京", tags: ["上门服务", "维修安装", "家政服务"], useCases: ["家电维修", "安装服务", "管道维修", "家居保养"], monthlyTraffic: 240000000 },
    { name: "阿姨帮", slug: "ayi-bang", description: "提供家政、保洁、安装和维修等本地上门服务，适合家庭和小区场景。", categorySlug: "shang-men-weixiu-an-zhuang", pricing: "按服务计费", rating: 4.3, reviewCount: 1800, company: "阿姨帮", founded: "2015", location: "中国上海", tags: ["家政服务", "维修安装", "上门保洁"], useCases: ["清洁保养", "安装服务", "维修预约", "日常家务"], monthlyTraffic: 130000000 },
    { name: "快修服务平台", slug: "kuaixiu-fuwu", description: "聚合家电维修、空调安装、家装维修等高频上门服务，提供预约和售后保障。", categorySlug: "shang-men-weixiu-an-zhuang", pricing: "按服务计费", rating: 4.2, reviewCount: 1400, company: "快修服务", founded: "2019", location: "中国广州", tags: ["维修服务", "安装服务", "售后保障"], useCases: ["家电维修", "管道疏通", "安装维护", "紧急服务"], monthlyTraffic: 110000000 },
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
    { title: "2026年装修公司服务选型指南", slug: "zhuangxiu-fuwu-xuanze", type: "GUIDE", categoryId: catMap["zhuang-xiu"], excerpt: "装修公司、工长、整装服务如何选择更靠谱", keywords: ["装修", "装修公司", "家装服务"], content: "## 为什么装修前需要做充分调研？\n\n装修是家庭大件消费，选择服务商需要重点看资质、案例和售后。" },
    { title: "家电选购不踩坑：看懂核心指标", slug: "jiadian-xuanbuyuedu", type: "GUIDE", categoryId: catMap["jia-dian"], excerpt: "空调、洗衣机、冰箱等家电如何从性能和能耗角度选购", keywords: ["家电", "选购", "节能"], content: "## 家电选购的三大关键点\n\n除了品牌之外，性能、能耗和售后服务同样重要。" },
    { title: "远程办公必备设备清单", slug: "yuancheng-bangong-shebei", type: "LISTICLE", categoryId: catMap["bangong"], excerpt: "适合远程办公与混合办公场景的设备清单和建议", keywords: ["办公", "远程办公", "设备"], content: "## 远程办公前先把设备准备齐\n\n一台稳定的电脑、清晰的音视频设备和舒适的桌椅是基础。" },
    { title: "如何选择适合孩子的培训课程", slug: "xuanze-peixun-kecheng", type: "GUIDE", categoryId: catMap["jiao-yu"], excerpt: "从师资、课程内容到学习反馈，家长如何挑选培训课程", keywords: ["教育", "培训", "家长"], content: "## 培训课程选择的关键维度\n\n看内容质量、反馈机制和成长效果比单纯看宣传更重要。" },
    { title: "适老改造不只是安装扶手", slug: "shiyao-gaizao", type: "GUIDE", categoryId: catMap["lao-nian"], excerpt: "从出行、照护到日常使用，适老改造应该考虑哪些细节", keywords: ["老年", "适老", "家居改造"], content: "## 适老改造的核心目标\n\n安全、便利和舒适是适老改造的三大重点。" },
    { title: "育儿家庭实用用品清单", slug: "yuer-shiyong-qingdan", type: "LISTICLE", categoryId: catMap["yu-er"], excerpt: "帮助新手家长快速梳理育儿用品和日常必备清单", keywords: ["育儿", "母婴", "用品"], content: "## 育儿用品最值得优先准备的项目\n\n从基础护理到安全防护，实用型产品比花哨产品更值得优先考虑。" },
    { title: "上门维修安装服务怎么选更安心", slug: "shangmen-weixiu-xuanze", type: "GUIDE", categoryId: catMap["shang-men-weixiu-an-zhuang"], excerpt: "从服务口碑、价格透明度和售后保障三个维度挑选上门服务", keywords: ["维修", "安装", "上门服务"], content: "## 选择上门服务的四个重点\n\n看口碑、看报价、看保障、看服务时间都是关键。" },
    { title: "2026年装修公司服务推荐榜单：从设计、施工到预算的实用选型指南", slug: "2026-zhuangxiu-fuwu-tui-jian", type: "BEST", categoryId: catMap["zhuang-xiu"], excerpt: "从整装公司、工长服务到设计搭配，精选2026年值得优先考虑的装修服务提供商，并围绕预算、施工和售后给出实用建议。", keywords: ["装修", "装修公司", "推荐榜单"], content: "## 为什么装修前需要一份更系统的服务推荐？\n\n装修是一项投入大、周期长、且很容易出问题的家庭消费。很多家庭在开始前，最容易忽视的不是设计，而是服务商的专业度、沟通节奏和交付保障。真正值得优先考虑的，不是单纯“便宜”或“看起来很专业”，而是能够兼顾预算控制、工期管理、材料透明度和售后支持的服务方案。\n\n### 1. 先看设计与预算是否匹配\n\n好的服务商不会只强调效果，而是会先了解预算边界和实际需求。对于大多数家庭来说，最重要的不是“做得多豪华”，而是“项目预算内能否实现最实用的居住体验”。\n\n### 2. 再看工程组织是否清晰\n\n施工过程中的水电、泥瓦、木作、安装等环节非常多，若没有清晰的时间表和责任分工，容易出现延误、返工或沟通不顺。建议优先选择能够提供明确进度、节点交付和问题反馈机制的服务商。\n\n### 3. 重点确认材料和报价是否透明\n\n很多装修纠纷并不是设计本身的问题，而是材料品牌、施工范围、增项内容没有说清楚。优先选择能明确列出主材、辅材、工艺标准和预估增项范围的公司，可以显著降低后续成本风险。\n\n### 4. 最后核对售后是否有保障\n\n装修完成后，家具安装、水电问题、细节调整和长期维护都需要后续支持。一个靠谱的服务商，通常会在交付后提供明确的售后渠道和问题响应机制。\n\n## 结论摘要\n\n如果你更看重省心和一站式服务，整装公司会更适合；如果你希望对局部改造有更强掌控力，工长模式更合适；如果你更在意空间设计感和风格表达，设计师服务会更适合。最终选择应结合房屋面积、预算上限、装修复杂度和家庭时间安排来综合判断。\n\n## 常见问题\n\n### 选择装修公司时，最应该优先看什么？\n\n优先看设计能力、报价透明度、工期管理和售后服务四项。\n\n### 整装公司和工长，哪个更适合普通家庭？\n\n普通家庭如果更重视省心和整体交付，整装公司更合适；如果更重视施工细节和预算控制，工长更合适。" },
    { title: "装修服务怎么选？整装公司、工长和设计师的区别与优缺点", slug: "zhuangxiu-fuwu-duibi", type: "COMPARISON", categoryId: catMap["zhuang-xiu"], excerpt: "对比整装公司、工长和设计师三种常见装修服务模式，帮助家庭做出更稳妥的选择，并明确不同场景下该优先选哪一种。", keywords: ["装修", "装修对比", "整装服务"], content: "## 为什么不同装修模式适合的人不一样？\n\n装修服务并不是只有“找公司做”这一种方式。对于新房装修、旧房翻新、局部改造和高定风格项目来说，整装公司、工长和设计师三种服务模式各有优势，也各自适合不同的家庭需求。\n\n### 1. 整装公司：适合追求省心交付的人\n\n整装公司通常提供设计、采购、施工、验收和售后的一站式服务，最适合时间有限、希望减少协调环节的家庭。它的优点是省心，缺点是对个性化需求的调整空间可能相对有限，沟通成本也会集中体现在整体管理上。\n\n### 2. 工长：适合有明确施工控制需求的人\n\n工长模式更接近“施工主导”的服务方式，适合局部翻新、预算控制明确、希望对材料和施工细节有更直接参与的家庭。它的优势在于对施工现场的管理更直接，缺点是需要家庭自己更积极地协调设计、材料和进度。\n\n### 3. 设计师：适合追求风格与空间质感的人\n\n如果你更在意空间感、风格表达、收纳逻辑和高品质细节，设计师服务会更合适。它更适合高定风格、复杂功能区和需要强设计感的项目，但通常也意味着预算和沟通强度会更高。\n\n## 结论摘要\n\n如果你更看重省时省心，优先考虑整装公司；如果你希望控制施工细节和预算，优先考虑工长；如果你更重视设计感和生活质感，优先考虑设计师。最实用的选择标准，不是只看口碑，而是看你的项目类型、预算上限和对时间精力的投入程度。\n\n## 常见问题\n\n### 家庭装修到底该先找设计师还是先找公司？\n\n建议先明确预算和项目范围，再决定是直接找整装公司，还是先找设计师做方案。\n\n### 局部改造适合找工长吗？\n\n适合，尤其是预算控制和施工效率都比较重要时。" },
    { title: "2026年家电品牌推荐榜单：从空调到智能家居的实用选购思路", slug: "2026-jiadian-pinpai-tui-jian", type: "BEST", categoryId: catMap["jia-dian"], excerpt: "从空调、冰箱到智能家居，精选2026年值得关注的家电品牌与产品类型，并结合性能、能耗、售后和智能化能力给出建议。", keywords: ["家电", "品牌推荐", "智能家居"], content: "## 为什么家电选购不能只看品牌名气？\n\n家电是家庭长期使用的消费品，除了外观和宣传语，真正影响体验的，往往是性能稳定性、能耗表现、售后配件和智能化能力。一个看似热门的品牌，不一定适合每个家庭的使用场景。\n\n### 1. 先确认真实使用场景\n\n不同家庭的厨房、客厅和卧室使用习惯差异很大。购买前最好先明确自己是更看重节能、静音、容量还是智能联动。\n\n### 2. 再看能效和长期使用成本\n\n虽然高能效产品初期价格更高，但长期电费和维护成本通常更低，尤其是空调、洗衣机和冰箱这类高频使用设备。\n\n### 3. 重点考量售后服务与维修便利性\n\n家电一旦出现故障，维修配件、服务网点和质保时效都非常关键。对于大件家电来说，售后覆盖范围常常比品牌口碑更重要。\n\n### 4. 最后判断智能联动体验\n\n如果你已经有智能音箱、智能灯光或家庭控制系统，优先选那些兼容性更好的产品，可以获得更顺畅的联动体验。\n\n## 结论摘要\n\n如果你看重全品类覆盖、成熟度和售后能力，美的和海尔通常是更稳妥的选择；如果你更在意轻量智能场景与设备联动，小米智家则更适合。最终建议结合预算、使用频率和家居环境来综合评估。\n\n## 常见问题\n\n### 家电要不要优先选大品牌？\n\n大品牌通常更稳，但也要看你是否真的需要其更高端的功能和售后服务。\n\n### 智能家居值得入手吗？\n\n如果你已经有基础设备，智能联动确实能提升便利性，但不建议为了“智能”而盲目升级。" },
    { title: "美的、海尔和小米智家怎么选？家电品牌对比与购买建议", slug: "midea-vs-haier-vs-xiaomi", type: "COMPARISON", categoryId: catMap["jia-dian"], excerpt: "对比美的、海尔和小米智家在智能家居、能效与服务体验上的差异，帮助用户按实际需求选择更适合的品牌。", keywords: ["家电", "品牌对比", "智能家居"], content: "## 三大品牌各有侧重\n\n美的、海尔和小米智家都在家电和智能家居领域有很强的影响力，但它们的产品策略和服务入口并不一样。美的更偏向传统家电品类和全品类覆盖，海尔在智能家电和整体解决方案上更成熟，小米智家则更聚焦轻量智能和生态联动体验。\n\n### 1. 美的：更适合想要稳定全品类选择的家庭\n\n美的在空调、冰箱、厨电、洗衣机等多个品类都较为成熟，尤其适合希望一站式采购、减少品牌切换的消费者。\n\n### 2. 海尔：更适合追求高端体验与整体解决方案的人\n\n海尔在智能家居和高端化产品方向的布局较强，如果你更重视整体家居系统和家电品质，海尔通常是值得重点考虑的选择。\n\n### 3. 小米智家：更适合注重智能联动与轻量化体验的人\n\n小米智家更适合已经有智能音箱、智能灯光、摄像头等设备的家庭，尤其适合注重便捷控制和场景联动。\n\n## 结论摘要\n\n如果你更在意稳定性和全品类选择，优先看美的；如果你希望高端智能和系统化体验，海尔更值得考虑；如果你希望快速搭建智能家庭场景，小米智家会更容易落地。\n\n## 常见问题\n\n### 家电品牌选哪个最稳妥？\n\n如果你更看重长期稳定和丰富品类，美的和海尔通常更稳妥。\n\n### 智能家居是否值得一开始就全部上齐？\n\n不建议一次性全量升级，先从最常用的场景开始更实用。" },
    { title: "2026年办公软件推荐榜单：适合企业和远程办公的协同工具选择", slug: "2026-bangong-ruanjian-tui-jian", type: "BEST", categoryId: catMap["bangong"], excerpt: "为远程办公与企业协同场景精选办公软件与协作工具，并从文档管理、协作效率、安全合规几个维度评估。", keywords: ["办公", "办公软件", "推荐榜单"], content: "## 为什么办公软件选择比看功能更重要？\n\n优秀的办公软件不只是“能写文档、能开会议”，更要看它是否能真正提升团队协作效率、减少信息碎片化，并能在不同终端之间稳定运行。尤其在远程办公和混合办公场景中，工具的易用性和协同能力尤为重要。\n\n### 1. 先看文档协作能力\n\n团队最常见的痛点之一是文件版本混乱。一个好的办公平台，应该能够提供实时协作、权限控制和版本追踪。\n\n### 2. 再看会议与沟通效率\n\n会议、即时消息和日程排程是否顺畅，直接影响团队执行效率。尤其是跨部门协作时，沟通渠道的统一性很重要。\n\n### 3. 最后确认安全与权限管理\n\n当企业中存在多种部门和角色时，权限控制就成为不可忽视的部分。工具是否支持分级权限、外部协作和数据安全管理，往往决定它是否适合正式使用。\n\n## 结论摘要\n\n如果你依赖 Office 生态和文档处理流程，微软 365更合适；如果你更强调微信式沟通和轻量协同，企业微信会更顺手；如果你希望更流畅的团队协作、文档和会议一体化体验，飞书更值得尝试。\n\n## 常见问题\n\n### 小团队适合用哪类办公软件？\n\n小团队通常更适合轻量协同平台，优先看上手成本和沟通效率。\n\n### 企业级使用要不要优先考虑安全能力？\n\n必须优先考虑，特别是权限管理、外部共享和数据保密性。" },
    { title: "微软 365、企业微信和飞书怎么选？办公协同工具全面对比", slug: "microsoft365-vs-qiye-weixin-vs-feishu", type: "COMPARISON", categoryId: catMap["bangong"], excerpt: "从文档协作、会议效率和企业管理维度对比三款主流办公协同平台，帮助你判断哪一款更适合团队使用。", keywords: ["办公", "办公软件对比", "协同工具"], content: "## 三款工具的核心差异\n\n微软 365、企业微信和飞书都属于办公协同领域的主流产品，但它们的定位并不完全相同。微软 365更偏向传统办公生产力体系，企业微信则更贴近微信工作流，飞书则在轻量协同和全栈办公体验上更强调统一入口。\n\n### 1. 微软 365：适合以 Office 流程为核心的团队\n\n如果你的团队已经习惯 Word、Excel、PowerPoint 和 Outlook，那么微软 365会非常自然。它在文档处理和企业级办公场景中优势明显。\n\n### 2. 企业微信：适合熟悉微信工作流的组织\n\n企业微信的优势在于低门槛和熟悉度高，特别适合中小企业和需要快速落地沟通协作的团队。\n\n### 3. 飞书：适合重视统一体验和即时协同的团队\n\n飞书在文档、会议、沟通、审批等多个环节的统一性上比较强，适合希望减少工具切换、提升工作效率的组织。\n\n## 结论摘要\n\n优先考虑你现有团队习惯、业务流程和管理复杂度。若团队已经有成熟 Office 流程，微软 365通常更稳妥；若项目沟通和日常协同需求更高，飞书或企业微信会更高效。\n\n## 常见问题\n\n### 这三者中，哪一个最适合中小团队？\n\n中小团队通常优先考虑上手成本和沟通效率，企业微信和飞书更容易落地。\n\n### 如果团队已经用 Office 很久，应该怎么选？\n\n如果已有成熟的 Office 工作流，微软 365通常是最自然的选择。" },
    { title: "2026年教育培训机构推荐榜单：如何挑选更适合孩子和家庭的课程", slug: "2026-jiaoyu-peixun-tui-jian", type: "BEST", categoryId: catMap["jiao-yu"], excerpt: "从课外辅导、职业培训到线上学习，精选更适合家庭与学习者的教育服务方案，并从课程质量、师资和反馈机制三个维度给出建议。", keywords: ["教育", "培训", "推荐榜单"], content: "## 为什么教育机构的选择不能只看宣传？\n\n教育培训是家庭投入较重的一项内容，尤其是孩子的课外辅导、兴趣培养和职业技能学习。很多家长最容易忽略的，是课程内容与孩子实际需求是否匹配，而不是单纯看品牌宣传和课程数量。\n\n### 1. 先看课程内容是否清晰\n\n优质课程通常会把目标、节奏、反馈机制和学习成果说清楚。若一个机构讲得很模糊，往往说明课程设计并不成熟。\n\n### 2. 再看师资是否稳定\n\n稳定的教学团队对于长期学习体验至关重要。尤其是孩子需要持续提升时，老师的稳定性和教法一致性会直接影响学习效果。\n\n### 3. 最后确认学习反馈是否及时\n\n一个好的机构不仅能授课，还能有效跟踪孩子的学习状态，让家长及时了解薄弱环节。\n\n## 结论摘要\n\n如果你更重视系统化课程和成熟教学体系，优先考察规模化机构；如果你更看重个性化和学习反馈，建议优先选择小班制或一对一服务。最终还是要结合孩子的年龄、学段和目标来挑选。\n\n## 常见问题\n\n### 机构选大机构还是小机构？\n\n如果孩子需要稳定系统学习，大机构更合适；如果需要更细致的个性化指导，小机构更有优势。\n\n### 线上培训和线下培训该怎么选？\n\n线上更灵活，线下更适合需要互动和监督的学习场景。" },
    { title: "适老照护服务怎么选？养老平台、居家护理和机构服务深度对比", slug: "laonian-fuwu-duibi", type: "COMPARISON", categoryId: catMap["lao-nian"], excerpt: "对比适老照护的不同服务模式，帮助家庭选择更适合自身情况的方案，并分辨不同服务类型的优缺点。", keywords: ["老年", "照护服务", "适老"], content: "## 为什么适老照护服务的选择要更谨慎？\n\n适老照护并不只是“找一个人来照顾”，它关乎老人生活质量、医疗安全、情绪陪伴和家庭分工。不同服务模式的优先级，也会随着老人身体状况、居住环境和家庭精力不同而变化。\n\n### 1. 养老平台：适合需要信息整合和服务对接的人\n\n养老平台通常提供服务信息、预约入口、社保或保险对接等功能，适合希望快速找到可选服务的人群。它的优势在于信息聚合，缺点是实际服务质量仍需要家庭自己筛选。\n\n### 2. 居家护理：适合希望保持熟悉环境的人\n\n对于大多数老人来说，居家护理的最大优点是在熟悉环境中生活，更容易保持稳定的作息和情绪。它更适合日常照护、康复辅助和长期陪伴。\n\n### 3. 机构服务：适合需要更强专业能力和社交支持的人\n\n机构服务通常拥有更完整的护理、康复和生活管理体系，适合需要专业照护或日常生活照料较多的老人。它的优势在于服务能力更系统，缺点是生活环境和适应成本会更高。\n\n## 结论摘要\n\n如果老人需要的是信息匹配和便捷预约，养老平台更合适；如果需要的是长期陪护和居家环境适配，居家护理更合适；如果需要更完整的专业服务和管理体系，机构服务更值得考虑。\n\n## 常见问题\n\n### 哪种照护模式最适合日常陪伴？\n\n居家护理通常最适合需要长期陪伴和熟悉环境的老人。\n\n### 机构服务是否适合所有老人？\n\n并不一定，是否适合要看老人是否更需要集体生活和专业护理支持。" },
    { title: "2026年母婴用品推荐榜单：新手父母最值得优先考虑的实用清单", slug: "2026-muying-yongpin-tui-jian", type: "BEST", categoryId: catMap["yu-er"], excerpt: "为新手父母精选更实用、更安全的母婴用品与亲子服务产品，并从安全性、实用性和长期价值三个维度给出建议。", keywords: ["育儿", "母婴", "推荐榜单"], content: "## 为什么母婴用品选择要比“看起来好看”更重要？\n\n母婴用品不仅影响使用体验，也直接关系到宝宝的健康和家庭的日常节奏。真正实用的产品，不一定最贵，但一定要符合宝宝年龄阶段、家庭使用频率和清洁维护能力。\n\n### 1. 先看安全性\n\n材料、结构和使用方式是否安全，是母婴用品最重要的评价维度。尤其是床品、餐具、玩具和护理用品，应优先考虑材质和认证信息。\n\n### 2. 再看实用性\n\n一个好产品应该真正解决实际问题，而不是只停留在“好看”层面。比如易清洁、可折叠、可重复使用，往往比单一功能更具价值。\n\n### 3. 最后衡量长期价值\n\n很多家庭会在孩子成长的早期过度囤积用品，实际上更重要的是选择能伴随孩子成长、适配阶段变化的产品。\n\n## 结论摘要\n\n对于新手父母来说，优先准备基础护理、日常清洁和安全防护类用品通常更有价值。后续再根据孩子阶段和家庭习惯来补充其他品类。\n\n## 常见问题\n\n### 母婴用品到底要不要囤？\n\n不建议一次性囤太多，重点先准备高频且必需的用品。\n\n### 什么类型的产品更值得优先买？\n\n安全性和实用性高的基础护理类产品通常最值得优先购买。" },
    { title: "上门维修服务怎么选？家电维修、保洁和安装服务差异解析", slug: "weixiu-fuwu-duibi", type: "COMPARISON", categoryId: catMap["shang-men-weixiu-an-zhuang"], excerpt: "对比家电维修、家政保洁和安装服务的服务场景与选择要点，帮助家庭更清楚地判断什么场景该选什么服务。", keywords: ["维修", "上门服务", "安装服务"], content: "## 为什么上门服务的选择不能混淆？\n\n很多家庭在遇到家电故障、清洁需求或安装问题时，往往会把不同类型的上门服务混为一谈。实际上，家电维修、保洁和安装服务各自解决的核心问题不同，选择错了，效率和成本都会受到影响。\n\n### 1. 家电维修：解决设备故障和性能问题\n\n家电维修更适合空调、冰箱、洗衣机、热水器等设备出现故障、漏水、异响或不工作的问题。它强调的是故障定位和恢复使用。\n\n### 2. 家政保洁：解决日常清洁和维护任务\n\n家政保洁更适合深度清洁、日常保养、橱柜整理和卫生管理等需求。它解决的是“居住环境的维护与整洁”，而不是设备故障。\n\n### 3. 安装服务：解决新购设备或改造后的落地问题\n\n安装服务重点在于设备落地、施工规范和使用体验。特别是空调、热水器、智能家具、厨卫设备等，这类服务的专业性非常重要。\n\n## 结论摘要\n\n如果问题是设备不能用，优先找维修；如果问题是家里不够干净或需要日常维护，优先找保洁；如果是新买设备或改造后需要落地，优先找安装服务。这样选择最省时间，也最容易避免二次返工。\n\n## 常见问题\n\n### 家电坏了是先找维修还是先看保修？\n\n先查看保修和质保政策，再决定是联系品牌售后还是第三方维修。\n\n### 新买家具需要安装服务吗？\n\n大多数需要安装的家具和厨卫设备，建议优先选择专业安装服务。" },
  ];

  for (const a of articlesData) {
    const seoTitle = getSeoTitle(a.title);
    const seoExcerpt = getSeoExcerpt(a.title, a.excerpt);

    await db.article.create({
      data: {
        ...a,
        title: seoTitle,
        excerpt: seoExcerpt,
        type: a.type as "BEST" | "COMPARISON" | "GUIDE" | "REVIEW" | "LISTICLE" | "HOW_TO" | "FAQ",
        authorName: "AooBee 编辑部",
        keywords: a.keywords,
        readTime: 8 + Math.floor(Math.random() * 12),
        wordCount: 2000 + Math.floor(Math.random() * 3000),
        published: true,
        publishedAt: new Date(),
        metaTitle: `${seoTitle} | AooBee`,
        metaDesc: seoExcerpt,
        faqItems: getFaqItems(a.title),
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

function getFaqItems(title: string) {
  const baseTitle = title.split(/[：|]/)[0];
  return [
    { question: `什么是${baseTitle}？`, answer: `这篇文章会从实际使用场景、优先级和选购建议几个维度来帮你理解${baseTitle}。` },
    { question: `如何判断自己是否适合选择这个方案？`, answer: "建议结合预算、使用频率、服务范围和后续维护成本来综合判断。" },
    { question: `如果预算有限，应该怎么做？`, answer: "优先选择解决核心问题且性价比更高的方案，再逐步升级到更完整的服务。" },
  ];
}

function getSeoTitle(title: string): string {
  const baseTitle = title.replace(/^[0-9]{4}年/, "").trim();
  if (baseTitle.includes("推荐榜单")) {
    return `${baseTitle.replace(/推荐榜单/, "推荐榜单")}${baseTitle.includes("2026") ? "" : ""}`;
  }
  if (baseTitle.includes("怎么选") || baseTitle.includes("对比") || baseTitle.includes("选择")) {
    return `${baseTitle}｜选购指南与实用建议`;
  }
  if (baseTitle.includes("清单")) {
    return `${baseTitle}｜必备清单与实用建议`;
  }
  if (baseTitle.includes("指南")) {
    return `${baseTitle}｜实用攻略与选购建议`;
  }
  return `${baseTitle}｜全面解析与实用建议`;
}

function getSeoExcerpt(title: string, fallback: string): string {
  const baseTitle = title.split(/[：|]/)[0].replace(/^[0-9]{4}年/, "").trim();
  if (title.includes("推荐榜单")) {
    return `为你整理${baseTitle}的最新推荐榜单，结合价格、体验和实用性，帮助你快速挑选更值得入手的方案。`;
  }
  if (title.includes("对比") || title.includes("对比与") || title.includes("怎么选") || title.includes("选择")) {
    return `深入对比${baseTitle}的优缺点、适用场景和选择要点，帮助你更快判断哪一种更适合自己。`;
  }
  if (title.includes("清单")) {
    return `整理${baseTitle}最值得优先准备的清单，帮助你更高效地做出选择。`;
  }
  return fallback || `全面解析${baseTitle}的核心问题、适用场景和实用建议，适合想快速了解${baseTitle}的人阅读。`;
}

main()
  .catch((e) => { console.error("❌ 种子数据填充失败:", e); process.exit(1); })
  .finally(() => db.$disconnect());

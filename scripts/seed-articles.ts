import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const cats = await db.category.findMany();
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  const articles = [
    { title:'2026年最佳AI工具推荐', slug:'ai-gong-ju', type:'BEST', cat:'ren-gong-zhi-neng', excerpt:'覆盖对话、绘画、编程、分析等领域的顶级AI工具深度评测', keywords:['AI工具','最佳推荐','2026'], content:'## 2026年AI工具市场概览\n\nAI工具市场持续高速增长...' },
    { title:'2026年最佳UI/UX设计工具推荐', slug:'she-ji-gong-ju', type:'BEST', cat:'she-ji-chuang-yi', excerpt:'Figma、即时设计、Adobe XD等主流设计工具深度评测与对比', keywords:['设计工具','UI设计','Figma'], content:'## 设计工具选择指南\n\n选择合适的设计工具对团队效率至关重要...' },
    { title:'2026年最佳CRM系统推荐', slug:'crm', type:'BEST', cat:'qi-ye-guan-li', excerpt:'Salesforce、HubSpot、纷享销客等CRM系统全面对比评测', keywords:['CRM','客户管理','企业软件'], content:'## CRM系统概览\n\nCRM是企业管理的核心系统之一...' },
    { title:'2026年最佳项目管理工具推荐', slug:'xiang-mu-guan-li', type:'BEST', cat:'qi-ye-guan-li', excerpt:'Jira、Notion、飞书、Asana等项目管理工具深度对比', keywords:['项目管理','协作工具','Jira'], content:'## 项目管理工具对比\n\n不同规模的团队需要不同的项目管理方案...' },
    { title:'2026年最佳电商平台推荐', slug:'dian-shang-pingtai', type:'BEST', cat:'dian-shang-ling-shou', excerpt:'Shopify、有赞、WooCommerce等电商平台全面对比评测', keywords:['电商平台','独立站','Shopify'], content:'## 电商平台选择\n\n选对电商平台是电商业务成功的第一步...' },
    { title:'如何选择适合团队的协作工具', slug:'xuanze-xiezuo-gongju', type:'GUIDE', cat:'qi-ye-guan-li', excerpt:'从需求分析到工具选型，团队协作工具选择完全指南', keywords:['协作工具','团队协作','工具选型'], content:'## 为什么需要协作工具？\n\n远程办公时代，协作工具已成为团队必备...' },
    { title:'跨境电商独立站建站完全指南', slug:'kuajing-dianshan-jianzhan', type:'GUIDE', cat:'dian-shang-ling-shou', excerpt:'从零开始搭建跨境电商独立站的完整流程和注意事项', keywords:['跨境电商','独立站','建站'], content:'## 什么是跨境电商独立站？\n\n独立站是指商家自建的电商网站...' },
    { title:'AI工具如何提升工作效率', slug:'ai-tigong-xiaolv', type:'GUIDE', cat:'ren-gong-zhi-neng', excerpt:'详细介绍如何利用AI工具在写作、编程、设计等场景提升效率', keywords:['AI效率','工作效率','AI应用'], content:'## AI正在改变工作方式\n\n从写作到编程，AI工具正在全面提升工作效率...' },
    { title:'SEO入门指南：从零开始学搜索引擎优化', slug:'seo-rumen', type:'HOW_TO', cat:'shu-zi-ying-xiao', excerpt:'SEO基础知识、关键词研究、页面优化、外链建设完整教程', keywords:['SEO','搜索引擎优化','入门'], content:'## 什么是SEO？\n\nSEO即搜索引擎优化，是提升网站在搜索引擎中排名的技术...' },
    { title:'Figma vs 即时设计：哪个更适合你', slug:'figma-vs-jishisheji', type:'COMPARISON', cat:'she-ji-chuang-yi', excerpt:'Figma和即时设计全面对比：功能、价格、协作、本地化深度分析', keywords:['Figma','即时设计','UI设计对比'], content:'## 产品概述\n\nFigma是全球最流行的在线设计工具，即时设计是国产替代方案...' },
    { title:'Notion vs 飞书：企业协作平台对比', slug:'notion-vs-feishu', type:'COMPARISON', cat:'qi-ye-guan-li', excerpt:'Notion和飞书深度对比：功能、适用场景、价格全方位分析', keywords:['Notion','飞书','协作对比'], content:'## 产品概述\n\nNotion和飞书都是优秀的团队协作平台...' },
    { title:'企业数字化转型必备工具清单', slug:'shuzihua-gongju', type:'LISTICLE', cat:'qi-ye-guan-li', excerpt:'企业数字化转型不可或缺的10类工具推荐', keywords:['数字化转型','企业工具','SaaS'], content:'## 数字化转型核心工具\n\n企业数字化转型需要从多个维度进行工具升级...' },
    { title:'在线教育平台深度评测', slug:'zaixian-jiaoyu-pingce', type:'REVIEW', cat:'jiao-yu-pei-xun', excerpt:'Coursera、中国大学MOOC、网易云课堂等平台深度对比评测', keywords:['在线教育','MOOC','学习平台'], content:'## 平台概览\n\n在线教育平台众多，如何选择最适合自己的？' },
    { title:'新手如何选择第一款AI写作工具', slug:'xinshou-ai-xiezuo', type:'HOW_TO', cat:'ren-gong-zhi-neng', excerpt:'AI写作工具入门指南，帮新手快速上手并选择合适的工具', keywords:['AI写作','新手入门','写作工具'], content:'## AI写作工具入门\n\n如果你是第一次接触AI写作工具...' },
    { title:'移动支付平台对比：支付宝 vs 微信支付', slug:'zhifubao-vs-weixin', type:'COMPARISON', cat:'jin-rong-ke-ji', excerpt:'支付宝和微信支付功能、费率、适用场景全面对比', keywords:['支付宝','微信支付','移动支付'], content:'## 产品概述\n\n支付宝和微信支付是中国两大移动支付平台...' },
    { title:'装修前必看的10个避坑问题', slug:'zhuangxiu-bikong', type:'GUIDE', cat:'zhuang-xiu', excerpt:'从预算、施工、材料选购到合同签署，装修前要重点规避哪些坑', keywords:['装修','避坑','家装'], content:'## 装修前先做什么？\n\n装修前一定要先规划空间、预算和工期...' },
    { title:'家电选购指南：买什么更实用', slug:'jiadian-xuan-gou', type:'GUIDE', cat:'jia-dian', excerpt:'厨房电器、空调、洗衣机、扫地机器人等家电怎么选更省心', keywords:['家电','选购','家居'], content:'## 家电选购核心原则\n\n家电选购要看功能、能耗和售后...' },
    { title:'办公空间怎么提升效率', slug:'bangong-kongjian-xiaolv', type:'GUIDE', cat:'bangong', excerpt:'从家具、布局到设备，办公空间如何更高效', keywords:['办公','效率','办公空间'], content:'## 办公效率提升方法\n\n良好的办公空间可以显著提升团队效率...' },
    { title:'教育行业如何选择优质培训服务', slug:'jiaoyu-peixun-xuanze', type:'GUIDE', cat:'jiao-yu', excerpt:'教育培训机构、课程内容和服务质量如何判断', keywords:['教育','培训','选购'], content:'## 教育培训服务怎么选？\n\n内容质量、师资和口碑是挑选培训服务的关键...' },
    { title:'适老家居改造实用指南', slug:'shiylao-jiaju-gaizao', type:'GUIDE', cat:'lao-nian', excerpt:'适老化改造如何兼顾安全、舒适和实用', keywords:['老年','适老','家居'], content:'## 适老家居改造要点\n\n无障碍设计、扶手和照明是重点...' },
    { title:'育儿家庭如何高效选购用品', slug:'yuer-jiaju-xuan-gou', type:'GUIDE', cat:'yu-er', excerpt:'从奶粉、玩具到儿童家具，育儿用品怎么选更省心', keywords:['育儿','母婴','用品'], content:'## 育儿用品选购建议\n\n家长在选购时应重点关注安全性和实用性...' },
    { title:'上门维修安装服务怎么挑', slug:'shangmen-weixiu-xuanze', type:'GUIDE', cat:'shang-men-weixiu-an-zhuang', excerpt:'家电维修、安装服务、管道维修等上门服务选择指南', keywords:['维修','安装','上门服务'], content:'## 上门维修安装服务选择\n\n服务口碑、价格透明和售后保障最重要...' },
  ];

  let count = 0;
  for (const a of articles) {
    const existing = await db.article.findUnique({ where: { slug: a.slug } });
    if (existing) continue;
    await db.article.create({
      data: {
        title: a.title, slug: a.slug, type: a.type as any,
        categoryId: catMap[a.cat] || null, excerpt: a.excerpt,
        keywords: a.keywords, content: a.content,
        authorName: 'AooBee 编辑部', readTime: 8 + Math.floor(Math.random()*12),
        wordCount: 2000 + Math.floor(Math.random()*3000),
        published: true, publishedAt: new Date(),
        metaTitle: a.title + ' | AooBee', metaDesc: a.excerpt,
        faqItems: [
          { question: '什么是' + a.title.split(/[：|]/)[0] + '？', answer: '这是一篇关于该主题的详细介绍文章。' },
          { question: '如何选择合适的工具？', answer: '建议根据实际需求、预算和团队规模来选择。' },
        ],
      },
    });
    count++;
  }

  const total = await db.article.count();
  console.log(`✅ 新增 ${count} 篇文章，数据库共 ${total} 篇`);
}

main().catch(console.error).finally(() => db.$disconnect());

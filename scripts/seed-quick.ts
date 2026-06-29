import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://aoobee:aoobee123@localhost:5432/aoobee?schema=public",
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ===== 行业分类 =====
    const categories = [
      ["人工智能", "ren-gong-zhi-neng", "🤖", "AI工具、机器学习、自然语言处理等产品"],
      ["软件开发", "ruan-jian-kai-fa", "💻", "开发工具、IDE、代码托管、CI/CD等"],
      ["电商零售", "dian-shang-ling-shou", "🛒", "电商平台、店铺管理、支付系统等"],
      ["数字营销", "shu-zi-ying-xiao", "📢", "SEO工具、广告平台、社交媒体管理等"],
      ["设计创意", "she-ji-chuang-yi", "🎨", "设计工具、图片编辑、UI/UX等"],
      ["企业管理", "qi-ye-guan-li", "📊", "ERP、CRM、HR、OA等企业管理系统"],
      ["教育培训", "jiao-yu-pei-xun", "📚", "在线学习、课程平台、知识管理等"],
      ["金融科技", "jin-rong-ke-ji", "💰", "支付、区块链、量化交易、保险科技等"],
    ];

    const catIds: Record<string, string> = {};
    for (let i = 0; i < categories.length; i++) {
      const [name, slug, icon, desc] = categories[i];
      const res = await client.query(
        `INSERT INTO "Category" (id, name, slug, icon, description, "sortOrder", published, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW()) RETURNING id`,
        [`cat_${i + 1}`, name, slug, icon, desc, i]
      );
      catIds[slug] = res.rows[0].id;
    }
    console.log(`✅ 插入 ${categories.length} 个行业分类`);

    // ===== 产品数据 =====
    const products = [
      // 人工智能
      ["ChatGPT", "chatgpt", "https://chat.openai.com", "OpenAI推出的AI对话助手，支持文本生成、代码编写、问答等多种任务",
       "ChatGPT是OpenAI于2022年11月推出的AI对话助手，基于GPT系列大语言模型，能理解和生成自然语言文本。上线两个月突破1亿用户，是全球增长最快的消费级应用之一。适用于内容创作、编程辅助、学术研究等场景。", "ren-gong-zhi-neng", "OpenAI", "2022", "美国旧金山", "免费增值", "Plus $20/月 | Pro $200/月", 4.8, 2400, 50000000],
      ["Claude", "claude", "https://claude.ai", "Anthropic推出的AI助手，擅长长文本理解和分析",
       "Claude是由Anthropic开发的AI对话助手，以安全性和长文本处理能力著称。200K tokens的上下文窗口使其在处理长文档和深度分析方面表现卓越。适合学术写作、报告撰写和代码审查。", "ren-gong-zhi-neng", "Anthropic", "2023", "美国旧金山", "免费增值", "Pro $20/月 | Team $30/人/月", 4.7, 1200, 30000000],
      ["Midjourney", "midjourney", "https://midjourney.com", "AI图像生成工具，通过文字描述生成高质量图片",
       "Midjourney是一款AI图像生成工具，用户通过文字描述即可生成高质量的艺术图片。以其出色的艺术风格和创意能力闻名，广泛应用于设计、广告和创意领域。", "ren-gong-zhi-neng", "Midjourney Inc", "2022", "美国", "付费", "Basic $10/月 | Pro $30/月", 4.6, 800, 20000000],
      ["文心一言", "wenxin-yiyan", "https://yiyan.baidu.com", "百度推出的AI大模型对话产品，中文理解能力强",
       "文心一言是百度基于文心大模型推出的AI对话产品。在中文理解和生成方面表现出色，支持文本创作、知识问答、代码生成等多种功能，是国内领先的AI助手之一。", "ren-gong-zhi-neng", "百度", "2023", "中国北京", "免费", "专业版按需定价", 4.3, 600, 15000000],
      ["通义千问", "tongyi-qianwen", "https://tongyi.aliyun.com", "阿里巴巴推出的AI大模型，支持多种应用场景",
       "通义千问是阿里巴巴达摩院推出的AI大模型产品，支持多轮对话、文案创作、代码生成、多语言翻译等功能。与阿里云生态深度集成。", "ren-gong-zhi-neng", "阿里巴巴", "2023", "中国杭州", "免费", "企业版按需定价", 4.2, 500, 12000000],
      ["Gemini", "gemini", "https://gemini.google.com", "Google推出的AI助手，深度集成Google生态",
       "Gemini是Google推出的AI助手，深度集成Google搜索、Gmail、Docs等产品。支持多模态输入，在信息检索和实时数据方面有独特优势。", "ren-gong-zhi-neng", "Google", "2023", "美国山景城", "免费增值", "Advanced $20/月", 4.5, 900, 40000000],

      // 软件开发
      ["GitHub Copilot", "github-copilot", "https://github.com/features/copilot", "GitHub推出的AI编程助手，实时代码建议",
       "GitHub Copilot是GitHub与OpenAI合作开发的AI编程助手，基于数十亿行代码训练。在VS Code等IDE中提供实时代码建议，支持多种编程语言，能显著提升开发效率。", "ruan-jian-kai-fa", "GitHub/Microsoft", "2021", "美国旧金山", "付费", "Individual $10/月 | Business $19/人/月", 4.5, 1500, 8000000],
      ["Vercel", "vercel", "https://vercel.com", "现代Web应用部署平台，支持Next.js等框架",
       "Vercel是Next.js的创建公司，提供前端云平台服务。支持自动部署、预览、CDN加速，是现代Web开发者的首选部署平台。", "ruan-jian-kai-fa", "Vercel Inc", "2015", "美国旧金山", "免费增值", "Pro $20/月 | Enterprise定制", 4.6, 800, 5000000],
      ["Cursor", "cursor", "https://cursor.sh", "AI原生的代码编辑器，集成代码生成和理解能力",
       "Cursor是一款AI原生的代码编辑器，基于VS Code构建，深度集成了AI代码生成和理解能力。支持自然语言编程、代码库问答、智能重构等功能。", "ruan-jian-kai-fa", "Anysphere", "2023", "美国", "免费增值", "Pro $20/月 | Business $40/人/月", 4.7, 600, 3000000],
      ["GitLab", "gitlab", "https://gitlab.com", "DevOps全生命周期平台，覆盖代码托管到部署",
       "GitLab是一个完整的DevOps平台，提供代码托管、CI/CD、项目管理、安全扫描等功能。支持自托管和SaaS两种模式。", "ruan-jian-kai-fa", "GitLab Inc", "2011", "美国旧金山", "免费增值", "Premium $29/人/月", 4.4, 1100, 6000000],

      // 电商零售
      ["Shopify", "shopify", "https://shopify.com", "全球领先的电商建站平台，适合各类商家",
       "Shopify是全球最大的电商建站平台，帮助商家快速创建在线商店。提供支付、库存、物流、营销等一站式电商解决方案。", "dian-shang-ling-shou", "Shopify Inc", "2006", "加拿大渥太华", "付费", "Basic $39/月 | Shopify $105/月", 4.5, 3200, 4000000],
      ["有赞", "youzan", "https://youzan.com", "中国领先的SaaS电商服务平台",
       "有赞是中国领先的SaaS服务商，为商家提供微商城、小程序、社交电商等解决方案。支持多渠道开店、会员管理、营销工具等。", "dian-shang-ling-shou", "中国杭州", "2012", "中国杭州", "付费", "基础版6800/年起", 4.2, 1800, 2000000],
      ["WooCommerce", "woocommerce", "https://woocommerce.com", "WordPress电商插件，开源免费",
       "WooCommerce是WordPress最流行的电商插件，开源免费。拥有丰富的扩展生态，适合有一定技术基础的用户。", "dian-shang-ling-shou", "Automattic", "2011", "美国", "免费", "扩展插件按需购买", 4.3, 2500, 3000000],

      // 数字营销
      ["SEMrush", "semrush", "https://semrush.com", "综合数字营销工具，涵盖SEO、SEM、社交媒体",
       "SEMrush是全球领先的数字营销工具，提供SEO分析、关键词研究、竞争对手分析、广告优化等功能。适合营销团队和SEO专业人士。", "shu-zi-ying-xiao", "SEMrush Inc", "2008", "美国", "付费", "Pro $130/月 | Guru $250/月", 4.4, 960, 2500000],
      ["Ahrefs", "ahrefs", "https://ahrefs.com", "专业SEO工具，强大的反向链接分析",
       "Ahrefs是专业SEO工具，以其强大的反向链接数据库闻名。提供关键词研究、内容分析、排名追踪、网站审计等功能。", "shu-zi-ying-xiao", "Ahrefs", "2010", "新加坡", "付费", "Lite $99/月 | Standard $199/月", 4.5, 720, 1800000],
      ["HubSpot", "hubspot", "https://hubspot.com", "入站营销平台，集CRM、营销、销售于一体",
       "HubSpot是全球领先的入站营销平台，提供CRM、营销自动化、销售管理、客服系统等一站式解决方案。", "shu-zi-ying-xiao", "HubSpot Inc", "2006", "美国", "免费增值", "Starter $20/月 | Professional $890/月", 4.5, 1500, 3000000],

      // 设计创意
      ["Figma", "figma", "https://figma.com", "在线协作设计工具，支持UI/UX设计和原型制作",
       "Figma是基于浏览器的协作设计工具，支持UI设计、UX原型、设计系统管理。实时协作功能使其成为团队设计首选。", "she-ji-chuang-yi", "Figma Inc", "2012", "美国旧金山", "免费增值", "Professional $15/人/月", 4.9, 1500, 6000000],
      ["Canva", "canva", "https://canva.com", "在线图形设计平台，零基础也能设计",
       "Canva是最受欢迎的在线设计平台，提供海量模板和素材。无需设计基础即可创建专业级海报、社交媒体图片、演示文稿等。", "she-ji-chuang-yi", "Canva Pty Ltd", "2013", "澳大利亚悉尼", "免费增值", "Pro $13/人/月 | Teams $10/人/月", 4.7, 2800, 8000000],
      ["Adobe Creative Cloud", "adobe-cc", "https://adobe.com", "专业创意工具全家桶，包含Photoshop等",
       "Adobe Creative Cloud是专业创意工具的行业标准，包含Photoshop、Illustrator、Premiere Pro等20+专业应用。", "she-ji-chuang-yi", "Adobe Inc", "1982", "美国", "付费", "单应用 $23/月 | 全家桶 $60/月", 4.6, 3500, 5000000],

      // 企业管理
      ["Notion", "notion", "https://notion.so", "集笔记、知识库、项目管理于一体的协作平台",
       "Notion是All-in-One的工作空间，集笔记、文档、知识库、项目管理、数据库于一体。灵活性极高，适合个人和团队使用。", "qi-ye-guan-li", "Notion Labs", "2016", "美国旧金山", "免费增值", "Plus $10/人/月 | Business $18/人/月", 4.7, 1800, 7000000],
      ["飞书", "feishu", "https://feishu.cn", "字节跳动推出的协作办公平台",
       "飞书是字节跳动旗下的协作办公平台，集即时通讯、日历、文档、视频会议、OKR等功能于一体。在科技企业中广泛使用。", "qi-ye-guan-li", "字节跳动", "2019", "中国北京", "免费增值", "企业版按需定价", 4.4, 900, 4000000],
      ["钉钉", "dingtalk", "https://dingtalk.com", "阿里巴巴推出的智能协作平台",
       "钉钉是阿里巴巴推出的企业级智能协作平台，提供即时通讯、OA审批、视频会议、智能人事等功能。在中国企业市场占有率领先。", "qi-ye-guan-li", "阿里巴巴", "2014", "中国杭州", "免费增值", "专业版9800/年", 4.3, 1200, 5000000],

      // 教育培训
      ["Coursera", "coursera", "https://coursera.org", "全球领先的在线学习平台，合作顶级大学",
       "Coursera是全球领先的在线学习平台，与斯坦福、耶鲁等顶级大学合作提供课程。涵盖计算机科学、商业、数据科学等领域。", "jiao-yu-pei-xun", "Coursera Inc", "2012", "美国山景城", "免费增值", "Plus $59/月 | 专业证书按课定价", 4.5, 1600, 3000000],
      ["得到", "dedao", "https://dedao.cn", "中国领先的知识服务平台",
       "得到是罗辑思维旗下的知识服务平台，提供音频课程、电子书、知识专栏等。汇聚各领域专家，适合职场人士终身学习。", "jiao-yu-pei-xun", "得到App", "2015", "中国北京", "付费", "会员365/年", 4.3, 800, 2000000],

      // 金融科技
      ["Stripe", "stripe", "https://stripe.com", "全球领先的在线支付基础设施",
       "Stripe是全球领先的在线支付基础设施，为互联网企业提供支付处理、订阅计费、欺诈检测等服务。开发者友好的API是其最大优势。", "jin-rong-ke-ji", "Stripe Inc", "2010", "美国旧金山", "按需定价", "标准费率2.9%+30¢/笔", 4.6, 1100, 4000000],
      ["支付宝", "alipay", "https://alipay.com", "中国最大的第三方支付平台",
       "支付宝是蚂蚁集团旗下的第三方支付平台，是中国最大的移动支付工具。提供支付、理财、保险、信用等综合金融服务。", "jin-rong-ke-ji", "蚂蚁集团", "2004", "中国杭州", "按需定价", "商户费率0.6%起", 4.5, 2000, 10000000],
    ];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      await client.query(
        `INSERT INTO "Product" (id, name, slug, url, description, "longDesc", "categoryId", company, founded, location, pricing, "pricingDetail", rating, "reviewCount", "monthlyTraffic", status, "geoOptimized", "publishedAt", "createdAt", "updatedAt", tags, pros, cons, "useCases", alternatives)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'ACTIVE',true,NOW(),NOW(),NOW(), $16, $17, $18, $19, $20)`,
        [
          `prod_${i + 1}`, p[0], p[1], p[2], p[3], p[4], catIds[p[5] as string],
          p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13],
          ["AI", "工具"], ["优点一", "优点二"], ["缺点一"], ["场景一"], []
        ]
      );
    }
    console.log(`✅ 插入 ${products.length} 个产品`);

    // ===== 评价数据 =====
    const reviews = [
      ["prod_1", "张三", 4.5, "非常好用的AI助手", "日常使用非常方便，回答质量高", true],
      ["prod_1", "李四", 5.0, "改变了我的工作方式", "从写代码到写文案都能胜任", true],
      ["prod_1", "王五", 4.0, "偶尔会犯错", "总体不错但复杂推理需要验证", true],
      ["prod_2", "赵六", 5.0, "长文本处理无敌", "处理10万字文档毫无压力", true],
      ["prod_2", "钱七", 4.5, "推理能力很强", "在数学和逻辑推理方面比GPT更强", true],
      ["prod_7", "孙八", 4.5, "编程效率翻倍", "写代码速度提升明显", true],
      ["prod_7", "周九", 4.0, "好用但偶尔有bug", "总体推荐，偶有建议不准", true],
      ["prod_17", "吴十", 5.0, "设计团队必备", "协作功能太强了，告别切图标注", true],
      ["prod_18", "郑十一", 5.0, "零基础也能设计", "模板丰富，小白也能做出专业设计", true],
      ["prod_20", "冯十二", 5.0, "工作必备工具", "All in one，什么都能做", true],
    ];

    for (const r of reviews) {
      await client.query(
        `INSERT INTO "Review" (id, "productId", author, rating, title, content, verified, "createdAt", pros, cons)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8,$9)`,
        [`rev_${Math.random().toString(36).slice(2, 8)}`, r[0], r[1], r[2], r[3], r[4], r[5], [], []]
      );
    }
    console.log(`✅ 插入 ${reviews.length} 条评价`);

    // ===== 文章数据 =====
    const articles = [
      ["2026年十大AI工具推荐", "shi-da-ai-gong-ju", "BEST", "人工智能", "cat_1",
       "AI工具正在改变各行各业的工作方式。本文精选2026年最值得关注的10款AI工具，涵盖对话助手、图像生成、编程辅助等类别。",
       "## 2026年AI工具概览\n\n2026年是AI工具爆发的一年。从ChatGPT到Claude，从Midjourney到Cursor，各类AI产品不断涌现。\n\n## 十大推荐\n\n1. **ChatGPT** - 综合能力最强\n2. **Claude** - 长文本处理最佳\n3. **Midjourney** - 图像生成首选\n4. **GitHub Copilot** - 编程助手标杆\n5. **Cursor** - AI原生编辑器\n...",
       [{"question":"哪个AI工具最适合日常使用？","answer":"ChatGPT是最全面的选择，免费版即可满足日常需求。"},{"question":"AI工具安全吗？","answer":"知名厂商的AI工具安全性较高，但避免输入敏感信息。"}],
       ["AI工具", "2026推荐", "人工智能", "最佳AI"], true],
      ["ChatGPT vs Claude 全面对比", "chatgpt-vs-claude", "COMPARISON", "人工智能", "cat_1",
       "ChatGPT和Claude是目前最受欢迎的两款AI对话助手，各有优势。",
       "## 概述\n\nChatGPT（OpenAI）和Claude（Anthropic）是当前最强大的AI对话助手。\n\n## 功能对比\n\n| 特性 | ChatGPT | Claude |\n|------|---------|--------|\n| 上下文窗口 | 128K | 200K |\n| 多模态 | 支持 | 支持 |\n| 中文能力 | 优秀 | 良好 |",
       [{"question":"ChatGPT和Claude哪个更好？","answer":"两者各有优势，ChatGPT生态更丰富，Claude长文本能力更强。"}],
       ["ChatGPT", "Claude", "AI对比"], true],
      ["如何选择适合你的电商平台", "ruhe-xuanze-dian-shang-pingtai", "GUIDE", "电商零售", "cat_3",
       "选择合适的电商平台是电商成功的第一步。本指南帮助你从Shopify、有赞、WooCommerce等平台中做出最佳选择。",
       "## 为什么选择正确的电商平台很重要\n\n电商平台是你的在线商店的基础设施。选择合适的平台可以节省成本、提升效率。\n\n## 主流电商平台对比\n\n### Shopify\n全球最流行的SaaS电商平台，适合跨境卖家。\n\n### 有赞\n中国领先的社交电商平台，适合国内商家。\n\n### WooCommerce\n开源免费的WordPress电商插件，适合有技术能力的团队。",
       [{"question":"新手应该选哪个电商平台？","answer":"如果面向国内市场推荐有赞，跨境推荐Shopify，有技术能力可选WooCommerce。"}],
       ["电商平台", "电商选择", "Shopify", "有赞"], true],
    ];

    for (let i = 0; i < articles.length; i++) {
      const a = articles[i];
      await client.query(
        `INSERT INTO "Article" (id, title, slug, type, "categoryId", excerpt, content, "faqItems", keywords, published, "publishedAt", "authorName", "readTime", "wordCount", "createdAt", "updatedAt", "metaTitle", "metaDesc")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,NOW(),'AooBee编辑部',10,2000,NOW(),NOW(),$10,$11)`,
        [`art_${i + 1}`, a[0], a[1], a[2], a[4], a[5], a[6], JSON.stringify(a[7]), a[8], a[0], a[5]]
      );
    }
    console.log(`✅ 插入 ${articles.length} 篇文章`);

    await client.query("COMMIT");
    console.log("\n🎉 所有数据填充完成！");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ 错误:", e);
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

TRUNCATE TABLE public."Article" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Review" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Product" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Category" RESTART IDENTITY CASCADE;

INSERT INTO public."Category" ("id", "name", "slug", "description", "icon", "sortOrder", "published", "createdAt", "updatedAt") VALUES
('cat-ai', 'AI Tools', 'ai', 'AI assistants, content tools, and automation platforms.', '🤖', 1, true, NOW(), NOW());
INSERT INTO public."Category" ("id", "name", "slug", "description", "icon", "sortOrder", "published", "createdAt", "updatedAt") VALUES
('cat-design', 'Design Tools', 'design', 'UI, graphic, and creative design platforms.', '🎨', 2, true, NOW(), NOW());
INSERT INTO public."Category" ("id", "name", "slug", "description", "icon", "sortOrder", "published", "createdAt", "updatedAt") VALUES
('cat-marketing', 'Marketing Tools', 'marketing', 'SEO, email, analytics, and growth tools.', '📈', 3, true, NOW(), NOW());
INSERT INTO public."Category" ("id", "name", "slug", "description", "icon", "sortOrder", "published", "createdAt", "updatedAt") VALUES
('cat-productivity', 'Productivity', 'productivity', 'Collaboration, docs, and workflow tools.', '⚡', 4, true, NOW(), NOW());

INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "rating", "reviewCount", "status", "createdAt", "updatedAt") VALUES
('prod-chatgpt', 'ChatGPT', 'chatgpt', 'AI assistant for writing, research, and brainstorming.', 'cat-ai', 4.8, 126, 'ACTIVE', NOW(), NOW());
INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "rating", "reviewCount", "status", "createdAt", "updatedAt") VALUES
('prod-claude', 'Claude', 'claude', 'AI assistant for document analysis and long-form writing.', 'cat-ai', 4.7, 98, 'ACTIVE', NOW(), NOW());
INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "rating", "reviewCount", "status", "createdAt", "updatedAt") VALUES
('prod-figma', 'Figma', 'figma', 'Collaborative design platform for UI and prototyping.', 'cat-design', 4.9, 154, 'ACTIVE', NOW(), NOW());
INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "rating", "reviewCount", "status", "createdAt", "updatedAt") VALUES
('prod-canva', 'Canva', 'canva', 'Easy drag-and-drop design tool for marketing and social content.', 'cat-design', 4.6, 110, 'ACTIVE', NOW(), NOW());
INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "rating", "reviewCount", "status", "createdAt", "updatedAt") VALUES
('prod-semrush', 'Semrush', 'semrush', 'SEO toolkit for keyword research and competitive analysis.', 'cat-marketing', 4.6, 89, 'ACTIVE', NOW(), NOW());
INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "rating", "reviewCount", "status", "createdAt", "updatedAt") VALUES
('prod-notion', 'Notion', 'notion', 'Workspace for docs, projects, and knowledge management.', 'cat-productivity', 4.7, 94, 'ACTIVE', NOW(), NOW());

INSERT INTO public."Article" ("id", "title", "slug", "type", "content", "excerpt", "faqItems", "keywords", "categoryId", "published", "publishedAt", "createdAt", "updatedAt") VALUES
('art-ai-guide', '如何选择适合团队的 AI 工具', 'how-to-choose-ai-tools', 'GUIDE', '## 选择 AI 工具时要关注什么\n\n- 目标场景\n- 成本结构\n- 数据安全\n\n### 推荐流程\n先从内容生成、研究和自动化三个场景入手，逐个测试再选定方案。', '从目标场景、预算和安全需求出发，选出真正适合团队的 AI 工具。', '[{"question":"AI 工具适合哪些团队使用？","answer":"适合内容创作、研发、运营和客户支持团队。"}]'::json, ARRAY['AI工具','团队协作','生成式AI']::text[], 'cat-ai', true, NOW(), NOW(), NOW());
INSERT INTO public."Article" ("id", "title", "slug", "type", "content", "excerpt", "faqItems", "keywords", "categoryId", "published", "publishedAt", "createdAt", "updatedAt") VALUES
('art-design-guide', '设计团队如何提升协作效率', 'design-team-collaboration', 'GUIDE', '## 让设计协作更顺滑\n\n- 统一组件库\n- 建立评审流程\n- 使用版本控制\n\n### 推荐做法\n把设计系统和协作流程一起落地，能大幅减少返工。', '设计团队可以通过统一组件库、清晰评审和版本管理来提升协作效率。', '[{"question":"为什么设计协作会变慢？","answer":"因为缺少统一的组件、评审节奏和交付规范。"}]'::json, ARRAY['设计协作','设计系统','UI设计']::text[], 'cat-design', true, NOW(), NOW(), NOW());
INSERT INTO public."Article" ("id", "title", "slug", "type", "content", "excerpt", "faqItems", "keywords", "categoryId", "published", "publishedAt", "createdAt", "updatedAt") VALUES
('art-compare', 'ChatGPT 与 Claude 的主要区别', 'chatgpt-vs-claude', 'COMPARISON', '## 适合的使用场景\n\nChatGPT 更适合快速生成内容，Claude 更擅长长文档分析。\n\n### 选择建议\n如果你重视创作速度，优先 ChatGPT；如果你重视长文档理解，优先 Claude。', '这篇对比帮助你快速判断 ChatGPT 和 Claude 哪一个更适合自己的工作流。', '[{"question":"哪个更适合写作？","answer":"ChatGPT 更快，Claude 更稳。"},{"question":"哪个更适合长文档分析？","answer":"Claude 更适合。"}]'::json, ARRAY['ChatGPT','Claude','AI对比']::text[], 'cat-ai', true, NOW(), NOW(), NOW());
INSERT INTO public."Article" ("id", "title", "slug", "type", "content", "excerpt", "faqItems", "keywords", "categoryId", "published", "publishedAt", "createdAt", "updatedAt") VALUES
('art-best', '2026 最值得尝试的效率工具清单', 'best-productivity-tools-2026', 'BEST', '## 这份清单适合谁\n\n- 个人用户\n- 小团队\n- 远程协作团队\n\n### 核心标准\n以易用性、协作能力和集成能力为主。', '这篇清单总结了适合不同团队的高效协作工具。', '[{"question":"哪些工具适合小团队？","answer":"Notion、Trello 和 Slack 等都很适合。"}]'::json, ARRAY['效率工具','协作工具','最佳工具']::text[], 'cat-productivity', true, NOW(), NOW(), NOW());

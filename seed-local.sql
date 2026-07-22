TRUNCATE TABLE public."Article" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Review" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Product" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Category" RESTART IDENTITY CASCADE;

INSERT INTO public."Category" ("id", "name", "slug", "description", "icon", "imageUrl", "parentId", "sortOrder", "published", "createdAt", "updatedAt") VALUES
('cat-ai', 'AI 工具', 'ai', '人工智能工具与平台', '🤖', NULL, NULL, 1, true, NOW(), NOW()),
('cat-design', '设计工具', 'design', '设计与创意工具', '🎨', NULL, NULL, 2, true, NOW(), NOW()),
('cat-marketing', '营销工具', 'marketing', '营销与增长工具', '📈', NULL, NULL, 3, true, NOW(), NOW()),
('cat-productivity', '效率工具', 'productivity', '工作效率与协作工具', '⚡', NULL, NULL, 4, true, NOW(), NOW());

INSERT INTO public."Product" ("id", "name", "slug", "url", "description", "longDesc", "logo", "screenshots", "categoryId", "tags", "pricing", "pricingDetail", "rating", "reviewCount", "monthlyTraffic", "founded", "company", "location", "features", "pros", "cons", "alternatives", "useCases", "status", "geoOptimized", "publishedAt", "createdAt", "updatedAt") VALUES
('prod-chatgpt', 'ChatGPT', 'chatgpt', 'https://chatgpt.com', '通用AI对话与内容生成平台', '适合写作、总结、编程与知识问答。', 'https://upload.wikimedia.org/wikipedia/commons/1/1c/ChatGPT_logo.png', ARRAY[]::text[], 'cat-ai', ARRAY['AI','写作','助手']::text[], '中高端', '按使用量计费', 4.8, 126, 5000000, '2022', 'OpenAI', '美国', '{"mode":"chat"}', ARRAY['响应快','能力强']::text[], ARRAY['价格较高']::text[], ARRAY['Claude','Gemini']::text[], ARRAY['内容创作','编程']::text[], 'ACTIVE', true, NOW(), NOW(), NOW()),
('prod-notion', 'Notion', 'notion', 'https://www.notion.so', '全能型工作流与知识管理工具', '适合团队协作、笔记和项目管理。', NULL, ARRAY[]::text[], 'cat-productivity', ARRAY['效率','知识管理','协作']::text[], '中端', '按团队规模计费', 4.7, 94, 3200000, '2013', 'Notion Labs', '美国', '{"mode":"workspace"}', ARRAY['界面好','灵活']::text[], ARRAY['学习曲线略高']::text[], ARRAY['Trello','Obsidian']::text[], ARRAY['项目管理','知识库']::text[], 'ACTIVE', true, NOW(), NOW(), NOW());

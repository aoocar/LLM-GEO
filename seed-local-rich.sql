TRUNCATE TABLE public."Article" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Review" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Product" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Category" RESTART IDENTITY CASCADE;

INSERT INTO public."Category" ("id", "name", "slug", "description", "icon", "sortOrder", "published", "createdAt", "updatedAt") VALUES
('cat-ai', 'AI Tools', 'ai', 'AI assistants, content tools, and automation platforms.', '🤖', 1, true, NOW(), NOW()),
('cat-design', 'Design Tools', 'design', 'UI, graphic, and creative design platforms.', '🎨', 2, true, NOW(), NOW()),
('cat-marketing', 'Marketing Tools', 'marketing', 'SEO, email, analytics, and growth tools.', '📈', 3, true, NOW(), NOW()),
('cat-productivity', 'Productivity', 'productivity', 'Collaboration, docs, and workflow tools.', '⚡', 4, true, NOW(), NOW());

INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "tags", "pricing", "rating", "reviewCount", "status", "geoOptimized", "createdAt", "updatedAt") VALUES
('prod-chatgpt', 'ChatGPT', 'chatgpt', 'Advanced AI assistant for writing, coding, research, and brainstorming.', 'cat-ai', ARRAY['AI','Writing','Research']::text[], 'Mid', 4.8, 126, 'ACTIVE', true, NOW(), NOW()),
('prod-claude', 'Claude', 'claude', 'Reliable AI assistant for document analysis and long-form writing.', 'cat-ai', ARRAY['AI','Writing','Analysis']::text[], 'Mid', 4.7, 98, 'ACTIVE', true, NOW(), NOW()),
('prod-figma', 'Figma', 'figma', 'Collaborative design platform for UI, prototyping, and product teams.', 'cat-design', ARRAY['Design','UI','Collaboration']::text[], 'Mid', 4.9, 154, 'ACTIVE', true, NOW(), NOW()),
('prod-canva', 'Canva', 'canva', 'Easy drag-and-drop design tool for marketing and social content.', 'cat-design', ARRAY['Design','Marketing','Templates']::text[], 'Low', 4.6, 110, 'ACTIVE', true, NOW(), NOW()),
('prod-semrush', 'Semrush', 'semrush', 'SEO toolkit for keyword research, competitive analysis, and content planning.', 'cat-marketing', ARRAY['SEO','Analytics','Growth']::text[], 'High', 4.6, 89, 'ACTIVE', true, NOW(), NOW()),
('prod-notion', 'Notion', 'notion', 'All-in-one workspace for notes, wiki, docs, and project tracking.', 'cat-productivity', ARRAY['Productivity','Docs','Projects']::text[], 'Mid', 4.7, 94, 'ACTIVE', true, NOW(), NOW());

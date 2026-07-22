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
('prod-chatgpt', 'ChatGPT', 'chatgpt', 'AI assistant for writing and research.', 'cat-ai', 4.8, 126, 'ACTIVE', NOW(), NOW());
INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "rating", "reviewCount", "status", "createdAt", "updatedAt") VALUES
('prod-claude', 'Claude', 'claude', 'AI assistant for document analysis and long-form writing.', 'cat-ai', 4.7, 98, 'ACTIVE', NOW(), NOW());
INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "rating", "reviewCount", "status", "createdAt", "updatedAt") VALUES
('prod-figma', 'Figma', 'figma', 'Collaborative design platform for UI and prototyping.', 'cat-design', 4.9, 154, 'ACTIVE', NOW(), NOW());
INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "rating", "reviewCount", "status", "createdAt", "updatedAt") VALUES
('prod-notion', 'Notion', 'notion', 'Workspace for docs, projects, and knowledge management.', 'cat-productivity', 4.7, 94, 'ACTIVE', NOW(), NOW());

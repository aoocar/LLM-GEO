TRUNCATE TABLE public."Article" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Review" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Product" RESTART IDENTITY CASCADE;
TRUNCATE TABLE public."Category" RESTART IDENTITY CASCADE;

INSERT INTO public."Category" ("id", "name", "slug", "description", "icon", "sortOrder", "published", "createdAt", "updatedAt") VALUES
('cat-ai', 'AI Tools', 'ai', 'AI tools and platforms', '🤖', 1, true, NOW(), NOW()),
('cat-design', 'Design Tools', 'design', 'Design and creative tools', '🎨', 2, true, NOW(), NOW()),
('cat-marketing', 'Marketing Tools', 'marketing', 'Marketing and growth tools', '📈', 3, true, NOW(), NOW());

INSERT INTO public."Product" ("id", "name", "slug", "description", "categoryId", "tags", "pricing", "rating", "reviewCount", "status", "geoOptimized", "createdAt", "updatedAt") VALUES
('prod-chatgpt', 'ChatGPT', 'chatgpt', 'General AI conversation and content generation platform.', 'cat-ai', ARRAY['AI','Writing']::text[], 'Mid', 4.8, 126, 'ACTIVE', true, NOW(), NOW()),
('prod-notion', 'Notion', 'notion', 'All-in-one workspace for notes, docs, and projects.', 'cat-design', ARRAY['Productivity','Docs']::text[], 'Mid', 4.7, 94, 'ACTIVE', true, NOW(), NOW());

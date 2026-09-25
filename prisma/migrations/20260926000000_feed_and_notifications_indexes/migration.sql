-- Support the ordered feed and bounded account activity lookups.
CREATE INDEX IF NOT EXISTS "posts_createdAt_id_idx" ON "posts" ("createdAt", "id");
CREATE INDEX IF NOT EXISTS "posts_city_createdAt_id_idx" ON "posts" ("city", "createdAt", "id");
CREATE INDEX IF NOT EXISTS "UserInteraction_userId_createdAt_idx" ON "UserInteraction" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "orders_userId_createdAt_idx" ON "orders" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "bookmarks_userId_createdAt_idx" ON "bookmarks" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "notifications_recipientId_read_idx" ON "notifications" ("recipientId", "read");

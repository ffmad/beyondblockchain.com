-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "sentAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "role" TEXT,
    "startedYear" INTEGER NOT NULL,
    "status" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "logoUrl" TEXT,
    "imageUrl" TEXT,
    "mobileImageUrl" TEXT,
    "imageAlt" TEXT,
    "imageCaption" TEXT,
    "stack" JSONB NOT NULL DEFAULT '[]',
    "translations" JSONB NOT NULL DEFAULT '{}',
    "kind" TEXT NOT NULL DEFAULT 'product',
    "stage" TEXT,
    "platforms" JSONB NOT NULL DEFAULT '[]',
    "languages" JSONB NOT NULL DEFAULT '[]',
    "endedYear" INTEGER,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("audience", "category", "createdAt", "description", "displayOrder", "featured", "id", "imageAlt", "imageCaption", "imageUrl", "internalNotes", "logoUrl", "mobileImageUrl", "name", "published", "role", "slug", "stack", "startedYear", "status", "summary", "translations", "updatedAt", "url") SELECT "audience", "category", "createdAt", "description", "displayOrder", "featured", "id", "imageAlt", "imageCaption", "imageUrl", "internalNotes", "logoUrl", "mobileImageUrl", "name", "published", "role", "slug", "stack", "startedYear", "status", "summary", "translations", "updatedAt", "url" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_published_displayOrder_idx" ON "Project"("published", "displayOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ContactMessage_delivery_nextAttemptAt_idx" ON "ContactMessage"("delivery", "nextAttemptAt");

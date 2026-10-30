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
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("audience", "category", "createdAt", "description", "displayOrder", "featured", "id", "imageAlt", "imageCaption", "imageUrl", "internalNotes", "logoUrl", "mobileImageUrl", "name", "published", "role", "slug", "startedYear", "status", "summary", "updatedAt", "url") SELECT "audience", "category", "createdAt", "description", "displayOrder", "featured", "id", "imageAlt", "imageCaption", "imageUrl", "internalNotes", "logoUrl", "mobileImageUrl", "name", "published", "role", "slug", "startedYear", "status", "summary", "updatedAt", "url" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_published_displayOrder_idx" ON "Project"("published", "displayOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

/*
  Warnings:

  - The values [NEWS_BREAKING,NEWS_KEYWORD] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `newsId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `allowBreakingNews` on the `UserSetting` table. All the data in the column will be lost.
  - You are about to drop the column `allowKeywordAlert` on the `UserSetting` table. All the data in the column will be lost.
  - You are about to drop the column `defaultRegion` on the `UserSetting` table. All the data in the column will be lost.
  - You are about to drop the `NewsNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'SYSTEM');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_newsId_fkey";

-- DropIndex
DROP INDEX "Notification_newsId_idx";

-- DropIndex
DROP INDEX "Notification_userId_newsId_type_key";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "newsId";

-- AlterTable
ALTER TABLE "UserSetting" DROP COLUMN "allowBreakingNews",
DROP COLUMN "allowKeywordAlert",
DROP COLUMN "defaultRegion";

-- DropTable
DROP TABLE "NewsNotification";

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "thumbnailUrl" TEXT,
    "originalLink" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_originalLink_key" ON "News"("originalLink");

-- CreateIndex
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");

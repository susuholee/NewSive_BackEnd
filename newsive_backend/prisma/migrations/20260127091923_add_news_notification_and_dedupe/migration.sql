/*
  Warnings:

  - A unique constraint covering the columns `[originalLink]` on the table `NewsNotification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,newsId,type]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "NewsNotification" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "NewsNotification_originalLink_key" ON "NewsNotification"("originalLink");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_newsId_type_key" ON "Notification"("userId", "newsId", "type");

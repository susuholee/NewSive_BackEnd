/*
  Warnings:

  - You are about to drop the `NewsNotificaiton` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_newsId_fkey";

-- DropTable
DROP TABLE "NewsNotificaiton";

-- CreateTable
CREATE TABLE "NewsNotification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalLink" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "sourceName" TEXT NOT NULL,

    CONSTRAINT "NewsNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "NewsNotification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

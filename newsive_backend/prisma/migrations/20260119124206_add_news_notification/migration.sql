-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "newsId" TEXT;

-- CreateTable
CREATE TABLE "NewsNotificaiton" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalLink" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "sourceName" TEXT NOT NULL,

    CONSTRAINT "NewsNotificaiton_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_newsId_idx" ON "Notification"("newsId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "NewsNotificaiton"("id") ON DELETE SET NULL ON UPDATE CASCADE;

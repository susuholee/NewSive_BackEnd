/*
  Warnings:

  - You are about to drop the column `allowNotify` on the `UserSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserSetting" DROP COLUMN "allowNotify",
ADD COLUMN     "allowNotification" BOOLEAN NOT NULL DEFAULT true;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'NEWS_BREAKING';
ALTER TYPE "NotificationType" ADD VALUE 'NEWS_KEYWORD';
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM';

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "birthday" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserSetting" ADD COLUMN     "allowBreakingNews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowKeywordAlert" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "defaultRegion" TEXT;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_friendUserId_fkey" FOREIGN KEY ("friendUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

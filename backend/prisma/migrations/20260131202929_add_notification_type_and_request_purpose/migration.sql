-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH', 'MESSAGE', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_matchId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "conversationId" INTEGER,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'MATCH',
ALTER COLUMN "matchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "purpose" "PurposeType";

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

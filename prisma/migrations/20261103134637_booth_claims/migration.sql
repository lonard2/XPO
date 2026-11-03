-- AlterTable
ALTER TABLE "BoothTenant" ADD COLUMN     "claimStatus" TEXT NOT NULL DEFAULT 'UNCLAIMED',
ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "BoothTenant_userId_idx" ON "BoothTenant"("userId");

-- CreateIndex
CREATE INDEX "BoothTenant_eventId_claimStatus_idx" ON "BoothTenant"("eventId", "claimStatus");

-- AddForeignKey
ALTER TABLE "BoothTenant" ADD CONSTRAINT "BoothTenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

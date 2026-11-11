-- Team admins (restricted admins): who onboarded an agent, their commission
-- limit and invite code, plus the agent behind a Mawista record. Additive only.
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "commissionLimit" INTEGER,
ADD COLUMN     "inviteCode" TEXT,
ADD COLUMN     "teamAdminId" TEXT;

-- AlterTable
ALTER TABLE "MawsitaRecord" ADD COLUMN     "agentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_inviteCode_key" ON "User"("inviteCode");

-- CreateIndex
CREATE INDEX "User_teamAdminId_idx" ON "User"("teamAdminId");

-- CreateIndex
CREATE INDEX "MawsitaRecord_agentId_idx" ON "MawsitaRecord"("agentId");


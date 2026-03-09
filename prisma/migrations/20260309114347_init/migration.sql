-- DropIndex
DROP INDEX "Friend_userId_lastContact_idx";

-- CreateIndex
CREATE INDEX "Friend_userId_lastContact_idx" ON "Friend"("userId" ASC, "lastContact" DESC);

-- AlterEnum
ALTER TYPE "VerificationCodePurpose" ADD VALUE IF NOT EXISTS 'REGISTER';
ALTER TYPE "VerificationCodePurpose" ADD VALUE IF NOT EXISTS 'RESET_PASSWORD';

-- AlterTable
ALTER TABLE "EmailVerificationCode"
ADD COLUMN "verifiedTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "verifiedTokenHash" VARCHAR(128);

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "passwordHash" VARCHAR(255);

-- CreateIndex
CREATE INDEX "EmailVerificationCode_email_purpose_verifiedTokenExpiresAt_idx"
ON "EmailVerificationCode"("email", "purpose", "verifiedTokenExpiresAt");

-- CreateIndex
CREATE INDEX "EmailVerificationCode_verifiedTokenHash_idx"
ON "EmailVerificationCode"("verifiedTokenHash");

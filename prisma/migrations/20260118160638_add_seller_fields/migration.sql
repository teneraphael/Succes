-- AlterTable
ALTER TABLE "users" ADD COLUMN     "businessDomain" TEXT,
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessProducts" TEXT,
ADD COLUMN     "isSeller" BOOLEAN NOT NULL DEFAULT false;

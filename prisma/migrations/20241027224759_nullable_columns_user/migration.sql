-- AlterTable
ALTER TABLE "User" ALTER COLUMN "changePasswordToken" DROP NOT NULL,
ALTER COLUMN "changePasswordTokenExpiry" DROP NOT NULL;

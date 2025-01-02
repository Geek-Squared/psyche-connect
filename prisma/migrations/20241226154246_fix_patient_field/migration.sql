/*
  Warnings:

  - You are about to drop the column `birthDate` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `referralSource` on the `Patient` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'PARTNER', 'DIVORCED', 'WIDOWED');

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "birthDate",
DROP COLUMN "phone",
DROP COLUMN "referralSource",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "cellPhone" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "homePhone" TEXT,
ADD COLUMN     "maritalStatus" "MaritalStatus",
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "reasonForService" TEXT,
ADD COLUMN     "referringDoctor" TEXT;

-- CreateTable
CREATE TABLE "NextOfKin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "homePhone" TEXT,
    "cellPhone" TEXT,
    "address" TEXT,
    "email" TEXT,
    "relationship" TEXT,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "NextOfKin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NextOfKin_patientId_key" ON "NextOfKin"("patientId");

-- AddForeignKey
ALTER TABLE "NextOfKin" ADD CONSTRAINT "NextOfKin_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

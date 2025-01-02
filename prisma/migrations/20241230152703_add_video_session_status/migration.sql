/*
  Warnings:

  - A unique constraint covering the columns `[roomName]` on the table `VideoSession` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appointmentId]` on the table `VideoSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointmentId` to the `VideoSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VideoSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VideoSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "VideoSession" DROP CONSTRAINT "VideoSession_patientId_fkey";

-- AlterTable
ALTER TABLE "VideoSession" ADD COLUMN     "appointmentId" TEXT NOT NULL,
ADD COLUMN     "status" "VideoSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "patientId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VideoSession_roomName_key" ON "VideoSession"("roomName");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSession_appointmentId_key" ON "VideoSession"("appointmentId");

-- AddForeignKey
ALTER TABLE "VideoSession" ADD CONSTRAINT "VideoSession_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSession" ADD CONSTRAINT "VideoSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

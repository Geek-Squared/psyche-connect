-- CreateTable
CREATE TABLE "VideoSession" (
    "id" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VideoSession" ADD CONSTRAINT "VideoSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

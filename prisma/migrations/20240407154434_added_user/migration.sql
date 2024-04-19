-- CreateTable
CREATE TABLE "User" (
    "userID" TEXT NOT NULL,
    "googleEmail" TEXT NOT NULL,
    "googleName" TEXT NOT NULL,
    "googlePicture" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "groupRef" TEXT,
    "lecturerRef" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleEmail_key" ON "User"("googleEmail");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupRef_fkey" FOREIGN KEY ("groupRef") REFERENCES "Group"("groupName") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lecturerRef_fkey" FOREIGN KEY ("lecturerRef") REFERENCES "Lecturer"("lecturerName") ON DELETE SET NULL ON UPDATE CASCADE;

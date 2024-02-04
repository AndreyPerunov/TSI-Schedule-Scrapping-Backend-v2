-- CreateTable
CREATE TABLE "Group" (
    "groupName" TEXT NOT NULL,
    "scrapeTimeStamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "users" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("groupName")
);

-- CreateTable
CREATE TABLE "Lecturer" (
    "lecturerName" TEXT NOT NULL,
    "scrapeTimeStamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "users" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Lecturer_pkey" PRIMARY KEY ("lecturerName")
);

-- CreateTable
CREATE TABLE "Room" (
    "roomNumber" INTEGER NOT NULL,
    "scrapeTimeStamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "users" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("roomNumber")
);

-- CreateTable
CREATE TABLE "Lecture" (
    "lectureID" TEXT NOT NULL,
    "groupRef" TEXT,
    "groups" TEXT[],
    "lecturerRef" TEXT,
    "lecturerName" TEXT NOT NULL,
    "roomRef" INTEGER,
    "roomNumber" INTEGER NOT NULL,
    "lectureNumber" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "typeOfTheClass" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("lectureID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_roomNumber_start_key" ON "Lecture"("roomNumber", "start");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_lecturerName_start_key" ON "Lecture"("lecturerName", "start");

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_groupRef_fkey" FOREIGN KEY ("groupRef") REFERENCES "Group"("groupName") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_lecturerRef_fkey" FOREIGN KEY ("lecturerRef") REFERENCES "Lecturer"("lecturerName") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_roomRef_fkey" FOREIGN KEY ("roomRef") REFERENCES "Room"("roomNumber") ON DELETE SET NULL ON UPDATE CASCADE;

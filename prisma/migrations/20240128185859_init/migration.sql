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
    "lecturerName" TEXT NOT NULL,
    "roomNumber" INTEGER NOT NULL,
    "lectureNumber" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "typeOfTheClass" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("lectureID")
);

-- CreateTable
CREATE TABLE "_GroupToLecture" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_roomNumber_start_key" ON "Lecture"("roomNumber", "start");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_lecturerName_start_key" ON "Lecture"("lecturerName", "start");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToLecture_AB_unique" ON "_GroupToLecture"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToLecture_B_index" ON "_GroupToLecture"("B");

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_lecturerName_fkey" FOREIGN KEY ("lecturerName") REFERENCES "Lecturer"("lecturerName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_roomNumber_fkey" FOREIGN KEY ("roomNumber") REFERENCES "Room"("roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToLecture" ADD CONSTRAINT "_GroupToLecture_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("groupName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToLecture" ADD CONSTRAINT "_GroupToLecture_B_fkey" FOREIGN KEY ("B") REFERENCES "Lecture"("lectureID") ON DELETE CASCADE ON UPDATE CASCADE;

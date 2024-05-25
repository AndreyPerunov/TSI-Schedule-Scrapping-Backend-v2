/*
  Warnings:

  - You are about to drop the column `subscribers` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `users` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `subscribers` on the `Lecturer` table. All the data in the column will be lost.
  - You are about to drop the column `users` on the `Lecturer` table. All the data in the column will be lost.
  - You are about to drop the column `subscribers` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `users` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "subscribers",
DROP COLUMN "users";

-- AlterTable
ALTER TABLE "Lecturer" DROP COLUMN "subscribers",
DROP COLUMN "users";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "subscribers",
DROP COLUMN "users";

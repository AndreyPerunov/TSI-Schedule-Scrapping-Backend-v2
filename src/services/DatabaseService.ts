import { Lecture } from "../types"
import { PrismaClient } from "@prisma/client"
import type { Group } from "@prisma/client"

class DatabaseService {
  saveLectures({ lectures, group, lecturer, room }: { lectures: Lecture[]; group?: string; lecturer?: string; room?: number }) {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()

      try {
        // Delete all lectures, update scrapeTimeStamp, upsert groups, lecturers and rooms
        if (group && !lecturer && !room) {
          await prisma.lecture.deleteMany({ where: { groupRef: group } })
          await prisma.group.upsert({ where: { groupName: group }, update: { scrapeTimeStamp: new Date() }, create: { groupName: group, scrapeTimeStamp: new Date() } })
        }
        if (!group && lecturer && !room) {
          await prisma.lecture.deleteMany({ where: { lecturerRef: lecturer } })
          await prisma.lecturer.upsert({ where: { lecturerName: lecturer }, update: { scrapeTimeStamp: new Date() }, create: { lecturerName: lecturer, scrapeTimeStamp: new Date() } })
        }
        if (!group && !lecturer && room) {
          await prisma.lecture.deleteMany({ where: { roomRef: room } })
          await prisma.room.upsert({ where: { roomNumber: room }, update: { scrapeTimeStamp: new Date() }, create: { roomNumber: room, scrapeTimeStamp: new Date() } })
        }

        // Creating new lectures
        for (const lecture of lectures) {
          const createdLecture = await prisma.lecture.create({
            data: {
              groupRef: group || null || undefined,
              lecturerRef: lecturer || null || undefined,
              roomRef: room || null || undefined,
              groups: lecture.groups,
              lecturerName: lecture.lecturer,
              roomNumber: lecture.room,
              lectureNumber: lecture.lectureNumber,
              subject: lecture.subject,
              typeOfTheClass: lecture.typeOfTheClass,
              comment: lecture.comment,
              start: lecture.start,
              end: lecture.end
            }
          })
          console.log(`💾 Created new lecture ${createdLecture.subject} at ${createdLecture.start}`)
        }

        resolve(void 0)
      } catch (error) {
        reject(error)
      } finally {
        prisma.$disconnect()
      }
    })
  }

  saveGroups(groups: string[]) {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()

      try {
        for (const group of groups) {
          // Check if group already exists
          const groupFromDB = await prisma.group.findUnique({
            where: { groupName: group }
          })
          // If not, create it
          if (!groupFromDB) {
            const createdGroup = await prisma.group.create({ data: { groupName: group } })
            console.log(`💾 Created new group ${createdGroup.groupName}`)
          }
        }
        resolve(void 0)
      } catch (error) {
        reject(error)
      } finally {
        prisma.$disconnect()
      }
    })
  }

  getGroups(): Promise<Group[]> {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      try {
        const groups = await prisma.group.findMany()
        resolve(groups)
      } catch (error) {
        reject(error)
      } finally {
        prisma.$disconnect()
      }
    })
  }
}

export default new DatabaseService()

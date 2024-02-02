import { Lecture } from "../types"
import { PrismaClient } from "@prisma/client"
import type { Group } from "@prisma/client"

class DatabaseService {
  async saveLectures(lectures: Lecture[]) {}

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

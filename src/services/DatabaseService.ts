import { Lecture } from "../types"
import { PrismaClient } from "@prisma/client"

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

  getGroups(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {})
  }
}

export default new DatabaseService()

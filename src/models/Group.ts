import ScraperService from "../services/ScraperService"
import { PrismaClient } from "@prisma/client"
import type { Group as GroupDB } from "@prisma/client"

class Group {
  getGroups(): Promise<GroupDB[]> {
    const prisma = new PrismaClient()
    return prisma.group.findMany()
  }
  scrapeGroups() {
    return ScraperService.getGroups()
  }

  async getActiveGroups() {
    return new Promise((resolve, reject) => {
      const prisma = new PrismaClient()
      prisma.user
        .findMany({
          where: {
            groupRef: {
              not: null
            }
          },
          select: {
            groupRef: true
          }
        })
        .then(groups => {
          resolve(groups.map(group => group.groupRef))
        })
        .catch(err => {
          reject(err)
        })
        .finally(() => {
          prisma.$disconnect()
        })
    })
  }
}

export default Group

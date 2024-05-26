import DatabaseService from "../services/DatabaseService"
import ScraperService from "../services/ScraperService"
import { google } from "googleapis"
import { PrismaClient } from "@prisma/client"

class Group {
  getGroups() {
    return DatabaseService.getGroups()
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

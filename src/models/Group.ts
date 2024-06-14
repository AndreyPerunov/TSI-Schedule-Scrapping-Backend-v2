import { PrismaClient } from "@prisma/client"
import type { Group as GroupDB } from "@prisma/client"

class Group {
  groupName: string
  scrapeTimeStamp: string | null

  constructor({ groupName, scrapeTimeStamp }: { groupName: string; scrapeTimeStamp?: string }) {
    this.groupName = groupName
    this.scrapeTimeStamp = scrapeTimeStamp || null
  }

  async saveInDB(): Promise<void> {
    const prisma = new PrismaClient()
    try {
      // check if group exists
      if (await this.groupExists()) {
        throw new Error(`❌ ${this.groupName} group already exists`)
      }

      // create group
      await prisma.group.create({
        data: {
          groupName: this.groupName
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to create group")
      throw new Error("❌ Failed to create group")
    } finally {
      await prisma.$disconnect()
    }
  }

  async removeFromDB(): Promise<void> {
    const prisma = new PrismaClient()
    try {
      // check if group exists
      if (!(await this.groupExists())) {
        throw new Error(`❌ ${this.groupName} group does not exists`)
      }

      // delete group
      await prisma.group.delete({
        where: {
          groupName: this.groupName
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to delete group")
      throw new Error("❌ Failed to delete group")
    } finally {
      await prisma.$disconnect()
    }
  }

  async updateInDB({ newGroupName, newScrapeTimeStamp }: { newGroupName: string; newScrapeTimeStamp?: string } | { newGroupName?: string; newScrapeTimeStamp: string }): Promise<void> {
    this.scrapeTimeStamp = newScrapeTimeStamp || this.scrapeTimeStamp
    const prisma = new PrismaClient()
    try {
      // check if group exists
      if (!(await this.groupExists())) {
        throw new Error(`❌ ${this.groupName} group does not exist`)
      }

      if (newScrapeTimeStamp && newGroupName) {
        // update group time stamp
        await prisma.group.update({
          where: {
            groupName: this.groupName
          },
          data: {
            scrapeTimeStamp: newScrapeTimeStamp,
            groupName: newGroupName
          }
        })
      }

      if (newGroupName && !newScrapeTimeStamp) {
        // update group name
        await prisma.group.update({
          where: {
            groupName: this.groupName
          },
          data: {
            groupName: newGroupName
          }
        })
      }

      if (newScrapeTimeStamp && !newGroupName) {
        // update group time stamp
        await prisma.group.update({
          where: {
            groupName: this.groupName
          },
          data: {
            scrapeTimeStamp: newScrapeTimeStamp
          }
        })
      }
    } catch (error: any) {
      console.error(error, "❌ Failed to update group")
      throw new Error("❌ Failed to update group")
    } finally {
      await prisma.$disconnect()
    }
  }

  private async groupExists(): Promise<boolean> {
    const prisma = new PrismaClient()
    try {
      // check if group exists
      const group = await prisma.group.findUnique({
        where: {
          groupName: this.groupName
        }
      })

      return Boolean(group)
    } catch (error: any) {
      console.error(error, "❌ Failed to find group")
      throw new Error("❌ Failed to find group")
    } finally {
      await prisma.$disconnect()
    }
  }

  static getGroups(): Promise<GroupDB[]> {
    const prisma = new PrismaClient()
    return prisma.group.findMany()
  }

  static saveGroups(groups: string[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()

      try {
        for (const group of groups) {
          // Check if group already exists. If not, create it
          await prisma.group.upsert({ where: { groupName: group }, update: { groupName: group }, create: { groupName: group } })
          console.log(`💾 Updated group ${group}`)
        }
        resolve(void 0)
      } catch (error) {
        reject(error)
      } finally {
        prisma.$disconnect()
      }
    })
  }

  static async getActiveGroups() {
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

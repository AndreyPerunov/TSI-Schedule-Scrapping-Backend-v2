import { PrismaClient } from "@prisma/client"
import type { Lecturer as LecturerDB } from "@prisma/client"

class Lecturer {
  lecturerName: string
  scrapeTimeStamp: string | null

  constructor({ lecturerName, scrapeTimeStamp }: { lecturerName: string; scrapeTimeStamp?: string }) {
    this.lecturerName = lecturerName
    this.scrapeTimeStamp = scrapeTimeStamp || null
  }

  async saveInDB(): Promise<void> {
    const prisma = new PrismaClient()
    try {
      // check if Lecturer exists
      if (await this.lecturerExists()) {
        throw new Error(`❌ ${this.lecturerName} lecturer already exists`)
      }

      // create lecturer
      await prisma.lecturer.create({
        data: {
          lecturerName: this.lecturerName
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to create lecturer")
      throw new Error("❌ Failed to create lecturer")
    } finally {
      await prisma.$disconnect()
    }
  }

  async removeFromDB(): Promise<void> {
    const prisma = new PrismaClient()
    try {
      // check if lecturer exists
      if (!(await this.lecturerExists())) {
        throw new Error(`❌ ${this.lecturerName} lecturer does not exists`)
      }

      // delete lecturer
      await prisma.lecturer.delete({
        where: {
          lecturerName: this.lecturerName
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to delete lecturer")
      throw new Error("❌ Failed to delete lecturer")
    } finally {
      await prisma.$disconnect()
    }
  }

  async updateInDB({ newLecturerName, newScrapeTimeStamp }: { newLecturerName: string; newScrapeTimeStamp?: string } | { newLecturerName?: string; newScrapeTimeStamp: string }): Promise<void> {
    this.scrapeTimeStamp = newScrapeTimeStamp || this.scrapeTimeStamp
    const prisma = new PrismaClient()
    try {
      // check if lecturer exists
      if (!(await this.lecturerExists())) {
        throw new Error(`❌ ${this.lecturerName} lecturer does not exists`)
      }

      // update lecturer
      if (newLecturerName && newScrapeTimeStamp) {
        await prisma.lecturer.update({
          where: {
            lecturerName: this.lecturerName
          },
          data: {
            lecturerName: newLecturerName,
            scrapeTimeStamp: newScrapeTimeStamp
          }
        })
      }

      if (newLecturerName) {
        await prisma.lecturer.update({
          where: {
            lecturerName: this.lecturerName
          },
          data: {
            lecturerName: newLecturerName
          }
        })
      }

      if (newScrapeTimeStamp) {
        await prisma.lecturer.update({
          where: {
            lecturerName: this.lecturerName
          },
          data: {
            scrapeTimeStamp: newScrapeTimeStamp
          }
        })
      }
    } catch (error: any) {
      console.error(error, "❌ Failed to update lecturer")
      throw new Error("❌ Failed to update lecturer")
    } finally {
      await prisma.$disconnect()
    }
  }

  private async lecturerExists(): Promise<boolean> {
    const prisma = new PrismaClient()
    try {
      // check if lecturer exists
      const lecturer = await prisma.lecturer.findUnique({
        where: {
          lecturerName: this.lecturerName
        }
      })

      return Boolean(lecturer)
    } catch (error: any) {
      console.error(error, "❌ Failed to find lecturer")
      throw new Error("❌ Failed to find lecturer")
    } finally {
      await prisma.$disconnect()
    }
  }

  static saveLecturers(lecturers: string[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()

      try {
        for (const lecturer of lecturers) {
          // Check if lecturer already exists. If not, create it
          await prisma.lecturer.upsert({ where: { lecturerName: lecturer }, update: { lecturerName: lecturer }, create: { lecturerName: lecturer } })
          console.log(`💾 Updated lecturer ${lecturer}`)
        }
        resolve(void 0)
      } catch (error) {
        reject(error)
      } finally {
        prisma.$disconnect()
      }
    })
  }

  static getLecturers(): Promise<LecturerDB[]> {
    const prisma = new PrismaClient()
    return prisma.lecturer.findMany()
  }
}

export default Lecturer

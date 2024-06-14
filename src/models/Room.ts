import { PrismaClient } from "@prisma/client"
import type { Room as RoomDB } from "@prisma/client"

class Room {
  roomNumber: string
  scrapeTimeStamp: string | null

  constructor({ roomNumber, scrapeTimeStamp }: { roomNumber: string; scrapeTimeStamp?: string }) {
    this.roomNumber = roomNumber
    this.scrapeTimeStamp = scrapeTimeStamp || null
  }

  async saveInDB(): Promise<void> {
    const prisma = new PrismaClient()
    try {
      // check if room exists
      if (await this.roomExists()) {
        throw new Error(`❌ ${this.roomNumber} room already exists`)
      }

      // create room
      await prisma.room.create({
        data: {
          roomNumber: this.roomNumber
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to create room")
      throw new Error("❌ Failed to create room")
    } finally {
      await prisma.$disconnect()
    }
  }

  async removeFromDB(): Promise<void> {
    const prisma = new PrismaClient()
    try {
      // check if room exists
      if (!(await this.roomExists())) {
        throw new Error(`❌ ${this.roomNumber} room does not exists`)
      }

      // delete room
      await prisma.room.delete({
        where: {
          roomNumber: this.roomNumber
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to delete room")
      throw new Error("❌ Failed to delete room")
    } finally {
      await prisma.$disconnect()
    }
  }

  async updateInDB({ newRoomNumber, newScrapeTimeStamp }: { newRoomNumber: string; newScrapeTimeStamp?: string } | { newRoomNumber?: string; newScrapeTimeStamp: string }): Promise<void> {
    this.scrapeTimeStamp = newScrapeTimeStamp || this.scrapeTimeStamp
    const prisma = new PrismaClient()
    try {
      // check if room exists
      if (!(await this.roomExists())) {
        throw new Error(`❌ ${this.roomNumber} room does not exists`)
      }

      // update room
      if (newRoomNumber && newScrapeTimeStamp) {
        await prisma.room.update({
          where: {
            roomNumber: this.roomNumber
          },
          data: {
            roomNumber: newRoomNumber,
            scrapeTimeStamp: newScrapeTimeStamp
          }
        })
      }

      if (newRoomNumber && !newScrapeTimeStamp) {
        await prisma.room.update({
          where: {
            roomNumber: this.roomNumber
          },
          data: {
            roomNumber: newRoomNumber
          }
        })
      }

      if (!newRoomNumber && newScrapeTimeStamp) {
        await prisma.room.update({
          where: {
            roomNumber: this.roomNumber
          },
          data: {
            scrapeTimeStamp: newScrapeTimeStamp
          }
        })
      }
    } catch (error: any) {
      console.error(error, "❌ Failed to update room")
      throw new Error("❌ Failed to update room")
    } finally {
      await prisma.$disconnect()
    }
  }

  private async roomExists(): Promise<boolean> {
    const prisma = new PrismaClient()
    try {
      const room = await prisma.room.findUnique({
        where: {
          roomNumber: this.roomNumber
        }
      })
      return Boolean(room)
    } catch (error: any) {
      console.error(error, "❌ Failed to check if room exists")
      throw new Error("❌ Failed to check if room exists")
    } finally {
      await prisma.$disconnect()
    }
  }

  static getRooms(): Promise<RoomDB[]> {
    const prisma = new PrismaClient()
    return prisma.room.findMany()
  }

  static saveRooms(rooms: string[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()

      try {
        for (const room of rooms) {
          // Check if room already exists. If not, create it
          await prisma.room.upsert({ where: { roomNumber: room }, update: { roomNumber: room }, create: { roomNumber: room } })
          console.log(`💾 Updated room ${room}`)
        }
        resolve(void 0)
      } catch (error) {
        reject(error)
      } finally {
        prisma.$disconnect()
      }
    })
  }
}

export default Room

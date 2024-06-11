import { PrismaClient } from "@prisma/client"
import type { Room as RoomDB } from "@prisma/client"
import ScraperService from "../services/ScraperService"

class Room {
  getRooms(): Promise<RoomDB[]> {
    const prisma = new PrismaClient()
    return prisma.room.findMany()
  }
  scrapeRooms() {
    return ScraperService.getRooms()
  }
}

export default Room

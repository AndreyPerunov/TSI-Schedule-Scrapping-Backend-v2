import { PrismaClient } from "@prisma/client"
import type { Lecturer as LecturerDB } from "@prisma/client"
import ScraperService from "../services/ScraperService"

class Lecturer {
  getLecturers(): Promise<LecturerDB[]> {
    const prisma = new PrismaClient()
    return prisma.lecturer.findMany()
  }
  scrapeLecturers() {
    return ScraperService.getLecturers()
  }
}

export default Lecturer

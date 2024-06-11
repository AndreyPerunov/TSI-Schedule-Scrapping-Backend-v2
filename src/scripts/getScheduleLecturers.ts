import ScraperService from "../services/ScraperService"
import { PrismaClient } from "@prisma/client"

;(async () => {
  console.log("📜 Scraping schedule for lecturers...")
  const prisma = new PrismaClient()
  try {
    console.log("📜 Getting active lecturers")
    // get active lecturers
    const lecturers = await prisma.user
      .findMany({
        where: {
          lecturerRef: {
            not: null
          }
        },
        select: {
          lecturerRef: true
        }
      })
      .then(data => data.map(item => item.lecturerRef))

    console.log({ lecturers })

    console.log("📜 Scraping schedule for lecturers")
    // scrape schedule for lecturers
    if (lecturers.length > 0) {
      for (const lecturer of lecturers) {
        if (lecturer) await ScraperService.getSchedule({ lecturer: lecturer })
      }
    }
  } catch (error) {
    console.log("📜 Failed to scrape schedule for lecturers❌", error)
  } finally {
    prisma.$disconnect()
    console.log("📜 Finished schedule scraping for lecturers✅")
  }
})()

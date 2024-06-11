import ScraperService from "../services/ScraperService"
import { PrismaClient } from "@prisma/client"

;(async () => {
  console.log("📜 Scraping schedule for groups...")
  const prisma = new PrismaClient()
  try {
    // get active groups
    console.log("📜 Getting active groups")
    const groups = await prisma.user
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
      .then(data => data.map(item => item.groupRef))

    console.log({ groups })

    console.log("📜 Scraping schedule for groups")
    // scrape schedule for groups
    if (groups.length > 0) {
      for (const group of groups) {
        if (group) await ScraperService.getSchedule({ group: group })
      }
    }
  } catch (error) {
    console.log("📜 Failed to scrape schedule❌", error)
  } finally {
    prisma.$disconnect()
    console.log("📜 Finished scraping for groups ✅")
  }
})()

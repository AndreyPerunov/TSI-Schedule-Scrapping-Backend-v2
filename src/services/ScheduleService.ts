import schedule from "node-schedule"
import ScraperService from "./ScraperService"
import { PrismaClient } from "@prisma/client"

class ScheduleService {
  startScheduledScrape() {
    // At 06:00 on every day-of-month. (0 6 */1 * *)
    schedule.scheduleJob("0 6 */1 * *", async () => {
      console.log("🕐 Starting schedule scraping at " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())
      const prisma = new PrismaClient()
      try {
        // get active groups
        console.log("🕐 Getting active groups")
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

        console.log("🕐 Getting active lecturers")
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

        console.log("🕐 Scraping schedule for groups")
        // scrape schedule for groups
        if (groups.length > 0) {
          for (const group of groups) {
            if (group) await ScraperService.getSchedule({ group: group })
          }
        }

        console.log("🕐 Scraping schedule for lecturers")
        // scrape schedule for lecturers
        if (lecturers.length > 0) {
          for (const lecturer of lecturers) {
            if (lecturer) await ScraperService.getSchedule({ lecturer: lecturer })
          }
        }
      } catch (error) {
        console.log("🕐 Failed to scrape schedule❌", error)
      } finally {
        prisma.$disconnect()
        console.log("🕐 Finished schedule scraping✅")
      }
    })
  }

  startScheduledGroupScrape() {
    // At 02:00 on day-of-month 1 in every month (0 2 1 */1 *)
    schedule.scheduleJob("0 2 1 */1 *", () => {
      console.log("🕐 Starting group scraping at " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())
      ScraperService.getGroups()
        .then(() => {
          console.log("🕐 Finished group scraping✅")
        })
        .catch(error => {
          console.log("🕐 Failed to scrape groups❌")
        })
    })
  }

  startScheduledLecturersScrape() {
    // At 03:00 on day-of-month 1 in every month (0 3 1 */1 *)
    schedule.scheduleJob("0 3 1 */1 *", () => {
      console.log("🕐 Starting lecturers scraping at " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())
      ScraperService.getLecturers()
        .then(() => {
          console.log("🕐 Finished lecturers scraping✅")
        })
        .catch(error => {
          console.log("🕐 Failed to scrape lecturers❌")
        })
    })
  }

  startScheduledRoomsScrape() {
    // At 04:00 on day-of-month 1 in every month (0 4 1 */1 *)
    schedule.scheduleJob("0 4 1 */1 *", () => {
      console.log("🕐 Starting rooms scraping at " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())
      ScraperService.getRooms()
        .then(() => {
          console.log("🕐 Finished rooms scraping✅")
        })
        .catch(error => {
          console.log("🕐 Failed to scrape rooms❌")
        })
    })
  }
}

export default new ScheduleService()

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

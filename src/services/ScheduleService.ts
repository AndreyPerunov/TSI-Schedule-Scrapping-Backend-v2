import schedule from "node-schedule"
import Scraper from "./ScraperService"

class ScheduleService {
  startScheduledScrape() {
    // At 06:00 on every day-of-month. (0 6 */1 * *)
    schedule.scheduleJob("0 6 */1 * *", () => {
      console.log("🕐 Starting schedule scraping at " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())
      Scraper.getSchedule({ group: "4203BDA" })
        .then(() => {
          console.log("🕐 Finished schedule scraping✅")
        })
        .catch(error => {
          console.log("🕐 Failed tp scrape schedule❌")
        })
    })
  }
  startScheduledGroupScrape() {
    // At 02:00 on day-of-month 1 in every month (0 2 1 */1 *)
    schedule.scheduleJob("0 2 1 */1 *", () => {
      console.log("🕐 Starting group scraping  at " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())
      Scraper.getGroups()
        .then(() => {
          console.log("🕐 Finished group scraping✅")
        })
        .catch(error => {
          console.log("🕐 Failed tp scrape groups❌")
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

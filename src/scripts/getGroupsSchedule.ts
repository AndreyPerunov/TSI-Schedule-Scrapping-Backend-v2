import ScraperService from "../services/ScraperService"
import DatabaseService from "../services/DatabaseService"

console.log("📜 Scraping schedule for groups...")
DatabaseService.getGroups()
  .then(async groups => {
    for (const group of groups) {
      if (group.users > 0 || group.subscribers > 0) {
        await ScraperService.getSchedule({ group: group.groupName })
          .then(() => console.log(`📜 Finished scraping for group ${group.groupName} ✅`))
          .catch(() => console.log(`📜 Failed to scrape schedule for group ${group.groupName} ❌`))
      }
    }
    console.log("📜 Finished scraping for groups ✅")
  })
  .catch(error => {
    console.log("📜 Failed to get schedule for groups❌")
    console.error(error)
  })

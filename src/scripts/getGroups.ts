import Group from "../models/Group"
import ScraperService from "services/ScraperService"

ScraperService.getGroups()
  .then(async groups => {
    try {
      await Group.saveGroups(groups)
      console.log("📜 Finished group scraping✅")
    } catch (error) {
      console.log("📜 Failed tp scrape groups❌")
      console.error(error)
    }
  })
  .catch(error => {
    console.log("📜 Failed tp scrape groups❌")
    console.error(error)
  })

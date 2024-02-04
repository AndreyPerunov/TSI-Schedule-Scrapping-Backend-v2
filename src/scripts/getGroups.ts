import ScraperService from "../services/ScraperService"

console.log("📜 Scraping groups...")
ScraperService.getGroups()
  .then(() => {
    console.log("📜 Finished group scraping✅")
  })
  .catch(error => {
    console.log("📜 Failed tp scrape groups❌")
    console.error(error)
  })

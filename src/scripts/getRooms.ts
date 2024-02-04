import ScraperService from "../services/ScraperService"

console.log("📜 Scraping rooms...")
ScraperService.getRooms()
  .then(() => {
    console.log("📜 Finished rooms scraping✅")
  })
  .catch(error => {
    console.log("📜 Failed to scrape rooms❌")
    console.error(error)
  })

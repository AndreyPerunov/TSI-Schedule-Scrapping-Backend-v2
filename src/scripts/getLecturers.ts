import ScraperService from "../services/ScraperService"

console.log("📜 Scraping lecturers...")
ScraperService.getLecturers()
  .then(() => {
    console.log("📜 Finished lecturers scraping✅")
  })
  .catch(error => {
    console.log("📜 Failed to scrape lecturers❌")
    console.error(error)
  })

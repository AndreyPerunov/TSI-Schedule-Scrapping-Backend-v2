import ScraperService from "../services/ScraperService"
import DatabaseService from "../services/DatabaseService"

console.log("📜 Scraping schedule for lecturers...")
DatabaseService.getLecturers()
  .then(async lecturers => {
    for (const lecturer of lecturers) {
      if (lecturer.users > 0 || lecturer.subscribers > 0) {
        await ScraperService.getSchedule({ lecturer: lecturer.lecturerName })
          .then(() => console.log(`📜 Finished scraping for group ${lecturer.lecturerName} ✅`))
          .catch(() => console.log(`📜 Failed to scrape schedule for group ${lecturer.lecturerName} ❌`))
      }
    }
    console.log("📜 Finished scraping for lecturers ✅")
  })
  .catch(error => {
    console.log("📜 Failed to get schedule for lecturers ❌")
    console.error(error)
  })

import ScraperService from "../services/ScraperService"
import DatabaseService from "../services/DatabaseService"

console.log("📜 Scraping schedule for rooms...")
DatabaseService.getRooms()
  .then(async rooms => {
    for (const room of rooms) {
      if (room.users > 0 || room.subscribers > 0) {
        await ScraperService.getSchedule({ room: room.roomNumber })
          .then(() => console.log(`📜 Finished scraping for room ${room.roomNumber} ✅`))
          .catch(() => console.log(`📜 Failed to scrape schedule for room ${room.roomNumber} ❌`))
      }
    }
    console.log("📜 Finished scraping for rooms ✅")
  })
  .catch(error => {
    console.log("📜 Failed to get schedule for rooms ❌")
    console.error(error)
  })

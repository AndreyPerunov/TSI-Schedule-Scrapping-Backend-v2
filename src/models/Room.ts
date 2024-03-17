import DatabaseService from "../services/DatabaseService"
import ScraperService from "../services/ScraperService"

class Room {
  getRooms() {
    return DatabaseService.getRooms()
  }
  scrapeRooms() {
    return ScraperService.getRooms()
  }
}

export default Room

import DatabaseService from "../services/DatabaseService"
import ScraperService from "../services/ScraperService"

class Lecturer {
  getLecturers() {
    return DatabaseService.getLecturers()
  }
  scrapeLecturers() {
    return ScraperService.getLecturers()
  }
}

export default Lecturer

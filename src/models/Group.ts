import DatabaseService from "../services/DatabaseService"
import ScraperService from "../services/ScraperService"

class Group {
  getGroups() {
    return DatabaseService.getGroups()
  }
  scrapeGroups() {
    return ScraperService.getGroups()
  }
}

export default Group

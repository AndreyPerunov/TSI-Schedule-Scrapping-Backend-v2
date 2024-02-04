import ScraperService from "../services/ScraperService"

class Scraper {
  getSchedule({ group, lecturer, room, days = 30 }: { group?: string; lecturer?: string; room?: string; days?: number }) {
    return ScraperService.getSchedule({ group, lecturer, room, days })
  }

  getGroups() {
    return ScraperService.getGroups()
  }

  getLecturers() {
    return ScraperService.getLecturers()
  }

  getRooms() {
    return ScraperService.getRooms()
  }
}

export default new Scraper()

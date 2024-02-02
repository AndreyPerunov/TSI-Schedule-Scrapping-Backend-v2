import ScraperService from "../services/ScraperService"

class Scraper {
  getSchedule({ group, lecturer, room, days = 30 }: { group?: string; lecturer?: string; room?: number; days?: number }) {
    return ScraperService.getSchedule({ group, lecturer, room, days })
  }

  getGroups() {
    return ScraperService.getGroups()
  }
}

export default new Scraper()

import ScraperService from "../services/ScraperService"

class Schedule {
  scrapeSchedule({ group, lecturer, room, days = 30 }: { group?: string; lecturer?: string; room?: string; days?: number }) {
    return ScraperService.getSchedule({ group, lecturer, room, days })
  }
}

export default Schedule

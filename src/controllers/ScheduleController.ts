import Schedule from "../models/Schedule"
import ScraperService from "../services/ScraperService"
import { Request, Response } from "express"
import { Lecturer, Student } from "../models/User"

class ScheduleController {
  getSchedule(req: Request, res: Response) {
    const group: string | undefined = req.query.group as string | undefined
    const lecturer: string | undefined = req.query.lecturer as string | undefined
    const room: string | undefined = req.query.room as string | undefined
    const days: number | undefined = parseInt(req.query.days as string) || undefined

    if (!group && !lecturer && !room) {
      return res.status(400).json("You must provide at least one of the following: group, lecturer, room")
    }

    if (days && days < 180 && days > 1) {
      return res.status(400).json("Days must be a number between 1 and 180")
    }

    const filters = { group, lecturer, room, days } as
      | {
          group: string
          lecturer?: string
          room?: string
          days: number
        }
      | {
          group?: string
          lecturer: string
          room?: string
          days: number
        }
      | {
          group?: string
          lecturer?: string
          room: string
          days: number
        }

    const schedule = new Schedule(filters)

    schedule.isScrapedToday().then(async isScrapedToday => {
      if (isScrapedToday) {
        console.log("📅 Schedule already scraped today, getting it from DB")
        const data = await schedule.getSchedule()
        return res.json(data)
      } else {
        console.log("📅 Schedule not scraped today, scraping it from the website")
        const lectures = await ScraperService.getSchedule(filters)
        const onlyOneFilterIsSelected = (group && !lecturer && !room) || (!group && lecturer && !room) || (!group && !lecturer && room)
        if (onlyOneFilterIsSelected && days === 30) {
          console.log("⛏️ Saving Lectures to DB...")
          await schedule.saveLecturesInDb(lectures)
        }
        return res.json(lectures)
      }
    })
  }

  async createCalendar(req: any, res: Response) {
    try {
      // get lectures, days, and calendar_name from the request body
      const { lectures, days, calendar_name } = req.body

      // user data is got from MustBeLoggedIn middleware
      let access_token: string
      if (req.user.role === "lecturer") {
        const user = new Lecturer({
          googleEmail: req.user.googleEmail,
          googleName: req.user.googleName,
          googlePicture: req.user.googlePicture,
          refreshToken: req.user.refreshToken,
          name: req.user.name
        })
        access_token = await user.getAccessToken()
      } else if (req.user.role === "student") {
        const user = new Student({
          googleEmail: req.user.googleEmail,
          googleName: req.user.googleName,
          googlePicture: req.user.googlePicture,
          refreshToken: req.user.refreshToken,
          group: req.user.group
        })
        access_token = await user.getAccessToken()
      } else {
        throw new Error("❌ User role is not valid")
      }

      await Schedule.createCalendar({ access_token, lectures, days, calendar_name })
      res.json({ message: "Calendar created successfully" })
    } catch (error) {
      console.log("❌ Error creating calendar", error)
      res.status(500).json("Something went wrong. Please try again later.")
    }
  }

  async getLastScrapeTimeStamp(req: Request, res: Response) {
    try {
      const timestamp = await Schedule.getLastScrapeTimeStamp()
      res.json({ timestamp })
    } catch (error) {
      console.log("❌ Error getting last scrape timestamp", error)
      res.status(500).json("Something went wrong. Please try again later.")
    }
  }
}

export default new ScheduleController()

import Schedule from "../models/Schedule"
import { Request, Response } from "express"

class ScheduleController {
  getSchedule(req: Request, res: Response) {
    const group: string | undefined = req.query.group as string | undefined
    const lecturer: string | undefined = req.query.lecturer as string | undefined
    const room: string | undefined = req.query.room as string | undefined
    const days: number | undefined = parseInt(req.query.days as string) || undefined

    const schedule = new Schedule()

    schedule
      .scrapeSchedule({ group, lecturer, room, days })
      .then(schedule => {
        res.json(schedule)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  async createCalendar(req: Request, res: Response) {
    try {
      const schedule = new Schedule()
      const { access_token, lectures, days, calendar_name } = req.body
      await schedule.createCalendar({ access_token, lectures, days, calendar_name })
      res.json({ message: "Calendar created successfully" })
    } catch (error) {
      console.log("❌ Error creating calendar", error)
      res.status(500).json("Something went wrong. Please try again later.")
    }
  }
}

export default new ScheduleController()

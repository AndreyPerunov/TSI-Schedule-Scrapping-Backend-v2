import Schedule from "../models/Schedule"
import { Request, Response } from "express"

class ScheduleController {
  getSchedule(req: Request, res: Response) {
    const group: string | undefined = req.query.group as string | undefined
    const lecturer: string | undefined = req.query.lecturer as string | undefined
    const room: string | undefined = req.query.lecturer as string | undefined
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
}

export default new ScheduleController()

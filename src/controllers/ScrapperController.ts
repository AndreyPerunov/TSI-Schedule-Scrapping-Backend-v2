import Scrapper from "../models/Scrapper"
import { Request, Response } from "express"

class ScrapperController {
  getSchedule(req: Request, res: Response) {
    const group: string | undefined = req.query.group as string | undefined
    const lecturer: string | undefined = req.query.lecturer as string | undefined
    const room: number | undefined = parseInt(req.query.room as string) || undefined
    const days: number | undefined = parseInt(req.query.days as string) || undefined

    Scrapper.getSchedule(group, lecturer, room, days)
      .then(schedule => {
        res.json(schedule)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  getGroups(req: Request, res: Response) {
    Scrapper.getGroups()
      .then(groups => {
        res.json(groups)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new ScrapperController()

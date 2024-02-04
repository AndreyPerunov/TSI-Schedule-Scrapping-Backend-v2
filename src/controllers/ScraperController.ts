import Scraper from "../models/Scraper"
import { Request, Response } from "express"

class ScraperController {
  getSchedule(req: Request, res: Response) {
    const group: string | undefined = req.query.group as string | undefined
    const lecturer: string | undefined = req.query.lecturer as string | undefined
    const room: string | undefined = req.query.lecturer as string | undefined
    const days: number | undefined = parseInt(req.query.days as string) || undefined

    Scraper.getSchedule({ group, lecturer, room, days })
      .then(schedule => {
        res.json(schedule)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  getGroups(req: Request, res: Response) {
    Scraper.getGroups()
      .then(groups => {
        res.json(groups)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  getLecturers(req: Request, res: Response) {
    Scraper.getLecturers()
      .then(lecturers => {
        res.json(lecturers)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  getRooms(req: Request, res: Response) {
    Scraper.getRooms()
      .then(rooms => {
        res.json(rooms)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new ScraperController()

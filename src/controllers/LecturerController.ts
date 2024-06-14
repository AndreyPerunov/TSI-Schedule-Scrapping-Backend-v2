import Lecturer from "../models/Lecturer"
import ScraperService from "../services/ScraperService"
import { Request, Response } from "express"

class LecturerController {
  getLecturers(req: Request, res: Response) {
    Lecturer.getLecturers()
      .then(lecturers => {
        res.json(lecturers)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
  scrapeLecturers(req: Request, res: Response) {
    ScraperService.getLecturers()
      .then(async lecturers => {
        try {
          await Lecturer.saveLecturers(lecturers)
          res.status(200).json("Lecturers saved in DB")
        } catch (err) {
          res.status(500).json(err)
        }
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new LecturerController()

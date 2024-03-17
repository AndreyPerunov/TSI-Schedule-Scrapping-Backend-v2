import Lecturer from "../models/Lecturer"
import { Request, Response } from "express"

class LecturerController {
  getLecturers(req: Request, res: Response) {
    const lecturer = new Lecturer()
    lecturer
      .getLecturers()
      .then(lecturers => {
        res.json(lecturers)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
  scrapeLecturers(req: Request, res: Response) {
    const lecturer = new Lecturer()
    lecturer
      .scrapeLecturers()
      .then(lecturers => {
        res.json(lecturers)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new LecturerController()

import Lecture from "../models/Lecture"
import { Request, Response } from "express"

class LecturerController {
  getLecturers(req: Request, res: Response) {
    Lecture.getLecturers()
      .then(lecturers => {
        res.json(lecturers)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new LecturerController()

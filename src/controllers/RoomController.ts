import Room from "../models/Room"
import ScraperService from "../services/ScraperService"
import { Request, Response } from "express"

class RoomController {
  getRooms(req: Request, res: Response) {
    Room.getRooms()
      .then(rooms => {
        res.json(rooms)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
  scrapeRooms(req: Request, res: Response) {
    ScraperService.getRooms()
      .then(async rooms => {
        try {
          await Room.saveRooms(rooms)
          res.status(200).json("Rooms saved in DB")
        } catch (err) {
          res.status(500).json(err)
        }
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new RoomController()

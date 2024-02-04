import Room from "../models/Room"
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
}

export default new RoomController()

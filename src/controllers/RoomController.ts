import Room from "../models/Room"
import { Request, Response } from "express"

class RoomController {
  getRooms(req: Request, res: Response) {
    const room = new Room()
    room
      .getRooms()
      .then(rooms => {
        res.json(rooms)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
  scrapeRooms(req: Request, res: Response) {
    const room = new Room()
    room
      .scrapeRooms()
      .then(rooms => {
        res.json(rooms)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new RoomController()

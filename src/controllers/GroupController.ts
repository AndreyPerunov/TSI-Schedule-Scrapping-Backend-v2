import Group from "../models/Group"
import { Request, Response } from "express"

class GroupController {
  getGroups(req: Request, res: Response) {
    Group.getGroups()
      .then(groups => {
        res.json(groups)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new GroupController()

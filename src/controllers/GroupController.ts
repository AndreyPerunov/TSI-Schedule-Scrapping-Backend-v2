import Groups from "../models/Group"
import { Request, Response } from "express"

class GroupController {
  getGroups(req: Request, res: Response) {
    Groups.getGroups()
      .then(groups => {
        res.json(groups)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new GroupController()

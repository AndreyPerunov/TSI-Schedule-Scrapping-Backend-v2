import Group from "../models/Group"
import { Request, Response } from "express"

class GroupController {
  getGroups(req: Request, res: Response) {
    const group = new Group()
    group
      .getGroups()
      .then(groups => {
        res.json(groups)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  scrapeGroups(req: Request, res: Response) {
    const group = new Group()
    group
      .scrapeGroups()
      .then(groups => {
        res.json(groups)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  getActiveGroups(req: Request, res: Response) {
    const group = new Group()
    group
      .getActiveGroups()
      .then(groups => {
        res.json(groups)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new GroupController()

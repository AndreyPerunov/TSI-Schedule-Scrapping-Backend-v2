import Group from "../models/Group"
import { Request, Response } from "express"
import ScraperService from "../services/ScraperService"

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

  scrapeGroups(req: Request, res: Response) {
    ScraperService.getGroups()
      .then(async groups => {
        try {
          await Group.saveGroups(groups)
          res.status(200).json("Groups saved in DB")
        } catch (err) {
          res.status(500).json(err)
        }
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  getActiveGroups(req: Request, res: Response) {
    Group.getActiveGroups()
      .then(groups => {
        res.json(groups)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new GroupController()

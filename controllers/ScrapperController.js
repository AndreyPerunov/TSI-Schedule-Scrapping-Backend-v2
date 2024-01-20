const Scrapper = require("../models/Scrapper")

class ScrapperController {
  getSchedule(req, res) {
    const group = req.query.group
    const lecturer = req.query.lecturer
    const room = req.query.room
    const days = req.query.days

    Scrapper.getSchedule(group, lecturer, room, days)
      .then(schedule => {
        res.json(schedule)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  getGroups(req, res) {
    Scrapper.getGroups()
      .then(groups => {
        res.json(groups)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

module.exports = new ScrapperController()

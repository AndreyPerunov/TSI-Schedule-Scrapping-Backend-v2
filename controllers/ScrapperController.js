const Scrapper = require("../models/Scrapper")

class ScrapperController {
  getSchedule(req, res) {
    Scrapper.getSchedule()
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

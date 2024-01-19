const Scrapper = require("../models/Scrapper")

class ScrapperController {
  async getSchedule(req, res) {
    const schedule = await Scrapper.getSchedule()
    res.json(schedule)
  }
}

module.exports = new ScrapperController()

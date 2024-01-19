const ScrapperController = require("./controllers/ScrapperController")
const cors = require("cors")
const express = require("express")

const router = express.Router()
router.use(cors())

router.get("/scrape", ScrapperController.getSchedule)

module.exports = router

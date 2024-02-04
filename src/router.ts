import ScraperController from "./controllers/ScraperController"
import cors from "cors"
import { Router } from "express"

const router = Router()
router.use(cors())

router.get("/scrape/schedule", ScraperController.getSchedule)
router.get("/scrape/groups", ScraperController.getGroups)
router.get("/scrape/lecturers", ScraperController.getLecturers)
router.get("/scrape/rooms", ScraperController.getRooms)

export default router

import ScraperController from "./controllers/ScraperController"
import GroupController from "./controllers/GroupController"
import LecturerController from "./controllers/LecturerController"
import cors from "cors"
import { Router } from "express"

const router = Router()
router.use(cors())

router.get("/scrape/schedule", ScraperController.getSchedule)
router.get("/scrape/groups", ScraperController.getGroups)
router.get("/scrape/lecturers", ScraperController.getLecturers)
router.get("/scrape/rooms", ScraperController.getRooms)

router.get("/api/groups", (req, res) => GroupController.getGroups(req, res))
router.get("/api/lecturers", (req, res) => LecturerController.getLecturers(req, res))

export default router

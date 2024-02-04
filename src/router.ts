import ScraperController from "./controllers/ScraperController"
import cors from "cors"
import { Router } from "express"

const router = Router()
router.use(cors())

router.get("/schedule", ScraperController.getSchedule)
router.get("/groups", ScraperController.getGroups)

export default router

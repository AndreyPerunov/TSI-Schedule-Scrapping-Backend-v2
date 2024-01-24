import ScrapperController from "./controllers/ScrapperController"
import cors from "cors"
import { Router } from "express"

const router = Router()
router.use(cors())

router.get("/scrape", ScrapperController.getSchedule)
router.get("/groups", ScrapperController.getGroups)

export default router

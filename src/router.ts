import ScheduleController from "./controllers/ScheduleController"
import GroupController from "./controllers/GroupController"
import LecturerController from "./controllers/LecturerController"
import RoomController from "./controllers/RoomController"
import UserController from "./controllers/UserController"
import cors from "cors"
import { Router } from "express"

const router = Router()
router.use(cors())

// You must provide at least one of the following: Group, Lecturer, Room
router.get("/api/schedule", ScheduleController.getSchedule)
router.post("/api/schedule", ScheduleController.createCalendar)

router.get("/api/groups", GroupController.getGroups)
router.get("/api/groups/scrape", GroupController.scrapeGroups)

router.get("/api/lecturers", LecturerController.getLecturers)
router.get("/api/lecturers/scrape", LecturerController.scrapeLecturers)

router.get("/api/rooms", RoomController.getRooms)
router.get("/api/rooms/scrape", RoomController.scrapeRooms)

router.get("/api/user/session", UserController.googleOAuthHandler)

export default router

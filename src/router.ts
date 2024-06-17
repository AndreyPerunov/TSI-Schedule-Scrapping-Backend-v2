import ScheduleController from "./controllers/ScheduleController"
import GroupController from "./controllers/GroupController"
import LecturerController from "./controllers/LecturerController"
import RoomController from "./controllers/RoomController"
import UserController from "./controllers/UserController"
import cors from "cors"
import { Router } from "express"

const router = Router()
router.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))

// You must provide at least one of the following: Group, Lecturer, Room
router.get("/api/schedule", UserController.mustBeLoggedIn, ScheduleController.getSchedule)
router.post("/api/schedule", UserController.mustBeLoggedIn, ScheduleController.createCalendar)
router.get("/api/schedule/last-scrape-timestamp", ScheduleController.getLastScrapeTimeStamp)

router.get("/api/groups", GroupController.getGroups)
router.get("/api/groups/scrape", GroupController.scrapeGroups)
router.get("/api/groups/active", GroupController.getActiveGroups)

router.get("/api/lecturers", LecturerController.getLecturers)
router.get("/api/lecturers/scrape", LecturerController.scrapeLecturers)

router.get("/api/rooms", RoomController.getRooms)
router.get("/api/rooms/scrape", RoomController.scrapeRooms)

router.get("/api/user/session", UserController.googleOAuthHandler)
router.get("/api/user", UserController.mustBeLoggedIn, UserController.getUser)
router.get("/api/user/logout", UserController.logout)
router.delete("/api/user", UserController.mustBeLoggedIn, UserController.deleteUser)
router.get("/api/users/students", UserController.getStudents)
router.get("/api/users/lecturers", UserController.getLecturers)

export default router

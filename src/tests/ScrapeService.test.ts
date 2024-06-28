import ScrapeService from "../services/ScraperService"
import { Lecture } from "types"

jest.mock("../services/ScraperService")

describe("ScrapeService", () => {
  describe("getSchedule", () => {
    it("should return an array of lectures for the given group", async () => {
      const mockLectures: Lecture[] = [
        {
          lectureNumber: 1,
          start: "8:45",
          end: "10:15",
          room: "223",
          groups: ["4203BDA"],
          lecturer: "John Doe",
          subject: "Programming",
          typeOfTheClass: "class",
          comment: ""
        },
        {
          lectureNumber: 2,
          start: "10:30",
          end: "12:00",
          room: "I",
          groups: ["4202BDA", "1234BDA"],
          lecturer: "Doe John",
          subject: "Business",
          typeOfTheClass: "test",
          comment: "online"
        }
      ]

      ;(ScrapeService.getSchedule as jest.Mock).mockResolvedValue(mockLectures)

      const group = "4203BDA"
      const lectures = await ScrapeService.getSchedule({ group })

      expect(ScrapeService.getSchedule).toHaveBeenCalledWith({ group })
      expect(lectures).toEqual(mockLectures)
    })
    it("should return an array of lectures for the given room", async () => {
      const mockLectures: Lecture[] = [
        {
          lectureNumber: 1,
          start: "8:45",
          end: "10:15",
          room: "223",
          groups: ["4203BDA"],
          lecturer: "John Doe",
          subject: "Programming",
          typeOfTheClass: "class",
          comment: ""
        },
        {
          lectureNumber: 2,
          start: "10:30",
          end: "12:00",
          room: "223",
          groups: ["4202BDA", "1234BDA"],
          lecturer: "Doe John",
          subject: "Business",
          typeOfTheClass: "test",
          comment: "online"
        }
      ]

      ;(ScrapeService.getSchedule as jest.Mock).mockResolvedValue(mockLectures)

      const room = "223"
      const lectures = await ScrapeService.getSchedule({ room })

      expect(ScrapeService.getSchedule).toHaveBeenCalledWith({ room })
      expect(lectures).toEqual(mockLectures)
    })

    it("should return an array of lectures for the given lecturer", async () => {
      const mockLectures: Lecture[] = [
        {
          lectureNumber: 1,
          start: "8:45",
          end: "10:15",
          room: "223",
          groups: ["4203BDA"],
          lecturer: "John Doe",
          subject: "Programming",
          typeOfTheClass: "class",
          comment: ""
        },
        {
          lectureNumber: 2,
          start: "10:30",
          end: "12:00",
          room: "I",
          groups: ["4202BDA", "1234BDA"],
          lecturer: "John Doe",
          subject: "Business",
          typeOfTheClass: "test",
          comment: "online"
        }
      ]

      ;(ScrapeService.getSchedule as jest.Mock).mockResolvedValue(mockLectures)

      const lecturer = "John Doe"
      const lectures = await ScrapeService.getSchedule({ lecturer })

      expect(ScrapeService.getSchedule).toHaveBeenCalledWith({ lecturer })
      expect(lectures).toEqual(mockLectures)
    })

    it("should reject with an error if no group, room or lecturer is provided", async () => {
      const error = new Error("⛏️ You must provide at least one of the following: Group, Lecturer, Room❌")
      ;(ScrapeService.getSchedule as jest.Mock).mockImplementation(() => Promise.reject(error))

      await expect(ScrapeService.getSchedule({})).rejects.toThrow("⛏️ You must provide at least one of the following: Group, Lecturer, Room❌")
    })

    it("should reject with days over 180", async () => {
      const error = new Error("⛏️ Days can't be more than 180❌")
      ;(ScrapeService.getSchedule as jest.Mock).mockImplementation(() => Promise.reject(error))

      await expect(ScrapeService.getSchedule({ group: "4203BDA", days: 181 })).rejects.toThrow("⛏️ Days can't be more than 180❌")
    })

    it("should reject with days less than 1", async () => {
      const error = new Error("⛏️ Days can't be less than 1❌")
      ;(ScrapeService.getSchedule as jest.Mock).mockImplementation(() => Promise.reject(error))

      await expect(ScrapeService.getSchedule({ group: "4203BDA", days: 0 })).rejects.toThrow("⛏️ Days can't be less than 1❌")
    })
  })

  describe("getGroups", () => {
    it("should return an array of groups", async () => {
      const mockGroups: string[] = ["4203BDA", "4202BDA", "1234BDA"]

      ;(ScrapeService.getGroups as jest.Mock).mockResolvedValue(mockGroups)

      const groups = await ScrapeService.getGroups()

      expect(ScrapeService.getGroups).toHaveBeenCalled()
      expect(groups).toEqual(mockGroups)
    })
  })

  describe("getRooms", () => {
    it("should return an array of rooms", async () => {
      const mockRooms: string[] = ["223", "I", "II"]

      ;(ScrapeService.getRooms as jest.Mock).mockResolvedValue(mockRooms)

      const rooms = await ScrapeService.getRooms()

      expect(ScrapeService.getRooms).toHaveBeenCalled()
      expect(rooms).toEqual(mockRooms)
    })
  })

  describe("getLecturers", () => {
    it("should return an array of lecturers", async () => {
      const mockLecturers: string[] = ["John Doe", "Jane Smith", "Michael Johnson"]

      ;(ScrapeService.getLecturers as jest.Mock).mockResolvedValue(mockLecturers)

      const lecturers = await ScrapeService.getLecturers()

      expect(ScrapeService.getLecturers).toHaveBeenCalled()
      expect(lecturers).toEqual(mockLecturers)
    })
  })
})

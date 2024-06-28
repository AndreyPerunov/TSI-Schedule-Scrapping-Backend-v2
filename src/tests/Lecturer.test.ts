import Lecturer from "../models/Lecturer"
import type { Lecturer as LecturerDB } from "@prisma/client"

jest.mock("../models/Lecturer")

describe("Lecturer", () => {
  describe("getLecturers", () => {
    it("should return an array of lecturers", async () => {
      const mockLecturers: LecturerDB[] = [
        { lecturerName: "John Doe", scrapeTimeStamp: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { lecturerName: "Michel Smith", scrapeTimeStamp: null, createdAt: new Date(), updatedAt: new Date() },
        { lecturerName: "Daniel Brown", scrapeTimeStamp: new Date(), createdAt: new Date(), updatedAt: new Date() }
      ]

      ;(Lecturer.getLecturers as jest.Mock).mockResolvedValue(mockLecturers)

      const lecturers = await Lecturer.getLecturers()

      expect(Lecturer.getLecturers).toHaveBeenCalled()
      expect(lecturers).toEqual(mockLecturers)
    })
  })
})

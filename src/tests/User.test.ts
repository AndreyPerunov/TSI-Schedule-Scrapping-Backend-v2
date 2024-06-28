import { Student, Lecturer } from "../models/User"

jest.mock("../models/User")

describe("User", () => {
  describe("getLecturers", () => {
    it("should return an array of lecturers", async () => {
      const mockLecturers = [{ googleName: "John Doe" }, { googleName: "Michel Smith" }, { googleName: "Daniel Brown" }]

      ;(Lecturer.getLecturers as jest.Mock).mockResolvedValue(mockLecturers)

      const lecturers = await Lecturer.getLecturers()

      expect(Lecturer.getLecturers).toHaveBeenCalled()
      expect(lecturers).toEqual(mockLecturers)
    })
  })

  describe("getStudents", () => {
    it("should return an array of students", async () => {
      const mockStudents = [{ googleName: "John Doe" }, { googleName: "Michel Smith" }, { googleName: "Daniel Brown" }]

      ;(Student.getStudents as jest.Mock).mockResolvedValue(mockStudents)

      const students = await Student.getStudents()

      expect(Student.getStudents).toHaveBeenCalled()
      expect(students).toEqual(mockStudents)
    })
  })
})

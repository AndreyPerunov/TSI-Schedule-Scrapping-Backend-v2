import Group from "../models/Group"
import type { Group as GroupDB } from "@prisma/client"

jest.mock("../models/Group")

describe("Group", () => {
  describe("getGroups", () => {
    it("should return an array of groups", async () => {
      const mockGroups: GroupDB[] = [
        { groupName: "4203BDA", scrapeTimeStamp: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { groupName: "4202BDA", scrapeTimeStamp: null, createdAt: new Date(), updatedAt: new Date() },
        { groupName: "1234BDA", scrapeTimeStamp: new Date(), createdAt: new Date(), updatedAt: new Date() }
      ]

      ;(Group.getGroups as jest.Mock).mockResolvedValue(mockGroups)

      const groups = await Group.getGroups()

      expect(Group.getGroups).toHaveBeenCalled()
      expect(groups).toEqual(mockGroups)
    })
  })

  describe("getActiveGroups", () => {
    it("should return an array of active groups", async () => {
      const mockGroups: string[] = ["4203BDA", "4202BDA", "1234BDA"]

      ;(Group.getActiveGroups as jest.Mock).mockResolvedValue(mockGroups)

      const groups = await Group.getActiveGroups()

      expect(Group.getActiveGroups).toHaveBeenCalled()
      expect(groups).toEqual(mockGroups)
    })
  })
})

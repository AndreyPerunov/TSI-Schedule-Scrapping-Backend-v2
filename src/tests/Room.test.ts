import Room from "../models/Room"
import type { Room as RoomDB } from "@prisma/client"

jest.mock("../models/Room")

describe("Room", () => {
  describe("getRooms", () => {
    it("should return an array of rooms", async () => {
      const mockRooms: RoomDB[] = [
        { roomNumber: "4203", scrapeTimeStamp: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { roomNumber: "4202", scrapeTimeStamp: null, createdAt: new Date(), updatedAt: new Date() },
        { roomNumber: "1234", scrapeTimeStamp: new Date(), createdAt: new Date(), updatedAt: new Date() }
      ]

      ;(Room.getRooms as jest.Mock).mockResolvedValue(mockRooms)

      const rooms = await Room.getRooms()

      expect(Room.getRooms).toHaveBeenCalled()
      expect(rooms).toEqual(mockRooms)
    })
  })
})

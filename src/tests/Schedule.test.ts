import Schedule from "../models/Schedule"

jest.mock("../models/Schedule")

describe("Schedule", () => {
  describe("getLastScrapeTimeStamp", () => {
    it("should return the last scrape timestamp", async () => {
      const mockTimeStamp = new Date()

      ;(Schedule.getLastScrapeTimeStamp as jest.Mock).mockResolvedValue(mockTimeStamp)

      const timeStamp = await Schedule.getLastScrapeTimeStamp()

      expect(Schedule.getLastScrapeTimeStamp).toHaveBeenCalled()
      expect(timeStamp).toEqual(mockTimeStamp)
    })
  })
})

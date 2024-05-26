import ScraperService from "../services/ScraperService"
import { google } from "googleapis"
import { PrismaClient } from "@prisma/client"
import type {} from "@prisma/client"

type lectureEvent = {
  title: string
  description: string
  start: string
  end: string
  color: string
  location: string
}

class Schedule {
  getSchedule({ group, lecturer, room, days = 30 }: { group?: string; lecturer?: string; room?: string; days?: number }) {
    console.log("📅 Getting schedule")
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      try {
        // checking if there was a scrape today
        const isScrapedToday = await this.#isScrapedToday(group, lecturer, room, days)
        if (!isScrapedToday) {
          console.log("📅 Schedule not scraped, scraping schedule")
          const schedule = await ScraperService.getSchedule({ group, lecturer, room, days })
          resolve(schedule)
          return
        } else {
          console.log("📅 Schedule already scraped today, getting it from DB")
          // case when scraped for group
          if (group && !lecturer && !room) {
            const schedule = await prisma.lecture.findMany({
              where: {
                group: {
                  groupName: group
                }
              }
            })
            await prisma.$disconnect()
            resolve(schedule)
            return
          }

          // case when scraped for lecturer
          if (!group && lecturer && !room) {
            const schedule = await prisma.lecture.findMany({
              where: {
                lecturer: {
                  lecturerName: lecturer
                }
              }
            })
            await prisma.$disconnect()
            resolve(schedule)
            return
          }

          // case when scraped for room
          if (!group && !lecturer && room) {
            const schedule = await prisma.lecture.findMany({
              where: {
                room: {
                  roomNumber: room
                }
              }
            })
            await prisma.$disconnect()
            resolve(schedule)
            return
          }
        }
      } catch (error) {
        console.error(error, "❌ Failed to get schedule")
        reject(new Error("❌ Failed to get schedule"))
      }
    })
    // return ScraperService.getSchedule({ group, lecturer, room, days })
  }
  createCalendar({ access_token, lectures, days, calendar_name }: { access_token: string; lectures: lectureEvent[]; days: number; calendar_name: string }): Promise<{ message: string } | { message: string; error: any }> {
    return new Promise(async (resolve, reject) => {
      try {
        const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID as string, process.env.GOOGLE_CLIENT_SECRET as string, process.env.GOOGLE_REDIRECT_URL as string)
        await oAuth2Client.setCredentials({ access_token })
        const calendar = google.calendar({ version: "v3", auth: oAuth2Client })

        // Upsert calendar
        const calendarList = await calendar.calendarList.list()
        const existingCalendar = calendarList.data.items?.find(item => item.summary === calendar_name)

        let newCalendar
        if (existingCalendar) {
          newCalendar = existingCalendar
        } else {
          const response = await calendar.calendars.insert({
            requestBody: {
              summary: calendar_name
            }
          })
          newCalendar = response.data
        }
        console.log("📅 Calendar created", newCalendar)

        // Deleting all events from the calendar for the next ? days
        const from = new Date()
        from.setHours(0, 0, 0, 0)
        const to = new Date(from)
        to.setDate(from.getDate() + days)
        to.setHours(23, 59, 59, 999)
        console.log("📅 Deleting events from", from, "to", to)
        const events = await calendar.events.list({
          calendarId: newCalendar.id as string,
          timeMin: from.toISOString(),
          timeMax: to.toISOString()
        })
        for (const event of events.data.items!) {
          await calendar.events.delete({
            calendarId: newCalendar.id as string,
            eventId: event.id as string
          })
        }

        // Inserting new events
        for (const lecture of lectures) {
          await calendar.events.insert({
            calendarId: newCalendar.id as string,
            requestBody: {
              summary: lecture.title,
              description: lecture.description,
              colorId: lecture.color,
              start: {
                dateTime: new Date(lecture.start).toISOString()
              },
              end: {
                dateTime: new Date(lecture.end).toISOString()
              },
              location: lecture.location
            }
          })
        }
        console.log("📅 Events created")

        resolve({ message: "Calendar created" })
      } catch (error) {
        console.log("❌ Error creating calendar", error)
        reject({ message: "Something went wrong. Please try again later.", error })
      }
    })
  }

  #isScrapedToday(group?: string, lecturer?: string, room?: string, days?: number) {
    console.log("📅 Checking if scraped today", { group, lecturer, room, days })
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      try {
        // checking if there was a scrape for group today
        if (days == 30 && group && !lecturer && !room) {
          console.log("📅 Checking GROUP")
          // Getting group from database
          console.log("Getting group from database")
          const groupObj = await prisma.group.findUnique({
            where: {
              groupName: group
            }
          })
          await prisma.$disconnect()

          console.log(`groupObj?: ${groupObj ? "true" : "false"}`)
          if (groupObj == null) {
            console.log("❌ Group not found")
            reject(new Error("❌ Group not found"))
            return
          }

          const { scrapeTimeStamp } = groupObj

          console.log("Scrape time stamp: ", { scrapeTimeStamp })
          if (scrapeTimeStamp == null) {
            console.log("⚠️ No scrape time stamp")
            resolve(false)
            return
          }

          console.log("Checking if scrape time stamp is less than 24 hours", { now: new Date().getTime(), scrapeTimeStamp: scrapeTimeStamp.getTime(), diff: new Date().getTime() - scrapeTimeStamp.getTime(), less: new Date().getTime() - scrapeTimeStamp.getTime() < 1000 * 60 * 60 * 24 })
          if (new Date().getTime() - scrapeTimeStamp.getTime() < 1000 * 60 * 60 * 24) {
            resolve(true)
            return
          }
        }

        // checking if there was a scrape for lecturer today
        if (days == 30 && !group && lecturer && !room) {
          console.log("📅 Checking LECTURER")
          console.log("Getting lecturer from database")
          // Getting lecturer from database
          const lecturerObj = await prisma.lecturer.findUnique({
            where: {
              lecturerName: lecturer
            }
          })
          await prisma.$disconnect()

          console.log(`lecturerObj?: ${lecturerObj ? "true" : "false"}`)
          if (lecturerObj == null) {
            console.log("❌ Lecturer not found")
            reject(new Error("❌ Lecturer not found"))
            return
          }

          const { scrapeTimeStamp } = lecturerObj

          console.log("Scrape time stamp: ", { scrapeTimeStamp })
          if (scrapeTimeStamp == null) {
            console.log("⚠️ No scrape time stamp")
            resolve(false)
            return
          }

          console.log("Checking if scrape time stamp is less than 24 hours", { now: new Date().getTime(), scrapeTimeStamp: scrapeTimeStamp.getTime(), diff: new Date().getTime() - scrapeTimeStamp.getTime(), less: new Date().getTime() - scrapeTimeStamp.getTime() < 1000 * 60 * 60 * 24 })

          if (new Date().getTime() - scrapeTimeStamp.getTime() < 1000 * 60 * 60 * 24) {
            resolve(true)
            return
          }
        }

        // checking if there was a scrape for room today
        if (days == 30 && !group && !lecturer && room) {
          console.log("📅 Checking ROOM")
          console.log("Getting room from database")
          // Getting room from database
          const roomObj = await prisma.room.findUnique({
            where: {
              roomNumber: room
            }
          })
          await prisma.$disconnect()

          console.log(`roomObj?: ${roomObj ? "true" : "false"}`)
          if (roomObj == null) {
            console.log("❌ Room not found")
            reject(new Error("❌ Room not found"))
            return
          }

          const { scrapeTimeStamp } = roomObj

          console.log("Scrape time stamp: ", { scrapeTimeStamp })
          if (scrapeTimeStamp == null) {
            console.log("⚠️ No scrape time stamp")
            resolve(false)
            return
          }

          console.log("Checking if scrape time stamp is less than 24 hours", { now: new Date().getTime(), scrapeTimeStamp: scrapeTimeStamp.getTime(), diff: new Date().getTime() - scrapeTimeStamp.getTime(), less: new Date().getTime() - scrapeTimeStamp.getTime() < 1000 * 60 * 60 * 24 })
          if (new Date().getTime() - scrapeTimeStamp.getTime() < 1000 * 60 * 60 * 24) {
            resolve(true)
            return
          }
        }

        console.log("⚠️ No scrape today", { group, lecturer, room, days })
        resolve(false)
      } catch (error) {
        console.error(error, "❌ Failed to get schedule")
        reject(new Error("❌ Failed to get schedule"))
      }
    })
  }

  async getLastScrapeTimeStamp() {
    console.log("📅 Getting last scrape time stamp")
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      try {
        const group = await prisma.group.findFirst({
          orderBy: {
            scrapeTimeStamp: "desc"
          },
          where: {
            scrapeTimeStamp: {
              not: null
            }
          }
        })
        const lecturer = await prisma.lecturer.findFirst({
          orderBy: {
            scrapeTimeStamp: "desc"
          },
          where: {
            scrapeTimeStamp: {
              not: null
            }
          }
        })
        const room = await prisma.room.findFirst({
          orderBy: {
            scrapeTimeStamp: "desc"
          },
          where: {
            scrapeTimeStamp: {
              not: null
            }
          }
        })
        await prisma.$disconnect()

        const groupScrapeTimeStamp = group?.scrapeTimeStamp
        const lecturerScrapeTimeStamp = lecturer?.scrapeTimeStamp
        const roomScrapeTimeStamp = room?.scrapeTimeStamp
        console.log("📅 Group scrape time stamp", groupScrapeTimeStamp)
        console.log("📅 Lecturer scrape time stamp", lecturerScrapeTimeStamp)
        console.log("📅 Room scrape time stamp", roomScrapeTimeStamp)

        const lastScrapeTimeStamp = [groupScrapeTimeStamp || 0, lecturerScrapeTimeStamp || 0, roomScrapeTimeStamp || 0].reduce((a, b) => (a > b ? a : b))
        console.log("📅 Last scrape time stamp", lastScrapeTimeStamp)

        resolve(lastScrapeTimeStamp)
      } catch (error) {
        console.error(error, "❌ Failed to get last scrape time stamp")
        reject(new Error("❌ Failed to get last scrape time stamp"))
      }
    })
  }
}

export default Schedule

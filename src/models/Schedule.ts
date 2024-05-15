import ScraperService from "../services/ScraperService"
import { google } from "googleapis"

type lectureEvent = {
  title: string
  description: string
  start: string
  end: string
  color: string
  location: string
}

class Schedule {
  scrapeSchedule({ group, lecturer, room, days = 30 }: { group?: string; lecturer?: string; room?: string; days?: number }) {
    return ScraperService.getSchedule({ group, lecturer, room, days })
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
}

export default Schedule
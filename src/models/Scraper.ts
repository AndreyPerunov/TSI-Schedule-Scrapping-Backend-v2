import { launch, executablePath as _executablePath, Page } from "puppeteer"
import { Lecture, ScrapedStudyDay, ScrapedDate } from "../types"
require("dotenv").config()

class Scraper {
  getSchedule(group?: string, lecturer?: string, room?: number, days: number = 30) {
    return new Promise(async (resolve, reject) => {
      console.log(`Getting Schedule for Days: ${days}` + (group ? `, Group: ${group}` : "") + (lecturer ? `, Lecturer: ${lecturer}` : "") + (room ? `, Room: ${room}` : "") + "🗓️")

      // Launch the browser
      process.stdout.write("Launching Browser")
      const browser = await launch({
        args: process.env.NODE_ENV === "production" ? ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"] : ["--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : _executablePath(),
        headless: "new"
      })
      console.log("✅")

      try {
        // Validation
        process.stdout.write("Validating Input")
        if (days > 180) throw new Error("Days can't be more than 180❌")
        if (days < 1) throw new Error("Days can't be less than 1❌")
        if (!group && !lecturer && !room) throw new Error("You must provide at least one of the following: Group, Lecturer, Room❌")
        console.log("✅")

        // DB Validation
        // TODO

        // Open a new blank page
        process.stdout.write("Opening New Page")
        const page = await browser.newPage()
        console.log("✅")

        // Increase Timeout
        process.stdout.write("Increasing Timeout")
        await page.setDefaultNavigationTimeout(120000)
        console.log("✅")

        // Set screen size
        process.stdout.write("Setting Viewport")
        await page.setViewport({ width: 1080, height: 1024 })
        console.log("✅")

        // Login
        await this.#login(page)

        // Go to Schedule Url
        process.stdout.write("Navigating to Schedule Page")
        const scheduleUrl = "https://my.tsi.lv/schedule"
        await Promise.all([page.goto(scheduleUrl), page.waitForNavigation()])
        console.log("✅")

        // Setting up Filters
        // Set Group
        if (group) {
          process.stdout.write("Setting Group")
          await page.waitForSelector('select[name="sel-group"]')
          const option = (await page.$x(`//*[@id="form1"]/div/div[1]/div[1]/select/option[text() = "${group}"]`))[0]
          const value = await (await option.getProperty("value")).jsonValue()
          await page.select('select[name="sel-group"]', value as string)
          await page.waitForSelector('button[name="show"]')
          await page.click('button[name="show"]')
          console.log("✅")
        }

        // Set Lecturer
        // TODO
        if (lecturer) {
        }

        // Set Room
        // TODO
        if (room) {
        }

        // Switch to Day View
        process.stdout.write("Switching to Day View")
        await page.waitForSelector('button[name="day"]')
        await Promise.all([page.click('button[name="day"]'), page.waitForNavigation()])
        console.log("✅")

        // Go Through Each Day
        console.log("Getting Schedule:")
        let result: Lecture[] = []
        for (let i = 0; i < days; i++) {
          // Get Array of All Day Lectures
          process.stdout.write(` Day ${i + 1}/${days}: `)
          const daySchedule = await page.$$eval(".wide-screen table tbody tr", rows => {
            return Array.from(rows, row => {
              const columns = row.querySelectorAll("td")
              return Array.from(columns, column => column.innerText)
            })
          })

          // Get The Date
          const date = await page.$$eval(".col-lg-6.form-row p", elements => {
            return Array.from(elements, elem => elem.innerText)[0]
          })

          // Format Array and Date
          result = result.concat(this.#formatLectures(daySchedule as ScrapedStudyDay, date as ScrapedDate))

          // Go To The Next Day
          await Promise.all([page.click('button[name="next"]'), page.waitForNavigation()])
          // await Promise.all([page.click('button[name="prev"]'), page.waitForNavigation()])
          console.log("✅")
        }

        // Save result to DB
        // TODO

        // Send Result
        console.log("Schedule Scraped Successfully✅")
        resolve({ status: "success", message: "Schedule Scraped Successfully✅", result: result })
      } catch (error) {
        console.log("❌")
        console.error(error)
        reject({ status: "fail", error: error, message: "Something went wrong while running Puppeteer❌" })
      } finally {
        await browser.close()
      }
    })
  }

  getGroups() {
    return new Promise(async (resolve, reject) => {
      // Launch the browser
      process.stdout.write("Launching Browser")
      const browser = await launch({
        args: process.env.NODE_ENV === "production" ? ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"] : ["--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : _executablePath(),
        headless: "new"
      })
      console.log("✅")

      try {
        // Open a new blank page
        process.stdout.write("Opening New Page")
        const page = await browser.newPage()
        console.log("✅")

        // Increase Timeout
        process.stdout.write("Increasing Timeout")
        await page.setDefaultNavigationTimeout(120000)
        console.log("✅")

        // Set screen size
        process.stdout.write("Setting Viewport")
        await page.setViewport({ width: 1080, height: 1024 })
        console.log("✅")

        // Login
        await this.#login(page)

        // Go to Schedule Url
        process.stdout.write("Navigating to Schedule Page")
        const scheduleUrl = "https://my.tsi.lv/schedule"
        await Promise.all([page.goto(scheduleUrl), page.waitForNavigation()])
        console.log("✅")

        // Get Groups
        process.stdout.write("Getting Groups")
        const select = await page.$('select[name="sel-group"]')
        const groups = await page.evaluate(select => {
          const options = Array.from(select!.querySelectorAll("option"))
          return options.map(option => option.innerText)
        }, select)
        groups.shift()
        console.log("✅")

        // Save result to DB
        // TODO

        // Send Result
        console.log("Groups Scraped Successfully✅")
        resolve({ status: "success", message: "Groups Scraped Successfully✅", result: groups })
      } catch (error) {
        console.log("❌")
        console.error(error)
        reject({ status: "fail", message: "Something went wrong while running Puppeteer❌", error: `${error}` })
      } finally {
        await browser.close()
      }
    })
  }

  #formatLectures(inputArray: ScrapedStudyDay, date: ScrapedDate) {
    // date = "Friday, September 15, 2023"
    const dateParts = date.split(", ") // dateParts = ["Friday","September 15","2023"]
    const dayMonthYear = dateParts[1].split(" ") // dayMonthYear = ["September","15"]
    const month = dayMonthYear[0]
    const day = parseInt(dayMonthYear[1])
    const year = parseInt(dateParts[2])

    const formattedDay: Lecture[] = inputArray
      .filter(lecture => lecture[1].trim() !== "")
      .map(lecture => {
        const [lectureNumber, time, room, group, lecturer, subject, typeOfTheClass, comment] = lecture
        const [startTime, endTime] = time.split(" - ")
        const timeZoneOffset = 120 // +02:00
        const start = new Date(`${month} ${day}, ${year} ${startTime}`)
        const end = new Date(`${month} ${day}, ${year} ${endTime}`)
        const startTimeAdjusted = new Date(start.getTime() + timeZoneOffset * 60000).toISOString()
        const endTimeAdjusted = new Date(end.getTime() + timeZoneOffset * 60000).toISOString()

        return {
          lectureNumber: parseInt(lectureNumber),
          start: startTimeAdjusted.replace(".000Z", "+02:00"),
          end: endTimeAdjusted.replace(".000Z", "+02:00"),
          room: this.#convertRoomToNumber(room),
          group: group.split(",").map(group => group.trim()),
          lecturer: lecturer.trim(),
          subject: subject.trim(),
          typeOfTheClass: typeOfTheClass.trim(),
          comment: comment.trim()
        }
      })

    return formattedDay
  }

  #convertRoomToNumber(room: string): number {
    const numericValue = parseInt(room, 10)
    // If the numeric value is a valid number, return it
    if (!isNaN(numericValue)) {
      return numericValue
    }
    // If the room is a Roman numeral, convert it to a number
    const romanNumerals: { [key: string]: number } = {
      I: 1,
      II: 2,
      III: 3,
      IV: 4,
      V: 5,
      VI: 6,
      VII: 7,
      VIII: 8,
      IX: 9,
      X: 10
    }

    const romanNumeralValue = romanNumerals[room.toUpperCase()]

    // If the Roman numeral is recognized, return its numeric value
    if (romanNumeralValue !== undefined) {
      return romanNumeralValue
    }

    return 0
  }

  async #login(page: Page) {
    // Navigate the page to a URL
    process.stdout.write("Navigating to Login Page")
    const url = "https://my.tsi.lv/login"
    await page.goto(url)
    console.log("✅")

    // Type Username
    process.stdout.write("Typing Username")
    await page.waitForSelector("input[name=username]")
    if (process.env.TSI_USERNAME) {
      await page.type("input[name=username]", process.env.TSI_USERNAME, { delay: 40 })
    } else {
      throw new Error("TSI_USERNAME is not defined")
    }
    console.log("✅")

    // Type Password
    process.stdout.write("Typing Password")
    await page.waitForSelector("input[name=password]")
    if (process.env.TSI_PASSWORD) {
      await page.type("input[name=password]", process.env.TSI_PASSWORD, { delay: 40 })
    } else {
      throw new Error("TSI_PASSWORD is not defined")
    }
    console.log("✅")

    // Submit Form and wait for navigation
    process.stdout.write("Submitting Form")
    await page.keyboard.press("Enter")
    await page.waitForNavigation()
    console.log("✅")

    // Check for Form Result
    process.stdout.write("Checking Login Result")
    if ((await page.url()) != "https://my.tsi.lv/personal") {
      throw new Error("Failed to login")
    }
    console.log("✅")
  }
}

export default new Scraper()

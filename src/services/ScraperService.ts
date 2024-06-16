import { launch, executablePath as _executablePath, Page } from "puppeteer"
import { Lecture, ScrapedStudyDay, ScrapedDate } from "../types"

require("dotenv").config()

class ScraperService {
  getSchedule({ group, lecturer, room, days = 30 }: { group?: string; lecturer?: string; room?: string; days?: number }): Promise<Lecture[]> {
    return new Promise(async (resolve, reject) => {
      console.log(`⛏️ Getting Schedule for Days: ${days}` + (group ? `, Group: ${group}` : "") + (lecturer ? `, Lecturer: ${lecturer}` : "") + (room ? `, Room: ${room}` : "") + "🗓️")

      // Launch the browser
      process.stdout.write("⛏️ Launching Browser")
      const browser = await launch({
        args: process.env.NODE_ENV === "production" ? ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"] : ["--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : _executablePath(),
        headless: "new"
      })
      console.log("✅")

      try {
        // Validation
        process.stdout.write("⛏️ Validating Input")
        if (days > 180) throw new Error("⛏️ Days can't be more than 180❌")
        if (days < 1) throw new Error("⛏️ Days can't be less than 1❌")
        if (!group && !lecturer && !room) throw new Error("⛏️ You must provide at least one of the following: Group, Lecturer, Room❌")
        console.log("✅")

        // Open a new blank page
        process.stdout.write("⛏️ Opening New Page")
        const page = await browser.newPage()
        console.log("✅")

        // Increase Timeout
        process.stdout.write("⛏️ Increasing Timeout")
        await page.setDefaultNavigationTimeout(120000)
        console.log("✅")

        // Set screen size
        process.stdout.write("⛏️ Setting Viewport")
        await page.setViewport({ width: 1080, height: 1024 })
        console.log("✅")

        // Login
        await this.#login(page)

        // Go to Schedule Url
        process.stdout.write("⛏️ Navigating to Schedule Page")
        const scheduleUrl = "https://my.tsi.lv/schedule"
        await Promise.all([page.goto(scheduleUrl), page.waitForNavigation()])
        console.log("✅")

        // Setting up Filters
        // Set Group
        if (group) {
          process.stdout.write("⛏️ Setting Group")
          await page.waitForSelector('select[name="sel-group"]')
          const option = (await page.$x(`//*[@id="form1"]/div/div[1]/div[1]/select/option[text() = "${group}"]`))[0]
          const value = await (await option.getProperty("value")).jsonValue()
          await page.select('select[name="sel-group"]', value as string)
          console.log("✅")
        } else {
          // If no group is provided, select the first one cause default is student group
          process.stdout.write("⛏️ Selecting First Group")
          await page.waitForSelector('select[name="sel-group"]')
          await page.select('select[name="sel-group"]', "-1")
          console.log("✅")
        }

        // Set Lecturer
        if (lecturer) {
          process.stdout.write("⛏️ Selecting Lecturer")
          await page.waitForSelector('select[name="sel-lecturer"]')
          const option = (await page.$x(`//*[@id="form1"]/div/div[1]/div[2]/select/option[text() = "${lecturer}"]`))[0]
          const value = await (await option.getProperty("value")).jsonValue()
          await page.select('select[name="sel-lecturer"]', value as string)
          console.log("✅")
        }

        // Set Room
        if (room) {
          process.stdout.write("⛏️ Selecting Room")
          await page.waitForSelector('select[name="sel-room"]')
          const option = (await page.$x(`//*[@id="form1"]/div/div[1]/div[3]/select/option[text() = "${room}"]`))[0]
          const value = await (await option.getProperty("value")).jsonValue()
          await page.select('select[name="sel-room"]', value as string)
          console.log("✅")
        }

        // Applying Filters
        await page.waitForSelector('button[name="show"]')
        await page.click('button[name="show"]')

        // Switch to Day View
        process.stdout.write("⛏️ Switching to Day View")
        await page.waitForSelector('button[name="day"]')
        await Promise.all([page.click('button[name="day"]'), page.waitForNavigation()])
        console.log("✅")

        // Go Through Each Day
        console.log("⛏️ Getting Schedule:")
        let result: Lecture[] = []
        for (let i = 0; i < days; i++) {
          // Get Array of All Day Lectures
          process.stdout.write(` ⛏️ Day ${i + 1}/${days}: `)
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

        // Send Result
        console.log("⛏️ Schedule Scraped Successfully✅")
        resolve(result)
      } catch (error) {
        console.log("❌")
        process.stdout.write("⛏️ ")
        console.error(error)
        reject(error)
      } finally {
        console.log("⛏️ Closing Browser")
        await browser.close()
      }
    })
  }

  getGroups(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      // Launch the browser
      process.stdout.write("⛏️ Launching Browser")
      const browser = await launch({
        args: process.env.NODE_ENV === "production" ? ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"] : ["--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : _executablePath(),
        headless: "new"
      })
      console.log("✅")

      try {
        // Open a new blank page
        process.stdout.write("⛏️ Opening New Page")
        const page = await browser.newPage()
        console.log("✅")

        // Increase Timeout
        process.stdout.write("⛏️ Increasing Timeout")
        await page.setDefaultNavigationTimeout(120000)
        console.log("✅")

        // Set screen size
        process.stdout.write("⛏️ Setting Viewport")
        await page.setViewport({ width: 1080, height: 1024 })
        console.log("✅")

        // Login
        await this.#login(page)

        // Go to Schedule Url
        process.stdout.write("⛏️ Navigating to Schedule Page")
        const scheduleUrl = "https://my.tsi.lv/schedule"
        await Promise.all([page.goto(scheduleUrl), page.waitForNavigation()])
        console.log("✅")

        // Get Groups
        process.stdout.write("⛏️ Getting Groups")
        const select = await page.$('select[name="sel-group"]')
        const groups = await page.evaluate(select => {
          const options = Array.from(select!.querySelectorAll("option"))
          return options.map(option => option.innerText)
        }, select)
        groups.shift()
        console.log("✅")

        // Send Result
        console.log("⛏️ Groups Scraped Successfully✅")
        resolve(groups)
      } catch (error) {
        console.log("❌")
        process.stdout.write("⛏️ ")
        console.error(error)
        reject(error)
      } finally {
        console.log("⛏️ Closing Browser")
        await browser.close()
      }
    })
  }

  getLecturers(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      // Launch the browser
      process.stdout.write("⛏️ Launching Browser")
      const browser = await launch({
        args: process.env.NODE_ENV === "production" ? ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"] : ["--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : _executablePath(),
        headless: "new"
      })
      console.log("✅")

      try {
        // Open a new blank page
        process.stdout.write("⛏️ Opening New Page")
        const page = await browser.newPage()
        console.log("✅")

        // Increase Timeout
        process.stdout.write("⛏️ Increasing Timeout")
        await page.setDefaultNavigationTimeout(120000)
        console.log("✅")

        // Set screen size
        process.stdout.write("⛏️ Setting Viewport")
        await page.setViewport({ width: 1080, height: 1024 })
        console.log("✅")

        // Login
        await this.#login(page)

        // Go to Schedule Url
        process.stdout.write("⛏️ Navigating to Schedule Page")
        const scheduleUrl = "https://my.tsi.lv/schedule"
        await Promise.all([page.goto(scheduleUrl), page.waitForNavigation()])
        console.log("✅")

        // Get Lecturers
        process.stdout.write("⛏️ Getting Lecturers")
        const select = await page.$('select[name="sel-lecturer"]')
        const lecturers = await page.evaluate(select => {
          const options = Array.from(select!.querySelectorAll("option"))
          return options.map(option => option.innerText)
        }, select)
        lecturers.shift()
        console.log("✅")

        // Send Result
        console.log("⛏️ Lecturers Scraped Successfully✅")
        resolve(lecturers)
      } catch (error) {
        console.log("❌")
        process.stdout.write("⛏️ ")
        console.error(error)
        reject(error)
      } finally {
        console.log("⛏️ Closing Browser")
        await browser.close()
      }
    })
  }

  getRooms(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      // Launch the browser
      process.stdout.write("⛏️ Launching Browser")
      const browser = await launch({
        args: process.env.NODE_ENV === "production" ? ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"] : ["--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : _executablePath(),
        headless: "new"
      })
      console.log("✅")

      try {
        // Open a new blank page
        process.stdout.write("⛏️ Opening New Page")
        const page = await browser.newPage()
        console.log("✅")

        // Increase Timeout
        process.stdout.write("⛏️ Increasing Timeout")
        await page.setDefaultNavigationTimeout(120000)
        console.log("✅")

        // Set screen size
        process.stdout.write("⛏️ Setting Viewport")
        await page.setViewport({ width: 1080, height: 1024 })
        console.log("✅")

        // Login
        await this.#login(page)

        // Go to Schedule Url
        process.stdout.write("⛏️ Navigating to Schedule Page")
        const scheduleUrl = "https://my.tsi.lv/schedule"
        await Promise.all([page.goto(scheduleUrl), page.waitForNavigation()])
        console.log("✅")

        // Get Rooms
        process.stdout.write("⛏️ Getting Rooms")
        const select = await page.$('select[name="sel-room"]')
        const rooms = await page.evaluate(select => {
          const options = Array.from(select!.querySelectorAll("option"))
          return options.map(option => option.innerText)
        }, select)
        rooms.shift()
        console.log("✅")

        // Send Result
        console.log("⛏️ Rooms Scraped Successfully✅")
        resolve(rooms)
      } catch (error) {
        console.log("❌")
        process.stdout.write("⛏️ ")
        console.error(error)
        reject(error)
      } finally {
        console.log("⛏️ Closing Browser")
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
        const start = new Date(`${month} ${day}, ${year} ${startTime} Z`).toISOString()
        const end = new Date(`${month} ${day}, ${year} ${endTime} Z`).toISOString()

        return {
          lectureNumber: parseInt(lectureNumber),
          start: start,
          end: end,
          room: room,
          groups: group.split(",").map(group => group.trim()),
          lecturer: lecturer.trim(),
          subject: subject.trim(),
          typeOfTheClass: typeOfTheClass.trim(),
          comment: comment.trim()
        }
      })

    return formattedDay
  }

  async #login(page: Page) {
    // Navigate the page to a URL
    process.stdout.write("⛏️ Navigating to Login Page")
    const url = "https://my.tsi.lv/login"
    await page.goto(url)
    console.log("✅")

    // Type Username
    process.stdout.write("⛏️ Typing Username")
    await page.waitForSelector("input[name=username]")
    if (process.env.TSI_USERNAME) {
      await page.type("input[name=username]", process.env.TSI_USERNAME, { delay: 40 })
    } else {
      throw new Error("TSI_USERNAME is not defined")
    }
    console.log("✅")

    // Type Password
    process.stdout.write("⛏️ Typing Password")
    await page.waitForSelector("input[name=password]")
    if (process.env.TSI_PASSWORD) {
      await page.type("input[name=password]", process.env.TSI_PASSWORD, { delay: 40 })
    } else {
      throw new Error("TSI_PASSWORD is not defined")
    }
    console.log("✅")

    // Submit Form and wait for navigation
    process.stdout.write("⛏️ Submitting Form")
    await page.keyboard.press("Enter")
    await page.waitForNavigation()
    console.log("✅")

    // Check for Form Result
    process.stdout.write("⛏️ Checking Login Result")
    if ((await page.url()) != "https://my.tsi.lv/personal") {
      throw new Error("Failed to login")
    }
    console.log("✅")
  }
}

export default new ScraperService()

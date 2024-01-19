const puppeteer = require("puppeteer")
require("dotenv").config()

class Scrapper {
  async getSchedule() {
    // Launch the browser

    process.stdout.write("Launching Browser")
    const browser = await puppeteer.launch({
      args: process.env.NODE_ENV === "production" ? ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"] : ["--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
      executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
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

      // Navigate the page to a URL
      process.stdout.write("Navigating to Login Page")
      const url = "https://my.tsi.lv/login"
      await page.goto(url)
      console.log("✅")

      // Set screen size
      process.stdout.write("Setting Viewport")
      await page.setViewport({ width: 1080, height: 1024 })
      console.log("✅")

      // Type Username
      process.stdout.write("Typing Username")
      await page.waitForSelector("input[name=username]")
      await page.type("input[name=username]", process.env.TSI_USERNAME, { delay: 40 })
      console.log("✅")

      // Type Password
      process.stdout.write("Typing Password")
      await page.waitForSelector("input[name=password]")
      await page.type("input[name=password]", process.env.TSI_PASSWORD, { delay: 40 })
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

      // Go to Schedule Url
      process.stdout.write("Navigating to Schedule Page")
      const scheduleUrl = "https://my.tsi.lv/schedule"
      await Promise.all([page.goto(scheduleUrl), page.waitForNavigation()])
      console.log("✅")

      // Set Group
      process.stdout.write("Setting Group")
      const group = "4203BDA"
      await page.waitForSelector('select[name="sel-group"]')
      const option = (await page.$x(`//*[@id="form1"]/div/div[1]/div[1]/select/option[text() = "${group}"]`))[0]
      const value = await (await option.getProperty("value")).jsonValue()
      await page.select('select[name="sel-group"]', value)
      await page.waitForSelector('button[name="show"]')
      await page.click('button[name="show"]')
      console.log("✅")

      // Switch to Day View
      process.stdout.write("Switching to Day View")
      await page.waitForSelector('button[name="day"]')
      await Promise.all([page.click('button[name="day"]'), page.waitForNavigation("networkidle2")])
      console.log("✅")

      // Go Through Each Day
      console.log("Getting Schedule:")
      let result = []
      const days = 30 * 3
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
        const date = await page.$$eval(".col-lg-6.form-row p", elems => {
          return Array.from(elems, elem => elem.innerText)[0]
        })

        // Format Array and Date
        result = result.concat(this.#convertArrayToObject(daySchedule, date))

        // Go To The Next Day
        await Promise.all([page.click('button[name="next"]'), page.waitForNavigation("networkidle2")])
        console.log("✅")
      }

      // Send Result
      console.log("Schedule Fetched Successfully✅")
      return result
    } catch (error) {
      console.log("❌")
      console.error(error)
      return `Something went wrong while running Puppeteer: ${error}`
    } finally {
      await browser.close()
    }
  }

  async getGroups() {
    // Launch the browser
    const browser = await puppeteer.launch({
      args: process.env.NODE_ENV === "production" ? ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"] : ["--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
      executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
    })

    try {
      // Open a new blank page
      console.log("New Page")
      const page = await browser.newPage()
      console.log("Page Created")

      // Set screen size
      await page.setViewport({ width: 1080, height: 1024 })
      console.log("Viewport Set")

      // Navigate the page to a URL
      const url = "https://my.tsi.lv/login"
      await page.goto(url)
      console.log("Page Navigated")
      await page.waitForNavigation()
      await page.waitForTimeout(1000)
      console.log("Page Loaded")

      // Type Username
      await page.waitForSelector("input[name=username]")
      await page.type("input[name=username]", process.env.TSI_USERNAME, { delay: 40 })

      // Type Password
      await page.waitForSelector("input[name=password]")
      await page.type("input[name=password]", process.env.TSI_PASSWORD, { delay: 40 })

      // Submit Form and wait for navigation
      await page.keyboard.press("Enter")
      await page.waitForNavigation()

      // Check for Form Result
      if ((await page.url()) != "https://my.tsi.lv/personal") {
        throw new Error("Failed to login")
      }

      // Go to Schedule Url
      const scheduleUrl = "https://my.tsi.lv/schedule"
      await Promise.all([page.goto(scheduleUrl), page.waitForNavigation()])

      // Wait for the select element to be present
      const select = await page.waitForSelector('select[name="sel-group"]')

      console.log("Select:", select)
    } catch (error) {
      console.error(error)
    } finally {
      await browser.close()
    }
  }

  #convertArrayToObject(inputArray, date) {
    const result = []
    // date = Friday, September 15, 2023
    const dateParts = date.split(", ") // dateParts = ["Friday","September 15","2023"]

    const dayMonthYear = dateParts[1].split(" ") // dayMonthYear = ["September","15"]
    const month = dayMonthYear[0]
    const day = parseInt(dayMonthYear[1])
    const year = parseInt(dateParts[2])

    inputArray.forEach(element => {
      if (element[1].trim() !== "") {
        const classInfo = {
          month: month,
          day: day,
          year: year,
          timeStart: element[1].split(" - ")[0],
          timeEnd: element[1].split(" - ")[1],
          room: element[2],
          group: element[3],
          lecturer: element[4],
          subject: element[5],
          typeOfTheClass: element[6],
          comment: element[7]
        }

        result.push(classInfo)
      }
    })

    return result
  }
}

module.exports = new Scrapper()

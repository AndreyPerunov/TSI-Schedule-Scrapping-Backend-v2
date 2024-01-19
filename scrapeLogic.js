const puppeteer = require("puppeteer")
require("dotenv").config()

const scrapeLogic = async res => {
  const browser = await puppeteer.launch({
    args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
    executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
  })
  try {
    const page = await browser.newPage()

    await page.goto("https://developer.chrome.com/")

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 })

    const heading = await page.waitForSelector(".devsite-landing-row-description")
    const fullTitle = await page.evaluate(heading => heading.textContent, heading)

    // Print the full title
    const logStatement = `The title of this blog post is ${fullTitle}`
    console.log(logStatement)
    res.send(logStatement)
  } catch (e) {
    console.error(e)
    res.send(`Something went wrong while running Puppeteer: ${e}`)
  } finally {
    await browser.close()
  }
}

const getSchedule = async res => {
  // Launch the browser
  const browser = await puppeteer.launch({
    args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
    executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
    // headless: false
  })

  try {
    // Open a new blank page
    const page = await browser.newPage()

    // Navigate the page to a URL
    const url = "https://my.tsi.lv/login"
    await page.goto(url)

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 })

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

    // Set Group
    const group = "4203BDA"
    await page.waitForSelector('select[name="sel-group"]')
    const option = (await page.$x(`//*[@id="form1"]/div/div[1]/div[1]/select/option[text() = "${group}"]`))[0]
    const value = await (await option.getProperty("value")).jsonValue()
    await page.select('select[name="sel-group"]', value)
    await page.waitForSelector('button[name="show"]')
    await page.click('button[name="show"]')

    // Switch to Day View
    await page.waitForSelector('button[name="day"]')
    await Promise.all([page.click('button[name="day"]'), page.waitForNavigation("networkidle2")])

    // Go Through Each Day
    let result = []
    const days = 30 * 3
    for (let i = 0; i < days; i++) {
      // Get Array of All Day Lectures
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
      result = result.concat(convertArrayToObject(daySchedule, date))

      // Go To The Next Day
      await Promise.all([page.click('button[name="next"]'), page.waitForNavigation("networkidle2")])
    }

    // Send Result
    res.json(result)
  } catch (error) {
    console.error(error)
    res.send(`Something went wrong while running Puppeteer: ${error}`)
  } finally {
    await browser.close()
  }
}

const getGroups = async () => {
  // Launch the browser
  const browser = await puppeteer.launch({
    args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
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

function convertArrayToObject(inputArray, date) {
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

module.exports = { scrapeLogic }

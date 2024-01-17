const puppeteer = require("puppeteer")
require("dotenv").config()

const scrapeLogic = async res => {
  // Launch the browser
  const browser = await puppeteer.launch({
    args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
    executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
  })

  try {
    // Open a new blank page
    const page = await browser.newPage()
    throw new Error("This is a test error")

    // Navigate the page to a URL
    await page.goto("https://developer.chrome.com/")

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 })

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector(".devsite-landing-row-description")
    const description = await textSelector?.evaluate(el => el.textContent)

    // Print the full title
    console.log(description)
    res.send(description)
  } catch (error) {
    console.error(error)
    res.send(`Something went wrong while running Puppeteer: ${error}`)
  } finally {
    await browser.close()
  }
}

module.exports = { scrapeLogic }

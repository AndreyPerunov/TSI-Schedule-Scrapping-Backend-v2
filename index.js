const express = require("express")
const { scrapeLogic } = require("./scrapeLogic")

const app = express()

const PORT = process.env.PORT || 3000

app.get("/scrape", (req, res) => {
  scrapeLogic(res)
})

app.get("/", (req, res) => {
  res.send("TSI Web Scrapping API is up and running!")
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

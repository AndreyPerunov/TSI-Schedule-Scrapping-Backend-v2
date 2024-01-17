const express = require("express")
const { getSchedule } = require("./scrapeLogic")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

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

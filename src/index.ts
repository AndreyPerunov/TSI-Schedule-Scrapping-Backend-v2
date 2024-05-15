import express from "express"
import cookieParser from "cookie-parser"
const app = express()
import router from "./router"
import ScheduleService from "./services/ScheduleService"

app.use(cookieParser())
app.use(express.json())
app.use("/", router)

ScheduleService.startScheduledScrape()
ScheduleService.startScheduledGroupScrape()

app.get("/", (req, res) => {
  res.send("TSI Web Scrapping API is up and running!")
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

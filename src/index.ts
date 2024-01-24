import express from "express"
const app = express()
import router from "./router"

app.use(express.json())
app.use("/api", router)

app.get("/", (req, res) => {
  res.send("TSI Web Scrapping API is up and running!")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

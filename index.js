const express = require("express")
const app = express()
const router = require("./router")

app.use(express.json())
app.use("/api", router)

app.get("/", (req, res) => {
  res.send("TSI Web Scrapping API is up and running!")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

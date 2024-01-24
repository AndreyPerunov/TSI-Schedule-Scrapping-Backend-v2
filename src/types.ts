type ScrapedLecture = [string, string, string, string, string, string, string, string]
type ScrapedStudyDay = ScrapedLecture[]
type DayOfTheWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
type Month = "January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December"
type ScrapedDate = `${DayOfTheWeek}, ${Month} ${number}, ${number}`
type Lecture = {
  lectureNumber: number
  start: string
  end: string
  room: number
  group: string[]
  lecturer: string
  subject: string
  typeOfTheClass: string
  comment: string
}
export { ScrapedLecture, ScrapedStudyDay, DayOfTheWeek, Month, ScrapedDate, Lecture }

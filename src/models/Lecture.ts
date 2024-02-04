import DatabaseService from "../services/DatabaseService"

class Lecture {
  getLecturers() {
    return DatabaseService.getLecturers()
  }
}

export default new Lecture()

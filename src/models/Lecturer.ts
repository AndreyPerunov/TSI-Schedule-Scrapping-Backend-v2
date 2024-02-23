import DatabaseService from "../services/DatabaseService"

class Lecturer {
  getLecturers() {
    return DatabaseService.getLecturers()
  }
}

export default new Lecturer()

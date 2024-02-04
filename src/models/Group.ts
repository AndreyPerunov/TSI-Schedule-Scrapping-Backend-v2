import DatabaseService from "../services/DatabaseService"

class Group {
  getGroups() {
    return DatabaseService.getGroups()
  }
}

export default new Group()

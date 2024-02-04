import DatabaseService from "../services/DatabaseService"

class Room {
  getRooms() {
    return DatabaseService.getRooms()
  }
}

export default new Room()

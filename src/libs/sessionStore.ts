/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* abstract */ class SessionStore {
  findSession(id: string) {}
  saveSession(id: string, session: any) {}
  findAllSessions() {}
}

interface UserInChat {
  userID: string
  username: string
  socketID: string
  connected?: boolean
}

class InMemorySessionStore extends SessionStore {
  private sessions: Map<string, UserInChat>

  constructor() {
    super()
    this.sessions = new Map()
  }

  findSession(id: string) {
    return this.sessions.get(id)
  }

  saveSession(id: string, user: UserInChat) {
    this.sessions.set(id, user)
  }

  findAllSessions() {
    return Array.from(this.sessions.values())
  }

  deleteSession(id: string) {
    this.sessions.delete(id)
  }
}

const sessionStore = new InMemorySessionStore()
export default sessionStore

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* abstract */ class SessionStore {
  findSession(id: string) {}
  saveSession(id: string, session: any) {}
  findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
  private sessions: Map<any, any>

  constructor() {
    super()
    this.sessions = new Map()
  }

  findSession(id: string) {
    return this.sessions.get(id)
  }

  saveSession(id: string, session: any) {
    this.sessions.set(id, session)
  }

  findAllSessions() {
    return Array.from(this.sessions.values())
  }
}

const sessionStore = new InMemorySessionStore()
export default sessionStore

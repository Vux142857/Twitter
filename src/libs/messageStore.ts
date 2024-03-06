/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* abstract */ class MessageStore {
  saveMessage(message: any) {}
  findMessagesForUser(userID: string) {}
}

export interface Message {
  content: string
  from: string
  to: string
  fromSelf?: boolean
}

class InMemoryMessageStore extends MessageStore {
  private messages: Message[] // Add this line
  constructor() {
    super()
    this.messages = []
  }
  saveMessage(message: Message) {
    this.messages.push(message)
  }
  findMessagesForUser(userID: string) {
    return this.messages.filter(({ from, to }) => from === userID || to === userID)
  }
}

const messageStore = new InMemoryMessageStore()
export default messageStore

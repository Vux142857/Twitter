import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follow from '~/models/schemas/Follow.schema'
import Media from '~/models/schemas/Media.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'
import Message from '~/models/schemas/Message.schema'
import Conversation from '~/models/schemas/Conversation.schema'

class DatabaseService {
  private client: MongoClient
  private db: Db
  private uri: string

  constructor() {
    this.uri = process.env.DATABASE_URI as string
    this.client = new MongoClient(this.uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(process.env.DATABASE_NAME as string)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } finally {
      // await this.client.close()
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.COLLECTION_USERS as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.COLLECTION_REFRESH_TOKEN as string)
  }

  get follows(): Collection<Follow> {
    return this.db.collection(process.env.COLLECTION_FOLLOW as string)
  }

  get media(): Collection<Media> {
    return this.db.collection(process.env.COLLECTION_MEDIA as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.COLLECTION_TWEETS as string)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.COLLECTION_HASHTAGS as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.COLLECTION_BOOKMARKS as string)
  }

  get likes(): Collection<Like> {
    return this.db.collection(process.env.COLLECTION_LIKES as string)
  }

  get messages(): Collection<Message> {
    return this.db.collection(process.env.COLLECTION_MESSAGES as string)
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(process.env.COLLECTION_CONVERSATIONS as string)
  }

  async indexesUsers() {
    const checkExisted = await this.users.indexExists(['email_1', 'username_1', 'username_1_verify_1', 'username_text'])
    if (!checkExisted) {
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1, verify: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
      this.users.createIndex({ username: 'text' }, { default_language: 'none' })
    }
  }

  async indexesRefreshTokens() {
    const checkExisted = await this.refreshTokens.indexExists(['user_id_1', 'token_1'])
    if (!checkExisted) {
      this.refreshTokens.createIndex({ user_id: 1 })
      this.refreshTokens.createIndex({ token: 1 }, { unique: true })
    }
  }

  async indexesFollow() {
    const checkExisted = await this.follows.indexExists([
      'user_id_1',
      'following_user_id_1',
      'user_id_1_following_user_id_1'
    ])
    if (!checkExisted) {
      this.follows.createIndex({ user_id: 1 })
      this.follows.createIndex({ following_user_id: 1 })
      this.follows.createIndex({ user_id: 1, following_user_id: 1 }, { unique: true })
    }
  }

  async indexesHashtag() {
    const checkExisted = await this.hashtags.indexExists(['name_1'])
    if (!checkExisted) {
      this.hashtags.createIndex({ name: 1 }, { unique: true })
    }
  }

  async indexesBookmark() {
    const checkExisted = await this.bookmarks.indexExists(['user_id_1', 'tweet_id_1'])
    if (!checkExisted) {
      this.bookmarks.createIndex({ user_id: 1, tweet_id: 1 }, { unique: true })
    }
  }

  async indexesLike() {
    const checkExisted = await this.likes.indexExists(['user_id_1', 'tweet_id_1'])
    if (!checkExisted) {
      this.likes.createIndex({ user_id: 1, tweet_id: 1 }, { unique: true })
    }
  }

  async indexesTweet() {
    const checkExisted = await this.tweets.indexExists(['content_text', 'hashtag_text'])
    if (!checkExisted) {
      this.tweets.createIndex({ content: 'text', hashtag: 'text' })
    }
  }

  async indexesConversation() {
    const checkExisted = await this.conversations.indexExists(['sender_1', 'receiver_1', 'sender_1_receiver_1'])
    if (!checkExisted) {
      this.conversations.createIndex({ sender: 1 })
      this.conversations.createIndex({ receiver: 1 })
      this.conversations.createIndex({ sender: 1, receiver: 1 }, { unique: true })
    }
  }

  async indexesMessage() {
    const checkExisted = await this.messages.indexExists(['conversation_1'])
    if (!checkExisted) {
      this.messages.createIndex({ conversation: 1 })
    }
  }
}
const databaseService = new DatabaseService()
export default databaseService

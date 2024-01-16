import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follow from '~/models/schemas/Follow.schema'
import Media from '~/models/schemas/Media.schema'

const uri = process.env.DATABASE_URI as string
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
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

  async indexesUsers() {
    const checkExisted = await this.users.indexExists(['email_1', 'username_1', 'username_1_verify_1'])
    if (!checkExisted) {
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1, verify: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
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

  async indexesVideoStatus() {}
}
const databaseService = new DatabaseService()
export default databaseService

import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'
import User from '~/models/schemas/User.schema'
import 'dotenv/config'

const uri = process.env.DB_URI as string
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
    return this.db.collection('users')
  }

  // get users(): Collection<User> {
  //   return this.db.collection('users')
  // }
}
const databaseService = new DatabaseService()
export default databaseService

/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config'
import Redis from 'ioredis'
class RedisService {
  private local: any
  private cloud: any
  constructor() {
    // this.cloud = createClient({
    //   password: process.env.REDIS_PASSWORD as string,
    //   socket: {
    //     host: process.env.REDIS_HOST as string,
    //     port: parseInt(process.env.REDIS_PORT as string)
    //   }
    // })
    // this.local = createClient()
    try {
      this.local = new Redis()
    } catch (error) {
      console.log(error)
    }
  }

  // private async connectToCloud(){
  //   await this.cloud.connect()
  //   await this.cloud.flushDb()
  // }

  private async connectToLocal() {
    await this.local.connect()
    await this.local.flushDb()
  }

  async connect() {
    try {
      // await Promise.all([this.connectToLocal(), this.connectToCloud()])
      // await this.connectToLocal()
      console.log('Connected to Redis')
    } catch (error) {
      console.log('Error connecting to Redis', error)
    }
  }


  // CACHING USERS BY USERNAME
  async cacheByUsername(username: string, user: any) {
    try {
      // await this.client.ft.create(
      //   'idx:users',
      //   {
      //     '$.name': {
      //       type: SchemaFieldTypes.TEXT,
      //       sortable: true
      //     },
      //     '$.username': {
      //       type: SchemaFieldTypes.TEXT,
      //       sortable: true
      //     },
      //     '$.email': {
      //       type: SchemaFieldTypes.TEXT,
      //       sortable: true
      //     },
      //     '$.date_of_birth': {
      //       type: SchemaFieldTypes.TEXT,
      //       as: 'date_of_birth'
      //     },
      //     '$.bio': {
      //       type: SchemaFieldTypes.TEXT,
      //       as: 'bio'
      //     },
      //     '$.location': {
      //       type: SchemaFieldTypes.TEXT,
      //       as: 'location'
      //     },
      //     '$.avatar': {
      //       type: SchemaFieldTypes.TEXT,
      //       as: 'avatar'
      //     },
      //     '$.cover_photo': {
      //       type: SchemaFieldTypes.TEXT,
      //       as: 'cover_photo'
      //     },
      //     '$.website': {
      //       type: SchemaFieldTypes.TEXT,
      //       as: 'website'
      //     }
      //   },
      //   {
      //     ON: 'JSON',
      //     PREFIX: 'user:'
      //   }
      // )
      await this.local
        .multi()
        .set(`user:${username}`, JSON.stringify(user))
        .expire(`user:${username}`, Number(process.env.REDIS_EXPIRE_15MIN))
        .exec()
    } catch (error) {
      console.log('Error creating Redis search user', error)
    }
  }

  async getCachedUserByUsername(username: string) {
    try {
      return await this.local.get(`user:${username}`)
    } catch (error) {
      console.log('Error find Redis search user', error)
    }
  }

  // CACHING TWEETS BY ID
  async cacheTweetById(tweetId: string, tweet: any) {
    try {
      await this.local
        .multi()
        .set(
          `tweet:${tweetId}`,
          JSON.stringify(tweet)
        )
        .expire(`tweet:${tweetId}`, Number(process.env.REDIS_EXPIRE_1MIN))
        .exec()
    } catch (error) {
      console.log('Error creating Redis search user', error)
    }
  }

  async getCachedTweetById(tweetId: string) {
    return await this.local.get(`tweet:${tweetId}`)
  }

  // CACHING TWEETS CHILDREN
  async cacheTweetsChildren(parent_id: string, skip: number, limit: number, tweets: any) {
    const value = JSON.stringify(tweets)
    try {
      await this.local
        .multi()
        .rpush(
          `tweets:${parent_id}:children:${skip}:${limit}`,
          value
        )
        .expire(`tweets:${parent_id}:children:${skip}:${limit}`, Number(process.env.REDIS_EXPIRE_5MIN))
        .exec()
    } catch (error) {
      console.log('Error creating Redis search user', error)
    }
  }

  async getCachedTweetsChildren(parent_id: string, skip: number, limit: number) {
    try {
      return await this.local
        .lrange(`tweets:${parent_id}:children:${skip}:${limit}`, 0, -1)
        .then((res: any) => {
          return res.map((tweet: any) => JSON.parse(tweet))
        })
    } catch (error) {
      console.log('Error find tweets children', error)
    }
  }

  // CACHING TWEETS BY USER
  async cacheTweetsByUser(user_id: string, self: string, skip: number, limit: number, tweets: any) {
    const value = JSON.stringify(tweets)
    try {
      await this.local
        .multi()
        .rpush(
          `tweets:${user_id}:self:${self}:${skip}:${limit}`,
          value
        )
        .expire(`tweets:${user_id}:self:${self}:${skip}:${limit}`, Number(process.env.REDIS_EXPIRE_5MIN))
        .exec()
    } catch (error) {
      console.log('Error creating Redis search user', error)
    }
  }

  async getCachedTweetsByUser(user_id: string, self: string, skip: number, limit: number) {
    try {
      return await this.local
        .lrange(`tweets:${user_id}:self:${self}:${skip}:${limit}`, 0, -1)
        .then((res: any) => {
          return res.map((tweet: any) => JSON.parse(tweet))
        })
    } catch (error) {
      console.log('Error find tweets children', error)
    }
  }

  // CACHING CONVERSATIONS
  async cacheConversationById(user_id: string, conversation: any) {
    try {
      await this.local
        .multi()
        .rpush(
          `conversation:${user_id}`,
          JSON.stringify(conversation)
        )
        .expire(`conversation:${user_id}`, Number(process.env.REDIS_EXPIRE_15MIN))
        .exec()
    } catch (error) {
      console.log('Error creating Redis search user', error)
    }
  }

  async getCachedConversationById(user_id: string) {
    try {
      return await this.local
        .lrange(`conversation:${user_id}`, 0, -1)
        .then((res: any) => {
          return res.map((conversation: any) => JSON.parse(conversation))
        })
    } catch (error) {
      console.log('Error find tweets children', error)
    }
  }

  get getClient(): any {
    return this.cloud
  }
}

const redisService = new RedisService()
export default redisService

//    * Save each individual poem as a Hash
//    */
//   var promiseList = list.map((poem, i) =>
//     Promise.all(Object.keys(poem).map((key) => client.hSet(`poem:${md5(i)}`, key, poem[key])))
//   );
//   await Promise.all(promiseList);

//   /**
//    * Create the inverted index that we will use to query the poems data
//    *
//    * FT.CREATE idx:poems ON HASH PREFIX 1 poem: SCHEMA content TEXT author TEXT title TEXT SORTABLE age TAG type TAG
//    *
//    */
//   await client.ft.create(
//     "idx:poems",
//     {
//       content: redis.SchemaFieldTypes.TEXT,
//       author: redis.SchemaFieldTypes.TEXT,
//       title: { type: redis.SchemaFieldTypes.TEXT, sortable: true },
//       age: redis.SchemaFieldTypes.TAG,
//       type: redis.SchemaFieldTypes.TAG,
//     },
//     {
//       ON: "HASH",
//       PREFIX: "poem:",
//     }
//   );
//   return client;
// };

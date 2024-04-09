import 'dotenv/config'
import Redis from 'ioredis'
class RedisService {
  private local: any
  constructor() {
    try {
      this.local = new Redis({
        host: 'redis',
        port: 6379
      })
    } catch (error) {
      console.log(error)
    }
  }

  async connect() {
    try {
      await this.local.flushDb()
      console.log('Connected to Redis')
    } catch (error) {
      console.log('Error connecting to Redis', error)
    }
  }

  // CACHING USERS BY ID
  async cacheUserById(user_id: string, user: any) {
    try {
      await this.local
        .multi()
        .set(`user:${user_id}`, JSON.stringify(user))
        .expire(`user:${user_id}`, Number(process.env.REDIS_EXPIRE_15MIN))
        .exec()
    } catch (error) {
      console.log('Error creating Redis search user', error)
    }
  }

  async getCachedUserById(user_id: string) {
    try {
      return await this.local.get(`user:${user_id}`).then((res: any) => JSON.parse(res))
    } catch (error) {
      console.log('Error find Redis search user', error)
    }
  }

  // CACHING USERS BY USERNAME
  async cacheByUsername(username: string, user: any) {
    try {
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

  // CACHING COMMENTS
  async cacheComments(parent_id: string, comments: any) {
    try {
      return await this.local
        .multi()
        .lpush(`comments:${parent_id}`, JSON.stringify(comments))
        .expire(`comments:${parent_id}`, Number(process.env.REDIS_EXPIRE_15MIN))
        .exec()
    } catch (error) {
      console.log('Error creating Redis message queue', error)
    }
  }

  async getCachedComments(parent_id: string, skip: number, limit: number) {
    try {
      const page = Math.ceil(skip / limit)
      const length = await this.local.llen(`comments:${parent_id}`)
      const end = length - limit * page - 1
      const start = end - limit + 1
      return await this.local
        .lrange(`comments:${parent_id}`, start, end)
        .then((res: any) => {
          return res.map((comment: any) => JSON.parse(comment))
        })
    } catch (error) {
      console.log('Error find Redis message queue', error)
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
        .expire(`tweets:${user_id}:self:${self}:${skip}:${limit}`, Number(process.env.REDIS_EXPIRE_2MIN))
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

  async cacheMessagesById(conversation_id: string, messages: any) {
    try {
      return await this.local
        .multi()
        .rpush(`messages:${conversation_id}`, JSON.stringify(messages))
        .expire(`messages:${conversation_id}`, Number(process.env.REDIS_EXPIRE_15MIN))
        .exec()
    } catch (error) {
      console.log('Error creating Redis message queue', error)
    }
  }

  async getCachedMessagesById(conversation_id: string, skip: number, limit: number) {
    try {
      const page = Math.ceil(skip / limit)
      const length = await this.local.llen(`messages:${conversation_id}`)
      const end = length - limit * page - 1
      const start = end - limit + 1
      return await this.local
        .lrange(`messages:${conversation_id}`, start, end)
        .then((res: any) => {
          return res.map((messages: any) => JSON.parse(messages))
        })
    } catch (error) {
      console.log('Error find Redis message queue', error)
    }
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

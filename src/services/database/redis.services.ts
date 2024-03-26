/* eslint-disable @typescript-eslint/no-explicit-any */
import { RedisClientType, SchemaFieldTypes } from 'redis'
import { createClient } from 'redis';
import userService from '../user.services'
import 'dotenv/config'
import crypto from 'crypto'
import { TweetConstructor } from '~/models/schemas/Tweet.schema'
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
    this.local = createClient()
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
      await this.connectToLocal()
      console.log('Connected to Redis')
    } catch (error) {
      console.log('Error connecting to Redis', error)
    }
  }

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
  //   {
  //     "_id": "65b9d504d80d6c0ff6ebde2e",
  //     "user_id": "6599705a1f4b01086ff9caa4",
  //     "audience": 1,
  //     "content": "",
  //     "media": [],
  //     "mention": [
  //         "someone"
  //     ],
  //     "parent_id": "65db41e0349d6f687e631898",
  //     "hashtag": [
  //         "111",
  //         "2222",
  //         "2333",
  //         "222"
  //     ],
  //     "user_views": 38,
  //     "guest_views": 0,
  //     "tweet_circle": [],
  //     "type": 1,
  //     "createdAt": "2024-01-31T05:05:08.873Z",
  //     "updatedAt": "2024-03-23T07:19:20.036Z",
  //     "bookmarks": 0,
  //     "likes": 1,
  //     "author": {
  //         "_id": "6599705a1f4b01086ff9caa4",
  //         "name": "TTVux",
  //         "username": "Vu14",
  //         "avatar": ""
  //     },
  //     "retweets": 0,
  //     "comments": 0
  // }
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

  get getClient(): RedisClientType {
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

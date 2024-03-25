/* eslint-disable @typescript-eslint/no-explicit-any */
import { RedisClientType, SchemaFieldTypes, createClient } from 'redis'
import userService from '../user.services'
import 'dotenv/config'
import crypto from 'crypto'
class RedisService {
  private client: any
  constructor() {
    // this.client = createClient({
    //   password: process.env.REDIS_PASSWORD as string,
    //   socket: {
    //     host: process.env.REDIS_HOST as string,
    //     port: parseInt(process.env.REDIS_PORT as string)
    //   }
    // })
    this.client = createClient()
  }

  async connect() {
    try {
      await this.client.connect()
      await this.client.flushDb()
      console.log('Connected to Redis')
    } catch (error) {
      console.log('Error connecting to Redis', error)
    }
  }

  async cacheByUsername(username: string, user: any) {
    try {
      await this.client.ft.create(
        'idx:users',
        {
          '$.name': {
            type: SchemaFieldTypes.TEXT,
            sortable: true
          },
          '$.username': {
            type: SchemaFieldTypes.TEXT,
            sortable: true
          },
          '$.email': {
            type: SchemaFieldTypes.TEXT,
            sortable: true
          },
          '$.date_of_birth': {
            type: SchemaFieldTypes.TEXT,
            as: 'date_of_birth'
          },
          '$.bio': {
            type: SchemaFieldTypes.TEXT,
            as: 'bio'
          },
          '$.location': {
            type: SchemaFieldTypes.TEXT,
            as: 'location'
          },
          '$.avatar': {
            type: SchemaFieldTypes.TEXT,
            as: 'avatar'
          },
          '$.cover_photo': {
            type: SchemaFieldTypes.TEXT,
            as: 'cover_photo'
          },
          '$.website': {
            type: SchemaFieldTypes.TEXT,
            as: 'website'
          }
        },
        {
          ON: 'JSON',
          PREFIX: 'user:'
        }
      )
      await this.client.json.set(`user:${username}`, '$', user)
    } catch (error) {
      console.log('Error creating Redis search user', error)
    }
  }

  get getClient(): RedisClientType {
    return this.client
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

import { faker } from "@faker-js/faker"
import { ObjectId } from "mongodb"
import { TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enum"
import { RegisterReqBody } from "~/models/requests/User.requests"
import User from "~/models/schemas/User.schema"
import Follow from "~/models/schemas/Follow.schema"
import databaseService from "~/services/database/database.services"
import tweetService, { TweetReqBody } from "~/services/tweet.services"
import { encryptPassword } from "./crypto"

const PASSWORD = "@Vu142857"
const MY_ID = new ObjectId("6599705a1f4b01086ff9caa4")

const USER_COUNT = 1000

const createRandomUser = () => {
  const user: RegisterReqBody = {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past(),
  }
  return user
}

const createRandomTweet = () => {
  const tweet: TweetReqBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160,
    }),
    hashtag: [],
    media: [],
    mention: [],
    parent_id: null,
  }
  return tweet
}

const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, { count: USER_COUNT })

const insertMultipleUsersAndFollowerAndTweet = async (users: RegisterReqBody[]) => {
  console.log("Inserting users...")
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      const savedUser = await databaseService.users.insertOne(
        new User({
          ...user,
          username: `user${user_id.toString()}`,
          password: await encryptPassword(user.password),
          date_of_birth: user.date_of_birth,
          verify: UserVerifyStatus.Verified,
        })
      )
      if (savedUser) {
        await databaseService.follows.insertOne(
          new Follow({
            user_id: new ObjectId(savedUser.insertedId.toString()),
            following_user_id: MY_ID,
          })
        )
        await databaseService.follows.insertOne(
          new Follow({
            user_id: MY_ID,
            following_user_id: new ObjectId(savedUser.insertedId.toString()),
          })
        )
        await tweetService.createTweet(createRandomTweet(), new ObjectId(savedUser.insertedId.toString()))
      }
    })
  )
  return result
}

insertMultipleUsersAndFollowerAndTweet(users).then(() => {
  console.log("Done")
}).catch((err) => {
  console.log(err)
})

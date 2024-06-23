import { faker } from "@faker-js/faker"
import { ObjectId } from "mongodb"
import { StatusType, TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enum"
import { RegisterReqBody } from "~/models/requests/User.requests"
import User from "~/models/schemas/User.schema"
import Follow from "~/models/schemas/Follow.schema"
import databaseService from "~/services/database/database.services"
import tweetService, { TweetReqBody } from "~/services/tweet.services"
import { encryptPassword } from "./crypto"
import { MediaConstructor } from "~/models/schemas/Media.schema"
import mediaService from "~/services/media.services"

class FakerService {
  private MY_ID: ObjectId
  private USER_COUNT: number

  constructor() {
    this.MY_ID = new ObjectId("6599705a1f4b01086ff9caa4")
    this.USER_COUNT = 20
  }

  async insertMultipleUsersAndFollowerAndTweet() {
    console.log("Inserting users...")
    const users: RegisterReqBody[] = faker.helpers.multiple(this.createRandomUser, { count: this.USER_COUNT })
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
              following_user_id: this.MY_ID,
            })
          )
          await databaseService.follows.insertOne(
            new Follow({
              user_id: this.MY_ID,
              following_user_id: new ObjectId(savedUser.insertedId.toString()),
            })
          )
          const newTweet = await this.createRandomTweet()
          newTweet && await tweetService.createTweet(newTweet, new ObjectId(savedUser.insertedId.toString()))
        }
      })
    )
    return result
  }

  createRandomUser() {
    const user: RegisterReqBody = {
      name: faker.internet.userName(),
      email: faker.internet.email(),
      password: "@Vu142857",
      confirm_password: "@Vu142857",
      date_of_birth: faker.date.past(),
    }
    return user
  }

  async createRandomTweet() {
    const randomNumber = getRandomInt(1000)
    const media: MediaConstructor = {
      type: 0,
      url: `https://picsum.photos/1920/1080?random=${randomNumber}`,
      status: StatusType.Done
    }
    await mediaService.storageMedia(media)
    const tweet: TweetReqBody = {
      type: TweetType.Tweet,
      audience: TweetAudience.Everyone,
      content: faker.lorem.paragraph({
        max: 5,
        min: 1
      }),
      hashtag: [],
      media: [media],
      mention: [],
      parent_id: null,
    }
    return tweet
  }

  async clearTweetFaker() {
    const allFakerTweet = await databaseService.tweets.find().sort({ createdAt: -1 }).limit(20).toArray()
    const idsOfTweetFaker = allFakerTweet.map(doc => doc._id)
    if (idsOfTweetFaker.length > 0) {
      const result = await databaseService.tweets.deleteMany({ _id: { $in: idsOfTweetFaker } })
      console.log('DONE!')
      return result
    }
    return 0
  }
}

const fakerService = new FakerService()
export default fakerService

//
function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
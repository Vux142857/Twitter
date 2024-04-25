/* eslint-disable @typescript-eslint/no-explicit-any */
import databaseService from './database/database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { Document, ObjectId } from 'mongodb'
import { MediaType, SearchFilterQuery, TweetAudience, TweetType } from '~/constants/enum'
import Media from '~/models/schemas/Media.schema'
import hashtagService from './hashtag.services'
import Follow from '~/models/schemas/Follow.schema'

export interface TweetReqBody {
  audience: TweetAudience
  content: string
  media?: Media[]
  mention?: string[]
  parent_id?: ObjectId | null
  hashtag?: string[]
  type: TweetType
  tweet_circle?: string[] | ObjectId[]
}

class TweetService {
  private aggreTweetsBody: Document[]

  constructor() {
    this.aggreTweetsBody = [
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'likes'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $addFields: {
          author: {
            $map: {
              input: '$author',
              as: 'item',
              in: {
                _id: '$$item._id',
                name: '$$item.name',
                username: '$$item.username',
                avatar: '$$item.avatar'
              }
            }
          }
        }
      },
      {
        $addFields: {
          likes: {
            $size: '$likes'
          },
          author: {
            $arrayElemAt: ['$author', 0]
          }
        }
      }
    ]
  }
  // ****************************** POST | PUT
  async createTweet(payload: TweetReqBody, user_id: ObjectId) {
    const { type, tweet_circle } = payload
    const tweet_circle_ids: ObjectId[] = []
    if (tweet_circle) {
      tweet_circle.forEach((id: string | ObjectId) => {
        tweet_circle_ids.push(id instanceof ObjectId ? id : new ObjectId(id))
      })
    }
    const tweet =
      type !== TweetType.Tweet && payload.parent_id
        ? new Tweet({
          ...payload,
          parent_id: new ObjectId(payload.parent_id),
          user_id,
          tweet_circle: tweet_circle_ids
        })
        : new Tweet({
          ...payload,
          user_id,
          tweet_circle: tweet_circle_ids
        })
    if (payload.hashtag) {
      await Promise.all([databaseService.tweets.insertOne(tweet), hashtagService.checkAndCreatHashtag(payload.hashtag)])
    } else {
      await databaseService.tweets.insertOne(tweet)
    }
    return tweet
  }
  // description: Update views tweet by id if id !== null, else update views tweets array if it isChildren update views tweets array
  // id can be ObjectId of tweet or parent_id if it isChildren, or null if it return tweets arr 
  async updateViewsTweet(id: ObjectId | null, user_id?: ObjectId, isChildren?: boolean, tweetsArr?: Tweet[]) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    if (isChildren && tweetsArr && id) {
      const ids = tweetsArr.map((tweet: any) => tweet._id)
      const currentDate = new Date()
      await databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: { updatedAt: currentDate }
        }
      )
      tweetsArr.forEach((tweet: any) => {
        if (user_id) {
          tweet.user_views = tweet.user_views + 1.0
        } else {
          tweet.guest_views = tweet.guest_views + 1.0
        }
      })
      return tweetsArr
    } else if (!isChildren && tweetsArr) {
      const ids = tweetsArr.map((tweet: any) => tweet._id)
      const currentDate = new Date()
      await databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: { updatedAt: currentDate }
        }
      )
      tweetsArr.forEach((tweet: any) => {
        if (user_id) {
          tweet.user_views = tweet.user_views + 1.0
        } else {
          tweet.guest_views = tweet.guest_views + 1.0
        }
      })
      return tweetsArr
    }
    return await databaseService.tweets.findOneAndUpdate(
      { _id: (id as ObjectId) || new ObjectId() },
      {
        $inc: inc,
        $currentDate: { updatedAt: true }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1
        }
      }
    )
  }

  // ****************************** GET
  private async getLatestTweet(user_id: ObjectId, author_id: ObjectId): Promise<Tweet> {
    const match = this.filterTweetCircle(author_id, user_id)
    const [latestTweet] = await databaseService.tweets
      .aggregate<Tweet>(
        [
          {
            $match: {
              ...match
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $limit: 1
          },
          ...this.aggreTweetsBody
        ],
        { allowDiskUse: true }
      )
      .toArray()
    return latestTweet
  }

  async getTweetById(id: ObjectId) {
    const [tweet] = await databaseService.tweets
      .aggregate(
        [
          {
            $match: {
              _id: id
            }
          },
          ...this.aggreTweetsBody
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      )
      .toArray()
    return tweet
  }

  async getTweetsByUser(user_id: ObjectId, self: ObjectId, skip: number, limit: number) {
    const match = this.filterTweetCircle(user_id, self)
    const [tweetsByUser, total] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match: {
              ...match
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          ...this.aggreTweetsBody
        ])
        .toArray(),
      databaseService.tweets.countDocuments({
        user_id: user_id,
        // type: tweetType
      })
    ])
    const isChildren = false
    const result = {
      tweetsByUser: await this.updateViewsTweet(null, user_id, isChildren, tweetsByUser),
      total
    }
    return result
  }

  async getTweetsChildren(id: ObjectId, user_id: ObjectId, tweetType: number, skip: number, limit: number) {
    const [tweetsChildren, total] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match: {
              parent_id: id,
              type: tweetType
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          ...this.aggreTweetsBody
        ])
        .toArray(),
      databaseService.tweets.countDocuments({
        parent_id: id,
        type: tweetType
      })
    ])
    const isChildren = true

    const result = {
      tweetsChildren: await this.updateViewsTweet(id, user_id, isChildren, tweetsChildren),
      total
    }
    return result
  }

  async getTweetsByFollowed(user_id: ObjectId, skip: number, limit: number) {
    const [followedUsers, total] = await Promise.all([
      databaseService.follows
        .aggregate<Follow>([
          {
            $match: {
              user_id
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.follows.countDocuments({ user_id })
    ])
    const tweetsByFollowed: Tweet[] = []
    const promises: Promise<Tweet>[] = []
    followedUsers.forEach((followedUser: Follow) => {
      promises.push(this.getLatestTweet(user_id, followedUser.following_user_id))
    })
    await Promise.all(promises).then((tweets) => {
      tweetsByFollowed.push(...tweets)
    })
    return { tweetsByFollowed, totalFollowedUser: total }
  }

  async getTweetsByViews(user_id: ObjectId, skip: number, limit: number) {
    const tweetsByViews = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            $or: [
              { audience: TweetAudience.Everyone, type: TweetType.Tweet },
              { $and: [{ audience: TweetAudience.TweetCircle }, { tweet_circle: { $elemMatch: { $eq: user_id } } }, { type: TweetType.Tweet }] }
            ]
          }
        },
        {
          $sort: {
            user_views: -1
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        ...this.aggreTweetsBody
      ])
      .toArray()
    return tweetsByViews
  }

  async getTweetsByHashtag(user_id: ObjectId, hashtag: string, skip: number, limit: number) {
    const [tweetsByHashtag, totalTweetsByHashtag] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match: {
              hashtag: {
                $elemMatch: {
                  $eq: hashtag
                }
              },
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TweetCircle
                    },
                    {
                      tweet_circle: {
                        $elemMatch: {
                          $eq: user_id
                        }
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          ...this.aggreTweetsBody
        ])
        .toArray(),
      databaseService.tweets.countDocuments({
        hashtag: {
          $elemMatch: {
            $eq: hashtag
          }
        }
      })
    ])
    return { tweetsByHashtag, totalTweetsByHashtag }
  }

  async searchTweets(user_id: ObjectId, value: string, filter: string, skip: number, limit: number) {
    const filterPipeline: Document[] = [
      {
        autocomplete: {
          path: 'content',
          query: value
        }
      },
      {
        compound: {
          should: [
            {
              equals: {
                path: 'audience',
                value: TweetAudience.Everyone
              }
            },
            {
              compound: {
                must: [
                  {
                    equals: {
                      path: 'audience',
                      value: TweetAudience.TweetCircle
                    }
                  },
                  {
                    in: {
                      path: 'tweet_circle',
                      value: user_id
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
    let filterMedia: Document | null = null
    if (filter == SearchFilterQuery.Video) {
      filterMedia = {
        embeddedDocument: {
          path: 'media',
          operator: {
            in: {
              path: 'media.type',
              value: MediaType.Video
            }
          }
        }
      }
    } else if (filter == SearchFilterQuery.Image) {
      filterMedia = {
        embeddedDocument: {
          path: 'media',
          operator: {
            in: {
              path: 'media.type',
              value: MediaType.Image
            }
          }
        }
      }
    }
    if (filterMedia) {
      filterPipeline.push(filterMedia)
    }
    const searchAtlast: Document = {
      $search: {
        index: 'tweets',
        compound: {
          filter: filterPipeline
        }
      }
    }
    return await databaseService.tweets
      .aggregate<Tweet>([
        searchAtlast,
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        ...this.aggreTweetsBody
      ])
      .toArray()
  }

  async countTweetsChildren(parent_id: ObjectId, type: number) {
    return await databaseService.tweets.countDocuments({
      parent_id: parent_id,
      type: type
    })
  }

  async countTweetsByUser(user_id: ObjectId) {
    return await databaseService.tweets.countDocuments({
      user_id: user_id,
    })
  }

  private filterTweetCircle(user_id: ObjectId, self: ObjectId) {
    if (user_id.toString() !== self.toString()) {
      return {
        user_id: user_id,
        $or: [
          {
            audience: TweetAudience.Everyone
          },
          {
            $and: [
              {
                audience: TweetAudience.TweetCircle
              },
              {
                tweet_circle: {
                  $elemMatch: {
                    $eq: self
                  }
                }
              }
            ]
          }
        ]
      }
    } else {
      return {
        user_id: user_id
      }
    }
  }

  // ****************************** DELETE
  async deleteTweet(_id: ObjectId) {
    return await databaseService.tweets.deleteOne({ _id })
  }
}
const tweetService = new TweetService()

export default tweetService

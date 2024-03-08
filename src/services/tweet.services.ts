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
}

class TweetService {
  private aggreTweetsBody: Document[]

  constructor() {
    this.aggreTweetsBody = [
      {
        $lookup: {
          from: 'bookmarks',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'bookmarks'
        }
      },
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
                username: '$$item.username'
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'tweets',
          localField: '_id',
          foreignField: 'parent_id',
          as: 'tweet_children'
        }
      },
      {
        $addFields: {
          bookmarks: {
            $size: '$bookmarks'
          },
          likes: {
            $size: '$likes'
          },
          retweets: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', 1]
                }
              }
            }
          },
          comments: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', 2]
                }
              }
            }
          },
          author: {
            $arrayElemAt: ['$author', 0]
          }
        }
      },
      {
        $project: {
          tweet_children: 0
        }
      }
    ]
  }
  // ****************************** POST | PUT
  async createTweet(payload: TweetReqBody, user_id: ObjectId) {
    const { type } = payload
    const tweet =
      type !== TweetType.Tweet && payload.parent_id
        ? new Tweet({
            ...payload,
            parent_id: new ObjectId(payload.parent_id),
            user_id
          })
        : new Tweet({
            ...payload,
            user_id
          })
    if (payload.hashtag) {
      await Promise.all([databaseService.tweets.insertOne(tweet), hashtagService.checkAndCreatHashtag(payload.hashtag)])
    } else {
      await databaseService.tweets.insertOne(tweet)
    }
    return tweet
  }

  async updateViewsTweet(id: ObjectId | null, user_id?: string, isChildren?: boolean, tweetsArr?: Tweet[]) {
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
  private async getLatestTweet(user_id: string, author_id: ObjectId): Promise<Tweet> {
    const [latestTweet] = await databaseService.tweets
      .aggregate<Tweet>(
        [
          {
            $match: {
              user_id: author_id,
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
            $sort: {
              created_at: -1
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

  async getTweetChildren(id: ObjectId, user_id: string, tweetType: number, skip: number, limit: number) {
    const [tweetChildren, total] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match: {
              parent_id: id,
              type: tweetType
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
      tweetChildren: await this.updateViewsTweet(id, user_id, isChildren, tweetChildren),
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
      promises.push(this.getLatestTweet(user_id.toString(), followedUser.following_user_id))
    })
    await Promise.all(promises).then((tweets) => {
      tweetsByFollowed.push(...tweets)
    })
    return { tweetsByFollowed, totalFollowedUser: total }
  }

  async getTweetsByViews(user_id: string, skip: number, limit: number) {
    const tweetsByViews = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            $or: [
              { audience: TweetAudience.Everyone },
              { $and: [{ audience: TweetAudience.TweetCircle }, { tweet_circle: { $elemMatch: { $eq: user_id } } }] }
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

  async getTweetsByHashtag(user_id: string, hashtag: string, skip: number, limit: number) {
    console.log(user_id, hashtag, skip, limit)
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

  async searchTweets(user_id: string, value: string, filter: string, skip: number, limit: number) {
    let matchAggre: Document = {
      $match: {
        $text: {
          $search: value
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
    }
    if (filter == SearchFilterQuery.Video) {
      matchAggre = {
        $match: {
          $text: {
            $search: value
          },
          'media.type': {
            $in: [MediaType.Video]
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
      }
    } else if (filter == SearchFilterQuery.Image) {
      matchAggre = {
        $match: {
          $text: {
            $search: value
          },
          'media.type': {
            $in: [MediaType.Image]
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
      }
    }
    return await databaseService.tweets
      .aggregate<Tweet>([
        matchAggre,
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
}
const tweetService = new TweetService()

export default tweetService

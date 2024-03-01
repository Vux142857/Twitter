/* eslint-disable @typescript-eslint/no-explicit-any */
import databaseService from './database/database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
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

  async getTweetById(id: ObjectId) {
    const [tweet] = await databaseService.tweets
      .aggregate(
        [
          {
            $match: {
              _id: id
            }
          },
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
                      $eq: ['$$item.type', TweetType.Retweet]
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
                      $eq: ['$$item.type', TweetType.Comment]
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
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      )
      .toArray()
    return tweet
  }

  async updateViewsTweet(id: ObjectId, user_id?: string, tweetChildren?: Tweet[]) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    if (tweetChildren) {
      const ids = tweetChildren.map((tweet: any) => tweet._id)
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
      tweetChildren.forEach((tweet: any) => {
        if (user_id) {
          tweet.user_views = tweet.user_views + 1.0
        } else {
          tweet.guest_views = tweet.guest_views + 1.0
        }
      })
      return tweetChildren
    }
    return await databaseService.tweets.findOneAndUpdate(
      { _id: id },
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
            $addFields: {
              bookmarks: {
                $size: '$bookmarks'
              },
              likes: {
                $size: '$likes'
              },
              author: {
                $arrayElemAt: ['$author', 0]
              }
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
      databaseService.tweets.countDocuments({
        parent_id: id,
        type: tweetType
      })
    ])
    const result = {
      tweetChildren: await this.updateViewsTweet(id, user_id, tweetChildren),
      total
    }
    return result
  }

  async getTweetByFollowed(user_id: ObjectId, skip: number, limit: number) {
    const followedUsers = await databaseService.follows
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
      .toArray()
    const tweetsByFollowed: Tweet[] = []
    followedUsers.forEach(async (followedUser: Follow) => {
      const tweet = await this.getLatestTweet(user_id.toString(), followedUser.following_user_id)
      tweetsByFollowed.push(tweet)
    })
    return tweetsByFollowed
  }

  private async getLatestTweet(user_id: string, author_id: ObjectId) {
    const [latestTweet] = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            user_id: author_id,
            $or: [
              {
                audience: 1
              },
              {
                $and: [
                  {
                    audience: 1
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
      ])
      .toArray()
    return latestTweet
  }
}
const tweetService = new TweetService()

export default tweetService

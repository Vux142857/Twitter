import databaseService from './database/database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import Media from '~/models/schemas/Media.schema'
import hashtagService from './hashtag.services'

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
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      )
      .toArray()
    return tweet
  }
}
const tweetService = new TweetService()

export default tweetService

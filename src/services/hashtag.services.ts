import Hashtag from '~/models/schemas/Hashtag.schema'
import databaseService from './database/database.services'

class HashtagService {
  async checkAndCreatHashtag(hashtags: string[]) {
    const hashtagArray = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return hashtagArray
  }
}

const hashtagService = new HashtagService()

export default hashtagService

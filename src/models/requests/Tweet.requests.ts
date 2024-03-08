import { MediaTypeQuery, TweetType } from '~/constants/enum'

export interface TweetQuery extends Pagination, SearchQuery {
  type: TweetType | string
}

interface Pagination {
  skip: number | string
  limit: number | string
}

export interface SearchQuery {
  content: string
  mediaType: MediaTypeQuery
}

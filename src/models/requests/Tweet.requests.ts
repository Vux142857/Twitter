import { TweetType } from '~/constants/enum'

export interface TweetQuery extends Pagination, SearchQuery {
  type: TweetType | string
}

interface Pagination {
  skip: number | string
  limit: number | string
}

interface SearchQuery {
  search: string
}

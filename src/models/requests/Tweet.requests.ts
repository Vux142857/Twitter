import { SearchFilterQuery, TweetType } from '~/constants/enum'

export interface TweetQuery extends Pagination {
  type: TweetType | string
}

interface Pagination {
  skip: number | string
  limit: number | string
}

export interface SearchQuery extends Pagination {
  value: string
  filter: SearchFilterQuery | string
}

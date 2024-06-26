export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  VerifyEmailToken
}

export enum MediaType {
  Image,
  Video,
  Audio
}

export enum StatusType {
  Pending,
  Done,
  Failure,
  Cancelled,
  Abandoned
}

export enum TweetAudience {
  TweetCircle,
  Everyone
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment
}

export enum SearchFilterQuery {
  Video = 'video',
  Image = 'image',
  User = 'user',
  Tweet = ''
}

export enum FollowFilterQuery {
  Followers = 'followers',
  Following = 'following'
}
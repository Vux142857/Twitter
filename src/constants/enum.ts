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
  Tweet
}

export enum TweetType {
  Tweet,
  QuoteTweet,
  Retweet,
  Comment
}

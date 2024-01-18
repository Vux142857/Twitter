export const USER_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  // Username
  USERNAME_LENGTH: 'Username must be between 3 and 20 characters',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  USERNAME_IS_REQUIRED: 'Username is required',
  // Name
  NAME_IS_REQUIRED: 'Name is required',
  INVALID_NAME_FORMAT: 'Name is invalid',
  // Email
  EMAIL_IS_REQUIRED: 'Email is required',
  CONFIRM_EMAIL_IS_REQUIRED: 'Confirm email is required',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  MISSING_EMAIL_OR_PASSWORD: 'Missing email or password',
  // Password
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  INVALID_PASSWORD_FORMAT: 'Invalid password format',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  PASSWORD_TOO_SHORT: 'Password is too short',
  PASSWORD_TOO_WEAK: 'Password is too weak',
  // Else
  INVALID_DATE_OF_BIRTH_FORMAT: 'Date of birth is invalid',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  INVALID_BIO_FORMAT: 'Bio must be a string',
  BIO_TOO_LONG: 'Bio is too long',
  LOCATION_TOO_LONG: 'Location is too long',
  INVALID_AVATAR_FORMAT: 'Avatar must be a string',
  INVALID_USERNAME_FORMAT: 'Username must be a string',
  IMG_URL_LENGTH: 'Image url must be between 3 and 400 characters',
  INVALID_IMG_URL_FORMAT: 'Image url must be a string',
  WEBSITE_URL_LENGTH: 'Image url must be between 3 and 400 characters',
  INVALID_WEBSITE_URL_FORMAT: 'Image url must be a string',
  // Update user's profile
  UPDATE_USER_SUCCESS: 'Update user successfully',
  UPDATE_USER_FAILURE: 'Update user failed',
  USER_FOUND: 'User found',
  // Login
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILURE: 'Login failed',
  GET_USER_SUCCESS: 'Get user success',
  // Register
  REGISTER_SUCCESS: 'Register successful',
  REGISTER_FAILURE: 'Register failed',
  VERIFY_EMAIL_SUCCESS: 'Verified email successfully',
  RESEND_EMAIL_SUCCESS: 'Resend verify email successfully',
  // Logout
  LOGOUT_SUCCESS: 'Logout successful',
  LOGOUT_FAILURE: 'Logout failed',
  //Forgot password
  FORGOT_PASSWORD_TOKEN_DONE: 'Create forgot password token successfully',
  FORGOT_PASSWORD_VALID: 'Forgot password token valid',
  RESET_PASSWORD_SUCCESS: 'Reset password successfully',
  // Authentication token
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_INVALID: 'Access token invalid',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_INVALID: 'Refresh token invalid',
  VERIFY_EMAIL_TOKEN_IS_REQUIRED: 'Verify email token is required',
  VERIFY_EMAIL_TOKEN_INVALID: 'Verify email token invalid',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token invalid',
  USER_NOT_VERIFIED: 'User have not been verified',
  UPDATE_TOKEN_SUCCESS: 'Update token successfully',
  // Follow
  FOLLOW_USER_SUCCESS: 'Follow user successfully',
  FOLLOWING_USER_ID_IS_REQUIRED: 'Following user id is required',
  INVALID_FOLLOWING_USER_ID_FORMAT: 'Following user id must be a string',
  FOLLOW_USER_FAILURE: 'Follow user failed',
  USER_ALREADY_FOLLOWED: 'User already followed',
  USER_ALREADY_UNFOLLOWED: 'User already unfollowed',
  UNFOLLOW_USER_SUCCESS: 'Unfollow user successfully'
}

export const MEDIA_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  // Image
  IMAGE_IS_REQUIRED: 'Image is required',
  IMAGE_IS_INVALID: 'Image is invalid',
  ONLY_IMAGES_ARE_ALLOWED: 'Only images are allowed',
  UPLOAD_IMAGE_SUCCESS: 'Upload image success!',
  UPLOAD_IMAGES_SUCCESS: 'Upload images success!',
  IMAGE_NOT_FOUND: 'Image not found',
  // Video
  VIDEO_IS_REQUIRED: 'Video is required',
  VIDEO_IS_INVALID: 'Video is invalid',
  ONLY_VIDEOS_ARE_ALLOWED: 'Only videos are allowed',
  UPLOAD_VIDEO_SUCCESS: 'Upload video success!',
  RANGE_VIDEO_IS_REQUIRED: 'Range video is required',
  VIDEO_NOT_FOUND: 'Video not found',
  ID_IS_REQUIRED: 'Id is required',
  INVALID_ID_FORMAT: 'Id must be a string',
  HLS_VIDEO_IS_PENDING: 'HLS video is pending',
  HLS_VIDEO_IS_DONE: 'HLS video is done',
  HLS_VIDEO_IS_FAILURE: 'HLS video is failure',
  HLS_VIDEO_IS_CANCELLED: 'HLS video is cancelled',
  VIDEO_IS_ABAONDONED: 'Video is abandoned'
}

export const TWEET_MESSAGES = {
  TWEET_SUCCESS: 'Tweet successfully',
  TWEET_INVALID: 'Tweet invalid',
  TWEET_TYPE_INVALID: 'Tweet type invalid',
  TWEET_PARENT_MUST_BE_NULL: 'Tweet parent must be null',
  TWEET_AUDIENCE_INVALID: 'Tweet audience invalid',
  TWEET_CONTENT_INVALID: 'Tweet content invalid',
  RETWEET_SUCCESS: 'Retweet successfully',
  RETWEET_CONTENT_INVALID: 'Retweet content must be empty',
  RETWEET_WITHOUT_PARENT: 'Retweet without parent',
  RETWEET_FAILED: 'Retweet failed',
  PARENT_TWEET_NOT_FOUND: 'Parent tweet not found',
  HASHTAG_INVALID: 'Hashtag must be string',
  MENTION_INVALID: 'Mention must be string',
  MEDIA_INVALID: 'Media invalid'
}

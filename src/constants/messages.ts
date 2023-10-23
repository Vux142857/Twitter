const USERS_MESSAGES = {
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
  USER_NOT_VERIFIED: 'User have not been verified'
}

export default USERS_MESSAGES

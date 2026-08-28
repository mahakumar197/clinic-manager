export interface StringsMap {
  [key: string]: string;
}

export interface PlaceholdersMap {
  [key: string]: string;
}

export interface ErrorHandlerTextMap {
  [key: string]: string;
}
const strings = {
  photoPermissionReq: 'Photos Permission Required',
  photoAccessDisc: 'Application needs access to your photos',
  cameraPermissionReq: 'Camera Permission Required',
  cameraAccessDisc: 'Application needs access to your camera',
  storagePermissionReq: 'Storage Permission Required',
  storageAccessDisc: 'Application needs access to your storage',
  microphonePermissionReq: 'Microphone Permission Required',
  microphoneAccessDisc: 'Application needs access to your microphone',
  settings: 'Settings',
  notNow: 'Not Now',
  operationFailed: 'Operation Failed',
  submit: 'Submit',
  saveChanges: 'Save Changes',
  cancel: 'Cancel',
  clear: 'Clear',
  continue: 'Continue',
};

const authStrings: StringsMap = {
  // login screen
  subTitle: 'Enter your email and password to log in',
  login: 'Login',
  loginSubTitle: 'Welcome to Rajasthan Patrika Ad Booking Portal',
  emailOrNumber: 'Email Address / Mobile Number',
  mobileNo: 'Mobile Number',
  email: 'Email Address',
  password: 'Password',
  signin: 'Sign In',
  stayLogged: 'Stay Logged In',
  dontHaveAcc: "Don't have an account?",
  registerNow: 'Register Now',

  // register screen
  fullName: 'Full Name',
  alreadyHaveAcc: 'Already have an account?',

  // otp screen
  verifyAcc: 'Verify Account',
  verifyOTP: 'OTP Verification',
  sendVerificationCode:
    'We send you the verification code to your Email address',
  resend: 'Resend code',
  verify: 'Verify',
  // create password
  createPassword: 'Create Password',
  newPassword: 'New Password',
  changePassword: 'Change Password',
  currentPassword: 'Current Password',
  resetPassword: 'Reset Password',
  passSubTitle: 'Create your own Password',
  confirmPassword: 'Confirm Password',
  updatePassword: 'Update Password',
  saveAndContinue: 'Save & Continue',
  title2: 'Create a new password to regain access to your account.',
  passwordSuccess:
    "Your password has been changed successfully. You're all set to continue using your account securely.",
  passwordUpdated: 'Password Updated',
  returnToHome: 'Return To Home',
  changePasswordSuccess: 'You have successfully changed your Password',
  changePasswordSuccessTitle: 'Password Changed',
  // forgot password
  forgotPassword: 'Forgot Your Password?',
  forgotPasswordDisc: 'Please input your mobile number to reset your password.',
  resetFailed: 'Reset Failed',
  errorReset: 'Failed to reset password. Please try again.',
  // kyc
  alternativeNo: 'Alternate Contact Number',
  gstIn: 'GSTIN',
  pan: 'PAN',
  agencyType: 'Agency Type',
  mainBranch: 'Main Branch Location',
  agencyCategory: 'Agency Category',
};

const PLACEHOLDERS: PlaceholdersMap = {
  enterHere: 'Enter Here',
  enterEmail: 'Enter Email Address',
  enterEmailOrPhone: 'Enter Email Address/ Mobile Number',
  enterPassword: 'Enter Password',
  enterName: 'Enter Name',
  enterMobileNo: 'Enter Mobile',
  writeHere: 'Write Here',
};

const ERROR_HANDLER_TEXT: ErrorHandlerTextMap = {
  //file upload
  svgIsRestricted:
    'svg format is not supported! Please select other file format',
  tooLargeFile: 'File size too large',
  invalidImgFormat: 'Invalid image format',
  userCancelledImgPicker: 'User cancelled camera picker',
  cameraNotAvailable: 'Camera not available on device',
  permissionNotGiven: 'Permission not satisfied',
  selectFile: 'Please select file',

  enterEmail: 'Email is required',
  enterValidMail: 'Please enter a valid email',
  enterValidMobileNo: 'Please enter a valid mobile number',
  enterPassword: 'Password is required',
  enterMobileNo: 'Mobile number is required',
  enterValidPassword: 'Password must be at least 6 characters',
  enterName: 'Full Name is required',
  registerAsReq: 'Register as is required',

  selectBranch: 'Please select a branch',
  selectSubject: 'Subject is required',
  selectFeedback: 'Select Feedback Category',

  enterMessage: 'Please enter your message',
  enterValidMessage: 'Message must be at least 10 characters long',

  uploadFiles: 'Please upload file',

  fullName: 'Full Name is required',
  zipcode: 'Zip Code is required',
  state: 'State is required',
  city: 'City is required',
  address: 'Address is required',
  id: 'ID Number is required',
  dob: 'Date of Birth is required',
  enterEmailOrPhone: 'Please enter a valid email or mobile number',
};

const CONDITION_STRINGS: StringsMap = {
  //radio button
  vertical: 'VERTICAL',
  horizontal: 'HORIZONTAL',
};
export {
  authStrings,
  strings,
  CONDITION_STRINGS,
  ERROR_HANDLER_TEXT,
  PLACEHOLDERS,
};

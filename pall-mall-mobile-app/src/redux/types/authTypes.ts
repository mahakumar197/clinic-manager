/* --------------------- Types -------------------------- */
export interface AuthState {
  isLoading: boolean;
  userData: Record<string, any>;
  token: string;
  isLoggedIn: boolean;
  isError: boolean;
  errorMessage: string;
  networkConnection: boolean;

  agencyTypeList?: any[];
  agencyBranchList?: any[];
  agencyCategoryList?: any[];

  stateList?: any[];
  cityList?: any[];
  clientList?: any[];
}

export interface LoginPayload {
  emailOrMobile: string;
  password?: string;
  [key: string]: any;
}

export interface ForgotPasswordPayload {
  emailOrMobile: string;
  [key: string]: any;
}

export interface ClientListPayload {
  page: number;
  limit?: number;
  [key: string]: any;
}

export interface LoginResponse {
  data: {
    access_token: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface RegisterAgencyPayload {
  fullName: string;
  email: string;
  mobileNumber: string;
  userType: string;
  [key: string]: any;
}

export interface VerifyRegisterEmailPayload {
  verificationCode: string;
  email: string;
  [key: string]: any;
}

export interface VerifyResetOTPPayload {
  otp: string;
  emailOrMobile: string;
  [key: string]: any;
}

export interface CreatePasswordPayload {
  password: string;
  confirmPassword: string;
  email: string;
  [key: string]: any;
}

export interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
  resetToken: string;
  [key: string]: any;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Response {
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
  status: number;
  [key: string]: any;
}
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

export type UpdateProfilePayload = {
  userData?: {
    fullName?: string;
    email?: string;
    mobileNumber?: string;
    status?: string;
    isVerified?: boolean;
    password?: string;
    profilePic?: string;
    companyOrganizationName?: string;
  };
  addressData?: {
    residentialAddress?: string;
    residentialCity?: string;
    residentialState?: string;
    residentialPinCode?: string;
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;
    billingPinCode?: string;
    sameAsBusinessAddress?: boolean;
    gstin?: string;
    panNumber?: string;
  };
};
export type UploadFilePayload = {
  document?: File;
  folderName?: string;
};

export interface BookingHistoryState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  networkConnection: boolean;
}

export interface ListPayload {
  page: number;
  limit?: number;
  [key: string]: any;
}

export interface CancelBookingPayload {
  id: number;
  payload: {
    cancellationReason: string;
    refundOption: string;
    cancellationMessage: string;
  };
}

export interface PayloadDynamic {
  [key: string]: any;
}

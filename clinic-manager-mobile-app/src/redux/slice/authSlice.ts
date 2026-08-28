import {ApiResponse, AuthState, LoginPayload} from '@redux/types/authTypes';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import request from '../../apiServices';
import {ApiMethods, EndPoints} from '../../apiServices/endpoints';
export type UploadFilePayload = FormData;

/* --------------------- Async Thunks -------------------------- */
export const loginValidateApi = createAsyncThunk<
  ApiResponse<{
    emailOrMobile: string;
    password: string;
  }>,
  LoginPayload,
  {rejectValue: string}
>('auth/loginValidateApi', async (data, thunkAPI) => {
  try {
    const res = await request<ApiResponse>({
      url: EndPoints.login,
      method: ApiMethods.POST,
      data,
    });
    return res;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || 'Network Error';
    thunkAPI.dispatch(setError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// export const forgotPasswordApi = createAsyncThunk<
//   ApiResponse<{
//     emailOrMobile: string;
//   }>,
//   ForgotPasswordPayload,
//   {rejectValue: string}
// >('auth/forgotPasswordApi', async (data, thunkAPI) => {
//   try {
//     const res = await request<ApiResponse>({
//       url: EndPoints.forgotPassword,
//       method: ApiMethods.POST,
//       data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const registerAgencyApi = createAsyncThunk<
//   ApiResponse<{
//     userType: string;
//     fullName: string;
//     email: string;
//     mobileNumber: string;
//   }>,
//   RegisterAgencyPayload,
//   {rejectValue: string}
// >('auth/registerAgencyApi', async (data, thunkAPI) => {
//   try {
//     const res = await request<ApiResponse>({
//       url: EndPoints.registerAgency,
//       method: ApiMethods.POST,
//       data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const verifyRegisterEmail = createAsyncThunk<
//   Response,
//   VerifyRegisterEmailPayload,
//   {rejectValue: string}
// >('auth/verifyRegisterEmail', async (data, thunkAPI) => {
//   try {
//     const res = await request<Response>({
//       url: EndPoints.verifyEmail,
//       method: ApiMethods.POST,
//       data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const verifyResetOTP = createAsyncThunk<
//   Response,
//   VerifyResetOTPPayload,
//   {rejectValue: string}
// >('auth/verifyResetOTP', async (data, thunkAPI) => {
//   try {
//     const res = await request<Response>({
//       url: EndPoints.verifyResetOtp,
//       method: ApiMethods.POST,
//       data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const createAgencyPassword = createAsyncThunk<
//   Response,
//   CreatePasswordPayload,
//   {rejectValue: string}
// >('auth/createAgencyPassword', async (data, thunkAPI) => {
//   try {
//     const res = await request<Response>({
//       url: EndPoints.createPassword,
//       method: ApiMethods.POST,
//       data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });
// export const resetAgencyPassword = createAsyncThunk<
//   Response,
//   ResetPasswordPayload,
//   {rejectValue: string}
// >('auth/resetAgencyPassword', async (data, thunkAPI) => {
//   try {
//     const res = await request<Response>({
//       url: EndPoints.resetPassword,
//       method: ApiMethods.POST,
//       data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });
// export const changeAgencyPassword = createAsyncThunk<
//   Response,
//   ChangePasswordPayload,
//   {rejectValue: string}
// >('auth/changeAgencyPassword', async (data, thunkAPI) => {
//   try {
//     const res = await request<Response>({
//       url: EndPoints.changePassword,
//       method: ApiMethods.POST,
//       data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const updateAgentProfile = createAsyncThunk<
//   Response,
//   UpdateProfilePayload,
//   {rejectValue: string}
// >('auth/updateAgentProfile', async (data, thunkAPI) => {
//   try {
//     const res = await request<Response>({
//       url: EndPoints.updateProfile,
//       method: ApiMethods.POST,
//       data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const fetchImageUrl = createAsyncThunk<
//   Response,
//   string,
//   {rejectValue: string}
// >('auth/fetchImageUrl', async (data, thunkAPI) => {
//   try {
//     const res = await request<Response>({
//       url: `${EndPoints.fileView}/${data}`,
//       method: ApiMethods.GET,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const uploadFile = createAsyncThunk<
//   Response,
//   FormData,
//   {rejectValue: string}
// >('auth/uploadFile', async (data, thunkAPI) => {
//   try {
//     const res = await request<Response>({
//       url: EndPoints.fileUpload,
//       method: ApiMethods.POST,
//       data,
//       isUpload: true,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const getUserData = createAsyncThunk<
//   Response,
//   void,
//   {rejectValue: string}
// >('auth/getUserData', async (data, thunkAPI) => {
//   try {
//     const res = await request<Response>({
//       url: EndPoints.userData,
//       method: ApiMethods.GET,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const AgencyKYCVerify = createAsyncThunk<
//   {data: any[]; total: number},
//   PayloadDynamic,
//   {rejectValue: string}
// >('auth/AgencyKYCVerify', async (data, thunkAPI) => {
//   try {
//     const res = await request<any>({
//       url: EndPoints.kycVerify,
//       method: ApiMethods.POST,
//       data: data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });
// export const getAgencyType = createAsyncThunk<
//   {data: any[]; total: number},
//   PayloadDynamic,
//   {rejectValue: string}
// >('auth/getAgencyType', async (data, thunkAPI) => {
//   try {
//     const res = await request<any>({
//       url: EndPoints.agencyType,
//       method: ApiMethods.GET,
//       params: data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const getAgencyBranch = createAsyncThunk<
//   {data: any[]; total: number},
//   PayloadDynamic,
//   {rejectValue: string}
// >('auth/getAgencyBranch', async (data, thunkAPI) => {
//   try {
//     const res = await request<any>({
//       url: EndPoints.agencyBranch,
//       method: ApiMethods.GET,
//       params: data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });

// export const getAgencyCategory = createAsyncThunk<
//   {data: any[]; total: number},
//   PayloadDynamic,
//   {rejectValue: string}
// >('auth/getAgencyCategory', async (data, thunkAPI) => {
//   try {
//     const res = await request<any>({
//       url: EndPoints.agencyCategory,
//       method: ApiMethods.GET,
//       params: data,
//     });
//     return res;
//   } catch (error: any) {
//     const errorMessage = error?.response?.data?.message || 'Network Error';
//     thunkAPI.dispatch(setError(errorMessage));
//     return thunkAPI.rejectWithValue(errorMessage);
//   }
// });
/* --------------------- Initial State -------------------------- */
const initialState: AuthState = {
  isLoading: false,
  userData: {},
  token: '',
  isLoggedIn: false,
  isError: false,
  errorMessage: '',
  networkConnection: true,
  agencyTypeList: [],
  agencyBranchList: [],
  agencyCategoryList: [],
};

/* --------------------- Slice -------------------------- */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string>) => {
      state.isError = true;
      state.errorMessage = action.payload;
    },
    clearError: state => {
      state.isError = false;
      state.errorMessage = '';
    },
    checkNetwork: (state, action: PayloadAction<boolean>) => {
      state.networkConnection = action.payload;
    },
    logout: state => {
      state.isLoggedIn = false;
      state.token = '';
      state.userData = {};
      state.isError = false;
      state.errorMessage = '';
    },
    setUserData: (
      state,
      action: PayloadAction<{userData: any; token: string}>,
    ) => {
      state.userData = action.payload.userData;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
  },

  extraReducers: builder => {
    builder
      /* ---------------- Login ---------------- */
      .addCase(loginValidateApi.pending, state => {
        state.isLoading = true;
      })
      .addCase(loginValidateApi.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(loginValidateApi.rejected, state => {
        state.isLoading = false;
      });
    // /* ---------------- Register ---------------- */
    // .addCase(registerAgencyApi.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(registerAgencyApi.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(registerAgencyApi.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- Verify Email ---------------- */
    // .addCase(verifyRegisterEmail.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(verifyRegisterEmail.fulfilled, (state, action) => {
    //   state.isLoading = false;
    //   state.userData = action.payload;
    // })
    // .addCase(verifyRegisterEmail.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- Verify Email ---------------- */
    // .addCase(verifyResetOTP.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(verifyResetOTP.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(verifyResetOTP.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- Create Password ---------------- */
    // .addCase(createAgencyPassword.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(createAgencyPassword.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(createAgencyPassword.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- reset Password ---------------- */
    // .addCase(resetAgencyPassword.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(resetAgencyPassword.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(resetAgencyPassword.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- change Password ---------------- */
    // .addCase(changeAgencyPassword.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(changeAgencyPassword.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(changeAgencyPassword.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- update Profile ---------------- */
    // .addCase(updateAgentProfile.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(updateAgentProfile.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(updateAgentProfile.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- upload file ---------------- */
    // .addCase(uploadFile.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(uploadFile.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(uploadFile.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- getUserData ---------------- */
    // .addCase(getUserData.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(getUserData.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(getUserData.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- getUserData ---------------- */
    // .addCase(fetchImageUrl.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(fetchImageUrl.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(fetchImageUrl.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- getAgencyType ---------------- */
    // .addCase(getAgencyType.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(getAgencyType.fulfilled, (state, action) => {
    //   state.isLoading = false;
    //   state.agencyTypeList = action?.payload?.data ?? [];
    // })
    // .addCase(getAgencyType.rejected, state => {
    //   state.isLoading = false;
    // })
    //  /* ---------------- AgencyKYCVerify ---------------- */
    // .addCase(AgencyKYCVerify.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(AgencyKYCVerify.fulfilled, (state, action) => {
    //   state.isLoading = false;
    // })
    // .addCase(AgencyKYCVerify.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- getAgencyBranch ---------------- */
    // .addCase(getAgencyBranch.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(getAgencyBranch.fulfilled, (state, action) => {
    //   state.isLoading = false;
    //   state.agencyBranchList = action?.payload?.data ?? [];
    // })
    // .addCase(getAgencyBranch.rejected, state => {
    //   state.isLoading = false;
    // })
    // /* ---------------- getAgencyCategory ---------------- */
    // .addCase(getAgencyCategory.pending, state => {
    //   state.isLoading = true;
    // })
    // .addCase(getAgencyCategory.fulfilled, (state, action) => {
    //   state.isLoading = false;
    //   state.agencyCategoryList = action?.payload?.data ?? [];
    // })
    // .addCase(getAgencyCategory.rejected, state => {
    //   state.isLoading = false;
    // });
  },
});

/* --------------------- Exports -------------------------- */
export const {clearError, setError, checkNetwork, logout, setUserData} =
  authSlice.actions;
export default authSlice.reducer;

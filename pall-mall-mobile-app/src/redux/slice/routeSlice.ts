import {combineReducers} from '@reduxjs/toolkit';
import adBookingSlice from './adBookingSlice';
import authSlice from './authSlice';
import chatbotSlice from './chatbotSlice';
import clientSlice from './clientSlice';
import reportsSlice from './reportsSlice';
import supportSlice from './supportSlice';
import commonSlice from './commonSlice';

const appReducer = combineReducers({
  auth: authSlice,
  support: supportSlice,
  client: clientSlice,
  adBooking: adBookingSlice,
  chat: chatbotSlice,
  reports: reportsSlice,
  common: commonSlice,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof appReducer>;
export default rootReducer;

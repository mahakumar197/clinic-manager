import { combineReducers } from '@reduxjs/toolkit';
import { counterReducer } from '@features/counter';
import { approvalsReducer } from '@/features/approvals';
import { messagesReducer } from '@/features/messages';
import { patientReducer } from '@/features/Patient';
import { notificationsReducer } from '@/features/notification';
import authReducer from '../features/auth/authSlice';

/**
 * Root reducer combining all feature reducers
 * Add your feature slices here as you create them
 */
const rootReducer = combineReducers({
  counter: counterReducer,
  approvals: approvalsReducer,
  messages: messagesReducer,
  notifications: notificationsReducer,
  patient: patientReducer,
  auth: authReducer,

  // Add more reducers here as you create features
  // Example: auth: authReducer,
  // Example: user: userReducer,
});

export default rootReducer;

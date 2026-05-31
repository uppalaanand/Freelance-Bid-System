import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import bidReducer from './slices/bidSlice';
import profileReducer from './slices/profileSlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';
import paymentReducer from './slices/paymentSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    bids: bidReducer,
    profile: profileReducer,
    chat: chatReducer,
    notifications: notificationReducer,
    payments: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

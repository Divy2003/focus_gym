// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import membersSlice from './slices/membersSlice.js';
import dietPlansSlice from './slices/dietPlansSlice';
import analyticsSlice from './slices/analyticsSlice';
import { gymApi } from './api/gymApi';
import { authApi } from './api/authApi';

// Create the store with the reducer and middleware
const store = configureStore({
  reducer: {
    auth: authSlice,
    members: membersSlice,
    dietPlans: dietPlansSlice,
    analytics: analyticsSlice,
    // Add the generated reducers as specific top-level slices
    [gymApi.reducerPath]: gymApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [gymApi.util.resetApiState.type],
      },
    })
    .concat(gymApi.middleware)
    .concat(authApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});


export default store;
